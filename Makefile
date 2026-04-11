.PHONY: help start stop restart status open

help: ## Show this help
	@echo "Wetter — Makefile commands"
	@echo
	@echo "Usage: make <target> [VARIABLE=value]"
	@echo
	@echo "Targets:"
	@awk 'BEGIN {FS=":.*##"; printf "%-12s %s\n", "Target", "Description"; print "------------ ------------"} /^[a-zA-Z0-9_\-]+:.*##/ {printf "%-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo
	@echo "Variables (can be overridden):"
	@echo "  DEV_HOST=$(DEV_HOST)    # host to bind (env override)"
	@echo "  DEV_PORT=$(DEV_PORT)    # port to serve on"
	@echo "  DOC_ROOT=$(DOC_ROOT)    # document root for PHP server"
	@echo
# Simple Makefile to run frontend + backend (PHP dev server)

DEV_HOST ?= 127.0.0.1
DEV_PORT ?= 8000
DOC_ROOT ?= .
PID_FILE ?= .devserver.pid

.PHONY: start stop restart status open

start:
	@echo "Starting PHP dev server at http://$(DEV_HOST):$(DEV_PORT) ..."
	@if [ -f $(PID_FILE) ] && kill -0 `cat $(PID_FILE)` 2>/dev/null; then \
		echo "Server already running (PID $$(cat $(PID_FILE)))"; exit 1; \
	fi
	@php -S $(DEV_HOST):$(DEV_PORT) -t $(DOC_ROOT) > /dev/null 2>&1 & echo $$! > $(PID_FILE)
	@echo "Started (PID $$(cat $(PID_FILE)))"
start: ## Start PHP dev server (serves frontend and proxy)

stop:
	@if [ -f $(PID_FILE) ]; then \
		kill `cat $(PID_FILE)` 2>/dev/null || true; rm -f $(PID_FILE); echo "Stopped"; \
	else \
		echo "No server pid file found."; \
	fi
stop: ## Stop PHP dev server

restart: stop start
restart: ## Restart PHP dev server

status:
	@if [ -f $(PID_FILE) ] && kill -0 `cat $(PID_FILE)` 2>/dev/null; then \
		echo "Running (PID $$(cat $(PID_FILE)))"; \
	else \
		echo "Not running"; \
	fi
status: ## Show PHP dev server status

open:
	@echo "Opening frontend in default browser..."
	@open http://$(DEV_HOST):$(DEV_PORT)/frontend/index.html || echo "Use your browser to open: http://$(DEV_HOST):$(DEV_PORT)/frontend/index.html"
open: ## Open frontend in default browser (macOS `open`)

# end
