'use client'

import { useEffect } from 'react'
import { Trophy, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { Achievement } from '@prisma/client'

/**
 * Custom Achievement Toast Content
 *
 * Displays achievement unlock with confetti celebration.
 * Used with sonner toast library.
 */
export function AchievementToastContent({
  achievement,
  showConfetti = true,
}: {
  achievement: Achievement
  showConfetti?: boolean
}) {
  useEffect(() => {
    if (showConfetti) {
      // Trigger confetti animation
      const duration = 2000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [showConfetti])

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Trophy className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">Achievement Unlocked!</p>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
        <p className="font-medium text-foreground">{achievement.name}</p>
        <p className="text-xs text-muted-foreground">{achievement.description}</p>
      </div>
      <div className="text-4xl">{achievement.badgeIcon}</div>
    </div>
  )
}
