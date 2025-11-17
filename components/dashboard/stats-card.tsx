import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StatCardData } from '@/types/dashboard'

interface StatsCardProps {
  stat: StatCardData
  className?: string
}

/**
 * Stats Card Component
 *
 * Displays a single statistic with:
 * - Icon
 * - Value
 * - Label
 * - Optional trend indicator
 * - Color variants
 */
export function StatsCard({ stat, className }: StatsCardProps) {
  const Icon = stat.icon

  const colorClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
  }

  const iconBgClasses = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-yellow-500/10 text-yellow-500',
  }

  const color = stat.color || 'default'

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.label}
        </CardTitle>
        <div className={cn('p-2 rounded-full', iconBgClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <div className={cn('text-2xl font-bold', colorClasses[color])}>
              {stat.value}
            </div>
            {stat.trend && (
              <Badge
                variant={stat.trend.isPositive ? 'default' : 'secondary'}
                className={cn(
                  'text-xs',
                  stat.trend.isPositive
                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                )}
              >
                {stat.trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stat.trend.value)}%
              </Badge>
            )}
          </div>
          {stat.description && (
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Stats Grid Component
 *
 * Displays multiple stat cards in a responsive grid
 */
interface StatsGridProps {
  stats: StatCardData[]
  columns?: 2 | 3 | 4
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridClasses[columns])}>
      {stats.map((stat, index) => (
        <StatsCard key={index} stat={stat} />
      ))}
    </div>
  )
}
