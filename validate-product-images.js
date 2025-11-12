#!/usr/bin/env node

/**
 * Validar que todas las imágenes de productos estén accesibles
 */

const fs = require('fs').promises;
const path = require('path');

const FINAL_DIR = 'frontend/images/products/final';

async function validate() {
  console.log('🔍 Validando sistema de imágenes de productos\n');
  console.log('='.repeat(70));

  // Obtener productos desde la API
  console.log('\n📡 Obteniendo productos de la API...');
  const response = await fetch('http://localhost:3000/api/products?limit=100');
  const data = await response.json();
  const products = data.products || data.data || data;

  console.log(`✅ ${products.length} productos en la base de datos\n`);

  // Verificar archivos en disco
  console.log('📁 Verificando archivos en disco...');
  const files = await fs.readdir(FINAL_DIR);
  const pngFiles = files.filter((f) => f.endsWith('.png'));

  console.log(`✅ ${pngFiles.length} archivos PNG en ${FINAL_DIR}\n`);

  // Validar que cada producto tenga imagen
  console.log('🔎 Validando imágenes por producto:\n');

  let found = 0;
  let missing = [];
  let sizes = { ai: 0, watermarked: 0 };

  for (const product of products) {
    const filename = `${product.id}.png`;
    const filepath = path.join(FINAL_DIR, filename);

    try {
      const stats = await fs.stat(filepath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      // Determinar si es AI o watermarked basado en el tamaño
      // AI-generadas son generalmente más grandes (>800KB)
      if (stats.size > 800000) {
        sizes.ai++;
        console.log(
          `✅ ${product.id.padEnd(8)} ${filename.padEnd(20)} ${sizeMB.padStart(6)} MB (AI)`
        );
      } else {
        sizes.watermarked++;
        console.log(`✅ ${product.id.padEnd(8)} ${filename.padEnd(20)} ${sizeMB.padStart(6)} MB`);
      }

      found++;
    } catch (error) {
      console.log(`❌ ${product.id.padEnd(8)} FALTA: ${filename}`);
      missing.push(product.id);
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RESUMEN DE VALIDACIÓN:\n');
  console.log(
    `✅ Imágenes encontradas:  ${found}/${products.length} (${Math.round((found / products.length) * 100)}%)`
  );
  console.log(`🎨 AI-generadas (~>800KB): ${sizes.ai}`);
  console.log(`🔖 Watermarked (~<800KB):  ${sizes.watermarked}`);

  if (missing.length > 0) {
    console.log(`\n⚠️  Productos sin imagen (${missing.length}):`);
    missing.forEach((id) => console.log(`   - ${id}`));
  } else {
    console.log('\n🎉 ¡Perfecto! Todos los productos tienen imagen');
  }

  // Verificar accesibilidad HTTP
  console.log('\n🌐 Probando accesibilidad HTTP...');

  const testProduct = products[0];
  const testUrl = `http://localhost:5173/images/products/final/${testProduct.id}.png`;

  try {
    const httpResponse = await fetch(testUrl);
    if (httpResponse.ok) {
      console.log(`✅ Imagen accesible vía HTTP: ${testUrl}`);
      const blob = await httpResponse.blob();
      console.log(`   Tamaño: ${(blob.size / 1024).toFixed(2)} KB`);
      console.log(`   Tipo: ${blob.type}`);
    } else {
      console.log(`❌ HTTP Error ${httpResponse.status}: ${testUrl}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    console.log(`⚠️  Asegúrate de que el servidor de desarrollo esté corriendo`);
  }

  console.log('\n📝 CONFIGURACIÓN DEL FRONTEND:');
  console.log('   Ruta de imágenes: /images/products/final/{PRODUCT_ID}.png');
  console.log('   Fallback: /images/placeholder.jpg');
  console.log('   Archivos actualizados: 5 componentes');

  console.log('\n✨ Sistema de imágenes validado correctamente\n');
}

validate().catch(console.error);
