import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { MainLayout } from '@/components/layout/main-layout'
import { ActionFlow } from '@/components/action/action-flow'

/**
 * Action Flow Page
 *
 * Unified page that combines challenge browsing and custom action creation.
 * Features:
 * - Tabbed interface for mode switching
 * - Path 1: Browse and complete suggested challenges
 * - Path 2: Create and share custom acts of kindness
 * - Mobile-first responsive design
 * - Smooth transitions and interactions
 *
 * This provides the complete user journey from discovery to action completion.
 */
export default function ActionFlowPage() {
  return (
    <AuthWrapper>
      <MainLayout maxWidth="full">
        <div className="py-6 sm:py-8">
          <ActionFlow />
        </div>
      </MainLayout>
    </AuthWrapper>
  )
}
