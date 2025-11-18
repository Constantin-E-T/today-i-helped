import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { cookies } from 'next/headers'
import type { User } from '@prisma/client'

const USER_ID_COOKIE = 'tih_user_id'

/**
 * Get current user ID from cookies (server-side)
 * Used in Server Actions to identify the authenticated user
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get(USER_ID_COOKIE)?.value
    return userId || null
  } catch (error: unknown) {
    logger.error({ error }, 'Error getting user ID from cookies')
    return null
  }
}

/**
 * Get current authenticated user (server-side)
 * Returns user object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    return user
  } catch (error: unknown) {
    logger.error({ error }, 'Error getting current user')
    return null
  }
}

/**
 * Check if a given user ID belongs to an admin
 * Admin status is determined by the isAdmin flag in the database
 * @param userId - The user ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isAdmin: true },
    })

    if (!user) {
      logger.warn({ userId }, 'User not found when checking admin status')
      return false
    }

    const isAdmin = user.isAdmin

    if (isAdmin) {
      logger.info({ userId }, 'Admin access verified')
    }

    return isAdmin
  } catch (error: unknown) {
    logger.error({ error, userId }, 'Error checking admin status')
    return false
  }
}

/**
 * Require admin authentication
 * Throws an error with a user-friendly message if user is not admin
 * Use this at the start of admin-only Server Actions
 * @returns The admin user object
 * @throws Error if user is not authenticated or not admin
 */
export async function requireAdmin(): Promise<User> {
  const userId = await getCurrentUserId()

  if (!userId) {
    logger.warn('Admin action attempted without authentication')
    throw new Error('Authentication required. Please log in.')
  }

  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    logger.warn({ userId }, 'Non-admin user attempted admin action')
    throw new Error('Unauthorized. Admin access required.')
  }

  const adminUser = await getCurrentUser()

  if (!adminUser) {
    logger.error({ userId }, 'Admin user not found after verification')
    throw new Error('User not found.')
  }

  return adminUser
}
