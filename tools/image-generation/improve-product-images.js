#!/usr/bin/env node

/**
 * Script mejorado para asignar imágenes basándose en nombres de productos
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'frontend', 'public', 'assets', 'mock', 'products.json');
const IMAGES_DIR = path.join(__dirname, 'frontend', 'images', 'products', 'final');
const PLACEHOLDER = '/images/placeholder-product.jpg';

console.log('🌸 Mejorando asignación de imágenes basado en nombres...\n');

// Leer productos
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

// Obtener imágenes disponibles
const availableImages = fs
  .readdirSync(IMAGES_DIR)
  .filter((file) => file.endsWith('.webp'))
  .map((file) => `/images/products/final/${file}`);

console.log(`📦 ${products.length} productos`);
console.log(`🖼️  ${availableImages.length} imágenes disponibles\n`);

// Mapeo mejorado por nombre/categoría
const smartMapping = {
  // Rosas
  rosas: ['PLT001', 'PLT002', 'PLT003', 'AML001', 'AML002', 'VAR001'],
  // Tulipanes
  tulipanes: ['PLT002', 'PLT003', 'SEA001', 'VAR002'],
  // Orquídeas
  orquideas: ['EXO001', 'EXO002', 'VAR003'],
  orquidea: ['EXO001', 'EXO002'],
  // Girasoles
  girasoles: ['PLT003', 'PLT004', 'VAR005'],
  girasol: ['PLT003', 'PLT004', 'VAR005'],
  // Lirios
  lirios: ['PLT004', 'PLT005', 'AML001', 'VAR006'],
  lirio: ['PLT004', 'PLT005'],
  // Margaritas
  margaritas: ['PLT001', 'PLT002', 'VAR007'],
  margarita: ['PLT001', 'VAR007'],
  // Gerberas
  gerberas: ['PLT001', 'PLT002', 'VAR012'],
  gerbera: ['PLT001', 'VAR012'],
  // Claveles
  claveles: ['PLT005', 'VAR013'],
  clavel: ['PLT005', 'VAR013'],
  // Hortensias
  hortensias: ['PLT004', 'VAR008'],
  hortensia: ['PLT004', 'VAR008'],
  // Mixtos
  mixtos: ['PLT001', 'PLT002', 'PLT003', 'VAR004', 'VAR010'],
  mixto: ['PLT001', 'PLT002', 'VAR004'],
  bouquet: ['PLT001', 'PLT002', 'PLT003', 'PLT004', 'PLT005'],
  bouquets: ['PLT001', 'PLT002', 'PLT003', 'PLT004', 'PLT005'],
  // Ocasiones
  cumpleaños: ['BDY001', 'BDY002', 'BDY003', 'BDY004', 'BDY005', 'VAR015'],
  cumpleanos: ['BDY001', 'BDY002', 'BDY003', 'BDY004', 'BDY005'],
  aniversario: ['AML001', 'AML002', 'AML003', 'SEA002'],
  aniversarios: ['AML001', 'AML002', 'AML003'],
  amor: ['AML001', 'AML002', 'AML003', 'AML004', 'AML005', 'VAR002'],
  graduacion: ['GRD001', 'GRD002'],
  graduaciones: ['GRD001', 'GRD002'],
  bebe: ['BBY001', 'BBY002', 'BBY003'],
  baby: ['BBY001', 'BBY002', 'BBY003'],
  boda: ['AML001', 'AML002', 'AML003', 'AML004'],
  bodas: ['AML001', 'AML002', 'AML003'],
  corporativo: ['CRP001', 'CRP002'],
  corporativos: ['CRP001', 'CRP002'],
  recuperacion: ['MIN001', 'MIN002', 'VAR014'],
  mama: ['VAR001', 'VAR009', 'VAR041'],
  // Suculentas y plantas
  suculenta: ['SUS001', 'SUS002', 'VAR003', 'VAR011', 'VAR043'],
  suculentas: ['SUS001', 'SUS002', 'VAR011'],
  planta: ['PLT001', 'PLT002', 'PLT003', 'PLT004', 'PLT005'],
  plantas: ['PLT001', 'PLT002', 'PLT003', 'PLT004', 'PLT005'],
  // Decoración
  decoracion: ['DEC001', 'DEC002'],
  decorativo: ['DEC001', 'DEC002'],
  // Amistad
  amistad: ['VAR004', 'VAR010', 'THX001', 'THX002'],
  // Funeral
  funeral: ['SYM001', 'SYM002'],
  funebres: ['SYM001', 'SYM002'],
};

let assignedCount = 0;
const usedImages = new Set();

products.forEach((product) => {
  const name = product.name.toLowerCase();
  const category = (product.category || '').toLowerCase();

  // Buscar coincidencias en el nombre del producto
  let matchingCodes = [];

  for (const [keyword, codes] of Object.entries(smartMapping)) {
    if (name.includes(keyword) || category.includes(keyword)) {
      matchingCodes.push(...codes);
    }
  }

  // Eliminar duplicados y buscar imagen disponible
  matchingCodes = [...new Set(matchingCodes)];

  let assigned = false;
  for (const code of matchingCodes) {
    const matchingImage = availableImages.find((img) => {
      const filename = path.basename(img, '.webp');
      return filename === code && !usedImages.has(img);
    });

    if (matchingImage) {
      product.image_url = matchingImage;
      usedImages.add(matchingImage);
      assignedCount++;
      assigned = true;
      console.log(`✅ "${product.name}" → ${path.basename(matchingImage)}`);
      break;
    }
  }

  if (!assigned) {
    // Usar cualquier imagen disponible
    const anyImage = availableImages.find((img) => !usedImages.has(img));
    if (anyImage) {
      product.image_url = anyImage;
      usedImages.add(anyImage);
      assignedCount++;
      console.log(`📌 "${product.name}" → ${path.basename(anyImage)} (genérica)`);
    } else {
      product.image_url = PLACEHOLDER;
      console.log(`📦 "${product.name}" → placeholder`);
    }
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Con imagen: ${assignedCount}`);
console.log(`   📦 Con placeholder: ${products.length - assignedCount}`);
console.log(`   🖼️  Imágenes usadas: ${usedImages.size}/${availableImages.length}`);

// Backup
const backupPath = `${PRODUCTS_FILE}.backup-${Date.now()}`;
fs.copyFileSync(PRODUCTS_FILE, backupPath);

// Guardar
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
console.log(`\n✅ Actualizado: products.json`);
console.log(`💾 Backup: ${path.basename(backupPath)}`);
