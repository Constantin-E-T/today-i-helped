# Admin System Documentation

## Overview

The admin system provides secure administrative capabilities for the "Today I Helped" platform. Admins are designated via a database-backed `isAdmin` flag on the User model, providing a robust and flexible authorization system.

## Architecture

### Files Created/Modified

1. **`/home/user/today-i-helped/lib/admin.ts`** - Admin detection and authentication utilities
2. **`/home/user/today-i-helped/app/actions/admin.ts`** - Admin-protected server actions
3. **`/home/user/today-i-helped/app/settings/page.tsx`** - Settings page with role-based UI
4. **`/home/user/today-i-helped/prisma/schema.prisma`** - User model with isAdmin field
5. **`/home/user/today-i-helped/prisma/seed-admin.ts`** - Script to promote first user to admin

## Admin Detection Logic

Admin status is determined by the **`isAdmin` boolean field** in the User database table. This provides:
- Database-backed authorization (no logic-based admin detection)
- Support for multiple admins
- Ability to promote and revoke admin access
- Clear audit trail of admin status changes

### Key Functions (`lib/admin.ts`)

#### `getCurrentUserId(): Promise<string | null>`
- Retrieves the current user's ID from server-side cookies
- Used in Server Actions to identify authenticated users
- Returns `null` if no user is authenticated

#### `getCurrentUser(): Promise<User | null>`
- Gets the complete user object for the currently authenticated user
- Returns `null` if not authenticated

#### `isUserAdmin(userId: string): Promise<boolean>`
- Checks if a given user ID has admin privileges
- Queries the database for the `isAdmin` flag
- Returns `true` if user has admin flag set, `false` otherwise
- Logs admin access for security auditing
- **NEW**: Uses database flag instead of creation order

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

#### 6. `promoteUserToAdmin(userId)` **NEW**
Promotes a user to admin status (ADMIN ONLY).

**Parameters:**
```typescript
userId: string
```

**Returns:**
```typescript
{ success: true, data: { userId: string, username: string } } | { success: false, error: string }
```

**Security:**
- Only existing admins can promote users
- Validates user exists before promotion
- Prevents promoting users who are already admins
- Logs promotion with both admin and promoted user details

**Side Effects:**
- Revalidates `/admin` and `/admin/users`
- Logs promotion action with audit trail

#### 7. `revokeAdminAccess(userId)` **NEW**
Revokes admin access from a user (ADMIN ONLY).

**Parameters:**
```typescript
userId: string
```

**Returns:**
```typescript
{ success: true, data: { userId: string, username: string } } | { success: false, error: string }
```

**Security:**
- Only existing admins can revoke access
- **Prevents self-revocation** (admin lockout protection)
- Validates user exists and is currently an admin
- Logs revocation with both admin and demoted user details

**Side Effects:**
- Revalidates `/admin` and `/admin/users`
- Logs revocation action with audit trail

#### 8. `getPlatformSettings()` **NEW**
Retrieves platform-wide settings (ADMIN ONLY).

**Parameters:** None

**Returns:**
```typescript
{
  success: true,
  data: {
    siteName: string
    maintenanceMode: boolean
    allowNewUsers: boolean
    maxActionsPerDay: number
    requireEmailVerification: boolean
  }
} | { success: false, error: string }
```

**Note:** Currently returns hardcoded settings. In production, these would be stored in a database table.

#### 9. `updatePlatformSettings(settings)` **NEW**
Updates platform-wide settings (ADMIN ONLY).

**Parameters:**
```typescript
settings: Partial<{
  siteName: string
  maintenanceMode: boolean
  allowNewUsers: boolean
  maxActionsPerDay: number
  requireEmailVerification: boolean
}>
```

**Returns:**
```typescript
{ success: true, data: PlatformSettings } | { success: false, error: string }
```

**Note:** Currently logs the update but doesn't persist. In production, these would be saved to a database table.

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
1. ~~**Multiple admins**~~ ✅ **IMPLEMENTED** - User model now has `isAdmin` boolean field
2. ~~**Admin promotion/revocation**~~ ✅ **IMPLEMENTED** - `promoteUserToAdmin()` and `revokeAdminAccess()` available
3. ~~**Settings page**~~ ✅ **IMPLEMENTED** - Role-based settings UI at `/settings`
4. **Role-based access** - Create roles table (super admin, moderator, content manager, etc.)
5. **Audit log table** - Store all admin actions in database for compliance
6. **Admin dashboard UI enhancements** - Add user management interface with promote/revoke controls
7. **Bulk operations** - Batch activate/deactivate/delete challenges
8. **Challenge approval workflow** - User-submitted challenges reviewed by admin
9. **Platform settings persistence** - Store platform settings in database instead of hardcoding
10. **Admin activity notifications** - Notify admins when other admins make changes

## Security Notes

1. **Admin initialization**: The first user must be manually promoted to admin using the seed script (`npx tsx prisma/seed-admin.ts`). This prevents unauthorized admin access.

2. **Multiple admin support**: The system now supports multiple admins. Any admin can promote other users, but cannot revoke their own access (lockout protection).

3. **Session management**: Currently relies on cookies. Consider adding session expiry and refresh tokens for enhanced security.

4. **CSRF protection**: Server Actions have built-in CSRF protection in Next.js 16.

5. **Rate limiting**: Not implemented in admin actions. Consider adding if admin actions can be triggered by malicious actors.

6. **Audit trail**: All actions are logged via pino but not permanently stored in database. Consider creating an `AdminAction` model for compliance.

7. **Admin badge visibility**: Admin users see an "Admin" badge in the settings page header and have access to admin-only sections.
