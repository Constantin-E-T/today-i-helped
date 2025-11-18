/**
 * Admin Seeder Script
 *
 * This script sets the first user (by createdAt) as admin.
 * Run this after applying the isAdmin migration to ensure you have at least one admin user.
 *
 * Usage:
 *   npx tsx prisma/seed-admin.ts
 *
 * Or add to package.json:
 *   "scripts": {
 *     "seed:admin": "tsx prisma/seed-admin.ts"
 *   }
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Looking for the first user in the database...')

  // Find the first user by creation date
  const firstUser = await prisma.user.findFirst({
    orderBy: {
      createdAt: 'asc',
    },
  })

  if (!firstUser) {
    console.log('⚠️  No users found in the database.')
    console.log('💡 Create a user account first, then run this script again.')
    return
  }

  console.log(`✅ Found first user: ${firstUser.username} (ID: ${firstUser.id})`)

  // Check if already admin
  if (firstUser.isAdmin) {
    console.log('✨ User is already an admin. No changes needed.')
    return
  }

  // Promote to admin
  console.log('🔄 Setting user as admin...')

  const updatedUser = await prisma.user.update({
    where: { id: firstUser.id },
    data: { isAdmin: true },
  })

  console.log(`✅ Successfully promoted ${updatedUser.username} to admin!`)
  console.log('🎉 Admin setup complete!')
}

main()
  .catch((error) => {
    console.error('❌ Error seeding admin:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
