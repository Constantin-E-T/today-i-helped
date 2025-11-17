# Database Seeding Guide

## Overview

This guide explains how to populate the database with sample challenges and use the admin challenge management system.

## Implementation Summary

### ✅ Created Components

1. **Expanded Seeding Script** (`/home/user/today-i-helped/scripts/seed-challenges.ts`)
   - 30 diverse, inspiring challenges
   - Distributed across all categories
   - Mix of EASY and MEDIUM difficulty levels

2. **Admin Challenge Management** (`/home/user/today-i-helped/app/actions/challenge.ts`)
   - `createChallenge()` - Create new challenges with validation
   - `updateChallenge()` - Update existing challenges
   - `deactivateChallenge()` - Soft delete challenges
   - `bulkCreateChallenges()` - Bulk import up to 100 challenges

3. **Environment Configuration** (`/home/user/today-i-helped/.env`)
   - DATABASE_URL configured for local PostgreSQL

## Challenge Distribution

### Category Breakdown
- **PEOPLE**: 8 challenges (26.7%)
  - Focus on helping individuals and building connections
  - Examples: Hold door, give compliments, help with groceries

- **ANIMALS**: 6 challenges (20.0%)
  - Focus on animal welfare and care
  - Examples: Refill bird bath, volunteer at shelter, donate pet food

- **ENVIRONMENT**: 8 challenges (26.7%)
  - Focus on environmental protection
  - Examples: Pick up litter, plant flowers, use reusables

- **COMMUNITY**: 8 challenges (26.7%)
  - Focus on community building and support
  - Examples: Thank service workers, support local business, volunteer

### Difficulty Breakdown
- **EASY**: 20 challenges (66.7%) - Quick 2-minute actions
- **MEDIUM**: 10 challenges (33.3%) - 5-minute actions

## Running the Seeding Script

### Prerequisites
1. PostgreSQL database running (via Docker or local installation)
2. Database connection configured in `.env` file
3. Prisma client generated

### Step-by-Step Instructions

#### 1. Start PostgreSQL (Docker)
```bash
docker compose up -d
```

#### 2. Generate Prisma Client
```bash
npx prisma generate
```

#### 3. Push Database Schema
```bash
npx prisma db push
```

#### 4. Run Seeding Script
```bash
npx tsx scripts/seed-challenges.ts
```

**Expected Output:**
```
🌱 Seeding challenges...
✅ Created 30 challenges
```

#### 5. Verify Challenges in Database
```bash
npx prisma studio
```
Navigate to the `Challenge` table to see all seeded challenges.

## Admin Challenge Management API

### Create Challenge

```typescript
import { createChallenge } from '@/app/actions/challenge'

const result = await createChallenge({
  text: "Donate blood at a local blood bank",
  category: "COMMUNITY",
  difficulty: "MEDIUM"
})

if (result.success) {
  console.log('Created challenge:', result.data.id)
} else {
  console.error('Error:', result.error)
}
```

**Validation Rules:**
- Text: 10-500 characters
- Category: PEOPLE | ANIMALS | ENVIRONMENT | COMMUNITY
- Difficulty: EASY | MEDIUM

### Update Challenge

```typescript
import { updateChallenge } from '@/app/actions/challenge'

const result = await updateChallenge('challenge-id', {
  text: "Updated challenge text",
  difficulty: "EASY",
  isActive: true
})
```

**Updatable Fields:**
- `text` (optional): New challenge text
- `category` (optional): New category
- `difficulty` (optional): New difficulty
- `isActive` (optional): Enable/disable challenge

### Deactivate Challenge (Soft Delete)

```typescript
import { deactivateChallenge } from '@/app/actions/challenge'

const result = await deactivateChallenge('challenge-id')

if (result.success) {
  console.log('Challenge deactivated')
}
```

**Note:** Soft delete preserves challenge data and associated actions.

### Bulk Create Challenges

```typescript
import { bulkCreateChallenges } from '@/app/actions/challenge'

const newChallenges = [
  { text: "Challenge 1", category: "PEOPLE", difficulty: "EASY" },
  { text: "Challenge 2", category: "ANIMALS", difficulty: "MEDIUM" },
  // ... up to 100 challenges
]

const result = await bulkCreateChallenges(newChallenges)

if (result.success) {
  console.log(`Created ${result.data.count} challenges`)
}
```

**Limits:**
- Maximum 100 challenges per batch
- All challenges validated before insertion
- Atomic operation (all or nothing)

## Sample Challenges

### PEOPLE Category (8 challenges)
1. Hold the door open for someone behind you (EASY)
2. Give a genuine compliment to a colleague or friend (EASY)
3. Help someone carry their groceries or heavy bags (MEDIUM)
4. Send a thoughtful message to someone you haven't talked to in a while (EASY)
5. Let someone go ahead of you in line (EASY)
6. Call a family member just to check in (EASY)
7. Offer to help a neighbor with yard work or chores (MEDIUM)
8. Share your umbrella with someone in the rain (EASY)

### ANIMALS Category (6 challenges)
1. Refill a bird bath or leave water out for wildlife (EASY)
2. Volunteer at a local animal shelter for an hour (MEDIUM)
3. Donate pet food to an animal rescue organization (MEDIUM)
4. Put up a bird feeder in your yard or balcony (EASY)
5. Help a lost pet find their way home (MEDIUM)
6. Share educational content about animal welfare (EASY)

### ENVIRONMENT Category (8 challenges)
1. Pick up 10 pieces of litter during your walk (EASY)
2. Plant a flower or herb in your garden or a community space (MEDIUM)
3. Use reusable items instead of disposables for the day (EASY)
4. Start composting food scraps (MEDIUM)
5. Ride a bike or walk instead of driving today (EASY)
6. Turn off lights and unplug devices not in use (EASY)
7. Organize a neighborhood cleanup (MEDIUM)
8. Bring reusable bags to the grocery store (EASY)

### COMMUNITY Category (8 challenges)
1. Thank a local service worker (mail carrier, cleaner, etc.) (EASY)
2. Support a local small business instead of a chain (EASY)
3. Volunteer for 2 hours at a community organization (MEDIUM)
4. Donate books or clothes to a local charity (MEDIUM)
5. Leave a positive review for a local business (EASY)
6. Participate in a community event or meeting (MEDIUM)
7. Buy coffee for the person behind you in line (EASY)
8. Share a skill by teaching someone something new (MEDIUM)

## Verification

### Check Random Challenge Selection
```typescript
import { getRandomChallenge } from '@/app/actions/challenge'

const result = await getRandomChallenge()
if (result.success) {
  console.log('Random challenge:', result.data.text)
}
```

### Check Active Challenges Count
```bash
# Using Prisma Studio
npx prisma studio

# Or via psql
psql postgresql://postgres:postgres@localhost:5432/todayihelped \
  -c "SELECT category, difficulty, COUNT(*) FROM \"Challenge\" WHERE \"isActive\" = true GROUP BY category, difficulty;"
```

### Expected Database State
- Total challenges: 30
- All challenges active (isActive = true)
- timesUsed: 0 (initial state)
- averageClaps: 0.0 (initial state)

## Troubleshooting

### Prisma Client Not Generated
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
docker ps | grep todayihelped-db

# Check connection
psql postgresql://postgres:postgres@localhost:5432/todayihelped -c "SELECT 1"
```

### Duplicate Challenges
```bash
# Clear existing challenges
npx prisma studio
# Delete all records in Challenge table

# Or via SQL
psql postgresql://postgres:postgres@localhost:5432/todayihelped \
  -c "DELETE FROM \"Challenge\";"
```

## Next Steps

1. **Homepage Integration**: Challenges should now appear on homepage with `getRandomChallenge()`
2. **Admin Panel**: Build UI for creating/managing challenges using the admin actions
3. **Challenge Rotation**: Implement daily challenge logic
4. **Analytics**: Track which challenges are most popular (`timesUsed` field)

## Files Modified/Created

### Created
- `/home/user/today-i-helped/.env` - Database connection configuration
- `/home/user/today-i-helped/SEEDING_GUIDE.md` - This guide

### Modified
- `/home/user/today-i-helped/scripts/seed-challenges.ts` - Expanded from 13 to 30 challenges
- `/home/user/today-i-helped/app/actions/challenge.ts` - Added 4 admin management functions

---

**Questions or Issues?** Check the logs for detailed error messages, and ensure all prerequisites are met.
