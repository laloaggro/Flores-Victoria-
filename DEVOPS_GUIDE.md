# 🚀 DEVOPS GUIDE - Flores Victoria

**Last Updated**: December 20, 2025  
**Status**: ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Deployment Strategies](#deployment-strategies)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Docker & Containers](#docker--containers)
5. [Kubernetes (Optional)](#kubernetes-optional)
6. [Monitoring & Alerting](#monitoring--alerting)

---

## Overview

Flores Victoria uses Docker for containerization and GitHub Actions for CI/CD.

### Tech Stack

- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Railway (primary), Docker (self-hosted)
- **Orchestration**: Docker Compose (dev), Kubernetes (optional prod)
- **Registry**: Docker Hub / GitHub Container Registry

---

## Deployment Strategies

### Development Environment

```bash
# Start all services
docker-compose -f docker-compose.dev-simple.yml up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down
```

### Staging Environment

```bash
# Start staging stack
docker-compose -f docker-compose.staging.yml up -d

# Run migrations
docker-compose exec api-gateway npm run migrate

# Run tests
docker-compose exec auth-service npm test
```

### Production Deployment

```bash
# Start production stack
docker-compose up -d

# Zero-downtime deployment
docker-compose up -d --no-deps --build [service-name]

# Rollback
docker-compose up -d --no-deps [service-name]:previous-tag
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.x'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: user/app:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Railway
        run: railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Docker & Containers

### Dockerfile Best Practices

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

### Docker Compose Structure

```yaml
version: '3.8'

services:
  api-gateway:
    build:
      context: ./microservices/api-gateway
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

---

## Kubernetes (Optional)

### Basic Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: flores-victoria/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
```

---

## Monitoring & Alerting

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'flores-victoria'
    static_configs:
      - targets:
        - 'api-gateway:3000'
        - 'auth-service:3001'
        - 'product-service:3009'
```

### Grafana Dashboard Setup

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
http://localhost:3000
# Username: admin
# Password: admin
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Docker images built and tested
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] CI/CD pipeline configured
- [ ] Monitoring setup
- [ ] Alerting configured
- [ ] Backup strategy defined
- [ ] Rollback plan documented
- [ ] Documentation updated

---

## Best Practices

1. **Use Multi-stage Builds**: Reduce image size
2. **Implement Health Checks**: Enable auto-recovery
3. **Use Secrets Management**: Never commit secrets
4. **Automate Everything**: CI/CD for all changes
5. **Monitor Continuously**: Track key metrics
6. **Test Before Deploying**: Run full test suite
7. **Document Processes**: Keep runbooks updated

---

## Quick Commands

```bash
# Build all services
docker-compose build

# Restart a service
docker-compose restart [service-name]

# View service logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec [service-name] sh

# Clean up
docker-compose down -v --remove-orphans
```

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Railway Docs](https://docs.railway.app/)
- [Kubernetes Docs](https://kubernetes.io/docs/)

