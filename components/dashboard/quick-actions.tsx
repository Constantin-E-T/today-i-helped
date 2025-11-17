'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Plus, Zap } from 'lucide-react'

/**
 * QuickActions Component
 * Provides quick access buttons for common actions
 * Shortcuts to complete today's challenge and create custom actions
 */
export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/action-flow" className="block">
          <Button
            size="lg"
            className="w-full justify-start gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Sparkles className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Complete Today's Challenge</span>
              <span className="text-xs opacity-90">Discover and complete a new action</span>
            </div>
          </Button>
        </Link>

        <Link href="/action-flow?mode=custom" className="block">
          <Button
            size="lg"
            variant="outline"
            className="w-full justify-start gap-3 hover:bg-accent"
          >
            <Plus className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Create Custom Action</span>
              <span className="text-xs text-muted-foreground">
                Share your own act of kindness
              </span>
            </div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
