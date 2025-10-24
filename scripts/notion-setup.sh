#!/bin/bash
# Notion Setup Helper for Flores Victoria
# Este script te ayuda a preparar datos para Notion

echo "🚀 Flores Victoria - Notion Setup Helper"
echo "=========================================="
echo ""

# Crear directorio para exports
mkdir -p docs/notion-exports

# 1. Export Service Status
echo "📊 Generando reporte de servicios..."
cat > docs/notion-exports/services-status.csv << 'EOF'
Service Name,Status,Dev Port,Prod Port,Health Check,Last Updated
API Gateway,🟢 Running,3000,4000,http://localhost:3000/api/status,2025-10-24
Auth Service,🟢 Running,3001,4001,http://localhost:3001/health,2025-10-24
Payment Service,🟢 Running,3003,4003,http://localhost:3003/health,2025-10-24
Order Service,🟡 Not Started,3002,4002,-,2025-10-24
Notification Service,🟢 Running,3004,4004,http://localhost:3004/health,2025-10-24
Admin Panel,🟡 Port Conflict,3021,4021,http://localhost:3021,2025-10-24
EOF

# 2. Export Broken Links (from validation report)
echo "🔗 Exportando enlaces rotos..."
if [ -f "test-results/link_check_report_"*".md" ]; then
    LATEST_REPORT=$(ls -t test-results/link_check_report_*.md | head -1)
    echo "Service,File,Link,Status,Priority,Type" > docs/notion-exports/broken-links.csv
    
    # Parse the markdown report and extract broken links
    grep "href=\|src=" "$LATEST_REPORT" | head -50 | while read -r line; do
        echo "Frontend,Extracted from report,$line,🔴 Broken,Medium,href" >> docs/notion-exports/broken-links.csv
    done
else
    echo "No se encontró reporte de validación. Ejecuta: npm run links:validate"
fi

# 3. Export Current Tasks
echo "📋 Generando lista de tareas..."
cat > docs/notion-exports/tasks.csv << 'EOF'
Task,Status,Priority,Service,Assignee,Due Date,Sprint,Estimate
Refactor 263 broken links to absolute paths,🔵 In Progress,🔴 Critical,Frontend,,2025-10-25,Sprint 1,8
Resolve Admin Panel port conflict (3020 → 3021),🔵 In Progress,🟠 High,Admin,,2025-10-25,Sprint 1,2
Complete Payment Service Stripe integration,⚪ Not Started,🟠 High,Payment,,2025-10-30,Sprint 1,16
Implement real Service Worker for PWA,⚪ Not Started,🟡 Medium,Frontend,,2025-11-15,Backlog,12
Add missing meta tags for SEO,⚪ Not Started,🟡 Medium,Frontend,,2025-11-20,Backlog,4
Optimize images to WebP format,⚪ Not Started,🟢 Low,Frontend,,2025-12-01,Backlog,6
Create API documentation with Swagger,⚪ Not Started,🟡 Medium,Backend,,2025-11-10,Sprint 2,8
Setup automated backups,⚪ Not Started,🟠 High,DevOps,,2025-10-28,Sprint 1,4
EOF

# 4. Export Environment Variables Template
echo "🔐 Generando template de variables de entorno..."
cat > docs/notion-exports/env-variables.csv << 'EOF'
Variable,Service,Required,Description,Example,Default
PORT,All Services,✅,Service port,3001,-
NODE_ENV,All Services,✅,Environment,development,development
JWT_SECRET,Auth Service,✅,Secret for token signing,your-secret-key-here,-
JWT_EXPIRY,Auth Service,❌,Token expiration time,24h,24h
BCRYPT_ROUNDS,Auth Service,❌,Password hashing rounds,10,10
DATABASE_URL,All Services,✅,PostgreSQL connection string,postgresql://user:pass@localhost:5432/db,-
STRIPE_SECRET_KEY,Payment Service,✅,Stripe API secret key,sk_test_..., -
STRIPE_WEBHOOK_SECRET,Payment Service,✅,Stripe webhook signing secret,whsec_..., -
PROMETHEUS_PORT,Monitoring,❌,Prometheus metrics port,9090,9090
GRAFANA_PORT,Monitoring,❌,Grafana dashboard port,3031,3031
EOF

# 5. Create ADR template files
echo "📝 Creando templates de ADR..."
mkdir -p docs/notion-exports/adr-templates

cat > docs/notion-exports/adr-templates/ADR-001-port-manager.md << 'EOF'
# ADR-001: Port Manager Implementation

**Status:** 🟢 Accepted
**Date:** 2025-10-20
**Deciders:** @team

## Context and Problem Statement
Need a centralized way to manage ports across dev/prod/test environments to avoid conflicts.

## Decision Drivers
- Prevent EADDRINUSE errors
- Easy port discovery
- Support multiple environments
- CLI-friendly

## Considered Options
1. Manual port assignment in .env files
2. Centralized Port Manager with JSON config
3. Docker port mapping only

## Decision Outcome
**Chosen option:** "Centralized Port Manager"

**Rationale:**
- Single source of truth for all ports
- Prevents conflicts automatically
- Easy to query via CLI
- Supports future scaling

## Pros and Cons

### Pros
✅ Centralized configuration
✅ Automatic conflict detection
✅ CLI tools for management
✅ Easy to extend

### Cons
❌ Additional dependency
❌ Requires team training

## Implementation
Created `config/ports.json` with environment-based port ranges:
- Development: 3000-3999
- Production: 4000-4999
- Testing: 5000-5999

## Validation
- [x] Implemented in codebase
- [x] CLI tools created
- [x] Documentation updated
- [x] Team trained
EOF

cat > docs/notion-exports/adr-templates/ADR-002-ui-link-strategy.md << 'EOF'
# ADR-002: UI Link Refactoring Strategy

**Status:** 🟢 Accepted
**Date:** 2025-10-24
**Deciders:** @team

## Context and Problem Statement
263 broken relative links found in subdirectory pages (admin/, auth/, shop/, etc.)

## Decision Drivers
- Maintainability
- No content duplication
- Single source of truth
- Easy navigation

## Considered Options
1. **Option A:** Refactor all to absolute paths (/pages/*)
2. **Option B:** Create duplicate pages in each subdirectory
3. **Option C:** Hybrid (absolute for common, duplicates for specialized)

## Decision Outcome
**Chosen option:** "Option A - Absolute paths"

**Rationale:**
- No duplication of content
- Easier to maintain
- Single source of truth
- Clean architecture

## Pros and Cons

### Pros
✅ No content duplication
✅ Easy maintenance
✅ Clear information architecture
✅ ~50-100 edits total

### Cons
❌ Requires editing ~50 HTML files
❌ Need script to automate

## Implementation Plan
1. Create refactoring script
2. Test on sample directory
3. Apply to all subdirectories
4. Re-run link validator
5. Verify zero errors

## Validation
- [ ] Script created
- [ ] Sample tested
- [ ] Full refactor complete
- [ ] Validation passed (0 errors)
EOF

# 6. Generate Quick Reference
echo "📖 Generando guía de referencia rápida..."
cat > docs/notion-exports/quick-reference.md << 'EOF'
# Flores Victoria - Quick Reference Guide

## 🚀 Common Commands

### Start Services
```bash
# All services
npm run dev

# Individual services
npm run auth:start:dev
npm run payment:start:dev
npm run gateway:start:dev
npm run notification:start:dev
```

### Check Status
```bash
# Port allocation
npm run ports:check:dev

# Service health
curl http://localhost:3000/api/status
curl http://localhost:3001/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### Troubleshooting
```bash
# Release ports
npm run ports:release:dev

# Kill specific port
lsof -ti:3000 | xargs kill -9

# View logs
tail -f logs/auth-dev.log
tail -f logs/payment-dev.log
tail -f logs/gateway-dev.log
```

### Development
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run link validation
npm run links:validate

# Lint code
npm run lint
```

## 📊 Port Reference

| Service | Dev | Prod | Test |
|---------|-----|------|------|
| API Gateway | 3000 | 4000 | 5000 |
| Auth | 3001 | 4001 | 5001 |
| Order | 3002 | 4002 | 5002 |
| Payment | 3003 | 4003 | 5003 |
| Notification | 3004 | 4004 | 5004 |
| Admin Panel | 3021 | 4021 | 5021 |

## 🔗 Important URLs

- GitHub: https://github.com/laloaggro/Flores-Victoria-
- API Gateway: http://localhost:3000
- Admin Panel: http://localhost:3021
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3031

## 🐛 Common Issues

**EADDRINUSE Error**
```bash
npm run ports:check:dev
npm run ports:release:dev
```

**Missing Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port Conflict**
```bash
lsof -ti:PORT | xargs kill -9
```
EOF

echo ""
echo "✅ Exports generados exitosamente en docs/notion-exports/"
echo ""
echo "📁 Archivos creados:"
echo "  - services-status.csv (importa a Notion Database)"
echo "  - broken-links.csv (importa a Notion Database)"
echo "  - tasks.csv (importa a Notion Database)"
echo "  - env-variables.csv (importa a Notion Database)"
echo "  - adr-templates/ (copia a páginas de Notion)"
echo "  - quick-reference.md (copia a página de Notion)"
echo ""
echo "🎯 Próximos pasos:"
echo "  1. Abre Notion y crea tu workspace"
echo "  2. Importa los CSV files como databases"
echo "  3. Copia el contenido de docs/notion-initial-content.md"
echo "  4. Crea páginas con los templates proporcionados"
echo ""
echo "📚 Documentación completa en:"
echo "  docs/notion-initial-content.md"
echo ""
