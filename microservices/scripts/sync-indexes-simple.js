#!/usr/bin/env node

/**
 * Script simplificado para sincronizar índices en MongoDB
 * Usa los modelos de Mongoose directamente
 */

const mongoose = require('mongoose');

// URI desde dentro de Docker
const MONGODB_URI = 'mongodb://admin:admin123@mongodb:27017/flores-victoria?authSource=admin';

console.log('🚀 Sincronizando índices de MongoDB...\n');

async function syncProductIndexes() {
  console.log('📦 PRODUCTS - Sincronizando índices...');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Cargar el modelo (esto crea los índices automáticamente)
    const Product = require('../product-service/src/models/Product');

    // Forzar sincronización de índices
    await Product.syncIndexes();

    console.log('✅ Índices de Products sincronizados correctamente\n');

    // Listar índices creados
    const indexes = await Product.collection.getIndexes();
    console.log('Índices existentes en Products:');
    Object.keys(indexes).forEach((name) => {
      console.log(`  • ${name}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

syncProductIndexes()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
