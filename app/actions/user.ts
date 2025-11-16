'use server'

import prisma from '@/lib/prisma'
import type { User } from '@prisma/client'

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
 * Create a new user with auto-generated username
 * Retries if username collision occurs
 */
export async function createUser(): Promise<CreateUserResponse> {
  try {
    const maxRetries = 10
    let attempts = 0

    while (attempts < maxRetries) {
      const username = generateUsername()
      const avatarSeed = generateAvatarSeed()

      try {
        // Attempt to create user with generated username
        const user = await prisma.user.create({
          data: {
            username,
            avatarSeed,
          },
        })

        return { success: true, data: user }
      } catch (error: any) {
        // Check if error is due to unique constraint violation
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
          attempts++
          continue // Retry with new username
        }

        // If it's a different error, throw it
        throw error
      }
    }

    // If we exhausted all retries
    return {
      success: false,
      error: 'Failed to generate unique username. Please try again.'
    }
  } catch (error) {
    console.error('Error creating user:', error)
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
  } catch (error) {
    console.error('Error fetching user:', error)
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
  } catch (error: any) {
    // Check if error is due to user not found
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'User not found'
      }
    }

    console.error('Error updating user last seen:', error)
    return {
      success: false,
      error: 'Failed to update user activity. Please try again later.'
    }
  }
}
