#!/usr/bin/env node
/**
 * Script para poblar MongoDB con productos desde products.json
 * Uso: node scripts/seed-mongodb-products.js
 */

const fs = require('fs');
const path = require('path');

// Leer productos del JSON
const productsPath = path.join(__dirname, '../frontend/public/assets/mock/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`📦 Encontrados ${productsData.length} productos para migrar`);

// Transformar productos al esquema de MongoDB
const transformedProducts = productsData.map((product) => {
  // Generar slug del nombre
  const slug = product.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return {
    name: product.name,
    slug: slug,
    description: product.description || '',
    price: product.price,
    category: product.category || 'sin-categoria',
    images: [product.image_url || '/images/products/placeholder.webp'],
    stock: product.stock || 10,
    featured: product.featured || false,
    active: true,
    metadata: {
      occasion: product.occasion || null,
      color: product.color || null,
      size: product.size || 'medium',
      originalId: product.id
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
});

// Generar script de MongoDB
const mongoScript = `
// Script generado automáticamente - Seed de productos
// Ejecutar en MongoDB Railway

db = db.getSiblingDB('flores-victoria');

// Limpiar colección existente (opcional)
// db.products.deleteMany({});

// Insertar productos
const products = ${JSON.stringify(transformedProducts, null, 2)};

db.products.insertMany(products);

print('✅ Insertados ' + products.length + ' productos en MongoDB');

// Crear índices si no existen
db.products.createIndex({ name: 1 });
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ featured: 1 });
db.products.createIndex({ active: 1 });
db.products.createIndex({ createdAt: -1 });

print('✅ Índices creados');

// Mostrar estadísticas
print('📊 Total de productos: ' + db.products.countDocuments());
print('📊 Productos por categoría:');
db.products.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).forEach(doc => print('   - ' + doc._id + ': ' + doc.count));

print('✅ Base de datos poblada exitosamente!');
`;

// Guardar script
const scriptPath = path.join(__dirname, 'mongo-seed-products.js');
fs.writeFileSync(scriptPath, mongoScript);

console.log(`✅ Script generado: ${scriptPath}`);
console.log(`\n📋 Para ejecutar en Railway MongoDB:`);
console.log(`\n1. Conectarse a MongoDB:`);
console.log(`   railway connect mongodb`);
console.log(`\n2. Ejecutar el script:`);
console.log(`   mongosh --eval "load('${scriptPath}')"`);
console.log(`\n   O copiar el contenido y ejecutar directamente en mongosh\n`);

// También generar versión para Node.js con Mongoose
const nodeScript = `
/**
 * Seed script usando Mongoose
 * Ejecutar: node scripts/seed-products-mongoose.js
 */
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flores-victoria';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  images: [String],
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  metadata: {
    occasion: String,
    color: String,
    size: String,
    originalId: Number
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const products = ${JSON.stringify(transformedProducts, null, 2)};

async function seedProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar productos existentes (opcional)
    // await Product.deleteMany({});
    // console.log('🗑️  Productos existentes eliminados');

    // Insertar productos
    const result = await Product.insertMany(products, { ordered: false });
    console.log(\`✅ Insertados \${result.length} productos\`);

    // Mostrar estadísticas
    const total = await Product.countDocuments();
    console.log(\`📊 Total de productos en DB: \${total}\`);

    const byCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 Productos por categoría:');
    byCategory.forEach(doc => {
      console.log(\`   - \${doc._id}: \${doc.count}\`);
    });

    await mongoose.connection.close();
    console.log('✅ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

seedProducts();
`;

const nodeScriptPath = path.join(__dirname, 'seed-products-mongoose.js');
fs.writeFileSync(nodeScriptPath, nodeScript);

console.log(`✅ Script Node.js generado: ${nodeScriptPath}`);
console.log(`\n🚀 Para ejecutar con Node.js:`);
console.log(`   export MONGODB_URI="tu-mongo-url"`);
console.log(`   node ${nodeScriptPath}\n`);
