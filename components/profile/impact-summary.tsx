import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Dog, Leaf, Building } from 'lucide-react'
import { Category } from '@prisma/client'
import { cn } from '@/lib/utils'

interface ImpactSummaryProps {
  categoryBreakdown: {
    PEOPLE: number
    ANIMALS: number
    ENVIRONMENT: number
    COMMUNITY: number
  }
  topCategory: Category | null
}

const categoryConfig = {
  PEOPLE: {
    icon: Users,
    label: 'People',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    bar: 'bg-blue-500',
  },
  ANIMALS: {
    icon: Dog,
    label: 'Animals',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    bar: 'bg-green-500',
  },
  ENVIRONMENT: {
    icon: Leaf,
    label: 'Environment',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    bar: 'bg-emerald-500',
  },
  COMMUNITY: {
    icon: Building,
    label: 'Community',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    bar: 'bg-purple-500',
  },
}

/**
 * ImpactSummary Component
 * Visualizes user's impact across different categories
 * Shows breakdown of actions by category with progress bars
 */
export function ImpactSummary({ categoryBreakdown, topCategory }: ImpactSummaryProps) {
  const totalActions = Object.values(categoryBreakdown).reduce((sum, count) => sum + count, 0)
  const maxCount = Math.max(...Object.values(categoryBreakdown), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" />
          Impact Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Category Highlight */}
        {topCategory && totalActions > 0 && (
          <div className={cn('p-4 rounded-lg', categoryConfig[topCategory].bg)}>
            <p className="text-sm text-muted-foreground mb-1">Top Category</p>
            <div className="flex items-center gap-2">
              {React.createElement(categoryConfig[topCategory].icon, {
                className: cn('h-5 w-5', categoryConfig[topCategory].color),
              })}
              <span className={cn('text-lg font-semibold', categoryConfig[topCategory].color)}>
                {categoryConfig[topCategory].label}
              </span>
              <span className="text-sm text-muted-foreground ml-auto">
                {categoryBreakdown[topCategory]} actions
              </span>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="space-y-3">
          {(Object.entries(categoryBreakdown) as [Category, number][]).map(
            ([category, count]) => {
              const config = categoryConfig[category]
              const Icon = config.icon
              const percentage = totalActions > 0 ? (count / maxCount) * 100 : 0

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <span className="font-medium text-foreground">{config.label}</span>
                    </div>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', config.bar)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            }
          )}
        </div>

        {totalActions === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No impact data yet. Complete actions to see your impact!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
