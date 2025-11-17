import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

/**
 * Settings Page
 *
 * Coming soon page for the settings feature.
 * Will allow users to manage their account preferences.
 */
export default function SettingsPage() {
  return (
    <AuthWrapper>
      <MainLayout maxWidth="lg">
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <Settings className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Settings</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                This feature is coming soon! You&apos;ll be able to manage your
                account preferences, notifications, and privacy settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    </AuthWrapper>
  );
}
