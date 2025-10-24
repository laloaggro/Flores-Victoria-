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

| Service      | Dev  | Prod | Test |
| ------------ | ---- | ---- | ---- |
| API Gateway  | 3000 | 4000 | 5000 |
| Auth         | 3001 | 4001 | 5001 |
| Order        | 3002 | 4002 | 5002 |
| Payment      | 3003 | 4003 | 5003 |
| Notification | 3004 | 4004 | 5004 |
| Admin Panel  | 3021 | 4021 | 5021 |

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
