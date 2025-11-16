'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
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
 * Uses transaction to ensure atomicity:
 * - Create clap record (handle duplicate with unique constraint catch)
 * - Increment action.clapsCount
 * - Increment action owner's user.clapsReceived
 */
export async function addClap(
  actionId: string,
  userId: string
): Promise<AddClapResponse> {
  try {
    // Use transaction for atomicity
    const clap = await prisma.$transaction(async (tx) => {
      // Create clap record
      const newClap = await tx.clap.create({
        data: {
          actionId,
          userId,
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
 * Uses transaction to ensure atomicity:
 * - Delete clap record
 * - Decrement action.clapsCount
 * - Decrement action owner's user.clapsReceived
 */
export async function removeClap(
  actionId: string,
  userId: string
): Promise<RemoveClapResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      // Find the clap first to ensure it exists
      const clap = await tx.clap.findUnique({
        where: {
          actionId_userId: {
            actionId,
            userId,
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
 * Returns boolean indicating if the clap exists
 */
export async function hasUserClapped(
  actionId: string,
  userId: string
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
