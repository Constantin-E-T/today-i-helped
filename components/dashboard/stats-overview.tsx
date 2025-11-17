import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Flame, Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsOverviewProps {
  totalActions: number
  currentStreak: number
  categoriesHelped: number
  daysSinceJoined: number
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number | string
  iconColor: string
  iconBg: string
}

function StatCard({ icon: Icon, label, value, iconColor, iconBg }: StatCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={cn('p-3 rounded-full', iconBg)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * StatsOverview Component
 * Displays user statistics in a grid of cards
 * Shows total actions, current streak, categories helped, and days active
 */
export function StatsOverview({
  totalActions,
  currentStreak,
  categoriesHelped,
  daysSinceJoined,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Heart}
        label="Total Actions"
        value={totalActions}
        iconColor="text-red-500"
        iconBg="bg-red-500/10"
      />
      <StatCard
        icon={Flame}
        label="Current Streak"
        value={currentStreak}
        iconColor="text-orange-500"
        iconBg="bg-orange-500/10"
      />
      <StatCard
        icon={Users}
        label="Categories Helped"
        value={`${categoriesHelped}/4`}
        iconColor="text-blue-500"
        iconBg="bg-blue-500/10"
      />
      <StatCard
        icon={Calendar}
        label="Days Active"
        value={daysSinceJoined}
        iconColor="text-green-500"
        iconBg="bg-green-500/10"
      />
    </div>
  )
}
