"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFilteredChallenges } from "@/app/actions/challenge";
import { SubmitAction } from "@/components/action/submit-action";
import { Category, Difficulty, type Challenge } from "@prisma/client";
import { CATEGORIES, getCategoryConfig } from "@/lib/constants";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterCategory = Category | "ALL";
type FilterDifficulty = Difficulty | "ALL";

/**
 * Challenge Discovery Hub Component
 *
 * The main challenge browsing experience showcasing multiple challenges at once.
 * Features:
 * - Display 6 challenges simultaneously in a responsive grid
 * - Category filter tabs (PEOPLE, ANIMALS, ENVIRONMENT, COMMUNITY, ALL)
 * - Difficulty toggle (Easy/Medium/All)
 * - Shuffle button to show different challenges
 * - Mobile-optimized with thumb-friendly interactions
 * - Smooth loading states and transitions
 * - Server Components for data, Client Component for interactivity
 */
export function ChallengeHub() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("ALL");
  const [difficultyFilter, setDifficultyFilter] =
    useState<FilterDifficulty>("ALL");

  // Fetch challenges based on current filters
  const fetchChallenges = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await getFilteredChallenges({
        category: categoryFilter === "ALL" ? undefined : categoryFilter,
        difficulty: difficultyFilter === "ALL" ? undefined : difficultyFilter,
        limit: 6,
        random: true,
      });

      if (result.success) {
        setChallenges(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load challenges. Please try again.");
      console.error("Error fetching challenges:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch challenges on mount and when filters change
  useEffect(() => {
    fetchChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, difficultyFilter]);

  const handleRefresh = () => {
    fetchChallenges(true);
  };

  const handleCategoryFilter = (category: FilterCategory) => {
    setCategoryFilter(category);
  };

  const handleDifficultyFilter = (difficulty: FilterDifficulty) => {
    setDifficultyFilter(difficulty);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Discover Challenges
          </h1>
        </div>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Find the perfect way to make a difference today. Browse challenges by
          category and difficulty.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Filter by Category
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((cat) => cat.id !== "OTHER").map((category) => (
            <Button
              key={category.id}
              variant={categoryFilter === category.id ? "default" : "outline"}
              size="sm"
              onClick={() =>
                handleCategoryFilter(category.id as FilterCategory)
              }
              className={cn(
                "min-h-[44px] px-4 transition-all duration-200",
                categoryFilter === category.id && category.bgColor,
                categoryFilter === category.id && "text-white shadow-md",
                categoryFilter === category.id && category.hoverColor
              )}
            >
              <span className="mr-2">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden capitalize">
                {category.id.toLowerCase()}
              </span>
            </Button>
          ))}
          <Button
            variant={categoryFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryFilter("ALL")}
            className={cn(
              "min-h-[44px] px-6 transition-all duration-200",
              categoryFilter === "ALL" && "shadow-md"
            )}
          >
            <span className="font-semibold">ALL</span>
          </Button>
        </div>
      </div>

      {/* Difficulty Filter and Refresh */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Difficulty Level
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={difficultyFilter === "EASY" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyFilter("EASY")}
                className={cn(
                  "min-h-[44px] px-4 transition-all duration-200",
                  difficultyFilter === "EASY" &&
                    "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                )}
              >
                Easy (2 min)
              </Button>
              <Button
                variant={difficultyFilter === "MEDIUM" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyFilter("MEDIUM")}
                className={cn(
                  "min-h-[44px] px-4 transition-all duration-200",
                  difficultyFilter === "MEDIUM" &&
                    "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                )}
              >
                Medium (5 min)
              </Button>
              <Button
                variant={difficultyFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDifficultyFilter("ALL")}
                className={cn(
                  "min-h-[44px] px-4 transition-all duration-200",
                  difficultyFilter === "ALL" && "shadow-md"
                )}
              >
                All Levels
              </Button>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="min-h-[44px] px-6 transition-all duration-200 hover:bg-accent"
            >
              {refreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    Show Different Challenges
                  </span>
                  <span className="sm:hidden">Shuffle</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Challenge count */}
        {!loading && challenges.length > 0 && (
          <div className="flex justify-end">
            <p className="text-xs text-muted-foreground">
              Showing {challenges.length} challenge
              {challenges.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading challenges...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <div className="text-5xl">😔</div>
              <h3 className="text-xl font-semibold text-foreground">
                Oops! Something Went Wrong
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
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-xl font-semibold text-foreground">
                No Challenges Found
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                We couldn't find any challenges matching your filters. Try
                adjusting your category or difficulty selection.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryFilter("ALL");
                  setDifficultyFilter("ALL");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges Grid */}
      {!loading && !error && challenges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual Challenge Card Component
 * Mobile-optimized with large touch targets and clear visual hierarchy
 */
interface ChallengeCardProps {
  challenge: Challenge;
}

function ChallengeCard({ challenge }: ChallengeCardProps) {
  const categoryConfig = getCategoryConfig(challenge.category);

  return (
    <Card className="shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
      <CardContent className="p-6 flex-1 space-y-4">
        {/* Category and Difficulty Badges */}
        <div className="flex justify-between items-start gap-2">
          <Badge
            className={cn(
              categoryConfig.bgColor,
              "text-white px-3 py-1",
              categoryConfig.hoverColor,
              "transition-colors duration-200"
            )}
          >
            <span className="mr-1.5 text-base">{categoryConfig.icon}</span>
            <span className="text-xs font-medium">{categoryConfig.label}</span>
          </Badge>

          {/* Difficulty Badge */}
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1",
              challenge.difficulty === "EASY"
                ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
              "text-xs font-medium"
            )}
          >
            {challenge.difficulty === "EASY" ? "2 min" : "5 min"}
          </Badge>
        </div>

        {/* Challenge Text */}
        <div className="flex-1 min-h-[80px] flex items-center">
          <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed group-hover:text-primary transition-colors duration-200">
            {challenge.text}
          </p>
        </div>
      </CardContent>

      {/* CTA Button */}
      <CardFooter className="p-6 pt-0">
        <SubmitAction challenge={challenge} />
      </CardFooter>
    </Card>
  );
}
