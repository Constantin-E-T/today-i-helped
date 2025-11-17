import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { FeedContainer } from '@/components/feed/feed-container'
import { getFeedActions } from '@/app/actions/feed'

/**
 * Feed Page
 *
 * Community feed displaying recent acts of kindness from all users.
 * Features:
 * - Server Component for initial data fetch
 * - Client Component (FeedContainer) for infinite scroll and real-time updates
 * - Optimistic UI updates for claps
 * - Auto-refresh every 30 seconds
 * - Mobile-optimized layout
 */
export default async function FeedPage() {
  // Fetch initial actions server-side
  const result = await getFeedActions(20, 0)

  // Handle error case
  if (!result.success) {
    return (
      <AuthWrapper>
        <MainLayout maxWidth="lg">
          <div className="text-center py-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Community Feed
            </h2>
            <p className="text-destructive text-sm">
              {result.error || 'Failed to load feed. Please try again later.'}
            </p>
          </div>
        </MainLayout>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <MainLayout maxWidth="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Community Feed
            </h1>
            <p className="text-muted-foreground text-sm">
              Celebrating acts of kindness from around the world
            </p>
          </div>

          {/* Feed Container (Client Component) */}
          <FeedContainer
            initialActions={result.data}
            currentUserId={result.currentUserId}
          />
        </div>
      </MainLayout>
    </AuthWrapper>
  )
}
