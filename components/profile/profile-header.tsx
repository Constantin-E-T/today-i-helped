import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Calendar, Heart, Flame, Award } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import type { User } from "@prisma/client";

interface ProfileHeaderProps {
  user: User;
  stats: {
    totalActions: number;
    currentStreak: number;
    longestStreak: number;
    clapsReceived: number;
    daysSinceJoined: number;
    categoriesHelped: number;
  };
}

/**
 * ProfileHeader Component
 *
 * Modern profile header featuring:
 * - Large avatar display
 * - User information and join date
 * - Prominent stats display
 * - Fully responsive design
 * - Card-based layout
 */
export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  const joinedDate = new Date(user.createdAt);

  return (
    <Card className="border-2">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <UserAvatar username={user.username} size="xl" className="shrink-0" />

          {/* User Info */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {user.username}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {joinedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-rose-500/10">
                    <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <span className="text-xs font-medium">Total Actions</span>
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {stats.totalActions}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                    <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs font-medium">Current Streak</span>
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {stats.currentStreak}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-medium">Claps Received</span>
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {stats.clapsReceived}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium">Days Active</span>
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {stats.daysSinceJoined}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
