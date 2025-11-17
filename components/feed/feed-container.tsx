'use client'

import { useState, useEffect, useRef } from 'react'
import { ActionCard, type ActionCardData } from './action-card'
import { getFeedActions } from '@/app/actions/feed'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FeedContainerProps {
  initialActions: ActionCardData[]
  currentUserId?: string | null
}

const ACTIONS_PER_PAGE = 20
const AUTO_REFRESH_INTERVAL = 30000 // 30 seconds

/**
 * Feed Container Component
 *
 * Client component that wraps the feed with:
 * - Infinite scroll pagination
 * - Auto-refresh every 30 seconds
 * - "New actions available" notification
 * - Smooth animations for new content
 * - Loading states and error handling
 */
export function FeedContainer({ initialActions, currentUserId }: FeedContainerProps) {
  const [actions, setActions] = useState<ActionCardData[]>(initialActions)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialActions.length === ACTIONS_PER_PAGE)
  const [error, setError] = useState<string | null>(null)
  const [hasNewActions, setHasNewActions] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const lastRefreshTime = useRef<number>(Date.now())

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, isLoading])

  // Auto-refresh to check for new actions
  useEffect(() => {
    const interval = setInterval(async () => {
      await checkForNewActions()
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // Load more actions (infinite scroll)
  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getFeedActions(ACTIONS_PER_PAGE, actions.length)

      if (result.success) {
        if (result.data.length === 0) {
          setHasMore(false)
        } else {
          setActions((prev) => [...prev, ...result.data])
          setHasMore(result.data.length === ACTIONS_PER_PAGE)
        }
      } else {
        setError(result.error || 'Failed to load more actions')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Check for new actions (auto-refresh)
  const checkForNewActions = async () => {
    try {
      const result = await getFeedActions(1, 0)

      if (result.success && result.data.length > 0) {
        const latestAction = result.data[0]
        const currentLatest = actions[0]

        // Check if there's a new action
        if (currentLatest && latestAction.id !== currentLatest.id) {
          const latestTime = new Date(latestAction.completedAt).getTime()
          if (latestTime > lastRefreshTime.current) {
            setHasNewActions(true)
          }
        }
      }
    } catch (err) {
      // Silently fail for auto-refresh
      console.error('Auto-refresh failed:', err)
    }
  }

  // Refresh feed with new actions
  const refreshFeed = async () => {
    setIsLoading(true)
    setError(null)
    setHasNewActions(false)

    try {
      const result = await getFeedActions(ACTIONS_PER_PAGE, 0)

      if (result.success) {
        setActions(result.data)
        setHasMore(result.data.length === ACTIONS_PER_PAGE)
        lastRefreshTime.current = Date.now()

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError(result.error || 'Failed to refresh feed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Empty state
  if (actions.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 space-y-4">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
        <h3 className="text-xl font-semibold text-foreground">No actions yet</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Be the first to complete a challenge and share your act of kindness with the
          community!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* New actions notification */}
      <AnimatePresence>
        {hasNewActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <Button
              onClick={refreshFeed}
              className="shadow-lg"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New actions available
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index > 10 ? 0 : index * 0.05 }}
            >
              <ActionCard action={action} currentUserId={currentUserId} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={observerTarget} className="py-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-center py-4">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button onClick={() => loadMore()} variant="outline" size="sm">
            Try again
          </Button>
        </div>
      )}

      {/* End of feed message */}
      {!hasMore && actions.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            You've reached the end! Come back later for more acts of kindness.
          </p>
        </div>
      )}
    </div>
  )
}
