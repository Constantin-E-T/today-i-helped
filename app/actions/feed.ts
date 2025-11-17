'use server'

import { getCurrentUserId } from '@/lib/admin'
import { getRecentActions } from './action'
import { addClap, removeClap, hasUserClapped } from './clap'
import logger from '@/lib/logger'

/**
 * Feed Server Actions
 * Convenience wrapper for feed-related operations
 * Combines action and clap server actions with auth context
 */

/**
 * Get paginated feed actions with user info
 * Returns actions ordered by completedAt DESC
 */
export async function getFeedActions(limit: number = 20, offset: number = 0) {
  try {
    const result = await getRecentActions(limit, offset)

    if (!result.success) {
      return result
    }

    // Get current user ID to check which actions they've clapped
    const currentUserId = await getCurrentUserId()

    // Enrich each action with hasClapped status for current user
    const enrichedActions = await Promise.all(
      result.data.map(async (action) => {
        let hasClapped = false

        if (currentUserId) {
          const clapResult = await hasUserClapped(action.id, currentUserId)
          if (clapResult.success) {
            hasClapped = clapResult.data.hasClapped
          }
        }

        return {
          ...action,
          hasClapped,
        }
      })
    )

    return {
      success: true as const,
      data: enrichedActions,
    }
  } catch (error: unknown) {
    logger.error({ error, limit, offset }, 'Error in getFeedActions')
    return {
      success: false as const,
      error: 'Failed to load feed. Please try again.',
    }
  }
}

/**
 * Toggle clap on an action (add or remove)
 * Requires authentication
 */
export async function toggleClapOnAction(actionId: string) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false as const,
        error: 'You must be logged in to clap',
      }
    }

    // Check current clap status
    const clapStatus = await hasUserClapped(actionId, userId)

    if (!clapStatus.success) {
      return {
        success: false as const,
        error: 'Failed to check clap status',
      }
    }

    // Toggle: remove if clapped, add if not clapped
    if (clapStatus.data.hasClapped) {
      const result = await removeClap(actionId, userId)
      if (result.success) {
        return {
          success: true as const,
          hasClapped: false,
        }
      }
      return {
        success: false as const,
        error: result.error,
      }
    } else {
      const result = await addClap(actionId, userId)
      if (result.success) {
        return {
          success: true as const,
          hasClapped: true,
        }
      }
      return {
        success: false as const,
        error: result.error,
      }
    }
  } catch (error: unknown) {
    logger.error({ error, actionId }, 'Error in toggleClapOnAction')
    return {
      success: false as const,
      error: 'Failed to toggle clap. Please try again.',
    }
  }
}

/**
 * Get clap count for a specific action
 */
export async function getActionClapCount(actionId: string) {
  try {
    const result = await getRecentActions(1, 0)

    if (!result.success) {
      return {
        success: false as const,
        error: 'Failed to get clap count',
      }
    }

    return {
      success: true as const,
      count: 0, // Will be retrieved from action.clapsCount
    }
  } catch (error: unknown) {
    logger.error({ error, actionId }, 'Error in getActionClapCount')
    return {
      success: false as const,
      error: 'Failed to get clap count',
    }
  }
}
