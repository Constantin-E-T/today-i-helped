'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles,
  Calendar,
  Compass,
  Flame,
  Zap,
  Crown,
  Heart,
  Award,
  Trophy,
  Star,
  Users,
  Dog,
  Leaf,
  Building,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AchievementBadgeProps {
  name: string
  description: string
  badgeIcon: string
  isEarned?: boolean
  earnedAt?: Date
  currentProgress?: number
  requirement?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Calendar,
  Compass,
  Flame,
  Zap,
  Crown,
  Heart,
  Award,
  Trophy,
  Star,
  Users,
  Dog,
  Leaf,
  Building,
}

const sizeClasses = {
  sm: {
    card: 'p-3',
    icon: 'h-8 w-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    card: 'p-4',
    icon: 'h-12 w-12',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    card: 'p-6',
    icon: 'h-16 w-16',
    title: 'text-lg',
    description: 'text-base',
  },
}

/**
 * AchievementBadge Component
 * Displays a single achievement/badge with icon, name, and description
 * Shows earned status, progress bar, and optional earned date
 */
export function AchievementBadge({
  name,
  description,
  badgeIcon,
  isEarned = false,
  earnedAt,
  currentProgress,
  requirement,
  size = 'md',
  className,
}: AchievementBadgeProps) {
  const Icon = iconMap[badgeIcon] || Trophy
  const sizes = sizeClasses[size]

  const showProgress = !isEarned && currentProgress !== undefined && requirement !== undefined
  const progressPercentage = showProgress
    ? Math.min(100, (currentProgress / requirement) * 100)
    : 0

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isEarned
          ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm hover:shadow-md'
          : 'border-muted bg-muted/20 opacity-75 hover:opacity-90',
        className
      )}
    >
      <CardContent className={cn('flex flex-col items-center text-center', sizes.card)}>
        {/* Badge Icon */}
        <div
          className={cn(
            'rounded-full p-3 mb-3 transition-colors',
            isEarned
              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className={sizes.icon} />
        </div>

        {/* Badge Name */}
        <h3 className={cn('font-semibold text-foreground mb-1', sizes.title)}>{name}</h3>

        {/* Badge Description */}
        <p className={cn('text-muted-foreground', sizes.description)}>{description}</p>

        {/* Earned Date */}
        {isEarned && earnedAt && (
          <p className="text-xs text-muted-foreground/70 mt-2">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {currentProgress}/{requirement}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Earned Indicator */}
        {isEarned && (
          <div className="absolute top-2 right-2">
            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
              Earned
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
