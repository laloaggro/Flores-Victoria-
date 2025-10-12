# Estructura de Datos Redis - Flores Victoria

## Descripción General

Redis se utiliza como almacén de datos en memoria para el sistema Flores Victoria. Almacena carritos de compras, listas de deseos y datos de sesión.

## Tecnologías

- Redis 6-alpine
- Almacenamiento en memoria
- Estructuras de datos avanzadas

## Estructura de Datos

### Carritos de Compras (cart)
```bash
# Estructura: cart:<userId>
# Tipo: Hash
# Campos:
#   items: JSON string con los items del carrito
#   total: Total del carrito
#   updatedAt: Fecha de última actualización

# Ejemplo:
# cart:12345 -> {
#   "items": "[{\"productId\": \"67890\", \"name\": \"Ramo de Rosas\", \"price\": 25.99, \"quantity\": 2}]",
#   "total": "51.98",
#   "updatedAt": "2023-01-01T10:00:00Z"
# }
```

### Listas de Deseos (wishlist)
```bash
# Estructura: wishlist:<userId>
# Tipo: Set
# Valores: IDs de productos

# Ejemplo:
# wishlist:12345 -> {"67890", "54321", "98765"}
```

### Sesiones de Usuario (session)
```bash
# Estructura: session:<sessionId>
# Tipo: String
# Valor: Datos de sesión serializados

# Ejemplo:
# session:abc123 -> "{\"userId\": 12345, \"expiresAt\": \"2023-01-02T10:00:00Z\"}"
```

### Tokens JWT (jwt)
```bash
# Estructura: jwt:<tokenId>
# Tipo: String
# Valor: Información de tokens para invalidación

# Ejemplo:
# jwt:xyz789 -> "{\"userId\": 12345, \"expiresAt\": \"2023-01-01T12:00:00Z\"}"
```

## Expiración de Claves

```bash
# Carritos de compras: 30 días
EXPIRE cart:* 2592000

# Listas de deseos: 90 días
EXPIRE wishlist:* 7776000

# Sesiones: 24 horas
EXPIRE session:* 86400

# Tokens JWT: Hasta expiración (máximo 30 días)
EXPIRE jwt:* 2592000
```

## Configuración

### Variables de Entorno
- `REDIS_HOST`: Host de Redis
- `REDIS_PORT`: Puerto de Redis (por defecto: 6379)
- `REDIS_PASSWORD`: Contraseña de Redis

## Consideraciones de Seguridad

1. Se requiere autenticación con contraseña
2. Se limita el acceso por IP cuando es posible
3. Se deshabilitan comandos peligrosos (FLUSHALL, KEYS, etc.)
4. Se utilizan conexiones SSL/TLS para la transmisión de datos

## Consideraciones de Rendimiento

1. Se utilizan operaciones atómicas para evitar condiciones de carrera
2. Se implementan patrones de clave eficientes
3. Se monitorean las estadísticas de uso de memoria
4. Se configuran políticas de eliminación (LRU) para manejar la memoria

## Backup y Recoleración

1. Se configura persistencia AOF (Append Only File) para durabilidad
2. Se realizan snapshots RDB periódicos
3. Se almacenan backups en ubicación segura y separada
4. Se prueban regularmente los procedimientos de recuperación

## Mantenimiento

1. Se monitorea el uso de memoria
2. Se revisan y optimizan las claves según sea necesario
3. Se actualiza el sistema con parches de seguridad
4. Se realizan operaciones de compactación (BGREWRITEAOF) para reducir el tamaño de archivos