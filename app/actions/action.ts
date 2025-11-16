'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { Category } from '@prisma/client'
import type { Action } from '@prisma/client'

// Type definitions for input
export type CreateActionInput = {
  userId: string
  challengeId?: string
  customText?: string
  location?: string
  category: Category
  completedAt: Date
  ipAddress: string
  userAgent: string
}

// Type definitions for server action responses
type CreateActionResponse =
  | { success: true; data: Action }
  | { success: false; error: string }

type GetActionsResponse =
  | {
      success: true
      data: Array<
        Action & {
          user: {
            username: string
            avatarSeed: string
          }
          challenge: {
            text: string
            category: Category
          } | null
        }
      >
    }
  | { success: false; error: string }

type GetActionResponse =
  | {
      success: true
      data: Action & {
        user: {
          username: string
          avatarSeed: string
        }
        challenge: {
          text: string
          category: Category
        } | null
        _count: {
          claps: number
        }
      }
    }
  | { success: false; error: string }

/**
 * Create a new completed action
 * Uses transaction to ensure atomicity:
 * - Create action record
 * - Increment user.totalActions
 * - If challengeId provided: increment challenge.timesUsed
 */
export async function createAction(
  data: CreateActionInput
): Promise<CreateActionResponse> {
  try {
    const { userId, challengeId, customText, location, category, completedAt, ipAddress, userAgent } = data

    // Use transaction for atomicity
    const action = await prisma.$transaction(async (tx) => {
      // Create action record
      const newAction = await tx.action.create({
        data: {
          userId,
          challengeId,
          customText,
          location,
          category,
          completedAt,
          ipAddress,
          userAgent,
        },
      })

      // Increment user.totalActions
      await tx.user.update({
        where: { id: userId },
        data: {
          totalActions: {
            increment: 1,
          },
        },
      })

      // If challengeId provided: increment challenge.timesUsed
      if (challengeId) {
        await tx.challenge.update({
          where: { id: challengeId },
          data: {
            timesUsed: {
              increment: 1,
            },
          },
        })
      }

      return newAction
    })

    return { success: true, data: action }
  } catch (error: unknown) {
    logger.error({ error, data }, 'Error in createAction function')
    return {
      success: false,
      error: 'Failed to create action. Please try again later.',
    }
  }
}

/**
 * Get recent actions for the feed
 * Ordered by completedAt DESC
 * Includes user (username, avatarSeed) and challenge (text, category)
 * Supports pagination with limit/offset
 */
export async function getRecentActions(
  limit: number = 20,
  offset: number = 0
): Promise<GetActionsResponse> {
  try {
    const actions = await prisma.action.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        completedAt: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
            avatarSeed: true,
          },
        },
        challenge: {
          select: {
            text: true,
            category: true,
          },
        },
      },
    })

    return { success: true, data: actions }
  } catch (error: unknown) {
    logger.error({ error, limit, offset }, 'Error in getRecentActions function')
    return {
      success: false,
      error: 'Failed to fetch recent actions. Please try again later.',
    }
  }
}

/**
 * Get actions by user (user's action history)
 * Ordered by completedAt DESC
 * Includes challenge data
 */
export async function getActionsByUser(
  userId: string,
  limit: number = 20
): Promise<GetActionsResponse> {
  try {
    const actions = await prisma.action.findMany({
      where: {
        userId,
      },
      take: limit,
      orderBy: {
        completedAt: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
            avatarSeed: true,
          },
        },
        challenge: {
          select: {
            text: true,
            category: true,
          },
        },
      },
    })

    return { success: true, data: actions }
  } catch (error: unknown) {
    logger.error({ error, userId, limit }, 'Error in getActionsByUser function')
    return {
      success: false,
      error: 'Failed to fetch user actions. Please try again later.',
    }
  }
}

/**
 * Get a single action by ID with full details
 * Includes user, challenge, and claps count
 */
export async function getActionById(
  actionId: string
): Promise<GetActionResponse> {
  try {
    const action = await prisma.action.findUnique({
      where: {
        id: actionId,
      },
      include: {
        user: {
          select: {
            username: true,
            avatarSeed: true,
          },
        },
        challenge: {
          select: {
            text: true,
            category: true,
          },
        },
        _count: {
          select: {
            claps: true,
          },
        },
      },
    })

    if (!action) {
      return {
        success: false,
        error: 'Action not found',
      }
    }

    return { success: true, data: action }
  } catch (error: unknown) {
    logger.error({ error, actionId }, 'Error in getActionById function')
    return {
      success: false,
      error: 'Failed to fetch action. Please try again later.',
    }
  }
}
