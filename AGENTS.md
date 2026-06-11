# senti.moe — Agent Guide

## Quick start

```bash
make dev        # Docker DB + Maven backend + frontend (hot reload)
make run        # Full Docker stack + frontend
make stop       # Stop everything + free port 8000
```

## Project structure

- `frontend/` — Next.js 16 + React 19 + TypeScript 5 + Tailwind v4
- `backend/` — **Spring Boot 3.5 + Java 21 + Maven** (README incorrectly describes old Python setup; ignore it)
- `gamehome/` + `homepage/` — **legacy** directories being migrated into `frontend/` per ROADMAP. Do not create new code here.
- `test/seed.js` — manual DevTools script pasted into browser console (not an automated test)

## Database

- PostgreSQL 16 on port **5433** (not 5432)
- Schema managed by Flyway (`ddl-auto: validate` — Hibernate never auto-creates tables)
- Start standalone: `make db-up`

## Development commands

| Command | What it does |
|---|---|
| `make dev` | DB (Docker) + Maven backend + frontend — active development |
| `make run-backend` | Starts backend with env loaded from repo root `.env` (`set -a && . ../.env && set +a` then `mvnw spring-boot:run`) |
| `make run-frontend` | `npm run dev` on port 3000 |
| `make lint-backend` | `mvn compile -q` |
| `make lint-frontend` | `npm run lint` (**not** `next lint`) |
| `make test` | All backend tests (H2 in-memory, Flyway disabled) |
| `make test-file TEST=ClassName` | Single test class |
| `make test-wish` | `WishServiceTest,WishConflictServiceTest` |
| `make test-core` | `JwtProviderTest,AccountMatcherTest,GlobalExceptionHandlerTest` |
| `make test-controllers` | `AccountControllerTest,WishControllerTest` |
| `make package` | Build backend JAR |

## Architecture notes

- **OAuth**: Google + Discord → JWT (HS256, 7-day expiry). Token stored in `localStorage` under key `token`.
- **Wish data** lives in localStorage (`wishes-{gameId}`) when offline; synced to backend on login. `test/seed.js` populates localStorage for manual testing.
- **Game switcher**: per-game config in `frontend/config/games.ts`. 4 games: `genshin` + `wuwa` (active), `hsr` + `zzz` (comingsoon). Theme CSS vars are set on `document.body` by the dashboard layout.
- **Frontend context tree**: `AuthProvider > GameProvider > [children]` in root layout; `SettingsProvider` wraps page content inside dashboard layout only.
- **Path alias**: `@/*` → `frontend/`
- **CI / pre-commit / frontend tests**: none exist
- **Rate limiting**: Bucket4j on import endpoint
- **No docker compose or local backend required for frontend-only work** — wish data reads from localStorage
