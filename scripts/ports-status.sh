#!/bin/bash
# Render current port occupancy for development environment
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENVIRONMENT="${1:-development}"

node "$SCRIPT_DIR/ports-cli.js" status "$ENVIRONMENT"

echo
echo "Docker (mapeos activos):"
docker ps --format 'table {{.Names}}\t{{.Ports}}' | sed -n '1,200p' || true
