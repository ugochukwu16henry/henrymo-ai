# Database Package

Database schema, migrations, and utilities for HenryMo AI platform.

## Structure

```
packages/database/
├── schema.sql              # Complete database schema
├── migrations/             # Migration files
│   └── 001_initial_schema.sql
├── scripts/                # Utility scripts
│   ├── migrate.js         # Migration runner
│   └── seed.js            # Seed data script
├── init.sql               # Docker initialization script
└── README.md              # This file
```

## Usage

### Running the Schema

**Option 1: Direct SQL execution**
```bash
psql -d henmo_ai_dev -f schema.sql
```

**Option 2: Using migration script**
```bash
cd packages/database
node scripts/migrate.js schema
```

**Option 3: From API directory**
```bash
cd apps/api
pnpm run migrate
```

### Running Migrations

```bash
cd packages/database
node scripts/migrate.js migrate
```

### Seeding Data

```bash
cd packages/database
node scripts/seed.js
```

This will:
- Create a super admin user (admin@henrymo-ai.com / admin123!)
- Seed countries with initial data

**⚠️ IMPORTANT:** Change the default admin password immediately after first login!

## Database Tables

### Core Tables
- `users` - User accounts and authentication
- `conversations` - AI chat conversations
- `messages` - Chat messages
- `ai_memory` - Persistent AI memories

### Streets Platform
- `countries` - Countries
- `states` - States/Provinces
- `cities` - Cities
- `streets` - Street information
- `contributions` - User contributions
- `images` - Uploaded images
- `verifications` - Verification records

### Financial System
- `subscriptions` - User subscriptions
- `payments` - Payment records
- `payout_requests` - Payout requests

### Admin System
- `admin_invitations` - Admin invitations
- `audit_logs` - Audit trail

### Other
- `plugins` - Plugin marketplace
- `user_plugins` - User plugin installations
- `api_keys` - API key management
- `schema_migrations` - Migration tracking

## Environment Variables

Required environment variables (set in `apps/api/.env`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/henmo_ai_dev
```

Or individual components:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

## Development with Docker

The database is automatically initialized via Docker Compose. The `init.sql` file runs when the container is first created.

## Notes

- All tables use UUID primary keys
- Automatic `updated_at` timestamps via triggers
- Comprehensive indexes for performance
- Foreign key constraints for data integrity
- JSONB columns for flexible metadata storage

## Author

Henry Maobughichi Ugochukwu (Super Admin)

