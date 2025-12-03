# How to Login as Super Admin & View Landing Page

## Step 1: Create Super Admin Account

✅ **Super Admin Already Created!**

The super admin account has been created with the following credentials:

- **Email:** `ugochukwuhenry16@gmail.com`
- **Password:** `1995Mobuchi@.`
- **Name:** Henry Maobughichi Ugochukwu
- **Role:** super_admin

### If You Need to Recreate It:

Run the PowerShell script from the project root:
```powershell
pwsh -File CREATE_SUPER_ADMIN.ps1
```

### Option B: Create Super Admin via SQL

If the seed script doesn't work, you can create the super admin directly via SQL:

1. **Generate password hash:**
   ```powershell
   cd apps/api
   node -e "require('bcryptjs').hash('admin123!', 10).then(h => console.log(h))"
   ```

2. **Copy the hash and run this SQL in your database:**
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
       'ugochukwuhenry16@gmail.com',
       '<PASTE_HASH_HERE>',
       'Henry Maobughichi Ugochukwu',
       'super_admin',
       'enterprise',
       true,
       true,
       'NG'
   ) ON CONFLICT (email) DO UPDATE SET
       role = 'super_admin',
       password_hash = EXCLUDED.password_hash,
       name = EXCLUDED.name;
   ```

   Or use Docker:
   ```powershell
   docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev -c "INSERT INTO users (id, email, password_hash, name, role, subscription_tier, is_email_verified, is_active, country_code) VALUES (gen_random_uuid(), 'ugochukwuhenry16@gmail.com', '<PASTE_HASH_HERE>', 'Henry Maobughichi Ugochukwu', 'super_admin', 'enterprise', true, true, 'NG') ON CONFLICT (email) DO UPDATE SET role = 'super_admin', password_hash = EXCLUDED.password_hash, name = EXCLUDED.name;"
   ```

## Step 2: Login as Super Admin

1. **Start the frontend** (if not already running):
   ```powershell
   cd apps/hub/hub
   pnpm dev
   ```

2. **Navigate to:** `http://localhost:3000/login`

3. **Login with:**
   - **Email:** `ugochukwuhenry16@gmail.com`
   - **Password:** `1995Mobuchi@.`

4. **After login**, you'll be redirected to `/dashboard`

5. **Access Super Admin Dashboard:**
   - Click on **"Admin"** in the sidebar (you'll see a Shield icon)
   - Or navigate directly to: `http://localhost:3000/dashboard/admin`

## Step 3: View the Landing Page

The landing page is the public marketing page that explains what HenryMo AI is.

### To View Landing Page:

**Option 1: While Logged Out**
- Logout from your account
- Navigate to: `http://localhost:3000/`
- You'll see the full landing page with features, benefits, and CTAs

**Option 2: While Logged In**
- The landing page redirects authenticated users to `/dashboard`
- To see it while logged in, you can:
  1. Open an incognito/private browser window
  2. Navigate to: `http://localhost:3000/`
  3. Or temporarily modify the redirect logic

**Option 3: Direct URL**
- Simply go to: `http://localhost:3000/` (when logged out)

## Quick Reference

### Super Admin Credentials:
- **Email:** `ugochukwuhenry16@gmail.com`
- **Password:** `1995Mobuchi@.`
- **Role:** `super_admin`

### Important URLs:
- **Login:** `http://localhost:3000/login`
- **Dashboard:** `http://localhost:3000/dashboard`
- **Super Admin Dashboard:** `http://localhost:3000/dashboard/admin`
- **Landing Page:** `http://localhost:3000/` (when logged out)

## Troubleshooting

### If you can't login:
1. Check that the user exists in the database:
   ```sql
   SELECT email, role, name FROM users WHERE email = 'ugochukwuhenry16@gmail.com';
   ```

2. Verify the password hash is correct (run the seed script again)

3. Check that the API server is running on port 4000

### If Admin menu doesn't appear:
1. Verify your role is `super_admin`:
   ```sql
   SELECT role FROM users WHERE email = 'ugochukwuhenry16@gmail.com';
   ```

2. Logout and login again to refresh your session

3. Check browser console for any errors

### If Landing Page redirects to dashboard:
- This is expected behavior when logged in
- Logout or use an incognito window to view the landing page

## Security Note

⚠️ **IMPORTANT:** Consider changing your password after first login for enhanced security!

You can change it from:
- `/dashboard/profile` → Change Password
- Or `/dashboard/settings` → Security Settings

---

**Need Help?** Check the console logs or database for any errors.

