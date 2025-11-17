/**
 * Category Configuration
 * Defines all categories used throughout the platform with consistent branding
 */

import { Category } from '@prisma/client'

export type CategoryWithOther = Category | 'OTHER'

export interface CategoryConfig {
  id: CategoryWithOther
  label: string
  icon: string
  color: string
  bgColor: string
  textColor: string
  hoverColor: string
  borderColor: string
  examples: string[]
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'PEOPLE',
    label: 'Helping People',
    icon: '👥',
    color: 'blue',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    hoverColor: 'hover:bg-blue-600',
    borderColor: 'border-blue-200',
    examples: ['directions', 'groceries', 'listening', 'carrying', 'advice'],
  },
  {
    id: 'ANIMALS',
    label: 'Animal Care',
    icon: '🐾',
    color: 'green',
    bgColor: 'bg-green-500',
    textColor: 'text-green-600',
    hoverColor: 'hover:bg-green-600',
    borderColor: 'border-green-200',
    examples: ['feeding', 'shelter', 'rescue', 'walking', 'care'],
  },
  {
    id: 'ENVIRONMENT',
    label: 'Environment',
    icon: '🌱',
    color: 'emerald',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    hoverColor: 'hover:bg-emerald-600',
    borderColor: 'border-emerald-200',
    examples: ['cleaning', 'planting', 'recycling', 'composting', 'conservation'],
  },
  {
    id: 'COMMUNITY',
    label: 'Community',
    icon: '🏘️',
    color: 'purple',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-600',
    hoverColor: 'hover:bg-purple-600',
    borderColor: 'border-purple-200',
    examples: ['volunteering', 'local business', 'events', 'neighborhood', 'charity'],
  },
  {
    id: 'OTHER',
    label: 'Something Wonderful',
    icon: '✨',
    color: 'gray',
    bgColor: 'bg-gray-500',
    textColor: 'text-gray-600',
    hoverColor: 'hover:bg-gray-600',
    borderColor: 'border-gray-200',
    examples: ['creative', 'unique', 'unexpected', 'spontaneous'],
  },
] as const

export const getCategoryConfig = (
  category: CategoryWithOther
): CategoryConfig => {
  const config = CATEGORIES.find((c) => c.id === category)
  if (!config) {
    return CATEGORIES[CATEGORIES.length - 1] // Return OTHER as fallback
  }
  return config
}

/**
 * Difficulty Configuration
 */
export const DIFFICULTIES = [
  { id: 'EASY', label: 'Easy (2 min)', duration: '2 minutes' },
  { id: 'MEDIUM', label: 'Medium (5 min)', duration: '5 minutes' },
] as const

/**
 * Validation Constants
 */
export const VALIDATION = {
  ACTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
  LOCATION: {
    MAX_LENGTH: 100,
  },
  CUSTOM_ACTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 500,
  },
  IMPACT_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 300,
  },
} as const

/**
 * Smart Category Detection
 * Analyzes text and suggests the most appropriate category based on keywords
 */
export function detectCategory(text: string): Category | null {
  const lowerText = text.toLowerCase()

  let bestMatch: { category: Category; score: number } | null = null

  for (const categoryConfig of CATEGORIES) {
    // Skip OTHER category in detection
    if (categoryConfig.id === 'OTHER') continue

    // Count how many example keywords are found in the text
    const score = categoryConfig.examples.filter((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    ).length

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { category: categoryConfig.id as Category, score }
    }
  }

  return bestMatch ? bestMatch.category : null
}
