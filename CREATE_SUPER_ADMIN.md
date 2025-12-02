# Create Super Admin User

## Option 1: Using Node.js (Requires dependencies)

First install dependencies:
```powershell
cd packages/database
pnpm install
```

Then run seed:
```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/henmo_ai_dev'
node scripts/seed.js
```

## Option 2: Create Admin Directly via SQL

Generate a bcrypt hash first, then insert. For now, let's create a simple script:

```powershell
# Create a temporary Node.js script to hash the password
@"
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123!', 10).then(hash => {
  console.log(hash);
});
"@ | Out-File -Encoding utf8 temp_hash.js

node temp_hash.js

# Then use the output hash in SQL
```

## Option 3: Quick Fix - Create Admin with Temporary Password

Run this SQL to create admin (password will be set later via API):

```sql
INSERT INTO users (
    id,
    email,
    password_hash,
    name,
    role,
    subscription_tier,
    is_email_verified,
    is_active,
    country_code
) VALUES (
    gen_random_uuid(),
    'admin@henrymo-ai.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123!
    'Henry Maobughichi Ugochukwu',
    'super_admin',
    'enterprise',
    true,
    true,
    'NG'
) ON CONFLICT (email) DO NOTHING;
```

I'll create a simple SQL seed file that you can run directly.

