.PHONY: help install build watch dev start stop restart status open clean

# Configuration
DEV_HOST ?= 127.0.0.1
DEV_PORT ?= 8000
DOC_ROOT ?= .
PID_FILE ?= .devserver.pid

help: ## Show this help
	@echo "Wetter — Makefile commands"
	@echo
	@echo "Usage: make <target> [VARIABLE=value]"
	@echo
	@echo "Targets:"
	@awk 'BEGIN {FS=":.*##"; printf "  %-18s %s\n", "Target", "Description"; print "  -------------------- ----------"} /^[a-zA-Z0-9_\-]+:.*##/ {printf "  %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo
	@echo "Variables (can be overridden):"
	@echo "  DEV_HOST=$(DEV_HOST)    # host to bind"
	@echo "  DEV_PORT=$(DEV_PORT)    # port to serve on"
	@echo

install: ## Install npm dependencies
	@echo "Installing dependencies..."
	@npm install
	@echo "✓ Dependencies installed"

build: ## Build Tailwind CSS (production)
	@echo "Building Tailwind CSS..."
	@npm install && npm run build:css
	@echo "✓ CSS built"

watch: ## Watch and rebuild Tailwind CSS on changes
	@echo "Watching Tailwind CSS changes..."
	@npm run watch:css

dev: ## Start development: PHP server + watch CSS (run in separate terminals)
	@echo "Development setup:"
	@echo "  Terminal 1: make start"
	@echo "  Terminal 2: make watch"
	@echo
	@make start

start: ## Start PHP dev server at http://$\(DEV_HOST\):$\(DEV_PORT\)
	@echo "Starting PHP dev server at http://$(DEV_HOST):$(DEV_PORT) ..."
	@if [ -f $(PID_FILE) ] && kill -0 `cat $(PID_FILE)` 2>/dev/null; then \
		echo "✗ Server already running (PID $$(cat $(PID_FILE)))"; exit 1; \
	fi
	@php -S $(DEV_HOST):$(DEV_PORT) -t $(DOC_ROOT) -r index.php > /dev/null 2>&1 & echo $$! > $(PID_FILE)
	@echo "✓ Server started (PID $$(cat $(PID_FILE)))"

stop: ## Stop PHP dev server
	@if [ -f $(PID_FILE) ]; then \
		kill `cat $(PID_FILE)` 2>/dev/null || true; rm -f $(PID_FILE); echo "✓ Server stopped"; \
	else \
		echo "✗ No server running"; \
	fi

restart: stop start ## Restart PHP dev server

status: ## Show server status
	@if [ -f $(PID_FILE) ] && kill -0 `cat $(PID_FILE)` 2>/dev/null; then \
		echo "✓ Running (PID $$(cat $(PID_FILE)))"; \
	else \
		echo "✗ Not running"; \
	fi

open: ## Open browser at http://$\(DEV_HOST\):$\(DEV_PORT\)
	@open http://$\(DEV_HOST\):$\(DEV_PORT\)

clean: ## Clean generated files
	@echo "Cleaning..."
	@rm -rf node_modules dist
	@echo "✓ Cleaned"
