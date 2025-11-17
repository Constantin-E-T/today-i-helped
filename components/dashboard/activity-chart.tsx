'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useTheme } from 'next-themes'
import type { ActivityChartData } from '@/types/dashboard'

interface ActivityChartProps {
  data: ActivityChartData[]
  title?: string
  description?: string
  height?: number
}

/**
 * Activity Chart Component
 *
 * Displays actions over time using an area chart.
 * Features:
 * - Responsive sizing
 * - Dark mode support
 * - Smooth animations
 * - Interactive tooltips
 */
export function ActivityChart({
  data,
  title = 'Activity Over Time',
  description = 'Your actions in the last 30 days',
  height = 300,
}: ActivityChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-sm font-medium">{formatDate(payload[0].payload.date)}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} {payload[0].value === 1 ? 'action' : 'actions'}
          </p>
        </div>
      )
    }
    return null
  }

  // Handle empty data
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No activity data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'hsl(var(--border))' : 'hsl(var(--border))'}
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke={isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))'}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))'}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="actions"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorActions)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
