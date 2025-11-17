import * as React from 'react'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
  /**
   * Maximum width of the content container
   * @default '2xl'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full'
  /**
   * Whether to add vertical padding
   * @default true
   */
  withPadding?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '4xl': 'max-w-[1600px]',
  '6xl': 'max-w-[1800px]',
  full: 'max-w-full',
}

/**
 * MainLayout Component
 * Provides consistent responsive layout structure for authenticated pages
 *
 * Features:
 * - Responsive horizontal padding (mobile-first)
 * - Configurable max-width containers
 * - Safe area insets for notched devices
 * - Proper vertical spacing
 * - Centered content containers
 *
 * Usage:
 * ```tsx
 * <MainLayout maxWidth="lg">
 *   <YourContent />
 * </MainLayout>
 * ```
 */
export function MainLayout({
  children,
  className,
  maxWidth = '2xl',
  withPadding = true,
}: MainLayoutProps) {
  return (
    <main
      className={cn(
        'min-h-[calc(100vh-4rem)]', // Account for navbar height (h-16 = 4rem)
        'w-full',
        className
      )}
    >
      <div
        className={cn(
          'container mx-auto',
          maxWidthClasses[maxWidth],
          'px-4 sm:px-6 lg:px-8', // Responsive horizontal padding
          withPadding && 'py-6 sm:py-8 lg:py-12', // Responsive vertical padding
        )}
      >
        {children}
      </div>
    </main>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  /**
   * Section title (optional)
   */
  title?: string
  /**
   * Section description (optional)
   */
  description?: string
}

/**
 * Section Component
 * Used within MainLayout to create distinct content sections
 *
 * Usage:
 * ```tsx
 * <MainLayout>
 *   <Section title="Daily Challenge" description="Complete today's act of kindness">
 *     <ChallengeCard />
 *   </Section>
 * </MainLayout>
 * ```
 */
export function Section({ children, className, title, description }: SectionProps) {
  return (
    <section className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-base sm:text-lg text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

interface GridProps {
  children: React.ReactNode
  className?: string
  /**
   * Number of columns at different breakpoints
   * @default { mobile: 1, tablet: 2, desktop: 3 }
   */
  cols?: {
    mobile?: 1 | 2
    tablet?: 2 | 3 | 4
    desktop?: 2 | 3 | 4 | 5 | 6
  }
  /**
   * Gap between grid items
   * @default 'md'
   */
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-10',
}

/**
 * Grid Component
 * Responsive grid layout for cards, items, etc.
 *
 * Usage:
 * ```tsx
 * <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 * ```
 */
export function Grid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
}: GridProps) {
  const { mobile = 1, tablet = 2, desktop = 3 } = cols

  const gridCols = cn(
    mobile === 1 ? 'grid-cols-1' : 'grid-cols-2',
    tablet === 2 && 'sm:grid-cols-2',
    tablet === 3 && 'sm:grid-cols-3',
    tablet === 4 && 'sm:grid-cols-4',
    desktop === 2 && 'lg:grid-cols-2',
    desktop === 3 && 'lg:grid-cols-3',
    desktop === 4 && 'lg:grid-cols-4',
    desktop === 5 && 'lg:grid-cols-5',
    desktop === 6 && 'lg:grid-cols-6'
  )

  return (
    <div className={cn('grid', gridCols, gapClasses[gap], className)}>
      {children}
    </div>
  )
}

/**
 * Container Component
 * Simple centered container with responsive padding
 * Use this for one-off layouts that don't need MainLayout
 */
export function Container({
  children,
  className,
  maxWidth = '2xl',
}: {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full'
}) {
  return (
    <div
      className={cn(
        'container mx-auto',
        maxWidthClasses[maxWidth],
        'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  )
}
