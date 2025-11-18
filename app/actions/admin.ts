'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { requireAdmin } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Category, Difficulty } from '@prisma/client'
import type { Challenge } from '@prisma/client'

// ==================== ZOD VALIDATION SCHEMAS ====================

const CreateChallengeSchema = z.object({
  text: z
    .string()
    .min(10, 'Challenge text must be at least 10 characters long')
    .max(500, 'Challenge text cannot exceed 500 characters')
    .transform((val) => val.trim()),
  category: z.nativeEnum(Category, {
    message: 'Invalid category. Must be PEOPLE, ANIMALS, ENVIRONMENT, or COMMUNITY',
  }),
  difficulty: z.nativeEnum(Difficulty, {
    message: 'Invalid difficulty. Must be EASY or MEDIUM',
  }),
})

const UpdateChallengeSchema = z.object({
  text: z
    .string()
    .min(10, 'Challenge text must be at least 10 characters long')
    .max(500, 'Challenge text cannot exceed 500 characters')
    .transform((val) => val.trim())
    .optional(),
  category: z
    .nativeEnum(Category, {
      message: 'Invalid category. Must be PEOPLE, ANIMALS, ENVIRONMENT, or COMMUNITY',
    })
    .optional(),
  difficulty: z
    .nativeEnum(Difficulty, {
      message: 'Invalid difficulty. Must be EASY or MEDIUM',
    })
    .optional(),
  isActive: z.boolean().optional(),
})

const ChallengeIdSchema = z.string().min(1, 'Challenge ID is required')

// ==================== TYPE DEFINITIONS ====================

type CreateChallengeResponse =
  | { success: true; data: Challenge }
  | { success: false; error: string }

type UpdateChallengeResponse =
  | { success: true; data: Challenge }
  | { success: false; error: string }

type ToggleChallengeActiveResponse =
  | { success: true; data: Challenge }
  | { success: false; error: string }

type DeleteChallengeResponse =
  | { success: true; data: { id: string } }
  | { success: false; error: string }

type GetAllChallengesResponse =
  | { success: true; data: Challenge[] }
  | { success: false; error: string }

// ==================== ADMIN CHALLENGE ACTIONS ====================

/**
 * Create a new challenge (ADMIN ONLY)
 * Validates input with Zod and creates challenge in database
 * @param data - Challenge data (text, category, difficulty)
 * @returns Created challenge or error
 */
export async function createChallenge(data: {
  text: string
  category: Category
  difficulty: Difficulty
}): Promise<CreateChallengeResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate input with Zod
    const validationResult = CreateChallengeSchema.safeParse(data)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      logger.warn(
        { error: validationResult.error, adminId: admin.id },
        'Challenge creation validation failed'
      )
      return {
        success: false,
        error: firstError.message,
      }
    }

    const validatedData = validationResult.data

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        text: validatedData.text,
        category: validatedData.category,
        difficulty: validatedData.difficulty,
      },
    })

    logger.info(
      { challengeId: challenge.id, adminId: admin.id, text: challenge.text },
      'Admin created new challenge'
    )

    // Revalidate pages that display challenges
    revalidatePath('/')
    revalidatePath('/challenges')

    return { success: true, data: challenge }
  } catch (error: unknown) {
    // Handle admin authorization errors
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, data }, 'Error in createChallenge admin action')
    return {
      success: false,
      error: 'Failed to create challenge. Please try again later.',
    }
  }
}

/**
 * Update an existing challenge (ADMIN ONLY)
 * Allows updating text, category, difficulty, and active status
 * @param id - Challenge ID
 * @param data - Fields to update (partial)
 * @returns Updated challenge or error
 */
export async function updateChallenge(
  id: string,
  data: {
    text?: string
    category?: Category
    difficulty?: Difficulty
    isActive?: boolean
  }
): Promise<UpdateChallengeResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate challenge ID
    const idValidation = ChallengeIdSchema.safeParse(id)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid challenge ID',
      }
    }

    // Validate update data with Zod
    const validationResult = UpdateChallengeSchema.safeParse(data)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      logger.warn(
        { error: validationResult.error, adminId: admin.id, challengeId: id },
        'Challenge update validation failed'
      )
      return {
        success: false,
        error: firstError.message,
      }
    }

    const validatedData = validationResult.data

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    })

    if (!existingChallenge) {
      logger.warn({ challengeId: id, adminId: admin.id }, 'Challenge not found for update')
      return {
        success: false,
        error: 'Challenge not found',
      }
    }

    // Update challenge with only provided fields
    const updateData: {
      text?: string
      category?: Category
      difficulty?: Difficulty
      isActive?: boolean
    } = {}

    if (validatedData.text !== undefined) {
      updateData.text = validatedData.text
    }
    if (validatedData.category !== undefined) {
      updateData.category = validatedData.category
    }
    if (validatedData.difficulty !== undefined) {
      updateData.difficulty = validatedData.difficulty
    }
    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive
    }

    const updatedChallenge = await prisma.challenge.update({
      where: { id },
      data: updateData,
    })

    logger.info(
      { challengeId: id, adminId: admin.id, updates: updateData },
      'Admin updated challenge'
    )

    // Revalidate pages that display challenges
    revalidatePath('/')
    revalidatePath('/challenges')
    revalidatePath(`/challenges/${id}`)

    return { success: true, data: updatedChallenge }
  } catch (error: unknown) {
    // Handle admin authorization errors
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, id, data }, 'Error in updateChallenge admin action')
    return {
      success: false,
      error: 'Failed to update challenge. Please try again later.',
    }
  }
}

/**
 * Toggle challenge active status (ADMIN ONLY)
 * Activates inactive challenges or deactivates active ones
 * @param id - Challenge ID
 * @returns Updated challenge or error
 */
export async function toggleChallengeActive(
  id: string
): Promise<ToggleChallengeActiveResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate challenge ID
    const idValidation = ChallengeIdSchema.safeParse(id)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid challenge ID',
      }
    }

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    })

    if (!existingChallenge) {
      logger.warn({ challengeId: id, adminId: admin.id }, 'Challenge not found for toggle')
      return {
        success: false,
        error: 'Challenge not found',
      }
    }

    // Toggle the isActive status
    const updatedChallenge = await prisma.challenge.update({
      where: { id },
      data: {
        isActive: !existingChallenge.isActive,
      },
    })

    logger.info(
      {
        challengeId: id,
        adminId: admin.id,
        newStatus: updatedChallenge.isActive,
      },
      'Admin toggled challenge active status'
    )

    // Revalidate pages that display challenges
    revalidatePath('/')
    revalidatePath('/challenges')
    revalidatePath(`/challenges/${id}`)

    return { success: true, data: updatedChallenge }
  } catch (error: unknown) {
    // Handle admin authorization errors
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, id }, 'Error in toggleChallengeActive admin action')
    return {
      success: false,
      error: 'Failed to toggle challenge status. Please try again later.',
    }
  }
}

/**
 * Delete a challenge permanently (ADMIN ONLY)
 * WARNING: This is a hard delete and cannot be undone
 * Actions that reference this challenge will have challengeId set to null
 * @param id - Challenge ID
 * @returns Deleted challenge ID or error
 */
export async function deleteChallenge(id: string): Promise<DeleteChallengeResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate challenge ID
    const idValidation = ChallengeIdSchema.safeParse(id)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid challenge ID',
      }
    }

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    })

    if (!existingChallenge) {
      logger.warn({ challengeId: id, adminId: admin.id }, 'Challenge not found for deletion')
      return {
        success: false,
        error: 'Challenge not found',
      }
    }

    // Delete challenge (cascading will handle related actions per schema)
    await prisma.challenge.delete({
      where: { id },
    })

    logger.info(
      {
        challengeId: id,
        adminId: admin.id,
        challengeText: existingChallenge.text,
      },
      'Admin deleted challenge'
    )

    // Revalidate pages that display challenges
    revalidatePath('/')
    revalidatePath('/challenges')

    return { success: true, data: { id } }
  } catch (error: unknown) {
    // Handle admin authorization errors
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, id }, 'Error in deleteChallenge admin action')
    return {
      success: false,
      error: 'Failed to delete challenge. Please try again later.',
    }
  }
}

/**
 * Get all challenges including inactive ones (ADMIN ONLY)
 * Returns challenges ordered by category and difficulty
 * @returns All challenges or error
 */
export async function getAllChallenges(): Promise<GetAllChallengesResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    const challenges = await prisma.challenge.findMany({
      orderBy: [{ category: 'asc' }, { difficulty: 'asc' }, { createdAt: 'desc' }],
    })

    logger.info({ adminId: admin.id, count: challenges.length }, 'Admin fetched all challenges')

    return { success: true, data: challenges }
  } catch (error: unknown) {
    // Handle admin authorization errors
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error }, 'Error in getAllChallenges admin action')
    return {
      success: false,
      error: 'Failed to fetch challenges. Please try again later.',
    }
  }
}

// ==================== ADMIN DASHBOARD STATS ====================

type DashboardStatsResponse =
  | {
      success: true
      data: {
        totalUsers: number
        totalActions: number
        activeChallenges: number
        actionsToday: number
        newUsersToday: number
        averageClapsPerAction: number
        totalClaps: number
      }
    }
  | { success: false; error: string }

/**
 * Get dashboard statistics (ADMIN ONLY)
 * Returns high-level platform metrics for admin dashboard
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Run all queries in parallel for better performance
    const [
      totalUsers,
      totalActions,
      activeChallenges,
      actionsToday,
      newUsersToday,
      clapsData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.action.count(),
      prisma.challenge.count({ where: { isActive: true } }),
      prisma.action.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.action.aggregate({
        _avg: { clapsCount: true },
        _sum: { clapsCount: true },
      }),
    ])

    logger.info({ adminId: admin.id }, 'Admin fetched dashboard stats')

    return {
      success: true,
      data: {
        totalUsers,
        totalActions,
        activeChallenges,
        actionsToday,
        newUsersToday,
        averageClapsPerAction: clapsData._avg.clapsCount || 0,
        totalClaps: clapsData._sum.clapsCount || 0,
      },
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error }, 'Error in getDashboardStats admin action')
    return {
      success: false,
      error: 'Failed to fetch dashboard stats. Please try again later.',
    }
  }
}

// ==================== ADMIN USER MANAGEMENT ====================

type GetAllUsersResponse =
  | {
      success: true
      data: Array<{
        id: string
        username: string
        avatarSeed: string
        totalActions: number
        currentStreak: number
        longestStreak: number
        clapsReceived: number
        createdAt: Date
        lastSeenAt: Date
      }>
    }
  | { success: false; error: string }

/**
 * Get all users with stats (ADMIN ONLY)
 * Returns paginated user list with statistics
 */
export async function getAllUsers(
  limit = 100,
  offset = 0
): Promise<GetAllUsersResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarSeed: true,
        totalActions: true,
        currentStreak: true,
        longestStreak: true,
        clapsReceived: true,
        createdAt: true,
        lastSeenAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    logger.info(
      { adminId: admin.id, count: users.length, limit, offset },
      'Admin fetched users'
    )

    return { success: true, data: users }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error }, 'Error in getAllUsers admin action')
    return {
      success: false,
      error: 'Failed to fetch users. Please try again later.',
    }
  }
}

type DeleteUserResponse =
  | { success: true; data: { id: string } }
  | { success: false; error: string }

/**
 * Delete a user permanently (ADMIN ONLY)
 * WARNING: This is a hard delete and cannot be undone
 * All user actions and claps will also be deleted (cascade)
 */
export async function deleteUser(userId: string): Promise<DeleteUserResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate user ID
    const idValidation = z.string().min(1).safeParse(userId)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid user ID',
      }
    }

    // Prevent admin from deleting themselves
    if (userId === admin.id) {
      logger.warn({ adminId: admin.id }, 'Admin attempted to delete themselves')
      return {
        success: false,
        error: 'Cannot delete your own admin account',
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      logger.warn({ userId, adminId: admin.id }, 'User not found for deletion')
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Delete user (cascading will handle related data)
    await prisma.user.delete({
      where: { id: userId },
    })

    logger.info(
      {
        userId,
        adminId: admin.id,
        username: existingUser.username,
      },
      'Admin deleted user'
    )

    // Revalidate pages that display users
    revalidatePath('/admin/users')
    revalidatePath('/feed')

    return { success: true, data: { id: userId } }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, userId }, 'Error in deleteUser admin action')
    return {
      success: false,
      error: 'Failed to delete user. Please try again later.',
    }
  }
}

// ==================== ADMIN ANALYTICS ====================

type GetAnalyticsDataResponse =
  | {
      success: true
      data: {
        dailyStats: Array<{
          date: Date
          totalActions: number
          peopleActions: number
          animalsActions: number
          environmentActions: number
          communityActions: number
        }>
        categoryBreakdown: {
          PEOPLE: number
          ANIMALS: number
          ENVIRONMENT: number
          COMMUNITY: number
        }
        topChallenges: Array<{
          id: string
          text: string
          timesUsed: number
          averageClaps: number
        }>
      }
    }
  | { success: false; error: string }

/**
 * Get analytics data for charts and reports (ADMIN ONLY)
 * Returns daily stats, category breakdown, and top challenges
 */
export async function getAnalyticsData(
  days = 30
): Promise<GetAnalyticsDataResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Fetch daily stats
    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        date: { gte: startDate },
        hour: null, // Only get daily aggregates, not hourly
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        totalActions: true,
        peopleActions: true,
        animalsActions: true,
        environmentActions: true,
        communityActions: true,
      },
    })

    // Get category breakdown
    const actions = await prisma.action.groupBy({
      by: ['category'],
      _count: { category: true },
    })

    const categoryBreakdown = {
      PEOPLE: 0,
      ANIMALS: 0,
      ENVIRONMENT: 0,
      COMMUNITY: 0,
    }

    actions.forEach((action) => {
      categoryBreakdown[action.category] = action._count.category
    })

    // Get top challenges
    const topChallenges = await prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: [{ timesUsed: 'desc' }, { averageClaps: 'desc' }],
      take: 10,
      select: {
        id: true,
        text: true,
        timesUsed: true,
        averageClaps: true,
      },
    })

    logger.info({ adminId: admin.id, days }, 'Admin fetched analytics data')

    return {
      success: true,
      data: {
        dailyStats,
        categoryBreakdown,
        topChallenges,
      },
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error }, 'Error in getAnalyticsData admin action')
    return {
      success: false,
      error: 'Failed to fetch analytics data. Please try again later.',
    }
  }
}

// ==================== ADMIN CONTENT MODERATION ====================

type GetRecentActionsResponse =
  | {
      success: true
      data: Array<{
        id: string
        customText: string | null
        category: Category
        clapsCount: number
        completedAt: Date
        user: {
          id: string
          username: string
        }
        challenge: {
          id: string
          text: string
        } | null
      }>
    }
  | { success: false; error: string }

/**
 * Get recent actions for moderation (ADMIN ONLY)
 * Returns recent actions with user and challenge details
 */
export async function getRecentActions(
  limit = 50
): Promise<GetRecentActionsResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    const actions = await prisma.action.findMany({
      orderBy: { completedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        customText: true,
        category: true,
        clapsCount: true,
        completedAt: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        challenge: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    })

    logger.info({ adminId: admin.id, count: actions.length }, 'Admin fetched recent actions')

    return { success: true, data: actions }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error }, 'Error in getRecentActions admin action')
    return {
      success: false,
      error: 'Failed to fetch recent actions. Please try again later.',
    }
  }
}

type DeleteActionResponse =
  | { success: true; data: { id: string } }
  | { success: false; error: string }

/**
 * Delete an action permanently (ADMIN ONLY)
 * Use this for content moderation to remove inappropriate actions
 */
export async function deleteAction(actionId: string): Promise<DeleteActionResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate action ID
    const idValidation = z.string().min(1).safeParse(actionId)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid action ID',
      }
    }

    // Check if action exists
    const existingAction = await prisma.action.findUnique({
      where: { id: actionId },
      include: {
        user: { select: { id: true, username: true } },
      },
    })

    if (!existingAction) {
      logger.warn({ actionId, adminId: admin.id }, 'Action not found for deletion')
      return {
        success: false,
        error: 'Action not found',
      }
    }

    // Delete action (cascading will handle related claps)
    await prisma.action.delete({
      where: { id: actionId },
    })

    logger.info(
      {
        actionId,
        adminId: admin.id,
        userId: existingAction.user.id,
        username: existingAction.user.username,
      },
      'Admin deleted action for moderation'
    )

    // Revalidate feed and user profile
    revalidatePath('/feed')
    revalidatePath(`/profile/${existingAction.user.id}`)

    return { success: true, data: { id: actionId } }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, actionId }, 'Error in deleteAction admin action')
    return {
      success: false,
      error: 'Failed to delete action. Please try again later.',
    }
  }
}

// ==================== ADMIN USER PROMOTION ====================

type PromoteUserToAdminResponse =
  | { success: true; data: { userId: string; username: string } }
  | { success: false; error: string }

/**
 * Promote a user to admin status (ADMIN ONLY)
 * Only existing admins can promote other users
 * @param userId - The ID of the user to promote
 * @returns Success with user data or error
 */
export async function promoteUserToAdmin(userId: string): Promise<PromoteUserToAdminResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate user ID
    const idValidation = z.string().min(1).safeParse(userId)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid user ID',
      }
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, isAdmin: true },
    })

    if (!targetUser) {
      logger.warn({ userId, adminId: admin.id }, 'User not found for admin promotion')
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Check if user is already an admin
    if (targetUser.isAdmin) {
      logger.info({ userId, adminId: admin.id }, 'User is already an admin')
      return {
        success: false,
        error: 'User is already an admin',
      }
    }

    // Promote user to admin
    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
    })

    logger.info(
      {
        userId,
        username: targetUser.username,
        promotedBy: admin.id,
        promotedByUsername: admin.username,
      },
      'User promoted to admin'
    )

    // Revalidate admin pages
    revalidatePath('/admin')
    revalidatePath('/admin/users')

    return {
      success: true,
      data: {
        userId: targetUser.id,
        username: targetUser.username,
      },
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, userId }, 'Error in promoteUserToAdmin admin action')
    return {
      success: false,
      error: 'Failed to promote user to admin. Please try again later.',
    }
  }
}

type RevokeAdminAccessResponse =
  | { success: true; data: { userId: string; username: string } }
  | { success: false; error: string }

/**
 * Revoke admin access from a user (ADMIN ONLY)
 * Admins cannot revoke their own admin access (prevents lockout)
 * @param userId - The ID of the user to demote
 * @returns Success with user data or error
 */
export async function revokeAdminAccess(userId: string): Promise<RevokeAdminAccessResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate user ID
    const idValidation = z.string().min(1).safeParse(userId)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid user ID',
      }
    }

    // Prevent self-revocation (admin lockout protection)
    if (userId === admin.id) {
      logger.warn({ adminId: admin.id }, 'Admin attempted to revoke their own admin access')
      return {
        success: false,
        error: 'Cannot revoke your own admin access. Ask another admin to do this.',
      }
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, isAdmin: true },
    })

    if (!targetUser) {
      logger.warn({ userId, adminId: admin.id }, 'User not found for admin revocation')
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Check if user is actually an admin
    if (!targetUser.isAdmin) {
      logger.info({ userId, adminId: admin.id }, 'User is not an admin')
      return {
        success: false,
        error: 'User is not an admin',
      }
    }

    // Revoke admin access
    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: false },
    })

    logger.info(
      {
        userId,
        username: targetUser.username,
        revokedBy: admin.id,
        revokedByUsername: admin.username,
      },
      'Admin access revoked from user'
    )

    // Revalidate admin pages
    revalidatePath('/admin')
    revalidatePath('/admin/users')

    return {
      success: true,
      data: {
        userId: targetUser.id,
        username: targetUser.username,
      },
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.warn({ error: error.message }, 'Admin action failed')
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, userId }, 'Error in revokeAdminAccess admin action')
    return {
      success: false,
      error: 'Failed to revoke admin access. Please try again later.',
    }
  }
}

// ==================== ADMIN SETTINGS MANAGEMENT ====================

type PlatformSettings = {
  siteName: string
  maintenanceMode: boolean
  allowNewUsers: boolean
  maxActionsPerDay: number
  requireEmailVerification: boolean
}

type GetPlatformSettingsResponse =
  | { success: true; data: PlatformSettings }
  | { success: false; error: string }

type UpdatePlatformSettingsResponse =
  | { success: true; data: PlatformSettings }
  | { success: false; error: string }

/**
 * Get platform-wide settings (ADMIN ONLY)
 * Returns current platform configuration
 */
export async function getPlatformSettings(): Promise<GetPlatformSettingsResponse> {
  try {
    // Verify admin access
    await requireAdmin()

    // For now, return hardcoded settings
    // In production, these would come from a database table or config file
    const settings: PlatformSettings = {
      siteName: 'Today I Helped',
      maintenanceMode: false,
      allowNewUsers: true,
      maxActionsPerDay: 10,
      requireEmailVerification: false,
    }

    return {
      success: true,
      data: settings,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error }, 'Error in getPlatformSettings admin action')
    return {
      success: false,
      error: 'Failed to fetch platform settings. Please try again later.',
    }
  }
}

/**
 * Update platform-wide settings (ADMIN ONLY)
 * Modifies platform configuration
 */
export async function updatePlatformSettings(
  settings: Partial<PlatformSettings>
): Promise<UpdatePlatformSettingsResponse> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // For now, just log the update
    // In production, these would be saved to a database table or config file
    logger.info(
      { adminId: admin.id, settings },
      'Admin updated platform settings (not persisted yet)'
    )

    // Return the updated settings
    const updatedSettings: PlatformSettings = {
      siteName: settings.siteName || 'Today I Helped',
      maintenanceMode: settings.maintenanceMode || false,
      allowNewUsers: settings.allowNewUsers ?? true,
      maxActionsPerDay: settings.maxActionsPerDay || 10,
      requireEmailVerification: settings.requireEmailVerification || false,
    }

    return {
      success: true,
      data: updatedSettings,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    logger.error({ error, settings }, 'Error in updatePlatformSettings admin action')
    return {
      success: false,
      error: 'Failed to update platform settings. Please try again later.',
    }
  }
}
