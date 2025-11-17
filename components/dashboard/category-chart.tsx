'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { useTheme } from 'next-themes'
import { Category } from '@prisma/client'

interface CategoryChartProps {
  data: {
    category: Category
    count: number
  }[]
  title?: string
  description?: string
  variant?: 'bar' | 'pie'
  height?: number
}

// Category colors
const CATEGORY_COLORS = {
  [Category.PEOPLE]: 'hsl(var(--chart-1))',
  [Category.ANIMALS]: 'hsl(var(--chart-2))',
  [Category.ENVIRONMENT]: 'hsl(var(--chart-3))',
  [Category.COMMUNITY]: 'hsl(var(--chart-4))',
}

// Category display names
const CATEGORY_NAMES = {
  [Category.PEOPLE]: 'People',
  [Category.ANIMALS]: 'Animals',
  [Category.ENVIRONMENT]: 'Environment',
  [Category.COMMUNITY]: 'Community',
}

/**
 * Category Chart Component
 *
 * Displays category breakdown as bar or pie chart.
 * Features:
 * - Bar or pie chart variants
 * - Color-coded categories
 * - Responsive sizing
 * - Dark mode support
 */
export function CategoryChart({
  data,
  title = 'Actions by Category',
  description = 'Breakdown of your helpfulness',
  variant = 'bar',
  height = 300,
}: CategoryChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Transform data for charts
  const chartData = data.map((item) => ({
    category: CATEGORY_NAMES[item.category],
    count: item.count,
    fill: CATEGORY_COLORS[item.category],
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.category}</p>
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
          <p className="text-sm text-muted-foreground">No category data available</p>
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
        {variant === 'bar' ? (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="category"
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
              <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) =>
                  `${category}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="count"
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
