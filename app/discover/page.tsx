import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { ChallengeHub } from '@/components/challenge/challenge-hub'

/**
 * Challenge Discovery Page
 *
 * Showcases the enhanced Challenge Discovery Hub with:
 * - Multiple challenges displayed in a grid (4-6 at once)
 * - Category filtering (PEOPLE, ANIMALS, ENVIRONMENT, COMMUNITY, ALL)
 * - Difficulty filtering (EASY, MEDIUM, ALL)
 * - Shuffle/refresh functionality
 * - Mobile-optimized responsive layout
 *
 * Server Component for optimal performance with client components for interactivity.
 */
export default function DiscoverPage() {
  return (
    <AuthWrapper>
      <MainLayout maxWidth="full">
        <div className="py-6 sm:py-8">
          <ChallengeHub />
        </div>
      </MainLayout>
    </AuthWrapper>
  )
}
