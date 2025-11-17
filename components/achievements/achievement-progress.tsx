'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AchievementWithProgress } from '@/types/achievements'

interface AchievementProgressProps {
  achievement: AchievementWithProgress
  onClick?: () => void
  variant?: 'default' | 'compact'
}

/**
 * Achievement Progress Indicator
 *
 * Shows progress toward earning an achievement:
 * - Progress bar with percentage
 * - Current/required count
 * - Achievement details
 * - Click to view more
 */
export function AchievementProgress({
  achievement,
  onClick,
  variant = 'default',
}: AchievementProgressProps) {
  const isEarned = achievement.isEarned
  const progress = Math.min(100, achievement.progressPercentage)

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
          onClick && 'cursor-pointer'
        )}
        onClick={onClick}
      >
        <div className="text-3xl">{achievement.badgeIcon}</div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{achievement.name}</p>
            {isEarned && (
              <Badge variant="default" className="text-xs">
                Earned
              </Badge>
            )}
          </div>
          <Progress value={progress} variant={isEarned ? 'success' : 'default'} size="sm" />
          <p className="text-xs text-muted-foreground">
            {achievement.currentProgress} / {achievement.requirement}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:border-primary',
        isEarned && 'border-green-500/50 bg-green-500/5'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{achievement.badgeIcon}</div>
            <div>
              <CardTitle className="text-base">{achievement.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {achievement.description}
              </CardDescription>
            </div>
          </div>
          {isEarned ? (
            <Badge variant="default" className="bg-green-500">
              <Trophy className="h-3 w-3 mr-1" />
              Earned
            </Badge>
          ) : (
            <Badge variant="outline">
              <TrendingUp className="h-3 w-3 mr-1" />
              In Progress
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress
          value={progress}
          variant={isEarned ? 'success' : 'default'}
          showLabel
          label={`${achievement.currentProgress} / ${achievement.requirement}`}
        />
        {!isEarned && achievement.currentProgress < achievement.requirement && (
          <p className="text-xs text-muted-foreground">
            {achievement.requirement - achievement.currentProgress} more to unlock!
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Achievement Progress List
 *
 * Displays multiple achievement progress cards
 */
interface AchievementProgressListProps {
  achievements: AchievementWithProgress[]
  onAchievementClick?: (achievement: AchievementWithProgress) => void
  variant?: 'default' | 'compact'
  maxDisplay?: number
}

export function AchievementProgressList({
  achievements,
  onAchievementClick,
  variant = 'default',
  maxDisplay,
}: AchievementProgressListProps) {
  const displayAchievements = maxDisplay
    ? achievements.slice(0, maxDisplay)
    : achievements

  // Sort: in-progress with highest percentage first, then earned
  const sortedAchievements = [...displayAchievements].sort((a, b) => {
    if (a.isEarned && !b.isEarned) return 1
    if (!a.isEarned && b.isEarned) return -1
    return b.progressPercentage - a.progressPercentage
  })

  return (
    <div className={cn('space-y-3', variant === 'compact' && 'space-y-2')}>
      {sortedAchievements.map((achievement) => (
        <AchievementProgress
          key={achievement.id}
          achievement={achievement}
          onClick={() => onAchievementClick?.(achievement)}
          variant={variant}
        />
      ))}
    </div>
  )
}
