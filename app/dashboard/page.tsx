import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsGrid } from "@/components/dashboard/stats-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentActions } from "@/components/dashboard/recent-actions";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AchievementProgressList } from "@/components/achievements/achievement-progress";
import { CommunityBanner } from "@/components/social/community-banner";
import { getDashboardData } from "@/app/actions/dashboard";
import { getActivityChartData, getCategoryChartData } from "@/app/actions/charts";
import { getCommunityStats } from "@/app/actions/social";
import { getAchievementProgress } from "@/app/actions/achievements";
import { getCurrentUserId } from "@/lib/admin";
import { redirect } from "next/navigation";
import { Heart, Flame, Award, TrendingUp, Users } from "lucide-react";
import type { StatCardData } from "@/types/dashboard";

/**
 * Modern Dashboard Page
 *
 * Redesigned with professional SaaS layout featuring:
 * - Modern stat cards with trends
 * - Data visualization charts (activity & category breakdown)
 * - Achievement progress indicators
 * - Community highlights
 * - Responsive grid layout
 */
export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/");
  }

  // Fetch all dashboard data in parallel
  const [dashboardResult, activityChartResult, categoryChartResult, communityResult, achievementProgressResult] = await Promise.all([
    getDashboardData(userId),
    getActivityChartData(userId, 30),
    getCategoryChartData(userId),
    getCommunityStats(),
    getAchievementProgress(userId),
  ]);

  if (!dashboardResult.success) {
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

  const { user, stats, recentActions, categoryBreakdown } = dashboardResult.data;

  // Prepare stat cards with modern layout
  const statCards: StatCardData[] = [
    {
      label: "Total Actions",
      value: stats.totalActions,
      icon: Heart,
      color: "primary",
      description: "Acts of kindness completed",
    },
    {
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
      icon: Flame,
      color: "warning",
      description: stats.currentStreak > 0 ? "Keep it going!" : "Start your streak today",
    },
    {
      label: "Categories Helped",
      value: stats.categoriesHelped,
      icon: Award,
      color: "success",
      description: `Out of 4 categories`,
    },
    {
      label: "Claps Received",
      value: stats.clapsReceived,
      icon: TrendingUp,
      color: "default",
      description: "Community appreciation",
    },
  ];

  // Get in-progress achievements (not earned yet, with progress > 0)
  const inProgressAchievements = achievementProgressResult.success
    ? achievementProgressResult.data.filter((a) => !a.isEarned && a.currentProgress > 0)
    : [];

  return (
    <AuthWrapper>
      <MainLayout maxWidth="xl">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user.username}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's your kindness journey at a glance
              </p>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <StatsGrid stats={statCards} columns={4} />

          {/* Community Highlights */}
          {communityResult.success && communityResult.data && (
            <CommunityBanner stats={communityResult.data} />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts & Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Chart */}
              {activityChartResult.success && (
                <ActivityChart
                  data={activityChartResult.data}
                  title="Your Activity"
                  description="Actions completed in the last 30 days"
                />
              )}

              {/* Category Breakdown Chart */}
              {categoryChartResult.success && (
                <CategoryChart
                  data={categoryChartResult.data}
                  title="Category Breakdown"
                  description="How you're helping across categories"
                  variant="bar"
                />
              )}

              {/* Quick Actions */}
              <QuickActions />

              {/* Recent Actions */}
              <RecentActions actions={recentActions} />
            </div>

            {/* Right Column - Streak & Achievements */}
            <div className="space-y-6">
              {/* Streak Counter */}
              <StreakCounter
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
              />

              {/* Achievement Progress */}
              {inProgressAchievements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Next Achievements
                  </h3>
                  <AchievementProgressList
                    achievements={inProgressAchievements}
                    variant="compact"
                    maxDisplay={5}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthWrapper>
  );
}
