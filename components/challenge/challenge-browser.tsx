'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getFilteredChallenges } from '@/app/actions/challenge'
import { SubmitAction } from '@/components/action/submit-action'
import { Category, Difficulty, type Challenge } from '@prisma/client'
import { CATEGORIES, getCategoryConfig } from '@/lib/constants'
import { Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterCategory = Category | 'ALL'
type FilterDifficulty = Difficulty | 'ALL'

/**
 * Challenge Browser Component
 *
 * Client Component for browsing multiple challenges with filtering.
 * Features:
 * - Grid layout displaying 4 challenges at once
 * - Category filter tabs (PEOPLE, ANIMALS, ENVIRONMENT, COMMUNITY, ALL)
 * - Difficulty filter (Easy, Medium, All levels)
 * - Shuffle/refresh button to show different challenges
 * - Mobile-friendly with responsive grid
 * - Touch-optimized interactions
 * - Loading states and error handling
 */
export function ChallengeBrowser() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('ALL')
  const [difficultyFilter, setDifficultyFilter] =
    useState<FilterDifficulty>('ALL')

  // Fetch challenges based on current filters
  const fetchChallenges = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const result = await getFilteredChallenges({
        category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        difficulty: difficultyFilter === 'ALL' ? undefined : difficultyFilter,
        limit: 4,
        random: true,
      })

      if (result.success) {
        setChallenges(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load challenges. Please try again.')
      console.error('Error fetching challenges:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch challenges on mount and when filters change
  useEffect(() => {
    fetchChallenges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, difficultyFilter])

  const handleRefresh = () => {
    fetchChallenges(true)
  }

  const handleCategoryFilter = (category: FilterCategory) => {
    setCategoryFilter(category)
  }

  const handleDifficultyFilter = (difficulty: FilterDifficulty) => {
    setDifficultyFilter(difficulty)
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Browse Challenges
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Find the perfect way to make a difference today
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((cat) => cat.id !== 'OTHER').map((category) => (
            <Button
              key={category.id}
              variant={categoryFilter === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(category.id as FilterCategory)}
              className={cn(
                'min-h-[40px] px-4 transition-all',
                categoryFilter === category.id && category.bgColor,
                categoryFilter === category.id && 'text-white',
                categoryFilter === category.id && category.hoverColor
              )}
            >
              <span className="mr-2">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.id}</span>
            </Button>
          ))}
          <Button
            variant={categoryFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryFilter('ALL')}
            className="min-h-[40px] px-4"
          >
            ALL
          </Button>
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Difficulty
          </h3>
          <div className="flex gap-2">
            <Button
              variant={difficultyFilter === 'EASY' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDifficultyFilter('EASY')}
              className="min-h-[40px]"
            >
              Easy (2 min)
            </Button>
            <Button
              variant={difficultyFilter === 'MEDIUM' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDifficultyFilter('MEDIUM')}
              className="min-h-[40px]"
            >
              Medium (5 min)
            </Button>
            <Button
              variant={difficultyFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDifficultyFilter('ALL')}
              className="min-h-[40px]"
            >
              All levels
            </Button>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="min-h-[40px] px-4"
        >
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Show me different challenges</span>
              <span className="sm:hidden">Shuffle</span>
            </>
          )}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl">😔</div>
              <h3 className="text-lg font-semibold text-foreground">
                Something went wrong
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {error}
              </p>
              <Button onClick={() => fetchChallenges()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && challenges.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl">🔍</div>
              <h3 className="text-lg font-semibold text-foreground">
                No challenges found
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Try adjusting your filters to see more challenges.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges Grid */}
      {!loading && !error && challenges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Individual Challenge Card Component
 */
interface ChallengeCardProps {
  challenge: Challenge
}

function ChallengeCard({ challenge }: ChallengeCardProps) {
  const categoryConfig = getCategoryConfig(challenge.category)

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
      <CardContent className="p-6 flex-1 space-y-4">
        {/* Category Badge */}
        <div className="flex justify-between items-start">
          <Badge
            className={cn(
              categoryConfig.bgColor,
              'text-white',
              categoryConfig.hoverColor,
              'transition-colors'
            )}
          >
            <span className="mr-1">{categoryConfig.icon}</span>
            {categoryConfig.label}
          </Badge>

          {/* Difficulty Badge */}
          <Badge
            variant="outline"
            className={cn(
              challenge.difficulty === 'EASY'
                ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
              'text-xs'
            )}
          >
            {challenge.difficulty}
          </Badge>
        </div>

        {/* Challenge Text */}
        <div className="flex-1">
          <p className="text-lg sm:text-xl font-semibold text-foreground leading-snug">
            {challenge.text}
          </p>
        </div>
      </CardContent>

      {/* CTA Button */}
      <CardFooter className="p-6 pt-0">
        <SubmitAction challenge={challenge} />
      </CardFooter>
    </Card>
  )
}
