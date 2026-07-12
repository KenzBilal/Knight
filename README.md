# Knight

<p align="center">
  <img src="admin-app/electron/icon.png" width="120" alt="Knight Logo">
</p>

<h3 align="center">AI-Powered B2B Sales Agent</h3>

<p align="center">
  Autonomous prospect discovery, website audits, personalized outreach, and intelligent reply handling — all on autopilot.
</p>

<p align="center">
  <a href="https://knight.app">Website</a> ·
  <a href="https://knight.app/docs">Docs</a> ·
  <a href="https://github.com/KenzBilal/Knight/issues">Issues</a> ·
  <a href="https://github.com/KenzBilal/Knight/releases">Releases</a>
</p>

---

## What is Knight?

Knight is a fully autonomous B2B sales agent that works 24/7 to find leads, audit their websites, write personalized pitches, send emails, and handle replies — all powered by AI.

### Core Features

- **Autonomous Discovery** — Finds businesses matching your ideal customer profile
- **Website Audits** — Analyzes prospects' sites for SEO, performance, and UX issues
- **AI Pitch Generation** — Creates personalized outreach based on audit findings
- **Smart Email Sending** — Sends sequences via Resend with custom domains
- **Reply Handling** — AI reads and responds to incoming replies intelligently
- **Telegram Integration** — Discover leads from Telegram groups, auto-pitch
- **Team Management** — Multi-user orgs with roles (Owner, Admin, Member)
- **Desktop Control Center** — Electron app for full system control

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      KNIGHT STACK                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dashboard   │  │   Desktop    │  │   Website     │  │
│  │  (Next.js 15) │  │  (Electron)  │  │  (Marketing)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                  │                             │
│         └────────┬─────────┘                             │
│                  │                                       │
│  ┌───────────────▼───────────────┐                      │
│  │      Supabase (PostgreSQL)     │                      │
│  │  • Auth  • DB  • Realtime      │                      │
│  └───────────────┬───────────────┘                      │
│                  │                                       │
│  ┌───────────────▼───────────────┐                      │
│  │       Worker (Node.js)         │                      │
│  │  • Puppeteer  • AI APIs        │                      │
│  │  • Email      • Telegram       │                      │
│  └───────────────────────────────┘                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  AI: Cohere (audit) · Gemini (pitches) · OpenRouter     │
│  Email: Resend  ·  Payments: LemonSqueezy               │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Dashboard | Next.js 15, React 19, Tailwind CSS 4, TypeScript |
| Desktop | Electron, Vite, React 19, TypeScript |
| Worker | Node.js, Puppeteer, PM2 |
| Database | Supabase (PostgreSQL, Auth, Realtime) |
| AI | Cohere, Google Gemini, OpenRouter |
| Email | Resend |
| Payments | LemonSqueezy |
| Deployment | Vercel (dashboard), AppImage/deb/dmg/exe (desktop) |

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account (free tier works)
- Resend account (free tier works)

### 1. Clone

```bash
git clone --recurse-submodules https://github.com/KenzBilal/Knight.git
cd Knight
```

### 2. Install

```bash
npm run install:all
```

### 3. Configure

```bash
cp dashboard/.env.example dashboard/.env.local
cp worker/.env.example worker/.env
```

Edit `dashboard/.env.local` and `worker/.env` with your API keys.

### 4. Setup Database

Run `supabase/schema.sql` in your Supabase SQL editor, then run each migration in `supabase/migrations/` in order.

### 5. Run

```bash
npm run dev
```

Dashboard: [http://localhost:3000](http://localhost:3000)

## Desktop App

The admin desktop app lives in a [private repo](https://github.com/KenzBilal/Knight-Desktop).

```bash
cd admin-app
npm install
npm run dev
```

Or download a pre-built release from [Releases](https://github.com/KenzBilal/Knight-Desktop/releases).

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/login` | POST | Email/password login |
| `/api/auth/signup` | POST | Create account |
| `/api/auth/logout` | POST | Sign out |
| `/api/overview` | GET | Dashboard stats |
| `/api/prospects` | GET/POST | Manage prospects |
| `/api/leads` | GET | Discovered leads |
| `/api/audit` | POST | Run website audit |
| `/api/draft` | POST | Generate AI pitch |
| `/api/send-reply` | POST | Send email reply |
| `/api/engine` | POST | Start/stop worker |
| `/api/billing/checkout` | POST | Create checkout |
| `/api/billing/webhook` | POST | LemonSqueezy webhook |
| `/api/team` | GET | List team members |
| `/api/team/invite` | POST | Send invite |
| `/api/team/accept` | GET | Accept invite |
| `/api/config` | GET/POST | Org settings |
| `/api/plans` | GET | Available plans |
| `/api/usage` | GET | Usage stats |
| `/api/health` | GET | Health check |

## Environment Variables

See `dashboard/.env.example` and `worker/.env.example` for the full list.

### Dashboard

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `LEMONSQUEEZY_API_KEY` | Yes | LemonSqueezy API key |
| `LEMONSQUEEZY_STORE_ID` | Yes | LemonSqueezy store ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Yes | LemonSqueezy webhook secret |
| `RESEND_API_KEY` | Yes | Resend API key |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL (e.g. `https://knight.app`) |

### Worker

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `COHERE_API_KEY` | Yes | Cohere API key (audits) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (pitches) |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key (suggestions) |
| `RESEND_API_KEY` | Yes | Resend API key (emails) |
| `TELEGRAM_API_ID` | No | Telegram API ID (for userbot) |
| `TELEGRAM_API_HASH` | No | Telegram API hash (for userbot) |

## Production Deployment

### Dashboard (Vercel)

```bash
# Auto-deploys on push to master
git push origin master
```

### Worker (PM2)

```bash
cd worker
npm install
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Desktop App

Builds are automated via GitHub Actions on the [private repo](https://github.com/KenzBilal/Knight-Desktop).

## Project Structure

```
Knight/
├── dashboard/              # Next.js 15 dashboard + marketing site
│   ├── app/                # App router pages + API routes
│   │   ├── api/            # 30 API endpoints
│   │   ├── auth/           # Login, signup
│   │   ├── dashboard/      # Main dashboard pages
│   │   └── (marketing)/    # Landing, about, pricing, legal
│   ├── components/         # 16 React components
│   └── lib/                # Auth, billing, utils
├── worker/                 # Autonomous sales agent
│   ├── index.js            # Job engine
│   ├── shared_audit.js     # Website audit
│   ├── telegram_*.js       # Telegram integration
│   └── utils/              # Crypto helpers
├── admin-app/              # Electron desktop app (submodule)
├── supabase/               # Database schema + migrations
│   ├── schema.sql          # Full schema (14 tables)
│   └── migrations/         # 9 migrations
├── docs/                   # Documentation
├── docker-compose.yml      # Production Docker setup
└── package.json            # Root workspace config
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) — Ken Bilal

---

<p align="center">
  Built with obsession by <a href="https://github.com/KenzBilal">Ken Bilal</a>
</p>
