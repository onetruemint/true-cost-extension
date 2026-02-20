# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Savest is a Chrome extension that shows users the opportunity cost of purchases by calculating what the money could grow to if invested. It's a monorepo with three components:

- **extension/** — Chrome Extension (Manifest v3, vanilla JS, no build system)
- **backend/** — Express.js API proxy server (port 3000)
- **frontend/** — Next.js marketing website (port 3001, React 19, TypeScript, Tailwind CSS 4)

## Commands

### Backend
```bash
cd backend && npm install          # Install dependencies
cd backend && npm start            # Run server (port 3000)
cd backend && npm run dev          # Dev mode with hot reload (node --watch)
cd backend && npm run db:push      # Push Supabase migrations
cd backend && npm run db:reset     # Reset Supabase database
cd backend && npm run db:seed      # Seed initial data
```

### Frontend
```bash
cd frontend && npm install         # Install dependencies
cd frontend && npm run dev         # Dev server (port 3001)
cd frontend && npm run build       # Production build
cd frontend && npm run lint        # ESLint
```

### Extension
No build system — load as unpacked extension in Chrome directly from `extension/`.

## Architecture

### Data Flow
The extension never calls Supabase directly. All requests are proxied through the backend:

```
Extension ──(Chrome messages)──> background.js ──(HTTP)──> Backend API ──> Supabase
```

### Authentication Flow
1. User clicks sign-in in extension popup → opens frontend at localhost:3001
2. Frontend gets OAuth URL from backend `/auth/google/url`
3. After OAuth, browser redirects to `chrome-extension://[ID]/auth.html` with tokens in hash
4. `auth.js` extracts tokens, stores in Chrome storage
5. `auth-sync.js` also watches frontend localStorage and syncs tokens to extension via `chrome.runtime.sendMessage`

### Extension Internal Communication
Uses Chrome's `runtime.onMessage` pattern throughout:
- `content.js` — Injects price badges and purchase-decision modals on Amazon pages, uses MutationObserver for dynamic content
- `background.js` — Service worker handling message routing, session refresh (30-min alarm), settings broadcast
- `popup.js` — Extension popup UI with settings, savings dashboard, auto-save with debounce
- `lib/supabase.js` — `TrueCostAPI` class wrapping all backend HTTP calls

### Backend Structure
Single-file Express server at `backend/src/server.js` with routes:
- `/auth/*` — Signup, signin, OAuth, refresh, signout
- `/settings` — GET/POST user preferences
- `/variants` — A/B test question variants with effectiveness stats
- `/savings` — Record and retrieve purchase decisions
- `/health` — Health check

### Database (Supabase PostgreSQL)
Four tables with row-level security (RLS):
- `user_settings` — Per-user preferences (return rate, years, min price)
- `question_variants` — A/B test question phrasings
- `savings` — Purchase decision records (price, currency, need/want, skipped/purchased)
- `question_effectiveness` — Aggregate stats per variant per user for weighted selection

Migrations in `backend/supabase/migrations/`, seed data in `backend/supabase/seed.sql`.

### Frontend Structure
Next.js App Router with pages at `src/app/` (home, signin, auth/callback, privacy). Components in `src/components/` with barrel export via `index.ts`. API client in `src/lib/api.ts`.

## Key Patterns

- **Weighted variant selection**: Variants with higher skip rates are shown more often (skip_rate = times_skipped / times_shown)
- **Future value formula**: `price × (1 + return_rate)^years`
- **Multi-currency**: Auto-detected from Amazon domain (.com, .co.uk, .ca, .de, .fr, .es, .it, .co.jp, .com.au)
- **Price detection**: CSS selector-based; changes to Amazon's HTML structure will break detection

## Gotchas

- Backend and frontend URLs are **hardcoded** in the extension — must update when deploying
- CORS on backend explicitly allows `chrome-extension://` and `moz-extension://` origins
- Chrome Extension ID must be configured in Supabase `config.toml` for OAuth redirects
- JWT tokens expire in 3600s; background.js auto-refreshes every 30 minutes via Chrome Alarms
- Extension uses `update.sh` script to sync to a Windows mount point
