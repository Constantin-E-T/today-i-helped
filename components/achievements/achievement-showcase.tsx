'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AchievementBadge } from './achievement-badge'
import { Trophy } from 'lucide-react'
import type { Achievement } from '@prisma/client'

interface AchievementShowcaseProps {
  achievements: Array<{
    achievement: Achievement
    earnedAt: Date
  }>
  maxDisplay?: number
}

/**
 * AchievementShowcase Component
 * Displays recently earned achievements in a horizontal scroll
 * Perfect for dashboard and profile headers
 */
export function AchievementShowcase({
  achievements,
  maxDisplay = 5,
}: AchievementShowcaseProps) {
  const displayAchievements = achievements.slice(0, maxDisplay)

  if (displayAchievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Complete actions to earn your first achievement!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {displayAchievements.map(({ achievement, earnedAt }) => (
            <div key={achievement.id} className="flex-shrink-0 w-[200px]">
              <AchievementBadge
                name={achievement.name}
                description={achievement.description}
                badgeIcon={achievement.badgeIcon}
                isEarned={true}
                earnedAt={earnedAt}
                size="sm"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
