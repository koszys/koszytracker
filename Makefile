.PHONY: help install kill-port stop run-backend run-frontend \
        db-up db-up-all db-down lint-backend lint-frontend test clean

-include .env
export

JAVA_HOME ?= /opt/homebrew/opt/openjdk

kill-port:
	@lsof -ti :8000 | xargs -r kill 2>/dev/null; true

stop:
	docker compose down
	@lsof -ti :8000 | xargs -r kill 2>/dev/null; true

help:
	@echo ""
	@echo "  Standard workflows:"
	@echo "    make run            DB + backend (Docker) + frontend"
	@echo "    make dev            DB (Docker) + backend (Maven) + frontend"
	@echo "    make stop           Stop all containers + local backend"
	@echo ""
	@echo "  Commands:"
	@echo "    make install        Install all dependencies"
	@echo "    make db-up          Start PostgreSQL container"
	@echo "    make db-up-all      Start PostgreSQL + pgAdmin containers"
	@echo "    make db-down        Stop all containers"
	@echo "    make run-backend    Start Java backend (Maven)"
	@echo "    make run-frontend   Start frontend server"
	@echo "    make lint-backend   Compile-check Java backend"
	@echo "    make lint-frontend  Run frontend lint"
	@echo "    make test           Run Java backend tests"
	@echo "    make package        Build Java backend JAR"
	@echo "    make clean          Clean up generated files"
	@echo ""

run: kill-port
	docker compose up -d
	$(MAKE) run-frontend

dev: kill-port
	docker compose up -d db
	$(MAKE) run-backend &
	$(MAKE) run-frontend

install:
	@echo "Installing backend dependencies..."
	cd backend-java && ./mvnw dependency:go-offline -q -B
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

db-up:
	docker compose up -d db

db-up-all:
	docker compose up -d

db-down:
	docker compose down

run-backend:
	cd backend-java && JAVA_HOME=$(JAVA_HOME) ./mvnw spring-boot:run -Dmaven.test.skip=true

run-frontend:
	cd frontend && npm run dev

lint-backend:
	cd backend-java && JAVA_HOME=$(JAVA_HOME) mvn compile -q

lint-frontend:
	cd frontend && npm run lint

test:
	@echo "Running backend tests..."
	cd backend-java && JAVA_HOME=$(JAVA_HOME) mvn test

package:
	cd backend-java && JAVA_HOME=$(JAVA_HOME) mvn package -DskipTests -q

clean:
	rm -rf frontend/.next
	rm -rf backend-java/target
