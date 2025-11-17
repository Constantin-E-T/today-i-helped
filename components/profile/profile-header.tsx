import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Calendar, Heart, Flame, Award } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/date-utils'
import type { User } from '@prisma/client'

interface ProfileHeaderProps {
  user: User
  stats: {
    totalActions: number
    currentStreak: number
    longestStreak: number
    clapsReceived: number
    daysSinceJoined: number
    categoriesHelped: number
  }
}

/**
 * ProfileHeader Component
 * Displays user's profile information at the top of their public profile
 * Shows avatar, username, join date, and key stats
 */
export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  const joinedDate = new Date(user.createdAt)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <UserAvatar username={user.username} size="xl" className="flex-shrink-0" />

          {/* User Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {user.username}
              </h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-xs">Total Actions</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.totalActions}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs">Current Streak</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs">Claps Received</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.clapsReceived}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-xs">Days Active</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.daysSinceJoined}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
