import { redirect } from 'next/navigation'
import { getCurrentUserId, isUserAdmin } from '@/lib/admin'
import { getAllUsers } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import UserList from '@/components/admin/UserList'

export const metadata = {
  title: 'User Management',
  description: 'View and manage user accounts',
}

async function UsersAdminPage() {
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

  // Fetch all users
  const usersResult = await getAllUsers(200, 0)

  if (!usersResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{usersResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const users = usersResult.data

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter(
    (u) => new Date().getTime() - new Date(u.lastSeenAt).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length
  const totalActionsAllUsers = users.reduce((sum, u) => sum + u.totalActions, 0)
  const avgActionsPerUser = totalUsers > 0 ? (totalActionsAllUsers / totalUsers).toFixed(1) : '0'

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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage user accounts</p>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActionsAllUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Actions/User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgActionsPerUser}</div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Search, view, and manage user accounts across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserList users={users} currentAdminId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersAdminPage
