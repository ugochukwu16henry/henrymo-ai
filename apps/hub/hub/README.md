# HenryMo AI Hub - Frontend Application

Frontend application for the HenryMo AI platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## Project Structure

```
hub/
├── app/                  # Next.js App Router pages
│   ├── login/           # Login page
│   ├── register/        # Register page
│   ├── dashboard/       # Dashboard (protected)
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── ui/             # UI components (buttons, inputs, etc.)
│   └── auth/           # Authentication components
├── lib/                # Utilities and helpers
│   ├── api-client.ts   # API client
│   └── api/           # API functions
├── store/              # Zustand stores
│   └── auth-store.ts   # Authentication state
└── hooks/              # Custom React hooks
    └── use-auth.ts     # Authentication hook
```

## Features

- ✅ Authentication (Login, Register, Forgot Password)
- ✅ Protected routes
- ✅ Token management
- ✅ Form validation with React Hook Form + Zod
- ✅ State management with Zustand
- ✅ TypeScript support
- ✅ Tailwind CSS styling

## Environment Variables

See `.env.local.example` for required environment variables.

