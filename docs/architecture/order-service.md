# Servicio de Órdenes - Documentación Técnica

## Descripción General

El servicio de órdenes es responsable de gestionar las órdenes de los usuarios, incluyendo creación, procesamiento, seguimiento y estado de las órdenes. Este servicio se comunica con PostgreSQL para almacenar y recuperar información de órdenes.

## Tecnologías

- Node.js
- Express.js
- PostgreSQL
- JWT (para autenticación)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                 Order Service (:3004)                       │
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
                   │  PostgreSQL (:5432) │
                   └─────────────────────┘
```

## Estructura de Datos

### Orden
```json
{
  "id": "string",
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "name": "string",
      "price": "number",
      "quantity": "number"
    }
  ],
  "total": "number",
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "paymentMethod": "string",
  "status": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Endpoints

### Crear Orden
- **URL**: `POST /api/orders`
- **Descripción**: Crea una nueva orden a partir del carrito del usuario
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `shippingAddress` (object, requerido): Dirección de envío
  - `paymentMethod` (string, requerido): Método de pago
- **Respuesta**:
  - `201 Created`: Orden creada exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido

### Obtener Órdenes del Usuario
- **URL**: `GET /api/orders`
- **Descripción**: Obtiene todas las órdenes del usuario autenticado
- **Headers**:
  - `Authorization: Bearer <token>`
- **Respuesta**:
  - `200 OK`: Lista de órdenes
  - `401 Unauthorized`: Token inválido

### Obtener Orden por ID
- **URL**: `GET /api/orders/:id`
- **Descripción**: Obtiene información detallada de una orden específica
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `id` (string, requerido): ID de la orden
- **Respuesta**:
  - `200 OK`: Información de la orden
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Usuario no autorizado
  - `404 Not Found`: Orden no encontrada

### Actualizar Estado de Orden
- **URL**: `PUT /api/orders/:id/status`
- **Descripción**: Actualiza el estado de una orden (requiere rol de administrador)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `id` (string, requerido): ID de la orden
  - `status` (string, requerido): Nuevo estado de la orden
- **Respuesta**:
  - `200 OK`: Estado actualizado exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Permisos insuficientes
  - `404 Not Found`: Orden no encontrada

## Estados de Orden

1. **pending**: Orden creada pero no procesada
2. **processing**: Orden en proceso de preparación
3. **shipped**: Orden enviada
4. **delivered**: Orden entregada
5. **cancelled**: Orden cancelada

## Seguridad

### Autenticación
Todos los endpoints requieren un token JWT válido en el header de autorización.

### Autorización
- Los usuarios pueden ver y crear sus propias órdenes
- Solo los administradores pueden actualizar el estado de las órdenes

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 3004)
- `JWT_SECRET`: Secreto para verificar los tokens JWT
- `DB_HOST`: Host de la base de datos PostgreSQL
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_PORT`: Puerto de la base de datos (por defecto: 5432)

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/order-service .
docker run -p 3004:3004 --env-file .env floresvictoria/order-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/order-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/order-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/order-service.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/order-service.test.js).

### Cobertura
- Crear orden: 100%
- Obtener órdenes: 100%
- Obtener orden por ID: 100%
- Actualizar estado: 100%
- Validación de datos: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js.

### Indices de Base de Datos
Se utilizan índices en las columnas de userId y status para mejorar el rendimiento de las consultas.

## Problemas Conocidos

### Limitaciones
1. No implementa procesamiento de pagos real
2. No tiene sistema de notificaciones
3. No registra auditoría de acciones de órdenes

## Mejoras Futuras

1. Implementar procesamiento de pagos real
2. Añadir sistema de notificaciones
3. Registrar auditoría de acciones de órdenes
4. Implementar sistema de reembolsos
5. Añadir seguimiento de envío integrado