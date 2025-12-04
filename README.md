# HenryMo AI – Minimal Starter Kit

This repository contains a **monorepo** with:

- **API** – Express + PostgreSQL (auth, conversations, stub AI)
- **Frontend** – Next.js 14 (login, register, simple dashboard + chat)
- **Docker** – PostgreSQL + API container
- **Database** – schema & migration script
- **Seed script** – creates the initial Super‑Admin (`admin@henrymo-ai.com` / `admin123!`)

## Quick start

```bash
# 1️⃣ Install pnpm (if you don't have it)
npm i -g pnpm

# 2️⃣ Install all workspace deps
pnpm install

# 3️⃣ Start containers (Postgres + API)
docker compose up -d

# 4️⃣ Run migrations
pnpm --filter @henmo/api run migrate

# 5️⃣ Seed the Super‑Admin (optional, but handy)
node scripts/seed-super-admin.js

# 6️⃣ Start the Next.js UI
pnpm --filter @henmo/hub dev
Open http://localhost:3000 → login with the seeded admin or register a new user.

Enjoy building the rest of the roadmap! 🚀
```
