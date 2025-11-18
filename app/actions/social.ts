'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import type { UserInfo, CommunityStats, TopContributor, UserSpotlightData } from '@/types/social'

/**
 * Get top contributors for the current week
 */
export async function getTopContributors(limit: number = 10) {
  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Get users with most actions this week
    const topUsers = await prisma.user.findMany({
      where: {
        actions: {
          some: {
            completedAt: {
              gte: weekAgo,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            actions: {
              where: {
                completedAt: {
                  gte: weekAgo,
                },
              },
            },
          },
        },
      },
      orderBy: {
        totalActions: 'desc',
      },
      take: limit,
    })

    const contributors: TopContributor[] = topUsers.map((user, index) => ({
      id: user.id,
      username: user.username,
      avatarUrl: null,
      totalActions: user.totalActions,
      currentStreak: user.currentStreak,
      rank: index + 1,
      actionsThisWeek: user._count.actions,
    }))

    return { success: true, data: contributors }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getTopContributors')
    return {
      success: false,
      error: 'Failed to fetch top contributors',
      data: [] as TopContributor[],
    }
  }
}

/**
 * Get community statistics
 */
export async function getCommunityStats() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Get today's actions count
    const todayActions = await prisma.action.count({
      where: {
        completedAt: {
          gte: today,
        },
      },
    })

    // Get week's actions count
    const weekActions = await prisma.action.count({
      where: {
        completedAt: {
          gte: weekAgo,
        },
      },
    })

    // Get active users today
    const activeUsersData = await prisma.user.findMany({
      where: {
        actions: {
          some: {
            completedAt: {
              gte: today,
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        totalActions: true,
        currentStreak: true,
      },
      take: 10,
      orderBy: {
        totalActions: 'desc',
      },
    })

    const activeUsers: UserInfo[] = activeUsersData.map((user) => ({
      id: user.id,
      username: user.username,
      avatarUrl: null,
      totalActions: user.totalActions,
      currentStreak: user.currentStreak,
    }))

    // Get trending category
    const categoryStats = await prisma.action.groupBy({
      by: ['category'],
      where: {
        completedAt: {
          gte: today,
        },
      },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    })

    const trendingCategory = categoryStats[0]?.category || null

    const stats: CommunityStats = {
      todayActions,
      weekActions,
      activeUsers,
      trendingCategory,
      categoryStats: categoryStats.map((cat) => ({
        category: cat.category,
        count: cat._count.category,
        topUsers: [], // Could be expanded to include top users per category
      })),
    }

    return { success: true, data: stats }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getCommunityStats')
    return {
      success: false,
      error: 'Failed to fetch community stats',
    }
  }
}

/**
 * Get user spotlight (featured active member)
 */
export async function getUserSpotlight() {
  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Find user with most actions this week
    let spotlightUser = await prisma.user.findFirst({
      where: {
        actions: {
          some: {
            completedAt: {
              gte: weekAgo,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            actions: {
              where: {
                completedAt: {
                  gte: weekAgo,
                },
              },
            },
          },
        },
        userAchievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            earnedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        totalActions: 'desc',
      },
    })

    // If no users with actions this week, find user with most total actions
    if (!spotlightUser) {
      spotlightUser = await prisma.user.findFirst({
        where: {
          totalActions: {
            gt: 0,
          },
        },
        include: {
          _count: {
            select: {
              actions: true,
            },
          },
          userAchievements: {
            include: {
              achievement: true,
            },
            orderBy: {
              earnedAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          totalActions: 'desc',
        },
      })
    }

    if (!spotlightUser) {
      return {
        success: false,
        error: 'No spotlight user found',
      }
    }

    // Get category breakdown for this user
    const categoryBreakdown = await prisma.action.groupBy({
      by: ['category'],
      where: { userId: spotlightUser.id },
      _count: {
        category: true,
      },
    })

    const categoriesHelped = categoryBreakdown.length

    // Determine the highlight reason based on recent activity
    const actionsThisWeek = spotlightUser._count.actions || 0
    const highlightReason = actionsThisWeek > 0
      ? `Completed ${actionsThisWeek} action${actionsThisWeek !== 1 ? 's' : ''} this week!`
      : `${spotlightUser.totalActions} total actions shared!`

    const data: UserSpotlightData = {
      user: {
        id: spotlightUser.id,
        username: spotlightUser.username,
        avatarUrl: null,
        totalActions: spotlightUser.totalActions,
        currentStreak: spotlightUser.currentStreak,
      },
      highlightReason,
      stats: {
        totalActions: spotlightUser.totalActions,
        currentStreak: spotlightUser.currentStreak,
        categoriesHelped,
      },
      recentAchievement: spotlightUser.userAchievements[0]
        ? {
          name: spotlightUser.userAchievements[0].achievement.name,
          badgeIcon: spotlightUser.userAchievements[0].achievement.badgeIcon,
        }
        : undefined,
    }

    return { success: true, data }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getUserSpotlight')
    return {
      success: false,
      error: 'Failed to fetch user spotlight',
    }
  }
}

/**
 * Get active users (for avatar stacks)
 */
export async function getActiveUsers(limit: number = 10) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const users = await prisma.user.findMany({
      where: {
        actions: {
          some: {
            completedAt: {
              gte: today,
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        totalActions: true,
        currentStreak: true,
      },
      take: limit,
      orderBy: {
        totalActions: 'desc',
      },
    })

    const userInfos: UserInfo[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      avatarUrl: null,
      totalActions: user.totalActions,
      currentStreak: user.currentStreak,
    }))

    return { success: true, data: userInfos }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getActiveUsers')
    return {
      success: false,
      error: 'Failed to fetch active users',
      data: [] as UserInfo[],
    }
  }
}
