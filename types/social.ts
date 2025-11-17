/**
 * User info for avatar stacks and spotlights
 */
export interface UserInfo {
  id: string
  username: string
  avatarUrl?: string | null
  totalActions?: number
  currentStreak?: number
  clapsReceived?: number
}

/**
 * Avatar stack configuration
 */
export interface AvatarStackProps {
  users: UserInfo[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
  onUserClick?: (userId: string) => void
  showTooltip?: boolean
}

/**
 * User spotlight data
 */
export interface UserSpotlightData {
  user: UserInfo
  highlightReason: string
  stats: {
    totalActions: number
    currentStreak: number
    categoriesHelped: number
  }
  recentAchievement?: {
    name: string
    badgeIcon: string
  }
}

/**
 * Community stats for banner
 */
export interface CommunityStats {
  todayActions: number
  weekActions: number
  activeUsers: UserInfo[]
  trendingCategory?: string
  categoryStats?: {
    category: string
    count: number
    topUsers: UserInfo[]
  }[]
}

/**
 * Top contributor data
 */
export interface TopContributor extends UserInfo {
  rank: number
  actionsThisWeek: number
  badge?: string
}
