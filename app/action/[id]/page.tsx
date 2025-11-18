import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { getActionById } from '@/app/actions/action'
import { hasUserClapped } from '@/app/actions/clap'
import { getCurrentUserId } from '@/lib/admin'
import { ActionCard } from '@/components/feed/action-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ActionPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Action Detail Page
 * 
 * Displays a single action with full details
 */
export default async function ActionPage({ params }: ActionPageProps) {
  const { id } = await params
  
  // Fetch action details
  const actionResult = await getActionById(id)
  
  if (!actionResult.success || !actionResult.data) {
    notFound()
  }

  // Get current user ID and check if they've clapped
  const currentUserId = await getCurrentUserId()
  let hasClapped = false
  
  if (currentUserId) {
    const clapResult = await hasUserClapped(id, currentUserId)
    if (clapResult.success) {
      hasClapped = clapResult.data.hasClapped
    }
  }

  const action = {
    ...actionResult.data,
    hasClapped,
  }

  return (
    <AuthWrapper>
      <MainLayout maxWidth="lg">
        <div className="space-y-6">
          {/* Back Button */}
          <Link href="/feed">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>
          </Link>

          {/* Action Detail */}
          <div className="max-w-2xl mx-auto">
            <ActionCard
              action={action}
              currentUserId={currentUserId || undefined}
            />
          </div>
        </div>
      </MainLayout>
    </AuthWrapper>
  )
}
