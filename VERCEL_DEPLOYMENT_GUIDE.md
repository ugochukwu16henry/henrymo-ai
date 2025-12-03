# Quick Vercel Deployment Guide

**Deploy HenryMo AI Frontend to Vercel in 5 Minutes**

---

## 🚀 Quick Deploy

### Option 1: Via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/hub/hub`
   - **Build Command:** `cd ../.. && pnpm install && cd apps/hub/hub && pnpm build`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && pnpm install --filter @henrymo-ai/hub`

5. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   ```

6. **Click "Deploy"**

✅ Done! Your frontend is live.

---

### Option 2: Via Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Navigate to frontend directory
cd apps/hub/hub

# 4. Deploy
vercel

# Follow prompts:
# - Link to existing project? No (first time)
# - Project name: henrymo-ai-hub
# - Directory: ./
# - Override settings? No

# 5. Set environment variables (in Vercel dashboard or via CLI)
vercel env add NEXT_PUBLIC_API_URL

# 6. Deploy to production
vercel --prod
```

---

## 🔧 Configuration

The `vercel.json` file is already configured for monorepo support.

**Key Settings:**
- ✅ Monorepo-aware build commands
- ✅ Correct root directory
- ✅ Next.js framework detection
- ✅ Environment variable support

---

## 🌍 Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|-----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Your API server URL | `https://api.henrymo-ai.com` |

**Important:** Variables starting with `NEXT_PUBLIC_` are exposed to the browser.

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

**No action needed!** Just push to GitHub.

---

## 📊 Monitoring

After deployment, you can:
- View analytics in Vercel Dashboard
- Check build logs
- Monitor performance
- View error logs

---

## 🎯 Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy API to Railway/Render
3. ✅ Set up production database
4. ✅ Configure environment variables
5. ✅ Test end-to-end

---

**Need Help?** Check the full [DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md) guide.

