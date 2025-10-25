# Ports CLI & Enforcer Guide

This guide explains the professional port management tools available in this repo: the Ports CLI and the Ports Enforcer.

## Quick start

- Show current status (dev): `npm run ports:status`
- Who is using a port: `npm run ports:who -- 3021`
- Kill local processes on a port: `npm run ports:kill -- 3021`
- Suggest free ports near 3000: `npm run ports:suggest`
- Validate configuration conflicts: `npm run ports:validate:cli`
- Export mapping as JSON: `npm run ports:export:json`
- Terminal dashboard (with docker mappings): `npm run ports:dashboard`

## Ports CLI commands

The CLI reads `config/ports.json` and inspects your system using `lsof`, `ss`, and `docker`.

- `node scripts/ports-cli.js status [env]`
  - Shows if each configured port is FREE or IN-USE and whether it's local or a Docker container.
  - Environments: development, production, testing.

- `node scripts/ports-cli.js who <port>`
  - Lists local processes (PID/command) and Docker containers bound to the port.

- `node scripts/ports-cli.js kill <port>`
  - Kills local processes listening on the port (skips Docker).

- `node scripts/ports-cli.js suggest [start] [count]`
  - Suggests `count` free ports starting from `start` (defaults: 3000 and 5).

- `node scripts/ports-cli.js env [env] [outfile]`
  - Generates a `.env` file with `<SERVICE>_PORT` variables.

- `node scripts/ports-cli.js validate`
  - Validates there are no duplicate port assignments across environments.

- `node scripts/ports-cli.js check [env]`
  - Verifies availability of all configured ports in the environment (non-zero exit if any are busy).

- `node scripts/ports-cli.js export-json [env]`
  - Exports current mapping and runtime usage to JSON.

## Ports Enforcer

Preflight check to ensure a service's desired port is available before running commands.

Usage:

```
bash ./scripts/ports-enforcer.sh <service> <environment> [--action=abort|auto-next|kill-local|stop-docker] -- <command...>
```

Examples:

- Strict (abort if busy):
  - `npm run admin:start:enforced`

- Kill local processes and continue:
  - `bash ./scripts/ports-enforcer.sh admin-panel development --action=kill-local -- node admin-panel/server.js --port=$PORT`

- Stop Docker container that maps the port (if any) and continue:
  - `bash ./scripts/ports-enforcer.sh admin-panel development --action=stop-docker -- node admin-panel/server.js --port=$PORT`

- Auto-pick next available port when busy:
  - `bash ./scripts/ports-enforcer.sh admin-panel development --action=auto-next -- node admin-panel/server.js --port=$PORT`

## Notes

- Central configuration lives in `config/ports.json`.
- `port-manager.js` provides core operations used by both CLI and Enforcer.
- Admin panel defaults to 3021 (dev) and has a guard to avoid legacy 3020.
- Prefer a single owner per well-known port (Docker or local) to avoid churn.
