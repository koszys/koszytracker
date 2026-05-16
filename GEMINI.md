# Project Overview: koszytracker

A comprehensive gacha game tracking and planning application. It features a Next.js frontend and a FastAPI backend, with PostgreSQL for data storage and OAuth (Google, Discord) for authentication.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript.
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy (ORM), Pydantic (Data validation).
- **Database**: PostgreSQL 16 (running in Docker).
- **Authentication**: OAuth 2.0 (Google, Discord), JWT.

## Architecture

The project is split into two main directories:
- `backend/`: FastAPI application.
  - `app/auth/`: OAuth flow and session management.
  - `app/accounts/`: User account and profile logic.
  - `app/wishes/`: Gacha wish history and tracking.
- `frontend/`: Next.js application.
  - `app/(main)/`: Core application pages (dashboard, tracker, settings).
  - `components/`: Reusable UI components.
  - `contexts/`: React contexts for Auth and Settings.

## Building and Running

A `Makefile` is provided in the root directory for common development tasks.

### Prerequisites
- Docker & Docker Compose
- Node.js & npm
- Python 3.10+

### Key Commands
- **Install Dependencies**: `make install`
- **Start Database**: `make db-up`
- **Run Backend**: `make run-backend` (Runs at `http://localhost:8000`)
- **Run Frontend**: `make run-frontend` (Runs at `http://localhost:3000`)
- **Linting**: `make lint-backend` / `make lint-frontend`
- **Testing**: `make test` (Runs backend pytest)

## Development Conventions

- **Environment Variables**: Use `.env` files in the `backend/` directory for secrets. A `backend/.env` is required for the backend to run.
- **Database Migrations**: Currently uses `Base.metadata.create_all` in `main.py` for schema generation. (Future: migrate to Alembic).
- **Frontend State**: Uses React Context (`AuthContext`, `SettingsContext`) for global state.
- **API Communication**: Frontend talks to `http://localhost:8000`. CORS is configured in the backend to allow this.
- **Styling**: Tailwind CSS 4 is used for styling. Prefers modern CSS features.

## Project Structure

```
koszytracker/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── auth/     # OAuth & JWT
│   │   ├── accounts/ # User data
│   │   ├── wishes/   # Gacha data
│   │   ├── config.py # Settings & Env loading
│   │   └── database.py
│   └── requirements.txt
├── frontend/         # Next.js application
│   ├── app/          # App Router
│   ├── components/   # Shared UI
│   ├── contexts/     # Auth/Settings State
│   └── package.json
├── compose.yaml      # PostgreSQL setup
└── Makefile          # Dev task automation
```
