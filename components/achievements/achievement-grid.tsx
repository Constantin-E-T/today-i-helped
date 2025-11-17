import * as React from 'react'
import { AchievementBadge } from './achievement-badge'
import type { Achievement } from '@prisma/client'

interface AchievementWithProgress extends Achievement {
  isEarned?: boolean
  earnedAt?: Date
  currentProgress?: number
  progressPercentage?: number
}

interface AchievementGridProps {
  achievements: AchievementWithProgress[]
  category?: string
  emptyMessage?: string
}

/**
 * AchievementGrid Component
 * Displays a grid of achievement badges
 * Responsive layout that adapts to screen size
 */
export function AchievementGrid({
  achievements,
  category,
  emptyMessage = 'No achievements in this category yet.',
}: AchievementGridProps) {
  // Filter by category if provided
  const filteredAchievements = category
    ? achievements.filter((a) => a.category === category)
    : achievements

  if (filteredAchievements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAchievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          name={achievement.name}
          description={achievement.description}
          badgeIcon={achievement.badgeIcon}
          isEarned={achievement.isEarned}
          earnedAt={achievement.earnedAt}
          currentProgress={achievement.currentProgress}
          requirement={achievement.requirement}
        />
      ))}
    </div>
  )
}
