"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { AvatarStackProps, UserInfo } from "@/types/social";

/**
 * Avatar Stack Component
 *
 * Displays overlapping user avatars with hover effects and tooltips.
 * Shows up to max users, with "+X more" for overflow.
 *
 * Features:
 * - Stacked overlapping avatars
 * - Hover effects with user details
 * - Size variants (sm, md, lg)
 * - Click handlers
 * - Responsive design
 */
export function AvatarStack({
  users,
  max = 5,
  size = "md",
  onUserClick,
  showTooltip = true,
}: AvatarStackProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const offsetClasses = {
    sm: "-ml-2",
    md: "-ml-3",
    lg: "-ml-4",
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const handleUserClick = (user: UserInfo) => {
    if (onUserClick) {
      onUserClick(user.id);
    }
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div className="flex items-center -space-x-2">
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            className="relative"
            style={{ zIndex: displayUsers.length - index }}
            onMouseEnter={() => showTooltip && setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Avatar
              className={cn(
                sizeClasses[size],
                "ring-2 ring-background cursor-pointer transition-all hover:scale-110 hover:z-50",
                onUserClick && "hover:ring-primary"
              )}
              onClick={() => handleUserClick(user)}
            >
              <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.username}
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
                {getUserInitials(user.username)}
              </AvatarFallback>
            </Avatar>

            {/* Tooltip on hover */}
            <AnimatePresence>
              {showTooltip && hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-50"
                >
                  <div className="bg-popover border border-border rounded-md shadow-lg p-3 min-w-[160px]">
                    <p className="font-medium text-sm text-foreground">
                      {user.username}
                    </p>
                    {(user.totalActions !== undefined ||
                      user.currentStreak !== undefined) && (
                      <div className="mt-1 space-y-1">
                        {user.totalActions !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            {user.totalActions}{" "}
                            {user.totalActions === 1 ? "action" : "actions"}
                          </p>
                        )}
                        {user.currentStreak !== undefined &&
                          user.currentStreak > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {user.currentStreak} day streak
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-border" />
                    <div className="border-4 border-transparent border-t-popover absolute top-0 left-1/2 -translate-x-1/2 -mt-px" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Remaining count */}
      {remainingCount > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            "flex items-center justify-center rounded-full ring-2 ring-background bg-muted text-muted-foreground font-medium"
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function AvatarStackCompact({
  users,
  max = 3,
}: {
  users: UserInfo[];
  max?: number;
}) {
  return <AvatarStack users={users} max={max} size="sm" showTooltip={false} />;
}
