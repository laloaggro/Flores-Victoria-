#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Script para crear índices optimizados en MongoDB
 * Usage: node scripts/create-mongodb-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flores_victoria';

async function createIndexes() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión establecida\n');

    const db = mongoose.connection.db;

    console.log('📦 Creando índices para productos...');
    const productsCollection = db.collection('products');

    await productsCollection.createIndex(
      { name: 'text', description: 'text', category: 'text' },
      { name: 'text_search_index', weights: { name: 10, category: 5, description: 1 } }
    );
    await productsCollection.createIndex({ id: 1 }, { unique: true });
    await productsCollection.createIndex({ category: 1, price: 1, active: 1 });
    await productsCollection.createIndex({ occasions: 1, featured: 1, active: 1 });
    await productsCollection.createIndex({ rating: -1, sales: -1, active: 1 });
    await productsCollection.createIndex({ featured: 1, createdAt: -1, active: 1 });

    console.log('✅ Índices creados exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createIndexes();
