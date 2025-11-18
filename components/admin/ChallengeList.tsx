'use client'

import { useState } from 'react'
import type { Challenge } from '@prisma/client'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Power, Search } from 'lucide-react'
import { toggleChallengeActive, deleteChallenge } from '@/app/actions/admin'
import { toast } from 'sonner'
import EditChallengeDialog from './EditChallengeDialog'
import { useRouter } from 'next/navigation'

interface ChallengeListProps {
  challenges: Challenge[]
}

const CATEGORY_COLORS = {
  PEOPLE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ANIMALS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ENVIRONMENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  COMMUNITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
}

const DIFFICULTY_COLORS = {
  EASY: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  MEDIUM: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
}

export default function ChallengeList({ challenges: initialChallenges }: ChallengeListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Filter challenges based on search term
  const filteredChallenges = initialChallenges.filter((challenge) =>
    challenge.text.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleActive = async (challenge: Challenge) => {
    const result = await toggleChallengeActive(challenge.id)

    if (result.success) {
      toast.success(
        `Challenge ${result.data.isActive ? 'activated' : 'deactivated'} successfully`
      )
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async (challenge: Challenge) => {
    if (
      !confirm(
        `Are you sure you want to delete "${challenge.text.substring(0, 50)}..."? This action cannot be undone.`
      )
    ) {
      return
    }

    const result = await deleteChallenge(challenge.id)

    if (result.success) {
      toast.success('Challenge deleted successfully')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search challenges..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Challenges Table */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'No challenges match your search.' : 'No challenges yet.'}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Challenge Text</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-24">Difficulty</TableHead>
                <TableHead className="w-24 text-right">Times Used</TableHead>
                <TableHead className="w-24 text-right">Avg Claps</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChallenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell>
                    {challenge.isActive ? (
                      <div className="h-2 w-2 rounded-full bg-green-500" title="Active" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-300" title="Inactive" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-md">
                    <div className="line-clamp-2">{challenge.text}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={CATEGORY_COLORS[challenge.category]}>
                      {challenge.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={DIFFICULTY_COLORS[challenge.difficulty]}>
                      {challenge.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{challenge.timesUsed}</TableCell>
                  <TableCell className="text-right">{challenge.averageClaps.toFixed(1)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(challenge)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(challenge)}>
                          <Power className="mr-2 h-4 w-4" />
                          {challenge.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(challenge)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      {editingChallenge && (
        <EditChallengeDialog
          challenge={editingChallenge}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  )
}
