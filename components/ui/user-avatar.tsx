'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { generateAvatarUrl, getInitials } from '@/lib/avatar-utils'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  username: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

/**
 * UserAvatar Component
 * Displays a generated avatar based on username with gradient background
 * Falls back to initials if image fails to load
 */
export function UserAvatar({ username, className, size = 'md' }: UserAvatarProps) {
  const avatarUrl = React.useMemo(() => generateAvatarUrl(username), [username])
  const initials = React.useMemo(() => getInitials(username), [username])

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatarUrl} alt={`${username}'s avatar`} />
      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
