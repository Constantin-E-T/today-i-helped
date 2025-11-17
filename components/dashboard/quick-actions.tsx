"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Zap } from "lucide-react";

/**
 * QuickActions Component
 *
 * Modern quick action cards with:
 * - Prominent call-to-action buttons
 * - Gradient backgrounds
 * - Clear descriptions
 * - Icon-driven design
 */
export function QuickActions() {
  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Jump into action and make a difference today
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/action-flow" className="group">
          <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-primary/10 w-fit">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-foreground">
                  Today's Challenge
                </h3>
                <p className="text-sm text-muted-foreground">
                  Discover and complete a new act of kindness
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/action-flow?mode=custom" className="group">
          <div className="relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-muted w-fit">
                <Plus className="h-6 w-6 text-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-foreground">
                  Custom Action
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share your own unique act of kindness
                </p>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
