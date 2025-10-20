# Timesheet Application Makefile
# Provides targets for building, running, and testing the containerized application

# Configuration
CONTAINER_NAME := timesheet-app
CONTAINER_TAG := latest
FULL_IMAGE_NAME := $(CONTAINER_NAME):$(CONTAINER_TAG)
DATA_DIR := $(PWD)/data
BUILD_SCRIPT := .github/workflows/build_hosting_container.sh

# Detect container runtime
CONTAINER_RUNTIME := $(shell \
	if command -v podman >/dev/null 2>&1; then \
		echo "podman"; \
	elif command -v docker >/dev/null 2>&1; then \
		echo "docker"; \
	else \
		echo ""; \
	fi)

# Container run options
RUN_OPTS := -d \
	--name $(CONTAINER_NAME) \
	-p 8080:80 \
	-v $(DATA_DIR):/data \
	-e TIMESHEET_SQLITE=/data/timesheet.sqlite \
	-e TIMESHEET_SRC_HOME=/app/src \
	-e TIMESHEET_SA_URL=sqlite:///data/timesheet.sqlite

.PHONY: help docker run test clean logs stop status restart shell exec check-runtime

help: ## Show this help message
	@echo "Timesheet Application Container Management"
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

check-runtime: ## Check if container runtime is available
	@if [ -z "$(CONTAINER_RUNTIME)" ]; then \
		echo "❌ Error: Neither podman nor docker found. Please install one of them."; \
		exit 1; \
	fi
	@echo "✅ Using container runtime: $(CONTAINER_RUNTIME)"

docker: check-runtime ## Build the hosting container
	@echo "Building container using $(BUILD_SCRIPT)..."
	@chmod +x $(BUILD_SCRIPT)
	@$(BUILD_SCRIPT) --name $(CONTAINER_NAME) --tag $(CONTAINER_TAG)

run: check-runtime ## Run the application in the hosting container
	@echo "Creating data directory: $(DATA_DIR)"
	@mkdir -p $(DATA_DIR)
	@echo "Starting container: $(FULL_IMAGE_NAME)"
	@$(CONTAINER_RUNTIME) run $(RUN_OPTS) $(FULL_IMAGE_NAME)
	@echo "✅ Container started. Application available at http://localhost:8080"
	@echo "Use 'make logs' to view logs, 'make stop' to stop"

test: check-runtime ## Build the hosting container and run tests within it
	@echo "Building container for testing..."
	@$(MAKE) docker
	@echo "Running tests in container..."
	@mkdir -p $(DATA_DIR)
	@$(CONTAINER_RUNTIME) run --rm \
		-v $(DATA_DIR):/data \
		-e TIMESHEET_SQLITE=/data/test_timesheet.sqlite \
		-e TIMESHEET_SRC_HOME=/app/src \
		-e TIMESHEET_SA_URL=sqlite:///data/test_timesheet.sqlite \
		$(FULL_IMAGE_NAME) \
		sh -c "cd /app/src/frontend/web && npm test && cd /app/backend && python -m pytest"

clean: check-runtime ## Remove build and runtime containers and artifacts
	@echo "Cleaning up containers and images..."
	@$(CONTAINER_RUNTIME) stop $(CONTAINER_NAME) 2>/dev/null || true
	@$(CONTAINER_RUNTIME) rm $(CONTAINER_NAME) 2>/dev/null || true
	@$(CONTAINER_RUNTIME) rmi $(FULL_IMAGE_NAME) 2>/dev/null || true
	@echo "✅ Cleanup complete"

logs: check-runtime ## Display logs of the running container
	@$(CONTAINER_RUNTIME) logs -f $(CONTAINER_NAME)

stop: check-runtime ## Stop the running container
	@echo "Stopping container: $(CONTAINER_NAME)"
	@$(CONTAINER_RUNTIME) stop $(CONTAINER_NAME)
	@echo "✅ Container stopped"

status: check-runtime ## Display status of the running container
	@echo "Container status:"
	@$(CONTAINER_RUNTIME) ps -a | grep $(CONTAINER_NAME) || echo "Container not found"
	@echo ""
	@echo "Container images:"
	@$(CONTAINER_RUNTIME) images | grep $(CONTAINER_NAME) || echo "No images found"

restart: check-runtime ## Restart the running container
	@echo "Restarting container: $(CONTAINER_NAME)"
	@$(CONTAINER_RUNTIME) restart $(CONTAINER_NAME)
	@echo "✅ Container restarted"

shell: check-runtime ## Open a shell into the running container
	@echo "Opening shell in container: $(CONTAINER_NAME)"
	@$(CONTAINER_RUNTIME) exec -it $(CONTAINER_NAME) /bin/bash

exec: check-runtime ## Execute a command in the running container (usage: make exec COMMAND="your command")
	@if [ -z "$(COMMAND)" ]; then \
		echo "Usage: make exec COMMAND=\"your command\""; \
		exit 1; \
	fi
	@echo "Executing in container: $(COMMAND)"
	@$(CONTAINER_RUNTIME) exec $(CONTAINER_NAME) $(COMMAND)

# Development targets
dev-build: ## Build container for development
	@$(MAKE) docker CONTAINER_TAG=dev

dev-run: ## Run container in development mode
	@$(MAKE) run CONTAINER_TAG=dev RUN_OPTS="$(RUN_OPTS) -e NODE_ENV=development"

# CI/CD targets
ci-build: ## Build container for CI/CD
	@$(BUILD_SCRIPT) --name $(CONTAINER_NAME) --tag ci-$(shell git rev-parse --short HEAD)

# Database management
db-backup: check-runtime ## Backup the database
	@echo "Backing up database..."
	@mkdir -p ./backups
	@$(CONTAINER_RUNTIME) exec $(CONTAINER_NAME) cp /data/timesheet.sqlite /data/timesheet_backup_$(shell date +%Y%m%d_%H%M%S).sqlite
	@$(CONTAINER_RUNTIME) cp $(CONTAINER_NAME):/data/timesheet_backup_*.sqlite ./backups/
	@echo "✅ Database backup complete"

db-restore: check-runtime ## Restore database from backup (usage: make db-restore BACKUP_FILE=backup.sqlite)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "Usage: make db-restore BACKUP_FILE=backup.sqlite"; \
		exit 1; \
	fi
	@echo "Restoring database from $(BACKUP_FILE)..."
	@$(CONTAINER_RUNTIME) cp $(BACKUP_FILE) $(CONTAINER_NAME):/data/timesheet.sqlite
	@echo "✅ Database restore complete"