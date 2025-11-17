'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleClapOnAction } from '@/app/actions/feed'
import { cn } from '@/lib/utils'

interface ClapButtonProps {
  actionId: string
  initialClapsCount: number
  initialHasClapped: boolean
  isOwnAction?: boolean
  onClapChange?: (hasClapped: boolean, newCount: number) => void
}

/**
 * Clap Button Component
 *
 * Interactive button for liking/clapping actions with:
 * - Optimistic UI updates for instant feedback
 * - Heart icon with fill animation
 * - Smooth count transitions
 * - Error handling with rollback
 */
export function ClapButton({
  actionId,
  initialClapsCount,
  initialHasClapped,
  isOwnAction = false,
  onClapChange,
}: ClapButtonProps) {
  const [hasClapped, setHasClapped] = useState(initialHasClapped)
  const [clapsCount, setClapsCount] = useState(initialClapsCount)
  const [isPending, startTransition] = useTransition()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClap = async () => {
    // Prevent clapping own actions
    if (isOwnAction) return

    // Prevent double-clicks during animation
    if (isPending || isAnimating) return

    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // Optimistic update
    const previousHasClapped = hasClapped
    const previousCount = clapsCount
    const newHasClapped = !hasClapped
    const newCount = newHasClapped ? clapsCount + 1 : clapsCount - 1

    setHasClapped(newHasClapped)
    setClapsCount(newCount)
    onClapChange?.(newHasClapped, newCount)

    // Server action
    startTransition(async () => {
      const result = await toggleClapOnAction(actionId)

      if (!result.success) {
        // Rollback on error
        setHasClapped(previousHasClapped)
        setClapsCount(previousCount)
        onClapChange?.(previousHasClapped, previousCount)
        console.error('Failed to toggle clap:', result.error)
      }
    })
  }

  // For own actions, show non-interactive display
  if (isOwnAction) {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground cursor-default"
        title="You can't clap your own action"
      >
        <Heart className="h-4 w-4" />
        <span className="text-sm font-medium tabular-nums">{clapsCount}</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleClap}
      disabled={isPending}
      className={cn(
        'group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200',
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        hasClapped
          ? 'text-red-500 hover:text-red-600'
          : 'text-muted-foreground hover:text-foreground'
      )}
      aria-label={hasClapped ? 'Remove clap' : 'Add clap'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all duration-200',
          hasClapped && 'fill-current',
          isAnimating && 'scale-125'
        )}
      />
      <span className="text-sm font-medium tabular-nums">{clapsCount}</span>
    </button>
  )
}
