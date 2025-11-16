'use client'

import * as React from 'react'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle, Check, Copy } from 'lucide-react'

interface RecoveryCodeDisplayProps {
  recoveryCode: string
  onConfirm: () => void
  username: string
}

/**
 * Recovery Code Display Component
 * Shows new users their recovery code with:
 * - Large, readable format
 * - Copy-to-clipboard functionality with feedback
 * - Warning message about saving securely
 * - Confirmation checkbox before proceeding
 */
export function RecoveryCodeDisplay({
  recoveryCode,
  onConfirm,
  username,
}: RecoveryCodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode)
      setCopied(true)

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.error('Failed to copy:', err)
    }
  }

  const handleConfirmChange = (checked: boolean) => {
    setConfirmed(checked)
  }

  const handleProceed = () => {
    if (confirmed) {
      onConfirm()
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl">Welcome, {username}!</CardTitle>
        <CardDescription className="text-base sm:text-lg">
          Your account has been created
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recovery Code Section */}
        <div className="space-y-3">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Your Recovery Code
            </h3>
            <p className="text-xs text-muted-foreground">
              This is your only way to sign back in
            </p>
          </div>

          {/* Recovery Code Display */}
          <div className="relative group">
            <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-6 border-2 border-primary/20">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-center tracking-wider text-foreground break-all">
                {recoveryCode}
              </div>
            </div>

            {/* Copy Button */}
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 transition-all"
              aria-label={copied ? 'Copied!' : 'Copy recovery code'}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Save this code safely
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Write it down, take a screenshot, or save it in a password manager.
                You'll need it to sign back in. We can't recover it for you.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-background hover:bg-accent/5 transition-colors">
            <Checkbox
              id="confirm-saved"
              checked={confirmed}
              onCheckedChange={handleConfirmChange}
              className="mt-1"
            />
            <Label
              htmlFor="confirm-saved"
              className="text-sm leading-relaxed cursor-pointer font-medium"
            >
              I've saved my recovery code in a safe place and understand I'll need it
              to sign back in
            </Label>
          </div>

          {/* Proceed Button */}
          <Button
            onClick={handleProceed}
            disabled={!confirmed}
            className="w-full"
            size="lg"
          >
            Continue to Today I Helped
          </Button>
        </div>

        {/* Additional Tip */}
        <p className="text-xs text-center text-muted-foreground">
          Tip: Take a photo of this screen as a backup
        </p>
      </CardContent>
    </Card>
  )
}
