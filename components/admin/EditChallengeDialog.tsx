'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateChallenge } from '@/app/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Challenge, Category, Difficulty } from '@prisma/client'

interface EditChallengeDialogProps {
  challenge: Challenge
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditChallengeDialog({
  challenge,
  open,
  onOpenChange,
}: EditChallengeDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    text: challenge.text,
    category: challenge.category,
    difficulty: challenge.difficulty,
  })

  // Update form when challenge changes
  useEffect(() => {
    setFormData({
      text: challenge.text,
      category: challenge.category,
      difficulty: challenge.difficulty,
    })
  }, [challenge])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.text) {
      toast.error('Challenge text is required')
      return
    }

    setIsSubmitting(true)

    const result = await updateChallenge(challenge.id, {
      text: formData.text,
      category: formData.category,
      difficulty: formData.difficulty,
    })

    setIsSubmitting(false)

    if (result.success) {
      toast.success('Challenge updated successfully')
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>
              Update the challenge details. Changes will be visible immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-text">Challenge Text</Label>
              <Textarea
                id="edit-text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="min-h-[100px]"
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.text.length}/500 characters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as Category })
                  }
                  required
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEOPLE">People</SelectItem>
                    <SelectItem value="ANIMALS">Animals</SelectItem>
                    <SelectItem value="ENVIRONMENT">Environment</SelectItem>
                    <SelectItem value="COMMUNITY">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value as Difficulty })
                  }
                  required
                >
                  <SelectTrigger id="edit-difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy (2 min)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (5 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
