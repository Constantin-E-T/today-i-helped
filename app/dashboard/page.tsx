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
import {
  getActivityChartData,
  getCategoryChartData,
} from "@/app/actions/charts";
import { getCommunityStats } from "@/app/actions/social";
import { getAchievementProgress } from "@/app/actions/achievements";
import { getCurrentUserId } from "@/lib/admin";
import { redirect } from "next/navigation";
import {
  Heart,
  Flame,
  Award,
  TrendingUp,
  ArrowLeft,
  Calendar,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { StatCardData } from "@/types/dashboard";

/**
 * Dashboard Page
 *
 * Modern personal dashboard featuring:
 * - Back navigation button
 * - Professional stat cards with icons
 * - Interactive data visualization
 * - Achievement progress tracking
 * - Community highlights
 * - Quick action shortcuts
 * - Responsive grid layout optimized for all devices
 */
export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/");
  }

  // Fetch all dashboard data in parallel
  const [
    dashboardResult,
    activityChartResult,
    categoryChartResult,
    communityResult,
    achievementProgressResult,
  ] = await Promise.all([
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

  const { user, stats, recentActions, categoryBreakdown } =
    dashboardResult.data;

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
      description:
        stats.currentStreak > 0 ? "Keep it going!" : "Start your streak today",
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
    ? achievementProgressResult.data.filter(
        (a) => !a.isEarned && a.currentProgress > 0
      )
    : [];

  return (
    <AuthWrapper>
      <MainLayout maxWidth="7xl">
        <div className="space-y-6">
          {/* Back Navigation */}
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Page Header */}
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back,{" "}
              <span className="font-semibold text-foreground">
                {user.username}
              </span>
              ! Here's your impact at a glance.
            </p>
          </div>

          {/* Stats Overview */}
          <StatsGrid stats={statCards} columns={4} />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="xl:col-span-2 space-y-6">
              {/* Quick Actions */}
              <QuickActions />

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Pie Chart */}
                {activityChartResult.success && (
                  <ActivityChart
                    data={activityChartResult.data}
                    title="Activity Overview"
                    description="Your recent contributions"
                  />
                )}

                {/* Category Pie Chart */}
                {categoryChartResult.success && (
                  <CategoryChart
                    data={categoryChartResult.data}
                    title="Impact by Category"
                    description="Where you're helping most"
                    variant="pie"
                  />
                )}
              </div>

              {/* Recent Actions */}
              <RecentActions actions={recentActions} />
            </div>

            {/* Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Streak Counter */}
              <StreakCounter
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
              />

              {/* Community Stats */}
              {communityResult.success && communityResult.data && (
                <CommunityBanner stats={communityResult.data} />
              )}

              {/* Achievement Progress */}
              {inProgressAchievements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Progress Tracker
                    </h3>
                  </div>
                  <AchievementProgressList
                    achievements={inProgressAchievements}
                    variant="compact"
                    maxDisplay={5}
                  />
                  <Link href="/achievements">
                    <Button variant="outline" className="w-full" size="sm">
                      View All Achievements
                    </Button>
                  </Link>
                </div>
              )}

              {/* No achievements in progress */}
              {inProgressAchievements.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center space-y-2">
                  <Award className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Start earning achievements!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complete actions to unlock rewards
                  </p>
                  <Link href="/achievements">
                    <Button variant="link" size="sm" className="text-xs">
                      Explore Achievements
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthWrapper>
  );
}
