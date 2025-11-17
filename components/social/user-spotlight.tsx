'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Flame, Heart, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { UserSpotlightData } from '@/types/social'

interface UserSpotlightProps {
  data: UserSpotlightData
  onViewProfile?: (userId: string) => void
  variant?: 'default' | 'compact'
}

/**
 * User Spotlight Component
 *
 * Features an active community member with:
 * - User avatar and name
 * - Highlight reason
 * - Key stats
 * - Recent achievement
 * - View profile action
 */
export function UserSpotlight({ data, onViewProfile, variant = 'default' }: UserSpotlightProps) {
  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(data.user.id)
    }
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-yellow-500/20">
                <AvatarImage src={data.user.avatarUrl || undefined} alt={data.user.username} />
                <AvatarFallback className="bg-yellow-500/10 text-yellow-600 font-medium">
                  {getUserInitials(data.user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  @{data.user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {data.highlightReason}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewProfile}
                className="shrink-0"
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-yellow-500/10 border-yellow-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
              <Trophy className="h-3 w-3 mr-1" />
              Community Spotlight
            </Badge>
          </div>
          <CardTitle className="text-lg mt-2">Featured Helper</CardTitle>
          <CardDescription>{data.highlightReason}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-yellow-500/30">
              <AvatarImage src={data.user.avatarUrl || undefined} alt={data.user.username} />
              <AvatarFallback className="bg-yellow-500/10 text-yellow-600 font-bold text-xl">
                {getUserInitials(data.user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-foreground">
                @{data.user.username}
              </h4>
              {data.recentAchievement && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{data.recentAchievement.badgeIcon}</span>
                  <p className="text-xs text-muted-foreground">
                    {data.recentAchievement.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-background/50">
              <div className="flex items-center justify-center gap-1">
                <Heart className="h-3 w-3 text-primary" />
                <p className="text-lg font-bold text-foreground">
                  {data.stats.totalActions}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Actions</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <p className="text-lg font-bold text-foreground">
                  {data.stats.currentStreak}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <p className="text-lg font-bold text-foreground">
                  {data.stats.categoriesHelped}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>

          {/* View Profile Button */}
          <Button
            onClick={handleViewProfile}
            className="w-full"
            variant="secondary"
          >
            View Profile
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
