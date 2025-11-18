'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Search, ThumbsUp } from 'lucide-react'
import { deleteAction } from '@/app/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import type { Category } from '@prisma/client'

interface ModerationListProps {
  actions: Array<{
    id: string
    customText: string | null
    category: Category
    clapsCount: number
    completedAt: Date
    user: {
      id: string
      username: string
    }
    challenge: {
      id: string
      text: string
    } | null
  }>
}

const CATEGORY_COLORS = {
  PEOPLE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ANIMALS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ENVIRONMENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  COMMUNITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
}

export default function ModerationList({ actions: initialActions }: ModerationListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter actions based on search term
  const filteredActions = initialActions.filter((action) => {
    const text = action.customText || action.challenge?.text || ''
    const username = action.user.username
    return (
      text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleDelete = async (action: {
    id: string
    customText: string | null
    challenge: { text: string } | null
  }) => {
    const actionText =
      action.customText || action.challenge?.text || 'this action'

    if (
      !confirm(
        `Are you sure you want to delete "${actionText.substring(0, 100)}..."? This action cannot be undone.`
      )
    ) {
      return
    }

    setDeletingId(action.id)
    const result = await deleteAction(action.id)
    setDeletingId(null)

    if (result.success) {
      toast.success('Action deleted successfully')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search actions or users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Actions Table */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'No actions match your search.' : 'No actions to review.'}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-24 text-center">Claps</TableHead>
                <TableHead className="w-32">Time</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">{action.user.username}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="space-y-1">
                      <div className="line-clamp-2">
                        {action.customText || action.challenge?.text || 'No text'}
                      </div>
                      {action.customText && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        >
                          Custom Text
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={CATEGORY_COLORS[action.category]}>
                      {action.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                      <span>{action.clapsCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(action.completedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(action)}
                      disabled={deletingId === action.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
