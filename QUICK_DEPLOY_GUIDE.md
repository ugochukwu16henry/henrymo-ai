# Quick Deployment Guide

**Deploy HenryMo AI in 15 Minutes**

---

## 🚀 Quick Start

### Prerequisites

- ✅ GitHub repository pushed
- ✅ Vercel account (free): https://vercel.com
- ✅ Railway account (free trial): https://railway.app
- ✅ AWS account (for S3 - optional initially)

---

## Step 1: Deploy Frontend to Vercel (5 minutes)

### Option A: Via Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `apps/hub/hub` ⚠️ Important!
   - **Build Command:** (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
5. **Add Environment Variable:**
   ```
   NEXT_PUBLIC_API_URL=https://your-api.railway.app
   ```
   (You'll update this after deploying API)
6. **Click "Deploy"**

✅ Frontend deployed!

### Option B: Via CLI

```powershell
# Run the deployment script
pwsh -File DEPLOY_TO_VERCEL.ps1
```

Or manually:
```bash
npm i -g vercel
cd apps/hub/hub
vercel login
vercel
# Follow prompts, then:
vercel --prod
```

---

## Step 2: Deploy API to Railway (10 minutes)

### Via Dashboard (Recommended)

1. **Go to [railway.app](https://railway.app)** and sign up/login
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Select your repository**
5. **Add Service → PostgreSQL** (for database)
6. **Add Service → GitHub Repo** (for API)
7. **Configure API Service:**
   - **Root Directory:** `apps/api`
   - **Build Command:** `pnpm install`
   - **Start Command:** `node src/server.js`
8. **Add Environment Variables:**
   - Click on API service → Variables
   - Add all variables from `apps/api/env.example.txt`
   - **Important:** Copy `DATABASE_URL` from PostgreSQL service
9. **Deploy**

✅ API deployed!

### Via CLI

```powershell
# Run the deployment script
pwsh -File DEPLOY_TO_RAILWAY.ps1
```

---

## Step 3: Run Database Migrations

### Option 1: Railway CLI (Easiest)

```bash
railway run cd packages/database && DATABASE_URL=$DATABASE_URL node scripts/migrate.js schema
```

### Option 2: Railway Dashboard

1. Go to your API service
2. Click "Deploy" → "Run Command"
3. Run:
   ```bash
   cd packages/database && node scripts/migrate.js schema
   ```

### Option 3: Local Migration

```bash
# Get DATABASE_URL from Railway PostgreSQL service
# Then run locally:
cd packages/database
$env:DATABASE_URL="postgresql://..." # Windows PowerShell
node scripts/migrate.js schema
```

---

## Step 4: Update Environment Variables

### Vercel (Frontend)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.railway.app
   ```
3. Redeploy (automatic on next push, or manually trigger)

### Railway (API)

1. Go to Railway Dashboard → API Service → Variables
2. Verify all variables are set:
   - `DATABASE_URL` (from PostgreSQL service)
   - `JWT_SECRET` (generate a strong secret)
   - `FRONTEND_URL` (your Vercel URL)
   - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - All other variables from `env.example.txt`

---

## Step 5: Test Deployment

### Test Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test login/register
3. Test ChatBoss
4. Test other features

### Test API

1. Visit: `https://your-api.railway.app/api/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### Test Database

1. Check Railway PostgreSQL logs
2. Verify tables exist (via Railway dashboard or CLI)

---

## 🔧 Troubleshooting

### Frontend Build Fails

**Issue:** Monorepo dependencies not found  
**Fix:** Ensure Root Directory is `apps/hub/hub` and build command includes root install

**Issue:** Environment variable not found  
**Fix:** Ensure `NEXT_PUBLIC_API_URL` is set in Vercel dashboard

### API Deployment Fails

**Issue:** Cannot find module  
**Fix:** Ensure Root Directory is `apps/api` and build command runs `pnpm install`

**Issue:** Database connection fails  
**Fix:** Verify `DATABASE_URL` is correctly set in Railway variables

**Issue:** Port already in use  
**Fix:** Railway handles this automatically, but check Start Command is `node src/server.js`

### Database Migration Fails

**Issue:** Migration script not found  
**Fix:** Ensure you're running from correct directory or use Railway CLI

**Issue:** Connection refused  
**Fix:** Verify `DATABASE_URL` is correct and PostgreSQL service is running

---

## 📋 Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] API deployed to Railway
- [ ] Database migrations completed
- [ ] Environment variables set
- [ ] Frontend can connect to API
- [ ] Login/register works
- [ ] ChatBoss responds
- [ ] File uploads work (if S3 configured)
- [ ] Email sending works (if SMTP configured)

---

## 🎯 Next Steps

1. **Set up custom domains** (optional)
   - Vercel: Settings → Domains
   - Railway: Settings → Domains

2. **Set up monitoring**
   - Vercel Analytics (built-in)
   - Railway Metrics (built-in)
   - Add Sentry for error tracking (optional)

3. **Configure backups**
   - Railway PostgreSQL: Automatic backups enabled
   - AWS S3: Enable versioning

4. **Set up CI/CD**
   - Already configured! Push to GitHub = auto-deploy

---

## 💰 Cost Estimate

**Monthly Costs:**
- Vercel: **Free** (hobby) or $20/month (pro)
- Railway: **~$10-30/month** (API + Database)
- AWS S3: **~$1-5/month** (storage)
- **Total: ~$11-55/month**

---

## 📚 Additional Resources

- [Full Deployment Guide](./DEPLOYMENT_COMPARISON.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Environment Variables Reference](./apps/api/env.example.txt)

---

**Need Help?** Check the troubleshooting section or review the full deployment guide.

**Created by:** Henry Maobughichi Ugochukwu  
**Last Updated:** December 3, 2024

