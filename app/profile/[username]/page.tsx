import { MainLayout } from "@/components/layout/main-layout";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ActionTimeline } from "@/components/profile/action-timeline";
import { ImpactSummary } from "@/components/profile/impact-summary";
import { AchievementShowcase } from "@/components/achievements/achievement-showcase";
import {
  getUserProfile,
  getUserActions,
  getImpactSummary,
} from "@/app/actions/profile";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

/**
 * Public User Profile Page
 *
 * Modern profile page with:
 * - Back navigation to community feed
 * - User stats and achievements
 * - Action timeline
 * - Impact summary
 * - Responsive layout for all devices
 * - Shareable public URL
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Fetch user profile data
  const profileResult = await getUserProfile(username);

  if (!profileResult.success) {
    notFound();
  }

  const { user, stats, recentAchievements } = profileResult.data;

  // Fetch user's actions
  const actionsResult = await getUserActions(username, 20);
  const actions = actionsResult.success ? actionsResult.data : [];

  // Fetch impact summary
  const impactResult = await getImpactSummary(username);
  const impact = impactResult.success
    ? impactResult.data
    : {
        topCategory: null,
        categoryBreakdown: {
          PEOPLE: 0,
          ANIMALS: 0,
          ENVIRONMENT: 0,
          COMMUNITY: 0,
        },
      };

  return (
    <MainLayout maxWidth="6xl">
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/feed">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Header */}
        <ProfileHeader user={user} stats={stats} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Timeline */}
          <div className="xl:col-span-2 space-y-6">
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
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;

  return {
    title: `${username}'s Profile - Today I Helped`,
    description: `View ${username}'s kindness journey and acts of kindness on Today I Helped`,
  };
}
