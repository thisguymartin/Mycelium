.PHONY: help install dev dev-client dev-server build build-client build-server clean docker-up docker-down docker-build test

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Show this help message
	@echo ""
	@echo "$(BLUE)╔═══════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║            SwarmTech Commands                 ║$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════╝$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

install: ## Install all dependencies
	@./scripts/install.sh

dev: ## Start all services in development mode
	@./scripts/dev.sh

dev-client: ## Start only client in development mode
	@./scripts/dev-client.sh

dev-server: ## Start only server in development mode
	@./scripts/dev-server.sh

build: ## Build all services for production
	@./scripts/build.sh

build-client: ## Build only client
	@cd client && npm run build

build-server: ## Build only server
	@cd server && npm run build

clean: ## Remove all build artifacts and node_modules
	@./scripts/clean.sh

docker-up: ## Start all services with Docker
	@./scripts/docker-up.sh

docker-down: ## Stop all Docker services
	@./scripts/docker-down.sh

docker-build: ## Build Docker images
	@docker-compose build

docker-logs: ## View Docker logs
	@docker-compose logs -f

test: ## Run all tests
	@echo "$(YELLOW)Running tests...$(NC)"
	@npm run test --workspaces --if-present

lint: ## Run linter on all workspaces
	@echo "$(YELLOW)Running linter...$(NC)"
	@npm run lint --workspaces --if-present

format: ## Format code with prettier
	@echo "$(YELLOW)Formatting code...$(NC)"
	@npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

setup: install ## Setup project (install + create .env files)
	@if [ ! -f server/.env ]; then cp server/.env.example server/.env; fi
	@if [ ! -f client/.env ]; then cp client/.env.example client/.env; fi
	@echo "$(GREEN)✓ Setup complete!$(NC)"

status: ## Show service status
	@echo ""
	@echo "$(BLUE)Service Status:$(NC)"
	@echo ""
	@echo "$(GREEN)Client:$(NC)"
	@if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then echo "  ✓ Running on http://localhost:5173"; else echo "  ✗ Not running"; fi
	@echo ""
	@echo "$(GREEN)Server:$(NC)"
	@if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then echo "  ✓ Running on http://localhost:8001"; else echo "  ✗ Not running"; fi
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@if docker ps --format '{{.Names}}' | grep -q swarmtech; then echo "  ✓ Containers running"; docker ps --filter name=swarmtech --format "    - {{.Names}} ({{.Status}})"; else echo "  ✗ No containers running"; fi
	@echo ""

ps: ## Show running Docker containers
	@docker-compose ps
