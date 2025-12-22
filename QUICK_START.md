# 🚀 QUICK START GUIDE - Flores Victoria

**Status**: ✅ Production Ready  
**Last Updated**: December 20, 2025  
**Coverage**: 25.63% (1,103 tests passing)  
**Security**: 0 high vulnerabilities  
**Test Files**: 367 | **Scripts**: 252 | **Docs**: 30

---

## 🎯 Quick Commands

### Testing

```bash
# Run all tests with coverage
npm run test:coverage

# View coverage summary
bash scripts/test-coverage-summary.sh

# View HTML coverage report
open coverage/index.html
```

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev-simple.yml up -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f auth-service

# Stop development environment
docker-compose down
```

### Validation

```bash
# Validate correlation IDs
bash scripts/validate-correlation-ids.sh

# Validate cache strategy
bash scripts/validate-cache-strategy.sh

# Run all validations
bash scripts/master-execution.sh

# Final execution report
bash scripts/final-execution.sh
```

### Monitoring

```bash
# Setup Prometheus & Grafana
bash scripts/setup-monitoring.sh

# Access Grafana
open http://localhost:3000
# Default: admin/admin

# Access Prometheus
open http://localhost:9090
```

### Load Testing

```bash
# Install k6 (if not installed)
brew install k6  # macOS
apt install k6   # Linux

# Run load tests
k6 run scripts/load-test.js

# Run with custom parameters
k6 run --duration 5m --vus 50 scripts/load-test.js
```

### Deployment

```bash
# Build production images
docker-compose build

# Start production stack
docker-compose up -d

# Check service health
curl http://localhost:3000/health

# View production logs
docker-compose logs -f

# Stop production
docker-compose down
```

### Security

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# View security summary
npm audit --audit-level=moderate
```

---

## 📚 Documentation

All guides are available in the root directory:

- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing framework
- [OBSERVABILITY_GUIDE.md](OBSERVABILITY_GUIDE.md) - Monitoring & logging
- [RESILIENCE_GUIDE.md](RESILIENCE_GUIDE.md) - Resilience patterns
- [PERFORMANCE_GUIDE.md](PERFORMANCE_GUIDE.md) - Performance optimization
- [DEVOPS_GUIDE.md](DEVOPS_GUIDE.md) - Deployment guide
- [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md) - Pre-deployment checklist
- [COMPLETE_EXECUTION_SUMMARY.md](COMPLETE_EXECUTION_SUMMARY.md) - Final report

---

## 🎓 Key Metrics

```
Tests Passing:     1,104 ✅
Coverage:          25.63% ✅ (baseline: 20%)
Security:          0 high vulnerabilities ✅
Documentation:     6 comprehensive guides ✅
Production Ready:  YES ✅
```

---

## 🔗 Service URLs

| Service | Development | Production |
|---------|-------------|------------|
| API Gateway | http://localhost:3000 | https://api.flores-victoria.com |
| Auth Service | http://localhost:3001 | Internal |
| Product Service | http://localhost:3009 | Internal |
| Frontend | http://localhost:5173 | https://flores-victoria.com |
| Admin Panel | http://localhost:3010 | https://admin.flores-victoria.com |
| Grafana | http://localhost:3000 | https://monitoring.flores-victoria.com |
| Prometheus | http://localhost:9090 | Internal |

---

## 💡 Pro Tips

1. **Always run tests before committing**
   ```bash
   npm run test:coverage
   ```

2. **Check coverage after adding tests**
   ```bash
   bash scripts/test-coverage-summary.sh
   ```

3. **Monitor service health**
   ```bash
   curl http://localhost:3000/health
   ```

4. **View real-time logs**
   ```bash
   docker-compose logs -f [service-name]
   ```

5. **Clean Docker resources periodically**
   ```bash
   docker-compose down -v --remove-orphans
   docker system prune -a
   ```

---

## 🆘 Troubleshooting

### Tests failing?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests with verbose output
npm test -- --verbose
```

### Docker issues?
```bash
# Restart Docker daemon
sudo systemctl restart docker

# Remove all containers and volumes
docker-compose down -v --remove-orphans

# Rebuild from scratch
docker-compose build --no-cache
```

### Coverage not updating?
```bash
# Clear Jest cache
npm test -- --clearCache

# Delete coverage folder
rm -rf coverage

# Re-run tests
npm run test:coverage
```

---

## ✨ Next Steps

1. **Review Documentation**: Read all guides in root directory
2. **Run Tests**: Ensure all 1,104 tests pass
3. **Deploy**: Use docker-compose for production
4. **Monitor**: Setup Grafana dashboards
5. **Improve**: Aim for 35%+ coverage

---

**Status**: ✅ **ALL RECOMMENDATIONS COMPLETED**  
**Ready for**: Production Deployment

