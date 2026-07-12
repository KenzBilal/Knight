# Contributing to Knight

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/KenzBilal/Knight.git
cd Knight

# Install all dependencies
npm run install:all

# Set up environment
npm run setup

# Start dev servers
npm run dev
```

## Project Layout

| Directory | What | Tech |
|-----------|------|------|
| `dashboard/` | Web dashboard + marketing site | Next.js 15, React 19, Tailwind |
| `worker/` | Autonomous sales agent | Node.js, Puppeteer |
| `admin-app/` | Desktop control center | Electron (private repo) |
| `supabase/` | Database schema + migrations | PostgreSQL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dashboard + worker |
| `npm run build` | Build dashboard for production |
| `npm run lint` | Lint dashboard |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Type-check dashboard |
| `npm run test` | Run tests |

## Code Style

- **TypeScript** for dashboard and desktop app
- **JavaScript (ESM)** for worker
- **Tailwind CSS** for all styling
- **Prettier** for formatting (run `npm run format` before committing)
- No inline comments unless explaining complex logic

## Branches

- `master` — production (auto-deploys to Vercel)
- Feature branches — `feat/your-feature`
- Bug fixes — `fix/your-bug`

## Pull Requests

1. Create a branch from `master`
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Test your changes locally
5. Open a PR with a clear description

## Environment Variables

Never commit `.env` files. Use `.env.example` as a template.

## Questions?

Open an issue at https://github.com/KenzBilal/Knight/issues
