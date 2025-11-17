'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { Category, Difficulty } from '@prisma/client'
import type { Challenge } from '@prisma/client'

// Type definitions for server action responses
type GetChallengesResponse =
  | { success: true; data: Challenge[] }
  | { success: false; error: string }

type GetChallengeResponse =
  | { success: true; data: Challenge }
  | { success: false; error: string }

/**
 * Get all active challenges, ordered by category then difficulty
 */
export async function getActiveChallenges(): Promise<GetChallengesResponse> {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { category: 'asc' },
        { difficulty: 'asc' },
      ],
    })

    return { success: true, data: challenges }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getActiveChallenges function')
    return {
      success: false,
      error: 'Failed to fetch challenges. Please try again later.',
    }
  }
}

/**
 * Get active challenges by category
 */
export async function getChallengesByCategory(
  category: Category
): Promise<GetChallengesResponse> {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        category,
      },
      orderBy: [
        { difficulty: 'asc' },
      ],
    })

    return { success: true, data: challenges }
  } catch (error: unknown) {
    logger.error({ error, category }, 'Error in getChallengesByCategory function')
    return {
      success: false,
      error: 'Failed to fetch challenges. Please try again later.',
    }
  }
}

/**
 * Get active challenges by difficulty
 */
export async function getChallengesByDifficulty(
  difficulty: Difficulty
): Promise<GetChallengesResponse> {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        difficulty,
      },
      orderBy: [
        { category: 'asc' },
      ],
    })

    return { success: true, data: challenges }
  } catch (error: unknown) {
    logger.error({ error, difficulty }, 'Error in getChallengesByDifficulty function')
    return {
      success: false,
      error: 'Failed to fetch challenges. Please try again later.',
    }
  }
}

/**
 * Get a random active challenge
 * Returns error if no challenges exist
 */
export async function getRandomChallenge(): Promise<GetChallengeResponse> {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
      },
    })

    if (challenges.length === 0) {
      return {
        success: false,
        error: 'No active challenges available',
      }
    }

    // Pick a random challenge from the array
    const randomIndex = Math.floor(Math.random() * challenges.length)
    const randomChallenge = challenges[randomIndex]

    return { success: true, data: randomChallenge }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getRandomChallenge function')
    return {
      success: false,
      error: 'Failed to fetch random challenge. Please try again later.',
    }
  }
}

/**
 * Get filtered challenges with optional category and difficulty filters
 * Supports combined filtering and returns multiple random challenges
 */
export async function getFilteredChallenges(params: {
  category?: Category
  difficulty?: Difficulty
  limit?: number
  random?: boolean
}): Promise<GetChallengesResponse> {
  try {
    const { category, difficulty, limit = 4, random = false } = params

    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
        ...(difficulty && { difficulty }),
      },
      orderBy: random
        ? undefined
        : [{ category: 'asc' }, { difficulty: 'asc' }],
    })

    if (challenges.length === 0) {
      return { success: true, data: [] }
    }

    // If random is true, shuffle and take limit
    if (random) {
      const shuffled = challenges
        .map((challenge) => ({ challenge, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ challenge }) => challenge)

      return { success: true, data: shuffled.slice(0, limit) }
    }

    // Otherwise just take limit
    return { success: true, data: challenges.slice(0, limit) }
  } catch (error: unknown) {
    logger.error({ error, params }, 'Error in getFilteredChallenges function')
    return {
      success: false,
      error: 'Failed to fetch filtered challenges. Please try again later.',
    }
  }
}

// ==================== ADMIN CHALLENGE MANAGEMENT ====================

type CreateChallengeResponse =
  | { success: true; data: Challenge }
  | { success: false; error: string }

type UpdateChallengeResponse =
  | { success: true; data: Challenge }
  | { success: false; error: string }

type DeactivateChallengeResponse =
  | { success: true; data: { id: string; isActive: false } }
  | { success: false; error: string }

type BulkCreateResponse =
  | { success: true; data: { count: number } }
  | { success: false; error: string }

/**
 * Create a new challenge (admin operation)
 * Validates input and creates challenge in database
 */
export async function createChallenge(data: {
  text: string
  category: Category
  difficulty: Difficulty
}): Promise<CreateChallengeResponse> {
  try {
    // Validate text
    const trimmedText = data.text.trim()
    if (!trimmedText) {
      return {
        success: false,
        error: 'Challenge text cannot be empty',
      }
    }

    if (trimmedText.length < 10) {
      return {
        success: false,
        error: 'Challenge text must be at least 10 characters long',
      }
    }

    if (trimmedText.length > 500) {
      return {
        success: false,
        error: 'Challenge text cannot exceed 500 characters',
      }
    }

    // Validate category enum
    if (!Object.values(Category).includes(data.category)) {
      return {
        success: false,
        error: 'Invalid category. Must be PEOPLE, ANIMALS, ENVIRONMENT, or COMMUNITY',
      }
    }

    // Validate difficulty enum
    if (!Object.values(Difficulty).includes(data.difficulty)) {
      return {
        success: false,
        error: 'Invalid difficulty. Must be EASY or MEDIUM',
      }
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        text: trimmedText,
        category: data.category,
        difficulty: data.difficulty,
      },
    })

    logger.info({ challengeId: challenge.id }, 'Created new challenge')
    return { success: true, data: challenge }
  } catch (error: unknown) {
    logger.error({ error, data }, 'Error in createChallenge function')
    return {
      success: false,
      error: 'Failed to create challenge. Please try again later.',
    }
  }
}

/**
 * Update an existing challenge (admin operation)
 * Allows updating text, category, difficulty, and active status
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
    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    })

    if (!existingChallenge) {
      return {
        success: false,
        error: 'Challenge not found',
      }
    }

    // Validate text if provided
    if (data.text !== undefined) {
      const trimmedText = data.text.trim()
      if (!trimmedText) {
        return {
          success: false,
          error: 'Challenge text cannot be empty',
        }
      }

      if (trimmedText.length < 10) {
        return {
          success: false,
          error: 'Challenge text must be at least 10 characters long',
        }
      }

      if (trimmedText.length > 500) {
        return {
          success: false,
          error: 'Challenge text cannot exceed 500 characters',
        }
      }
    }

    // Validate category if provided
    if (data.category && !Object.values(Category).includes(data.category)) {
      return {
        success: false,
        error: 'Invalid category. Must be PEOPLE, ANIMALS, ENVIRONMENT, or COMMUNITY',
      }
    }

    // Validate difficulty if provided
    if (data.difficulty && !Object.values(Difficulty).includes(data.difficulty)) {
      return {
        success: false,
        error: 'Invalid difficulty. Must be EASY or MEDIUM',
      }
    }

    // Update challenge
    const updatedChallenge = await prisma.challenge.update({
      where: { id },
      data: {
        ...(data.text && { text: data.text.trim() }),
        ...(data.category && { category: data.category }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    logger.info({ challengeId: id, updates: data }, 'Updated challenge')
    return { success: true, data: updatedChallenge }
  } catch (error: unknown) {
    logger.error({ error, id, data }, 'Error in updateChallenge function')
    return {
      success: false,
      error: 'Failed to update challenge. Please try again later.',
    }
  }
}

/**
 * Deactivate a challenge (soft delete)
 * Sets isActive to false instead of deleting from database
 */
export async function deactivateChallenge(
  id: string
): Promise<DeactivateChallengeResponse> {
  try {
    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    })

    if (!existingChallenge) {
      return {
        success: false,
        error: 'Challenge not found',
      }
    }

    if (!existingChallenge.isActive) {
      return {
        success: false,
        error: 'Challenge is already inactive',
      }
    }

    // Deactivate challenge
    await prisma.challenge.update({
      where: { id },
      data: { isActive: false },
    })

    logger.info({ challengeId: id }, 'Deactivated challenge')
    return { success: true, data: { id, isActive: false } }
  } catch (error: unknown) {
    logger.error({ error, id }, 'Error in deactivateChallenge function')
    return {
      success: false,
      error: 'Failed to deactivate challenge. Please try again later.',
    }
  }
}

/**
 * Bulk create challenges (admin operation)
 * Useful for importing multiple challenges at once
 */
export async function bulkCreateChallenges(
  challenges: Array<{
    text: string
    category: Category
    difficulty: Difficulty
  }>
): Promise<BulkCreateResponse> {
  try {
    if (challenges.length === 0) {
      return {
        success: false,
        error: 'No challenges provided',
      }
    }

    if (challenges.length > 100) {
      return {
        success: false,
        error: 'Cannot bulk create more than 100 challenges at once',
      }
    }

    // Validate all challenges before creating
    for (let i = 0; i < challenges.length; i++) {
      const challenge = challenges[i]
      const trimmedText = challenge.text.trim()

      if (!trimmedText || trimmedText.length < 10 || trimmedText.length > 500) {
        return {
          success: false,
          error: `Challenge at index ${i} has invalid text length`,
        }
      }

      if (!Object.values(Category).includes(challenge.category)) {
        return {
          success: false,
          error: `Challenge at index ${i} has invalid category`,
        }
      }

      if (!Object.values(Difficulty).includes(challenge.difficulty)) {
        return {
          success: false,
          error: `Challenge at index ${i} has invalid difficulty`,
        }
      }
    }

    // Create all challenges in a transaction
    const result = await prisma.challenge.createMany({
      data: challenges.map((c) => ({
        text: c.text.trim(),
        category: c.category,
        difficulty: c.difficulty,
      })),
    })

    logger.info({ count: result.count }, 'Bulk created challenges')
    return { success: true, data: { count: result.count } }
  } catch (error: unknown) {
    logger.error({ error, count: challenges.length }, 'Error in bulkCreateChallenges function')
    return {
      success: false,
      error: 'Failed to bulk create challenges. Please try again later.',
    }
  }
}
