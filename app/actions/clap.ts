'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { getCurrentUserId } from '@/lib/admin'
import { checkRateLimitPreset } from '@/lib/rate-limit'
import type { Clap } from '@prisma/client'

// Type definitions for server action responses
type AddClapResponse =
  | { success: true; data: Clap }
  | { success: false; error: string }

type RemoveClapResponse =
  | { success: true }
  | { success: false; error: string }

type HasUserClappedResponse =
  | { success: true; data: { hasClapped: boolean } }
  | { success: false; error: string }

/**
 * Add a clap to an action
 * SECURITY: Verifies user from server-side cookies and applies rate limiting
 * Uses transaction to ensure atomicity:
 * - Create clap record (handle duplicate with unique constraint catch)
 * - Increment action.clapsCount
 * - Increment action owner's user.clapsReceived
 */
export async function addClap(
  actionId: string,
  userIdParam?: string // Parameter kept for backward compatibility but NOT USED
): Promise<AddClapResponse> {
  // SECURITY: Get userId from server-side cookies (never trust client parameter)
  const userId = await getCurrentUserId()

  try {
    if (!userId) {
      logger.warn({ actionId }, 'Unauthenticated clap attempt')
      return {
        success: false,
        error: 'Authentication required. Please log in to clap.',
      }
    }

    // SECURITY: Rate limiting - max 100 claps per hour
    const rateLimit = await checkRateLimitPreset(userId, 'CLAP')
    if (!rateLimit.allowed) {
      logger.warn(
        { userId, actionId, retryAfter: rateLimit.retryAfter },
        'Rate limit exceeded for claps'
      )
      return {
        success: false,
        error: `Too many claps. Try again in ${rateLimit.retryAfter} seconds.`,
      }
    }

    // Use transaction for atomicity
    const clap = await prisma.$transaction(async (tx) => {
      // Create clap record with server-verified userId
      const newClap = await tx.clap.create({
        data: {
          actionId,
          userId, // Server-verified userId from cookies
        },
      })

      // Get action to find the owner userId
      const action = await tx.action.findUnique({
        where: { id: actionId },
        select: { userId: true },
      })

      if (!action) {
        throw new Error('Action not found')
      }

      // Increment action.clapsCount
      await tx.action.update({
        where: { id: actionId },
        data: {
          clapsCount: {
            increment: 1,
          },
        },
      })

      // Increment action owner's user.clapsReceived
      await tx.user.update({
        where: { id: action.userId },
        data: {
          clapsReceived: {
            increment: 1,
          },
        },
      })

      return newClap
    })

    return { success: true, data: clap }
  } catch (error: unknown) {
    // Handle P2002 (duplicate) error
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return {
        success: false,
        error: 'Already clapped',
      }
    }

    logger.error({ error, actionId, userId }, 'Error in addClap function')
    return {
      success: false,
      error: 'Failed to add clap. Please try again later.',
    }
  }
}

/**
 * Remove a clap from an action
 * SECURITY: Verifies user from server-side cookies
 * Uses transaction to ensure atomicity:
 * - Delete clap record
 * - Decrement action.clapsCount
 * - Decrement action owner's user.clapsReceived
 */
export async function removeClap(
  actionId: string,
  userIdParam?: string // Parameter kept for backward compatibility but NOT USED
): Promise<RemoveClapResponse> {
  // SECURITY: Get userId from server-side cookies (never trust client parameter)
  const userId = await getCurrentUserId()

  try {
    if (!userId) {
      logger.warn({ actionId }, 'Unauthenticated unclap attempt')
      return {
        success: false,
        error: 'Authentication required.',
      }
    }

    await prisma.$transaction(async (tx) => {
      // Find the clap first to ensure it exists
      const clap = await tx.clap.findUnique({
        where: {
          actionId_userId: {
            actionId,
            userId, // Server-verified userId from cookies
          },
        },
      })

      if (!clap) {
        throw new Error('Clap not found')
      }

      // Get action to find the owner userId
      const action = await tx.action.findUnique({
        where: { id: actionId },
        select: { userId: true },
      })

      if (!action) {
        throw new Error('Action not found')
      }

      // Delete clap record
      await tx.clap.delete({
        where: {
          actionId_userId: {
            actionId,
            userId,
          },
        },
      })

      // Decrement action.clapsCount
      await tx.action.update({
        where: { id: actionId },
        data: {
          clapsCount: {
            decrement: 1,
          },
        },
      })

      // Decrement action owner's user.clapsReceived
      await tx.user.update({
        where: { id: action.userId },
        data: {
          clapsReceived: {
            decrement: 1,
          },
        },
      })
    })

    return { success: true }
  } catch (error: unknown) {
    // Handle clap not found error
    if (error instanceof Error && error.message === 'Clap not found') {
      return {
        success: false,
        error: 'Clap not found',
      }
    }

    logger.error({ error, actionId, userId }, 'Error in removeClap function')
    return {
      success: false,
      error: 'Failed to remove clap. Please try again later.',
    }
  }
}

/**
 * Check if a user has clapped an action
 * SECURITY: Can accept userId parameter for checking other users' claps (read-only operation)
 * Returns boolean indicating if the clap exists
 */
export async function hasUserClapped(
  actionId: string,
  userId: string // Acceptable here since it's read-only and doesn't modify data
): Promise<HasUserClappedResponse> {
  try {
    // Find clap by actionId + userId
    const clap = await prisma.clap.findUnique({
      where: {
        actionId_userId: {
          actionId,
          userId,
        },
      },
    })

    return {
      success: true,
      data: {
        hasClapped: clap !== null,
      },
    }
  } catch (error: unknown) {
    logger.error({ error, actionId, userId }, 'Error in hasUserClapped function')
    return {
      success: false,
      error: 'Failed to check clap status. Please try again later.',
    }
  }
}
