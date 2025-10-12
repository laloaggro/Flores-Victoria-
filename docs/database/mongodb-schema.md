# Esquema de Base de Datos MongoDB - Flores Victoria

## Descripción General

La base de datos MongoDB almacena documentos y datos no relacionales para el sistema Flores Victoria. Incluye información de productos y reseñas.

## Tecnologías

- MongoDB 4.4
- Documentos BSON
- Colecciones flexibles

## Esquema de la Base de Datos

### Colección de Productos (products)
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Decimal128,
  category: String,
  imageUrl: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Colección de Reseñas (reviews)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  productId: ObjectId,
  rating: Number, // 1-5
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Índices

```javascript
// Índices para la colección de productos
db.products.createIndex({ category: 1 })
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ price: 1 })

// Índices para la colección de reseñas
db.reviews.createIndex({ productId: 1 })
db.reviews.createIndex({ userId: 1 })
db.reviews.createIndex({ rating: 1 })
```

## Relaciones

1. **Productos y Reseñas**: Una relación uno a muchos donde un producto puede tener múltiples reseñas
2. **Usuarios y Reseñas**: Una relación uno a muchos donde un usuario puede escribir múltiples reseñas

## Configuración

### Variables de Entorno
- `MONGO_URI`: URI de conexión a MongoDB
- `MONGO_INITDB_ROOT_USERNAME`: Usuario administrador de MongoDB
- `MONGO_INITDB_ROOT_PASSWORD`: Contraseña del administrador de MongoDB

## Consideraciones de Seguridad

1. Se habilita la autenticación para todas las conexiones
2. Se utilizan roles y privilegios mínimos para cada servicio
3. Se configura el acceso basado en IP cuando es posible
4. Se utilizan conexiones SSL/TLS para la transmisión de datos

## Consideraciones de Rendimiento

1. Se utilizan índices apropiados para consultas frecuentes
2. Se implementa sharding para grandes volúmenes de datos
3. Se utilizan agregaciones para consultas complejas
4. Se optimizan las consultas con proyección para reducir la transferencia de datos

## Backup y Recuperación

1. Se utilizan MongoDB Atlas o mongodump para backups regulares
2. Se implementa replicación para alta disponibilidad
3. Se configuran puntos de control (checkpoints) para recuperación rápida
4. Se prueban regularmente los procedimientos de recuperación

## Mantenimiento

1. Se monitorean los tiempos de respuesta de las consultas
2. Se revisan y optimizan los índices según sea necesario
3. Se actualiza el sistema de base de datos con parches de seguridad
4. Se realizan tareas de compactación para recuperar espacio