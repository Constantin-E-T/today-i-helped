/**
 * Achievement Definitions and Logic
 *
 * Defines all available achievements/badges in the "Today I Helped" platform.
 * Achievements are organized into categories:
 * - STARTER: Onboarding achievements
 * - STREAK: Consecutive day streaks
 * - IMPACT: Total action milestones
 * - CATEGORY: Category-specific achievements
 */

export type AchievementCategory = 'STARTER' | 'STREAK' | 'IMPACT' | 'CATEGORY'

export interface AchievementDefinition {
  key: string
  name: string
  description: string
  badgeIcon: string // Lucide icon name
  category: AchievementCategory
  requirement: number
  order: number
}

/**
 * All available achievements in the platform
 * These will be seeded into the database
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // STARTER Achievements - First steps
  {
    key: 'FIRST_ACTION',
    name: 'First Helper',
    description: 'Complete your very first act of kindness',
    badgeIcon: 'Sparkles',
    category: 'STARTER',
    requirement: 1,
    order: 1,
  },
  {
    key: 'FIRST_WEEK',
    name: 'Week One',
    description: 'Been helping for a full week',
    badgeIcon: 'Calendar',
    category: 'STARTER',
    requirement: 1,
    order: 2,
  },
  {
    key: 'CATEGORY_EXPLORER',
    name: 'Category Explorer',
    description: 'Complete actions in all four categories',
    badgeIcon: 'Compass',
    category: 'STARTER',
    requirement: 4,
    order: 3,
  },

  // STREAK Achievements - Consecutive days
  {
    key: 'STREAK_3',
    name: '3-Day Streak',
    description: 'Help others for 3 consecutive days',
    badgeIcon: 'Flame',
    category: 'STREAK',
    requirement: 3,
    order: 10,
  },
  {
    key: 'STREAK_7',
    name: '7-Day Streak',
    description: 'Help others for 7 consecutive days',
    badgeIcon: 'Zap',
    category: 'STREAK',
    requirement: 7,
    order: 11,
  },
  {
    key: 'STREAK_30',
    name: '30-Day Streak',
    description: 'Help others for 30 consecutive days',
    badgeIcon: 'Crown',
    category: 'STREAK',
    requirement: 30,
    order: 12,
  },

  // IMPACT Achievements - Total actions
  {
    key: 'HELPER',
    name: 'Helper',
    description: 'Complete 10 acts of kindness',
    badgeIcon: 'Heart',
    category: 'IMPACT',
    requirement: 10,
    order: 20,
  },
  {
    key: 'CHAMPION',
    name: 'Champion',
    description: 'Complete 25 acts of kindness',
    badgeIcon: 'Award',
    category: 'IMPACT',
    requirement: 25,
    order: 21,
  },
  {
    key: 'HERO',
    name: 'Hero',
    description: 'Complete 50 acts of kindness',
    badgeIcon: 'Trophy',
    category: 'IMPACT',
    requirement: 50,
    order: 22,
  },
  {
    key: 'LEGEND',
    name: 'Legend',
    description: 'Complete 100 acts of kindness',
    badgeIcon: 'Star',
    category: 'IMPACT',
    requirement: 100,
    order: 23,
  },

  // CATEGORY Achievements - Category-specific
  {
    key: 'PEOPLE_HELPER',
    name: 'People Helper',
    description: 'Complete 10 actions helping people',
    badgeIcon: 'Users',
    category: 'CATEGORY',
    requirement: 10,
    order: 30,
  },
  {
    key: 'ANIMAL_FRIEND',
    name: 'Animal Friend',
    description: 'Complete 10 actions helping animals',
    badgeIcon: 'Dog',
    category: 'CATEGORY',
    requirement: 10,
    order: 31,
  },
  {
    key: 'ECO_WARRIOR',
    name: 'Eco Warrior',
    description: 'Complete 10 environmental actions',
    badgeIcon: 'Leaf',
    category: 'CATEGORY',
    requirement: 10,
    order: 32,
  },
  {
    key: 'COMMUNITY_BUILDER',
    name: 'Community Builder',
    description: 'Complete 10 community actions',
    badgeIcon: 'Building',
    category: 'CATEGORY',
    requirement: 10,
    order: 33,
  },
]

/**
 * Get achievement definition by key
 */
export function getAchievementDefinition(key: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key)
}

/**
 * Get all achievements in a category
 */
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === category).sort((a, b) => a.order - b.order)
}

/**
 * Calculate which achievements a user should have based on their stats
 * This is used to check and award missing achievements
 */
export interface UserStats {
  totalActions: number
  currentStreak: number
  longestStreak: number
  categoryBreakdown: {
    PEOPLE: number
    ANIMALS: number
    ENVIRONMENT: number
    COMMUNITY: number
  }
  uniqueCategories: number
  daysSinceJoined: number
}

/**
 * Determine which achievements should be earned based on user stats
 */
export function calculateEarnedAchievements(stats: UserStats): string[] {
  const earned: string[] = []

  // STARTER Achievements
  if (stats.totalActions >= 1) {
    earned.push('FIRST_ACTION')
  }
  if (stats.daysSinceJoined >= 7) {
    earned.push('FIRST_WEEK')
  }
  if (stats.uniqueCategories >= 4) {
    earned.push('CATEGORY_EXPLORER')
  }

  // STREAK Achievements (use longestStreak to preserve past achievements)
  if (stats.longestStreak >= 3) {
    earned.push('STREAK_3')
  }
  if (stats.longestStreak >= 7) {
    earned.push('STREAK_7')
  }
  if (stats.longestStreak >= 30) {
    earned.push('STREAK_30')
  }

  // IMPACT Achievements
  if (stats.totalActions >= 10) {
    earned.push('HELPER')
  }
  if (stats.totalActions >= 25) {
    earned.push('CHAMPION')
  }
  if (stats.totalActions >= 50) {
    earned.push('HERO')
  }
  if (stats.totalActions >= 100) {
    earned.push('LEGEND')
  }

  // CATEGORY Achievements
  if (stats.categoryBreakdown.PEOPLE >= 10) {
    earned.push('PEOPLE_HELPER')
  }
  if (stats.categoryBreakdown.ANIMALS >= 10) {
    earned.push('ANIMAL_FRIEND')
  }
  if (stats.categoryBreakdown.ENVIRONMENT >= 10) {
    earned.push('ECO_WARRIOR')
  }
  if (stats.categoryBreakdown.COMMUNITY >= 10) {
    earned.push('COMMUNITY_BUILDER')
  }

  return earned
}
