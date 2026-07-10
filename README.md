# Knight

Autonomous AI-powered B2B sales agent. Discovers leads, audits websites, writes personalized pitches, sends cold emails, handles replies, and manages Telegram outreach — all on autopilot.

## Architecture

```
Knight/
├── dashboard/      # Next.js 15 (App Router) — Deploy to Vercel
├── worker/         # Node.js background worker — Runs locally via PM2
└── supabase/       # Database schema
```

- **Dashboard** — Landing page + auth + billing + analytics dashboard
- **Worker** — Background job processor (audits, emails, Telegram)
- **Supabase** — PostgreSQL database + auth + realtime

## Setup

### 1. Supabase

1. Create a new Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your Project URL, Anon Key, and Service Role Key

### 2. Dashboard

```bash
cd dashboard
cp .env.example .env.local
# Fill in your Supabase + Stripe + Resend keys
npm install
npm run dev
```

Visit `http://localhost:3000`

### 3. Worker

```bash
cd worker
cp .env.example .env
# Fill in your Supabase + AI + Resend + Telegram keys
npm install
node index.js
```

### 4. Stripe

1. Create products and prices in Stripe Dashboard
2. Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`

### 5. Resend

1. Create a Resend account
2. Add and verify your sending domain
3. Copy your API key

## Environment Variables

### Dashboard (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STARTER` | Stripe price ID for Starter plan |
| `STRIPE_PRICE_PRO` | Stripe price ID for Pro plan |
| `STRIPE_PRICE_AGENCY` | Stripe price ID for Agency plan |
| `RESEND_API_KEY` | Resend API key |
| `NEXT_PUBLIC_APP_URL` | Your app URL (http://localhost:3000 for dev) |

### Worker (`.env`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `COHERE_API_KEY` | Cohere API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `RESEND_API_KEY` | Resend API key |
| `TELEGRAM_API_ID` | Telegram app API ID |
| `TELEGRAM_API_HASH` | Telegram app API hash |

## Pricing

| Plan | Price | Leads/day | Emails/day | Telegram |
|------|-------|-----------|------------|----------|
| Free | $0 | 5 | 0 | No |
| Starter | $49/mo | 20 | 30 | No |
| Pro | $149/mo | 100 | 200 | Yes |
| Agency | $299/mo | Unlimited | Unlimited | Yes |

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Realtime), Node.js
- **AI:** Cohere, Google Gemini, OpenRouter (Nemotron + Llama)
- **Email:** Resend
- **Telegram:** gramjs (MTProto)
- **Payments:** Stripe
- **Scraping:** Puppeteer
- **Hosting:** Vercel (dashboard), Local via PM2 (worker)



