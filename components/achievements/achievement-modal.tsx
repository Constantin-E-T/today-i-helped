'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Share2, Trophy, Calendar, Users } from 'lucide-react'
import { formatRelativeTime } from '@/lib/date-utils'
import type { Achievement } from '@prisma/client'
import { AvatarStack } from '@/components/social/avatar-stack'
import type { UserInfo } from '@/types/social'

interface AchievementModalProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
  earnedAt?: Date
  socialProof?: {
    totalEarned: number
    recentEarners: UserInfo[]
  }
}

/**
 * Achievement Modal
 *
 * Detailed view of an achievement with:
 * - Large badge display
 * - Achievement details
 * - Earn date
 * - Social proof (how many others have it)
 * - Share functionality
 */
export function AchievementModal({
  achievement,
  isOpen,
  onClose,
  earnedAt,
  socialProof,
}: AchievementModalProps) {
  const [isSharing, setIsSharing] = useState(false)

  if (!achievement) return null

  const handleShare = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Achievement Unlocked: ${achievement.name}`,
          text: `I just earned the "${achievement.name}" badge on Today I Helped! ${achievement.description}`,
          url: window.location.origin,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `I just earned the "${achievement.name}" badge on Today I Helped! ${achievement.description}\n\n${window.location.origin}`
        )
        // Could show a toast here
      }
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievement Unlocked
          </DialogTitle>
          <DialogDescription>
            Congratulations on your achievement!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Large Badge Display */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="text-8xl animate-bounce">{achievement.badgeIcon}</div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                {achievement.name}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {achievement.description}
              </p>
            </div>
          </div>

          <Separator />

          {/* Achievement Details */}
          <div className="space-y-3">
            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Category</span>
              <Badge variant="secondary">{achievement.category}</Badge>
            </div>

            {/* Requirement */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Requirement</span>
              <span className="text-sm font-medium">{achievement.requirement}</span>
            </div>

            {/* Earned Date */}
            {earnedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Earned
                </span>
                <span className="text-sm font-medium">
                  {formatRelativeTime(earnedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Social Proof */}
          {socialProof && socialProof.totalEarned > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {socialProof.totalEarned.toLocaleString()}{' '}
                    {socialProof.totalEarned === 1 ? 'person has' : 'people have'} earned this
                  </span>
                </div>

                {socialProof.recentEarners.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Recent earners:</span>
                    <AvatarStack
                      users={socialProof.recentEarners}
                      max={5}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Share Button */}
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full"
            variant="outline"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Achievement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
