#!/usr/bin/env node

/**
 * Unifica imágenes de productos
 * Prioridad: AI-generadas > Watermarked originales
 */

const fs = require('fs').promises;
const path = require('path');

const SOURCES = [
  {
    name: 'AI HuggingFace',
    dir: 'frontend/images/products/generated-hf',
    cache: '.hf-generated-cache.json',
    priority: 1,
  },
  {
    name: 'Watermarked',
    dir: 'frontend/images/products/watermarked',
    cache: null,
    priority: 2,
  },
];

const OUTPUT_DIR = 'frontend/images/products/final';

async function main() {
  console.log('🎨 Unificando imágenes de productos\n');
  console.log('='.repeat(70));

  // Crear directorio de salida
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Obtener productos
  console.log('\n📡 Obteniendo productos...\n');
  const response = await fetch('http://localhost:3000/api/products?limit=100');
  const data = await response.json();
  const products = data.products || data.data || data;

  console.log(`📦 Total productos: ${products.length}\n`);

  // Recolectar imágenes disponibles
  const imageMap = new Map();

  for (const source of SOURCES) {
    console.log(`🔍 Buscando en: ${source.name}`);

    try {
      const files = await fs.readdir(source.dir);
      const pngFiles = files.filter((f) => f.endsWith('.png'));

      console.log(`   ✅ ${pngFiles.length} imágenes encontradas`);

      for (const file of pngFiles) {
        const productId = file.split('-')[0]; // VAR011-hash.png -> VAR011

        if (!imageMap.has(productId) || imageMap.get(productId).priority > source.priority) {
          imageMap.set(productId, {
            productId,
            source: source.name,
            file,
            path: path.join(source.dir, file),
            priority: source.priority,
          });
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Directorio no encontrado: ${source.dir}`);
    }
  }

  console.log(`\n📊 Imágenes disponibles: ${imageMap.size}/${products.length}\n`);

  // Copiar imágenes al directorio final
  let copied = 0;
  let aiGenerated = 0;
  let watermarked = 0;
  let missing = [];

  for (const product of products) {
    const image = imageMap.get(product.id);

    if (image) {
      const destFile = `${product.id}.png`;
      const destPath = path.join(OUTPUT_DIR, destFile);

      await fs.copyFile(image.path, destPath);

      if (image.source === 'AI HuggingFace') {
        aiGenerated++;
      } else {
        watermarked++;
      }

      copied++;
      console.log(`✅ ${product.id.padEnd(8)} ${image.source.padEnd(20)} → ${destFile}`);
    } else {
      missing.push(product.id);
      console.log(`❌ ${product.id.padEnd(8)} SIN IMAGEN`);
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RESUMEN:\n');
  console.log(
    `🎨 AI Generadas:        ${aiGenerated} (${Math.round((aiGenerated / products.length) * 100)}%)`
  );
  console.log(
    `🔖 Watermarked:         ${watermarked} (${Math.round((watermarked / products.length) * 100)}%)`
  );
  console.log(`✅ Total copiadas:      ${copied}/${products.length}`);

  if (missing.length > 0) {
    console.log(`\n⚠️  Sin imagen (${missing.length}):`);
    missing.forEach((id) => console.log(`   - ${id}`));
  }

  console.log(`\n📁 Imágenes finales en: ${OUTPUT_DIR}`);
  console.log(`\n💡 Todas las imágenes tienen doble marca de agua (logo.svg)`);
  console.log(`   - Centrada: 50% ancho, 25% opacidad`);
  console.log(`   - Esquina: 80px, 100% opacidad\n`);
}

main().catch(console.error);
