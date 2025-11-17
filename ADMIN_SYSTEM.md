# Admin System Documentation

## Overview

The admin system provides secure administrative capabilities for the "Today I Helped" platform. The **first user created** in the system is automatically designated as the admin with full privileges to manage challenges.

## Architecture

### Files Created

1. **`/home/user/today-i-helped/lib/admin.ts`** - Admin detection and authentication utilities
2. **`/home/user/today-i-helped/app/actions/admin.ts`** - Admin-protected server actions

## Admin Detection Logic

The admin is determined by **creation order** - the first user created (earliest `createdAt` timestamp) is the admin.

### Key Functions (`lib/admin.ts`)

#### `getCurrentUserId(): Promise<string | null>`
- Retrieves the current user's ID from server-side cookies
- Used in Server Actions to identify authenticated users
- Returns `null` if no user is authenticated

#### `getCurrentUser(): Promise<User | null>`
- Gets the complete user object for the currently authenticated user
- Returns `null` if not authenticated

#### `getAdminUser(): Promise<User | null>`
- Fetches the admin user (first user created)
- Returns `null` if no users exist in the system

#### `isUserAdmin(userId: string): Promise<boolean>`
- Checks if a given user ID belongs to the admin
- Returns `true` if the user is admin, `false` otherwise
- Logs admin access for security auditing

#### `requireAdmin(): Promise<User>`
- **Primary security gate** for admin-only operations
- Throws user-friendly errors if:
  - User is not authenticated
  - User is authenticated but not admin
- Returns the admin user object on success
- Should be called at the start of every admin Server Action

## Admin Server Actions

All admin actions in `/home/user/today-i-helped/app/actions/admin.ts` follow this security pattern:

```typescript
export async function someAdminAction(data) {
  try {
    // 1. Verify admin access (throws if unauthorized)
    const admin = await requireAdmin()

    // 2. Validate input with Zod
    const validationResult = Schema.safeParse(data)
    if (!validationResult.success) {
      return { success: false, error: '...' }
    }

    // 3. Perform database operation
    const result = await prisma...

    // 4. Log the action
    logger.info({ adminId: admin.id, ... }, 'Admin action completed')

    // 5. Revalidate cached pages
    revalidatePath('/relevant-path')

    return { success: true, data: result }
  } catch (error) {
    // Handle authorization errors
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Generic error' }
  }
}
```

### Available Admin Actions

#### 1. `createChallenge(data)`
Creates a new challenge in the database.

**Parameters:**
```typescript
{
  text: string      // 10-500 characters
  category: Category // PEOPLE, ANIMALS, ENVIRONMENT, COMMUNITY
  difficulty: Difficulty // EASY, MEDIUM
}
```

**Returns:**
```typescript
{ success: true, data: Challenge } | { success: false, error: string }
```

**Validation:**
- Text: 10-500 characters (trimmed)
- Category: Must be valid enum value
- Difficulty: Must be valid enum value

**Side Effects:**
- Revalidates `/` and `/challenges`
- Logs challenge creation with admin ID

#### 2. `updateChallenge(id, data)`
Updates an existing challenge.

**Parameters:**
```typescript
id: string
data: {
  text?: string
  category?: Category
  difficulty?: Difficulty
  isActive?: boolean
}
```

**Returns:**
```typescript
{ success: true, data: Challenge } | { success: false, error: string }
```

**Validation:**
- Challenge ID must exist
- All fields are optional
- Text: 10-500 characters if provided
- Category and difficulty validated if provided

**Side Effects:**
- Revalidates `/`, `/challenges`, `/challenges/{id}`
- Logs update with admin ID and changed fields

#### 3. `toggleChallengeActive(id)`
Toggles a challenge's active status (activate/deactivate).

**Parameters:**
```typescript
id: string
```

**Returns:**
```typescript
{ success: true, data: Challenge } | { success: false, error: string }
```

**Behavior:**
- Flips `isActive` from `true` to `false` or vice versa
- Does not delete data (soft toggle)

**Side Effects:**
- Revalidates `/`, `/challenges`, `/challenges/{id}`
- Logs status change with admin ID

#### 4. `deleteChallenge(id)`
**PERMANENTLY** deletes a challenge from the database.

**Parameters:**
```typescript
id: string
```

**Returns:**
```typescript
{ success: true, data: { id: string } } | { success: false, error: string }
```

**WARNING:**
- This is a hard delete and cannot be undone
- Actions referencing this challenge will have `challengeId` set to `null` (per Prisma schema `onDelete: SetNull`)

**Side Effects:**
- Revalidates `/` and `/challenges`
- Logs deletion with admin ID and challenge text

#### 5. `getAllChallenges()`
Retrieves **all** challenges including inactive ones (admin-only view).

**Parameters:** None

**Returns:**
```typescript
{ success: true, data: Challenge[] } | { success: false, error: string }
```

**Ordering:**
- By category (ascending)
- Then by difficulty (ascending)
- Then by creation date (descending)

## Security Features

### 1. Multi-Layer Security
- **Authentication check**: Verifies user is logged in
- **Authorization check**: Verifies user is the admin
- **Input validation**: Zod schemas for all inputs
- **Database constraints**: Prisma schema enforces data integrity

### 2. Comprehensive Logging
Every admin action logs:
- Admin user ID
- Action performed
- Affected resource IDs
- Relevant data changes
- Timestamp (automatic via pino)

### 3. Error Handling
- **Generic errors** for clients (no internal details exposed)
- **Detailed logs** for server debugging
- **User-friendly messages** for authorization failures

### 4. Type Safety
- Full TypeScript coverage
- Zod runtime validation
- Prisma type generation
- Discriminated union response types

## Usage Examples

### From a Server Component

```typescript
import { getAllChallenges } from '@/app/actions/admin'

export default async function AdminDashboard() {
  const result = await getAllChallenges()

  if (!result.success) {
    return <div>Error: {result.error}</div>
  }

  return (
    <div>
      <h1>All Challenges ({result.data.length})</h1>
      {result.data.map(challenge => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  )
}
```

### From a Client Component (Server Action)

```typescript
'use client'

import { createChallenge } from '@/app/actions/admin'
import { Category, Difficulty } from '@prisma/client'

export function CreateChallengeForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createChallenge({
      text: formData.get('text') as string,
      category: formData.get('category') as Category,
      difficulty: formData.get('difficulty') as Difficulty,
    })

    if (result.success) {
      console.log('Created challenge:', result.data)
    } else {
      console.error('Error:', result.error)
    }
  }

  return <form action={handleSubmit}>...</form>
}
```

### Checking Admin Status

```typescript
import { getCurrentUserId, isUserAdmin } from '@/lib/admin'

export default async function SomePage() {
  const userId = await getCurrentUserId()
  const isAdmin = userId ? await isUserAdmin(userId) : false

  return (
    <div>
      {isAdmin && <AdminPanel />}
      <RegularContent />
    </div>
  )
}
```

## Integration Points

### Cookie Management
- Uses same cookie as existing auth system: `tih_user_id`
- Server-side cookie reading via Next.js `cookies()` API
- Compatible with existing client-side auth utilities

### Prisma Schema
Works with existing models:
- `User` - For admin identification
- `Challenge` - For CRUD operations

### Next.js App Router
- Server Actions for all mutations (no API routes)
- `revalidatePath()` for cache invalidation
- Compatible with React Server Components

## Testing Checklist

### Security Tests
- [ ] Non-admin users receive "Unauthorized" error
- [ ] Unauthenticated users receive "Authentication required" error
- [ ] Admin can perform all operations successfully
- [ ] Admin actions are logged with user ID

### Input Validation Tests
- [ ] Text < 10 characters rejected
- [ ] Text > 500 characters rejected
- [ ] Invalid category rejected
- [ ] Invalid difficulty rejected
- [ ] Empty text rejected (even with whitespace)

### Database Tests
- [ ] Challenge creation increments challenge count
- [ ] Challenge update preserves unmodified fields
- [ ] Toggle changes only isActive field
- [ ] Delete removes challenge and sets actions' challengeId to null
- [ ] First user created is identified as admin

### Cache Tests
- [ ] Challenge creation revalidates home and challenges pages
- [ ] Challenge updates revalidate affected pages
- [ ] Deleted challenges no longer appear in public feeds

## Future Enhancements

Consider adding:
1. **Multiple admins** - Add `isAdmin` boolean field to User model
2. **Role-based access** - Create roles table (admin, moderator, user)
3. **Audit log table** - Store all admin actions in database
4. **Admin dashboard UI** - Full management interface
5. **Bulk operations** - Batch activate/deactivate/delete
6. **Challenge approval workflow** - User-submitted challenges reviewed by admin

## Security Notes

1. **First user advantage**: The first user to sign up becomes admin. In production, seed the database with an admin user before public launch.

2. **Session management**: Currently relies on cookies. Consider adding session expiry and refresh tokens for enhanced security.

3. **CSRF protection**: Server Actions have built-in CSRF protection in Next.js 16.

4. **Rate limiting**: Not implemented in admin actions. Consider adding if admin actions can be triggered by malicious actors.

5. **Audit trail**: All actions are logged but not permanently stored. Consider database-backed audit logs for compliance.
