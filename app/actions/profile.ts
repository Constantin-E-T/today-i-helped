'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { Category } from '@prisma/client'
import type { User, Action, Achievement } from '@prisma/client'

// Type definitions for server action responses
type GetUserProfileResponse =
  | {
      success: true
      data: {
        user: User
        stats: {
          totalActions: number
          currentStreak: number
          longestStreak: number
          clapsReceived: number
          daysSinceJoined: number
          categoriesHelped: number
        }
        recentAchievements: Array<{
          achievement: Achievement
          earnedAt: Date
        }>
      }
    }
  | { success: false; error: string }

type GetUserActionsResponse =
  | {
      success: true
      data: Array<
        Action & {
          challenge: {
            text: string
            category: Category
          } | null
        }
      >
    }
  | { success: false; error: string }

type GetImpactSummaryResponse =
  | {
      success: true
      data: {
        topCategory: Category | null
        categoryBreakdown: {
          PEOPLE: number
          ANIMALS: number
          ENVIRONMENT: number
          COMMUNITY: number
        }
      }
    }
  | { success: false; error: string }

/**
 * Get user profile by username
 * Returns user data, stats, and recent achievements
 */
export async function getUserProfile(username: string): Promise<GetUserProfileResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        userAchievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            earnedAt: 'desc',
          },
          take: 5, // Get 5 most recent achievements
        },
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Calculate days since joined
    const daysSinceJoined = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Get categories the user has helped with
    const categories = await prisma.action.groupBy({
      by: ['category'],
      where: { userId: user.id },
    })

    const stats = {
      totalActions: user.totalActions,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      clapsReceived: user.clapsReceived,
      daysSinceJoined,
      categoriesHelped: categories.length,
    }

    const recentAchievements = user.userAchievements.map((ua) => ({
      achievement: ua.achievement,
      earnedAt: ua.earnedAt,
    }))

    return {
      success: true,
      data: {
        user,
        stats,
        recentAchievements,
      },
    }
  } catch (error: unknown) {
    logger.error({ error, username }, 'Error in getUserProfile function')
    return {
      success: false,
      error: 'Failed to fetch user profile. Please try again later.',
    }
  }
}

/**
 * Get user's public action timeline
 * Returns paginated list of user's completed actions
 */
export async function getUserActions(
  username: string,
  limit: number = 20,
  offset: number = 0
): Promise<GetUserActionsResponse> {
  try {
    // First get the user
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Get user's actions
    const actions = await prisma.action.findMany({
      where: { userId: user.id },
      include: {
        challenge: {
          select: {
            text: true,
            category: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return { success: true, data: actions }
  } catch (error: unknown) {
    logger.error({ error, username, limit, offset }, 'Error in getUserActions function')
    return {
      success: false,
      error: 'Failed to fetch user actions. Please try again later.',
    }
  }
}

/**
 * Get user's impact summary
 * Returns breakdown of categories helped and top category
 */
export async function getImpactSummary(username: string): Promise<GetImpactSummaryResponse> {
  try {
    // First get the user
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Get category breakdown
    const categoryBreakdown = await prisma.action.groupBy({
      by: ['category'],
      where: { userId: user.id },
      _count: {
        category: true,
      },
    })

    const breakdown = {
      PEOPLE: categoryBreakdown.find((c) => c.category === Category.PEOPLE)?._count.category || 0,
      ANIMALS: categoryBreakdown.find((c) => c.category === Category.ANIMALS)?._count.category || 0,
      ENVIRONMENT:
        categoryBreakdown.find((c) => c.category === Category.ENVIRONMENT)?._count.category || 0,
      COMMUNITY:
        categoryBreakdown.find((c) => c.category === Category.COMMUNITY)?._count.category || 0,
    }

    // Find top category
    let topCategory: Category | null = null
    let maxCount = 0

    for (const [category, count] of Object.entries(breakdown)) {
      if (count > maxCount) {
        maxCount = count
        topCategory = category as Category
      }
    }

    return {
      success: true,
      data: {
        topCategory,
        categoryBreakdown: breakdown,
      },
    }
  } catch (error: unknown) {
    logger.error({ error, username }, 'Error in getImpactSummary function')
    return {
      success: false,
      error: 'Failed to fetch impact summary. Please try again later.',
    }
  }
}
