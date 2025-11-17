import { Category } from '@prisma/client'

/**
 * Dashboard statistics with trends
 */
export interface DashboardStats {
  totalActions: number
  currentStreak: number
  longestStreak: number
  clapsReceived: number
  categoriesHelped: number
  daysSinceJoined: number
  trend?: {
    actions: number // percentage change
    claps: number
    streak: number
  }
}

/**
 * Chart data point for activity visualization
 */
export interface ActivityChartData {
  date: string
  actions: number
  category?: Category
}

/**
 * Category breakdown for charts
 */
export interface CategoryChartData {
  category: Category
  count: number
  percentage: number
}

/**
 * Stat card configuration
 */
export interface StatCardData {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  color?: 'default' | 'primary' | 'success' | 'warning'
}

/**
 * Time period for chart filtering
 */
export type TimePeriod = '7days' | '30days' | '90days' | 'all'

/**
 * Chart configuration options
 */
export interface ChartConfig {
  period: TimePeriod
  showGrid?: boolean
  animate?: boolean
  height?: number
}
