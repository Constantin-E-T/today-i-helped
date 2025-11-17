import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

/**
 * Feed Page
 *
 * Coming soon page for the community feed feature.
 * Will display actions completed by the community.
 */
export default function FeedPage() {
  return (
    <AuthWrapper>
      <MainLayout maxWidth="lg">
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <Users className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">
                Community Feed
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                This feature is coming soon! You'll be able to see what acts of
                kindness others in the community are completing.
              </p>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    </AuthWrapper>
  )
}
