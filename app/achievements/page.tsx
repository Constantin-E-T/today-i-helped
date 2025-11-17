import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

/**
 * Achievements Page
 *
 * Coming soon page for the achievements feature.
 * Will display user stats, streaks, and earned badges.
 */
export default function AchievementsPage() {
  return (
    <AuthWrapper>
      <MainLayout maxWidth="lg">
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">
                Achievements
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                This feature is coming soon! Track your progress, view your
                streaks, and earn badges for your acts of kindness.
              </p>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    </AuthWrapper>
  )
}
