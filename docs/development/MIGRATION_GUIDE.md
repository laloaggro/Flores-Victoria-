# Guía de Migración de Flores Victoria

## Índice

1. [Introducción](#introducción)
2. [Política de Versionado](#política-de-versionado)
3. [Migración de v1.0 a v1.1](#migración-de-v10-a-v11)
4. [Migración de v1.1 a v1.2](#migración-de-v11-a-v12)
5. [Migración de v1.2 a v2.0](#migración-de-v12-a-v20)
6. [Migración de v2.0 a v2.1](#migración-de-v20-a-v21)
7. [Procedimientos de Migración](#procedimientos-de-migración)
8. [Verificación Post-Migración](#verificación-post-migración)
9. [Reversión de Migración](#reversión-de-migración)
10. [Herramientas de Migración](#herramientas-de-migración)

## Introducción

Esta guía proporciona instrucciones detalladas para migrar entre diferentes versiones de la plataforma Flores Victoria. La migración puede incluir cambios en la base de datos, configuración del sistema, estructura de archivos o funcionalidades.

Es fundamental seguir estos procedimientos cuidadosamente para evitar la pérdida de datos o interrupciones en el servicio.

## Política de Versionado

Flores Victoria sigue el versionado semántico (SemVer) con el formato: `MAJOR.MINOR.PATCH`

### Versiones MAJOR
- Cambios que rompen la compatibilidad hacia atrás
- Requieren migración manual significativa
- Ejemplo: v1.x.x → v2.x.x

### Versiones MINOR
- Nuevas funcionalidades compatibles hacia atrás
- Pueden requerir actualizaciones de base de datos
- Ejemplo: v1.1.x → v1.2.x

### Versiones PATCH
- Correcciones de errores y mejoras menores
- Generalmente no requieren migración
- Ejemplo: v1.1.1 → v1.1.2

## Migración de v1.0 a v1.1

### Cambios Principales
1. Actualización del esquema de base de datos de usuarios
2. Nueva funcionalidad de lista de deseos
3. Mejoras en el sistema de autenticación

### Procedimiento de Migración

#### Paso 1: Preparación
```bash
# Detener todos los servicios
docker-compose down

# Crear backup de bases de datos
./scripts/backup-databases.sh
```

#### Paso 2: Actualizar Código
```bash
# Obtener la última versión
git fetch origin
git checkout v1.1.0

# Actualizar dependencias
cd microservices/auth-service
npm install

cd ../user-service
npm install

cd ../wishlist-service
npm install
```

#### Paso 3: Migrar Base de Datos
```bash
# Aplicar migraciones de base de datos
cd backend
node migrate-users-to-v1.1.js
```

#### Paso 4: Configuración
```bash
# Actualizar variables de entorno
# Agregar a .env:
WISHLIST_SERVICE_URL=http://wishlist-service:3006
REDIS_HOST=redis
REDIS_PORT=6379
```

#### Paso 5: Iniciar Servicios
```bash
# Reconstruir y reiniciar servicios
docker-compose up -d --build
```

### Verificación
1. Verificar que todos los servicios estén corriendo
2. Probar registro e inicio de sesión
3. Verificar funcionalidad de lista de deseos

## Migración de v1.1 a v1.2

### Cambios Principales
1. Implementación de sistema de reseñas
2. Mejoras en el carrito de compras
3. Nueva API de métricas

### Procedimiento de Migración

#### Paso 1: Preparación
```bash
# Detener servicios
docker-compose down

# Backup de bases de datos
./scripts/backup-databases.sh

# Verificar espacio en disco
df -h
```

#### Paso 2: Actualizar Código
```bash
# Obtener nueva versión
git fetch origin
git checkout v1.2.0

# Actualizar dependencias
cd microservices/review-service
npm install

cd ../cart-service
npm install
```

#### Paso 3: Migrar Base de Datos
```bash
# Aplicar migraciones
cd backend
node add-reviews-collection.js
node update-cart-schema.js
```

#### Paso 4: Configuración
```bash
# Agregar nuevas variables de entorno
# En .env:
REVIEW_SERVICE_URL=http://review-service:3007
CART_SERVICE_PORT=3005
```

#### Paso 5: Desplegar Nuevos Servicios
```bash
# Iniciar servicios actualizados
docker-compose up -d review-service cart-service
```

### Verificación
1. Verificar nuevos endpoints de API
2. Probar funcionalidad de reseñas
3. Verificar persistencia del carrito

## Migración de v1.2 a v2.0

### Cambios Principales
1. Refactorización completa de la arquitectura
2. Migración de MongoDB a PostgreSQL para productos
3. Implementación de mensajería RabbitMQ
4. Nuevo sistema de notificaciones

### Advertencias Importantes
- Esta es una migración MAJOR que rompe la compatibilidad
- Requiere tiempo de inactividad significativo
- Requiere migración de datos entre bases de datos

### Procedimiento de Migración

#### Paso 1: Planificación
1. Programar mantenimiento de 4-6 horas
2. Notificar a usuarios con anticipación
3. Preparar equipo de soporte

#### Paso 2: Backup Completo
```bash
# Backup de todas las bases de datos
./scripts/full-backup.sh

# Exportar datos de MongoDB
docker-compose exec mongodb mongodump --db flores_victoria --out /backup/mongo-v1.2

# Exportar datos de PostgreSQL
docker-compose exec postgres pg_dump -U flores_user flores_db > backup/postgres-v1.2.sql
```

#### Paso 3: Preparar Nuevo Entorno
```bash
# Obtener nueva versión
git fetch origin
git checkout v2.0.0

# Configurar nuevo docker-compose
cp docker-compose.v2.yml docker-compose.yml

# Actualizar todas las dependencias
./scripts/update-all-dependencies.sh
```

#### Paso 4: Migrar Datos
```bash
# Ejecutar script de migración de datos
cd migration
node migrate-products-mongo-to-postgres.js
node migrate-orders-to-new-schema.js
```

#### Paso 5: Desplegar Nueva Arquitectura
```bash
# Detener servicios antiguos
docker-compose -f docker-compose.v1.yml down

# Iniciar nueva arquitectura
docker-compose up -d
```

#### Paso 6: Verificar Nueva Arquitectura
```bash
# Verificar estado de servicios
docker-compose ps

# Verificar conectividad entre servicios
./scripts/test-service-connectivity.sh
```

### Verificación
1. Verificar todos los microservicios
2. Probar flujos de negocio completos
3. Verificar sistema de mensajería
4. Validar notificaciones

## Migración de v2.0 a v2.1

### Cambios Principales
1. Implementación de panel de administración
2. Mejoras en el sistema de métricas
3. Optimización de consultas de base de datos
4. Nuevas funcionalidades de administración

### Procedimiento de Migración

#### Paso 1: Preparación
```bash
# Detener servicios
docker-compose down

# Backup de bases de datos
./scripts/backup-databases.sh
```

#### Paso 2: Actualizar Código
```bash
# Obtener nueva versión
git fetch origin
git checkout v2.1.0

# Actualizar dependencias
cd admin-panel
npm install

cd ../microservices/api-gateway
npm install
```

#### Paso 3: Migrar Base de Datos
```bash
# Aplicar nuevas migraciones
cd backend
node add-admin-users.js
node update-product-categories.js
```

#### Paso 4: Configuración
```bash
# Agregar variables de entorno para admin panel
# En .env:
ADMIN_PANEL_PORT=3010
ADMIN_JWT_SECRET=secreto_admin_seguro
```

#### Paso 5: Desplegar Nuevos Componentes
```bash
# Iniciar con nuevos componentes
docker-compose up -d --build
```

### Verificación
1. Verificar acceso al panel de administración
2. Probar nuevas funcionalidades de administración
3. Verificar métricas mejoradas

## Procedimientos de Migración

### Antes de la Migración

#### 1. Evaluación del Impacto
- Identificar servicios afectados
- Estimar tiempo de inactividad
- Determinar recursos necesarios
- Planificar contingencias

#### 2. Backup Completo
```bash
# Script de backup automatizado
#!/bin/bash
echo "Iniciando backup completo..."

# Backup de MongoDB
docker-compose exec mongodb mongodump --db flores_victoria

# Backup de PostgreSQL
docker-compose exec postgres pg_dump flores_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup de configuraciones
cp .env .env.backup_$(date +%Y%m%d_%H%M%S)
cp docker-compose.yml docker-compose.backup_$(date +%Y%m%d_%H%M%S)

echo "Backup completado"
```

#### 3. Prueba en Entorno de Staging
- Replicar entorno de producción
- Ejecutar migración completa
- Verificar funcionalidades críticas
- Documentar problemas encontrados

### Durante la Migración

#### 1. Comunicación con Usuarios
```bash
# Enviar notificación de mantenimiento
node scripts/send-maintenance-notification.js
```

#### 2. Monitoreo Continuo
- Verificar estado de servicios
- Monitorear uso de recursos
- Registrar errores y advertencias
- Comunicar progreso al equipo

#### 3. Puntos de Verificación
- Completar cada paso antes de continuar
- Verificar resultados parciales
- Documentar cualquier problema
- Tener plan de reversión listo

### Después de la Migración

#### 1. Verificación Funcional
- Probar todos los endpoints de API
- Verificar flujos de usuario
- Validar datos migrados
- Confirmar rendimiento

#### 2. Monitoreo Post-Migración
- Observar métricas del sistema
- Verificar logs de errores
- Monitorear experiencia de usuario
- Preparar informe de migración

## Verificación Post-Migración

### Checklist de Verificación

#### Servicios
- [ ] API Gateway responde correctamente
- [ ] Auth Service permite registro/inicio de sesión
- [ ] Product Service devuelve productos
- [ ] User Service maneja perfiles
- [ ] Order Service procesa pedidos
- [ ] Cart Service gestiona carritos
- [ ] Wishlist Service maneja listas de deseos
- [ ] Review Service permite reseñas
- [ ] Contact Service envía mensajes
- [ ] Admin Panel es accesible

#### Bases de Datos
- [ ] MongoDB accesible y con datos correctos
- [ ] PostgreSQL accesible y con datos correctos
- [ ] Redis responde correctamente
- [ ] RabbitMQ procesa mensajes

#### Funcionalidades Críticas
- [ ] Registro de nuevos usuarios
- [ ] Inicio de sesión de usuarios existentes
- [ ] Visualización de productos
- [ ] Agregar productos al carrito
- [ ] Realizar pedido completo
- [ ] Ver historial de pedidos
- [ ] Sistema de reseñas funciona
- [ ] Notificaciones se envían

#### Métricas y Monitoreo
- [ ] Prometheus recoge métricas
- [ ] Grafana muestra dashboards
- [ ] Jaeger rastrea solicitudes
- [ ] Logs se generan correctamente

### Pruebas Automatizadas
```bash
# Ejecutar suite de pruebas post-migración
npm run test:post-migration

# Verificar conectividad entre servicios
npm run test:connectivity

# Validar datos migrados
npm run test:data-integrity
```

## Reversión de Migración

### Cuándo Revertir
- Errores críticos que afectan usuarios
- Pérdida de datos no recuperable
- Problemas de rendimiento severos
- Incumplimiento de SLA

### Procedimiento de Reversión

#### 1. Detener Nueva Versión
```bash
# Detener servicios nuevos
docker-compose down

# Registrar estado actual
docker-compose ps > rollback_state.txt
```

#### 2. Restaurar Backup
```bash
# Restaurar bases de datos desde backup
./scripts/restore-databases.sh backup_20231201_143022

# Restaurar configuraciones
cp .env.backup_20231201_143022 .env
cp docker-compose.backup_20231201_143022 docker-compose.yml
```

#### 3. Volver a Versión Anterior
```bash
# Volver al código anterior
git checkout v1.2.0

# Reconstruir servicios
docker-compose up -d --build
```

#### 4. Verificar Reversión
```bash
# Verificar que todo funcione como antes
./scripts/test-pre-migration-state.sh
```

### Plan de Contingencia
1. Mantener backups accesibles durante 48 horas post-migración
2. Equipo de soporte disponible durante 24 horas post-migración
3. Documentar todos los problemas encontrados
4. Preparar comunicado para usuarios si es necesario

## Herramientas de Migración

### Scripts de Migración Personalizados
```javascript
// migrate-products-mongo-to-postgres.js
const mongoose = require('mongoose');
const { Client } = require('pg');

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/flores_victoria');

// Conexión a PostgreSQL
const pgClient = new Client({
  user: 'flores_user',
  host: 'localhost',
  database: 'flores_db',
  password: 'flores_password',
  port: 5432,
});

async function migrateProducts() {
  try {
    await pgClient.connect();
    
    // Obtener productos de MongoDB
    const products = await mongoose.connection.collection('products').find({}).toArray();
    
    // Migrar a PostgreSQL
    for (const product of products) {
      const query = `
        INSERT INTO products(id, name, description, price, category, stock, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      
      const values = [
        product._id,
        product.name,
        product.description,
        product.price,
        product.category,
        product.stock,
        product.createdAt,
        product.updatedAt
      ];
      
      await pgClient.query(query, values);
    }
    
    console.log(`Migrados ${products.length} productos`);
  } catch (error) {
    console.error('Error en migración:', error);
  } finally {
    await pgClient.end();
    await mongoose.connection.close();
  }
}

migrateProducts();
```

### Herramientas de Monitoreo de Migración
```bash
# monitor-migration.sh
#!/bin/bash

echo "Monitoreando migración en tiempo real..."

# Monitorear logs de servicios
docker-compose logs -f &

# Monitorear uso de recursos
watch -n 5 'docker stats --no-stream'

# Verificar conectividad
while true; do
  curl -f http://localhost:3000/health || echo "API Gateway no responde"
  curl -f http://localhost:3001/health || echo "Auth Service no responde"
  sleep 30
done
```

### Validadores de Datos
```javascript
// validate-data-integrity.js
const mongoose = require('mongoose');
const { Client } = require('pg');

async function validateMigration() {
  // Contar productos en ambas bases de datos
  const mongoCount = await mongoose.connection.collection('products').countDocuments();
  
  const pgResult = await pgClient.query('SELECT COUNT(*) FROM products');
  const pgCount = parseInt(pgResult.rows[0].count);
  
  if (mongoCount === pgCount) {
    console.log(`✓ Validación exitosa: ${mongoCount} productos en ambas bases`);
  } else {
    console.error(`✗ Error de validación: MongoDB=${mongoCount}, PostgreSQL=${pgCount}`);
  }
}
```

Esta guía de migración proporciona un marco completo para actualizar la plataforma Flores Victoria entre versiones, minimizando riesgos y asegurando una transición fluida.