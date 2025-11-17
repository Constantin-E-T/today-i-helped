'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { ClapButton } from './clap-button'
import { formatRelativeTime } from '@/lib/date-utils'
import { generateAvatarColors, getInitials } from '@/lib/avatar-utils'
import { getCategoryConfig } from '@/lib/constants'
import type { Category } from '@prisma/client'

export interface ActionCardData {
  id: string
  customText: string | null
  category: Category
  clapsCount: number
  completedAt: Date | string
  hasClapped: boolean
  user: {
    username: string
    avatarSeed: string
  }
  challenge: {
    text: string
    category: Category
  } | null
}

interface ActionCardProps {
  action: ActionCardData
}

/**
 * Action Card Component
 *
 * Displays a single action in the community feed with:
 * - User avatar with consistent gradient colors
 * - Username and action description
 * - Category badge with icon and color
 * - Relative timestamp
 * - Clap button with count
 * - Mobile-optimized layout
 */
export function ActionCard({ action }: ActionCardProps) {
  const { user, challenge, customText, category, completedAt, hasClapped, clapsCount } = action

  // Generate consistent avatar colors based on username
  const avatarColors = generateAvatarColors(user.username)
  const initials = getInitials(user.username)

  // Get category config for badge styling
  const categoryConfig = getCategoryConfig(category)

  // Get action text (custom text or challenge text)
  const actionText = customText || challenge?.text || 'helped someone today'

  // Generate inline SVG avatar
  const svgAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${user.username.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${avatarColors.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${avatarColors.to};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" fill="url(#grad-${user.username.replace(/[^a-zA-Z0-9]/g, '')})" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="48"
        font-weight="600"
        fill="${avatarColors.text}"
      >${initials}</text>
    </svg>`
  )}`

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="py-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={svgAvatar} alt={user.username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Username + Category Badge */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground text-sm">
                  {user.username}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                  style={{
                    color: categoryConfig.textColor === 'text-blue-600' ? '#2563eb' :
                           categoryConfig.textColor === 'text-green-600' ? '#16a34a' :
                           categoryConfig.textColor === 'text-emerald-600' ? '#059669' :
                           categoryConfig.textColor === 'text-purple-600' ? '#9333ea' : '#4b5563',
                    backgroundColor: categoryConfig.textColor === 'text-blue-600' ? '#dbeafe' :
                                    categoryConfig.textColor === 'text-green-600' ? '#dcfce7' :
                                    categoryConfig.textColor === 'text-emerald-600' ? '#d1fae5' :
                                    categoryConfig.textColor === 'text-purple-600' ? '#f3e8ff' : '#f3f4f6',
                    borderColor: categoryConfig.textColor === 'text-blue-600' ? '#bfdbfe' :
                                categoryConfig.textColor === 'text-green-600' ? '#bbf7d0' :
                                categoryConfig.textColor === 'text-emerald-600' ? '#a7f3d0' :
                                categoryConfig.textColor === 'text-purple-600' ? '#e9d5ff' : '#e5e7eb',
                  }}
                >
                  <span>{categoryConfig.icon}</span>
                  <span>{categoryConfig.label}</span>
                </span>
              </div>
            </div>

            {/* Action Text */}
            <p className="text-sm text-foreground mb-2 leading-relaxed">
              {actionText}
            </p>

            {/* Footer: Timestamp + Clap Button */}
            <div className="flex items-center justify-between gap-2">
              <time
                dateTime={new Date(completedAt).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatRelativeTime(completedAt)}
              </time>

              <ClapButton
                actionId={action.id}
                initialClapsCount={clapsCount}
                initialHasClapped={hasClapped}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
