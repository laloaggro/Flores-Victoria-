#!/usr/bin/env node

/**
 * Script para asignar imágenes WebP disponibles a productos
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'frontend', 'public', 'assets', 'mock', 'products.json');
const IMAGES_DIR = path.join(__dirname, 'frontend', 'images', 'products', 'final');
const PLACEHOLDER = '/images/placeholder-product.jpg';

console.log('🌸 Asignando imágenes a productos...\n');

// Leer productos
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

// Obtener todas las imágenes WebP disponibles
const availableImages = fs
  .readdirSync(IMAGES_DIR)
  .filter((file) => file.endsWith('.webp'))
  .map((file) => `/images/products/final/${file}`);

console.log(`📦 ${products.length} productos encontrados`);
console.log(`🖼️  ${availableImages.length} imágenes disponibles\n`);

// Mapeo de categorías a códigos de imagen
const categoryMapping = {
  rosas: 'PLT',
  tulipanes: 'PLT',
  lirios: 'PLT',
  orquideas: 'EXO',
  girasoles: 'PLT',
  margaritas: 'PLT',
  gerberas: 'PLT',
  claveles: 'PLT',
  hortensias: 'PLT',
  mixtos: 'PLT',
  cumpleanos: 'BDY',
  aniversario: 'AML',
  amor: 'AML',
  graduacion: 'GRD',
  bebe: 'BBY',
  corporativo: 'CRP',
  recuperacion: 'MIN',
  decoracion: 'DEC',
};

// Asignar imágenes a productos
let assignedCount = 0;
let usedImages = new Set();

products.forEach((product, index) => {
  // Intentar encontrar una imagen basada en la categoría
  const category = product.category || '';
  const prefix = categoryMapping[category.toLowerCase()] || 'PLT';

  // Buscar imagen disponible con ese prefijo
  const matchingImage = availableImages.find((img) => {
    const filename = path.basename(img);
    return filename.startsWith(prefix) && !usedImages.has(img);
  });

  if (matchingImage) {
    product.image_url = matchingImage;
    usedImages.add(matchingImage);
    assignedCount++;
    console.log(
      `✅ Producto ${product.id} (${product.category || 'sin categoría'}): ${path.basename(matchingImage)}`
    );
  } else {
    // Si no hay imagen específica, usar cualquier imagen disponible
    const anyImage = availableImages.find((img) => !usedImages.has(img));
    if (anyImage) {
      product.image_url = anyImage;
      usedImages.add(anyImage);
      assignedCount++;
      console.log(
        `📌 Producto ${product.id} (${product.category || 'sin categoría'}): ${path.basename(anyImage)}`
      );
    } else {
      product.image_url = PLACEHOLDER;
      console.log(`📦 Producto ${product.id}: Usando placeholder (sin imágenes disponibles)`);
    }
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Productos con imagen: ${assignedCount}`);
console.log(`   📦 Productos con placeholder: ${products.length - assignedCount}`);
console.log(`   🖼️  Imágenes usadas: ${usedImages.size} de ${availableImages.length}`);

// Crear backup
const backupPath = `${PRODUCTS_FILE}.backup`;
fs.copyFileSync(PRODUCTS_FILE, backupPath);
console.log(`\n💾 Backup creado: products.json.backup`);

// Guardar
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
console.log(`✅ Archivo actualizado: products.json`);
console.log(`\n🎉 ¡Listo! Recarga la página para ver las imágenes.`);
