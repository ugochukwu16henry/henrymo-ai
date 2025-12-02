# Database Port Fix - SOLVED! ✅

## Problem
Password authentication was failing because a **local PostgreSQL 18 service** was running on port 5432, intercepting connections meant for the Docker container.

## Solution
Changed Docker container to use **port 5433** instead of 5432.

## Changes Made

1. **docker-compose.yml**: Changed port mapping from `5432:5432` to `5433:5432`
2. **apps/api/env.example.txt**: Updated default port to 5433

## Updated Configuration

- **Docker Container**: Port 5433 (host) → 5432 (container)
- **Database**: henmo_ai_dev
- **User**: postgres
- **Password**: postgres
- **Connection String**: `postgresql://postgres:postgres@localhost:5433/henmo_ai_dev`

## Update Your .env File

If you have a `.env` file in `apps/api/`, update it:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/henmo_ai_dev
DB_PORT=5433
```

Or use individual parameters:
```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

## Verification

Test the connection:
```powershell
cd apps/api
node -e "const {Pool}=require('pg');const p=new Pool({host:'localhost',port:5433,database:'henmo_ai_dev',user:'postgres',password:'postgres'});p.query('SELECT NOW()',(e,r)=>{if(e)console.error(e.message);else console.log('SUCCESS!');p.end();process.exit(e?1:0);});"
```

## Next Steps

1. ✅ Database connection works on port 5433
2. Update your API `.env` file if needed
3. Start your API server: `cd apps/api && pnpm dev`
4. Test frontend login!

## Note About Local PostgreSQL

You have PostgreSQL 18 installed locally on port 5432. You can:
- Leave it running (Docker uses 5433 now)
- Or stop it if you don't need it: `Stop-Service postgresql-x64-18`

