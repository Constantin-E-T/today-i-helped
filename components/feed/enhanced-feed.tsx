'use client'

import { FeedContainer } from './feed-container'
import { CommunityStatsCompact } from '@/components/social/community-banner'
import { UserSpotlight } from '@/components/social/user-spotlight'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvatarStack } from '@/components/social/avatar-stack'
import { TrendingUp, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { ActionCardData } from './action-card'
import type { CommunityStats, UserSpotlightData } from '@/types/social'

interface EnhancedFeedProps {
  initialActions: ActionCardData[]
  currentUserId?: string | null
  communityStats?: CommunityStats
  trendingActions?: ActionCardData[]
  userSpotlight?: UserSpotlightData
}

/**
 * Enhanced Feed Component
 *
 * Wraps the existing FeedContainer with social UX enhancements:
 * - Community stats banner
 * - Trending actions highlight
 * - User spotlight cards (inserted every ~10 items)
 * - Category badges
 * - Maintains infinite scroll and auto-refresh from FeedContainer
 */
export function EnhancedFeed({
  initialActions,
  currentUserId,
  communityStats,
  trendingActions,
  userSpotlight,
}: EnhancedFeedProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Community Stats Banner */}
      {communityStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CommunityStatsCompact stats={communityStats} />
        </motion.div>
      )}

      {/* Trending Actions Section */}
      {trendingActions && trendingActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Trending Actions
                </CardTitle>
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              </div>
              <CardDescription>Most appreciated acts of kindness this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingActions.slice(0, 3).map((action) => {
                  const actionText = action.customText || action.challenge?.text || 'helped someone today'
                  return (
                    <div
                      key={action.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/action/${action.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{actionText}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            by @{action.user.username}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {action.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-primary font-medium">{action.clapsCount}</span>
                        <span className="text-muted-foreground">claps</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User Spotlight */}
      {userSpotlight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <UserSpotlight
            data={userSpotlight}
            onViewProfile={(username) => router.push(`/profile/${username}`)}
            variant="compact"
          />
        </motion.div>
      )}

      {/* Main Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Actions</h2>
          {communityStats && communityStats.activeUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <AvatarStack
                users={communityStats.activeUsers}
                max={5}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Existing Feed Container with infinite scroll */}
        <FeedContainer
          initialActions={initialActions}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}
