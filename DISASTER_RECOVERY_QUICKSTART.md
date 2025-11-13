# 🎯 Guía Rápida de Disaster Recovery

## ⚡ Comandos Esenciales

### Ver Backups Disponibles
```bash
./scripts/restore-databases.sh --list
```

### Restaurar Backup Más Reciente
```bash
./scripts/restore-databases.sh --latest
```

### Restaurar Backup Específico
```bash
./scripts/restore-databases.sh 20251111_120000
```

### Simular Restore (Dry-Run)
```bash
./scripts/restore-databases.sh 20251111_120000 --dry-run
```

### Crear Backup Manual
```bash
./scripts/backup-databases.sh
```

### Probar Proceso Completo de DR
```bash
./scripts/test-disaster-recovery.sh
```

---

## 🚨 Escenarios Rápidos

### PostgreSQL Caído
```bash
docker-compose stop api-gateway auth-service product-service order-service
./scripts/restore-databases.sh --latest
docker-compose up -d
```

### Redis Caído
```bash
docker stop redis
docker cp /backups/redis_latest.rdb redis:/data/dump.rdb
docker start redis
```

### Datos Eliminados Accidentalmente
```bash
docker-compose stop
./scripts/restore-databases.sh --latest
docker-compose up -d
```

---

## 📋 Verificación Post-Restore

```bash
# Verificar PostgreSQL
docker exec postgres psql -U postgres -c "\l"

# Verificar Redis
docker exec redis redis-cli PING

# Verificar servicios
curl http://localhost:3000/health
curl http://localhost:3001/health
```

---

## 📊 Documentación Completa

- **Playbook Completo:** [DISASTER_RECOVERY_PLAYBOOK.md](DISASTER_RECOVERY_PLAYBOOK.md)
- **Scripts:**
  - `scripts/backup-databases.sh` - Crear backups
  - `scripts/restore-databases.sh` - Restaurar backups
  - `scripts/test-disaster-recovery.sh` - Probar DR completo

---

## ⏱️ RTO/RPO

- **RTO (Recovery Time):** < 2 horas
- **RPO (Data Loss):** < 1 hora
- **Backups:** Cada 12 horas (02:00, 14:00)
- **Retención:** 7 días

---

## 🆘 Contactos de Emergencia

Ver sección de contactos en [DISASTER_RECOVERY_PLAYBOOK.md](DISASTER_RECOVERY_PLAYBOOK.md#-contactos-de-emergencia)
