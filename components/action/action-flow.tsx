'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChallengeBrowser } from '@/components/challenge/challenge-browser'
import { CreateCustomAction } from '@/components/action/create-custom-action'
import { Target, Sparkles, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

type ActionMode = 'browse' | 'custom'

/**
 * Action Flow Component
 *
 * Unified component that handles both challenge browsing and custom action creation.
 * Provides a seamless dual-path experience:
 * - Path 1: Browse and complete suggested challenges
 * - Path 2: Create and share custom acts of kindness
 *
 * Features:
 * - Tabbed interface for mode switching
 * - Clear visual distinction between paths
 * - Integrated challenge browser
 * - Prominent custom action creator
 * - Mobile-first responsive design
 * - Smooth transitions between modes
 */
export function ActionFlow() {
  const [mode, setMode] = useState<ActionMode>('browse')

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 pb-2">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 fill-red-500 animate-pulse" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Make a Difference Today
          </h1>
        </div>
        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          Choose your path to kindness: complete a suggested challenge or share
          your own act of goodness.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as ActionMode)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/50">
          <TabsTrigger
            value="browse"
            className={cn(
              'min-h-[56px] px-4 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200',
              'text-sm sm:text-base font-medium'
            )}
          >
            <Target className="mr-2 h-5 w-5" />
            <span className="hidden sm:inline">Complete a Challenge</span>
            <span className="sm:hidden">Challenges</span>
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className={cn(
              'min-h-[56px] px-4 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200',
              'text-sm sm:text-base font-medium'
            )}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            <span className="hidden sm:inline">Share Custom Action</span>
            <span className="sm:hidden">Custom</span>
          </TabsTrigger>
        </TabsList>

        {/* Browse Challenges Tab */}
        <TabsContent value="browse" className="mt-6 space-y-6">
          <IntroCard
            icon={<Target className="h-12 w-12 text-primary" />}
            title="Browse Suggested Challenges"
            description="Explore our curated collection of kind acts. Filter by category and difficulty to find the perfect challenge for you today."
          />
          <ChallengeBrowser />
        </TabsContent>

        {/* Custom Action Tab */}
        <TabsContent value="custom" className="mt-6 space-y-6">
          <IntroCard
            icon={<Sparkles className="h-12 w-12 text-amber-500" />}
            title="Share Your Act of Kindness"
            description="Did something kind that's not on our list? Share your unique act of goodness with the community and inspire others."
          />

          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Create Your Own Action
                  </h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Share something wonderful you did that made the world a
                    little brighter. Every act of kindness counts.
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <CreateCustomAction />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground text-center">
                      Examples of custom actions:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <span className="text-base">👥</span>
                        <span>Helped a neighbor with groceries</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <span className="text-base">🐾</span>
                        <span>Fed a stray animal</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <span className="text-base">🌱</span>
                        <span>Planted flowers in the park</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                        <span className="text-base">🏘️</span>
                        <span>Organized a community cleanup</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Action Buttons */}
      <div className="pt-8 border-t border-border">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Already helped someone today?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              onClick={() => setMode('custom')}
              className="min-h-[48px] px-8 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Share Your Story
            </Button>
            <span className="text-sm text-muted-foreground">or</span>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setMode('browse')}
              className="min-h-[48px] px-8 hover:bg-accent transition-all duration-200"
            >
              <Target className="mr-2 h-5 w-5" />
              Find a Challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Intro Card Component
 * Displays contextual information for each tab
 */
interface IntroCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function IntroCard({ icon, title, description }: IntroCardProps) {
  return (
    <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex-shrink-0">{icon}</div>
          <div className="space-y-1 flex-1">
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
