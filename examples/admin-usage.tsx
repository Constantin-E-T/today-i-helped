/**
 * EXAMPLE: Admin System Usage
 *
 * This file demonstrates how to use the admin system in various scenarios.
 * These are example components showing best practices.
 *
 * DO NOT import this file directly - it's for reference only.
 */

// ============================================================================
// EXAMPLE 1: Server Component - Admin Dashboard Page
// ============================================================================

import { getCurrentUserId, isUserAdmin } from '@/lib/admin'
import { getAllChallenges } from '@/app/actions/admin'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  // Get current user ID from server-side cookies
  const userId = await getCurrentUserId()

  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/login')
  }

  // Check if user is admin
  const isAdmin = await isUserAdmin(userId)

  // Show unauthorized page if not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-destructive">Unauthorized</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to access this page.
        </p>
      </div>
    )
  }

  // Fetch all challenges (including inactive ones)
  const challengesResult = await getAllChallenges()

  if (!challengesResult.success) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="text-muted-foreground mt-2">{challengesResult.error}</p>
      </div>
    )
  }

  const challenges = challengesResult.data
  const activeChallenges = challenges.filter(c => c.isActive)
  const inactiveChallenges = challenges.filter(c => !c.isActive)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Challenges" value={challenges.length} />
          <StatCard label="Active" value={activeChallenges.length} />
          <StatCard label="Inactive" value={inactiveChallenges.length} />
        </div>

        <ChallengeManagementTable challenges={challenges} />
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Client Component - Create Challenge Form
// ============================================================================

'use client'

import { useState } from 'react'
import { createChallenge } from '@/app/actions/admin'
import { Category, Difficulty } from '@prisma/client'

export function CreateChallengeForm() {
  const [text, setText] = useState('')
  const [category, setCategory] = useState<Category>(Category.PEOPLE)
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const result = await createChallenge({
      text,
      category,
      difficulty,
    })

    setIsSubmitting(false)

    if (result.success) {
      setSuccess(true)
      setText('')
      console.log('Created challenge:', result.data)
      // Reset form after 2 seconds
      setTimeout(() => setSuccess(false), 2000)
    } else {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Create New Challenge</h2>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded">
          Challenge created successfully!
        </div>
      )}

      <div>
        <label htmlFor="text" className="block text-sm font-medium mb-2">
          Challenge Text
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          className="w-full border rounded px-3 py-2"
          rows={4}
          placeholder="Enter challenge text (10-500 characters)..."
          minLength={10}
          maxLength={500}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {text.length}/500 characters
        </p>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          disabled={isSubmitting}
          className="w-full border rounded px-3 py-2"
        >
          <option value={Category.PEOPLE}>People</option>
          <option value={Category.ANIMALS}>Animals</option>
          <option value={Category.ENVIRONMENT}>Environment</option>
          <option value={Category.COMMUNITY}>Community</option>
        </select>
      </div>

      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          disabled={isSubmitting}
          className="w-full border rounded px-3 py-2"
        >
          <option value={Difficulty.EASY}>Easy (2 minutes)</option>
          <option value={Difficulty.MEDIUM}>Medium (5 minutes)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || text.length < 10}
        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Challenge'}
      </button>
    </form>
  )
}

// ============================================================================
// EXAMPLE 3: Client Component - Challenge Management Actions
// ============================================================================

'use client'

import {
  updateChallenge,
  toggleChallengeActive,
  deleteChallenge,
} from '@/app/actions/admin'
import type { Challenge } from '@prisma/client'

export function ChallengeActions({ challenge }: { challenge: Challenge }) {
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleToggle() {
    if (!confirm(`${challenge.isActive ? 'Deactivate' : 'Activate'} this challenge?`)) {
      return
    }

    setIsUpdating(true)
    const result = await toggleChallengeActive(challenge.id)
    setIsUpdating(false)

    if (result.success) {
      console.log('Challenge toggled:', result.data)
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to PERMANENTLY delete this challenge?')) {
      return
    }

    if (!confirm('This action cannot be undone. Continue?')) {
      return
    }

    setIsUpdating(true)
    const result = await deleteChallenge(challenge.id)
    setIsUpdating(false)

    if (result.success) {
      console.log('Challenge deleted:', result.data)
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleEdit() {
    const newText = prompt('Edit challenge text:', challenge.text)
    if (!newText || newText === challenge.text) {
      return
    }

    setIsUpdating(true)
    const result = await updateChallenge(challenge.id, {
      text: newText,
    })
    setIsUpdating(false)

    if (result.success) {
      console.log('Challenge updated:', result.data)
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleEdit}
        disabled={isUpdating}
        className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Edit
      </button>
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={`px-3 py-1 rounded disabled:opacity-50 ${
          challenge.isActive
            ? 'bg-yellow-500 text-white'
            : 'bg-green-500 text-white'
        }`}
      >
        {challenge.isActive ? 'Deactivate' : 'Activate'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isUpdating}
        className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Conditional Admin UI in Regular Page
// ============================================================================

import { getCurrentUserId, isUserAdmin } from '@/lib/admin'
import Link from 'next/link'

export async function Header() {
  const userId = await getCurrentUserId()
  const isAdmin = userId ? await isUserAdmin(userId) : false

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Today I Helped
        </Link>

        <div className="flex gap-4">
          <Link href="/feed">Feed</Link>
          <Link href="/challenges">Challenges</Link>

          {/* Only show admin link to admin users */}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-primary font-semibold"
            >
              Admin Dashboard
            </Link>
          )}

          {userId ? (
            <Link href="/profile">Profile</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
      </nav>
    </header>
  )
}

// ============================================================================
// EXAMPLE 5: Server Action with Error Handling Pattern
// ============================================================================

'use client'

import { updateChallenge } from '@/app/actions/admin'
import type { Category, Difficulty } from '@prisma/client'

export function BulkUpdateForm({ challengeIds }: { challengeIds: string[] }) {
  const [results, setResults] = useState<{ id: string; success: boolean; error?: string }[]>([])

  async function handleBulkActivate() {
    const newResults = []

    for (const id of challengeIds) {
      const result = await updateChallenge(id, { isActive: true })
      newResults.push({
        id,
        success: result.success,
        error: result.success ? undefined : result.error,
      })
    }

    setResults(newResults)
  }

  return (
    <div>
      <button
        onClick={handleBulkActivate}
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
      >
        Activate All ({challengeIds.length})
      </button>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className={`p-2 rounded ${
                result.success ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {result.id}: {result.success ? 'Success' : `Error: ${result.error}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Helper Components (for examples above)
// ============================================================================

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  )
}

function ChallengeManagementTable({ challenges }: { challenges: Challenge[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left">Text</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Difficulty</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((challenge) => (
            <tr key={challenge.id} className="border-t">
              <td className="px-4 py-2">{challenge.text}</td>
              <td className="px-4 py-2">{challenge.category}</td>
              <td className="px-4 py-2">{challenge.difficulty}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    challenge.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {challenge.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-2">
                <ChallengeActions challenge={challenge} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
