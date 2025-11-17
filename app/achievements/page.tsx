import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { MainLayout } from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { getAchievementProgress } from "@/app/actions/achievements";
import { getCurrentUserId } from "@/lib/admin";
import { redirect } from "next/navigation";
import { Trophy, Sparkles, Flame, Award, Users } from "lucide-react";

/**
 * Achievements Page
 *
 * Displays all available achievements organized by category:
 * - All: Shows all achievements
 * - Starter: Onboarding achievements
 * - Streak: Consecutive day achievements
 * - Impact: Total action milestones
 * - Category: Category-specific achievements
 *
 * Each achievement shows earned status and progress
 */
export default async function AchievementsPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/");
  }

  const result = await getAchievementProgress(userId);

  if (!result.success) {
    return (
      <AuthWrapper>
        <MainLayout maxWidth="xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Failed to load achievements.
            </p>
          </div>
        </MainLayout>
      </AuthWrapper>
    );
  }

  const achievements = result.data;

  // Count earned achievements
  const earnedCount = achievements.filter((a) => a.isEarned).length;
  const totalCount = achievements.length;

  return (
    <AuthWrapper>
      <MainLayout maxWidth="xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                Achievements
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your progress and earn badges for your acts of kindness
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {earnedCount}/{totalCount}
              </p>
              <p className="text-sm text-muted-foreground">Earned</p>
            </div>
          </div>

          {/* Achievement Categories */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="all" className="gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="STARTER" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Starter</span>
              </TabsTrigger>
              <TabsTrigger value="STREAK" className="gap-2">
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Streak</span>
              </TabsTrigger>
              <TabsTrigger value="IMPACT" className="gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Impact</span>
              </TabsTrigger>
              <TabsTrigger value="CATEGORY" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Category</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <AchievementGrid achievements={achievements} />
            </TabsContent>

            <TabsContent value="STARTER" className="space-y-4">
              <AchievementGrid
                achievements={achievements}
                category="STARTER"
                emptyMessage="No starter achievements available."
              />
            </TabsContent>

            <TabsContent value="STREAK" className="space-y-4">
              <AchievementGrid
                achievements={achievements}
                category="STREAK"
                emptyMessage="No streak achievements available."
              />
            </TabsContent>

            <TabsContent value="IMPACT" className="space-y-4">
              <AchievementGrid
                achievements={achievements}
                category="IMPACT"
                emptyMessage="No impact achievements available."
              />
            </TabsContent>

            <TabsContent value="CATEGORY" className="space-y-4">
              <AchievementGrid
                achievements={achievements}
                category="CATEGORY"
                emptyMessage="No category achievements available."
              />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </AuthWrapper>
  );
}
