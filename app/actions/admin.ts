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
