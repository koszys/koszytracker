# Sentimoe Backend

Spring Boot 3.x REST API — OAuth2 authentication via Google/Discord, JWT tokens, PostgreSQL, website for gacha games.

## Prerequisites

- Java 21
- Docker (for PostgreSQL)
- Node.js 18+ (for frontend)

## Getting Started

```bash
# 1. Copy and fill in environment variables
cp .env.example .env

# 2. Start the database
make db-up

# 3. Start the backend (hot reload)
make run-backend

# 4. In another terminal, start the frontend
make run-frontend
```

Or for a quick full-stack test via Docker:

```bash
make run
```

## Available Commands

| Command | Description |
|---|---|
| `make dev` | DB (Docker) + Maven backend + frontend — active development |
| `make run` | All services in Docker — quick full-stack test |
| `make stop` | Stop everything and free port 8000 |
| `make test` | Run tests |
| `make lint-backend` | Compile-check |
| `make package` | Build JAR |

## API

| Endpoint | Auth | Description |
|---|---|---|
| `GET /` | — | Health check |
| `GET /auth/{provider}` | — | OAuth2 login (google, discord) |
| `GET /auth/success` | — | OAuth callback → JWT redirect |
| `GET /api/accounts` | JWT | List game accounts |
| `POST /api/accounts` | JWT | Create game account |
| `PUT /api/accounts/{id}` | JWT | Update game account |
| `DELETE /api/accounts/{id}` | JWT | Delete game account |
| `POST /api/accounts/sync` | JWT | Sync accounts from game |
| `GET /api/wishes` | JWT | List wishes |
| `POST /api/wishes/import` | JWT | Import wishes (rate limited) |
| `POST /api/wishes/resolve` | JWT | Resolve wish conflicts |

## Stack

- Java 21 + Spring Boot 3.x
- Spring Security + OAuth2 Client + jjwt
- Spring Data JPA + Hibernate
- Flyway migrations
- PostgreSQL 16
- Bucket4j (rate limiting)
- Testcontainers (tests)
