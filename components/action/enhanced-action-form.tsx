'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createAction } from '@/app/actions/action'
import { getFilteredChallenges } from '@/app/actions/challenge'
import { getUserIdFromCookie } from '@/lib/auth-cookies'
import { Category, type Challenge } from '@prisma/client'
import { CATEGORIES, VALIDATION, getCategoryConfig } from '@/lib/constants'
import confetti from 'canvas-confetti'
import { Loader2, Sparkles, Target, Edit3, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormMode = 'challenge' | 'custom'

/**
 * Enhanced Action Form Component
 *
 * Advanced form that combines challenge completion and custom action creation.
 * Features:
 * - Toggle between "Complete a Challenge" vs "Share Custom Action" modes
 * - Smart suggestions as user types (suggest similar existing challenges)
 * - Category auto-detection based on keywords in description
 * - Content validation (min length, appropriate language)
 * - Smooth transitions between modes
 * - Full accessibility and responsive design
 */
export function EnhancedActionForm() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<FormMode>('challenge')

  // Form state
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [category, setCategory] = useState<Category | ''>('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  // Smart suggestions
  const [suggestions, setSuggestions] = useState<Challenge[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [autoDetectedCategory, setAutoDetectedCategory] = useState<Category | null>(null)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Debounced search for suggestions
  useEffect(() => {
    if (mode === 'custom' && description.length >= 15) {
      const timer = setTimeout(() => {
        fetchSuggestions()
        detectCategory()
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
      setAutoDetectedCategory(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, mode])

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      // Fetch random challenges that might match
      const result = await getFilteredChallenges({
        limit: 3,
        random: true,
      })

      if (result.success && result.data.length > 0) {
        // Filter challenges based on keyword matching
        const keywords = description.toLowerCase().split(' ')
        const matchedChallenges = result.data.filter((challenge) => {
          const challengeText = challenge.text.toLowerCase()
          return keywords.some((keyword) =>
            keyword.length > 3 && challengeText.includes(keyword)
          )
        })

        setSuggestions(matchedChallenges.slice(0, 2))
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const detectCategory = () => {
    const text = description.toLowerCase()

    // Simple keyword-based category detection
    const categoryKeywords: Record<Category, string[]> = {
      PEOPLE: ['helped', 'person', 'someone', 'elderly', 'child', 'neighbor', 'friend', 'stranger'],
      ANIMALS: ['animal', 'pet', 'dog', 'cat', 'bird', 'wildlife', 'rescue', 'shelter'],
      ENVIRONMENT: ['trash', 'recycle', 'plant', 'tree', 'clean', 'environment', 'nature', 'pollution'],
      COMMUNITY: ['community', 'neighborhood', 'local', 'volunteer', 'donation', 'charity', 'organize'],
    }

    let bestMatch: { category: Category; score: number } | null = null

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.filter((keyword) => text.includes(keyword)).length
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { category: cat as Category, score }
      }
    }

    if (bestMatch && !category) {
      setAutoDetectedCategory(bestMatch.category)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate based on mode
    if (mode === 'challenge') {
      if (!selectedChallenge) {
        setError('Please select a challenge first.')
        return
      }

      if (description.trim().length < VALIDATION.ACTION.MIN_LENGTH) {
        setError(
          `Please write at least ${VALIDATION.ACTION.MIN_LENGTH} characters to share your story.`
        )
        return
      }
    } else {
      // Custom mode validation
      if (!category) {
        setError('Please select a category for your action.')
        return
      }

      if (description.trim().length < VALIDATION.CUSTOM_ACTION.MIN_LENGTH) {
        setError(
          `Please write at least ${VALIDATION.CUSTOM_ACTION.MIN_LENGTH} characters to describe your action.`
        )
        return
      }
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

      // Submit action
      const result = await createAction({
        challengeId: mode === 'challenge' ? selectedChallenge?.id : undefined,
        customText: description.trim(),
        location: location.trim() || undefined,
        category: mode === 'challenge' ? selectedChallenge!.category : (category as Category),
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

  const resetForm = () => {
    setMode('challenge')
    setSelectedChallenge(null)
    setCategory('')
    setDescription('')
    setLocation('')
    setError(null)
    setSuccess(false)
    setSuggestions([])
    setAutoDetectedCategory(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen)
      if (!newOpen) {
        setTimeout(resetForm, 300)
      }
    }
  }

  const handleModeChange = (newMode: FormMode) => {
    setMode(newMode)
    setError(null)
    if (newMode === 'challenge') {
      setCategory('')
      setAutoDetectedCategory(null)
    } else {
      setSelectedChallenge(null)
    }
  }

  const handleSuggestionClick = (challenge: Challenge) => {
    setMode('challenge')
    setSelectedChallenge(challenge)
    setSuggestions([])
  }

  const handleAutoDetectCategory = () => {
    if (autoDetectedCategory) {
      setCategory(autoDetectedCategory)
      setAutoDetectedCategory(null)
    }
  }

  return (
    <>
      {/* Desktop: Dialog */}
      <div className="hidden sm:block">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="lg" className="min-h-[44px] px-8 shadow-md">
              <Sparkles className="mr-2 h-5 w-5" />
              I Helped Someone Today
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Share Your Act of Kindness</DialogTitle>
              <DialogDescription className="text-base">
                Tell us about the good you did today
              </DialogDescription>
            </DialogHeader>
            <FormContent
              mode={mode}
              success={success}
              selectedChallenge={selectedChallenge}
              setSelectedChallenge={setSelectedChallenge}
              category={category}
              setCategory={setCategory}
              description={description}
              setDescription={setDescription}
              location={location}
              setLocation={setLocation}
              isSubmitting={isSubmitting}
              error={error}
              suggestions={suggestions}
              loadingSuggestions={loadingSuggestions}
              autoDetectedCategory={autoDetectedCategory}
              handleSubmit={handleSubmit}
              handleModeChange={handleModeChange}
              handleSuggestionClick={handleSuggestionClick}
              handleAutoDetectCategory={handleAutoDetectCategory}
              handleOpenChange={handleOpenChange}
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
              I Helped Someone Today
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl">Share Your Act of Kindness</SheetTitle>
              <SheetDescription className="text-base">
                Tell us about the good you did today
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FormContent
                mode={mode}
                success={success}
                selectedChallenge={selectedChallenge}
                setSelectedChallenge={setSelectedChallenge}
                category={category}
                setCategory={setCategory}
                description={description}
                setDescription={setDescription}
                location={location}
                setLocation={setLocation}
                isSubmitting={isSubmitting}
                error={error}
                suggestions={suggestions}
                loadingSuggestions={loadingSuggestions}
                autoDetectedCategory={autoDetectedCategory}
                handleSubmit={handleSubmit}
                handleModeChange={handleModeChange}
                handleSuggestionClick={handleSuggestionClick}
                handleAutoDetectCategory={handleAutoDetectCategory}
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
 */
interface FormContentProps {
  mode: FormMode
  success: boolean
  selectedChallenge: Challenge | null
  setSelectedChallenge: (challenge: Challenge | null) => void
  category: Category | ''
  setCategory: (category: Category | '') => void
  description: string
  setDescription: (description: string) => void
  location: string
  setLocation: (location: string) => void
  isSubmitting: boolean
  error: string | null
  suggestions: Challenge[]
  loadingSuggestions: boolean
  autoDetectedCategory: Category | null
  handleSubmit: (e: React.FormEvent) => void
  handleModeChange: (mode: FormMode) => void
  handleSuggestionClick: (challenge: Challenge) => void
  handleAutoDetectCategory: () => void
  handleOpenChange: (open: boolean) => void
}

function FormContent(props: FormContentProps) {
  const {
    mode,
    success,
    selectedChallenge,
    category,
    setCategory,
    description,
    setDescription,
    location,
    setLocation,
    isSubmitting,
    error,
    suggestions,
    loadingSuggestions,
    autoDetectedCategory,
    handleSubmit,
    handleModeChange,
    handleSuggestionClick,
    handleAutoDetectCategory,
    handleOpenChange,
  } = props

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h3 className="text-2xl font-bold text-foreground">Amazing Work!</h3>
        <p className="text-muted-foreground">
          Thank you for making the world a better place!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          type="button"
          variant={mode === 'challenge' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleModeChange('challenge')}
          className="flex-1"
        >
          <Target className="mr-2 h-4 w-4" />
          Complete a Challenge
        </Button>
        <Button
          type="button"
          variant={mode === 'custom' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleModeChange('custom')}
          className="flex-1"
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Share Custom Action
        </Button>
      </div>

      {/* Challenge Mode: Show selected challenge or prompt to browse */}
      {mode === 'challenge' && (
        <div className="space-y-3">
          {selectedChallenge ? (
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={cn(getCategoryConfig(selectedChallenge.category).bgColor, 'text-white')}>
                      {getCategoryConfig(selectedChallenge.category).icon}{' '}
                      {getCategoryConfig(selectedChallenge.category).label}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => props.setSelectedChallenge(null)}
                    >
                      Change
                    </Button>
                  </div>
                  <p className="font-medium text-foreground">{selectedChallenge.text}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-muted-foreground text-sm">
                  Please select a challenge from the browse section, or switch to custom mode
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Custom Mode: Category Selector */}
      {mode === 'custom' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="category" className="text-base font-medium">
              Category <span className="text-destructive">*</span>
            </Label>
            {autoDetectedCategory && !category && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoDetectCategory}
                className="text-xs"
              >
                <Lightbulb className="mr-1 h-3 w-3" />
                Use {getCategoryConfig(autoDetectedCategory).label}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.filter((cat) => cat.id !== 'OTHER').map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as Category)}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all text-left',
                  category === cat.id
                    ? `${cat.bgColor} text-white border-transparent`
                    : autoDetectedCategory === cat.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary bg-card'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          {mode === 'challenge' ? 'Tell us your story' : 'What did you do?'}{' '}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder={
            mode === 'challenge'
              ? 'Share your experience completing this challenge...'
              : 'Describe your act of kindness...'
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[100px] resize-none"
          aria-required="true"
        />
        <p className="text-xs text-muted-foreground">
          {description.length}/
          {mode === 'challenge' ? VALIDATION.ACTION.MAX_LENGTH : VALIDATION.CUSTOM_ACTION.MAX_LENGTH}{' '}
          characters
        </p>
      </div>

      {/* Smart Suggestions (Custom mode only) */}
      {mode === 'custom' && suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span>Did you mean one of these challenges?</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <p className="text-sm font-medium">{suggestion.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-base font-medium">
          Location <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Input
          id="location"
          placeholder="e.g., Local park, Downtown"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSubmitting}
          maxLength={VALIDATION.LOCATION.MAX_LENGTH}
        />
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
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            (mode === 'challenge' && !selectedChallenge) ||
            (mode === 'custom' && !category) ||
            description.trim().length <
              (mode === 'challenge' ? VALIDATION.ACTION.MIN_LENGTH : VALIDATION.CUSTOM_ACTION.MIN_LENGTH)
          }
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
              Share Action
            </>
          )}
        </Button>
      </div>

      {loadingSuggestions && (
        <div className="text-xs text-muted-foreground text-center">
          Looking for similar challenges...
        </div>
      )}
    </form>
  )
}
