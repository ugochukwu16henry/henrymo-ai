# HenryMo AI - Enterprise AI Development Platform

**Creator:** Henry Maobughichi Ugochukwu (Super Admin)  
**Version:** 1.0.0  
**Platform:** Enterprise AI Development Hub

---

## 🎯 Overview

HenryMo AI (also known as HenMo AI) is a comprehensive enterprise-grade AI development platform that combines advanced AI capabilities with practical development tools, media generation, and a unique crowdsourced street mapping system.

### Key Features

- 🤖 **ChatBoss AI Assistant** - Multi-provider AI chat with streaming responses
- 💾 **AI Memory System** - Persistent memory with vector embeddings and semantic search
- 🔍 **Code Analysis** - Security scanning, performance analysis, and intelligent debugging
- 🎨 **Media Generation** - AI-powered image and video generation
- 🗺️ **Streets Platform** - Crowdsourced street-level imagery with verification system
- 👥 **Multi-Level Admin System** - Enterprise-grade user and content management
- 💰 **Financial System** - Subscriptions, payments, and contributor rewards
- 📊 **Analytics Dashboard** - Comprehensive usage and cost tracking
- 📧 **Email System** - Automated notifications and communications

---

## 🏗️ Architecture

This is a **monorepo** project managed with **pnpm workspaces**:

```
henrymo-ai/
├── apps/
│   ├── api/          # Backend API (Express.js + Node.js)
│   ├── hub/          # Frontend Dashboard (Next.js 14 + TypeScript)
│   └── web/          # Public Website (Future)
├── packages/
│   ├── database/     # Database schema and migrations
│   ├── shared/       # Shared utilities and types
│   └── ai-core/      # Core AI functionality
└── scripts/          # Utility scripts
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- PostgreSQL 14+
- Docker & Docker Compose (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd henrymo-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/hub/hub/.env.example apps/hub/hub/.env.local
   ```

4. **Start development services**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   cd apps/api
   pnpm run migrate
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: API Server
   cd apps/api
   pnpm run dev

   # Terminal 2: Frontend Hub
   cd apps/hub/hub
   pnpm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - API Health: http://localhost:4000/api/health

---

## 📁 Project Structure

### Backend API (`apps/api/`)

- Express.js REST API
- PostgreSQL database
- JWT authentication
- AWS S3 integration
- AI provider integrations (Anthropic, OpenAI)
- WebSocket support

### Frontend Hub (`apps/hub/hub/`)

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS v4
- Radix UI components
- Zustand state management
- Real-time features with WebSocket

---

## 🛠️ Development

### Available Scripts

**Root Level:**
- `pnpm install` - Install all dependencies
- `pnpm dev` - Run all apps in development mode
- `pnpm build` - Build all apps
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code

**API (`apps/api/`):**
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm migrate` - Run database migrations
- `pnpm test` - Run tests

**Hub (`apps/hub/hub/`):**
- `pnpm dev` - Start Next.js dev server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code

---

## 📚 Documentation

- [28-Day Development Roadmap](./28_DAY_ROADMAP.md) - Complete development plan
- [Complete Platform Documentation](./HENRYMO_AI_DOCUMENTATION.md) - Full feature documentation
- API Documentation - (Coming soon)
- Deployment Guide - (Coming soon)

---

## 🗄️ Database

The platform uses PostgreSQL 14+ with the following key tables:

- `users` - User accounts and authentication
- `conversations` - AI chat conversations
- `messages` - Chat messages
- `ai_memory` - Persistent AI memories
- `streets` - Street information
- `contributions` - User street contributions
- `subscriptions` - User subscriptions
- `payments` - Payment records
- And more...

See `packages/database/schema.sql` for complete schema.

---

## 🔐 Environment Variables

### API Server (`apps/api/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/henmo_ai

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=henmo-ai-files

# Pinecone (for embeddings)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=4000
NODE_ENV=development
```

### Frontend Hub (`apps/hub/hub/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Testing

### Running Tests

```bash
# All tests
pnpm test

# API tests
cd apps/api && pnpm test

# Frontend tests
cd apps/hub/hub && pnpm test
```

### Test Coverage

- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows

---

## 📦 Deployment

### Production Build

```bash
# Build all apps
pnpm build

# Deploy API (Railway/Render)
# Deploy Hub (Vercel)
```

See deployment documentation for detailed instructions.

---

## 🤝 Contributing

1. Follow the development roadmap
2. Write tests for new features
3. Follow code style guidelines
4. Update documentation

---

## 📄 License

[To be determined]

---

## 👤 Creator

**Henry Maobughichi Ugochukwu**  
Super Admin & Platform Creator

---

## 🔗 Links

- Documentation: [Complete Documentation](./HENRYMO_AI_DOCUMENTATION.md)
- Roadmap: [28-Day Roadmap](./28_DAY_ROADMAP.md)
- API: http://localhost:4000/api
- Dashboard: http://localhost:3000

---

**Built with ❤️ by Henry M. Ugochukwu**

