import { MainLayout } from '@/components/layout/main-layout'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ActionTimeline } from '@/components/profile/action-timeline'
import { ImpactSummary } from '@/components/profile/impact-summary'
import { AchievementShowcase } from '@/components/achievements/achievement-showcase'
import { getUserProfile, getUserActions, getImpactSummary } from '@/app/actions/profile'
import { notFound } from 'next/navigation'

interface ProfilePageProps {
  params: {
    username: string
  }
}

/**
 * Public User Profile Page
 *
 * Displays a user's public profile including:
 * - Profile header with avatar, username, join date, and stats
 * - Recent achievements showcase
 * - Impact summary by category
 * - Public action timeline
 *
 * This page is publicly accessible and shareable
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params

  // Fetch user profile data
  const profileResult = await getUserProfile(username)

  if (!profileResult.success) {
    notFound()
  }

  const { user, stats, recentAchievements } = profileResult.data

  // Fetch user's actions
  const actionsResult = await getUserActions(username, 20)
  const actions = actionsResult.success ? actionsResult.data : []

  // Fetch impact summary
  const impactResult = await getImpactSummary(username)
  const impact = impactResult.success
    ? impactResult.data
    : { topCategory: null, categoryBreakdown: { PEOPLE: 0, ANIMALS: 0, ENVIRONMENT: 0, COMMUNITY: 0 } }

  return (
    <MainLayout maxWidth="xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader user={user} stats={stats} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Timeline */}
            <ActionTimeline actions={actions} username={user.username} />
          </div>

          {/* Right Column - Stats & Achievements */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <AchievementShowcase achievements={recentAchievements} />

            {/* Impact Summary */}
            <ImpactSummary
              categoryBreakdown={impact.categoryBreakdown}
              topCategory={impact.topCategory}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = params

  return {
    title: `${username}'s Profile - Today I Helped`,
    description: `View ${username}'s kindness journey and acts of kindness on Today I Helped`,
  }
}
