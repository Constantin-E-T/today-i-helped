import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/date-utils'
import { Category } from '@prisma/client'
import type { Action } from '@prisma/client'

interface RecentActionsProps {
  actions: Array<
    Action & {
      challenge: {
        text: string
        category: Category
      } | null
    }
  >
}

const categoryStyles = {
  PEOPLE: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  ANIMALS: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  ENVIRONMENT: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  COMMUNITY: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
}

/**
 * RecentActions Component
 * Displays timeline of user's recent completed actions
 * Shows action text, category, location, and time
 */
export function RecentActions({ actions }: RecentActionsProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No actions yet. Complete your first challenge to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="flex flex-col space-y-2 pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-foreground flex-1">
                  {action.customText || action.challenge?.text}
                </p>
                <Badge variant="outline" className={categoryStyles[action.category]}>
                  {action.category}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(action.completedAt)}
                </div>
                {action.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {action.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
