/**
 * @fileoverview Database Index Creation Script
 * @description Crea índices optimizados para queries frecuentes en MongoDB y PostgreSQL
 * 
 * @usage
 *   node scripts/create-db-indexes.js [--mongodb] [--postgres] [--dry-run]
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { MongoClient } = require('mongodb');
const { Pool } = require('pg');

// Configuración
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'flores_victoria';
const POSTGRES_URI = process.env.DATABASE_URL || 'postgresql://localhost:5432/flores_db';

// Flag para dry-run
const isDryRun = process.argv.includes('--dry-run');
const runMongoDB = process.argv.includes('--mongodb') || (!process.argv.includes('--postgres'));
const runPostgres = process.argv.includes('--postgres') || (!process.argv.includes('--mongodb'));

// ═══════════════════════════════════════════════════════════════
// ÍNDICES DE MONGODB
// ═══════════════════════════════════════════════════════════════

const MONGODB_INDEXES = {
  // Colección: products
  products: [
    {
      keys: { category: 1, isActive: 1 },
      options: { name: 'idx_category_active', background: true },
      description: 'Búsqueda de productos por categoría activos',
    },
    {
      keys: { name: 'text', description: 'text' },
      options: { name: 'idx_product_search', weights: { name: 10, description: 5 } },
      description: 'Búsqueda de texto en productos',
    },
    {
      keys: { price: 1 },
      options: { name: 'idx_price', background: true },
      description: 'Ordenamiento y filtrado por precio',
    },
    {
      keys: { createdAt: -1 },
      options: { name: 'idx_created_desc', background: true },
      description: 'Listado de productos recientes',
    },
    {
      keys: { slug: 1 },
      options: { name: 'idx_slug', unique: true, sparse: true },
      description: 'Búsqueda por slug único',
    },
    {
      keys: { 'occasion': 1, isActive: 1 },
      options: { name: 'idx_occasion_active', background: true },
      description: 'Filtro por ocasión',
    },
    {
      keys: { featured: 1, isActive: 1 },
      options: { name: 'idx_featured', background: true },
      description: 'Productos destacados',
    },
  ],

  // Colección: orders
  orders: [
    {
      keys: { userId: 1, createdAt: -1 },
      options: { name: 'idx_user_orders', background: true },
      description: 'Pedidos de un usuario ordenados por fecha',
    },
    {
      keys: { status: 1, createdAt: -1 },
      options: { name: 'idx_status_created', background: true },
      description: 'Pedidos por estado y fecha',
    },
    {
      keys: { orderNumber: 1 },
      options: { name: 'idx_order_number', unique: true },
      description: 'Búsqueda por número de pedido',
    },
    {
      keys: { 'deliveryDate': 1, status: 1 },
      options: { name: 'idx_delivery_status', background: true },
      description: 'Pedidos por fecha de entrega',
    },
    {
      keys: { createdAt: 1 },
      options: { 
        name: 'idx_orders_ttl', 
        expireAfterSeconds: 365 * 24 * 60 * 60, // 1 año
        partialFilterExpression: { status: 'cancelled' },
      },
      description: 'TTL para pedidos cancelados (1 año)',
    },
    {
      keys: { paymentStatus: 1, createdAt: -1 },
      options: { name: 'idx_payment_status', background: true },
      description: 'Pedidos por estado de pago',
    },
  ],

  // Colección: reviews
  reviews: [
    {
      keys: { productId: 1, createdAt: -1 },
      options: { name: 'idx_product_reviews', background: true },
      description: 'Reviews de un producto',
    },
    {
      keys: { userId: 1, productId: 1 },
      options: { name: 'idx_user_product_review', unique: true },
      description: 'Una review por usuario por producto',
    },
    {
      keys: { rating: 1 },
      options: { name: 'idx_rating', background: true },
      description: 'Filtro por rating',
    },
    {
      keys: { isApproved: 1, createdAt: -1 },
      options: { name: 'idx_approved_reviews', background: true },
      description: 'Reviews aprobadas',
    },
  ],

  // Colección: carts
  carts: [
    {
      keys: { userId: 1 },
      options: { name: 'idx_user_cart', unique: true, sparse: true },
      description: 'Carrito de usuario (uno por usuario)',
    },
    {
      keys: { sessionId: 1 },
      options: { name: 'idx_session_cart', sparse: true },
      description: 'Carrito por sesión (usuarios anónimos)',
    },
    {
      keys: { updatedAt: 1 },
      options: { 
        name: 'idx_cart_ttl',
        expireAfterSeconds: 30 * 24 * 60 * 60, // 30 días
        partialFilterExpression: { userId: null },
      },
      description: 'TTL para carritos de sesión abandonados',
    },
  ],

  // Colección: wishlists
  wishlists: [
    {
      keys: { userId: 1 },
      options: { name: 'idx_user_wishlist', unique: true },
      description: 'Wishlist de usuario',
    },
    {
      keys: { 'items.productId': 1 },
      options: { name: 'idx_wishlist_products', background: true },
      description: 'Búsqueda de productos en wishlists',
    },
  ],

  // Colección: notifications
  notifications: [
    {
      keys: { userId: 1, read: 1, createdAt: -1 },
      options: { name: 'idx_user_notifications', background: true },
      description: 'Notificaciones de usuario',
    },
    {
      keys: { createdAt: 1 },
      options: { 
        name: 'idx_notifications_ttl',
        expireAfterSeconds: 90 * 24 * 60 * 60, // 90 días
      },
      description: 'TTL para notificaciones antiguas',
    },
  ],

  // Colección: audit_logs
  audit_logs: [
    {
      keys: { userId: 1, createdAt: -1 },
      options: { name: 'idx_user_audit', background: true },
      description: 'Logs de auditoría por usuario',
    },
    {
      keys: { action: 1, createdAt: -1 },
      options: { name: 'idx_action_audit', background: true },
      description: 'Logs por tipo de acción',
    },
    {
      keys: { createdAt: 1 },
      options: { 
        name: 'idx_audit_ttl',
        expireAfterSeconds: 180 * 24 * 60 * 60, // 6 meses
      },
      description: 'TTL para logs antiguos',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// ÍNDICES DE POSTGRESQL
// ═══════════════════════════════════════════════════════════════

const POSTGRES_INDEXES = [
  // Tabla: auth_users
  {
    table: 'auth_users',
    name: 'idx_auth_users_email',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_users_email ON auth_users(email)',
    description: 'Búsqueda por email (login)',
  },
  {
    table: 'auth_users',
    name: 'idx_auth_users_role',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_users_role ON auth_users(role)',
    description: 'Filtro por rol',
  },
  {
    table: 'auth_users',
    name: 'idx_auth_users_created',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_users_created ON auth_users(created_at DESC)',
    description: 'Usuarios recientes',
  },
  {
    table: 'auth_users',
    name: 'idx_auth_users_provider',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_users_provider ON auth_users(provider) WHERE provider IS NOT NULL',
    description: 'Usuarios por proveedor OAuth',
  },

  // Tabla: users (user-service)
  {
    table: 'users',
    name: 'idx_users_email',
    sql: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
    description: 'Email único',
  },
  {
    table: 'users',
    name: 'idx_users_phone',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL',
    description: 'Búsqueda por teléfono',
  },
  {
    table: 'users',
    name: 'idx_users_active',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true',
    description: 'Usuarios activos',
  },

  // Tabla: addresses
  {
    table: 'addresses',
    name: 'idx_addresses_user',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_addresses_user ON addresses(user_id)',
    description: 'Direcciones por usuario',
  },
  {
    table: 'addresses',
    name: 'idx_addresses_default',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = true',
    description: 'Dirección por defecto',
  },

  // Tabla: sessions (si existe)
  {
    table: 'sessions',
    name: 'idx_sessions_user',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user ON sessions(user_id)',
    description: 'Sesiones por usuario',
    optional: true,
  },
  {
    table: 'sessions',
    name: 'idx_sessions_expires',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)',
    description: 'Expiración de sesiones',
    optional: true,
  },

  // Tabla: password_reset_tokens (si existe)
  {
    table: 'password_reset_tokens',
    name: 'idx_reset_tokens_email',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reset_tokens_email ON password_reset_tokens(email)',
    description: 'Tokens de reset por email',
    optional: true,
  },
  {
    table: 'password_reset_tokens',
    name: 'idx_reset_tokens_expires',
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at)',
    description: 'Expiración de tokens',
    optional: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE EJECUCIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Crea índices en MongoDB
 */
async function createMongoIndexes() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 CREANDO ÍNDICES EN MONGODB');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log(`✅ Conectado a MongoDB: ${MONGODB_URI}\n`);
    
    const db = client.db(MONGODB_DB);
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const [collectionName, indexes] of Object.entries(MONGODB_INDEXES)) {
      console.log(`\n📁 Colección: ${collectionName}`);
      console.log('─'.repeat(50));
      
      const collection = db.collection(collectionName);
      
      for (const index of indexes) {
        try {
          if (isDryRun) {
            console.log(`  [DRY-RUN] ${index.options.name}: ${index.description}`);
            skipped++;
          } else {
            await collection.createIndex(index.keys, index.options);
            console.log(`  ✅ ${index.options.name}: ${index.description}`);
            created++;
          }
        } catch (error) {
          if (error.code === 85 || error.code === 86) {
            // Index already exists
            console.log(`  ⏭️  ${index.options.name}: Ya existe`);
            skipped++;
          } else {
            console.error(`  ❌ ${index.options.name}: ${error.message}`);
            errors++;
          }
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`  MongoDB: ${created} creados, ${skipped} omitidos, ${errors} errores`);
    console.log('═══════════════════════════════════════════════════════════════\n');

  } finally {
    await client.close();
  }
}

/**
 * Crea índices en PostgreSQL
 */
async function createPostgresIndexes() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  🐘 CREANDO ÍNDICES EN POSTGRESQL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const pool = new Pool({ connectionString: POSTGRES_URI });
  
  try {
    const client = await pool.connect();
    console.log(`✅ Conectado a PostgreSQL\n`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Verificar tablas existentes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTables = new Set(tablesResult.rows.map(r => r.table_name));

    for (const index of POSTGRES_INDEXES) {
      // Verificar si la tabla existe
      if (!existingTables.has(index.table)) {
        if (!index.optional) {
          console.log(`  ⚠️  ${index.name}: Tabla '${index.table}' no existe`);
        }
        skipped++;
        continue;
      }

      try {
        if (isDryRun) {
          console.log(`  [DRY-RUN] ${index.name}: ${index.description}`);
          console.log(`            SQL: ${index.sql}`);
          skipped++;
        } else {
          await client.query(index.sql);
          console.log(`  ✅ ${index.name}: ${index.description}`);
          created++;
        }
      } catch (error) {
        if (error.code === '42P07') {
          // Index already exists
          console.log(`  ⏭️  ${index.name}: Ya existe`);
          skipped++;
        } else {
          console.error(`  ❌ ${index.name}: ${error.message}`);
          errors++;
        }
      }
    }

    client.release();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`  PostgreSQL: ${created} creados, ${skipped} omitidos, ${errors} errores`);
    console.log('═══════════════════════════════════════════════════════════════\n');

  } finally {
    await pool.end();
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║   🌸 FLORES VICTORIA - CREACIÓN DE ÍNDICES DE BASE DE DATOS  ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  if (isDryRun) {
    console.log('\n⚠️  MODO DRY-RUN: No se crearán índices reales\n');
  }

  try {
    if (runMongoDB) {
      await createMongoIndexes();
    }
    
    if (runPostgres) {
      await createPostgresIndexes();
    }

    console.log('✅ Proceso completado\n');
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es el módulo principal
if (require.main === module) {
  main();
}

module.exports = {
  createMongoIndexes,
  createPostgresIndexes,
  MONGODB_INDEXES,
  POSTGRES_INDEXES,
};
