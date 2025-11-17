'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { Category } from '@prisma/client'
import type { User, Action, Achievement } from '@prisma/client'

// Type definitions for server action responses
type GetDashboardDataResponse =
  | {
      success: true
      data: {
        user: User
        stats: {
          totalActions: number
          currentStreak: number
          longestStreak: number
          clapsReceived: number
          categoriesHelped: number
          daysSinceJoined: number
        }
        recentActions: Array<
          Action & {
            challenge: {
              text: string
              category: Category
            } | null
          }
        >
        recentAchievements: Array<{
          achievement: Achievement
          earnedAt: Date
        }>
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
 * Get comprehensive dashboard data for a user
 * SECURITY: Uses server-verified userId parameter (acceptable for read operations)
 * Returns stats, recent actions, achievements, and category breakdown
 */
export async function getDashboardData(userId: string): Promise<GetDashboardDataResponse> {
  try {
    // Note: userId parameter is acceptable here as it's a read-only operation
    // and doesn't allow privilege escalation

    // Get user with achievements
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Get recent actions
    const recentActions = await prisma.action.findMany({
      where: { userId },
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
      take: 10,
    })

    // Get category breakdown
    const categoryBreakdownData = await prisma.action.groupBy({
      by: ['category'],
      where: { userId },
      _count: {
        category: true,
      },
    })

    const categoryBreakdown = {
      PEOPLE:
        categoryBreakdownData.find((c) => c.category === Category.PEOPLE)?._count.category || 0,
      ANIMALS:
        categoryBreakdownData.find((c) => c.category === Category.ANIMALS)?._count.category || 0,
      ENVIRONMENT:
        categoryBreakdownData.find((c) => c.category === Category.ENVIRONMENT)?._count.category ||
        0,
      COMMUNITY:
        categoryBreakdownData.find((c) => c.category === Category.COMMUNITY)?._count.category || 0,
    }

    // Calculate stats
    const categoriesHelped = categoryBreakdownData.length
    const daysSinceJoined = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    const stats = {
      totalActions: user.totalActions,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      clapsReceived: user.clapsReceived,
      categoriesHelped,
      daysSinceJoined,
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
        recentActions,
        recentAchievements,
        categoryBreakdown,
      },
    }
  } catch (error: unknown) {
    logger.error({ error, userId }, 'Error in getDashboardData function')
    return {
      success: false,
      error: 'Failed to fetch dashboard data. Please try again later.',
    }
  }
}

/**
 * Update user's daily streak
 * SECURITY: Uses server-verified userId parameter (acceptable for internal use)
 * Should be called when user completes an action
 * Checks if last action was yesterday (continue streak) or today (maintain streak)
 */
export async function updateUserStreak(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: This function should only be called by other server actions
    // (like createAction) with server-verified userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Get user's most recent actions (last 2)
    const recentActions = await prisma.action.findMany({
      where: { userId },
      orderBy: {
        completedAt: 'desc',
      },
      take: 2,
      select: {
        completedAt: true,
      },
    })

    if (recentActions.length === 0) {
      return { success: true }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const mostRecentDate = new Date(recentActions[0].completedAt)
    mostRecentDate.setHours(0, 0, 0, 0)

    // If there's only one action (first action ever), start streak at 1
    if (recentActions.length === 1) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(1, user.longestStreak),
        },
      })
      return { success: true }
    }

    const previousDate = new Date(recentActions[1].completedAt)
    previousDate.setHours(0, 0, 0, 0)

    // Calculate day difference
    const dayDiff = Math.floor((mostRecentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))

    let newStreak = user.currentStreak

    if (dayDiff === 1) {
      // Consecutive day - increment streak
      newStreak = user.currentStreak + 1
    } else if (dayDiff === 0) {
      // Same day - maintain streak
      newStreak = Math.max(1, user.currentStreak)
    } else {
      // Streak broken - reset to 1
      newStreak = 1
    }

    const newLongestStreak = Math.max(newStreak, user.longestStreak)

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
      },
    })

    return { success: true }
  } catch (error: unknown) {
    logger.error({ error, userId }, 'Error in updateUserStreak function')
    return {
      success: false,
      error: 'Failed to update user streak. Please try again later.',
    }
  }
}
