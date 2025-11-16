import { randomBytes } from 'crypto'

/**
 * Secure recovery code generation using cryptographic randomness
 *
 * Format: XXXX-XXXX-XXXX (12 characters + 2 hyphens = 14 total)
 * Character set: A-Z, 2-9 (excluding 0, 1, O, I, L for clarity)
 *
 * Security features:
 * - Uses crypto.randomBytes() for cryptographic security
 * - No ambiguous characters (0, 1, O, I, L)
 * - Sufficient entropy for collision resistance
 */

// Character set: 24 characters (A-Z excluding O, I, L + 2-9)
const RECOVERY_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 12 // 12 characters (plus 2 hyphens)
const SEGMENT_LENGTH = 4 // XXXX-XXXX-XXXX format

/**
 * Generate a cryptographically secure recovery code
 *
 * @returns Recovery code in format XXXX-XXXX-XXXX
 *
 * @example
 * const code = generateRecoveryCode()
 * // Returns: "AB2C-XY73-MN89"
 */
export function generateRecoveryCode(): string {
  // Generate cryptographically secure random bytes
  // We need at least CODE_LENGTH bytes for sufficient randomness
  const bytes = randomBytes(CODE_LENGTH)

  // Convert bytes to characters from our character set
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    // Use modulo to map byte value to character set index
    const index = bytes[i] % RECOVERY_CODE_CHARS.length
    code += RECOVERY_CODE_CHARS[index]
  }

  // Format as XXXX-XXXX-XXXX
  const segments = []
  for (let i = 0; i < CODE_LENGTH; i += SEGMENT_LENGTH) {
    segments.push(code.substring(i, i + SEGMENT_LENGTH))
  }

  return segments.join('-')
}

/**
 * Validate recovery code format
 *
 * @param code - Recovery code to validate
 * @returns true if code matches expected format
 *
 * @example
 * isValidRecoveryCodeFormat("AB2C-XY73-MN89") // true
 * isValidRecoveryCodeFormat("invalid") // false
 */
export function isValidRecoveryCodeFormat(code: string): boolean {
  // Check length (14 characters including hyphens)
  if (code.length !== 14) {
    return false
  }

  // Check format: XXXX-XXXX-XXXX
  const pattern = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/
  return pattern.test(code)
}

/**
 * Normalize recovery code by removing whitespace and converting to uppercase
 * This allows users to enter codes with or without hyphens, lowercase, etc.
 *
 * @param input - User input recovery code
 * @returns Normalized code in XXXX-XXXX-XXXX format or null if invalid
 *
 * @example
 * normalizeRecoveryCode("ab2cxy73mn89") // "AB2C-XY73-MN89"
 * normalizeRecoveryCode("AB2C XY73 MN89") // "AB2C-XY73-MN89"
 * normalizeRecoveryCode("invalid") // null
 */
export function normalizeRecoveryCode(input: string): string | null {
  // Remove whitespace and hyphens, convert to uppercase
  const cleaned = input.replace(/[\s-]/g, '').toUpperCase()

  // Check if cleaned version has exactly 12 characters
  if (cleaned.length !== CODE_LENGTH) {
    return null
  }

  // Check if all characters are in our character set
  for (const char of cleaned) {
    if (!RECOVERY_CODE_CHARS.includes(char)) {
      return null
    }
  }

  // Format as XXXX-XXXX-XXXX
  const segments = []
  for (let i = 0; i < CODE_LENGTH; i += SEGMENT_LENGTH) {
    segments.push(cleaned.substring(i, i + SEGMENT_LENGTH))
  }

  return segments.join('-')
}
