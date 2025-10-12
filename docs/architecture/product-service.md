# Servicio de Productos - Documentación Técnica

## Descripción General

El servicio de productos es responsable de gestionar el catálogo de productos de la florería, incluyendo información detallada de arreglos florales, precios, categorías y disponibilidad. Este servicio se comunica con MongoDB para almacenar y recuperar información de productos.

## Tecnologías

- Node.js
- Express.js
- MongoDB
- Mongoose (ODM)
- Redis (para caché)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                 Product Service (:3002)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Routes     │───▶│ Controllers  │───▶│    Model     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│           │                     │                  │       │
│           ▼                     ▼                  ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Cache      │    │  Validation  │    │   Database   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────────┐          ┌─────────────────────┐
│    Redis (:6379)    │          │   MongoDB (:27017)  │
└─────────────────────┘          └─────────────────────┘
```

## Endpoints

### Obtener Todos los Productos
- **URL**: `GET /api/products`
- **Descripción**: Obtiene una lista de todos los productos disponibles
- **Parámetros de consulta**:
  - `category` (string, opcional): Filtrar por categoría
  - `limit` (number, opcional): Número máximo de productos (por defecto: 10)
  - `page` (number, opcional): Número de página (por defecto: 1)
- **Respuesta**:
  - `200 OK`: Lista de productos
  - `400 Bad Request`: Parámetros inválidos

### Obtener Producto por ID
- **URL**: `GET /api/products/:id`
- **Descripción**: Obtiene información detallada de un producto específico
- **Parámetros**:
  - `id` (string, requerido): ID del producto
- **Respuesta**:
  - `200 OK`: Información del producto
  - `404 Not Found`: Producto no encontrado

### Crear Producto
- **URL**: `POST /api/products`
- **Descripción**: Crea un nuevo producto en el catálogo
- **Headers**:
  - `Authorization: Bearer <token>` (requiere rol de administrador)
- **Parámetros**:
  - `name` (string, requerido): Nombre del producto
  - `description` (string, requerido): Descripción del producto
  - `price` (number, requerido): Precio del producto
  - `category` (string, requerido): Categoría del producto
  - `imageUrl` (string, opcional): URL de la imagen del producto
- **Respuesta**:
  - `201 Created`: Producto creado exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Permisos insuficientes

### Actualizar Producto
- **URL**: `PUT /api/products/:id`
- **Descripción**: Actualiza un producto existente
- **Headers**:
  - `Authorization: Bearer <token>` (requiere rol de administrador)
- **Parámetros**:
  - `id` (string, requerido): ID del producto
  - `name` (string, opcional): Nombre del producto
  - `description` (string, opcional): Descripción del producto
  - `price` (number, opcional): Precio del producto
  - `category` (string, opcional): Categoría del producto
  - `imageUrl` (string, opcional): URL de la imagen del producto
- **Respuesta**:
  - `200 OK`: Producto actualizado exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Permisos insuficientes
  - `404 Not Found`: Producto no encontrado

### Eliminar Producto
- **URL**: `DELETE /api/products/:id`
- **Descripción**: Elimina un producto del catálogo
- **Headers**:
  - `Authorization: Bearer <token>` (requiere rol de administrador)
- **Parámetros**:
  - `id` (string, requerido): ID del producto
- **Respuesta**:
  - `204 No Content`: Producto eliminado exitosamente
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Permisos insuficientes
  - `404 Not Found`: Producto no encontrado

## Caché

### Redis
El servicio utiliza Redis para cachear las respuestas de productos con el fin de mejorar el rendimiento. Las claves de caché se invalidan cuando se actualizan productos.

### Estrategia de Caché
- TTL (Time To Live): 1 hora para listas de productos
- TTL: 24 horas para productos individuales
- Invalidación automática al actualizar/eliminar productos

## Seguridad

### Autenticación
Los endpoints de creación, actualización y eliminación requieren autenticación JWT.

### Autorización
Los endpoints de creación, actualización y eliminación requieren rol de administrador.

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 3002)
- `MONGO_URI`: URI de conexión a MongoDB
- `REDIS_HOST`: Host de Redis
- `REDIS_PORT`: Puerto de Redis (por defecto: 6379)
- `REDIS_PASSWORD`: Contraseña de Redis (opcional)

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/product-service .
docker run -p 3002:3002 --env-file .env floresvictoria/product-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/product-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/product-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/product-service.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/product-service.test.js).

### Cobertura
- Obtener productos: 100%
- Obtener producto por ID: 100%
- Crear producto: 100%
- Actualizar producto: 100%
- Eliminar producto: 100%
- Middleware de caché: 100%
- Validación de datos: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Caché
El uso de Redis para cachear productos mejora significativamente el tiempo de respuesta.

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js.

## Problemas Conocidos

### Limitaciones
1. No implementa búsqueda avanzada de productos
2. No tiene sistema de reseñas integrado
3. No registra auditoría de acciones de productos

## Mejoras Futuras

1. Implementar búsqueda avanzada (full-text search)
2. Integrar sistema de reseñas de productos
3. Registrar auditoría de acciones de productos
4. Implementar sistema de inventario
5. Añadir imágenes múltiples por producto