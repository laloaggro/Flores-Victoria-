# Flores Victoria - Notion Initial Content

Este archivo contiene el contenido inicial para migrar a Notion.

---

## 🏠 HOME Dashboard

### Quick Links

- [Documentation](link-to-docs)
- [Current Sprint](link-to-sprint)
- [Bug Tracker](link-to-bugs)
- [Services Status](link-to-services)

### System Status Overview

**Services Status (Last check: 2025-10-24)**

| Service              | Status           | Dev Port    | URL                   |
| -------------------- | ---------------- | ----------- | --------------------- |
| API Gateway          | 🟢 Running       | 3000        | http://localhost:3000 |
| Auth Service         | 🟢 Running       | 3001        | http://localhost:3001 |
| Payment Service      | 🟢 Running       | 3003        | http://localhost:3003 |
| Order Service        | 🟡 Not Started   | 3002        | -                     |
| Notification Service | 🟢 Running       | 3004        | http://localhost:3004 |
| Admin Panel          | 🟡 Port Conflict | 3020 → 3021 | http://localhost:3021 |

### Current Priorities

1. 🔴 Fix 263 broken UI links (refactor to absolute paths)
2. 🟠 Resolve Admin Panel port conflict (3020 → 3021)
3. 🟡 Complete Payment Service integration
4. 🟢 Implement real Service Worker for PWA

### Recent Updates

- ✅ 2025-10-24: Created 110 placeholder pages and assets
- ✅ 2025-10-24: Fixed admin '/control-center' JS references
- ✅ 2025-10-24: Added comprehensive CSS (theme.css, catalog.css)
- ✅ 2025-10-24: Implemented automated UI link validator

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway (3000)                      │
│  • Rate Limiting                                             │
│  • Authentication Middleware                                 │
│  • Prometheus Metrics                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │   Auth   │  │ Payment  │  │  Order   │
         │ (3001)   │  │ (3003)   │  │ (3002)   │
         └──────────┘  └──────────┘  └──────────┘
                ▼             ▼             ▼
         ┌──────────────────────────────────────┐
         │         PostgreSQL Database          │
         └──────────────────────────────────────┘
```

### Port Allocation Strategy

**Development (3xxx):**

- 3000: API Gateway
- 3001: Auth Service
- 3002: Order Service
- 3003: Payment Service
- 3004: Notification Service
- 3021: Admin Panel

**Production (4xxx):**

- 4000: API Gateway
- 4001: Auth Service
- 4002: Order Service
- 4003: Payment Service
- 4004: Notification Service
- 4021: Admin Panel

**Testing (5xxx):**

- 5000-5099: Reserved for test instances

### Tech Stack

**Backend:**

- Node.js 18+
- Express.js 4.18+
- PostgreSQL 15+
- JWT Authentication
- Bcrypt for password hashing

**Frontend:**

- Vanilla HTML/CSS/JS
- Progressive Web App (PWA) ready
- Service Worker for offline support

**Infrastructure:**

- Docker & Docker Compose
- Prometheus + Grafana for monitoring
- GitHub Actions for CI/CD

**Development Tools:**

- Port Manager (custom tool)
- Automated link validator
- Jest for testing

---

## 🔧 Services Catalog

### Auth Service

**Status:** 🟢 Running **Owner:** TBD **Last Updated:** 2025-10-24

**Configuration:**

- Dev Port: 3001
- Prod Port: 4001
- Health Check: `GET /health`

**Key Endpoints:**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

**Environment Variables:**

- `JWT_SECRET` - Secret for token signing (required)
- `JWT_EXPIRY` - Token expiration (default: 24h)
- `BCRYPT_ROUNDS` - Hashing rounds (default: 10)

**How to Run:**

```bash
# Development
npm run auth:start:dev

# Production
npm run auth:start:prod
```

**Logs:**

- Dev: `logs/auth-dev.log`
- Prod: `logs/auth-prod.log`

---

### Payment Service

**Status:** 🟢 Running **Owner:** TBD **Last Updated:** 2025-10-24

**Configuration:**

- Dev Port: 3003
- Prod Port: 4003
- Health Check: `GET /health`

**Key Endpoints:**

- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:id` - Get payment status

**Environment Variables:**

- `STRIPE_SECRET_KEY` - Stripe API secret (required)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (required)

**How to Run:**

```bash
# Development
npm run payment:start:dev

# Production
npm run payment:start:prod
```

**Logs:**

- Dev: `logs/payment-dev.log`
- Prod: `logs/payment-prod.log`

---

### API Gateway

**Status:** 🟢 Running **Owner:** TBD **Last Updated:** 2025-10-24

**Configuration:**

- Dev Port: 3000
- Prod Port: 4000
- Health Check: `GET /api/status`

**Features:**

- HTTP Proxy to microservices
- Rate limiting (100 req/15min per IP)
- JWT authentication middleware
- Prometheus metrics at `/metrics`

**How to Run:**

```bash
# Development
npm run gateway:start:dev

# Production
npm run gateway:start:prod
```

---

## 🎨 Frontend Structure

### Admin Panel

**Location:** `admin-panel/public/` **Entry Point:** `index.html` **Server Port:** 3021 (dev), 4021
(prod)

**Key Pages:**

- Dashboard: `/`
- Products: `/products.html`
- Orders: `/orders.html`
- Users: `/users.html`
- Analytics: `/analytics.html`
- Settings: `/settings.html`

### Public Frontend

**Location:** `frontend/` **Entry Point:** `index.html`

**Key Pages:**

- Home: `/index.html`
- Products: `/pages/products.html`
- About: `/pages/about.html`
- Contact: `/pages/contact.html`
- Login: `/pages/login.html`
- Register: `/pages/register.html`

### UI Validation Status

**Last Check:** 2025-10-24, 15:40:42 **Total Files Scanned:** 123 **Broken References:** 263

**Breakdown:**

- Relative links in subdirectories: 263
- Missing assets (images): 0 ✅
- Missing CSS files: 0 ✅
- Missing JS modules: 0 ✅

**Resolution Strategy:** Option A selected: Refactor all relative links to absolute paths

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ✅
- npm 9+ ✅
- Docker & Docker Compose ✅
- Git ✅

### Initial Setup

1. **Clone the repository:**

```bash
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-
```

2. **Install dependencies:**

```bash
npm install
```

3. **Setup environment variables:**

```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Initialize Port Manager:**

```bash
npm run ports:init
```

5. **Start development services:**

```bash
# Option 1: Start all services
npm run dev

# Option 2: Start individual services
npm run auth:start:dev
npm run payment:start:dev
npm run gateway:start:dev
npm run notification:start:dev
```

6. **Verify services:**

```bash
# Check port allocation
npm run ports:check:dev

# Test API Gateway
curl http://localhost:3000/api/status

# Test Auth Service
curl http://localhost:3001/health
```

### Development Workflow

1. **Check service status:**

```bash
npm run ports:check:dev
```

2. **View logs:**

```bash
# Follow all logs
tail -f logs/*.log

# Follow specific service
tail -f logs/auth-dev.log
```

3. **Run link validation:**

```bash
npm run links:validate
```

4. **Run tests:**

```bash
npm test
```

### Common Issues

**Issue: EADDRINUSE (Port already in use)**

```bash
# Check which ports are in use
npm run ports:check:dev

# Release all dev ports
npm run ports:release:dev

# Or manually kill process
lsof -ti:3000 | xargs kill -9
```

**Issue: Missing dependencies**

```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue: Docker containers not starting**

```bash
# Restart Docker services
docker-compose down
docker-compose up -d
```

---

## 📊 Monitoring & Metrics

### Prometheus Metrics

**Access:** http://localhost:9090 (when running)

**Key Metrics:**

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration
- `nodejs_heap_size_used_bytes` - Memory usage
- `process_cpu_seconds_total` - CPU usage

### Grafana Dashboards

**Access:** http://localhost:3031 (when running) **Default credentials:** admin/admin

**Available Dashboards:**

- System Overview
- Service Health
- Request Rates
- Error Rates

### Health Checks

All services expose a `/health` endpoint:

```bash
# API Gateway
curl http://localhost:3000/api/status

# Auth Service
curl http://localhost:3001/health

# Payment Service
curl http://localhost:3003/health

# Notification Service
curl http://localhost:3004/health
```

---

## 🐛 Current Known Issues

### Critical

None ✅

### High Priority

1. **263 Broken UI Links**
   - **Issue:** Relative links in subdirectories don't resolve
   - **Impact:** Navigation broken in some pages
   - **Status:** 🔵 In Progress
   - **ETA:** 2025-10-25
   - **Owner:** TBD

2. **Admin Panel Port Conflict**
   - **Issue:** Port 3020 already in use
   - **Impact:** Admin panel fails to start
   - **Status:** 🟡 Investigating
   - **Workaround:** Use port 3021 temporarily
   - **Owner:** TBD

### Medium Priority

1. **Payment Service Integration**
   - **Issue:** Stripe sandbox keys needed
   - **Status:** ⚪ Blocked
   - **Owner:** TBD

2. **Service Worker Implementation**
   - **Issue:** Only placeholder exists, need real PWA functionality
   - **Status:** 🔵 Backlog
   - **Owner:** TBD

---

## 📋 Current Sprint

### Sprint Goals

1. Fix all 263 broken UI links
2. Resolve admin panel port conflict
3. Complete Payment Service integration
4. Update documentation

### In Progress

- [ ] Refactor relative links to absolute paths (263 files)
- [ ] Update Port Manager config for admin panel
- [ ] Request Stripe API keys

### Completed This Sprint

- ✅ Created 110 placeholder pages
- ✅ Implemented automated link validator
- ✅ Added comprehensive CSS files
- ✅ Fixed admin '/control-center' references
- ✅ Added missing frontend assets

---

## 🎯 Roadmap

### Q4 2025

- ✅ Port Manager implementation
- ✅ Basic microservices architecture
- 🔵 Complete UI validation and fixes
- 🔵 Payment Service integration
- ⚪ Order Service implementation
- ⚪ Admin panel feature completion

### Q1 2026

- ⚪ Production deployment
- ⚪ Performance optimization
- ⚪ SEO optimization
- ⚪ Mobile app (React Native)

### Q2 2026

- ⚪ Analytics dashboard
- ⚪ Customer portal
- ⚪ Inventory management
- ⚪ Email marketing integration

---

## 📚 Additional Resources

### Documentation

- [Architecture Decision Records](link)
- [API Documentation](link)
- [Database Schema](link)
- [Deployment Guide](link)

### External Links

- [GitHub Repository](https://github.com/laloaggro/Flores-Victoria-)
- [Prometheus Docs](https://prometheus.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Best Practices](https://jwt.io/)

---

**Last Updated:** 2025-10-24 **Maintained By:** @team
