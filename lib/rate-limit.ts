/**
 * Rate Limiting System for Server Actions
 *
 * Provides in-memory rate limiting with sliding window algorithm
 * to prevent spam and DoS attacks on Server Actions.
 *
 * For production with multiple servers, consider using Redis instead.
 */

import logger from '@/lib/logger'

// Store for rate limit data: Map<key, { count: number; resetAt: number }>
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Cleanup interval: remove expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    let cleaned = 0

    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetAt) {
        rateLimitStore.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      logger.debug({ cleaned, remaining: rateLimitStore.size }, 'Rate limit store cleanup')
    }
  }, CLEANUP_INTERVAL_MS)
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfter?: number
}

/**
 * Check if a request is within rate limits
 *
 * @param identifier - Unique identifier (userId, IP address, etc.)
 * @param action - Action name (e.g., 'create-action', 'clap')
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const key = `${identifier}:${action}`
    const now = Date.now()

    // Get existing rate limit data
    const existing = rateLimitStore.get(key)

    // If no existing data or window has expired, create new window
    if (!existing || now > existing.resetAt) {
      const resetAt = now + windowMs
      rateLimitStore.set(key, { count: 1, resetAt })

      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetAt,
      }
    }

    // Check if limit exceeded
    if (existing.count >= limit) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000) // seconds

      logger.warn(
        { identifier, action, count: existing.count, limit, retryAfter },
        'Rate limit exceeded'
      )

      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAt: existing.resetAt,
        retryAfter,
      }
    }

    // Increment count
    existing.count++
    rateLimitStore.set(key, existing)

    return {
      allowed: true,
      limit,
      remaining: limit - existing.count,
      resetAt: existing.resetAt,
    }
  } catch (error: unknown) {
    // On error, allow the request but log the issue
    logger.error({ error, identifier, action }, 'Rate limit check failed')
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAt: Date.now() + windowMs,
    }
  }
}

/**
 * Preset rate limit configurations for common actions
 */
export const RATE_LIMITS = {
  // Create action: 10 per 24 hours per user
  CREATE_ACTION: {
    limit: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Clap: 100 per hour per user
  CLAP: {
    limit: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // User creation: 5 per hour per IP
  CREATE_USER: {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // General actions: 50 per hour per user
  GENERAL: {
    limit: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // Admin actions: 100 per 5 minutes
  ADMIN: {
    limit: 100,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },

  // Recovery code attempts: 5 per 15 minutes per IP
  RECOVERY_CODE: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
} as const

/**
 * Helper function to check rate limit with preset configuration
 *
 * @param identifier - Unique identifier
 * @param preset - Preset rate limit key from RATE_LIMITS
 * @returns RateLimitResult
 */
export async function checkRateLimitPreset(
  identifier: string,
  preset: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[preset]
  return checkRateLimit(identifier, preset, config.limit, config.windowMs)
}

/**
 * Reset rate limit for a specific identifier and action
 * Useful for testing or administrative overrides
 *
 * @param identifier - Unique identifier
 * @param action - Action name
 */
export function resetRateLimit(identifier: string, action: string): void {
  const key = `${identifier}:${action}`
  rateLimitStore.delete(key)
  logger.info({ identifier, action }, 'Rate limit reset')
}

/**
 * Get current rate limit status without incrementing counter
 *
 * @param identifier - Unique identifier
 * @param action - Action name
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Current rate limit status
 */
export function getRateLimitStatus(
  identifier: string,
  action: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const key = `${identifier}:${action}`
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetAt) {
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAt: now + windowMs,
    }
  }

  const allowed = existing.count < limit

  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    retryAfter: allowed ? undefined : Math.ceil((existing.resetAt - now) / 1000),
  }
}
