'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

/**
 * StreakCounter Component
 * Visual display of user's daily streak with progress bar
 * Shows current streak, longest streak, and motivational messaging
 */
export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  // Calculate next milestone
  const milestones = [3, 7, 14, 30, 60, 100]
  const nextMilestone = milestones.find((m) => m > currentStreak) || currentStreak + 10

  const progressToNextMilestone = (currentStreak / nextMilestone) * 100

  // Get motivational message based on streak
  const getMessage = () => {
    if (currentStreak === 0) {
      return 'Complete an action today to start your streak!'
    }
    if (currentStreak === 1) {
      return 'Great start! Come back tomorrow to continue.'
    }
    if (currentStreak < 3) {
      return 'Keep it up! Building a habit takes consistency.'
    }
    if (currentStreak < 7) {
      return 'Impressive! You are building a solid habit.'
    }
    if (currentStreak < 30) {
      return 'Amazing dedication! Keep the momentum going.'
    }
    return 'Legendary streak! You are an inspiration to others.'
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          Daily Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg mb-3">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold">{currentStreak}</span>
              <span className="text-sm font-medium">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{getMessage()}</p>
        </div>

        {/* Progress to Next Milestone */}
        {currentStreak > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next milestone</span>
              <span className="font-medium text-foreground">
                {currentStreak}/{nextMilestone} days
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  'bg-gradient-to-r from-orange-400 to-red-500'
                )}
                style={{ width: `${Math.min(100, progressToNextMilestone)}%` }}
              />
            </div>
          </div>
        )}

        {/* Longest Streak */}
        {longestStreak > currentStreak && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Longest Streak</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
