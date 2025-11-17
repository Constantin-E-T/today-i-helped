import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { EnhancedFeed } from '@/components/feed/enhanced-feed'
import { getFeedActions } from '@/app/actions/feed'
import { getCommunityStats, getUserSpotlight } from '@/app/actions/social'
import { getTrendingActions } from '@/app/actions/charts'

/**
 * Enhanced Feed Page
 *
 * Community feed displaying recent acts of kindness with social features.
 * Features:
 * - Community stats banner
 * - Trending actions highlight
 * - User spotlight
 * - Infinite scroll and real-time updates
 * - Optimistic UI updates for claps
 * - Mobile-optimized layout
 */
export default async function FeedPage() {
  // Fetch all feed data in parallel
  const [feedResult, communityResult, trendingResult, spotlightResult] = await Promise.all([
    getFeedActions(20, 0),
    getCommunityStats(),
    getTrendingActions(5, 7),
    getUserSpotlight(),
  ])

  // Handle error case
  if (!feedResult.success) {
    return (
      <AuthWrapper>
        <MainLayout maxWidth="lg">
          <div className="text-center py-12 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Community Feed
            </h2>
            <p className="text-destructive text-sm">
              {feedResult.error || 'Failed to load feed. Please try again later.'}
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

          {/* Enhanced Feed (Client Component) */}
          <EnhancedFeed
            initialActions={feedResult.data}
            currentUserId={feedResult.currentUserId}
            communityStats={communityResult.success ? communityResult.data : undefined}
            trendingActions={trendingResult.success ? trendingResult.data : undefined}
            userSpotlight={spotlightResult.success ? spotlightResult.data : undefined}
          />
        </div>
      </MainLayout>
    </AuthWrapper>
  )
}
