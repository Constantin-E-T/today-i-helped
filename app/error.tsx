'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Error Boundary Page
 *
 * Catches and displays errors that occur during rendering in the application.
 * Features:
 * - User-friendly error messaging
 * - Reset functionality to try again
 * - Navigation options back to safety
 * - Client Component (required for error boundaries and reset)
 * - Mobile-first responsive design
 *
 * @param error - The error that was thrown
 * @param reset - Function to reset the error boundary and re-render
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
            <div className="relative bg-destructive/10 dark:bg-destructive/20 rounded-full p-6 md:p-8">
              <AlertCircle
                className="size-16 md:size-20 text-destructive"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Oops! Something Went Wrong
          </h2>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-muted-foreground text-base md:text-lg">
            We encountered an unexpected error. Don't worry, these things happen!
          </p>
          {error.message && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground font-mono break-words">
                {error.message}
              </p>
            </div>
          )}
          <p className="text-muted-foreground text-sm md:text-base">
            Let's try that again, or head back home to start fresh.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={reset}
            size="lg"
            className="w-full sm:w-auto"
          >
            <RefreshCcw className="size-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="size-4" />
              Go to Home
            </Link>
          </Button>
        </div>

        {/* Error Details (for development) */}
        {error.digest && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          </div>
        )}

        {/* Encouraging Note */}
        <div className="pt-8 border-t border-border">
          <p className="text-xs md:text-sm text-muted-foreground italic">
            Thank you for your patience. Your kindness makes a difference!
          </p>
        </div>
      </div>
    </div>
  )
}
