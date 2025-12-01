/**
 * Admin routes for Product Service
 */

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Occasion = require('../models/Occasion');
const Product = require('../models/Product');
const logger = require('../utils/logger');

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

/**
 * POST /api/products/admin/init-collections
 * Initialize Categories and Occasions from existing products
 */
router.post('/init-collections', async (req, res) => {
  try {
    logger.info({ service: 'product-service' }, 'Iniciando inicialización de colecciones');

    // Obtener todas las categorías y ocasiones únicas de productos
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

    logger.info({ 
      categoriesCount: uniqueCategories.size,
      occasionsCount: uniqueOccasions.size,
      service: 'product-service'
    }, 'Categorías y ocasiones únicas encontradas');

    // Insertar categorías
    let categoriesCreated = 0;
    let categoriesSkipped = 0;
    const categoryResults = [];

    for (const categoryName of uniqueCategories) {
      const slug = slugify(categoryName);
      const description = categoryDescriptions[categoryName] || `Categoría: ${categoryName}`;

      try {
        const category = await Category.findOneAndUpdate(
          { slug },
          {
            name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
            slug,
            description,
            active: true,
          },
          { upsert: true, new: true }
        );
        categoryResults.push({ name: categoryName, status: 'created', id: category._id });
        categoriesCreated++;
      } catch (error) {
        if (error.code === 11000) {
          categoryResults.push({ name: categoryName, status: 'existed' });
          categoriesSkipped++;
        } else {
          categoryResults.push({ name: categoryName, status: 'error', error: error.message });
          logger.error({ error: error.message, category: categoryName }, 'Error creando categoría');
        }
      }
    }

    // Insertar ocasiones
    let occasionsCreated = 0;
    let occasionsSkipped = 0;
    const occasionResults = [];

    for (const occasionName of uniqueOccasions) {
      const slug = slugify(occasionName);
      const description = occasionDescriptions[slug] || `Ocasión: ${occasionName}`;

      try {
        const occasion = await Occasion.findOneAndUpdate(
          { slug },
          {
            name: occasionName.charAt(0).toUpperCase() + occasionName.slice(1),
            slug,
            description,
            active: true,
          },
          { upsert: true, new: true }
        );
        occasionResults.push({ name: occasionName, status: 'created', id: occasion._id });
        occasionsCreated++;
      } catch (error) {
        if (error.code === 11000) {
          occasionResults.push({ name: occasionName, status: 'existed' });
          occasionsSkipped++;
        } else {
          occasionResults.push({ name: occasionName, status: 'error', error: error.message });
          logger.error({ error: error.message, occasion: occasionName }, 'Error creando ocasión');
        }
      }
    }

    const totalCategories = await Category.countDocuments();
    const totalOccasions = await Occasion.countDocuments();

    logger.info({
      categoriesCreated,
      categoriesSkipped,
      occasionsCreated,
      occasionsSkipped,
      totalCategories,
      totalOccasions,
      service: 'product-service'
    }, 'Inicialización completada');

    res.status(200).json({
      success: true,
      message: 'Colecciones inicializadas correctamente',
      summary: {
        categories: {
          created: categoriesCreated,
          skipped: categoriesSkipped,
          total: totalCategories,
        },
        occasions: {
          created: occasionsCreated,
          skipped: occasionsSkipped,
          total: totalOccasions,
        },
      },
      details: {
        categories: categoryResults,
        occasions: occasionResults,
      }
    });

  } catch (error) {
    logger.error({ error: error.message, service: 'product-service' }, 'Error en inicialización');
    res.status(500).json({
      success: false,
      error: 'Error inicializando colecciones',
      details: error.message
    });
  }
});

module.exports = router;
