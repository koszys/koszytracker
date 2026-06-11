## Phase 1a/1b + Phase 2a — Data Layer & Payload CMS Integration

### Summary

Sets up the Payload CMS infrastructure and data fetching layer for the Game Home Dashboard. Payload is installed directly into the existing Next.js app (port 3000) rather than as a separate Docker service.

### Changes

**Phase 1a — Data Layer**
- `frontend/config/constants.ts` — `PAYLOAD_API_URL` constant with env fallback
- `frontend/data/types.ts` — Shared `GameCode`, `GameEvent` types
- `frontend/data/fetchCodes.ts` — Fetches game codes from Payload REST API
- `frontend/data/fetchEvents.ts` — Fetches events from Payload REST API

**Phase 1b — GameCodes Collection**
- `frontend/collections/GameCodes.ts` — Payload collection (public read, admin write)
- Registered in `payload.config.ts`

**Phase 2a — Payload CMS Scaffold**
- Payload 3.x installed via `create-payload-app` into existing Next.js app
- Existing routes moved from `app/` → `app/(frontend)/` route group
- Payload admin lives in `app/(payload)/` route group
- PostgreSQL adapter configured with isolated `payload` schema (avoids Flyway table conflicts)
- `payload.config.ts` — configured with `@payloadcms/db-postgres`, `lexicalEditor`
- `next.config.ts` — wrapped with `withPayload` plugin
- `.env.example` documented with `PAYLOAD_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_PAYLOAD_API_URL`

### Migration Note

During first `npm run dev`, Payload prompts for schema creation. Answer **`create table`** for each new Payload table (`users_sessions`, `game_codes`, `payload_kv`, `payload_locked_documents`, etc.). If prompted about data loss on Flyway tables, **answer `N`** — the `payload` schema isolation prevents this after config update.

### Roadmap
- Phase 1a: ✅ Complete
- Phase 1b: ✅ Complete
- Phase 2a: ✅ Complete
