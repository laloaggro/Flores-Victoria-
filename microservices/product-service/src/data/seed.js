const mongoose = require('mongoose');

const Category = require('../models/Category');
const Occasion = require('../models/Occasion');
const Product = require('../models/Product');

const { initialProducts, categories, occasions } = require('./initial-products');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando población de la base de datos...');

    // Limpiar colecciones existentes
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Occasion.deleteMany({});

    console.log('🗑️  Colecciones limpiadas');

    // Insertar categorías
    console.log('📂 Insertando categorías...');
    await Category.insertMany(categories);
    console.log(`✅ ${categories.length} categorías insertadas`);

    // Insertar ocasiones
    console.log('🎉 Insertando ocasiones...');
    await Occasion.insertMany(occasions);
    console.log(`✅ ${occasions.length} ocasiones insertadas`);

    // Insertar productos
    console.log('🌸 Insertando productos...');
    await Product.insertMany(initialProducts);
    console.log(`✅ ${initialProducts.length} productos insertados`);

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE DATOS INSERTADOS:');
    console.log('=====================================');

    const productsByCategory = await Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
    ]);

    productsByCategory.forEach((cat) => {
      console.log(
        `📁 ${cat._id}: ${cat.count} productos (Precio promedio: $${Math.round(cat.avgPrice).toLocaleString('es-CL')} CLP)`
      );
    });

    const featuredCount = await Product.countDocuments({ featured: true, active: true });
    const totalStock = await Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: null, totalStock: { $sum: '$stock' } } },
    ]);

    console.log(`\n⭐ Productos destacados: ${featuredCount}`);
    console.log(`📦 Stock total: ${totalStock[0]?.totalStock || 0} unidades`);

    const priceRange = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    if (priceRange[0]) {
      console.log(
        `💰 Rango de precios: $${priceRange[0].minPrice.toLocaleString('es-CL')} - $${priceRange[0].maxPrice.toLocaleString('es-CL')} CLP`
      );
      console.log(
        `📈 Precio promedio: $${Math.round(priceRange[0].avgPrice).toLocaleString('es-CL')} CLP`
      );
    }

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    return true;
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    throw error;
  }
}

// Si este archivo se ejecuta directamente
if (require.main === module) {
  // Conectar a MongoDB y ejecutar seed
  const MONGODB_URI =
    process.env.PRODUCT_SERVICE_MONGODB_URI ||
    process.env.MONGODB_URI ||
    'mongodb://mongodb:27017/flores-victoria';

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('🔗 Conectado a MongoDB');
      return seedDatabase();
    })
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
