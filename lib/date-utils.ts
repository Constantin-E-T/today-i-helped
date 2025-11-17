/**
 * Date Utility Functions
 * Format dates and timestamps for the feed
 */

/**
 * Format a date as a relative time string ("2 hours ago", "yesterday", etc.)
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  // Just now (< 1 minute)
  if (diffSecs < 60) {
    return 'just now'
  }

  // Minutes ago (1-59 minutes)
  if (diffMins < 60) {
    return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`
  }

  // Hours ago (1-23 hours)
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  }

  // Yesterday (24-48 hours)
  if (diffDays === 1) {
    return 'yesterday'
  }

  // Days ago (2-6 days)
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }

  // Weeks ago (7-29 days)
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffDays < 30) {
    return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`
  }

  // Months ago (30-364 days)
  const diffMonths = Math.floor(diffDays / 30)
  if (diffDays < 365) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`
  }

  // Years ago (365+ days)
  const diffYears = Math.floor(diffDays / 365)
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`
}

/**
 * Format a date for display (e.g., "Mar 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date with time (e.g., "Mar 15, 2024 at 3:45 PM")
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
