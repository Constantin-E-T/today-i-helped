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
