# Contributing to Knight

Thank you for your interest in contributing to Knight.

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm
- Supabase project (free tier works)
- Git

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/Knight.git
cd Knight
git submodule update --init --recursive
```

### 2. Install

```bash
npm run setup
```

### 3. Configure

```bash
cp .env.example .env
```

Add your Supabase and Resend API keys. See [Quick Start](docs/quick-start.md) for details.

### 4. Start

```bash
npm run dev          # Dashboard on localhost:3000
npm run worker       # Worker via PM2
```

---

## Project Structure

```
Knight/
├── dashboard/         # Next.js 15 — dashboard + marketing site
├── admin-app/         # Electron desktop app (separate repo, submodule)
├── worker/            # Node.js job processor
├── supabase/          # SQL migrations
└── docs/              # Documentation
```

---

## Code Guidelines

### Dashboard (Next.js)

- **Stack:** React 19, Tailwind CSS 4, Next.js 15 App Router
- **Auth:** Supabase Auth with `knight_token` httpOnly cookie
- **Pattern:** API routes in `app/api/`, page components in `app/dashboard/`
- **All API routes** must use cookie regex + `requireAuthFromToken` + `createServiceClient` from `@/lib/auth`
- **Next.js 15 route params:** Must be `Promise<{ id: string }}` and `await params`
- **Badge variants:** `success | warning | error | info | default` (no `neutral` or `danger`)

### Worker (Node.js)

- **Pattern:** Job handlers in `worker/jobs/`, integrations in `worker/integrations/`
- **Concurrency:** Max 2 active jobs, priority sorting, RAM guard (1.5GB)
- **Dedup:** Skip duplicate leads automatically

### Desktop App (Electron)

- **Stack:** Electron 41, Vite 6, React 19, TypeScript 6, Tailwind CSS 4
- **main.cjs is CommonJS** — no TypeScript syntax in `electron/main.cjs`
- **IPC pattern:** Main process handles channels, preload exposes `electronAPI`
- **Build:** Always run `npx vite build` before `npx electron-builder`
- **Supabase in packed app:** `@supabase/supabase-js` must be in `dependencies` (not `devDependencies`) and bundled via `extraResources`

### Database

- **Migrations:** Sequential files in `supabase/migrations/`
- **Naming:** `NNN_description.sql`
- **RLS:** Always add row-level security policies
- **No breaking changes:** Never modify existing migration files

---

## Branching

- `master` — Production (auto-deploys to Vercel)
- Create feature branches: `feat/your-feature`

---

## Commits

Use conventional commits:

```
feat: add email reply detection
fix: resolve worker timeout issue
docs: update API reference
refactor: simplify job queue logic
```

---

## Testing

```bash
npm run lint          # Lint all packages
npm run typecheck     # Type check
```

---

## Pull Requests

1. Create a feature branch from `master`
2. Make your changes
3. Run `npm run lint` and `npm run typecheck`
4. Test locally with `npm run dev` and `npm run worker`
5. Open a PR against `master`

---

## Issues

- Use GitHub Issues for bug reports
- Include steps to reproduce
- Include browser/OS version for frontend issues
- Include Node.js version for backend issues

---

## License

By contributing, you agree that your contributions will be licensed under the project's proprietary license.
