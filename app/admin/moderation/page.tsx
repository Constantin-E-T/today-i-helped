import { redirect } from 'next/navigation'
import { getCurrentUserId, isUserAdmin } from '@/lib/admin'
import { getRecentActions } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Shield } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ModerationList from '@/components/admin/ModerationList'

export const metadata = {
  title: 'Content Moderation',
  description: 'Review and moderate user-generated content',
}

async function ModerationAdminPage() {
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

  // Fetch recent actions for moderation
  const actionsResult = await getRecentActions(100)

  if (!actionsResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{actionsResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const actions = actionsResult.data

  // Calculate stats
  const totalActions = actions.length
  const customTextActions = actions.filter((a) => a.customText).length
  const totalClaps = actions.reduce((sum, a) => sum + a.clapsCount, 0)

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
            <Shield className="h-8 w-8 text-primary" />
            Content Moderation
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and moderate user-generated content
          </p>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActions}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 100 actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custom Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customTextActions}</div>
            <p className="text-xs text-muted-foreground mt-1">User-written actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Claps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaps}</div>
            <p className="text-xs text-muted-foreground mt-1">On displayed actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Moderation Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Review actions for:</strong> Inappropriate content, spam, harassment, or
            violations of community guidelines.
          </p>
          <p>
            <strong>Delete actions when:</strong> Content is offensive, misleading, or doesn&apos;t
            align with platform values.
          </p>
          <p className="text-muted-foreground">
            All moderation actions are logged for accountability.
          </p>
        </CardContent>
      </Card>

      {/* Recent Actions for Moderation */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
          <CardDescription>
            Review recent user actions and remove inappropriate content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModerationList actions={actions} />
        </CardContent>
      </Card>
    </div>
  )
}

export default ModerationAdminPage
