import type { Achievement } from '@prisma/client'

/**
 * Achievement with progress tracking
 */
export interface AchievementWithProgress extends Achievement {
  isEarned: boolean
  currentProgress: number
  progressPercentage: number
  earnedAt?: Date
}

/**
 * Achievement notification data
 */
export interface AchievementNotification {
  achievement: Achievement
  isNew: boolean
  earnedAt: Date
  shareUrl?: string
}

/**
 * Achievement toast configuration
 */
export interface AchievementToastData {
  achievement: Achievement
  showConfetti?: boolean
  autoClose?: boolean
  duration?: number
}

/**
 * Achievement modal state
 */
export interface AchievementModalState {
  isOpen: boolean
  achievement: Achievement | null
  socialProof?: {
    totalEarned: number
    recentEarners: Array<{
      username: string
      earnedAt: Date
    }>
  }
}

/**
 * Achievement category for filtering
 */
export type AchievementCategory = 'MILESTONE' | 'STREAK' | 'CATEGORY' | 'COMMUNITY'

/**
 * Achievement progress group
 */
export interface AchievementProgressGroup {
  category: AchievementCategory
  achievements: AchievementWithProgress[]
  totalEarned: number
  totalAvailable: number
}
