/**
 * Avatar Utility Functions
 * Generate consistent, colorful avatars based on username
 */

/**
 * Simple string hash function for consistent color generation
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Generate a consistent color palette for a username
 */
export function generateAvatarColors(username: string): {
  from: string
  to: string
  text: string
} {
  const hash = hashString(username)

  // Predefined color palettes for consistency and visual appeal
  const colorPalettes = [
    { from: '#667eea', to: '#764ba2', text: '#ffffff' }, // Purple
    { from: '#f093fb', to: '#f5576c', text: '#ffffff' }, // Pink
    { from: '#4facfe', to: '#00f2fe', text: '#ffffff' }, // Cyan
    { from: '#43e97b', to: '#38f9d7', text: '#000000' }, // Green
    { from: '#fa709a', to: '#fee140', text: '#000000' }, // Sunset
    { from: '#30cfd0', to: '#330867', text: '#ffffff' }, // Ocean
    { from: '#a8edea', to: '#fed6e3', text: '#000000' }, // Pastel
    { from: '#ff9a56', to: '#ff6a88', text: '#ffffff' }, // Warm
    { from: '#ffecd2', to: '#fcb69f', text: '#000000' }, // Peach
    { from: '#ff6e7f', to: '#bfe9ff', text: '#000000' }, // Cotton Candy
  ]

  const paletteIndex = hash % colorPalettes.length
  return colorPalettes[paletteIndex]
}

/**
 * Get initials from username (max 2 characters)
 */
export function getInitials(username: string): string {
  const cleaned = username.trim()

  if (!cleaned) return '??'

  // If username contains spaces, use first letter of first two words
  const words = cleaned.split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  // Otherwise, use first two letters
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2).toUpperCase()
  }

  return cleaned[0].toUpperCase()
}

/**
 * Generate SVG data URL for avatar
 */
export function generateAvatarUrl(username: string): string {
  const colors = generateAvatarColors(username)
  const initials = getInitials(username)

  const svg = `
    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.to};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" fill="url(#grad)" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="48"
        font-weight="600"
        fill="${colors.text}"
      >${initials}</text>
    </svg>
  `.trim()

  // Convert SVG to data URL
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}
