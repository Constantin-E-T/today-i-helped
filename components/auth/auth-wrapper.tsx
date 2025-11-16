'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/auth-modal'
import { RecoveryCodeDisplay } from '@/components/auth/recovery-code-display'
import { createUser, getUserByRecoveryCode } from '@/app/actions/user'
import {
  getUserIdFromCookie,
  setUserIdCookie,
  clearUserIdCookie,
} from '@/lib/auth-cookies'
import { Loader2 } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
}

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'new-user'; userId: string; username: string; recoveryCode: string }
  | { status: 'authenticated'; userId: string }

/**
 * Authentication Wrapper Component
 * Manages authentication state and flow for the entire app
 * - Checks for existing auth on mount
 * - Handles sign up flow with recovery code display
 * - Handles sign in flow with auth modal
 * - Manages cookie-based session
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' })
  const [showSignInModal, setShowSignInModal] = useState(false)

  // Check for existing auth on mount
  useEffect(() => {
    const userId = getUserIdFromCookie()

    if (userId) {
      setAuthState({ status: 'authenticated', userId })
    } else {
      setAuthState({ status: 'unauthenticated' })
    }
  }, [])

  const handleGetStarted = async () => {
    setAuthState({ status: 'loading' })

    const result = await createUser()

    if (result.success) {
      // Show recovery code display (don't set cookie yet)
      setAuthState({
        status: 'new-user',
        userId: result.data.id,
        username: result.data.username,
        recoveryCode: result.data.recoveryCode,
      })
    } else {
      // Show error and go back to unauthenticated
      alert(result.error || 'Failed to create account. Please try again.')
      setAuthState({ status: 'unauthenticated' })
    }
  }

  const handleRecoveryCodeConfirmed = () => {
    if (authState.status === 'new-user') {
      // User confirmed they saved the recovery code
      setUserIdCookie(authState.userId)
      setAuthState({ status: 'authenticated', userId: authState.userId })
    }
  }

  const handleAuthenticate = async (code: string) => {
    const result = await getUserByRecoveryCode(code)

    if (result.success) {
      setUserIdCookie(result.data.id)
      setAuthState({ status: 'authenticated', userId: result.data.id })
      setShowSignInModal(false)
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  }

  const handleSignOut = () => {
    clearUserIdCookie()
    setAuthState({ status: 'unauthenticated' })
  }

  // Loading state
  if (authState.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Unauthenticated state - show welcome screen
  if (authState.status === 'unauthenticated') {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center space-y-3">
              <CardTitle className="text-3xl sm:text-4xl">
                Today I Helped
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Small actions, big impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Join a community celebrating daily acts of kindness. Complete
                challenges, share your stories, and inspire others.
              </p>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleGetStarted}
                  className="w-full"
                  size="lg"
                >
                  Get Started
                </Button>

                <Button
                  onClick={() => setShowSignInModal(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Sign In
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground pt-2">
                No email or password required. Just a simple recovery code.
              </p>
            </CardContent>
          </Card>
        </div>

        <AuthModal
          open={showSignInModal}
          onOpenChange={setShowSignInModal}
          onAuthenticate={handleAuthenticate}
        />
      </>
    )
  }

  // New user state - show recovery code
  if (authState.status === 'new-user') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
        <RecoveryCodeDisplay
          recoveryCode={authState.recoveryCode}
          username={authState.username}
          onConfirm={handleRecoveryCodeConfirmed}
        />
      </div>
    )
  }

  // Authenticated state - show children (main app)
  return <>{children}</>
}
