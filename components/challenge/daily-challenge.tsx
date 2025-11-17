import { getRandomChallenge } from '@/app/actions/challenge'
import { Category, Difficulty } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubmitAction } from '@/components/action/submit-action'

// Category color mapping for consistent branding
const categoryColors: Record<Category, string> = {
  PEOPLE: 'bg-blue-500 text-white hover:bg-blue-600',
  ANIMALS: 'bg-green-500 text-white hover:bg-green-600',
  ENVIRONMENT: 'bg-emerald-500 text-white hover:bg-emerald-600',
  COMMUNITY: 'bg-purple-500 text-white hover:bg-purple-600',
}

// Difficulty badge styling with proper contrast
const difficultyColors: Record<Difficulty, string> = {
  EASY: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
}

/**
 * Daily Challenge Card Component
 *
 * Server Component that fetches and displays today's random challenge.
 * Features:
 * - Fetches challenge data server-side
 * - Mobile-optimized layout with proper spacing
 * - Category color coding for visual hierarchy
 * - Difficulty badges with accessible contrast
 * - Touch-friendly CTA button (44x44px minimum)
 * - Graceful error handling
 */
export async function DailyChallengeCard() {
  const result = await getRandomChallenge()

  if (!result.success) {
    return (
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl">😔</div>
              <h3 className="text-lg font-semibold text-foreground">
                No Challenges Available
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                We&apos;re having trouble loading today&apos;s challenge. Please check back in a few moments!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const challenge = result.data

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6 sm:p-8 lg:p-10 space-y-6">
          {/* Category Badge */}
          <div className="flex justify-center">
            <Badge
              className={`${categoryColors[challenge.category]} text-sm px-4 py-1.5 transition-colors`}
            >
              {challenge.category}
            </Badge>
          </div>

          {/* Challenge Text - Prominently displayed */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {challenge.text}
            </h2>
          </div>

          {/* Difficulty Badge */}
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`${difficultyColors[challenge.difficulty]} text-xs px-3 py-1 font-medium`}
            >
              {challenge.difficulty}
            </Badge>
          </div>

          {/* Call to Action Button */}
          <div className="flex justify-center pt-4">
            <SubmitAction challenge={challenge} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
