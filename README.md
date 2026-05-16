# Wish Tracker

Genshin Impact wish tracking application with OAuth authentication.

## Tech Stack

- **Backend**: Python + FastAPI + PostgreSQL
- **Frontend**: Next.js 16 (App Router) + Tailwind CSS
- **Database**: PostgreSQL via Docker

## Quick Start

### 1. Start PostgreSQL
```bash
docker compose up -d
```

### 2. Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000`

### 3. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:3000`

## Project Structure

```
wishtracker/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/     # Routes (auth, wishes, etc.)
│   │   ├── db/      # Database config
│   │   ├── models/  # SQLAlchemy models
│   │   └── services/# Business logic
│   └── main.py      # Entry point
├── frontend/        # Next.js application
│   └── app/         # App Router pages
├── compose.yaml     # Docker Compose (PostgreSQL)
└── stuff/           # Reference docs and scripts
```

## Environment Variables

Create `backend/.env` with your OAuth credentials:
- Google OAuth credentials from Google Cloud Console
- Discord OAuth credentials from Discord Developer Portal
- JWT secret key

## Features

- OAuth login (Google, Discord)
- Genshin wish history import
- Wish statistics and analytics
- Multi-account support

## Reference

- PowerShell script for extracting wish history URL: `stuff/script.txt`
- Gacha system details: `stuff/genshingacha.html`