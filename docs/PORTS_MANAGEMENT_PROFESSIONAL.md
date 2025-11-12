# Port Management Professional Suite

**Status**: ✅ **Implemented** (enero 2025)

---

## Summary

The Flores Victoria project now includes professional-grade port management tools:

1. **Ports CLI** (`scripts/ports-cli.js`) – introspect, kill, suggest, validate, export port usage.
2. **Ports Enforcer** (`scripts/ports-enforcer.sh`) – enforce port availability before launching
   services.
3. **Port Dashboard** (`scripts/ports-status.sh`) – quick visual overview of dev/prod/test ports.
4. **Port Configuration** (`config/ports.json`) – centralized, conflict-free definitions for every
   environment.

---

## Features delivered

### Ports CLI

- `npm run ports:status` – Dev ports status (who is using what).
- `npm run ports:status:prod` – Production ports status.
- `npm run ports:who -- <port>` – Identifies which process/container owns a port.
- `npm run ports:kill -- <port>` – Terminates local processes on a port (skips Docker).
- `npm run ports:suggest` – Suggests 5 free ports near 3000.
- `npm run ports:validate:cli` – Validates configuration has no conflicts across environments.
- `npm run ports:export:json` – Exports port mapping as JSON.
- `npm run ports:dashboard` – Combined CLI + docker ps view.

### Ports Enforcer

- **Preflight enforcement**: Ensure a service's port is free before running.
- Actions:
  - `abort` – Exit if port is busy (default).
  - `kill-local` – Kill local processes occupying the port; continue.
  - `stop-docker` – Stop Docker containers mapping the port; continue.
  - `auto-next` – Pick next available port dynamically; continue.
- Usage:
  ```bash
  bash ./scripts/ports-enforcer.sh <service> <environment> --action=abort -- <command>
  ```

### Port Configuration

- `config/ports.json` defines unique ports for:
  - **development** (3xxx range)
  - **production** (4xxx range)
  - **testing** (5xxx range)
- No conflicts validated via `npm run ports:validate:cli`.
- Environment-specific `.env` files generated from the config (`npm run ports:env:dev`, etc.).

---

## Example workflows

1. **Check if admin port (3021) is busy**:

   ```bash
   npm run ports:who -- 3021
   # {
   #   "processes": [],
   #   "containers": [{ "id": "...", "name": "flores-victoria-admin-panel", ... }]
   # }
   ```

2. **Suggest free ports for a new service**:

   ```bash
   npm run ports:suggest
   # 3001
   # 3003
   # 3005
   # 3006
   # 3007
   ```

3. **Kill local processes on a port (dev)**:

   ```bash
   npm run ports:kill -- 3021
   # If only Docker is listening, will inform user.
   ```

4. **Launch admin with enforced port check**:

   ```bash
   npm run admin:start:enforced
   # Aborts if 3021 is busy.
   ```

5. **Auto-pick next free port if 3021 is in use**:
   ```bash
   bash ./scripts/ports-enforcer.sh admin-panel development --action=auto-next -- node admin-panel/server.js --port=$PORT
   ```

---

## Files added/updated

### New files

- `scripts/ports-cli.js` – Professional port CLI (status, who, kill, suggest, validate, check,
  export-json).
- `scripts/ports-enforcer.sh` – Enforce policy before running commands with customizable actions.
- `scripts/ports-status.sh` – Quick dashboard combining CLI and Docker ps.
- `docs/PORTS_CLI_GUIDE.md` – Complete usage guide.
- `docs/PORTS_MANAGEMENT_PROFESSIONAL.md` – This summary.

### Updated files

- `config/ports.json` – Resolved conflicts; documentation now 3080/4080/5080.
- `package.json` – Added npm scripts for CLI and enforcer (`ports:status`, `ports:who`,
  `ports:kill`, `ports:suggest`, etc.).
- `admin-panel/server.js` – Guard to block legacy port 3020; default to 3021.
- `scripts/admin-start.sh` – Preflight check using port-manager; sources port-guard if present.
- `scripts/admin-stop.sh` – Stops both dev (3021) and prod (4021) ports, legacy 3001/3010, and
  nodemon.
- `docker-compose.dev.yml` / `docker-compose.dev-simple.yml` / `docker-compose.prod.yml` – Admin
  ports corrected and `PORT` environment variable set.
- `.env.development`, `.env.production`, `.env.testing` – Regenerated from `ports.json` with no
  conflicts.

---

## Validation results

1. **Port conflicts**: `✅ No hay conflictos de puertos entre ambientes`
2. **Dev ports status** (snapshot from Jan 2025):
   - main-site (3000) – `EN USO` (proc:node)
   - order-service (3004) – `EN USO` (docker:flores-victoria-order-service)
   - grafana (3011) – `EN USO` (docker:flores-victoria-grafana)
   - ai-service (3013) – `EN USO` (proc:node)
   - admin-panel (3021) – `EN USO` (docker:flores-victoria-admin-panel)
   - documentation (3080) – `LIBRE`
   - prometheus (9090) – `EN USO` (docker:flores-victoria-prometheus)

3. **Docker Admin**: Verified serving at `http://localhost:3021` via `curl localhost:3021/health`.

---

## Next steps (optional)

1. **Wire advanced enforcer** into deployment scripts (e.g., `start-all.sh`, CI pipeline) with
   `--action=abort` to fail fast if ports are occupied.
2. **Extend documentation** to mention port ranges and new CLI commands in `docs/PORTS.md` or the
   main `README.md`.
3. **Add to dashboard**: Show port status on the admin panel's control center page.

---

## Conclusion

The professional port management suite eliminates port conflicts, provides on-demand introspection,
and ensures predictable service startup. Developers can now:

- Diagnose who owns a port in seconds.
- Auto-suggest free ports.
- Kill conflicting processes or containers with one command.
- Enforce policies before launching long-running processes.

All tools integrate seamlessly with the centralized `config/ports.json` and are accessible via npm
scripts.

---

**Reference**: See `docs/PORTS_CLI_GUIDE.md` for detailed usage and examples.
