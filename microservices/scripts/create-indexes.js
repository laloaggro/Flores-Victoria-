#!/usr/bin/env node

/**
 * Script para crear índices optimizados en MongoDB
 * Ejecutar: node scripts/create-indexes.js
 * 
 * Crea índices en:
 * - Products (mongoose)
 * - Promotions (mongoose)
 * - Reviews (MongoDB nativo)
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Configuración de MongoDB
// URI con autenticación para MongoDB local
const MONGODB_URI = process.env.MONGODB_URI || 
                    process.env.PRODUCT_SERVICE_MONGODB_URI ||
                    'mongodb://admin:admin123@localhost:27017/flores_victoria?authSource=admin';

// Extraer nombre de la base de datos de la URI
const DB_NAME = MONGODB_URI.split('/').pop().split('?')[0] || 'flores_victoria';

console.log(`📍 Conectando a: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`); // Ocultar password
console.log(`💾 Base de datos: ${DB_NAME}\n`);

console.log('🚀 Iniciando creación de índices MongoDB...\n');

// ============================================
// FUNCIÓN PARA CREAR ÍNDICES EN PRODUCTS
// ============================================
async function createProductIndexes() {
  console.log('📦 PRODUCTS - Creando índices...');
  
  try {
    // Conectar con mongoose para usar el modelo
    await mongoose.connect(MONGODB_URI);
    const Product = require('../product-service/src/models/Product');
    
    // Mongoose crea los índices automáticamente al cargar el modelo
    // Pero forzamos la creación con syncIndexes
    await Product.syncIndexes();
    
    console.log('✅ Índices de Products creados correctamente');
    console.log('   - product_text_search (text: name + description)');
    console.log('   - catalog_category_price (active + category + price)');
    console.log('   - featured_products (active + featured + rating)');
    console.log('   - occasion_available (occasions + active + stock)');
    console.log('   - discounted_products (active + original_price + price)');
    console.log('   - popular_products (active + rating + reviews_count)');
    console.log('   - low_stock (active + stock < 10)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error creando índices de Products:', error.message);
    throw error;
  }
}

// ============================================
// FUNCIÓN PARA CREAR ÍNDICES EN PROMOTIONS
// ============================================
async function createPromotionIndexes() {
  console.log('🎁 PROMOTIONS - Creando índices...');
  
  try {
    const Promotion = require('../promotion-service/models/Promotion');
    
    // Mongoose crea los índices automáticamente
    await Promotion.syncIndexes();
    
    console.log('✅ Índices de Promotions creados correctamente');
    console.log('   - code_unique (code único)');
    console.log('   - active_promotions (active + dates)');
    console.log('   - auto_apply_active (autoApply + active + dates)');
    console.log('   - code_validation (code + active + endDate)');
    console.log('   - priority_order (active + priority)');
    console.log('   - category_promotions (applicableCategories + active)');
    console.log('   - usage_tracking (usageLimit + usageCount)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error creando índices de Promotions:', error.message);
    throw error;
  }
}

// ============================================
// FUNCIÓN PARA CREAR ÍNDICES EN REVIEWS
// ============================================
async function createReviewIndexes() {
  console.log('⭐ REVIEWS - Creando índices...');
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const Review = require('../review-service/src/models/Review');
    const reviewModel = new Review(db);
    
    // Llamar al método createIndexes del modelo
    await reviewModel.createIndexes();
    
    console.log('✅ Índices de Reviews creados correctamente');
    console.log('   - product_recent_reviews (productId + createdAt)');
    console.log('   - user_reviews (userId + createdAt)');
    console.log('   - product_rating_filter (productId + rating)');
    console.log('   - top_rated_reviews (rating + createdAt)');
    console.log('   - rating_aggregations (productId + rating)');
    console.log('   - verified_reviews (productId + verified)');
    console.log('');
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error creando índices de Reviews:', error.message);
    throw error;
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function main() {
  const startTime = Date.now();
  
  try {
    // Crear índices en paralelo (son colecciones diferentes)
    await Promise.all([
      createProductIndexes(),
      createPromotionIndexes(),
      createReviewIndexes()
    ]);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ ÍNDICES CREADOS EXITOSAMENTE                  ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`⏱️  Tiempo total: ${duration}s`);
    console.log('');
    console.log('📊 IMPACTO ESPERADO:');
    console.log('   • Búsquedas de productos: 10-50x más rápidas');
    console.log('   • Validación de cupones: 100x más rápida');
    console.log('   • Carga de reseñas: 20-30x más rápida');
    console.log('   • Agregaciones de rating: 50x más rápidas');
    console.log('');
    console.log('🔍 VERIFICAR ÍNDICES:');
    console.log('   MongoDB Compass → Collections → Indexes');
    console.log('   O ejecutar: db.products.getIndexes()');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error durante la creación de índices:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión de mongoose
    await mongoose.disconnect();
    console.log('🔌 Conexiones cerradas');
    process.exit(0);
  }
}

// ============================================
// EJECUTAR SCRIPT
// ============================================
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
