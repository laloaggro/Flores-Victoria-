#!/usr/bin/env node

/**
 * Script para verificar índices y analizar su uso
 * Ejecutar: node scripts/verify-indexes.js
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flores-victoria';
const DB_NAME = 'flores-victoria';

console.log('🔍 VERIFICACIÓN DE ÍNDICES MONGODB\n');

// ============================================
// VERIFICAR ÍNDICES DE UNA COLECCIÓN
// ============================================
async function verifyCollectionIndexes(db, collectionName) {
  console.log(`📋 ${collectionName.toUpperCase()}`);
  console.log('─'.repeat(70));
  
  try {
    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();
    
    console.log(`Total de índices: ${indexes.length}\n`);
    
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}`);
      console.log(`   Campos: ${JSON.stringify(index.key)}`);
      if (index.unique) console.log(`   ✓ Único`);
      if (index.sparse) console.log(`   ✓ Sparse`);
      if (index.partialFilterExpression) {
        console.log(`   ✓ Parcial: ${JSON.stringify(index.partialFilterExpression)}`);
      }
      if (index.weights) {
        console.log(`   ✓ Pesos: ${JSON.stringify(index.weights)}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error(`❌ Error verificando ${collectionName}:`, error.message);
  }
}

// ============================================
// ESTADÍSTICAS DE ÍNDICES
// ============================================
async function getIndexStats(db, collectionName) {
  console.log(`📊 ESTADÍSTICAS - ${collectionName.toUpperCase()}`);
  console.log('─'.repeat(70));
  
  try {
    const collection = db.collection(collectionName);
    const stats = await collection.stats();
    
    console.log(`Documentos: ${stats.count.toLocaleString()}`);
    console.log(`Tamaño de datos: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Tamaño de índices: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Índices: ${stats.nindexes}`);
    console.log('');
    
    // Mostrar detalle de cada índice
    if (stats.indexSizes) {
      console.log('Tamaño por índice:');
      Object.entries(stats.indexSizes).forEach(([name, size]) => {
        console.log(`  • ${name}: ${(size / 1024).toFixed(2)} KB`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error(`❌ Error obteniendo estadísticas de ${collectionName}:`, error.message);
  }
}

// ============================================
// PROBAR PERFORMANCE DE CONSULTAS
// ============================================
async function testQueryPerformance(db) {
  console.log('⚡ TEST DE PERFORMANCE DE CONSULTAS\n');
  console.log('─'.repeat(70));
  
  const products = db.collection('products');
  const promotions = db.collection('promotions');
  const reviews = db.collection('reviews');
  
  const tests = [
    {
      name: 'Búsqueda de productos por categoría activos',
      fn: () => products.find({ category: 'rosas', active: true }).explain('executionStats')
    },
    {
      name: 'Búsqueda de texto en productos',
      fn: () => products.find({ $text: { $search: 'ramo flores' } }).explain('executionStats')
    },
    {
      name: 'Productos destacados ordenados por rating',
      fn: () => products.find({ active: true, featured: true }).sort({ rating: -1 }).explain('executionStats')
    },
    {
      name: 'Validación de código de promoción',
      fn: () => promotions.findOne({ code: 'FLORES2024', active: true })
    },
    {
      name: 'Reseñas de un producto',
      fn: () => reviews.find({ productId: 'test-product' }).sort({ createdAt: -1 }).limit(10).explain('executionStats')
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n🔬 ${test.name}`);
      const start = Date.now();
      const result = await test.fn();
      const duration = Date.now() - start;
      
      if (result && result.executionStats) {
        const stats = result.executionStats;
        console.log(`   ⏱️  Tiempo: ${duration}ms`);
        console.log(`   📄 Docs examinados: ${stats.totalDocsExamined}`);
        console.log(`   ✅ Docs retornados: ${stats.nReturned}`);
        console.log(`   🎯 Índice usado: ${result.queryPlanner?.winningPlan?.inputStage?.indexName || 'COLLSCAN'}`);
        
        if (stats.totalDocsExamined > stats.nReturned * 10) {
          console.log(`   ⚠️  ADVERTENCIA: Examinó ${stats.totalDocsExamined / stats.nReturned}x más docs de los necesarios`);
        }
      } else {
        console.log(`   ⏱️  Tiempo: ${duration}ms`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n');
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function main() {
  let client;
  
  try {
    // Conectar a MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Verificar índices de cada colección
    await verifyCollectionIndexes(db, 'products');
    await verifyCollectionIndexes(db, 'promotions');
    await verifyCollectionIndexes(db, 'reviews');
    
    // Estadísticas
    await getIndexStats(db, 'products');
    await getIndexStats(db, 'promotions');
    await getIndexStats(db, 'reviews');
    
    // Test de performance
    await testQueryPerformance(db);
    
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ VERIFICACIÓN COMPLETADA                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('💡 RECOMENDACIONES:');
    console.log('   • Si ves "COLLSCAN", ese query no usa índices (lento)');
    console.log('   • Ratio ideal: docs examinados ≈ docs retornados');
    console.log('   • Índices grandes (>1MB) revisar si son necesarios');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexión cerrada');
    }
    process.exit(0);
  }
}

main();
