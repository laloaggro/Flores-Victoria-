# Servicio de Carrito - Documentación Técnica

## Descripción General

El servicio de carrito es responsable de gestionar los carritos de compras de los usuarios, incluyendo agregar productos, actualizar cantidades, eliminar productos y calcular totales. Este servicio utiliza Redis para almacenar los carritos en memoria, proporcionando un acceso rápido y eficiente.

## Tecnologías

- Node.js
- Express.js
- Redis (almacenamiento en memoria)
- JWT (para autenticación)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                  Cart Service (:3005)                       │
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
                   │    Redis (:6379)    │
                   └─────────────────────┘
```

## Estructura de Datos

### Carrito
```json
{
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "name": "string",
      "price": "number",
      "quantity": "number",
      "imageUrl": "string"
    }
  ],
  "total": "number",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Endpoints

### Obtener Carrito
- **URL**: `GET /api/cart`
- **Descripción**: Obtiene el carrito del usuario autenticado
- **Headers**:
  - `Authorization: Bearer <token>`
- **Respuesta**:
  - `200 OK`: Información del carrito
  - `401 Unauthorized`: Token inválido

### Agregar Producto al Carrito
- **URL**: `POST /api/cart/items`
- **Descripción**: Agrega un producto al carrito del usuario
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `productId` (string, requerido): ID del producto
  - `quantity` (number, requerido): Cantidad del producto
- **Respuesta**:
  - `200 OK`: Producto agregado exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Producto no encontrado

### Actualizar Cantidad de Producto
- **URL**: `PUT /api/cart/items/:productId`
- **Descripción**: Actualiza la cantidad de un producto en el carrito
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `productId` (string, requerido): ID del producto
  - `quantity` (number, requerido): Nueva cantidad del producto
- **Respuesta**:
  - `200 OK`: Cantidad actualizada exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Producto no encontrado en el carrito

### Eliminar Producto del Carrito
- **URL**: `DELETE /api/cart/items/:productId`
- **Descripción**: Elimina un producto del carrito
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `productId` (string, requerido): ID del producto
- **Respuesta**:
  - `200 OK`: Producto eliminado exitosamente
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Producto no encontrado en el carrito

### Vaciar Carrito
- **URL**: `DELETE /api/cart`
- **Descripción**: Elimina todos los productos del carrito
- **Headers**:
  - `Authorization: Bearer <token>`
- **Respuesta**:
  - `200 OK`: Carrito vaciado exitosamente
  - `401 Unauthorized`: Token inválido

## Seguridad

### Autenticación
Todos los endpoints requieren un token JWT válido en el header de autorización.

### Autorización
Los usuarios solo pueden acceder y modificar su propio carrito.

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 3005)
- `JWT_SECRET`: Secreto para verificar los tokens JWT
- `REDIS_HOST`: Host de Redis
- `REDIS_PORT`: Puerto de Redis (por defecto: 6379)
- `REDIS_PASSWORD`: Contraseña de Redis (opcional)

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/cart-service .
docker run -p 3005:3005 --env-file .env floresvictoria/cart-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/cart-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/cart-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/cart-service.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/cart-service.test.js).

### Cobertura
- Obtener carrito: 100%
- Agregar producto: 100%
- Actualizar cantidad: 100%
- Eliminar producto: 100%
- Vaciar carrito: 100%
- Validación de datos: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Caché
El servicio utiliza Redis para almacenar los carritos en memoria, proporcionando tiempos de respuesta muy rápidos.

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js y la alta velocidad de Redis.

### Persistencia
Los carritos se almacenan en Redis con una expiración de 30 días para evitar el crecimiento indefinido de datos.

## Problemas Conocidos

### Limitaciones
1. Los carritos se pierden si el servidor Redis se reinicia
2. No hay sincronización entre dispositivos del mismo usuario
3. No registra auditoría de acciones de carrito

## Mejoras Futuras

1. Implementar persistencia en base de datos secundaria
2. Añadir sincronización entre dispositivos
3. Registrar auditoría de acciones de carrito
4. Implementar cupones de descuento
5. Añadir recomendaciones basadas en el carrito