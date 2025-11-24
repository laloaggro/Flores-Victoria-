#!/usr/bin/env node

/**
 * Script para validar y corregir rutas de imágenes en products.json
 * Actualiza las rutas a imágenes que existan o usa placeholder
 */

const fs = require('fs');
const path = require('path');

// Configuración
const PRODUCTS_FILE = path.join(__dirname, 'frontend', 'public', 'assets', 'mock', 'products.json');
const PLACEHOLDER = '/images/placeholder-product.jpg';

console.log('🔍 Validando imágenes de productos...\n');

// Leer products.json
const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
let updatedCount = 0;
let validCount = 0;

// Verificar cada producto
productsData.forEach((product) => {
  const imagePath = product.image_url || product.image;

  if (!imagePath) {
    console.log(`⚠️  Producto ${product.id} (${product.name}) - Sin imagen definida`);
    product.image_url = PLACEHOLDER;
    updatedCount++;
    return;
  }

  // Convertir ruta a path del sistema
  const fullPath = path.join(__dirname, 'frontend', imagePath);

  // Verificar si existe
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Producto ${product.id} - Imagen no encontrada: ${imagePath}`);

    // Buscar alternativa en final/ con múltiples extensiones
    const imageName = path.basename(imagePath, path.extname(imagePath));
    const extensions = ['.webp', '.jpg', '.jpeg', '.png'];
    let found = false;

    for (const ext of extensions) {
      const alternativePath = `/images/products/final/${imageName}${ext}`;
      const alternativeFullPath = path.join(__dirname, 'frontend', alternativePath);

      if (fs.existsSync(alternativeFullPath)) {
        console.log(`   ✅ Usando alternativa: ${alternativePath}`);
        product.image_url = alternativePath;
        updatedCount++;
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`   📦 Usando placeholder`);
      product.image_url = PLACEHOLDER;
      updatedCount++;
    }
  } else {
    validCount++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Imágenes válidas: ${validCount}`);
console.log(`   🔧 Imágenes actualizadas: ${updatedCount}`);
console.log(`   📦 Total de productos: ${productsData.length}`);

// Guardar cambios
if (updatedCount > 0) {
  const backupPath = `${PRODUCTS_FILE}.backup`;
  fs.copyFileSync(PRODUCTS_FILE, backupPath);
  console.log(`\n💾 Backup creado: ${path.basename(backupPath)}`);

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 2), 'utf8');
  console.log(`✅ Archivo actualizado: products.json`);
} else {
  console.log(`\n✨ Todas las imágenes están correctas.`);
}
