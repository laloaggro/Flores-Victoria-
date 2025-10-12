# Servicio de Reseñas - Documentación Técnica

## Descripción General

El servicio de reseñas es responsable de gestionar las reseñas y calificaciones de los productos por parte de los usuarios. Este servicio permite a los usuarios dejar reseñas sobre productos que han comprado, así como ver reseñas de otros usuarios. Se comunica con MongoDB para almacenar y recuperar información de reseñas.

## Tecnologías

- Node.js
- Express.js
- MongoDB
- Mongoose (ODM)
- JWT (para autenticación)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                Review Service (:3007)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Routes     │───▶│ Controllers  │───▶│    Model     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│           │                     │                  │       │
│           ▼                     ▼                  ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Validation  │    │   Security   │    │   Database   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   MongoDB (:27017)  │
                   └─────────────────────┘
```

## Estructura de Datos

### Reseña
```json
{
  "id": "string",
  "userId": "string",
  "productId": "string",
  "rating": "number",
  "comment": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Endpoints

### Obtener Reseñas por Producto
- **URL**: `GET /api/reviews/product/:productId`
- **Descripción**: Obtiene todas las reseñas de un producto específico
- **Parámetros de consulta**:
  - `page` (number, opcional): Número de página (por defecto: 1)
  - `limit` (number, opcional): Número de reseñas por página (por defecto: 10)
- **Parámetros**:
  - `productId` (string, requerido): ID del producto
- **Respuesta**:
  - `200 OK`: Lista de reseñas del producto
  - `400 Bad Request`: Parámetros inválidos
  - `404 Not Found`: Producto no encontrado

### Crear Reseña
- **URL**: `POST /api/reviews/product/:productId`
- **Descripción**: Crea una nueva reseña para un producto
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `productId` (string, requerido): ID del producto
  - `rating` (number, requerido): Calificación del producto (1-5)
  - `comment` (string, requerido): Comentario de la reseña
- **Respuesta**:
  - `201 Created`: Reseña creada exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Producto no encontrado

### Actualizar Reseña
- **URL**: `PUT /api/reviews/:id`
- **Descripción**: Actualiza una reseña existente
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `id` (string, requerido): ID de la reseña
  - `rating` (number, opcional): Nueva calificación del producto (1-5)
  - `comment` (string, opcional): Nuevo comentario de la reseña
- **Respuesta**:
  - `200 OK`: Reseña actualizada exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Usuario no autorizado
  - `404 Not Found`: Reseña no encontrada

### Eliminar Reseña
- **URL**: `DELETE /api/reviews/:id`
- **Descripción**: Elimina una reseña existente
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `id` (string, requerido): ID de la reseña
- **Respuesta**:
  - `200 OK`: Reseña eliminada exitosamente
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Usuario no autorizado
  - `404 Not Found`: Reseña no encontrada

## Calificaciones

### Sistema de Calificación
- Escala de 1 a 5 estrellas
- Se calcula el promedio de todas las calificaciones de un producto
- Se muestra el número total de reseñas

## Seguridad

### Autenticación
Los endpoints de creación, actualización y eliminación requieren un token JWT válido en el header de autorización.

### Autorización
- Los usuarios pueden crear reseñas para productos que han comprado
- Los usuarios solo pueden actualizar y eliminar sus propias reseñas
- Los administradores pueden actualizar y eliminar cualquier reseña

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 3007)
- `JWT_SECRET`: Secreto para verificar los tokens JWT
- `MONGO_URI`: URI de conexión a MongoDB

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/review-service .
docker run -p 3007:3007 --env-file .env floresvictoria/review-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/review-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/review-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/review-service.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/review-service.test.js).

### Cobertura
- Obtener reseñas por producto: 100%
- Crear reseña: 100%
- Actualizar reseña: 100%
- Eliminar reseña: 100%
- Calcular promedio de calificaciones: 100%
- Validación de datos: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js.

### Indices de Base de Datos
Se utilizan índices en las columnas de productId y userId para mejorar el rendimiento de las consultas.

## Problemas Conocidos

### Limitaciones
1. No implementa verificación de compras antes de permitir reseñas
2. No tiene sistema de moderación de contenido
3. No registra auditoría de acciones de reseñas

## Mejoras Futuras

1. Implementar verificación de compras antes de permitir reseñas
2. Añadir sistema de moderación de contenido
3. Registrar auditoría de acciones de reseñas
4. Implementar sistema de votación de reseñas (útil/no útil)
5. Añadir fotos a las reseñas