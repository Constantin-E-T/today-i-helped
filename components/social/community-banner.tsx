'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AvatarStack } from './avatar-stack'
import { TrendingUp, Users, Heart, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CommunityStats } from '@/types/social'

interface CommunityBannerProps {
  stats: CommunityStats
  onViewAll?: () => void
  onCategoryClick?: (category: string) => void
}

/**
 * Community Banner Component
 *
 * Displays community-wide statistics and highlights:
 * - Today's/week's action counts
 * - Active users with avatar stack
 * - Trending category
 * - Interactive filters
 */
export function CommunityBanner({ stats, onViewAll, onCategoryClick }: CommunityBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Community Impact
                </h3>
              </div>
              {onViewAll && (
                <Button variant="ghost" size="sm" onClick={onViewAll}>
                  View All
                </Button>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Today's Actions */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.todayActions.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    acts of kindness today
                  </p>
                </div>
              </div>

              {/* Week's Actions */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.weekActions.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    this week
                  </p>
                </div>
              </div>

              {/* Active Community */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <AvatarStack users={stats.activeUsers} max={5} size="sm" />
                  <p className="text-xs text-muted-foreground mt-1">
                    active helpers today
                  </p>
                </div>
              </div>
            </div>

            {/* Trending Category */}
            {stats.trendingCategory && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {stats.trendingCategory}
                  </span>{' '}
                  is the most popular category today
                </p>
                {onCategoryClick && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => onCategoryClick(stats.trendingCategory!)}
                  >
                    Explore
                  </Button>
                )}
              </div>
            )}

            {/* Category Stats (if available) */}
            {stats.categoryStats && stats.categoryStats.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {stats.categoryStats.map((cat) => (
                  <Badge
                    key={cat.category}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onCategoryClick?.(cat.category)}
                  >
                    {cat.category}: {cat.count}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * Compact Community Stats
 *
 * Smaller version for use in feed or sidebars
 */
export function CommunityStatsCompact({ stats }: { stats: CommunityStats }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          {stats.todayActions} today
        </span>
      </div>
      <div className="flex items-center gap-2">
        <AvatarStack users={stats.activeUsers} max={3} size="sm" showTooltip={false} />
        <span className="text-xs text-muted-foreground">
          {stats.activeUsers.length} active
        </span>
      </div>
    </div>
  )
}
