// scripts/seed-challenges.ts
import { PrismaClient, Category, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

const sampleChallenges = [
  // PEOPLE challenges (8 total)
  { text: "Hold the door open for someone behind you", category: "PEOPLE", difficulty: "EASY" },
  { text: "Give a genuine compliment to a colleague or friend", category: "PEOPLE", difficulty: "EASY" },
  { text: "Help someone carry their groceries or heavy bags", category: "PEOPLE", difficulty: "MEDIUM" },
  { text: "Send a thoughtful message to someone you haven't talked to in a while", category: "PEOPLE", difficulty: "EASY" },
  { text: "Let someone go ahead of you in line", category: "PEOPLE", difficulty: "EASY" },
  { text: "Call a family member just to check in", category: "PEOPLE", difficulty: "EASY" },
  { text: "Offer to help a neighbor with yard work or chores", category: "PEOPLE", difficulty: "MEDIUM" },
  { text: "Share your umbrella with someone in the rain", category: "PEOPLE", difficulty: "EASY" },

  // ANIMALS challenges (6 total)
  { text: "Refill a bird bath or leave water out for wildlife", category: "ANIMALS", difficulty: "EASY" },
  { text: "Volunteer at a local animal shelter for an hour", category: "ANIMALS", difficulty: "MEDIUM" },
  { text: "Donate pet food to an animal rescue organization", category: "ANIMALS", difficulty: "MEDIUM" },
  { text: "Put up a bird feeder in your yard or balcony", category: "ANIMALS", difficulty: "EASY" },
  { text: "Help a lost pet find their way home", category: "ANIMALS", difficulty: "MEDIUM" },
  { text: "Share educational content about animal welfare", category: "ANIMALS", difficulty: "EASY" },

  // ENVIRONMENT challenges (8 total)
  { text: "Pick up 10 pieces of litter during your walk", category: "ENVIRONMENT", difficulty: "EASY" },
  { text: "Plant a flower or herb in your garden or a community space", category: "ENVIRONMENT", difficulty: "MEDIUM" },
  { text: "Use reusable items instead of disposables for the day", category: "ENVIRONMENT", difficulty: "EASY" },
  { text: "Start composting food scraps", category: "ENVIRONMENT", difficulty: "MEDIUM" },
  { text: "Ride a bike or walk instead of driving today", category: "ENVIRONMENT", difficulty: "EASY" },
  { text: "Turn off lights and unplug devices not in use", category: "ENVIRONMENT", difficulty: "EASY" },
  { text: "Organize a neighborhood cleanup", category: "ENVIRONMENT", difficulty: "MEDIUM" },
  { text: "Bring reusable bags to the grocery store", category: "ENVIRONMENT", difficulty: "EASY" },

  // COMMUNITY challenges (8 total)
  { text: "Thank a local service worker (mail carrier, cleaner, etc.)", category: "COMMUNITY", difficulty: "EASY" },
  { text: "Support a local small business instead of a chain", category: "COMMUNITY", difficulty: "EASY" },
  { text: "Volunteer for 2 hours at a community organization", category: "COMMUNITY", difficulty: "MEDIUM" },
  { text: "Donate books or clothes to a local charity", category: "COMMUNITY", difficulty: "MEDIUM" },
  { text: "Leave a positive review for a local business", category: "COMMUNITY", difficulty: "EASY" },
  { text: "Participate in a community event or meeting", category: "COMMUNITY", difficulty: "MEDIUM" },
  { text: "Buy coffee for the person behind you in line", category: "COMMUNITY", difficulty: "EASY" },
  { text: "Share a skill by teaching someone something new", category: "COMMUNITY", difficulty: "MEDIUM" },
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