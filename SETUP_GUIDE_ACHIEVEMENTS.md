# User Profiles & Achievements System - Setup Guide

## ✅ Implementation Complete

The User Profiles & Personal Journey System has been fully implemented! This guide will help you set up and activate the new features.

---

## 🗄️ Database Migration

The Prisma schema has been updated with two new tables:
- `Achievement` - Stores all available achievement definitions
- `UserAchievement` - Tracks which users have earned which achievements

### Run the Migration

```bash
# If you encounter network issues, use:
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev --name add_achievements_system

# Or simply:
npx prisma migrate dev --name add_achievements_system
```

---

## 🌱 Seed Achievements

After running the migration, seed the achievement definitions into the database:

### Option 1: Create a Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { ACHIEVEMENT_DEFINITIONS } from '../lib/achievements'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding achievements...')

  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      create: achievement,
      update: {
        name: achievement.name,
        description: achievement.description,
        badgeIcon: achievement.badgeIcon,
        category: achievement.category,
        requirement: achievement.requirement,
        order: achievement.order,
      },
    })
  }

  console.log(`✓ Seeded ${ACHIEVEMENT_DEFINITIONS.length} achievements`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Then run:
```bash
npx tsx prisma/seed.ts
```

### Option 2: Call the Server Action

You can also use the built-in server action. Create a temporary admin page or run this in a Server Component:

```typescript
import { seedAchievements } from '@/app/actions/achievements'

// Call this once to seed achievements
await seedAchievements()
```

---

## 🔗 Integration with Action Creation

To automatically award achievements when users complete actions, update the action creation flow:

### Update `app/actions/action.ts`

Add achievement checking to the `createAction` function:

```typescript
import { checkAndAwardAchievements } from './achievements'
import { updateUserStreak } from './dashboard'

export async function createAction(data: CreateActionInput): Promise<CreateActionResponse> {
  try {
    // ... existing action creation code ...

    const action = await prisma.$transaction(async (tx) => {
      // ... existing transaction code ...
      return newAction
    })

    // Update user streak after action creation
    await updateUserStreak(data.userId)

    // Check and award achievements
    const achievementResult = await checkAndAwardAchievements(data.userId)

    if (achievementResult.success && achievementResult.newAchievements.length > 0) {
      logger.info(
        { userId: data.userId, achievements: achievementResult.newAchievements.map(a => a.name) },
        'New achievements earned'
      )
      // Optional: You could return the new achievements to show a celebration modal
    }

    return { success: true, data: action }
  } catch (error: unknown) {
    // ... existing error handling ...
  }
}
```

---

## 🎯 New Features Available

### 1. **Personal Dashboard** (`/dashboard`)
- User statistics overview
- Recent actions timeline
- Streak counter with motivational messaging
- Quick action buttons
- Achievement showcase

### 2. **Public Profiles** (`/profile/[username]`)
- Profile header with stats
- Achievement showcase
- Impact summary by category
- Public action timeline

### 3. **Achievements Page** (`/achievements`)
- All available achievements organized by category
- Progress tracking for locked achievements
- Visual badges for earned achievements
- Filter by: All, Starter, Streak, Impact, Category

### 4. **Updated Navigation**
- Added "Dashboard" to main navigation
- Avatar now links to user's profile
- "My Profile" added to user dropdown menu

---

## 🎨 Achievement Categories

### Starter Achievements
- **First Helper** - Complete your first action (1 action)
- **Week One** - Been helping for a week (7 days)
- **Category Explorer** - Complete actions in all 4 categories

### Streak Achievements
- **3-Day Streak** - Help for 3 consecutive days
- **7-Day Streak** - Help for 7 consecutive days
- **30-Day Streak** - Help for 30 consecutive days

### Impact Achievements
- **Helper** - 10 total actions
- **Champion** - 25 total actions
- **Hero** - 50 total actions
- **Legend** - 100 total actions

### Category Achievements
- **People Helper** - 10 actions helping people
- **Animal Friend** - 10 actions helping animals
- **Eco Warrior** - 10 environmental actions
- **Community Builder** - 10 community actions

---

## 📝 Next Steps (Optional Enhancements)

### 1. Achievement Notifications
Add celebratory notifications when users earn achievements:
- Use confetti animation (canvas-confetti is already installed)
- Show a modal/toast with the achievement details
- Add sound effects for achievement unlocks

### 2. Social Features
- Share profile on social media
- Follow/following system
- Achievement leaderboards

### 3. Advanced Streaks
- Freeze days (allow 1 day miss per week)
- Streak recovery options
- Weekly/monthly streak milestones

### 4. More Achievements
- Special event achievements
- Seasonal achievements
- Location-based achievements
- Time-based achievements (morning helper, night owl)

---

## 🧪 Testing Checklist

- [ ] Run database migration successfully
- [ ] Seed achievements into database
- [ ] Test Dashboard page loads with user data
- [ ] Test Profile page with different usernames
- [ ] Test Achievements page shows all categories
- [ ] Verify navigation includes Dashboard link
- [ ] Verify avatar links to profile
- [ ] Complete an action and verify streak updates
- [ ] Complete 10 actions and verify "Helper" achievement unlocks
- [ ] Test mobile responsiveness on all new pages

---

## 🎉 Congratulations!

The User Profiles & Personal Journey System is now ready to motivate your users and celebrate their kindness journey!

For questions or issues, refer to the detailed code comments in:
- `lib/achievements.ts` - Achievement definitions and logic
- `app/actions/achievements.ts` - Server actions for achievements
- `app/actions/dashboard.ts` - Dashboard data and streak logic
- `app/actions/profile.ts` - Profile data retrieval
