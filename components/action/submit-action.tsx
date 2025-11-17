'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createAction } from '@/app/actions/action'
import { getUserIdFromCookie } from '@/lib/auth-cookies'
import type { Challenge } from '@prisma/client'
import confetti from 'canvas-confetti'
import { Loader2, Sparkles } from 'lucide-react'

interface SubmitActionProps {
  challenge: Challenge
}

/**
 * Form Content Component
 * Extracted to prevent remounting on state changes
 */
interface FormContentProps {
  success: boolean
  story: string
  setStory: (value: string) => void
  isSubmitting: boolean
  error: string | null
  handleSubmit: (e: React.FormEvent) => void
  handleOpenChange: (newOpen: boolean) => void
  MIN_LENGTH: number
  MAX_LENGTH: number
}

function FormContent({
  success,
  story,
  setStory,
  isSubmitting,
  error,
  handleSubmit,
  handleOpenChange,
  MIN_LENGTH,
  MAX_LENGTH,
}: FormContentProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success ? (
        <div className="text-center py-8 space-y-4">
          <div className="text-6xl animate-bounce">🎉</div>
          <h3 className="text-2xl font-bold text-foreground">
            Amazing Work!
          </h3>
          <p className="text-muted-foreground">
            You&apos;ve made someone&apos;s day better. Thank you for spreading kindness!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="story" className="text-base font-medium">
              Tell us about your act of kindness
            </Label>
            <Textarea
              id="story"
              placeholder="Share your story... How did you help? How did it feel?"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[120px] resize-none"
              aria-label="Your story about completing this challenge"
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'story-error' : undefined}
            />
            <p className="text-xs text-muted-foreground">
              {story.length}/{MAX_LENGTH} characters
              {story.length < MIN_LENGTH && ` (minimum ${MIN_LENGTH})`}
            </p>
          </div>

          {error && (
            <div
              id="story-error"
              className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || story.trim().length < MIN_LENGTH}
              className="flex-1 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Complete Challenge
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}

/**
 * Submit Action Component
 *
 * Client Component for submitting completed challenges.
 * Features:
 * - Responsive: Sheet (drawer) on mobile, Dialog (modal) on desktop
 * - Form validation with min/max length
 * - Optimistic UI with loading states
 * - Confetti celebration on success
 * - Comprehensive error handling
 * - Auto-close on success after celebration
 * - Accessible keyboard navigation and ARIA labels
 */
export function SubmitAction({ challenge }: SubmitActionProps) {
  const [open, setOpen] = useState(false)
  const [story, setStory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Validation constants
  const MIN_LENGTH = 10
  const MAX_LENGTH = 500

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate story length
    if (story.trim().length < MIN_LENGTH) {
      setError(`Please write at least ${MIN_LENGTH} characters to share your story.`)
      return
    }

    if (story.trim().length > MAX_LENGTH) {
      setError(`Please keep your story under ${MAX_LENGTH} characters.`)
      return
    }

    // Get user ID from cookie
    const userId = getUserIdFromCookie()
    if (!userId) {
      setError('You must be logged in to complete challenges.')
      return
    }

    setIsSubmitting(true)

    try {
      // Get client-side metadata
      const ipAddress = 'client' // In production, this would come from server
      const userAgent = navigator.userAgent

      // Submit action
      const result = await createAction({
        userId,
        challengeId: challenge.id,
        customText: story.trim(),
        category: challenge.category,
        completedAt: new Date(),
        ipAddress,
        userAgent,
      })

      if (result.success) {
        // Success! Show celebration
        setSuccess(true)
        triggerConfetti()

        // Close modal after celebration
        setTimeout(() => {
          setOpen(false)
          // Reset form after close animation
          setTimeout(() => {
            setStory('')
            setSuccess(false)
          }, 300)
        }, 2500)
      } else {
        setError(result.error || 'Failed to submit. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Error submitting action:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerConfetti = () => {
    // Trigger multiple confetti bursts for celebration
    const duration = 2000
    const animationEnd = Date.now() + duration

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Fire confetti from both sides
      confetti({
        particleCount,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
      })
      confetti({
        particleCount,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
      })
    }, 250)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen)
      if (!newOpen) {
        // Reset form when closing
        setTimeout(() => {
          setStory('')
          setError(null)
          setSuccess(false)
        }, 300)
      }
    }
  }

  return (
    <>
      {/* Desktop: Dialog */}
      <div className="hidden sm:block">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="lg" className="min-h-[44px] px-8 shadow-md hover:shadow-lg transition-shadow">
              <Sparkles className="mr-2 h-5 w-5" />
              Complete This Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Share Your Story</DialogTitle>
              <DialogDescription className="text-base">
                &quot;{challenge.text}&quot;
              </DialogDescription>
            </DialogHeader>
            <FormContent
              success={success}
              story={story}
              setStory={setStory}
              isSubmitting={isSubmitting}
              error={error}
              handleSubmit={handleSubmit}
              handleOpenChange={handleOpenChange}
              MIN_LENGTH={MIN_LENGTH}
              MAX_LENGTH={MAX_LENGTH}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: Sheet (Bottom Drawer) */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button size="lg" className="w-full min-h-[44px] shadow-md">
              <Sparkles className="mr-2 h-5 w-5" />
              Complete This Challenge
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle className="text-xl">Share Your Story</SheetTitle>
              <SheetDescription className="text-base">
                &quot;{challenge.text}&quot;
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FormContent
                success={success}
                story={story}
                setStory={setStory}
                isSubmitting={isSubmitting}
                error={error}
                handleSubmit={handleSubmit}
                handleOpenChange={handleOpenChange}
                MIN_LENGTH={MIN_LENGTH}
                MAX_LENGTH={MAX_LENGTH}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
