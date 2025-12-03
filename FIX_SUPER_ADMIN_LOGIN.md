# Fix Super Admin Login Issue

## Problem
You're getting "invalid email and password" when trying to sign in to the super admin dashboard.

## Solution Options

### Option 1: Run the Seed Script (Recommended)

This will create or update the super admin account with the correct credentials.

```powershell
# Navigate to the database package
cd packages/database

# Make sure dependencies are installed
pnpm install

# Set your database URL (adjust if needed)
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/henmo_ai_dev'

# Run the seed script
node scripts/seed.js
```

**Default Credentials:**
- **Email:** `ugochukwuhenry16@gmail.com`
- **Password:** `1995Mobuchi@.`

### Option 2: Create/Reset Super Admin via SQL

If you prefer to do it directly via SQL, you can use this script:

```powershell
# First, generate a password hash
cd apps/api
$password = Read-Host "Enter your desired password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
$hash = node -e "require('bcryptjs').hash('$passwordPlain', 10).then(h => console.log(h))"
$hash = $hash.Trim()

# Then run this SQL (adjust connection details as needed)
# For Docker:
docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev -c @"
UPDATE users 
SET password_hash = '$hash',
    role = 'super_admin',
    is_active = true,
    is_email_verified = true
WHERE email = 'ugochukwuhenry16@gmail.com';

-- If user doesn't exist, create it:
INSERT INTO users (
    id, email, password_hash, name, role, subscription_tier,
    is_email_verified, is_active, country_code
)
SELECT 
    gen_random_uuid(),
    'ugochukwuhenry16@gmail.com',
    '$hash',
    'Henry Maobughichi Ugochukwu',
    'super_admin',
    'enterprise',
    true,
    true,
    'NG'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'ugochukwuhenry16@gmail.com'
);
"@
```

### Option 3: Quick Fix Script

I'll create a simple Node.js script you can run:

```powershell
cd packages/database
node fix-super-admin.js
```

## Verify the Account

After creating/resetting the account, verify it exists:

```sql
SELECT email, role, is_active, is_email_verified 
FROM users 
WHERE email = 'ugochukwuhenry16@gmail.com' 
   OR role = 'super_admin';
```

## Common Issues

1. **Email case sensitivity**: The login is case-insensitive, but make sure you're using the exact email: `ugochukwuhenry16@gmail.com`

2. **Password special characters**: Make sure you're typing the password correctly: `1995Mobuchi@.`

3. **Account not active**: Check that `is_active = true` and `is_email_verified = true`

4. **Database connection**: Make sure your database is running and the connection string is correct

## Test Login

After fixing, try logging in with:
- **Email:** `ugochukwuhenry16@gmail.com`
- **Password:** `1995Mobuchi@.`

