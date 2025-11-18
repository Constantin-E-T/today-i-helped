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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, Search, Shield, ExternalLink } from 'lucide-react'
import { deleteUser } from '@/app/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/components/ui/user-avatar'

interface UserListProps {
  users: Array<{
    id: string
    username: string
    avatarSeed: string
    totalActions: number
    currentStreak: number
    longestStreak: number
    clapsReceived: number
    createdAt: Date
    lastSeenAt: Date
  }>
  currentAdminId: string
}

export default function UserList({ users: initialUsers, currentAdminId }: UserListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter users based on search term
  const filteredUsers = initialUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (user: { id: string; username: string }) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${user.username}"? This will permanently delete all their actions and data. This action cannot be undone.`
      )
    ) {
      return
    }

    const result = await deleteUser(user.id)

    if (result.success) {
      toast.success(`User ${user.username} deleted successfully`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const isActive = (lastSeenAt: Date) => {
    const daysSinceLastSeen =
      (new Date().getTime() - new Date(lastSeenAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceLastSeen < 7
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'No users match your search.' : 'No users yet.'}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                <TableHead className="text-right">Streak</TableHead>
                <TableHead className="text-right">Claps</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isCurrentAdmin = user.id === currentAdminId
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      {isActive(user.lastSeenAt) ? (
                        <div className="h-2 w-2 rounded-full bg-green-500" title="Active" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-gray-300" title="Inactive" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserAvatar username={user.username} size="sm" />
                        <div className="flex items-center gap-2">
                          <span>{user.username}</span>
                          {isCurrentAdmin && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{user.totalActions}</TableCell>
                    <TableCell className="text-right">
                      {user.currentStreak}
                      {user.longestStreak > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (max: {user.longestStreak})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{user.clapsReceived}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.lastSeenAt), { addSuffix: true })}
                    </TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/profile/${user.id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          {!isCurrentAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(user)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
