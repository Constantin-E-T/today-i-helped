/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Uses DOMPurify to clean HTML/text content before storing in database.
 */

import DOMPurify from 'isomorphic-dompurify'
import logger from '@/lib/logger'

/**
 * Sanitize plain text input by stripping all HTML tags
 * Use this for fields that should contain only plain text (e.g., customText, location)
 *
 * @param input - Raw user input string
 * @param maxLength - Maximum allowed length (optional)
 * @returns Sanitized plain text string
 */
export function sanitizePlainText(input: string | null | undefined, maxLength?: number): string {
  try {
    // Handle null/undefined
    if (!input) {
      return ''
    }

    // Convert to string to prevent type issues
    const stringInput = String(input)

    // Strip all HTML tags - only allow plain text
    const sanitized = DOMPurify.sanitize(stringInput, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      KEEP_CONTENT: true, // Keep text content
    })

    // Trim whitespace
    const trimmed = sanitized.trim()

    // Apply max length if specified
    if (maxLength && trimmed.length > maxLength) {
      return trimmed.substring(0, maxLength)
    }

    return trimmed
  } catch (error: unknown) {
    logger.error({ error, input }, 'Error sanitizing plain text')
    // On error, return empty string for safety
    return ''
  }
}

/**
 * Sanitize rich text input while allowing safe HTML tags
 * Use this for fields that may contain formatted text (currently not used in this app)
 *
 * @param input - Raw user input HTML string
 * @param maxLength - Maximum allowed length (optional)
 * @returns Sanitized HTML string with safe tags only
 */
export function sanitizeRichText(input: string | null | undefined, maxLength?: number): string {
  try {
    // Handle null/undefined
    if (!input) {
      return ''
    }

    // Convert to string to prevent type issues
    const stringInput = String(input)

    // Allow only safe HTML tags for formatting
    const sanitized = DOMPurify.sanitize(stringInput, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [], // No attributes allowed (prevents onclick, onerror, etc.)
      KEEP_CONTENT: true,
    })

    // Trim whitespace
    const trimmed = sanitized.trim()

    // Apply max length if specified
    if (maxLength && trimmed.length > maxLength) {
      return trimmed.substring(0, maxLength)
    }

    return trimmed
  } catch (error: unknown) {
    logger.error({ error, input }, 'Error sanitizing rich text')
    // On error, fall back to plain text sanitization
    return sanitizePlainText(input, maxLength)
  }
}

/**
 * Sanitize location input
 * Removes HTML tags and limits length to prevent abuse
 *
 * @param location - Raw location string
 * @returns Sanitized location string (max 100 characters)
 */
export function sanitizeLocation(location: string | null | undefined): string {
  return sanitizePlainText(location, 100)
}

/**
 * Sanitize custom text for action submissions
 * Removes HTML tags and enforces reasonable length limits
 *
 * @param customText - Raw custom text string
 * @returns Sanitized custom text (max 500 characters)
 */
export function sanitizeCustomText(customText: string | null | undefined): string {
  return sanitizePlainText(customText, 500)
}

/**
 * Sanitize challenge text (admin operation)
 * Removes HTML tags and enforces length limits
 *
 * @param text - Raw challenge text
 * @returns Sanitized challenge text (max 500 characters)
 */
export function sanitizeChallengeText(text: string | null | undefined): string {
  return sanitizePlainText(text, 500)
}

/**
 * Sanitize username
 * Ensures username contains only alphanumeric characters
 * (Note: Usernames are auto-generated in this system, but this provides extra safety)
 *
 * @param username - Raw username string
 * @returns Sanitized username (max 50 characters, alphanumeric only)
 */
export function sanitizeUsername(username: string | null | undefined): string {
  try {
    if (!username) {
      return ''
    }

    const stringInput = String(username)

    // Remove all non-alphanumeric characters
    const alphanumeric = stringInput.replace(/[^a-zA-Z0-9]/g, '')

    // Limit length
    return alphanumeric.substring(0, 50)
  } catch (error: unknown) {
    logger.error({ error, username }, 'Error sanitizing username')
    return ''
  }
}

/**
 * Batch sanitize an object's string fields
 * Useful for sanitizing form data or API inputs
 *
 * @param data - Object with string fields to sanitize
 * @param fieldsToSanitize - Array of field names to sanitize
 * @returns New object with sanitized fields
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  data: T,
  fieldsToSanitize: string[]
): T {
  try {
    const sanitized = { ...data }

    for (const field of fieldsToSanitize) {
      if (field in sanitized && typeof sanitized[field] === 'string') {
        sanitized[field] = sanitizePlainText(sanitized[field] as string) as T[Extract<keyof T, string>]
      }
    }

    return sanitized
  } catch (error: unknown) {
    logger.error({ error, fieldsToSanitize }, 'Error sanitizing object')
    return data
  }
}

/**
 * Validate and sanitize email address
 * (Not currently used in this app, but included for completeness)
 *
 * @param email - Raw email string
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string | null | undefined): string {
  try {
    if (!email) {
      return ''
    }

    const stringInput = String(email).trim().toLowerCase()

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(stringInput)) {
      logger.warn({ email: stringInput }, 'Invalid email format')
      return ''
    }

    // Sanitize and limit length
    return sanitizePlainText(stringInput, 254) // Max email length per RFC
  } catch (error: unknown) {
    logger.error({ error, email }, 'Error sanitizing email')
    return ''
  }
}
