'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { getCurrentUserId } from '@/lib/admin'
import { Category } from '@prisma/client'
import type { ActivityChartData, CategoryChartData } from '@/types/dashboard'

/**
 * Get activity chart data for a user
 * SECURITY: Uses userId parameter (acceptable for read operations)
 * Returns daily action counts for the specified period
 */
export async function getActivityChartData(
  userId: string,
  days: number = 30
) {
  try {
    // Note: userId parameter is acceptable here as it's a read-only operation

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Get all actions in the period
    const actions = await prisma.action.findMany({
      where: {
        userId,
        completedAt: {
          gte: startDate,
        },
      },
      select: {
        completedAt: true,
        category: true,
      },
      orderBy: {
        completedAt: 'asc',
      },
    })

    // Group by date
    const dataMap = new Map<string, number>()

    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().split('T')[0]
      dataMap.set(dateStr, 0)
    }

    // Count actions per date
    actions.forEach((action) => {
      const dateStr = action.completedAt.toISOString().split('T')[0]
      dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + 1)
    })

    // Convert to array
    const chartData: ActivityChartData[] = Array.from(dataMap.entries()).map(
      ([date, count]) => ({
        date,
        actions: count,
      })
    )

    return { success: true, data: chartData }
  } catch (error: unknown) {
    logger.error({ error, userId, days }, 'Error in getActivityChartData')
    return {
      success: false,
      error: 'Failed to fetch activity chart data',
      data: [] as ActivityChartData[],
    }
  }
}

/**
 * Get category breakdown chart data for a user
 * SECURITY: Uses userId parameter (acceptable for read operations)
 */
export async function getCategoryChartData(userId: string) {
  try {
    // Note: userId parameter is acceptable here as it's a read-only operation

    const categoryBreakdown = await prisma.action.groupBy({
      by: ['category'],
      where: { userId },
      _count: {
        category: true,
      },
    })

    const totalActions = categoryBreakdown.reduce(
      (sum, item) => sum + item._count.category,
      0
    )

    const chartData: CategoryChartData[] = categoryBreakdown.map((item) => ({
      category: item.category,
      count: item._count.category,
      percentage: totalActions > 0 ? (item._count.category / totalActions) * 100 : 0,
    }))

    // Ensure all categories are present (with 0 if no actions)
    const allCategories = Object.values(Category)
    const completeData: CategoryChartData[] = allCategories.map((category) => {
      const existing = chartData.find((item) => item.category === category)
      return (
        existing || {
          category,
          count: 0,
          percentage: 0,
        }
      )
    })

    return { success: true, data: completeData }
  } catch (error: unknown) {
    logger.error({ error, userId }, 'Error in getCategoryChartData')
    return {
      success: false,
      error: 'Failed to fetch category chart data',
      data: [] as CategoryChartData[],
    }
  }
}

/**
 * Get global activity chart data (all users)
 */
export async function getGlobalActivityChartData(days: number = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const actions = await prisma.action.findMany({
      where: {
        completedAt: {
          gte: startDate,
        },
      },
      select: {
        completedAt: true,
      },
      orderBy: {
        completedAt: 'asc',
      },
    })

    // Group by date
    const dataMap = new Map<string, number>()

    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().split('T')[0]
      dataMap.set(dateStr, 0)
    }

    // Count actions per date
    actions.forEach((action) => {
      const dateStr = action.completedAt.toISOString().split('T')[0]
      dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + 1)
    })

    const chartData: ActivityChartData[] = Array.from(dataMap.entries()).map(
      ([date, count]) => ({
        date,
        actions: count,
      })
    )

    return { success: true, data: chartData }
  } catch (error: unknown) {
    logger.error({ error, days }, 'Error in getGlobalActivityChartData')
    return {
      success: false,
      error: 'Failed to fetch global activity chart data',
      data: [] as ActivityChartData[],
    }
  }
}

/**
 * Get trending actions (most clapped) for a time period
 */
export async function getTrendingActions(limit: number = 10, days: number = 7) {
  try {
    const currentUserId = await getCurrentUserId()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trendingActions = await prisma.action.findMany({
      where: {
        completedAt: {
          gte: startDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
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
        claps: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                id: true,
              },
            }
          : false,
        _count: {
          select: {
            claps: true,
          },
        },
      },
      orderBy: {
        claps: {
          _count: 'desc',
        },
      },
      take: limit,
    })

    // Transform the data to match ActionCardData interface
    const formattedActions = trendingActions.map((action) => ({
      id: action.id,
      userId: action.userId,
      customText: action.customText,
      category: action.category,
      clapsCount: action._count.claps,
      completedAt: action.completedAt,
      hasClapped: Array.isArray(action.claps) && action.claps.length > 0,
      user: {
        username: action.user.username,
        avatarSeed: action.user.avatarSeed,
      },
      challenge: action.challenge,
    }))

    return { success: true, data: formattedActions }
  } catch (error: unknown) {
    logger.error({ error, limit, days }, 'Error in getTrendingActions')
    return {
      success: false,
      error: 'Failed to fetch trending actions',
      data: [],
    }
  }
}
