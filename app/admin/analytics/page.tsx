import { redirect } from 'next/navigation'
import { getCurrentUserId, isUserAdmin } from '@/lib/admin'
import { getAnalyticsData } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, BarChart3, TrendingUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import CategoryChart from '@/components/admin/CategoryChart'
import TopChallengesTable from '@/components/admin/TopChallengesTable'

export const metadata = {
  title: 'Platform Analytics',
  description: 'View usage trends and growth metrics',
}

async function AnalyticsAdminPage() {
  // Check if user is authenticated
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/')
  }

  // Check if user is admin
  const isAdmin = await isUserAdmin(userId)
  if (!isAdmin) {
    redirect('/')
  }

  // Fetch analytics data for last 30 days
  const analyticsResult = await getAnalyticsData(30)

  if (!analyticsResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analyticsResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { dailyStats, categoryBreakdown, topChallenges } = analyticsResult.data

  // Calculate total actions from category breakdown
  const totalActions = Object.values(categoryBreakdown).reduce((sum, count) => sum + count, 0)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Platform Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            View usage trends, charts, and growth metrics
          </p>
        </div>
      </div>

      <Separator />

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">People Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {categoryBreakdown.PEOPLE.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActions > 0
                ? `${((categoryBreakdown.PEOPLE / totalActions) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Animals Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {categoryBreakdown.ANIMALS.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActions > 0
                ? `${((categoryBreakdown.ANIMALS / totalActions) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Environment + Community</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {(categoryBreakdown.ENVIRONMENT + categoryBreakdown.COMMUNITY).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActions > 0
                ? `${(
                    ((categoryBreakdown.ENVIRONMENT + categoryBreakdown.COMMUNITY) /
                      totalActions) *
                    100
                  ).toFixed(1)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Category Distribution
          </CardTitle>
          <CardDescription>Actions breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryChart categoryBreakdown={categoryBreakdown} />
        </CardContent>
      </Card>

      {/* Top Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Challenges</CardTitle>
          <CardDescription>
            Most completed challenges ranked by usage and average claps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopChallengesTable challenges={topChallenges} />
        </CardContent>
      </Card>

      {/* Daily Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 30 Days)</CardTitle>
          <CardDescription>
            {dailyStats.length > 0
              ? `Showing ${dailyStats.length} days of activity data`
              : 'No activity data available for the selected period'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStats.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div>Date</div>
                <div className="text-right">Total</div>
                <div className="text-right">People</div>
                <div className="text-right">Animals</div>
                <div className="text-right">Env+Com</div>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-1">
                {dailyStats.slice(-10).reverse().map((stat, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 gap-2 text-sm py-2 hover:bg-muted/50 rounded px-2"
                  >
                    <div>
                      {new Date(stat.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-right font-medium">{stat.totalActions}</div>
                    <div className="text-right">{stat.peopleActions}</div>
                    <div className="text-right">{stat.animalsActions}</div>
                    <div className="text-right">
                      {stat.environmentActions + stat.communityActions}
                    </div>
                  </div>
                ))}
              </div>
              {dailyStats.length > 10 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Showing last 10 days. Total {dailyStats.length} days available.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No daily statistics available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsAdminPage
