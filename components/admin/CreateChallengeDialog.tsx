'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { createChallenge } from '@/app/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Category, Difficulty } from '@prisma/client'

export default function CreateChallengeDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    category: '' as Category | '',
    difficulty: '' as Difficulty | '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.text || !formData.category || !formData.difficulty) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    const result = await createChallenge({
      text: formData.text,
      category: formData.category as Category,
      difficulty: formData.difficulty as Difficulty,
    })

    setIsSubmitting(false)

    if (result.success) {
      toast.success('Challenge created successfully')
      setFormData({ text: '', category: '', difficulty: '' })
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogDescription>
              Add a new challenge for users to complete. Make it inspiring and actionable!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text">Challenge Text</Label>
              <Textarea
                id="text"
                placeholder="Help a neighbor with their groceries"
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
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as Category })
                  }
                  required
                >
                  <SelectTrigger id="category">
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
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value as Difficulty })
                  }
                  required
                >
                  <SelectTrigger id="difficulty">
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Challenge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
