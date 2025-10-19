# Build target for fresh Git checkout
build: install lint type-check test build-prod

# Install dependencies
install:
	npm ci

# Run linting
lint:
	npm run lint:check

# Run type checking
type-check:
	npm run type-check

# Run tests
test:
	npm run test

# Build for production
build-prod:
	npm run build

# Development build
build-dev:
	npm run build:dev

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/

# Full clean and rebuild
rebuild: clean install build

# Development server
dev:
	npm run dev

# Preview production build
preview: build-prod
	npm run preview

# Run integration tests (requires backend)
test-integration:
	npm run test:integration

# Run all tests including integration
test-all: test test-integration

# Quick development check (no tests)
check: install lint type-check

# Help target
help:
	@echo "Available targets:"
	@echo "  build         - Full build for fresh Git checkout (install, lint, type-check, test, build-prod)"
	@echo "  install       - Install dependencies with npm ci"
	@echo "  lint          - Run ESLint checks"
	@echo "  type-check    - Run TypeScript type checking"
	@echo "  test          - Run unit tests"
	@echo "  test-integration - Run integration tests (requires backend)"
	@echo "  test-all      - Run all tests (unit + integration)"
	@echo "  build-prod    - Build for production"
	@echo "  build-dev     - Build for development"
	@echo "  dev           - Start development server"
	@echo "  preview       - Preview production build"
	@echo "  check         - Quick development check (install, lint, type-check)"
	@echo "  clean         - Remove build artifacts and node_modules"
	@echo "  rebuild       - Clean and rebuild everything"
	@echo "  help          - Show this help message"

.PHONY: build install lint type-check test build-prod build-dev clean rebuild dev preview test-integration test-all check help
