'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Home,
  LayoutDashboard,
  Award,
  Users,
  Settings,
  Moon,
  Sun,
  Monitor,
  Search,
  Heart,
  TrendingUp,
  User,
} from 'lucide-react'

/**
 * Command Palette Component
 *
 * Global command palette for quick navigation and actions.
 * Triggered with Cmd+K (Mac) or Ctrl+K (Windows/Linux).
 *
 * Features:
 * - Quick navigation to pages
 * - Theme switching
 * - Quick actions
 * - Keyboard shortcuts
 * - Search functionality
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      {/* Trigger Button (visible on mobile) */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:hidden"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
      </button>

      {/* Desktop Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/'))}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/dashboard'))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/feed'))}
            >
              <Heart className="mr-2 h-4 w-4" />
              <span>Feed</span>
              <CommandShortcut>⌘F</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/achievements'))}
            >
              <Award className="mr-2 h-4 w-4" />
              <span>Achievements</span>
              <CommandShortcut>⌘A</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/leaderboard'))}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Leaderboard</span>
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/profile'))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/complete'))}
            >
              <Heart className="mr-2 h-4 w-4" />
              <span>Complete Today's Challenge</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/dashboard#stats'))}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>View My Stats</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/achievements'))}
            >
              <Award className="mr-2 h-4 w-4" />
              <span>View Achievements</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Theme */}
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Settings */}
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/settings'))}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
