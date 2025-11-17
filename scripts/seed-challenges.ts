// scripts/seed-challenges.ts
import { PrismaClient, Category, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

const sampleChallenges = [
  // PEOPLE challenges
  { text: "Hold the door open for someone behind you", category: "PEOPLE", difficulty: "EASY" },
  { text: "Give a genuine compliment to a colleague or friend", category: "PEOPLE", difficulty: "EASY" },
  { text: "Help someone carry their groceries or heavy bags", category: "PEOPLE", difficulty: "MEDIUM" },
  { text: "Send a thoughtful message to someone you haven't talked to in a while", category: "PEOPLE", difficulty: "EASY" },
  
  // ANIMALS challenges
  { text: "Refill a bird bath or leave water out for wildlife", category: "ANIMALS", difficulty: "EASY" },
  { text: "Volunteer at a local animal shelter for an hour", category: "ANIMALS", difficulty: "MEDIUM" },
  { text: "Donate pet food to an animal rescue organization", category: "ANIMALS", difficulty: "MEDIUM" },
  
  // ENVIRONMENT challenges
  { text: "Pick up 10 pieces of litter during your walk", category: "ENVIRONMENT", difficulty: "EASY" },
  { text: "Plant a flower or herb in your garden or a community space", category: "ENVIRONMENT", difficulty: "MEDIUM" },
  { text: "Use reusable items instead of disposables for the day", category: "ENVIRONMENT", difficulty: "EASY" },
  
  // COMMUNITY challenges
  { text: "Thank a local service worker (mail carrier, cleaner, etc.)", category: "COMMUNITY", difficulty: "EASY" },
  { text: "Support a local small business instead of a chain", category: "COMMUNITY", difficulty: "EASY" },
  { text: "Volunteer for 2 hours at a community organization", category: "COMMUNITY", difficulty: "MEDIUM" },
]

async function seedChallenges() {
  console.log('🌱 Seeding challenges...')
  
  for (const challenge of sampleChallenges) {
    await prisma.challenge.create({
      data: challenge as { text: string; category: Category; difficulty: Difficulty }
    })
  }
  
  console.log(`✅ Created ${sampleChallenges.length} challenges`)
  await prisma.$disconnect()
}

seedChallenges()