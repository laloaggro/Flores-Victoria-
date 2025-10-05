# Guía de Administración Técnica - Arreglos Victoria

## Información Importante para Administradores

Esta guía contiene toda la información técnica necesaria para administrar el proyecto Arreglos Victoria. Contiene detalles sobre la arquitectura, comandos importantes, ubicaciones de archivos y procedimientos de mantenimiento.

## 1. Estructura del Proyecto

```
arreglos-victoria/
├── documentation/          # Documentación completa del proyecto
├── frontend/               # Aplicación cliente
├── microservices/          # Microservicios
│   ├── api-gateway/        # Gateway de API
│   ├── auth-service/       # Servicio de autenticación
│   ├── user-service/       # Servicio de usuarios
│   ├── product-service/    # Servicio de productos
│   ├── cart-service/       # Servicio de carrito
│   ├── order-service/      # Servicio de órdenes
│   ├── review-service/     # Servicio de reseñas
│   ├── contact-service/    # Servicio de contacto
│   ├── wishlist-service/   # Servicio de lista de deseos
│   └── shared/             # Componentes compartidos
├── scripts/                # Scripts de utilidad
├── docker-compose.yml      # Configuración de despliegue
└── README.md               # Documento principal del proyecto
```

## 2. Requisitos del Sistema

### Entornos de Desarrollo
- Node.js >= 16.x
- Docker >= 20.x
- Docker Compose >= 1.29.x
- Git

### Entornos de Producción
- Ubuntu 20.04 LTS o superior
- 8GB RAM mínimo
- 20GB espacio en disco
- Acceso a Internet

## 3. Comandos de Despliegue

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Detener todos los servicios
```bash
docker-compose down
```

### Ver estado de los servicios
```bash
docker-compose ps
```

### Ver logs de un servicio específico
```bash
docker-compose logs <nombre-del-servicio>
```

### Reiniciar un servicio específico
```bash
docker-compose restart <nombre-del-servicio>
```

## 4. Puertos Importantes

| Servicio | Puerto Interno | Puerto Externo |
|----------|----------------|----------------|
| API Gateway | 8000 | 3000 |
| Auth Service | 3001 | 3001 |
| User Service | 3002 | 3002 |
| Product Service | 3003 | 3003 |
| Cart Service | 3004 | 3004 |
| Order Service | 3005 | 3005 |
| Review Service | 3006 | 3006 |
| Contact Service | 3007 | 3007 |
| Wishlist Service | 3008 | 3008 |
| MongoDB | 27017 | 27018 |
| PostgreSQL | 5432 | 5433 |
| Redis | 6379 | 6380 |
| RabbitMQ (AMQP) | 5672 | 5672 |
| RabbitMQ (Admin) | 15672 | 15672 |
| Prometheus | 9090 | 9090 |
| Grafana | 3000 | 4000 |

## 5. Variables de Entorno

### API Gateway (.env)
```
PORT=8000
JWT_SECRET=clave_secreta_para_jwt
```

### Auth Service (.env)
```
PORT=3001
JWT_SECRET=clave_secreta_para_jwt
MONGODB_URI=mongodb://mongo:27017/auth-service
```

### User Service (.env)
```
PORT=3002
MONGODB_URI=mongodb://mongo:27017/user-service
```

### Product Service (.env)
```
PORT=3003
MONGODB_URI=mongodb://mongo:27017/product-service
```

### Cart Service (.env)
```
PORT=3004
POSTGRES_HOST=postgres
POSTGRES_USER=usuario
POSTGRES_PASSWORD=contraseña
POSTGRES_DB=cart-service
```

### Order Service (.env)
```
PORT=3005
MONGODB_URI=mongodb://mongo:27017/order-service
RABBITMQ_URL=amqp://rabbitmq
```

## 6. Bases de Datos

### MongoDB
- **URI de conexión**: `mongodb://localhost:27018/`
- **Colecciones importantes**:
  - `users` (User Service)
  - `products` (Product Service)
  - `orders` (Order Service)
  - `reviews` (Review Service)

### PostgreSQL
- **Puerto**: 5433
- **Base de datos**: `flores_db`
- **Tablas importantes**:
  - `cart_items` (Cart Service)
  - `wishlist_items` (Wishlist Service)

### Redis
- **Puerto**: 6380
- **Uso**: Caché de datos frecuentes

## 7. Scripts de Utilidad

### Directorio: `/scripts`

1. **init-db.js** - Inicializa las bases de datos
2. **generate-sample-data.js** - Genera datos de muestra
3. **add-20-more-products.js** - Agrega 20 productos adicionales
4. **add-missing-category-products.js** - Agrega productos de categorías faltantes
5. **add-more-categories.js** - Agrega más categorías
6. **add-more-products.js** - Agrega más productos
7. **add-new-products.js** - Agrega nuevos productos
8. **add-temp-images-to-products.js** - Agrega imágenes temporales a productos
9. **add-test-products.js** - Agrega productos de prueba
10. **migrate-products-to-mongodb.js** - Migra productos a MongoDB

## 8. Comandos de Mantenimiento

### Ver logs en tiempo real
```bash
docker-compose logs -f
```

### Reconstruir servicios
```bash
docker-compose build
```

### Limpiar sistema Docker
```bash
docker system prune -a
```

### Copia de seguridad de bases de datos
```bash
# MongoDB
docker exec mongodb mongodump --out /dump

# PostgreSQL
docker exec postgres pg_dump -U usuario nombre_db > backup.sql
```

## 9. Monitoreo

### Prometheus
- **URL**: http://localhost:9090
- **Métricas**: Disponibles en cada microservicio

### Grafana
- **URL**: http://localhost:4000
- **Usuario**: admin
- **Contraseña**: admin

## 10. Solución de Problemas

### Problemas comunes

1. **Servicio no responde**
   - Verificar estado: `docker-compose ps`
   - Verificar logs: `docker-compose logs <servicio>`

2. **Problemas de conexión a base de datos**
   - Verificar que los servicios de base de datos estén corriendo
   - Verificar variables de entorno

3. **Errores de dependencias**
   - Reconstruir servicios: `docker-compose build --no-cache`

### Reinicio completo del sistema
```bash
docker-compose down
docker-compose up -d
```

## 11. Actualización del Sistema

### Pasos para actualizar
1. Detener servicios: `docker-compose down`
2. Obtener cambios: `git pull`
3. Reconstruir servicios: `docker-compose build`
4. Iniciar servicios: `docker-compose up -d`

## 12. Seguridad

### Mejores prácticas
- Cambiar todas las contraseñas por defecto
- Usar HTTPS en producción
- Actualizar dependencias regularmente
- Monitorear logs por actividad sospechosa

### Claves de seguridad importantes
- JWT_SECRET (debe ser única y segura)
- Contraseñas de bases de datos
- Claves de API externas

## 13. Escalabilidad

### Escalar servicios horizontalmente
```bash
docker-compose up -d --scale product-service=3
```

### Monitoreo de recursos
- Usar Grafana para monitorear uso de CPU y memoria
- Configurar alertas en Prometheus

## 14. Contacto de Soporte

Para problemas técnicos, contactar al equipo de desarrollo.