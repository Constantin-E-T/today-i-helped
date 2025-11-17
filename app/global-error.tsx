'use client'

import { useEffect } from 'react'
import { ServerCrash, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Global Error Page
 *
 * Handles catastrophic errors that occur at the root level, including 500 errors.
 * This page replaces the root layout when rendered, so it must include html/body tags.
 *
 * Features:
 * - Handles server errors and global failures
 * - Apologetic, reassuring messaging
 * - Full page refresh capability
 * - Navigation to home
 * - Client Component (required for error boundaries)
 * - Mobile-first responsive design
 *
 * @param error - The error that was thrown
 * @param reset - Function to reset the error boundary and re-render
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Global error caught:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
                <div className="relative bg-destructive/10 rounded-full p-6 md:p-8 border-2 border-destructive/20">
                  <ServerCrash
                    className="size-16 md:size-20 text-destructive"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>

            {/* Error Code */}
            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-bold text-foreground/20">
                500
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Server Error
              </h2>
            </div>

            {/* Message */}
            <div className="space-y-4">
              <p className="text-muted-foreground text-base md:text-lg">
                We're so sorry! Our servers encountered an unexpected problem.
              </p>
              <p className="text-muted-foreground text-sm md:text-base">
                Our team has been notified and we're working to fix this right away.
              </p>
              {error.message && (
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-mono break-words">
                    {error.message}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={() => window.location.reload()}
                size="lg"
                className="w-full sm:w-auto"
              >
                <RefreshCcw className="size-4" />
                Refresh Page
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <a href="/">
                  <Home className="size-4" />
                  Go to Home
                </a>
              </Button>
            </div>

            {/* Error Details */}
            {error.digest && (
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  Error Reference: {error.digest}
                </p>
              </div>
            )}

            {/* Encouraging Note */}
            <div className="pt-8 border-t border-border">
              <p className="text-xs md:text-sm text-muted-foreground italic">
                We appreciate your patience and understanding.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">
                Your acts of kindness are what make this community special!
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
