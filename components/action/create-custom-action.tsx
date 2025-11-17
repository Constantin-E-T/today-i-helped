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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createAction } from '@/app/actions/action'
import { getUserIdFromCookie } from '@/lib/auth-cookies'
import { Category } from '@prisma/client'
import { CATEGORIES, VALIDATION, getCategoryConfig } from '@/lib/constants'
import confetti from 'canvas-confetti'
import { Loader2, Sparkles, Plus, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Custom Action Creation Component
 *
 * Client Component for creating custom actions not tied to existing challenges.
 * Features:
 * - Prominent "Create Your Own" call-to-action
 * - Category selector (required dropdown)
 * - Rich textarea for action description with prompts
 * - Optional location field
 * - Optional impact description field
 * - Preview mode before posting
 * - Full validation and error handling
 * - Celebration on success
 * - Responsive (Sheet on mobile, Dialog on desktop)
 */
export function CreateCustomAction() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'preview'>('form')

  // Form state
  const [category, setCategory] = useState<Category | ''>('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [impact, setImpact] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate category
    if (!category) {
      setError('Please select a category for your action.')
      return
    }

    // Validate description length
    const trimmedDescription = description.trim()
    if (trimmedDescription.length < VALIDATION.CUSTOM_ACTION.MIN_LENGTH) {
      setError(
        `Please write at least ${VALIDATION.CUSTOM_ACTION.MIN_LENGTH} characters to describe your action.`
      )
      return
    }

    if (trimmedDescription.length > VALIDATION.CUSTOM_ACTION.MAX_LENGTH) {
      setError(
        `Please keep your description under ${VALIDATION.CUSTOM_ACTION.MAX_LENGTH} characters.`
      )
      return
    }

    // Validate impact if provided
    const trimmedImpact = impact.trim()
    if (trimmedImpact && trimmedImpact.length < VALIDATION.IMPACT_DESCRIPTION.MIN_LENGTH) {
      setError(
        `Impact description must be at least ${VALIDATION.IMPACT_DESCRIPTION.MIN_LENGTH} characters.`
      )
      return
    }

    // Get user ID from cookie
    const userId = getUserIdFromCookie()
    if (!userId) {
      setError('You must be logged in to post actions.')
      return
    }

    setIsSubmitting(true)

    try {
      // Get client-side metadata
      const ipAddress = 'client' // In production, this would come from server
      const userAgent = navigator.userAgent

      // Construct custom text with optional fields
      let customText = trimmedDescription
      if (trimmedImpact) {
        customText += `\n\nImpact: ${trimmedImpact}`
      }

      // Submit action
      const result = await createAction({
        userId,
        challengeId: undefined, // No challenge ID for custom actions
        customText,
        location: location.trim() || undefined,
        category: category as Category,
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
            resetForm()
          }, 300)
        }, 2500)
      } else {
        setError(result.error || 'Failed to submit. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Error submitting custom action:', err)
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

  const resetForm = () => {
    setCategory('')
    setDescription('')
    setLocation('')
    setImpact('')
    setError(null)
    setSuccess(false)
    setStep('form')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen)
      if (!newOpen) {
        // Reset form when closing
        setTimeout(resetForm, 300)
      }
    }
  }

  const handlePreview = () => {
    setError(null)
    // Basic validation before preview
    if (!category) {
      setError('Please select a category first.')
      return
    }
    if (description.trim().length < VALIDATION.CUSTOM_ACTION.MIN_LENGTH) {
      setError('Please write a description before previewing.')
      return
    }
    setStep('preview')
  }

  const handleBackToForm = () => {
    setStep('form')
  }

  return (
    <>
      {/* Desktop: Dialog */}
      <div className="hidden sm:block">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              className="min-h-[44px] px-8 border-2 border-dashed border-primary hover:bg-primary/10"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your Own Action
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {step === 'form' ? 'Create Your Own Action' : 'Preview Your Action'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {step === 'form'
                  ? 'Share something kind you did that\'s not in our challenge list'
                  : 'This is how your action will appear in the feed'}
              </DialogDescription>
            </DialogHeader>
            <FormContent
              step={step}
              success={success}
              category={category}
              setCategory={setCategory}
              description={description}
              setDescription={setDescription}
              location={location}
              setLocation={setLocation}
              impact={impact}
              setImpact={setImpact}
              isSubmitting={isSubmitting}
              error={error}
              handleSubmit={handleSubmit}
              handlePreview={handlePreview}
              handleBackToForm={handleBackToForm}
              handleOpenChange={handleOpenChange}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: Sheet (Bottom Drawer) */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              className="w-full min-h-[44px] border-2 border-dashed border-primary hover:bg-primary/10"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your Own Action
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl">
                {step === 'form' ? 'Create Your Own Action' : 'Preview Your Action'}
              </SheetTitle>
              <SheetDescription className="text-base">
                {step === 'form'
                  ? 'Share something kind you did that\'s not in our challenge list'
                  : 'This is how your action will appear in the feed'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FormContent
                step={step}
                success={success}
                category={category}
                setCategory={setCategory}
                description={description}
                setDescription={setDescription}
                location={location}
                setLocation={setLocation}
                impact={impact}
                setImpact={setImpact}
                isSubmitting={isSubmitting}
                error={error}
                handleSubmit={handleSubmit}
                handlePreview={handlePreview}
                handleBackToForm={handleBackToForm}
                handleOpenChange={handleOpenChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

/**
 * Form Content Component
 * Extracted to prevent remounting on state changes
 */
interface FormContentProps {
  step: 'form' | 'preview'
  success: boolean
  category: Category | ''
  setCategory: (value: Category | '') => void
  description: string
  setDescription: (value: string) => void
  location: string
  setLocation: (value: string) => void
  impact: string
  setImpact: (value: string) => void
  isSubmitting: boolean
  error: string | null
  handleSubmit: (e: React.FormEvent) => void
  handlePreview: () => void
  handleBackToForm: () => void
  handleOpenChange: (newOpen: boolean) => void
}

function FormContent({
  step,
  success,
  category,
  setCategory,
  description,
  setDescription,
  location,
  setLocation,
  impact,
  setImpact,
  isSubmitting,
  error,
  handleSubmit,
  handlePreview,
  handleBackToForm,
  handleOpenChange,
}: FormContentProps) {
  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h3 className="text-2xl font-bold text-foreground">Amazing Work!</h3>
        <p className="text-muted-foreground">
          Thank you for sharing your act of kindness with the world!
        </p>
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="space-y-6">
        <PreviewCard
          category={category as Category}
          description={description}
          location={location}
          impact={impact}
        />

        {error && (
          <div
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
            onClick={handleBackToForm}
            disabled={isSubmitting}
            className="flex-1 min-h-[44px]"
          >
            Edit
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Post Action
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Form step
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* Category Selector */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-base font-medium">
          Category <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id as Category)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all text-left',
                category === cat.id
                  ? `${cat.bgColor} text-white border-transparent`
                  : 'border-border hover:border-primary bg-card'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          What did you do? <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your act of kindness... For example: 'I helped an elderly neighbor carry their groceries' or 'I donated clothes to a local shelter'"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[120px] resize-none"
          aria-required="true"
        />
        <p className="text-xs text-muted-foreground">
          {description.length}/{VALIDATION.CUSTOM_ACTION.MAX_LENGTH} characters
          {description.length < VALIDATION.CUSTOM_ACTION.MIN_LENGTH &&
            ` (minimum ${VALIDATION.CUSTOM_ACTION.MIN_LENGTH})`}
        </p>
      </div>

      {/* Location (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-base font-medium">
          Where did this happen? <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Input
          id="location"
          placeholder="e.g., Local park, Downtown, My neighborhood"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSubmitting}
          maxLength={VALIDATION.LOCATION.MAX_LENGTH}
        />
      </div>

      {/* Impact Description (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="impact" className="text-base font-medium">
          How did this help? <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Textarea
          id="impact"
          placeholder="Describe the positive impact... For example: 'They were really grateful and it made their day easier'"
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[80px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {impact.length}/{VALIDATION.IMPACT_DESCRIPTION.MAX_LENGTH} characters
        </p>
      </div>

      {error && (
        <div
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
          className="flex-1 min-h-[44px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handlePreview}
          disabled={
            isSubmitting ||
            !category ||
            description.trim().length < VALIDATION.CUSTOM_ACTION.MIN_LENGTH
          }
          className="flex-1 min-h-[44px]"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
      </div>
    </form>
  )
}

/**
 * Preview Card Component
 * Shows how the action will appear in the feed
 */
interface PreviewCardProps {
  category: Category
  description: string
  location: string
  impact: string
}

function PreviewCard({ category, description, location, impact }: PreviewCardProps) {
  const categoryConfig = getCategoryConfig(category)

  return (
    <Card className="shadow-md">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  categoryConfig.bgColor,
                  'text-white',
                  'transition-colors'
                )}
              >
                <span className="mr-1">{categoryConfig.icon}</span>
                {categoryConfig.label}
              </Badge>
              {location && (
                <span className="text-sm text-muted-foreground">
                  in {location}
                </span>
              )}
            </div>

            <p className="text-base text-foreground leading-relaxed">
              {description}
            </p>

            {impact && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground italic">
                  Impact: {impact}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
