# Why this exists: short commands for the common Docker and database tasks.
# Run them from the infra/ folder, e.g. "make up". On Windows, install make
# first (for example "choco install make"), or copy the command after each target.

COMPOSE = docker compose -f docker-compose.yml --env-file ../.env

.PHONY: up down seed logs app app-down test

up:        ## Start Postgres, Redis and pgAdmin
	$(COMPOSE) up -d

down:      ## Stop every container (data is kept in the pgdata volume)
	$(COMPOSE) --profile app down

seed:      ## Apply migrations and load the demo users, games and runs
	cd ../backend && npx prisma migrate deploy && npx prisma db seed

logs:      ## Follow the logs of all running containers
	$(COMPOSE) --profile app logs -f

app:       ## Build and run the whole app in Docker (frontend on :8080)
	$(COMPOSE) --profile app up -d --build

app-down:  ## Stop only the app containers
	$(COMPOSE) --profile app stop backend frontend

test:      ## Run the backend test suite
	cd ../backend && npm test
