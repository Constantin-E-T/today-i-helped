# Development Guide

## Project Vision

**Today I Helped** is built on the belief that small acts of kindness create meaningful change. Our mission is to make daily good deeds a habit by providing inspiration, community support, and positive reinforcement.

### Core Principles

- **Trust-First Philosophy**: We believe people are inherently good. No verification, no skepticism - just encouragement
- **Community-Driven Positivity**: Users support each other through claps and shared experiences
- **Frictionless Participation**: Auto-generated usernames remove barriers to getting started
- **Daily Inspiration**: Fresh challenges keep the experience engaging and varied

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 17
- **ORM**: Prisma
- **Styling**: Tailwind CSS 4
- **Authentication**: Cookie-based sessions
- **Design Philosophy**: Mobile-first, progressive enhancement

### Key Architectural Decisions

**Server Actions Over API Routes**: We use Server Actions exclusively for backend logic, eliminating the need for separate API routes. This provides type safety, simpler data flow, and better integration with React Server Components.

**No Traditional Auth System**: Auto-generated usernames stored in cookies provide a frictionless experience while maintaining user identity across sessions.

**Trust-First Data Model**: No verification flags, no moderation queues - we assume good faith and let the community self-regulate through positive reinforcement.

## Database Schema

### User Model

Represents a platform user with auto-generated username and tracking stats.

```prisma
model User {
  id              String   @id @default(cuid())
  username        String   @unique
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  totalActions    Int      @default(0)
  totalClapsGiven Int      @default(0)
  totalClapsReceived Int   @default(0)
  createdAt       DateTime @default(now())
  lastActiveAt    DateTime @default(now())
}
```

**Purpose**: Track user identity, streaks, and engagement metrics

### Challenge Model

Pre-defined daily challenges across four categories.

```prisma
model Challenge {
  id          String   @id @default(cuid())
  category    Category
  prompt      String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

enum Category {
  PEOPLE
  ANIMALS
  ENVIRONMENT
  COMMUNITY
}
```

**Purpose**: Store challenge prompts that rotate as daily inspirations

### Action Model

Represents a completed challenge by a user.

```prisma
model Action {
  id          String   @id @default(cuid())
  userId      String
  challengeId String
  description String
  claps       Int      @default(0)
  createdAt   DateTime @default(now())
}
```

**Purpose**: Record user contributions and enable community feed

### Clap Model

Tracks individual claps (likes) on actions.

```prisma
model Clap {
  id        String   @id @default(cuid())
  actionId  String
  userId    String
  createdAt DateTime @default(now())
}
```

**Purpose**: Enable community support and prevent duplicate claps

### DailyStats Model

Aggregated platform statistics by day.

```prisma
model DailyStats {
  id                String   @id @default(cuid())
  date              DateTime @unique
  totalActions      Int      @default(0)
  totalClaps        Int      @default(0)
  activeUsers       Int      @default(0)
  categoryBreakdown Json
}
```

**Purpose**: Track platform growth and category popularity

## Development Phases

### Phase 1: Database Setup ✅ COMPLETE

- [x] PostgreSQL 17 in Docker
- [x] Prisma schema design
- [x] All models created
- [x] Initial migration

### Phase 2: Server Actions 🚧 IN PROGRESS

#### Task 1: User Actions (CURRENT)

- [ ] `createUser()` - Generate username and create user record
- [ ] `getUser(userId)` - Fetch user with stats
- [ ] `updateLastActive(userId)` - Update activity timestamp
- [ ] `getUserStats(userId)` - Get comprehensive user statistics

#### Task 2: Challenge Actions (NEXT)

- [ ] `getDailyChallenge()` - Get today's active challenge
- [ ] `getChallengesByCategory(category)` - Filter challenges
- [ ] `createChallenge(data)` - Add new challenge (admin)
- [ ] `toggleChallengeActive(challengeId)` - Enable/disable challenge

#### Task 3: Action Actions

- [ ] `createAction(data)` - Submit completed challenge
- [ ] `getRecentActions(limit)` - Fetch community feed
- [ ] `getUserActions(userId)` - Get user's action history
- [ ] `getActionById(actionId)` - Fetch single action with details

#### Task 4: Clap Actions

- [ ] `addClap(actionId, userId)` - Clap for an action
- [ ] `removeClap(actionId, userId)` - Un-clap an action
- [ ] `hasUserClapped(actionId, userId)` - Check clap status
- [ ] `updateClapCounts()` - Sync clap totals

### Phase 3: UI Components 🔜

- [ ] Homepage with daily challenge
- [ ] Community feed
- [ ] Action submission form
- [ ] User profile/stats
- [ ] Clap button with animation
- [ ] Streak display

### Phase 4: Integration 🔜

- [ ] Connect UI to Server Actions
- [ ] Implement cookie-based auth
- [ ] Add optimistic UI updates
- [ ] Error handling and loading states
- [ ] Mobile responsiveness
- [ ] Performance optimization

## Server Actions Structure

### Location

All Server Actions live in `app/actions/` organized by domain:

```
app/actions/
├── user.ts       # User-related actions
├── challenge.ts  # Challenge-related actions
├── action.ts     # Action-related actions
└── clap.ts       # Clap-related actions
```

### Response Format

All Server Actions return a consistent response shape:

```typescript
type ActionResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}
```

**Success Example**:
```typescript
return { success: true, data: user }
```

**Error Example**:
```typescript
return { success: false, error: 'User not found' }
```

### Error Handling Patterns

**Database Errors**:
```typescript
try {
  const result = await prisma.user.create(...)
  return { success: true, data: result }
} catch (error) {
  console.error('Database error:', error)
  return { success: false, error: 'Failed to create user' }
}
```

**Validation Errors**:
```typescript
if (!userId || typeof userId !== 'string') {
  return { success: false, error: 'Invalid user ID' }
}
```

**Not Found Errors**:
```typescript
const user = await prisma.user.findUnique({ where: { id: userId } })
if (!user) {
  return { success: false, error: 'User not found' }
}
```

### Validation Requirements

- Always validate input parameters
- Use TypeScript types for compile-time safety
- Check for null/undefined values
- Validate string lengths and formats
- Ensure required fields are present
- Sanitize user input to prevent injection

## Coding Standards

### TypeScript

- **Strict Mode**: Always enabled
- **Explicit Types**: Prefer explicit types over inference for function parameters and return values
- **No `any`**: Use `unknown` if type is truly unknown, then narrow with type guards
- **Null Safety**: Check for null/undefined before accessing properties

### Prisma Best Practices

- **Transactions**: Use transactions for operations that must succeed or fail together
- **Select Statements**: Only fetch fields you need to reduce data transfer
- **Indexes**: Add indexes on frequently queried fields
- **Relations**: Use `include` for related data, `select` for specific fields
- **Connection Pooling**: Let Prisma handle connection management

### Error Handling

- **Never Throw**: Server Actions should return error objects, not throw exceptions
- **User-Friendly Messages**: Error messages should be actionable for end users
- **Logging**: Log detailed errors server-side, return generic messages to client
- **Graceful Degradation**: Handle errors without breaking the user experience

### Testing Approach

- **Unit Tests**: Test Server Actions in isolation with mocked Prisma
- **Integration Tests**: Test database operations with test database
- **Type Safety**: Rely on TypeScript to catch type errors at compile time
- **Manual Testing**: Test user flows end-to-end in development

## Key Decisions

### Why Server Actions Over API Routes?

**Type Safety**: Server Actions provide end-to-end type safety from server to client without manual API typing.

**Simplicity**: No need to manage separate API routes, request/response handling, or endpoint documentation.

**Performance**: Server Actions integrate directly with React Server Components, enabling optimal data fetching patterns.

**Developer Experience**: Write backend logic alongside components, with automatic serialization and error handling.

### Why Auto-Generated Usernames?

**Frictionless Onboarding**: Users can start helping immediately without email verification or password creation.

**Privacy**: No personal information required or stored.

**Memorability**: Generated names (e.g., "HappyOtter42") are friendly and easy to remember.

**Identity**: Users still have consistent identity across sessions via cookies.

### Why Trust-First Approach?

**Positive Community**: Assuming good faith creates a welcoming, supportive environment.

**Reduced Friction**: No approval queues or verification steps means faster content sharing.

**Self-Regulation**: Community claps naturally surface the best content.

**Mission Alignment**: We're celebrating good deeds, not policing bad actors.

### Why PostgreSQL?

**Relational Data**: User relationships, claps, and actions fit naturally into a relational model.

**ACID Compliance**: Ensures data consistency for critical operations like claps and streaks.

**Scalability**: PostgreSQL handles growth from prototype to production.

**Prisma Integration**: Excellent ORM support with type generation and migrations.

---

**Questions or suggestions?** Open an issue or submit a PR. Let's build something meaningful together.
