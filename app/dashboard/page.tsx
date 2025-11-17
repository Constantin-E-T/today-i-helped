import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { RecentActions } from "@/components/dashboard/recent-actions";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AchievementShowcase } from "@/components/achievements/achievement-showcase";
import { getDashboardData } from "@/app/actions/dashboard";
import { getCurrentUserId } from "@/lib/admin";
import { redirect } from "next/navigation";

/**
 * Personal Dashboard Page
 *
 * User's personal dashboard displaying:
 * - Stats overview (total actions, streak, categories, days active)
 * - Recent actions timeline
 * - Streak counter with motivational messaging
 * - Quick action buttons
 * - Achievement showcase
 */
export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/");
  }

  const result = await getDashboardData(userId);

  if (!result.success) {
    return (
      <AuthWrapper>
        <MainLayout maxWidth="xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Failed to load dashboard data.
            </p>
          </div>
        </MainLayout>
      </AuthWrapper>
    );
  }

  const { user, stats, recentActions, recentAchievements, categoryBreakdown } =
    result.data;

  return (
    <AuthWrapper>
      <MainLayout maxWidth="xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.username}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your kindness journey at a glance
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview
            totalActions={stats.totalActions}
            currentStreak={stats.currentStreak}
            categoriesHelped={stats.categoriesHelped}
            daysSinceJoined={stats.daysSinceJoined}
          />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <QuickActions />

              {/* Recent Actions */}
              <RecentActions actions={recentActions} />

              {/* Achievement Showcase */}
              <AchievementShowcase achievements={recentAchievements} />
            </div>

            {/* Right Column - Streak & Stats */}
            <div className="space-y-6">
              {/* Streak Counter */}
              <StreakCounter
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthWrapper>
  );
}
