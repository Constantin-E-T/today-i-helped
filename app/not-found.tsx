import Link from 'next/link'
import { Home, Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 404 Not Found Page
 *
 * Displayed when a user navigates to a page that doesn't exist.
 * Features:
 * - Friendly, encouraging messaging that fits the "kindness" theme
 * - Clear navigation options back to home
 * - Mobile-first responsive design
 * - Server Component for optimal performance
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-primary/10 dark:bg-primary/20 rounded-full p-6 md:p-8">
              <Heart className="size-16 md:size-20 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="space-y-2">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground/20 dark:text-foreground/10">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Page Not Found
          </h2>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-muted-foreground text-base md:text-lg">
            Looks like this page wandered off somewhere.
          </p>
          <p className="text-muted-foreground text-sm md:text-base">
            But while you're here, maybe today is a great day to help someone?
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="size-4" />
              Go to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="javascript:history.back()">
              <ArrowLeft className="size-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Encouraging Note */}
        <div className="pt-8 border-t border-border">
          <p className="text-xs md:text-sm text-muted-foreground italic">
            "No act of kindness, no matter how small, is ever wasted."
          </p>
        </div>
      </div>
    </div>
  )
}
