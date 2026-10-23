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
- **Supabase** — PostgreSQL database with a checked-in schema and incremental SQL changes, RLS policies, realtime subscriptions, and file storage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Next.js 15 App Router |
| Auth | Supabase Auth, httpOnly access and refresh cookies (1-hour access, 30-day refresh) |
| Database | PostgreSQL via Supabase, checked-in schema and SQL changes |
| API | Next.js Route Handlers, Edge Functions |
| Worker | Node.js, cheerio, Google Maps scraping, Puppeteer |
| Desktop | Electron 41, Vite 6, React 19, electron-updater |
| Email | Resend API |
| Payments | LemonSqueezy (subscriptions + usage-based) |
| AI | Cohere, Gemini, Groq, OpenRouter |
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

For a new database, run `supabase/schema.sql` first, then apply the versioned migrations in `supabase/migrations/`. The baseline includes the current application schema; the migrations add compatibility updates and reconcile existing deployments. The Knight production project has versions `015`, `018`–`024`, and `20260714212224` applied and recorded. For another existing deployment, check `supabase migration list --linked` and apply only pending versions.

```text
supabase/migrations/015_add_admin_msg_id.sql
supabase/migrations/018_add_scheduled_jobs.sql
supabase/migrations/019_create_usage_tracking.sql
supabase/migrations/020_email_domains_and_contact_fields.sql
supabase/migrations/021_analytics_id_defaults.sql
supabase/migrations/022_enforce_scheduled_job_time.sql
supabase/migrations/023_create_webhooks_table.sql
supabase/migrations/024_add_telegram_welcome_sent.sql
supabase/migrations/20260714212224_add_org_fields.sql
```

The live Knight project's migration history matches the checked-in versioned files. Do not run the baseline `schema.sql` against a database that already contains application data.

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
│   ├── schema.sql              # Core schema and row-level security
│   └── migrations/             # Incremental SQL changes
├── worker/
│   ├── index.js                # Queue, discovery, audits, email, and replies
│   ├── shared_audit.js         # Browser audits and contact extraction
│   ├── telegram_*.js           # Telegram lead hunting and conversations
│   ├── providers/              # AI provider adapters
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
Admin-managed Cohere, Gemini, Groq, and OpenRouter configurations with key rotation and cooldown after provider errors.

### Billing
LemonSqueezy-powered subscriptions. Plan names, prices, checkout variants, and
displayed features are configured in the database. Runtime feature gates
currently use `free`, `starter`, and `max`; see [plan notes](docs/billing/plans.md).

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

- **Max 2 concurrent jobs**
- **Priority queues** — Discovery jobs run first
- **RAM guard** — Pauses if worker memory exceeds 2 GB
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

The checked-in `supabase/schema.sql` defines the organization, worker,
analytics, integration, platform administration, billing, and support tables,
along with their functions, views, grants, and row-level security policies.
The live Knight project has migrations `015`, `018`–`024`, and
`20260714212224` applied and recorded. These include monthly usage tracking,
email domains, analytics identity sequence reconciliation, integration table
permissions, and scheduled job timing.

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

MIT. See [LICENSE](LICENSE) for the license terms.
