.PHONY: help install run-backend run-frontend db-up db-down lint test clean

help:
	@echo "Available commands:"
	@echo "  make install       - Install all dependencies"
	@echo "  make db-up         - Start PostgreSQL container"
	@echo "  make db-down       - Stop PostgreSQL container"
	@echo "  make run-backend   - Start backend server"
	@echo "  make run-frontend  - Start frontend server"
	@echo "  make lint-backend  - Run backend lint"
	@echo "  make lint-frontend - Run frontend lint"
	@echo "  make clean         - Clean up generated files"

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

db-up:
	docker compose up -d

db-down:
	docker compose down

run-backend:
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

lint-backend:
	cd backend && python3 -m py_compile app/main.py app/**/*.py

lint-frontend:
	cd frontend && npm run lint

test:
	@echo "Running backend tests..."
	cd backend && python3 -m pytest -v

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf frontend/.next
	rm -f backend/.env