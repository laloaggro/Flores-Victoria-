const { MongoClient } = require('mongodb');

// Conectar a MongoDB
const mongoUri =
  process.env.MONGODB_URI ||
  'mongodb://admin:password@mongodb:27017/floresvictoria?authSource=admin';
const client = new MongoClient(mongoUri);

async function addTestProducts() {
  try {
    // Conectar a MongoDB
    await client.connect();
    console.log('Conectado a MongoDB');

    const db = client.db('floresvictoria');
    const productsCollection = db.collection('products');

    // Limpiar colección existente
    await productsCollection.deleteMany({});
    console.log('Colección de productos limpiada');

    // Definir productos de prueba
    const testProducts = [
      {
        name: 'Ramo Elegante de Rosas Blancas',
        description: 'Hermoso ramo de rosas blancas frescas, perfecto para ocasiones especiales.',
        price: 15000,
        image_url: '/assets/images/products/Ramo1.avif',
        category: 'Ramos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Romántico Ramo de Rosas Rosadas',
        description:
          'Encantador ramo de rosas rosadas con follaje decorativo, ideal para expresar amor.',
        price: 18000,
        image_url: '/assets/images/products/romantico-ramo-rosas-rosadas_191095-83984.avif',
        category: 'Ramos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Arreglo Floral Exótico',
        description:
          'Composición floral con flores exóticas y tropicales para decorar espacios especiales.',
        price: 25000,
        image_url:
          '/assets/images/products/Bouquet De Rosa Blanca Con Tallos Y Elegantes Arreglos Florales.webp',
        category: 'Arreglos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Ramo Colorido de Flores Silvestres',
        description: 'Precioso ramo con una variedad de flores silvestres en tonos vibrantes.',
        price: 12000,
        image_url: '/assets/images/products/1.avif',
        category: 'Ramos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Arreglo de Girasoles y Rosas',
        description:
          'Alegre combinación de girasoles y rosas amarillas para iluminar cualquier espacio.',
        price: 20000,
        image_url: '/assets/images/products/2.avif',
        category: 'Arreglos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insertar productos en MongoDB
    const result = await productsCollection.insertMany(testProducts);
    console.log(`Insertados ${result.insertedCount} productos de prueba en MongoDB`);

    // Cerrar conexión
    await client.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('Error al insertar productos de prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la función
addTestProducts();
