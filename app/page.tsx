import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { ChallengeHub } from '@/components/challenge/challenge-hub'

/**
 * Home Page
 *
 * The main landing page for authenticated users.
 * Features:
 * - Enhanced challenge discovery with 6 challenges displayed simultaneously
 * - Category and difficulty filtering
 * - Mobile-first responsive layout
 * - Server Component for optimal performance with Client Component interactivity
 * - Proper authentication wrapping
 */
export default function Home() {
  return (
    <AuthWrapper>
      <MainLayout maxWidth="full">
        <ChallengeHub />
      </MainLayout>
    </AuthWrapper>
  )
}
