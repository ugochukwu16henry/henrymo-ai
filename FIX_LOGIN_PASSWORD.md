# Fix "Invalid email or password" Login Error

## Problem
Getting "Invalid email or password" when trying to login.

## Solution

### Step 1: Update Password Hash

The password hash in the database may not match. Let's update it:

**Run this script:**
```powershell
pwsh -File CREATE_SUPER_ADMIN.ps1
```

This will:
- Generate a fresh password hash for `1995Mobuchi@.`
- Update the super admin user in the database
- Ensure the password is correct

### Step 2: Verify User Status

Check that the user is active and verified:
```sql
SELECT email, role, is_active, is_email_verified 
FROM users 
WHERE email = 'ugochukwuhenry16@gmail.com';
```

Should show:
- `is_active`: `t` (true)
- `is_email_verified`: `t` (true)
- `role`: `super_admin`

### Step 3: Try Login Again

1. Go to: `http://localhost:3000/login`
2. Use credentials:
   - **Email:** `ugochukwuhenry16@gmail.com`
   - **Password:** `1995Mobuchi@.`

### Step 4: If Still Not Working

**Check API server logs:**
- Look for "Invalid email or password" errors
- Check if password comparison is failing

**Verify password manually:**
```powershell
cd apps/api
node -e "const bcrypt = require('bcryptjs'); const hash = '$2a$10$RR4EV.cTRn0LaXpwIbDtXOG6SA2HBQNs20dN0B5NaDGBPtdPgfva6'; bcrypt.compare('1995Mobuchi@.', hash).then(result => console.log('Password match:', result));"
```

**Update password directly:**
```sql
UPDATE users 
SET password_hash = '$2a$10$RR4EV.cTRn0LaXpwIbDtXOG6SA2HBQNs20dN0B5NaDGBPtdPgfva6'
WHERE email = 'ugochukwuhenry16@gmail.com';
```

## Common Issues

### Issue 1: Email Case Sensitivity
The login function uses `.toLowerCase().trim()` on email, so make sure you're using:
- `ugochukwuhenry16@gmail.com` (lowercase)

### Issue 2: Password Hash Mismatch
If the hash doesn't match, the password comparison will fail. Run `CREATE_SUPER_ADMIN.ps1` to fix.

### Issue 3: User Not Active
Check `is_active` column - should be `true`

### Issue 4: User Suspended
Check `is_suspended` column - should be `false` or `NULL`

## Quick Fix Command

```powershell
# Update password hash directly
docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev -c "UPDATE users SET password_hash = '\$2a\$10\$RR4EV.cTRn0LaXpwIbDtXOG6SA2HBQNs20dN0B5NaDGBPtdPgfva6' WHERE email = 'ugochukwuhenry16@gmail.com';"
```

---

**After running CREATE_SUPER_ADMIN.ps1, try logging in again!**

