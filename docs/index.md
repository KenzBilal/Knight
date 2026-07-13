# Knight Documentation

Knight is an autonomous B2B sales agent that finds leads, audits websites, generates personalized pitches, sends cold emails, and handles Telegram conversations — all on autopilot.

---

## Quick Start

1. [Sign up](https://dashboard-ten-lake-62.vercel.app) for a free account
2. Complete the onboarding wizard (company info, email domain, Telegram)
3. Enter a search query like "plumbers in Austin"
4. Knight discovers leads, audits their websites, generates pitches, and sends outreach

**[Full quick start guide →](quick-start.md)**

---

## Features

### Lead Discovery
Find businesses via Google Maps scraping. Enter your niche and location — Knight searches, scores, and queues results automatically.

**[Learn more →](features/discovery.md)**

### Website Audits
30+ point analysis of prospect websites: broken links, meta tags, SSL, performance, mobile readiness, accessibility. Results feed directly into AI pitch generation.

**[Learn more →](features/audits.md)**

### AI Pitch Generation
Contextual pitches built from audit findings. Each message references specific issues on the prospect's website for personalized outreach.

**[Learn more →](features/ai-pitches.md)**

### Cold Email Outreach
Automated sequences via Resend. Custom tracking domains, reply detection, bounce handling, rate limiting.

**[Learn more →](features/email.md)**

### Telegram Integration
AI-powered Telegram conversations for real-time lead qualification. Runs as a Supabase Edge Function.

**[Learn more →](features/telegram.md)**

### Dashboard
Kanban pipeline (New → Pitched → Replied → Rejected), inbox for email threads, audit viewer, pitch manager.

---

## Desktop App

Electron admin panel with 18+ modules for managing users, organizations, plans, billing, support, AI providers, worker control, website content, and environment configuration.

**[Desktop app docs →](../admin-app/README.md)**

---

## Settings

### Company Profile
Configure business name, website, services, and Calendly link used in outreach.

**[Learn more →](settings/company-profile.md)**

### Email Domain
Verify your own domain for email sending with custom tracking.

### Telegram
Connect your Telegram account for AI-powered lead hunting.

### AI Provider Keys
Bring your own API keys for OpenAI, Anthropic, Google, DeepSeek, xAI, Groq, or Cerebras.

---

## Billing & Plans

| Plan | Price | Leads/mo | Emails/mo | Telegram | BYOK |
|------|-------|----------|-----------|----------|------|
| Free | $0 | 50 | 50 | - | - |
| Starter | $49 | Unlimited | Unlimited | - | - |
| Pro | $149 | Unlimited | Unlimited | Yes | Yes |

**[Full plan details →](billing/plans.md)**

---

## Troubleshooting

Common issues and solutions for authentication, discovery, email, Telegram, billing, and performance.

**[See common issues →](troubleshooting/common-issues.md)**

---

## API Reference

Knight exposes REST API endpoints for all core operations:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/discover` | POST | Start lead discovery |
| `/api/leads` | GET | List leads |
| `/api/leads/[id]` | GET | Get lead detail |
| `/api/emails` | GET | List sent emails |
| `/api/audit/[id]` | GET | Get audit results |
| `/api/pitch/[id]` | GET | Get AI pitch |
| `/api/webhook` | POST | LemonSqueezy webhook |
| `/api/support` | GET/POST | List/create tickets |
| `/api/support/[id]` | GET/PATCH | Ticket detail/reply |
| `/api/landing-content` | GET | Landing page CMS content |
| `/api/plans` | GET | List plans |

All endpoints require authentication via `knight_token` cookie.

---

## Architecture

```
Dashboard (Next.js 15)  ──▶  Supabase (PostgreSQL + Auth)
Worker (Node.js)         ──▶  Processes jobs concurrently
Desktop App (Electron)   ──▶  Admin management
```

- **Dashboard** deploys to Vercel (auto on push to master)
- **Worker** runs via PM2 or Docker
- **Desktop App** builds as AppImage, published to GitHub Releases

---

## Deployment

- **Dashboard:** `vercel --prod` or auto-deploy from GitHub
- **Worker:** `pm2 start ecosystem.config.cjs` or `docker compose up -d worker`
- **Desktop:** `npx vite build && npx electron-builder --linux AppImage`

**[Full deployment guide →](deployment.md)**

---

## Support

- **Email:** support@knight.com
- **Dashboard:** Use the support ticket system
- **Issues:** [GitHub Issues](https://github.com/KenzBilal/Knight/issues)
