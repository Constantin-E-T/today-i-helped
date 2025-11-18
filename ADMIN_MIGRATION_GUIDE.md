# Admin Flag System Migration Guide

## Overview

This migration introduces a proper admin flag system to replace the first-user logic. The system now uses a database-backed `isAdmin` boolean field on the User model.

## What Changed

### 1. Database Schema (`prisma/schema.prisma`)
- **Added**: `isAdmin Boolean @default(false)` field to User model
- **Added**: Index on `isAdmin` for efficient admin queries

### 2. Admin Detection Logic (`lib/admin.ts`)
- **Removed**: `getAdminUser()` function (no longer needed)
- **Updated**: `isUserAdmin()` now checks the database `isAdmin` flag instead of comparing creation dates
- **Improved**: More efficient queries using `select` to fetch only needed fields

### 3. Admin Server Actions (`app/actions/admin.ts`)
Added new admin management functions:
- `promoteUserToAdmin(userId)` - Promote a user to admin (admin-only)
- `revokeAdminAccess(userId)` - Revoke admin access (admin-only, prevents self-revocation)
- `getPlatformSettings()` - Get platform-wide settings (admin-only)
- `updatePlatformSettings(settings)` - Update platform settings (admin-only)

Security features:
- Only existing admins can promote users
- Admins cannot revoke their own access (prevents lockout)
- All actions include comprehensive logging for audit trails
- Input validation with Zod

### 4. Settings Page (`app/settings/page.tsx`)
Completely rewritten with role-based UI:

**For All Users**:
- Account Settings (username, recovery code, account creation date)
- Notification Preferences (daily reminders, clap notifications, achievements)
- Privacy Settings (profile visibility, location sharing)
- Data Management (export data, delete account)

**Additional for Admins**:
- Admin badge displayed in header
- Prominent "Admin Dashboard" button linking to /admin
- Platform Settings section (maintenance mode, user registration, rate limits)

### 5. Navigation (`components/layout/navbar.tsx` & `mobile-nav.tsx`)
- Settings link already exists in both desktop and mobile navigation
- No changes needed - already properly configured

## Migration Steps

### Step 1: Update Dependencies (if needed)
```bash
npm install
```

### Step 2: Run Database Migration

**Option A: Using Prisma Migrate (Recommended for Production)**
```bash
npx prisma migrate dev --name add_admin_flag
```

This will:
- Create a new migration file
- Apply the migration to your database
- Regenerate Prisma Client

**Option B: Using Prisma DB Push (Development Only)**
```bash
npx prisma db push
```

This will:
- Apply schema changes directly to database
- Regenerate Prisma Client
- Skip creating migration files (not recommended for production)

### Step 3: Set First User as Admin

**Option A: Using the Seed Script**
```bash
npx tsx prisma/seed-admin.ts
```

**Option B: Manual SQL (if preferred)**
```sql
-- Find the first user
SELECT id, username, "createdAt", "isAdmin"
FROM "User"
ORDER BY "createdAt" ASC
LIMIT 1;

-- Set them as admin (replace USER_ID with actual ID)
UPDATE "User"
SET "isAdmin" = true
WHERE id = 'USER_ID';
```

**Option C: Using Prisma Studio**
```bash
npx prisma studio
```
Then navigate to the User table and manually set `isAdmin = true` for your admin user.

### Step 4: Verify the Migration

1. **Check the database**:
```bash
npx prisma studio
```
Verify that the `isAdmin` field exists and is set correctly.

2. **Test admin access**:
- Log in as the admin user
- Navigate to `/settings`
- You should see the "Admin" badge and "Admin Dashboard" button
- Navigate to `/admin`
- Verify you can access the admin dashboard

3. **Test regular user access**:
- Log in as a non-admin user
- Navigate to `/settings`
- You should NOT see the admin-specific sections

## Rollback Plan (If Needed)

If you need to rollback this migration:

1. **Revert code changes**:
```bash
git revert <commit-hash>
```

2. **Rollback database migration**:
```bash
# If you used migrate
npx prisma migrate resolve --rolled-back <migration-name>

# Then remove the isAdmin field from schema.prisma and push
npx prisma db push --force-reset
```

**⚠️ WARNING**: Force reset will delete all data. Only use in development.

## Admin Promotion Workflow

### To promote a user to admin:

1. **Get the user ID** from Prisma Studio or database
2. **Use the admin action** (from another admin account):
```typescript
import { promoteUserToAdmin } from '@/app/actions/admin'

const result = await promoteUserToAdmin(userId)
if (result.success) {
  console.log(`Promoted ${result.data.username} to admin`)
}
```

3. **Or use SQL directly**:
```sql
UPDATE "User"
SET "isAdmin" = true
WHERE id = 'USER_ID';
```

### To revoke admin access:

```typescript
import { revokeAdminAccess } from '@/app/actions/admin'

const result = await revokeAdminAccess(userId)
if (result.success) {
  console.log(`Revoked admin from ${result.data.username}`)
}
```

**Note**: You cannot revoke your own admin access. This prevents accidental lockouts.

## Security Considerations

1. **Admin Audit Trail**: All admin actions are logged with the admin's ID and username
2. **Self-Revocation Protection**: Admins cannot remove their own admin status
3. **Input Validation**: All admin actions validate inputs with Zod
4. **Authorization Checks**: Every admin action calls `requireAdmin()` first
5. **No Automatic Promotion**: Users must be manually promoted by existing admins

## Troubleshooting

### Issue: "No admin users found"
**Solution**: Run the seed script to promote the first user:
```bash
npx tsx prisma/seed-admin.ts
```

### Issue: "Unauthorized. Admin access required."
**Solution**: Verify your user has `isAdmin = true` in the database:
```sql
SELECT id, username, "isAdmin" FROM "User" WHERE id = 'YOUR_USER_ID';
```

### Issue: Migration fails with Prisma engine error
**Solution**: Set environment variable to skip checksum:
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev
```

### Issue: Settings page doesn't show admin sections
**Solution**:
1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server: `npm run dev`
3. Verify `isAdmin = true` in database

## Next Steps

After completing this migration, consider:

1. **Implement Platform Settings Storage**: Currently settings are hardcoded. Consider adding a `PlatformSettings` model to store them in the database.

2. **Add Admin Activity Log**: Create an `AdminAction` model to track all admin operations for compliance and auditing.

3. **Implement Admin Roles**: Extend beyond boolean admin flag to support multiple admin roles (super admin, moderator, etc.).

4. **Add Admin Notifications**: Notify other admins when new admins are promoted or access is revoked.

5. **Create Admin Management UI**: Build a dedicated admin user management page in the admin dashboard to promote/revoke users visually.

## Files Modified

- `/home/user/today-i-helped/prisma/schema.prisma` - Added isAdmin field and index
- `/home/user/today-i-helped/lib/admin.ts` - Updated admin detection logic
- `/home/user/today-i-helped/app/actions/admin.ts` - Added admin management actions
- `/home/user/today-i-helped/app/settings/page.tsx` - Implemented comprehensive settings page

## Files Created

- `/home/user/today-i-helped/prisma/seed-admin.ts` - Admin seeding script
- `/home/user/today-i-helped/ADMIN_MIGRATION_GUIDE.md` - This guide

## Database Migration SQL

When you run `npx prisma migrate dev`, Prisma will generate this SQL:

```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_isAdmin_idx" ON "User"("isAdmin");
```

## Summary

This migration provides a robust, database-backed admin system with proper security controls, audit logging, and a comprehensive settings interface. The first user in the system should be promoted to admin using the seed script, after which they can promote additional admins as needed.
