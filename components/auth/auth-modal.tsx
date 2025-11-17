"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { normalizeRecoveryCode } from "@/lib/recovery-code";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticate: (
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Format recovery code input as user types
 * Automatically adds dashes at positions 4 and 8
 * Returns formatted value and cursor position
 */
function formatRecoveryCodeInput(value: string): {
  formatted: string;
  cursorOffset: number;
} {
  // Remove all non-alphanumeric characters and convert to uppercase
  const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  // Limit to 12 characters
  const limited = cleaned.substring(0, 12);

  // Add dashes at positions 4 and 8
  let formatted = "";
  let cursorOffset = 0;

  for (let i = 0; i < limited.length; i++) {
    if (i === 4 || i === 8) {
      formatted += "-";
      cursorOffset++;
    }
    formatted += limited[i];
  }

  return { formatted, cursorOffset };
}

/**
 * Form Content Component
 * Extracted to prevent remounting on state changes
 */
interface FormContentProps {
  code: string;
  error: string | null;
  isPending: boolean;
  isCodeComplete: boolean;
  canSubmit: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onOpenChange: (open: boolean) => void;
}

function FormContent({
  code,
  error,
  isPending,
  isCodeComplete,
  canSubmit,
  inputRef,
  handleInputChange,
  handleSubmit,
  onOpenChange,
}: FormContentProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-2">
        <Label htmlFor="recovery-code" className="text-sm font-medium">
          Recovery Code
        </Label>
        <Input
          ref={inputRef}
          id="recovery-code"
          type="text"
          placeholder="XXXX-XXXX-XXXX"
          value={code}
          onChange={handleInputChange}
          disabled={isPending}
          className={`font-mono text-lg tracking-wider transition-all ${
            error
              ? "border-destructive focus-visible:ring-destructive"
              : isCodeComplete
              ? "border-green-500 focus-visible:ring-green-500"
              : ""
          }`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "code-error" : undefined}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck="false"
          maxLength={14}
        />
        <p className="text-xs text-muted-foreground">
          Enter the code you saved when you first joined
        </p>

        {error && (
          <div
            id="code-error"
            className="flex items-start gap-2 text-sm text-destructive animate-in fade-in-50 slide-in-from-top-1"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          className="w-full"
          disabled={!canSubmit}
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AuthModal({
  open,
  onOpenChange,
  onAuthenticate,
}: AuthModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setCode("");
      setError(null);
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;

    // Format the input
    const { formatted } = formatRecoveryCodeInput(input);

    // Update state
    setCode(formatted);
    setError(null);

    // Restore cursor position accounting for auto-added dashes
    requestAnimationFrame(() => {
      if (inputRef.current) {
        let newCursorPos = cursorPosition;

        // If we just typed a character that triggered a dash insertion, move cursor forward
        if (
          formatted.length > input.length &&
          (cursorPosition === 5 || cursorPosition === 10)
        ) {
          newCursorPos = cursorPosition + 1;
        }

        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate format
    const normalized = normalizeRecoveryCode(code);
    if (!normalized) {
      setError("Invalid recovery code format. Please enter a valid code.");
      return;
    }

    // Clear any existing errors
    setError(null);

    // Call authentication handler
    startTransition(async () => {
      try {
        const result = await onAuthenticate(normalized);

        if (!result.success) {
          setError(result.error || "Authentication failed. Please try again.");
        }
        // On success, parent component will handle closing modal and navigation
      } catch (err) {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  const isCodeComplete = code.replace(/-/g, "").length === 12;
  const canSubmit = isCodeComplete && !isPending;

  return (
    <>
      {/* Desktop: Dialog */}
      <div className="hidden sm:block">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome Back!</DialogTitle>
              <DialogDescription className="text-base">
                Enter your recovery code to continue
              </DialogDescription>
            </DialogHeader>
            <FormContent
              code={code}
              error={error}
              isPending={isPending}
              isCodeComplete={isCodeComplete}
              canSubmit={canSubmit}
              inputRef={inputRef}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              onOpenChange={onOpenChange}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: Sheet (Bottom Drawer) */}
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle className="text-2xl">Welcome Back!</SheetTitle>
              <SheetDescription className="text-base">
                Enter your recovery code to continue
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FormContent
                code={code}
                error={error}
                isPending={isPending}
                isCodeComplete={isCodeComplete}
                canSubmit={canSubmit}
                inputRef={inputRef}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                onOpenChange={onOpenChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
