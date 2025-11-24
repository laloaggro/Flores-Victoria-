# 🚨 Disaster Recovery Playbook - Flores Victoria

**Última actualización:** 11 de noviembre de 2025  
**Versión:** 1.0.0  
**RTO (Recovery Time Objective):** 2 horas  
**RPO (Recovery Point Objective):** 1 hora  

---

## 📋 Índice

1. [Definiciones Clave](#definiciones-clave)
2. [Estrategia de Backup](#estrategia-de-backup)
3. [Procedimientos de Restore](#procedimientos-de-restore)
4. [Escenarios de Desastre](#escenarios-de-desastre)
5. [Checklist de Recuperación](#checklist-de-recuperación)
6. [Testing y Validación](#testing-y-validación)
7. [Contactos de Emergencia](#contactos-de-emergencia)

---

## 🎯 Definiciones Clave

### RTO (Recovery Time Objective)
**Tiempo máximo aceptable de inactividad:** 2 horas

- **Tier 1 - Crítico (30 min):** Autenticación, API Gateway
- **Tier 2 - Alta Prioridad (1 hora):** Productos, Órdenes, Carrito
- **Tier 3 - Normal (2 horas):** Reviews, Wishlist, Contact

### RPO (Recovery Point Objective)
**Pérdida máxima de datos aceptable:** 1 hora

- **Backups automáticos:** Cada 12 horas (02:00, 14:00)
- **Backups incrementales:** Cada 1 hora (durante horas laborales)
- **Retención:** 7 días completos, 4 semanas incrementales

---

## 💾 Estrategia de Backup

### Backups Automatizados

#### 1. PostgreSQL (Base de Datos Principal)
```bash
# Ubicación: /backups/postgres_YYYYMMDD_HHMMSS.sql
# Método: pg_dumpall
# Frecuencia: Cada 12 horas
# Retención: 7 días (168 horas)

# Manual:
docker exec postgres pg_dumpall -U postgres > /backups/postgres_$(date +%Y%m%d_%H%M%S).sql
```

**Contenido:**
- Todas las bases de datos (auth, products, orders, users, cart)
- Schemas completos
- Datos de usuarios y órdenes
- Configuraciones

#### 2. Redis (Caché y Sesiones)
```bash
# Ubicación: /backups/redis_YYYYMMDD_HHMMSS.rdb
# Método: SAVE + copia de dump.rdb
# Frecuencia: Cada 12 horas
# Retención: 3 días (72 horas)

# Manual:
docker exec redis redis-cli SAVE
docker cp redis:/data/dump.rdb /backups/redis_$(date +%Y%m%d_%H%M%S).rdb
```

**Contenido:**
- Sesiones de usuario
- Caché de productos
- Rate limiting counters
- Datos temporales

#### 3. Configuraciones y Secrets
```bash
# Ubicación: /backups/config/
# Archivos:
#   - .env
#   - docker-compose.yml
#   - nginx configs
#   - SSL certificates

# Manual:
tar -czf /backups/config_$(date +%Y%m%d_%H%M%S).tar.gz \
    .env \
    docker-compose*.yml \
    nginx/ \
    ssl/
```

### Script de Backup Automatizado

**Ubicación:** `scripts/backup-databases.sh`  
**Cron:** Configurado en `scripts/setup-cron-jobs.sh`

```bash
# Ejecutar backup manual
./scripts/backup-databases.sh

# Ver backups disponibles
ls -lh /backups/
```

---

## 🔄 Procedimientos de Restore

### Script de Restore Automatizado

**Ubicación:** `scripts/restore-databases.sh`

#### Uso Básico

```bash
# 1. Listar backups disponibles
./scripts/restore-databases.sh --list

# 2. Restaurar el backup más reciente
./scripts/restore-databases.sh --latest

# 3. Restaurar un backup específico
./scripts/restore-databases.sh 20251111_120000

# 4. Simular restauración (dry-run)
./scripts/restore-databases.sh 20251111_120000 --dry-run
```

#### Proceso Automático del Script

1. ✅ Verificar que existe el backup
2. ✅ Verificar que los servicios están corriendo
3. ✅ Pedir confirmación del usuario
4. ✅ Crear backup pre-restore (por seguridad)
5. ✅ Restaurar PostgreSQL
6. ✅ Restaurar Redis
7. ✅ Verificar integridad
8. ✅ Reiniciar servicios de aplicación

### Restore Manual (Si el script falla)

#### PostgreSQL

```bash
# 1. Detener servicios de aplicación
docker-compose stop api-gateway auth-service product-service order-service

# 2. Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# 3. Restaurar desde backup
cat /backups/postgres_20251111_120000.sql | docker exec -i postgres psql -U postgres

# 4. Verificar restauración
docker exec postgres psql -U postgres -c "\l"

# 5. Reiniciar servicios
docker-compose start
```

#### Redis

```bash
# 1. Detener Redis
docker stop redis

# 2. Copiar backup
docker cp /backups/redis_20251111_120000.rdb redis:/data/dump.rdb

# 3. Iniciar Redis
docker start redis

# 4. Verificar
docker exec redis redis-cli PING
# Respuesta esperada: PONG
```

---

## 🚨 Escenarios de Desastre

### Escenario 1: Pérdida Total de Datos en PostgreSQL

**Síntomas:**
- Error de conexión a base de datos
- "Database does not exist"
- Corrupción de datos

**Procedimiento:**

```bash
# Tiempo estimado: 30-45 minutos

# 1. Verificar estado
docker logs postgres | tail -50

# 2. Detener servicios
docker-compose stop api-gateway auth-service product-service order-service cart-service user-service

# 3. Restaurar backup más reciente
./scripts/restore-databases.sh --latest

# 4. Verificar integridad
docker exec postgres psql -U postgres -c "SELECT count(*) FROM pg_database;"

# 5. Reiniciar servicios
docker-compose up -d

# 6. Verificar health checks
curl http://localhost:3000/health
curl http://localhost:3001/health
```

**Rollback:** El script crea automáticamente un backup pre-restore.

---

### Escenario 2: Corrupción de Redis

**Síntomas:**
- Sesiones de usuario perdidas
- Rate limiting no funciona
- "Redis connection refused"

**Procedimiento:**

```bash
# Tiempo estimado: 10-15 minutos

# 1. Verificar estado
docker exec redis redis-cli PING

# 2. Si no responde, restaurar
./scripts/restore-databases.sh --latest

# 3. Alternativa: Limpiar Redis (perder caché)
docker exec redis redis-cli FLUSHALL

# 4. Verificar
docker exec redis redis-cli INFO | grep connected_clients
```

**Impacto:** Pérdida de sesiones activas, usuarios deberán re-autenticarse.

---

### Escenario 3: Servidor Completo Caído

**Síntomas:**
- Oracle Cloud Instance no responde
- SSH no conecta
- Timeout en todos los servicios

**Procedimiento:**

```bash
# Tiempo estimado: 1-2 horas

# 1. Crear nueva instancia en Oracle Cloud
#    - Usar imagen Ubuntu 22.04
#    - Configurar networking (puertos 22, 80, 443, 3000, 16686)

# 2. Conectar vía SSH
ssh -i ssh-key.pem ubuntu@NEW_IP

# 3. Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 4. Clonar repositorio
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-

# 5. Copiar backups desde almacenamiento externo
# (Asumiendo que tienes backups en Oracle Object Storage o similar)
scp usuario@backup-server:/backups/*.sql /backups/
scp usuario@backup-server:/backups/*.rdb /backups/

# 6. Configurar variables de entorno
cp .env.production.example .env
# Editar .env con valores correctos

# 7. Levantar servicios
docker-compose -f docker-compose.oracle-optimized.yml up -d

# 8. Esperar a que PostgreSQL y Redis estén listos
sleep 30

# 9. Restaurar datos
./scripts/restore-databases.sh --latest

# 10. Verificar todos los servicios
./scripts/health-check-all.sh
```

---

### Escenario 4: Eliminación Accidental de Datos

**Síntomas:**
- Productos, órdenes o usuarios desaparecieron
- "Record not found"
- Operación DELETE accidental

**Procedimiento:**

```bash
# Tiempo estimado: 20-30 minutos

# 1. DETENER INMEDIATAMENTE todos los servicios
docker-compose stop

# 2. Identificar el último backup válido
./scripts/restore-databases.sh --list

# 3. Restaurar a un punto anterior a la eliminación
./scripts/restore-databases.sh 20251111_100000

# 4. Verificar que los datos están restaurados
docker exec postgres psql -U postgres -d products -c "SELECT count(*) FROM products;"

# 5. Reiniciar servicios
docker-compose up -d
```

**Prevención:** 
- Implementar soft deletes
- Requerir confirmación para operaciones críticas
- Auditoría de operaciones DELETE

---

### Escenario 5: Ataque de Ransomware o Compromiso de Seguridad

**Síntomas:**
- Archivos encriptados
- Comportamiento anómalo
- Alertas de seguridad

**Procedimiento:**

```bash
# Tiempo estimado: 2-4 horas

# 1. AISLAR INMEDIATAMENTE el servidor
sudo iptables -A INPUT -j DROP
sudo iptables -A OUTPUT -j DROP

# 2. Notificar al equipo de seguridad
# [Ver sección de contactos de emergencia]

# 3. Preservar evidencia
tar -czf /tmp/forensics_$(date +%Y%m%d_%H%M%S).tar.gz \
    /var/log/ \
    /backups/ \
    docker-logs/

# 4. Crear nueva instancia limpia (ver Escenario 3)

# 5. Restaurar desde backup ANTERIOR al compromiso
# IMPORTANTE: No usar backups recientes que puedan estar comprometidos

# 6. Cambiar TODAS las credenciales
#    - Secrets de .env
#    - Passwords de usuarios
#    - API keys
#    - Certificados SSL

# 7. Aplicar patches de seguridad
sudo apt update && sudo apt upgrade -y

# 8. Configurar fail2ban
./scripts/setup-fail2ban.sh

# 9. Auditoría de seguridad completa
./scripts/validate-secrets.sh
```

---

## ✅ Checklist de Recuperación

### Pre-Recuperación

- [ ] Identificar la causa del desastre
- [ ] Determinar el punto de recuperación deseado (timestamp)
- [ ] Verificar que los backups existen y están completos
- [ ] Notificar al equipo y stakeholders
- [ ] Documentar el incidente (fecha, hora, síntomas)

### Durante la Recuperación

- [ ] Detener servicios afectados
- [ ] Crear backup pre-restore (por seguridad)
- [ ] Ejecutar script de restore
- [ ] Verificar logs de restore
- [ ] Validar integridad de datos
- [ ] Reiniciar servicios

### Post-Recuperación

- [ ] Verificar health checks de todos los servicios
- [ ] Probar funcionalidad crítica:
  - [ ] Login de usuarios
  - [ ] Navegación de productos
  - [ ] Creación de órdenes
  - [ ] API Gateway responde
- [ ] Verificar monitoreo (Grafana, Prometheus)
- [ ] Revisar logs por errores
- [ ] Notificar que el servicio está restaurado
- [ ] Documentar lecciones aprendidas

### Verificación de Servicios

```bash
# Script de verificación rápida
cat > /tmp/verify-services.sh << 'EOF'
#!/bin/bash
echo "Verificando servicios..."
curl -f http://localhost:3000/health && echo "✓ API Gateway OK" || echo "✗ API Gateway FAIL"
curl -f http://localhost:3001/health && echo "✓ Auth Service OK" || echo "✗ Auth Service FAIL"
curl -f http://localhost:3009/health && echo "✓ Product Service OK" || echo "✗ Product Service FAIL"
curl -f http://localhost:3004/health && echo "✓ Order Service OK" || echo "✗ Order Service FAIL"
docker exec postgres psql -U postgres -c "\l" > /dev/null && echo "✓ PostgreSQL OK" || echo "✗ PostgreSQL FAIL"
docker exec redis redis-cli PING | grep -q PONG && echo "✓ Redis OK" || echo "✗ Redis FAIL"
EOF
chmod +x /tmp/verify-services.sh
/tmp/verify-services.sh
```

---

## 🧪 Testing y Validación

### Test de Restore Mensual

**Frecuencia:** Primer domingo de cada mes a las 10:00 AM

**Procedimiento:**

```bash
# 1. Crear entorno de testing aislado
docker-compose -f docker-compose.test.yml up -d

# 2. Simular restore (dry-run)
./scripts/restore-databases.sh --latest --dry-run

# 3. Ejecutar restore real en ambiente de testing
./scripts/restore-databases.sh --latest

# 4. Ejecutar suite de tests
npm run test:integration

# 5. Verificar tiempo de recuperación
#    - Tiempo objetivo: < 30 minutos
#    - Documentar tiempo real

# 6. Documentar resultados
echo "Test de DR ejecutado el $(date)" >> /var/log/dr-tests.log
```

### Métricas de Recuperación

| Métrica | Objetivo | Último Test | Estado |
|---------|----------|-------------|--------|
| RTO (Tiempo de recuperación) | < 2 horas | TBD | 🟡 |
| RPO (Pérdida de datos) | < 1 hora | TBD | 🟡 |
| Integridad de datos | 100% | TBD | 🟡 |
| Disponibilidad post-restore | > 99% | TBD | 🟡 |

---

## 📞 Contactos de Emergencia

### Equipo Técnico

| Rol | Nombre | Contacto | Disponibilidad |
|-----|--------|----------|----------------|
| Lead DevOps | [NOMBRE] | [TELEFONO] / [EMAIL] | 24/7 |
| Backend Lead | [NOMBRE] | [TELEFONO] / [EMAIL] | Lun-Vie 9-18 |
| DBA | [NOMBRE] | [TELEFONO] / [EMAIL] | On-call |
| Security | [NOMBRE] | [TELEFONO] / [EMAIL] | 24/7 |

### Proveedores

| Servicio | Contacto | SLA |
|----------|----------|-----|
| Oracle Cloud | support.oracle.com | 4 horas |
| SSL Provider | [CONTACTO] | 24 horas |

### Escalamiento

1. **Nivel 1:** DevOps Engineer (respuesta en 15 min)
2. **Nivel 2:** Lead DevOps (respuesta en 30 min)
3. **Nivel 3:** CTO (respuesta en 1 hora)

---

## 📊 Documentación de Incidentes

### Template de Incident Report

```markdown
# Incident Report - [FECHA]

## Resumen
- **Fecha y Hora:** YYYY-MM-DD HH:MM
- **Duración:** X horas
- **Severidad:** Critical / High / Medium / Low
- **Servicios Afectados:** [lista]

## Línea de Tiempo
- HH:MM - Incidente detectado
- HH:MM - Equipo notificado
- HH:MM - Investigación iniciada
- HH:MM - Causa raíz identificada
- HH:MM - Restore iniciado
- HH:MM - Servicios restaurados
- HH:MM - Verificación completada
- HH:MM - Incidente cerrado

## Causa Raíz
[Descripción detallada]

## Impacto
- Usuarios afectados: X
- Transacciones perdidas: X
- Pérdida de datos: X horas/minutos
- Tiempo de inactividad: X horas/minutos

## Acciones Tomadas
1. [Acción 1]
2. [Acción 2]
3. [Acción 3]

## Lecciones Aprendidas
- [Lección 1]
- [Lección 2]

## Acciones Preventivas
- [ ] [Acción preventiva 1]
- [ ] [Acción preventiva 2]
```

---

## 🔐 Backup Off-Site

### Estrategia de Almacenamiento Externo

**Recomendación:** Implementar backups off-site para protección adicional

#### Opciones:

1. **Oracle Object Storage**
```bash
# Subir backups a Object Storage
oci os object put \
    --bucket-name flores-victoria-backups \
    --file /backups/postgres_latest.sql
```

2. **Rsync a servidor remoto**
```bash
# Sincronizar backups diariamente
rsync -avz --delete \
    /backups/ \
    backup-user@remote-server:/remote-backups/flores-victoria/
```

3. **AWS S3 / Google Cloud Storage**
```bash
# Ejemplo con AWS CLI
aws s3 sync /backups/ s3://flores-victoria-backups/
```

---

## 📝 Registro de Cambios

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0.0 | 2025-11-11 | Documento inicial de DR | DevOps Team |

---

## ✅ Próximos Pasos

- [ ] Ejecutar primer test de restore completo
- [ ] Configurar backups off-site
- [ ] Automatizar tests mensuales de DR
- [ ] Crear runbooks específicos por microservicio
- [ ] Implementar alerting para fallos de backup
- [ ] Documentar tiempos reales de RTO/RPO

---

**Documento vivo - Actualizar después de cada incidente o test de DR**
