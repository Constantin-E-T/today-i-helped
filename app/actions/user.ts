'use server'

import prisma from '@/lib/prisma'
import logger from '@/lib/logger'
import { generateRecoveryCode, normalizeRecoveryCode } from '@/lib/recovery-code'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'
import type { User } from '@prisma/client'
import { headers } from 'next/headers'

// Type definitions for server action responses
type CreateUserResponse =
  | { success: true; data: User }
  | { success: false; error: string }

type GetUserResponse =
  | { success: true; data: User }
  | { success: false; error: string }

type UpdateUserResponse =
  | { success: true }
  | { success: false; error: string }

// Zod schemas for input validation
const RecoveryCodeSchema = z.string().min(1, 'Recovery code is required').transform((val) => {
  // Cast to string to prevent operator injection
  const stringVal = String(val)
  // Normalize the recovery code
  return normalizeRecoveryCode(stringVal)
})

const UserIdSchema = z.string().min(1, 'User ID is required').transform((val) => {
  // Cast to string to prevent operator injection
  return String(val)
})

// Username generation constants
const ADJECTIVES = ['Happy', 'Kind', 'Brave', 'Gentle', 'Cheerful', 'Bright', 'Caring', 'Helpful']
const ANIMALS = ['Panda', 'Fox', 'Otter', 'Bear', 'Owl', 'Deer', 'Wolf', 'Tiger']

/**
 * Generate a random username in format: [Adjective][Animal][Number]
 * Example: KindPanda427
 */
function generateUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const number = Math.floor(Math.random() * 900) + 100 // 100-999
  return `${adjective}${animal}${number}`
}

/**
 * Generate a random avatar seed for avatar generation
 */
function generateAvatarSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Type guard to check if error is a Prisma error
 */
function isPrismaError(error: unknown): error is { code: string; meta?: { target?: string[] } } {
  return typeof error === 'object' && error !== null && 'code' in error
}

/**
 * Create a new user with auto-generated username and recovery code
 * SECURITY: Rate limited by IP address to prevent abuse
 * Retries if username or recovery code collision occurs
 */
export async function createUser(): Promise<CreateUserResponse> {
  try {
    // SECURITY: Rate limiting by IP address - max 5 user creations per hour per IP
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      headersList.get('x-real-ip') ||
                      'unknown'

    const rateLimit = await checkRateLimit(
      ipAddress,
      'CREATE_USER',
      RATE_LIMITS.CREATE_USER.limit,
      RATE_LIMITS.CREATE_USER.windowMs
    )

    if (!rateLimit.allowed) {
      logger.warn(
        { ipAddress, retryAfter: rateLimit.retryAfter },
        'Rate limit exceeded for user creation'
      )
      return {
        success: false,
        error: `Too many account creation attempts. Try again in ${rateLimit.retryAfter} seconds.`,
      }
    }

    const maxRetries = 10
    let attempts = 0

    while (attempts < maxRetries) {
      const username = generateUsername()
      const avatarSeed = generateAvatarSeed()
      const recoveryCode = generateRecoveryCode()

      try {
        // Attempt to create user with generated username and recovery code
        const user = await prisma.user.create({
          data: {
            username,
            avatarSeed,
            recoveryCode,
          },
        })

        logger.info({ userId: user.id, username: user.username }, 'User created successfully')
        return { success: true, data: user }
      } catch (error: unknown) {
        // Check if error is due to unique constraint violation
        if (isPrismaError(error) && error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined

          if (target?.includes('username') || target?.includes('recoveryCode')) {
            attempts++
            logger.debug({ attempt: attempts }, 'Retrying user creation due to collision')
            continue // Retry with new username and/or recovery code
          }
        }

        // If it's a different error, log and throw it
        logger.error({ error }, 'Failed to create user in database')
        throw error
      }
    }

    // If we exhausted all retries
    logger.error('Exhausted all retries for user creation')
    return {
      success: false,
      error: 'Failed to generate unique username. Please try again.'
    }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in createUser function')
    return {
      success: false,
      error: 'Failed to create user. Please try again later.'
    }
  }
}

/**
 * Get user by ID with all stats
 */
export async function getUserById(id: string): Promise<GetUserResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    return { success: true, data: user }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getUserById function')
    return {
      success: false,
      error: 'Failed to fetch user. Please try again later.'
    }
  }
}

/**
 * Update user's last seen timestamp
 */
export async function updateUserLastSeen(userId: string): Promise<UpdateUserResponse> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    })

    return { success: true }
  } catch (error: unknown) {
    // Check if error is due to user not found
    if (isPrismaError(error) && error.code === 'P2025') {
      return {
        success: false,
        error: 'User not found'
      }
    }

    logger.error({ error }, 'Error in updateUserLastSeen function')
    return {
      success: false,
      error: 'Failed to update user activity. Please try again later.'
    }
  }
}

/**
 * Get user by recovery code with input validation
 * SECURITY: Implements multiple security best practices:
 * - Input validation with Zod
 * - Type casting to prevent operator injection
 * - Generic error messages to prevent enumeration attacks
 * - Rate limiting by IP to prevent brute force attacks
 */
export async function getUserByRecoveryCode(code: string): Promise<GetUserResponse> {
  try {
    // SECURITY: Rate limiting by IP address - max 5 attempts per 15 minutes
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      headersList.get('x-real-ip') ||
                      'unknown'

    const rateLimit = await checkRateLimit(
      ipAddress,
      'RECOVERY_CODE',
      RATE_LIMITS.RECOVERY_CODE.limit,
      RATE_LIMITS.RECOVERY_CODE.windowMs
    )

    if (!rateLimit.allowed) {
      logger.warn(
        { ipAddress, retryAfter: rateLimit.retryAfter },
        'Rate limit exceeded for recovery code attempts'
      )
      return {
        success: false,
        error: 'Too many attempts. Please try again later.',
      }
    }

    // Validate and normalize the recovery code
    const validationResult = RecoveryCodeSchema.safeParse(code)

    if (!validationResult.success) {
      logger.warn({ error: validationResult.error }, 'Invalid recovery code format')
      // Return generic error to prevent enumeration
      return {
        success: false,
        error: 'Invalid recovery code'
      }
    }

    const normalizedCode = validationResult.data

    // Check if normalization failed (code format invalid)
    if (!normalizedCode) {
      logger.warn({ code }, 'Recovery code normalization failed')
      return {
        success: false,
        error: 'Invalid recovery code'
      }
    }

    // Query database with normalized code
    const user = await prisma.user.findUnique({
      where: { recoveryCode: normalizedCode },
    })

    if (!user) {
      // Return generic error to prevent enumeration
      logger.warn({ code: normalizedCode }, 'User not found for recovery code')
      return {
        success: false,
        error: 'Invalid recovery code'
      }
    }

    logger.info({ userId: user.id }, 'User authenticated via recovery code')
    return { success: true, data: user }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in getUserByRecoveryCode function')
    return {
      success: false,
      error: 'Authentication failed. Please try again later.'
    }
  }
}

/**
 * Regenerate recovery code for a user
 * SECURITY: Rate limited to prevent abuse
 * Retries if recovery code collision occurs
 */
export async function regenerateRecoveryCode(userId: string): Promise<CreateUserResponse> {
  try {
    // SECURITY: Rate limiting - max 5 regenerations per hour
    const rateLimit = await checkRateLimit(
      userId,
      'REGENERATE_RECOVERY_CODE',
      5,
      60 * 60 * 1000 // 1 hour
    )

    if (!rateLimit.allowed) {
      logger.warn(
        { userId, retryAfter: rateLimit.retryAfter },
        'Rate limit exceeded for recovery code regeneration'
      )
      return {
        success: false,
        error: `Too many regeneration attempts. Try again in ${rateLimit.retryAfter} seconds.`,
      }
    }

    // Validate user ID
    const validationResult = UserIdSchema.safeParse(userId)

    if (!validationResult.success) {
      logger.warn({ error: validationResult.error }, 'Invalid user ID')
      return {
        success: false,
        error: 'Invalid user ID'
      }
    }

    const validatedUserId = validationResult.data
    const maxRetries = 10
    let attempts = 0

    while (attempts < maxRetries) {
      const recoveryCode = generateRecoveryCode()

      try {
        // Attempt to update user with new recovery code
        const user = await prisma.user.update({
          where: { id: validatedUserId },
          data: { recoveryCode },
        })

        logger.info({ userId: user.id }, 'Recovery code regenerated successfully')
        return { success: true, data: user }
      } catch (error: unknown) {
        // Check if error is due to recovery code collision
        if (isPrismaError(error) && error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined

          if (target?.includes('recoveryCode')) {
            attempts++
            logger.debug({ attempt: attempts }, 'Retrying recovery code generation due to collision')
            continue // Retry with new recovery code
          }
        }

        // Check if error is due to user not found
        if (isPrismaError(error) && error.code === 'P2025') {
          logger.warn({ userId: validatedUserId }, 'User not found for recovery code regeneration')
          return {
            success: false,
            error: 'User not found'
          }
        }

        // If it's a different error, log and throw it
        logger.error({ error }, 'Failed to regenerate recovery code in database')
        throw error
      }
    }

    // If we exhausted all retries
    logger.error({ userId: validatedUserId }, 'Exhausted all retries for recovery code regeneration')
    return {
      success: false,
      error: 'Failed to generate unique recovery code. Please try again.'
    }
  } catch (error: unknown) {
    logger.error({ error }, 'Error in regenerateRecoveryCode function')
    return {
      success: false,
      error: 'Failed to regenerate recovery code. Please try again later.'
    }
  }
}
