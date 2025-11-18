import { redirect } from 'next/navigation'
import { getCurrentUserId, isUserAdmin } from '@/lib/admin'
import { getAllChallenges } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ChallengeList from '@/components/admin/ChallengeList'
import CreateChallengeDialog from '@/components/admin/CreateChallengeDialog'

export const metadata = {
  title: 'Challenge Management',
  description: 'Manage daily challenges for the platform',
}

async function ChallengesAdminPage() {
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

  // Fetch all challenges
  const challengesResult = await getAllChallenges()

  if (!challengesResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{challengesResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const challenges = challengesResult.data

  // Calculate stats
  const totalChallenges = challenges.length
  const activeChallenges = challenges.filter((c) => c.isActive).length
  const inactiveChallenges = totalChallenges - activeChallenges
  const totalUsage = challenges.reduce((sum, c) => sum + c.timesUsed, 0)

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
          <h1 className="text-3xl font-bold tracking-tight">Challenge Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage daily challenges
          </p>
        </div>
        <CreateChallengeDialog />
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChallenges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeChallenges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inactiveChallenges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Challenge List */}
      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
          <CardDescription>
            Manage challenge activation, edit content, or delete challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChallengeList challenges={challenges} />
        </CardContent>
      </Card>
    </div>
  )
}

export default ChallengesAdminPage
