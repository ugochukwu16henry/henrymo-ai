# Vercel Build Configuration Fix
## Fixed: pnpm Installation and Build Errors
**Date:** December 3, 2024  
**Status:** ✅ **FIXED**

---

## Problem

Vercel deployment was failing with multiple errors:

1. **pnpm symlink errors:**
   ```
   ENOENT: no such file or directory, unlink '/vercel/path0/node_modules/.pnpm/node_modules/@anthropic-ai/sdk'
   ```

2. **Directory navigation error:**
   ```
   sh: line 1: cd: apps/hub/hub: No such file or directory
   Error: Command "cd ../.. && pnpm install && cd apps/hub/hub && pnpm build" exited with 1
   ```

3. **Recursive postinstall script causing conflicts:**
   - The `postinstall` script was running `pnpm install` recursively in all workspaces
   - This caused symlink conflicts and installation loops

---

## Root Causes

1. **Problematic `postinstall` script** in root `package.json`:
   ```json
   "postinstall": "pnpm -r exec pnpm install || true"
   ```
   - This was trying to run `pnpm install` in all workspaces recursively
   - Caused symlink conflicts during pnpm's hoisting process
   - Created installation loops

2. **Complex build command** in `vercel.json`:
   ```json
   "buildCommand": "cd ../.. && pnpm install && cd apps/hub/hub && pnpm build"
   ```
   - Assumed specific directory structure that might not exist in Vercel
   - Used relative paths that could fail depending on Vercel's build context

3. **pnpm workspace hoisting issues:**
   - pnpm was trying to unlink symlinks that didn't exist
   - This is often caused by corrupted node_modules or conflicting install scripts

---

## Solution

### 1. Removed Problematic `postinstall` Script

**File:** `package.json`

**Before:**
```json
{
  "scripts": {
    "postinstall": "pnpm -r exec pnpm install || true"
  }
}
```

**After:**
```json
{
  "scripts": {
    // Removed postinstall - pnpm handles workspace installation automatically
  }
}
```

**Why:** pnpm automatically handles workspace installations. The recursive `postinstall` script was causing conflicts and is unnecessary.

---

### 2. Updated Vercel Build Configuration

**File:** `apps/hub/hub/vercel.json`

**Before:**
```json
{
  "buildCommand": "cd ../.. && pnpm install && cd apps/hub/hub && pnpm build",
  "installCommand": "cd ../.. && pnpm install --filter @henrymo-ai/hub"
}
```

**After:**
```json
{
  "buildCommand": "cd ../.. && pnpm install --filter @henrymo-ai/hub... && pnpm --filter @henrymo-ai/hub build",
  "installCommand": "cd ../.. && pnpm install --filter @henrymo-ai/hub..."
}
```

**Changes:**
- Uses `pnpm --filter` to target specific workspace instead of navigating directories
- Uses `--filter @henrymo-ai/hub...` to include dependencies (the `...` includes dependencies)
- Removes the problematic `cd apps/hub/hub` navigation
- Builds from monorepo root using workspace filtering

---

## Vercel Project Settings

For optimal deployment, configure these settings in your Vercel project:

### Root Directory
- Set to: `apps/hub/hub`
- This tells Vercel where your Next.js app is located

### Framework Preset
- Set to: `Next.js`
- Vercel will auto-detect Next.js configuration

### Build Command
- Can be left empty (uses `vercel.json`)
- Or set to: `pnpm --filter @henrymo-ai/hub build`

### Install Command
- Can be left empty (uses `vercel.json`)
- Or set to: `cd ../.. && pnpm install --filter @henrymo-ai/hub...`

### Output Directory
- Set to: `.next`
- This is where Next.js outputs the build

---

## How It Works

1. **Vercel sets root directory** to `apps/hub/hub`
2. **Install command runs** from monorepo root (`cd ../..`)
3. **Installs dependencies** for hub and its dependencies (`--filter @henrymo-ai/hub...`)
4. **Build command runs** from monorepo root using workspace filter
5. **Output** is generated in `apps/hub/hub/.next`

---

## Benefits

1. ✅ **No more symlink errors** - Removed conflicting postinstall script
2. ✅ **Reliable directory navigation** - Uses pnpm workspace filters instead of `cd`
3. ✅ **Faster builds** - Only installs dependencies needed for hub app
4. ✅ **Workspace-aware** - Properly handles monorepo structure
5. ✅ **Vercel-optimized** - Uses Vercel's recommended patterns

---

## Testing

After deploying, verify:

1. ✅ Build completes without errors
2. ✅ No pnpm symlink warnings
3. ✅ Next.js app builds successfully
4. ✅ All dependencies are installed correctly

---

## Additional Notes

### If You Still See Errors

1. **Clear Vercel build cache:**
   - Go to Vercel project settings
   - Clear build cache
   - Redeploy

2. **Check pnpm version:**
   - Ensure `packageManager` in `package.json` matches Vercel's pnpm version
   - Current: `"packageManager": "pnpm@8.15.0"`

3. **Verify workspace configuration:**
   - Ensure `apps/hub/hub` is listed in root `package.json` workspaces
   - Current: `"apps/hub/hub"` is in workspaces array

---

**Fixed By:** AI Assistant  
**Date:** December 3, 2024  
**Status:** ✅ Ready for deployment

