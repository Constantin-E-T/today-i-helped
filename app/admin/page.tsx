import { redirect } from 'next/navigation'
import { getCurrentUserId, isUserAdmin } from '@/lib/admin'
import { getDashboardStats } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  Activity,
  Target,
  TrendingUp,
  UserPlus,
  ThumbsUp,
  AlertCircle,
  BarChart3,
  Shield,
  Settings,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Platform management and content control',
}

async function AdminDashboardPage() {
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

  // Fetch dashboard statistics
  const statsResult = await getDashboardStats()

  if (!statsResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{statsResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = statsResult.data

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform management and content control
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Platform</Button>
        </Link>
      </div>

      <Separator />

      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.actionsToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChallenges}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claps</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClaps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.averageClapsPerAction.toFixed(1)} avg per action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/challenges">
            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Manage Challenges
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              User Directory
            </Button>
          </Link>
          <Link href="/admin/moderation">
            <Button className="w-full" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Content Moderation
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button className="w-full" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Today&apos;s Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <UserPlus className="h-4 w-4 text-green-500" />
                <span>New Users</span>
              </div>
              <span className="font-semibold">{stats.newUsersToday}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>Actions Completed</span>
              </div>
              <span className="font-semibold">{stats.actionsToday}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Status</span>
              <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">
                Operational
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Platform Status</span>
              <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">
                All Systems Go
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation to Other Admin Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Sections</CardTitle>
          <CardDescription>Navigate to different administrative areas</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Link
            href="/admin/challenges"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Challenge Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and manage daily challenges
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">User Management</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage user accounts and statistics
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/moderation"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Content Moderation</h3>
                <p className="text-sm text-muted-foreground">
                  Review and moderate user-generated content
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Platform Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  View usage trends, charts, and growth metrics
                </p>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboardPage
