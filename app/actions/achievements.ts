'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { ACHIEVEMENT_DEFINITIONS, calculateEarnedAchievements, type UserStats } from '@/lib/achievements'
import { Category } from '@prisma/client'
import type { Achievement, UserAchievement } from '@prisma/client'

// Type definitions for server action responses
type GetAchievementsResponse =
  | { success: true; data: Achievement[] }
  | { success: false; error: string }

type GetUserAchievementsResponse =
  | {
      success: true
      data: Array<
        UserAchievement & {
          achievement: Achievement
        }
      >
    }
  | { success: false; error: string }

type CheckAchievementsResponse =
  | { success: true; newAchievements: Achievement[] }
  | { success: false; error: string }

/**
 * Seed achievement definitions into database
 * Should be run once during setup or when new achievements are added
 */
export async function seedAchievements(): Promise<GetAchievementsResponse> {
  try {
    const achievements = await Promise.all(
      ACHIEVEMENT_DEFINITIONS.map((def) =>
        prisma.achievement.upsert({
          where: { key: def.key },
          create: def,
          update: {
            name: def.name,
            description: def.description,
            badgeIcon: def.badgeIcon,
            category: def.category,
            requirement: def.requirement,
            order: def.order,
          },
        })
      )
    )

    logger.info({ count: achievements.length }, 'Achievements seeded successfully')
    return { success: true, data: achievements }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in seedAchievements function')
    return {
      success: false,
      error: 'Failed to seed achievements. Please try again later.',
    }
  }
}

/**
 * Get all available achievements from database
 * Ordered by category and order
 */
export async function getAllAchievements(): Promise<GetAchievementsResponse> {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    })

    return { success: true, data: achievements }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getAllAchievements function')
    return {
      success: false,
      error: 'Failed to fetch achievements. Please try again later.',
    }
  }
}

/**
 * Get user's earned achievements with full achievement details
 * SECURITY: Uses userId parameter (acceptable for read operations)
 */
export async function getUserAchievements(userId: string): Promise<GetUserAchievementsResponse> {
  try {
    // Note: userId parameter is acceptable here as it's a read-only operation
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    })

    return { success: true, data: userAchievements }
  } catch (error: unknown) {
    logger.error({ error, userId }, 'Error in getUserAchievements function')
    return {
      success: false,
      error: 'Failed to fetch user achievements. Please try again later.',
    }
  }
}

/**
 * Calculate user's category breakdown for achievements
 */
async function getUserCategoryBreakdown(userId: string) {
  const categoryBreakdown = await prisma.action.groupBy({
    by: ['category'],
    where: { userId },
    _count: {
      category: true,
    },
  })

  return {
    PEOPLE: categoryBreakdown.find((c) => c.category === Category.PEOPLE)?._count.category || 0,
    ANIMALS: categoryBreakdown.find((c) => c.category === Category.ANIMALS)?._count.category || 0,
    ENVIRONMENT: categoryBreakdown.find((c) => c.category === Category.ENVIRONMENT)?._count.category || 0,
    COMMUNITY: categoryBreakdown.find((c) => c.category === Category.COMMUNITY)?._count.category || 0,
  }
}

/**
 * Check and award achievements for a user
 * SECURITY: Uses userId parameter (acceptable when called by other server actions with verified userId)
 * Called after actions are completed to check for new milestones
 * Returns list of newly awarded achievements
 */
export async function checkAndAwardAchievements(userId: string): Promise<CheckAchievementsResponse> {
  try {
    // Note: This function should only be called by other server actions
    // (like createAction) with server-verified userId

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalActions: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Get category breakdown
    const categoryBreakdown = await getUserCategoryBreakdown(userId)

    // Count unique categories used
    const uniqueCategories = Object.values(categoryBreakdown).filter((count) => count > 0).length

    // Calculate days since joined
    const daysSinceJoined = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Build user stats object
    const userStats: UserStats = {
      totalActions: user.totalActions,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      categoryBreakdown,
      uniqueCategories,
      daysSinceJoined,
    }

    // Calculate which achievements should be earned
    const shouldHaveKeys = calculateEarnedAchievements(userStats)

    // Get achievements user already has
    const existingAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
    })

    const existingKeys = new Set(existingAchievements.map((ua) => ua.achievement.key))

    // Find new achievements to award
    const newAchievementKeys = shouldHaveKeys.filter((key) => !existingKeys.has(key))

    if (newAchievementKeys.length === 0) {
      return { success: true, newAchievements: [] }
    }

    // Get achievement IDs for new achievements
    const achievementsToAward = await prisma.achievement.findMany({
      where: {
        key: {
          in: newAchievementKeys,
        },
      },
    })

    // Award new achievements
    await prisma.userAchievement.createMany({
      data: achievementsToAward.map((achievement) => ({
        userId,
        achievementId: achievement.id,
      })),
      skipDuplicates: true,
    })

    logger.info(
      { userId, newAchievements: newAchievementKeys },
      'New achievements awarded'
    )

    return { success: true, newAchievements: achievementsToAward }
  } catch (error: unknown) {
    logger.error({ error, userId }, 'Error in checkAndAwardAchievements function')
    return {
      success: false,
      error: 'Failed to check achievements. Please try again later.',
    }
  }
}

/**
 * Get achievement progress for a user
 * SECURITY: Uses userId parameter (acceptable for read operations)
 * Returns all achievements with earned status and progress
 */
export async function getAchievementProgress(userId: string) {
  try {
    // Note: userId parameter is acceptable here as it's a read-only operation

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    })

    // Get user's earned achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    })

    const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId))

    // Get user stats for progress calculation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalActions: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    const categoryBreakdown = await getUserCategoryBreakdown(userId)

    // Map achievements with progress
    const achievementsWithProgress = allAchievements.map((achievement) => {
      const isEarned = earnedIds.has(achievement.id)
      let currentProgress = 0

      // Calculate progress based on achievement type
      switch (achievement.key) {
        case 'FIRST_ACTION':
          currentProgress = user.totalActions
          break
        case 'FIRST_WEEK':
          currentProgress = Math.floor(
            (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          )
          break
        case 'CATEGORY_EXPLORER':
          currentProgress = Object.values(categoryBreakdown).filter((count) => count > 0).length
          break
        case 'STREAK_3':
        case 'STREAK_7':
        case 'STREAK_30':
          currentProgress = user.longestStreak
          break
        case 'HELPER':
        case 'CHAMPION':
        case 'HERO':
        case 'LEGEND':
          currentProgress = user.totalActions
          break
        case 'PEOPLE_HELPER':
          currentProgress = categoryBreakdown.PEOPLE
          break
        case 'ANIMAL_FRIEND':
          currentProgress = categoryBreakdown.ANIMALS
          break
        case 'ECO_WARRIOR':
          currentProgress = categoryBreakdown.ENVIRONMENT
          break
        case 'COMMUNITY_BUILDER':
          currentProgress = categoryBreakdown.COMMUNITY
          break
      }

      return {
        ...achievement,
        isEarned,
        currentProgress,
        progressPercentage: Math.min(100, (currentProgress / achievement.requirement) * 100),
      }
    })

    return { success: true, data: achievementsWithProgress }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    logger.error({ error: errorMessage, stack: errorStack, userId }, 'Error in getAchievementProgress function')
    return {
      success: false,
      error: 'Failed to get achievement progress. Please try again later.',
    }
  }
}
