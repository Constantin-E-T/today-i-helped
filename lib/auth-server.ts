/**
 * Server-side authentication utilities
 * Provides secure cookie management for Server Actions with proper security flags
 */

import { cookies } from 'next/headers'
import logger from '@/lib/logger'

const USER_ID_COOKIE = 'tih_user_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

/**
 * Set user ID cookie with proper security flags (server-side)
 * Sets httpOnly, secure (in production), sameSite flags
 *
 * @param userId - User ID to store in cookie
 */
export async function setUserIdCookieServer(userId: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'

    cookieStore.set(USER_ID_COOKIE, userId, {
      httpOnly: true, // Prevents XSS access to cookie
      secure: isProduction, // Requires HTTPS in production
      sameSite: 'strict', // Prevents CSRF attacks
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    logger.info({ userId }, 'User ID cookie set (server-side)')
  } catch (error: unknown) {
    logger.error({ error, userId }, 'Error setting user ID cookie')
    throw error
  }
}

/**
 * Clear user ID cookie (server-side)
 */
export async function clearUserIdCookieServer(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(USER_ID_COOKIE)
    logger.info('User ID cookie cleared (server-side)')
  } catch (error: unknown) {
    logger.error({ error }, 'Error clearing user ID cookie')
    throw error
  }
}

/**
 * Get user ID from cookies (server-side)
 * This is the secure way to get userId in Server Actions
 *
 * @returns User ID or null if not authenticated
 */
export async function getUserIdFromCookieServer(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get(USER_ID_COOKIE)?.value
    return userId || null
  } catch (error: unknown) {
    logger.error({ error }, 'Error getting user ID from cookies')
    return null
  }
}
