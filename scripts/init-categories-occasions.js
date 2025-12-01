#!/usr/bin/env node
/**
 * Script para inicializar categorías y ocasiones desde productos existentes
 * Ejecutar: node scripts/init-categories-occasions.js
 */

const mongoose = require('mongoose');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:HoFFbonUYMSFQnyLHsPfrpciKyLWvClr@mongodb.railway.internal:27017';

// Schemas
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const occasionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  id: String,
  category: String,
  occasions: [String],
});

const Category = mongoose.model('Category', categorySchema);
const Occasion = mongoose.model('Occasion', occasionSchema);
const Product = mongoose.model('Product', productSchema);

// Mapeo de categorías a descripciones amigables
const categoryDescriptions = {
  'rosas': 'Hermosas rosas en diversas presentaciones y colores',
  'tulipanes': 'Elegantes tulipanes frescos importados',
  'orquideas': 'Orquídeas exóticas de larga duración',
  'girasoles': 'Radiantes girasoles que transmiten alegría',
  'arreglos': 'Arreglos florales personalizados para toda ocasión',
  'bouquets': 'Bouquets especiales elaborados con las mejores flores',
  'lirios': 'Lirios frescos con fragancia delicada',
  'coronas': 'Coronas fúnebres y de condolencias',
  'centros': 'Centros de mesa decorativos',
  'cajas': 'Flores presentadas en elegantes cajas',
  'kits': 'Kits de regalo especiales con flores y más',
  'baby': 'Arreglos especiales para celebrar nacimientos',
  'tropicales': 'Flores tropicales exóticas',
  'suculentas': 'Jardines de suculentas de bajo mantenimiento',
  'corporativos': 'Arreglos florales para oficinas y eventos',
};

// Mapeo de ocasiones
const occasionDescriptions = {
  'cumpleaños': 'Celebra un cumpleaños especial con flores',
  'amor': 'Expresa tu amor con el regalo perfecto',
  'aniversario': 'Celebra años juntos con flores románticas',
  'graduacion': 'Felicita al graduado con un hermoso arreglo',
  'nacimiento': 'Da la bienvenida al nuevo bebé',
  'condolencias': 'Expresa tus condolencias con respeto',
  'dia-de-la-madre': 'Homenajea a mamá en su día especial',
  'recuperacion': 'Desea pronta recuperación',
  'agradecimiento': 'Agradece con flores',
  'boda': 'Flores para el día más especial',
  'navidad': 'Decoraciones florales navideñas',
  'san-valentin': 'Celebra el amor en San Valentín',
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function initializeCategoriesAndOccasions() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener todas las categorías únicas de productos
    console.log('📦 Obteniendo categorías de productos existentes...');
    const products = await Product.find({}, { category: 1, occasions: 1 });
    
    const uniqueCategories = new Set();
    const uniqueOccasions = new Set();

    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category.toLowerCase().trim());
      }
      if (product.occasions && Array.isArray(product.occasions)) {
        product.occasions.forEach(occasion => {
          if (occasion) {
            uniqueOccasions.add(occasion.toLowerCase().trim());
          }
        });
      }
    });

    console.log(`   Encontradas ${uniqueCategories.size} categorías únicas`);
    console.log(`   Encontradas ${uniqueOccasions.size} ocasiones únicas\n`);

    // Insertar categorías
    console.log('📁 Insertando categorías...');
    let categoriesCreated = 0;
    let categoriesSkipped = 0;

    for (const categoryName of uniqueCategories) {
      const slug = slugify(categoryName);
      const description = categoryDescriptions[categoryName] || `Categoría: ${categoryName}`;

      try {
        await Category.findOneAndUpdate(
          { slug },
          {
            name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
            slug,
            description,
            active: true,
          },
          { upsert: true, new: true }
        );
        console.log(`   ✓ ${categoryName}`);
        categoriesCreated++;
      } catch (error) {
        if (error.code === 11000) {
          categoriesSkipped++;
        } else {
          console.error(`   ✗ Error en ${categoryName}:`, error.message);
        }
      }
    }

    console.log(`\n   Creadas/Actualizadas: ${categoriesCreated}`);
    console.log(`   Omitidas (ya existían): ${categoriesSkipped}\n`);

    // Insertar ocasiones
    console.log('🎉 Insertando ocasiones...');
    let occasionsCreated = 0;
    let occasionsSkipped = 0;

    for (const occasionName of uniqueOccasions) {
      const slug = slugify(occasionName);
      const description = occasionDescriptions[slug] || `Ocasión: ${occasionName}`;

      try {
        await Occasion.findOneAndUpdate(
          { slug },
          {
            name: occasionName.charAt(0).toUpperCase() + occasionName.slice(1),
            slug,
            description,
            active: true,
          },
          { upsert: true, new: true }
        );
        console.log(`   ✓ ${occasionName}`);
        occasionsCreated++;
      } catch (error) {
        if (error.code === 11000) {
          occasionsSkipped++;
        } else {
          console.error(`   ✗ Error en ${occasionName}:`, error.message);
        }
      }
    }

    console.log(`\n   Creadas/Actualizadas: ${occasionsCreated}`);
    console.log(`   Omitidas (ya existían): ${occasionsSkipped}\n`);

    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ INICIALIZACIÓN COMPLETA');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`📁 Categorías en BD: ${await Category.countDocuments()}`);
    console.log(`🎉 Ocasiones en BD: ${await Occasion.countDocuments()}`);
    console.log('════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar
initializeCategoriesAndOccasions();
