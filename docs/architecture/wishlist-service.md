# Servicio de Lista de Deseos - Documentación Técnica

## Descripción General

El servicio de lista de deseos es responsable de gestionar las listas de deseos de los usuarios, permitiéndoles guardar productos que les interesan para futuras compras. Este servicio utiliza Redis para almacenar las listas de deseos en memoria, proporcionando un acceso rápido y eficiente.

## Tecnologías

- Node.js
- Express.js
- Redis (almacenamiento en memoria)
- JWT (para autenticación)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│               Wishlist Service (:3006)                      │
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

### Lista de Deseos
```json
{
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "name": "string",
      "price": "number",
      "imageUrl": "string",
      "addedAt": "date"
    }
  ],
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Endpoints

### Obtener Lista de Deseos
- **URL**: `GET /api/wishlist`
- **Descripción**: Obtiene la lista de deseos del usuario autenticado
- **Headers**:
  - `Authorization: Bearer <token>`
- **Respuesta**:
  - `200 OK`: Información de la lista de deseos
  - `401 Unauthorized`: Token inválido

### Agregar Producto a la Lista de Deseos
- **URL**: `POST /api/wishlist/items`
- **Descripción**: Agrega un producto a la lista de deseos del usuario
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `productId` (string, requerido): ID del producto
- **Respuesta**:
  - `200 OK`: Producto agregado exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Producto no encontrado

### Eliminar Producto de la Lista de Deseos
- **URL**: `DELETE /api/wishlist/items/:productId`
- **Descripción**: Elimina un producto de la lista de deseos
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `productId` (string, requerido): ID del producto
- **Respuesta**:
  - `200 OK`: Producto eliminado exitosamente
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Producto no encontrado en la lista de deseos

### Vaciar Lista de Deseos
- **URL**: `DELETE /api/wishlist`
- **Descripción**: Elimina todos los productos de la lista de deseos
- **Headers**:
  - `Authorization: Bearer <token>`
- **Respuesta**:
  - `200 OK`: Lista de deseos vaciada exitosamente
  - `401 Unauthorized`: Token inválido

## Seguridad

### Autenticación
Todos los endpoints requieren un token JWT válido en el header de autorización.

### Autorización
Los usuarios solo pueden acceder y modificar su propia lista de deseos.

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 3006)
- `JWT_SECRET`: Secreto para verificar los tokens JWT
- `REDIS_HOST`: Host de Redis
- `REDIS_PORT`: Puerto de Redis (por defecto: 6379)
- `REDIS_PASSWORD`: Contraseña de Redis (opcional)

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/wishlist-service .
docker run -p 3006:3006 --env-file .env floresvictoria/wishlist-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/wishlist-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/wishlist-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/wishlist-service.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/wishlist-service.test.js).

### Cobertura
- Obtener lista de deseos: 100%
- Agregar producto: 100%
- Eliminar producto: 100%
- Vaciar lista de deseos: 100%
- Validación de datos: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Caché
El servicio utiliza Redis para almacenar las listas de deseos en memoria, proporcionando tiempos de respuesta muy rápidos.

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js y la alta velocidad de Redis.

### Persistencia
Las listas de deseos se almacenan en Redis con una expiración de 90 días para evitar el crecimiento indefinido de datos.

## Problemas Conocidos

### Limitaciones
1. Las listas de deseos se pierden si el servidor Redis se reinicia
2. No hay sincronización entre dispositivos del mismo usuario
3. No registra auditoría de acciones de lista de deseos

## Mejoras Futuras

1. Implementar persistencia en base de datos secundaria
2. Añadir sincronización entre dispositivos
3. Registrar auditoría de acciones de lista de deseos
4. Implementar notificaciones cuando los productos en la lista de deseos están en oferta
5. Añadir capacidad de compartir listas de deseos