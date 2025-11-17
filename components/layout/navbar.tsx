'use client'

import * as React from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavbarProps {
  username: string
}

export function Navbar({ username }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">
            Today I Helped
          </h1>
        </div>

        {/* Right side - Username + Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Username Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-medium text-muted-foreground">
              {username}
            </span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
