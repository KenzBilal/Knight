# Knight

**Autonomous B2B Sales Agent**

Knight is a full-stack SaaS platform that automates B2B prospecting end-to-end — from finding leads on Google Maps, to auditing their websites, generating personalized AI pitches, sending cold emails, and handling Telegram conversations.

Built with Next.js 15, Supabase, PostgreSQL, and Electron.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Desktop App](#desktop-app)
- [Worker](#worker)
- [Database](#database)
- [Deployment](#deployment)
- [License](#license)

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Dashboard      │     │   Worker         │     │   Desktop App    │
│   (Next.js 15)   │────▶│   (Node.js)      │     │   (Electron)     │
│   Vercel         │     │   Docker         │     │   Admin panel    │
└────────┬────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │      Supabase           │
                    │  PostgreSQL + Auth +     │
                    │  Storage + Edge Functions│
                    └─────────────────────────┘
```

- **Dashboard** — Next.js 15 App Router on Vercel with Supabase Auth, cookie-based sessions, team management, billing, support tickets, landing page CMS
- **Worker** — Independent Node.js process (Docker) polling `jobs` table, concurrent batch processing (max 2 jobs), priority queues, rate limiting, RAM monitoring
- **Desktop App** — Electron 41 + Vite 6 + React 19 admin panel for managing users, plans, AI providers, website content, support tickets, environment config, worker control
- **Supabase** — PostgreSQL database with 17+ migrations, RLS policies, Edge Functions for Telegram, real-time subscriptions, file storage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Next.js 15 App Router |
| Auth | Supabase Auth, httpOnly cookies (7-day expiry) |
| Database | PostgreSQL via Supabase, 17+ migrations |
| API | Next.js Route Handlers, Edge Functions |
| Worker | Node.js, cheerio, Google Maps scraping, Puppeteer |
| Desktop | Electron 41, Vite 6, React 19, electron-updater |
| Email | Resend API |
| Payments | LemonSqueezy (subscriptions + usage-based) |
| AI | OpenAI, Anthropic, Google, DeepSeek, xAI, Groq, Cerebras |
| Deploy | Vercel (dashboard), Docker (worker), GitHub Releases (desktop) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project ([supabase.com](https://supabase.com))
- Resend API key ([resend.com](https://resend.com))
- LemonSqueezy account ([lemonsqueezy.com](https://lemonsqueezy.com))

### 1. Clone

```bash
git clone https://github.com/KenzBilal/Knight.git
cd Knight
git submodule update --init --recursive
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in your keys:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_key
ENCRYPTION_KEY=your-32-char-hex
```

### 3. Database

Run all migrations in `supabase/migrations/` in order via the Supabase SQL Editor, or use the Supabase CLI:

```bash
supabase db push
```

### 4. Install

```bash
npm run setup
```

### 5. Start

```bash
npm run dev          # Dashboard on localhost:3000
docker compose up -d worker # Worker via Docker
```

---

## Project Structure

```
Knight/
├── admin-app/                  # Electron desktop app (git submodule)
│   ├── electron/               # Main process (main.cjs, preload.cjs)
│   ├── src/
│   │   ├── components/         # 18+ admin modules
│   │   └── lib/                # Supabase, settings, types
│   ├── assets/sounds/          # WAV notification sounds
│   └── vite.config.ts          # HMR + full-reload plugin
├── dashboard/                  # Next.js 15 dashboard + marketing site
│   ├── app/
│   │   ├── api/                # Route handlers (leads, emails, billing, support, etc.)
│   │   ├── dashboard/          # App pages (overview, prospects, inbox, settings, etc.)
│   │   ├── pricing/            # Live pricing page (DB-driven)
│   │   └── page.tsx            # Landing page (Supabase direct query, force-dynamic)
│   ├── components/             # UI components (LandingPage, DashboardContent, etc.)
│   └── lib/                    # Auth, Supabase, pricing helpers
├── docs/                       # Documentation
├── supabase/
│   └── migrations/             # 17 SQL migrations (001–017)
├── worker/
│   ├── index.js                # Concurrent job processor (max 2, priority, RAM guard)
│   ├── integrations/           # Scrapers, email, Telegram, webhooks
│   ├── jobs/                   # Job type handlers
│   └── utils/                  # Queue, plans, DB helpers
├── docker-compose.yml          # Dashboard + Worker services
└── Dockerfile                  # Multi-stage Next.js build
```

---

## Core Features

### Lead Discovery
Search Google Maps by niche + location. Results are automatically scored and queued for auditing.

### Website Audits
30+ point analysis: broken links, missing meta tags, SSL issues, performance problems, mobile readiness, accessibility gaps. Results feed into AI pitch generation.

### AI Pitch Generation
Contextual pitches built from audit findings. Each pitch references specific issues on the prospect's website to create compelling, personalized outreach.

### Cold Email Outreach
Automated email sequences via Resend. Custom tracking domains, reply detection, bounce handling, rate limiting.

### Telegram Integration
AI-powered Telegram conversations for real-time lead qualification. Runs as part of the Node.js worker with user-level configuration.

### AI Provider Hub
Admin-managed AI providers with multiple API keys per provider, automatic rotation, cooldown on failures, usage tracking. Supports OpenAI, Anthropic, Google, DeepSeek, xAI, Groq, and Cerebras.

### Billing
LemonSqueezy-powered subscriptions with three tiers:
- **Free** — 50 leads/mo, 50 emails/mo
- **Starter ($49/mo)** — Unlimited leads & emails
- **Pro ($149/mo)** — Telegram agent, drip sequences, custom domains, BYOK

### Support Tickets
Threaded ticket system with admin replies, status management, real-time polling, unread badge in dashboard top bar and desktop app.

### Landing Page CMS
Database-driven landing page sections (hero, stats, steps, features, FAQ, CTA). Editable from the desktop app's WebsiteContent tab. Content stored as JSONB in the `landing_content` table.

---

## Desktop App

Electron 41 admin panel with frameless window, custom titlebar, and 18+ management modules.

### Building

```bash
cd admin-app
npm install
npx vite build && npx electron-builder --linux AppImage
```

**Important:** You must run `vite build` before `electron-builder`. The builder does not auto-build the renderer.

### Auto-Updates

Uses `electron-updater` with GitHub Releases. Requires a `GH_TOKEN` env var for the private `KenzBilal/Knight-Desktop` repo. Updates are checked on app start and downloaded automatically with a restart prompt.

### Modules

| Group | Module | Description |
|-------|--------|-------------|
| Overview | Dashboard | System stats, quick actions |
| Overview | Activity Log | Audit trail of all actions |
| Management | Users | User CRUD, role assignment |
| Management | Organizations | Org management |
| Management | Team | Team invites, roles |
| Management | Billing | Subscription management |
| Management | Plans | Plan config, limits, features |
| Data | Jobs Queue | Job monitoring, retry, cancel |
| Data | Leads | Lead management |
| Data | Emails | Email log |
| Data | Telegram | Telegram config |
| Data | Support | Ticket threads, admin replies |
| Content | Website Content | Landing page CMS editor |
| System | AI Hub | Provider management, key rotation |
| System | Worker | Start/stop/restart, health monitoring |
| System | Log Viewer | Live log streaming |
| System | Environment | `.env` editor, Supabase status |

---

## Worker

The worker processes jobs concurrently with:

- **Max 2 concurrent jobs** (configurable)
- **Priority queues** — Discovery jobs run first
- **RAM guard** — Pauses if system memory exceeds 1.5 GB
- **120s timeout** per job
- **Dedup** — Skips duplicate leads

### Job Types

| Job | Description |
|-----|-------------|
| `DISCOVER` | Google Maps scraping for new leads |
| `SCRAPE` | Website audit + AI pitch + email send |
| `PROCESS_REPLY` | Handle Telegram replies |

### Running

```bash
docker compose up -d worker
```

---

## Database

PostgreSQL via Supabase with 17 migrations covering:

- `001` — Core tables (users, leads, emails, jobs)
- `002` — API keys schema
- `003` — Email accounts, domains, templates
- `004` — Telegram accounts, conversations, messages
- `005` — Webhooks, audit logs, job queues
- `006` — Pitch rewrites
- `007` — Job retry columns, indexes
- `008` — Pricing & plan limits
- `009` — Organizations & team management
- `010` — AI providers, models, keys, routing, task history
- `011` — Support tickets & replies
- `012` — Landing page CMS content
- `013–017` — Additional features

Full schema: `supabase/migrations/`

---

## Deployment

### Dashboard (Vercel)

Auto-deploys from `master` branch. Set environment variables in Vercel dashboard.

```bash
vercel --prod
```

### Worker

```bash
# Docker
docker compose up -d worker
```

### Desktop App

Builds published to GitHub Releases as AppImage. Auto-updater delivers updates to users.

```bash
cd admin-app
GH_TOKEN=your_token npx vite build && npx electron-builder --linux AppImage --publish always
```

---

## License

Proprietary. All rights reserved. See [LICENSE](LICENSE) for details.
