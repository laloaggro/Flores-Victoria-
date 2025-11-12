#!/usr/bin/env node

/**
 * MongoDB Indexes Setup Script
 * Crea índices optimizados para todas las colecciones
 *
 * Uso:
 *   node setup-indexes.js
 */

const { MongoClient } = require('mongodb');

// Configuración
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flores-victoria';

// Definición de índices por colección
const indexes = {
  products: [
    // Búsqueda de texto completo
    {
      name: 'text_search',
      keys: { name: 'text', description: 'text', tags: 'text' },
      options: {
        weights: { name: 10, description: 5, tags: 3 },
        name: 'products_text_search',
      },
    },
    // Filtrado por categoría y precio
    {
      name: 'category_price',
      keys: { category: 1, price: 1 },
      options: { name: 'products_category_price' },
    },
    // Productos destacados activos
    {
      name: 'featured_active',
      keys: { featured: 1, active: 1, createdAt: -1 },
      options: { name: 'products_featured_active' },
    },
    // Ordenamiento por fecha
    {
      name: 'created_at',
      keys: { createdAt: -1 },
      options: { name: 'products_created_at' },
    },
    // Ordenamiento por popularidad/ventas
    {
      name: 'sales_count',
      keys: { salesCount: -1 },
      options: { name: 'products_sales_count', sparse: true },
    },
    // Stock bajo
    {
      name: 'low_stock',
      keys: { stock: 1, active: 1 },
      options: { name: 'products_low_stock' },
    },
    // SKU único
    {
      name: 'sku',
      keys: { sku: 1 },
      options: { name: 'products_sku', unique: true, sparse: true },
    },
  ],

  users: [
    // Email único (login)
    {
      name: 'email',
      keys: { email: 1 },
      options: { name: 'users_email', unique: true },
    },
    // Fecha de registro
    {
      name: 'created_at',
      keys: { createdAt: -1 },
      options: { name: 'users_created_at' },
    },
    // Rol y estado
    {
      name: 'role_status',
      keys: { role: 1, isActive: 1 },
      options: { name: 'users_role_status' },
    },
    // Última actividad
    {
      name: 'last_login',
      keys: { lastLogin: -1 },
      options: { name: 'users_last_login', sparse: true },
    },
    // Búsqueda por nombre
    {
      name: 'name_search',
      keys: { name: 'text', email: 'text' },
      options: {
        weights: { name: 10, email: 5 },
        name: 'users_name_search',
      },
    },
  ],

  orders: [
    // Órdenes por usuario y estado
    {
      name: 'user_status',
      keys: { userId: 1, status: 1, createdAt: -1 },
      options: { name: 'orders_user_status' },
    },
    // Fecha de creación
    {
      name: 'created_at',
      keys: { createdAt: -1 },
      options: { name: 'orders_created_at' },
    },
    // Estado y fecha
    {
      name: 'status_date',
      keys: { status: 1, createdAt: -1 },
      options: { name: 'orders_status_date' },
    },
    // Número de orden único
    {
      name: 'order_number',
      keys: { orderNumber: 1 },
      options: { name: 'orders_order_number', unique: true, sparse: true },
    },
    // Total de la orden (para reportes)
    {
      name: 'total',
      keys: { total: -1 },
      options: { name: 'orders_total' },
    },
    // Método de pago
    {
      name: 'payment_method',
      keys: { paymentMethod: 1, status: 1 },
      options: { name: 'orders_payment_method' },
    },
  ],

  categories: [
    // Nombre único
    {
      name: 'name',
      keys: { name: 1 },
      options: { name: 'categories_name', unique: true },
    },
    // Slug único
    {
      name: 'slug',
      keys: { slug: 1 },
      options: { name: 'categories_slug', unique: true },
    },
    // Orden de visualización
    {
      name: 'display_order',
      keys: { displayOrder: 1 },
      options: { name: 'categories_display_order', sparse: true },
    },
    // Categorías activas
    {
      name: 'active',
      keys: { active: 1 },
      options: { name: 'categories_active' },
    },
  ],

  reviews: [
    // Reviews por producto
    {
      name: 'product',
      keys: { productId: 1, createdAt: -1 },
      options: { name: 'reviews_product' },
    },
    // Reviews por usuario
    {
      name: 'user',
      keys: { userId: 1, createdAt: -1 },
      options: { name: 'reviews_user' },
    },
    // Rating
    {
      name: 'rating',
      keys: { rating: -1 },
      options: { name: 'reviews_rating' },
    },
    // Reviews verificadas
    {
      name: 'verified',
      keys: { isVerified: 1, createdAt: -1 },
      options: { name: 'reviews_verified' },
    },
  ],

  cart: [
    // Carrito por usuario
    {
      name: 'user',
      keys: { userId: 1 },
      options: { name: 'cart_user', unique: true },
    },
    // Carritos actualizados recientemente
    {
      name: 'updated_at',
      keys: { updatedAt: -1 },
      options: { name: 'cart_updated_at' },
    },
    // Carritos abandonados (TTL index - 30 días)
    {
      name: 'ttl',
      keys: { updatedAt: 1 },
      options: {
        name: 'cart_ttl',
        expireAfterSeconds: 30 * 24 * 60 * 60, // 30 días
      },
    },
  ],

  wishlist: [
    // Wishlist por usuario
    {
      name: 'user',
      keys: { userId: 1 },
      options: { name: 'wishlist_user' },
    },
    // Productos en wishlist
    {
      name: 'user_product',
      keys: { userId: 1, productId: 1 },
      options: { name: 'wishlist_user_product', unique: true },
    },
  ],

  sessions: [
    // Sesión por usuario
    {
      name: 'user',
      keys: { userId: 1 },
      options: { name: 'sessions_user' },
    },
    // Token único
    {
      name: 'token',
      keys: { token: 1 },
      options: { name: 'sessions_token', unique: true },
    },
    // TTL - eliminar sesiones expiradas
    {
      name: 'ttl',
      keys: { expiresAt: 1 },
      options: {
        name: 'sessions_ttl',
        expireAfterSeconds: 0,
      },
    },
  ],
};

/**
 * Crea índices para una colección
 */
async function createIndexesForCollection(db, collectionName) {
  console.log(`\n📋 Procesando colección: ${collectionName}`);

  const collection = db.collection(collectionName);
  const collectionIndexes = indexes[collectionName];

  if (!collectionIndexes || collectionIndexes.length === 0) {
    console.log(`  ⏭️  Sin índices definidos para ${collectionName}`);
    return;
  }

  for (const indexDef of collectionIndexes) {
    try {
      await collection.createIndex(indexDef.keys, indexDef.options);
      console.log(`  ✅ Índice creado: ${indexDef.name}`);
    } catch (error) {
      if (error.code === 85) {
        // Index already exists with different options
        console.log(`  🔄 Recreando índice: ${indexDef.name}`);
        await collection.dropIndex(indexDef.options.name);
        await collection.createIndex(indexDef.keys, indexDef.options);
        console.log(`  ✅ Índice recreado: ${indexDef.name}`);
      } else if (error.code === 86) {
        // Index already exists with same options
        console.log(`  ℹ️  Índice ya existe: ${indexDef.name}`);
      } else {
        console.error(`  ❌ Error creando índice ${indexDef.name}:`, error.message);
      }
    }
  }
}

/**
 * Lista índices existentes
 */
async function listExistingIndexes(db, collectionName) {
  const collection = db.collection(collectionName);
  const existingIndexes = await collection.indexes();

  console.log(`\n📊 Índices en ${collectionName}:`);
  existingIndexes.forEach((index) => {
    console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
  });
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Iniciando configuración de índices MongoDB\n');
  console.log(`📍 Conectando a: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);

  let client;

  try {
    // Conectar a MongoDB
    client = new MongoClient(MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    await client.connect();
    console.log('✅ Conectado a MongoDB\n');

    const db = client.db();

    // Crear índices para cada colección
    for (const collectionName of Object.keys(indexes)) {
      await createIndexesForCollection(db, collectionName);
    }

    // Mostrar resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE ÍNDICES CREADOS');
    console.log('='.repeat(60));

    for (const collectionName of Object.keys(indexes)) {
      await listExistingIndexes(db, collectionName);
    }

    console.log('\n✅ Configuración de índices completada exitosamente!');
    console.log('\n💡 Beneficios esperados:');
    console.log('  - Queries de búsqueda hasta 100x más rápidas');
    console.log('  - Filtrado y ordenamiento optimizado');
    console.log('  - Garantía de unicidad en campos críticos');
    console.log('  - Limpieza automática de datos antiguos (TTL)');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n👋 Conexión cerrada');
    }
  }
}

// Ejecutar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createIndexesForCollection, indexes };
