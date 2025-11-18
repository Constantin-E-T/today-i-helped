'use client'

import { Badge } from '@/components/ui/badge'

interface CategoryChartProps {
  categoryBreakdown: {
    PEOPLE: number
    ANIMALS: number
    ENVIRONMENT: number
    COMMUNITY: number
  }
}

const CATEGORY_INFO = {
  PEOPLE: {
    label: 'People',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  ANIMALS: {
    label: 'Animals',
    color: 'bg-green-500',
    lightColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  ENVIRONMENT: {
    label: 'Environment',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  },
  COMMUNITY: {
    label: 'Community',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
}

export default function CategoryChart({ categoryBreakdown }: CategoryChartProps) {
  const total = Object.values(categoryBreakdown).reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available yet. Start by completing some challenges!
      </div>
    )
  }

  const categories = Object.entries(categoryBreakdown).map(([category, count]) => ({
    category: category as keyof typeof CATEGORY_INFO,
    count,
    percentage: (count / total) * 100,
  }))

  // Sort by count descending
  categories.sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      {/* Horizontal Bar Chart */}
      <div className="space-y-3">
        {categories.map(({ category, count, percentage }) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <Badge variant="secondary" className={CATEGORY_INFO[category].lightColor}>
                {CATEGORY_INFO[category].label}
              </Badge>
              <span className="text-muted-foreground">
                {count.toLocaleString()} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${CATEGORY_INFO[category].color} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Actions</p>
            <p className="text-2xl font-bold">{total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Most Popular</p>
            <p className="text-2xl font-bold">
              {CATEGORY_INFO[categories[0].category].label}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
