// =====================================================
// MongoDB Performance Optimizations
// =====================================================

// CONEXIÓN A MONGODB
use flores_victoria;

// =====================================================
// ÍNDICES PARA PRODUCTOS
// =====================================================

db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ stock: 1 });
db.products.createIndex({ active: 1 });
db.products.createIndex({ createdAt: -1 });

// Índice compuesto para filtros comunes
db.products.createIndex({ category: 1, active: 1, stock: 1 });
db.products.createIndex({ category: 1, price: 1 });

// Índice parcial para productos activos
db.products.createIndex(
  { category: 1, price: 1 },
  { partialFilterExpression: { active: true, stock: { $gt: 0 } } }
);

// =====================================================
// ÍNDICES PARA CARRITO
// =====================================================

db.cart.createIndex({ userId: 1 }, { unique: true });
db.cart.createIndex({ updatedAt: -1 });
db.cart.createIndex({ "items.productId": 1 });

// TTL index para auto-limpiar carritos antiguos (30 días)
db.cart.createIndex(
  { updatedAt: 1 },
  { expireAfterSeconds: 2592000 } // 30 días
);

// =====================================================
// ÍNDICES PARA LOGS
// =====================================================

db.activityLogs.createIndex({ userId: 1, timestamp: -1 });
db.activityLogs.createIndex({ service: 1, timestamp: -1 });
db.activityLogs.createIndex({ action: 1, timestamp: -1 });
db.activityLogs.createIndex({ timestamp: -1 });

// TTL index para auto-limpiar logs antiguos (90 días)
db.activityLogs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 } // 90 días
);

// =====================================================
// AGREGACIONES OPTIMIZADAS
// =====================================================

// Pipeline optimizado para productos por categoría
db.products.aggregate([
  {
    $match: {
      active: true,
      stock: { $gt: 0 }
    }
  },
  {
    $group: {
      _id: "$category",
      count: { $sum: 1 },
      avgPrice: { $avg: "$price" },
      totalStock: { $sum: "$stock" }
    }
  },
  {
    $sort: { count: -1 }
  }
]);

// Pipeline para productos más vendidos (requiere tracking)
db.products.aggregate([
  {
    $lookup: {
      from: "productStats",
      localField: "_id",
      foreignField: "productId",
      as: "stats"
    }
  },
  {
    $unwind: "$stats"
  },
  {
    $sort: { "stats.totalSold": -1 }
  },
  {
    $limit: 20
  },
  {
    $project: {
      name: 1,
      price: 1,
      category: 1,
      totalSold: "$stats.totalSold",
      revenue: "$stats.totalRevenue"
    }
  }
]);

// =====================================================
// SHARDING (para alto volumen)
// =====================================================

// Habilitar sharding en la base de datos
// sh.enableSharding("flores_victoria");

// Shard key para products (por category)
// sh.shardCollection("flores_victoria.products", { category: 1, _id: 1 });

// Shard key para cart (por userId)
// sh.shardCollection("flores_victoria.cart", { userId: 1 });

// Shard key para logs (por timestamp)
// sh.shardCollection("flores_victoria.activityLogs", { timestamp: 1 });

// =====================================================
// VISTAS PRECOMPUTADAS
// =====================================================

// Vista para estadísticas de productos
db.createView(
  "productStats",
  "products",
  [
    {
      $group: {
        _id: "$category",
        totalProducts: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        totalStock: { $sum: "$stock" }
      }
    },
    {
      $sort: { totalProducts: -1 }
    }
  ]
);

// =====================================================
// READ PREFERENCE
// =====================================================

// Para queries de lectura pesadas, usar secondaries
// db.products.find().readPref("secondary");

// Para datos críticos, usar primary
// db.cart.find({ userId: "..." }).readPref("primary");

// =====================================================
// WRITE CONCERN
// =====================================================

// Para operaciones críticas (órdenes, pagos)
// db.orders.insertOne(
//   { ... },
//   { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
// );

// Para logs (menos crítico)
// db.activityLogs.insertOne(
//   { ... },
//   { writeConcern: { w: 1, j: false } }
// );

// =====================================================
// ARCHIVADO DE DATOS
// =====================================================

// Mover logs antiguos a colección de archivo
db.activityLogs.aggregate([
  {
    $match: {
      timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $out: "activityLogs_archive"
  }
]);

// Eliminar logs antiguos
db.activityLogs.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});

// =====================================================
// MONITORING
// =====================================================

// Ver estadísticas de colecciones
db.products.stats();
db.cart.stats();

// Ver uso de índices
db.products.aggregate([{ $indexStats: {} }]);

// Ver operaciones lentas
db.currentOp({
  active: true,
  secs_running: { $gt: 1 }
});

// =====================================================
// OPTIMIZACIÓN DE STORAGE
// =====================================================

// Compactar colecciones (ejecutar en mantenimiento)
// db.runCommand({ compact: "products", force: true });
// db.runCommand({ compact: "cart", force: true });

// Reindexar (ejecutar mensualmente)
// db.products.reIndex();
// db.cart.reIndex();

// =====================================================
// PROJECTION OPTIMIZATION
// =====================================================

// MAL: Traer todos los campos
// db.products.find({ category: "flores" });

// BIEN: Solo campos necesarios
db.products.find(
  { category: "flores" },
  { name: 1, price: 1, image: 1, stock: 1 }
);

// =====================================================
// BATCH OPERATIONS
// =====================================================

// Insertar múltiples productos eficientemente
db.products.insertMany(
  [
    { name: "Producto 1", price: 10 },
    { name: "Producto 2", price: 20 }
  ],
  { ordered: false } // Parallel inserts
);

// Update masivo
db.products.updateMany(
  { category: "flores", stock: { $lt: 5 } },
  { $set: { lowStockAlert: true } }
);

// =====================================================
// CAPPED COLLECTIONS (para logs)
// =====================================================

// Crear colección con límite de tamaño
db.createCollection("systemLogs", {
  capped: true,
  size: 1073741824,  // 1 GB
  max: 1000000       // 1M documentos
});

// =====================================================
// CHANGE STREAMS (para real-time)
// =====================================================

// Escuchar cambios en productos
// const changeStream = db.products.watch([
//   {
//     $match: {
//       'operationType': { $in: ['insert', 'update', 'delete'] }
//     }
//   }
// ]);
//
// changeStream.on('change', (change) => {
//   console.log('Product changed:', change);
//   // Invalidar cache
//   // Notificar frontend via websocket
// });

// =====================================================
// BACKUP STRATEGY
// =====================================================

// Backup diario (ejecutar con cron)
// mongodump --uri="mongodb://admin:admin123@localhost:27017/flores_victoria" \
//   --out="/backups/$(date +%Y%m%d)"

// Restore
// mongorestore --uri="mongodb://admin:admin123@localhost:27017/flores_victoria" \
//   /backups/20240115/flores_victoria

// =====================================================
// PERFORMANCE TIPS
// =====================================================

// 1. Siempre usar índices en queries frecuentes
// 2. Limitar resultados con limit()
// 3. Usar projection para reducir datos transferidos
// 4. Evitar $where operator (muy lento)
// 5. Usar bulk operations para múltiples writes
// 6. Configurar read preference según use case
// 7. Monitorear slow queries en logs
// 8. Usar TTL indexes para auto-cleanup
// 9. Considerar sharding para > 100GB de datos
// 10. Mantener working set en RAM
