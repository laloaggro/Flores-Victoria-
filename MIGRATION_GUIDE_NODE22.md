# Guía de Migración a Node.js 22 y Actualización de Bases de Datos

**Fecha**: 11 de noviembre de 2025  
**Versión**: 4.0.0  
**Estado**: ✅ Completado

## Resumen de Cambios

Esta migración estandariza las versiones de runtime y bases de datos en todo el proyecto para garantizar consistencia entre entornos de desarrollo, CI/CD y producción.

### Cambios Principales

#### 1. Node.js: 16/18 → 22
- **Antes**: Mezcla de Node 16, 18 y 20 en diferentes Dockerfiles y workflows
- **Ahora**: Node.js 22 LTS en todo el stack
- **Impacto**: Mayor rendimiento, nuevas características de ES2024, mejor soporte de TypeScript

#### 2. PostgreSQL: 13 → 16
- **Antes**: PostgreSQL 13 en producción
- **Ahora**: PostgreSQL 16-alpine en todos los entornos
- **Impacto**: Mejoras de performance, nuevas características SQL

#### 3. MongoDB: 4.4 → 7.0
- **Antes**: MongoDB 4.4 en producción
- **Ahora**: MongoDB 7.0 en todos los entornos
- **Impacto**: Mejoras de performance, nuevas características de agregación

## Breaking Changes

### Node.js 22

#### 1. Módulos y APIs deprecados
```javascript
// ❌ DEPRECADO
const { promisify } = require('util');

// ✅ USAR
import { promisify } from 'node:util';
```

#### 2. Fetch API nativa
```javascript
// ✅ Ahora disponible sin librerías externas
const response = await fetch('https://api.example.com/data');
```

#### 3. Test Runner nativo
```javascript
// ✅ Disponible sin Jest (opcional)
import { test, describe } from 'node:test';
```

### PostgreSQL 16

#### 1. Sintaxis SQL mejorada
```sql
-- ✅ Nueva sintaxis JSON más eficiente
SELECT jsonb_path_query(data, '$.users[*].name') FROM orders;
```

#### 2. Configuración de autenticación
- Método `md5` deprecado → usar `scram-sha-256`

### MongoDB 7.0

#### 1. Cambios en operadores de agregación
```javascript
// ✅ Nuevos operadores disponibles
db.collection.aggregate([
  { $setWindowFields: { /* ... */ } }
]);
```

## Archivos Modificados

### Dockerfiles (11 archivos)
- ✅ `microservices/api-gateway/Dockerfile`
- ✅ `microservices/auth-service/Dockerfile`
- ✅ `microservices/product-service/Dockerfile`
- ✅ `microservices/user-service/Dockerfile`
- ✅ `microservices/order-service/Dockerfile`
- ✅ `microservices/cart-service/Dockerfile`
- ✅ `microservices/wishlist-service/Dockerfile`
- ✅ `microservices/review-service/Dockerfile`
- ✅ `microservices/contact-service/Dockerfile`
- ✅ `frontend/Dockerfile`
- ✅ `admin-panel/Dockerfile`

### Docker Compose (2 archivos)
- ✅ `docker-compose.yml` → Postgres 16-alpine, Mongo 7.0
- ✅ `docker-compose.prod.yml` → Postgres 16-alpine, Mongo 7.0

### GitHub Workflows (4 archivos)
- ✅ `.github/workflows/ci.yml` → Node 22
- ✅ `.github/workflows/deploy.yml` → Node 22
- ✅ `.github/workflows/security.yml` → Node 22
- ✅ `.github/workflows/e2e-playwright.yml` → Node 22

## Instrucciones de Migración

### Para Desarrolladores Locales

#### 1. Actualizar Node.js local
```bash
# Usando nvm
nvm install 22
nvm use 22
nvm alias default 22

# Verificar versión
node --version  # Debe mostrar v22.x.x
```

#### 2. Limpiar y reinstalar dependencias
```bash
# Limpiar cachés
rm -rf node_modules package-lock.json
rm -rf */node_modules */package-lock.json

# Reinstalar
npm install
cd microservices/api-gateway && npm install && cd ../..
# Repetir para cada microservicio
```

#### 3. Recrear contenedores Docker
```bash
# Detener y eliminar contenedores existentes
docker-compose down -v

# Rebuild con nuevas versiones
docker-compose build --no-cache

# Iniciar
docker-compose up -d
```

#### 4. Migrar datos si es necesario
```bash
# Backup de datos existentes (si tienes datos importantes)
docker exec flores-victoria-postgres pg_dumpall -U flores_user > backup_postgres.sql
docker exec flores-victoria-mongodb mongodump --out /backup

# Después del recreate, restaurar si es necesario
```

### Para CI/CD

✅ **No se requiere acción** - Los workflows ya están actualizados.

### Para Producción

#### 1. Planificar ventana de mantenimiento
- Duración estimada: 15-30 minutos
- Downtime requerido: Sí (para actualizar DBs)

#### 2. Backup completo
```bash
# PostgreSQL
pg_dump -h <host> -U flores_user -d flores_db > backup_pre_migration.sql

# MongoDB
mongodump --uri="mongodb://user:pass@host:27017/flores_victoria" --out=/backup
```

#### 3. Ejecutar migración
```bash
# Pull nuevas imágenes
docker-compose -f docker-compose.prod.yml pull

# Recrear servicios (con downtime)
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Verificar health
curl http://localhost:3000/health
```

#### 4. Rollback (si es necesario)
```bash
# Revertir a imágenes anteriores
git checkout <commit-anterior>
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Restaurar datos
psql -U flores_user -d flores_db < backup_pre_migration.sql
mongorestore --uri="mongodb://..." /backup
```

## Verificación Post-Migración

### 1. Verificar versiones
```bash
# Node.js
docker exec flores-victoria-api-gateway node --version

# PostgreSQL
docker exec flores-victoria-postgres psql -U flores_user -c "SELECT version();"

# MongoDB
docker exec flores-victoria-mongodb mongosh --eval "db.version()"
```

### 2. Ejecutar tests
```bash
npm test
npm run test:integration
npm run test:e2e
```

### 3. Verificar métricas
- CPU/Memoria: Monitorear durante 24h
- Latencia de respuesta: Debe ser igual o mejor
- Error rate: Debe permanecer <0.1%

## Nuevas Características Disponibles

### Node.js 22

1. **Fetch API nativa** - Sin necesidad de `node-fetch`
2. **Test Runner** - Alternativa a Jest para tests simples
3. **Watch mode** - `node --watch` para desarrollo
4. **Import assertions** - Mejor soporte JSON/WASM

### PostgreSQL 16

1. **MERGE statement** - Upserts más eficientes
2. **Logical replication** - Mejor sincronización
3. **JSON path queries** - Queries más expresivas
4. **Parallel queries** - Mejor performance en agregaciones

### MongoDB 7.0

1. **Queryable Encryption** - Encriptación a nivel de campo
2. **Time Series** - Optimizaciones para datos temporales
3. **Window Functions** - Análisis avanzado
4. **Clustered Collections** - Mejor organización de datos

## Problemas Conocidos y Soluciones

### 1. Error: "Cannot find module"
```bash
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### 2. Error: "connection refused" en tests
```bash
# Solución: Asegurar que los servicios están levantados
docker-compose up -d mongodb postgres redis
sleep 10  # Esperar a que estén listos
npm test
```

### 3. Bcrypt incompatibilidad
```bash
# Solución: Rebuild bcrypt para Node 22
npm rebuild bcrypt
```

## Soporte

- **Documentación oficial Node.js 22**: https://nodejs.org/docs/latest-v22.x/api/
- **PostgreSQL 16 Release Notes**: https://www.postgresql.org/docs/16/release-16.html
- **MongoDB 7.0 Release Notes**: https://www.mongodb.com/docs/manual/release-notes/7.0/

## Checklist de Migración

- [ ] Node.js 22 instalado localmente
- [ ] Dependencias reinstaladas
- [ ] Contenedores Docker reconstruidos
- [ ] Tests pasando localmente
- [ ] Backup de producción realizado
- [ ] Migración de producción ejecutada
- [ ] Verificación post-migración completada
- [ ] Monitoreo activo por 24h

---

**Última actualización**: 11 de noviembre de 2025  
**Responsable**: Eduardo Garay (@laloaggro)
