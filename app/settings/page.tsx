import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getCurrentUser } from '@/lib/admin'
import { isUserAdmin } from '@/lib/admin'
import {
  Settings,
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  Crown,
  LayoutDashboard,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Settings Page
 *
 * Displays user account settings and admin-specific options.
 * Regular users see: account info, notifications, privacy, data export/delete.
 * Admins additionally see: admin dashboard link, platform settings, and quick actions.
 */
export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <AuthWrapper>
        <MainLayout maxWidth="lg">
          <Card className="border-dashed border-2">
            <CardContent className="pt-6">
              <div className="text-center py-12 space-y-4">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold text-foreground">Not Authenticated</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Please log in to access settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </MainLayout>
      </AuthWrapper>
    )
  }

  const isAdmin = await isUserAdmin(user.id)

  return (
    <AuthWrapper>
      <MainLayout maxWidth="2xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account preferences and settings
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium border border-yellow-500/20">
                <Crown className="h-4 w-4" />
                <span>Admin</span>
              </div>
            )}
          </div>

          {/* Admin Dashboard Link (Admin Only) */}
          {isAdmin && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <LayoutDashboard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Admin Dashboard</h3>
                      <p className="text-sm text-muted-foreground">
                        Access platform management and analytics
                      </p>
                    </div>
                  </div>
                  <Link href="/admin">
                    <Button variant="default">Open Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Account Settings</CardTitle>
              </div>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Change (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Recovery Code</p>
                  <p className="text-sm text-muted-foreground">
                    {user.recoveryCode ? 'Configured' : 'Not set'}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  View Code (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Daily Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get reminded to complete your daily action
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Clap Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Be notified when someone claps for your actions
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Achievement Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Celebrate when you unlock new achievements
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Privacy Settings</CardTitle>
              </div>
              <CardDescription>Control your privacy and data visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">
                    Control who can view your profile and actions
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Manage (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Location Sharing</p>
                  <p className="text-sm text-muted-foreground">
                    Choose whether to share location with your actions
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Manage (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or delete your account data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of all your actions and profile data
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Export (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  Delete (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Platform Settings (Admin Only) */}
          {isAdmin && (
            <Card className="border-purple-500/20">
              <CardHeader className="bg-purple-500/5">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <CardTitle className="text-purple-600 dark:text-purple-400">
                    Platform Settings
                  </CardTitle>
                </div>
                <CardDescription>Admin-only platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable the platform for maintenance
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure (Coming Soon)
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">User Registration</p>
                    <p className="text-sm text-muted-foreground">
                      Allow or disable new user signups
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Manage (Coming Soon)
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Rate Limits</p>
                    <p className="text-sm text-muted-foreground">
                      Configure platform-wide rate limiting settings
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    </AuthWrapper>
  )
}
