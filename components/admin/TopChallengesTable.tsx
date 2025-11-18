'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, ThumbsUp } from 'lucide-react'

interface TopChallengesTableProps {
  challenges: Array<{
    id: string
    text: string
    timesUsed: number
    averageClaps: number
  }>
}

export default function TopChallengesTable({ challenges }: TopChallengesTableProps) {
  if (challenges.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No challenge data available yet.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Challenge</TableHead>
            <TableHead className="w-32 text-right">Times Used</TableHead>
            <TableHead className="w-32 text-right">Avg Claps</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.map((challenge, index) => (
            <TableRow key={challenge.id}>
              <TableCell>
                <div className="flex items-center justify-center">
                  {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                  {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                  {index === 2 && <Trophy className="h-5 w-5 text-orange-500" />}
                  {index > 2 && <span className="text-muted-foreground">#{index + 1}</span>}
                </div>
              </TableCell>
              <TableCell className="font-medium max-w-md">
                <div className="line-clamp-2">{challenge.text}</div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{challenge.timesUsed.toLocaleString()}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{challenge.averageClaps.toFixed(1)}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
