/**
 * Client-side cookie management utilities for authentication
 * Simple cookie-based session management for the recovery code system
 *
 * SECURITY NOTE: These cookies are set by the client and should NOT be trusted
 * for authorization. Server Actions MUST verify userId using server-side cookies.
 */

const USER_ID_COOKIE = 'tih_user_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

/**
 * Get user ID from cookies (client-side only)
 * WARNING: Do not use this for authorization - client cookies can be manipulated
 */
export function getUserIdFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  const userIdCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${USER_ID_COOKIE}=`)
  )

  if (!userIdCookie) {
    return null
  }

  const userId = userIdCookie.split('=')[1]
  return userId || null
}

/**
 * Set user ID cookie (client-side only)
 * Sets cookie with security flags for HTTPS and CSRF protection
 */
export function setUserIdCookie(userId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  // Determine if we should use secure flag (HTTPS only)
  const isProduction = process.env.NODE_ENV === 'production'
  const secureFlag = isProduction ? '; secure' : ''

  document.cookie = `${USER_ID_COOKIE}=${userId}; max-age=${COOKIE_MAX_AGE}; path=/; samesite=strict${secureFlag}`
}

/**
 * Clear user ID cookie (client-side only)
 */
export function clearUserIdCookie(): void {
  if (typeof window === 'undefined') {
    return
  }

  document.cookie = `${USER_ID_COOKIE}=; max-age=0; path=/; samesite=strict`
}
