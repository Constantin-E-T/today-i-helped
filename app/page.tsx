import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout, Section } from '@/components/layout/main-layout'
import { DailyChallengeCard } from '@/components/challenge/daily-challenge'

/**
 * Home Page
 *
 * The main landing page for authenticated users.
 * Features:
 * - Displays today's daily challenge
 * - Mobile-first responsive layout
 * - Server Component for optimal performance
 * - Proper authentication wrapping
 */
export default function Home() {
  return (
    <AuthWrapper>
      <MainLayout maxWidth="lg">
        <Section
          title="Your Daily Challenge"
          description="Complete today's act of kindness and make someone's day better"
        >
          <DailyChallengeCard />
        </Section>
      </MainLayout>
    </AuthWrapper>
  )
}
