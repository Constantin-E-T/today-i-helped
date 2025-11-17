# Development Instructions - User Profiles & Personal Journey Phase

## 🎯 **Current Phase: User Profiles & Personal Journey System**

### **Context**
"Today I Helped" platform has a complete MVP with authentication, challenge discovery, community feed, and admin systems. We're now building personal journey features to motivate continued participation through progress tracking and achievements.

### **Phase Goals**
1. **Personal Dashboards** - Show individual impact and progress
2. **Public Profiles** - Social proof of kindness journey  
3. **Achievement System** - Badge-based milestone recognition
4. **Streak Tracking** - Daily habit formation mechanics

---

## 📋 **Implementation Tasks**

### **Task 1: Personal Dashboard** 
**File**: `app/dashboard/page.tsx`
**Components**: Dashboard layout with stats overview
**Features**:
- Total actions count, categories helped, days active
- Recent actions timeline (last 10 with dates)
- Current streak counter with visual progress
- Quick action buttons for challenges and custom actions
- Achievement showcase section

### **Task 2: Public User Profile**
**File**: `app/profile/[username]/page.tsx` 
**Components**: Public profile display
**Features**:
- Profile header: avatar, username, join date, total actions
- Public action timeline (newest first)
- Impact summary: favorite categories, preferred challenges  
- Achievement badge display
- Follow button placeholder for future social features

### **Task 3: Achievement System**
**Files**: 
- `components/achievements/achievement-badge.tsx`
- `lib/achievements.ts`
- `app/actions/achievements.ts`
**Features**:
- **Starter Badges**: First Action, First Week, Category Explorer
- **Streak Badges**: 3-day, 7-day, 30-day streaks
- **Impact Badges**: Helper (10), Champion (25), Hero (50) actions  
- **Category Badges**: People Helper, Animal Friend, Eco Warrior, Community Builder
- Badge earning logic and display system

### **Task 4: Navigation Integration**
**Files**: Update existing navigation components
**Features**:
- Add "Dashboard" to navigation menu
- Link user avatar to their profile page
- Update mobile drawer with new sections
- Add breadcrumbs for profile navigation

---

## 🛠️ **Technical Requirements**

### **Database Schema Updates**
```sql
-- Add to User table
ALTER TABLE "User" ADD COLUMN "totalActions" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "currentStreak" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "longestStreak" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "joinDate" TIMESTAMP DEFAULT NOW();

-- New Achievement table
CREATE TABLE "Achievement" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badgeIcon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement INTEGER NOT NULL
);

-- User achievements junction table  
CREATE TABLE "UserAchievement" (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES "User"(id),
  achievementId TEXT REFERENCES "Achievement"(id),
  earnedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, achievementId)
);
```

### **Server Actions Needed**
```typescript
// app/actions/profile.ts
export async function getUserProfile(username: string)
export async function getUserStats(userId: string)  
export async function getUserActions(userId: string, limit?: number)

// app/actions/achievements.ts
export async function checkAndAwardAchievements(userId: string)
export async function getUserAchievements(userId: string)
export async function getAllAchievements()

// app/actions/dashboard.ts  
export async function getDashboardData(userId: string)
export async function updateUserStreak(userId: string)
```

### **Component Structure**
```
components/
├── dashboard/
│   ├── stats-overview.tsx
│   ├── recent-actions.tsx
│   ├── streak-counter.tsx
│   └── quick-actions.tsx
├── profile/
│   ├── profile-header.tsx
│   ├── action-timeline.tsx
│   └── impact-summary.tsx
├── achievements/
│   ├── achievement-badge.tsx
│   ├── achievement-grid.tsx
│   └── achievement-progress.tsx
└── shared/
    ├── user-avatar.tsx
    └── progress-bar.tsx
```

---

## 🎨 **Design Guidelines**

### **Visual Design**
- **Consistent**: Match existing card/button patterns
- **Mobile-First**: Touch-friendly with proper spacing
- **Celebratory**: Use animations for achievements and milestones
- **Progress-Focused**: Clear visual indicators of journey and growth
- **Accessible**: Proper contrast, ARIA labels, keyboard navigation

### **User Experience**
- **Motivation-Driven**: Highlight progress and upcoming milestones
- **Social Proof**: Show impact in meaningful, shareable ways
- **Habit Formation**: Visual streak counters and daily reminders
- **Discovery**: Easy navigation between dashboard, profile, and feed

### **Color Coding**
- **Categories**: Maintain existing color scheme (PEOPLE=blue, ANIMALS=green, etc.)
- **Achievements**: Use gold/bronze/silver progression for badge tiers
- **Progress**: Green for positive growth, warm colors for milestones

---

## ✅ **Success Criteria**

### **Functional Requirements**
- [ ] Users can view personal dashboard with all stats
- [ ] Public profiles display user's kindness journey
- [ ] Achievement badges auto-award based on actions
- [ ] Streak tracking updates daily and persists
- [ ] Navigation integrates smoothly with existing system

### **Performance Requirements**
- [ ] Dashboard loads in <2 seconds
- [ ] Profile pages are shareable via URL
- [ ] Achievement checks don't slow down action submission
- [ ] Mobile experience remains smooth and responsive

### **User Experience Goals**  
- [ ] Users spend time exploring their progress
- [ ] Achievement notifications create positive moments
- [ ] Public profiles inspire others to take action
- [ ] Streak system encourages daily participation

---

## 🔄 **Development Process**

1. **Database Schema**: Update Prisma schema with new tables
2. **Server Actions**: Implement backend logic for profiles and achievements
3. **Components**: Build UI components following design system
4. **Pages**: Create dashboard and profile pages
5. **Integration**: Update navigation and existing components
6. **Testing**: Verify all flows work on mobile and desktop
7. **Polish**: Animations, loading states, error handling

**Focus**: Build one complete flow at a time (dashboard → profiles → achievements) rather than partial implementations across all features.