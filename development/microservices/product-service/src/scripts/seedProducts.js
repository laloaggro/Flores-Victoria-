const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:rootpassword@localhost:27018';
const DB_NAME = process.env.DB_NAME || 'products_db';

// Categorías de productos
const categories = [
  {
    id: 'bouquets',
    name: 'Ramos',
    description: 'Hermosos ramos de flores frescas para cualquier ocasión',
  },
  {
    id: 'arrangements',
    name: 'Arreglos Florales',
    description: 'Arreglos florales elaborados para eventos especiales',
  },
  {
    id: 'plants',
    name: 'Plantas',
    description: 'Plantas decorativas y de interior',
  },
  {
    id: 'decorations',
    name: 'Decoraciones',
    description: 'Decoraciones florales para eventos y ocasiones especiales',
  },
  {
    id: 'weddings',
    name: 'Bodas',
    description: 'Arreglos florales especiales para bodas',
  },
  {
    id: 'funerals',
    name: 'Funerales',
    description: 'Arreglos florales para ocasiones solemnes',
  },
];

// Productos de ejemplo realistas
const products = [
  // Ramos
  {
    name: 'Ramo de Rosas Rojas',
    description: 'Hermoso ramo de 12 rosas rojas frescas, símbolo de amor y pasión',
    price: 15000,
    category: 'bouquets',
    image_url: '/assets/images/products/bouquets.jpg',
    in_stock: true,
    stock_quantity: 25,
  },
  {
    name: 'Ramo de Tulipanes',
    description: 'Elegante ramo de tulipanes de colores variados, perfecto para primavera',
    price: 12000,
    category: 'bouquets',
    image_url: '/assets/images/products/bouquets.jpg',
    in_stock: true,
    stock_quantity: 20,
  },
  {
    name: 'Ramo de Girasoles',
    description: 'Alegre ramo de girasoles frescos que transmiten felicidad y energía',
    price: 10000,
    category: 'bouquets',
    image_url: '/assets/images/products/bouquets.jpg',
    in_stock: true,
    stock_quantity: 15,
  },
  {
    name: 'Ramo de Peonías',
    description: 'Exquisito ramo de peonías rosadas, símbolo de buena fortuna y honor',
    price: 18000,
    category: 'bouquets',
    image_url: '/assets/images/products/bouquets.jpg',
    in_stock: true,
    stock_quantity: 10,
  },

  // Arreglos florales
  {
    name: 'Arreglo Floral Premium',
    description: 'Arreglo floral con variedad de flores de temporada en jarrón de cristal',
    price: 25000,
    category: 'arrangements',
    image_url: '/assets/images/products/arrangements.jpg',
    in_stock: true,
    stock_quantity: 8,
  },
  {
    name: 'Centro de Mesa Romántico',
    description: 'Centro de mesa con rosas, tulipanes y baby breath en base de madera',
    price: 22000,
    category: 'arrangements',
    image_url: '/assets/images/products/arrangements.jpg',
    in_stock: true,
    stock_quantity: 12,
  },
  {
    name: 'Arreglo Cesta de Frutas y Flores',
    description: 'Cesta con flores frescas y frutas de temporada decoradas',
    price: 30000,
    category: 'arrangements',
    image_url: '/assets/images/products/arrangements.jpg',
    in_stock: true,
    stock_quantity: 5,
  },

  // Plantas
  {
    name: 'Orquídea Phalaenopsis',
    description: 'Orquídea blanca en maceta decorativa, símbolo de lujo y belleza',
    price: 16000,
    category: 'plants',
    image_url: '/assets/images/products/plants.jpg',
    in_stock: true,
    stock_quantity: 15,
  },
  {
    name: 'Planta de Interior Sansevieria',
    description: 'Planta de interior resistente con hojas verticales, purifica el aire',
    price: 8000,
    category: 'plants',
    image_url: '/assets/images/products/plants.jpg',
    in_stock: true,
    stock_quantity: 20,
  },

  // Decoraciones
  {
    name: 'Guirnalda Floral',
    description: 'Guirnalda con flores frescas y follaje para puertas y eventos',
    price: 12000,
    category: 'decorations',
    image_url: '/assets/images/products/decorations.jpg',
    in_stock: true,
    stock_quantity: 10,
  },
  {
    name: 'Pétalos de Rosa para Decoración',
    description: 'Pétalos de rosa roja para decorar mesas y caminos de eventos',
    price: 5000,
    category: 'decorations',
    image_url: '/assets/images/products/decorations.jpg',
    in_stock: true,
    stock_quantity: 50,
  },

  // Bodas
  {
    name: 'Arco Floral para Boda',
    description: 'Arco decorativo con flores frescas para ceremonia de boda',
    price: 80000,
    category: 'weddings',
    image_url: '/assets/images/products/arrangements.jpg',
    in_stock: true,
    stock_quantity: 3,
  },
  {
    name: 'Ramo de Novia Clásico',
    description: 'Ramo de novia con rosas blancas, lirios y baby breath',
    price: 25000,
    category: 'weddings',
    image_url: '/assets/images/products/bouquets.jpg',
    in_stock: true,
    stock_quantity: 6,
  },

  // Funerales
  {
    name: 'Corona de Flores',
    description: 'Corona de flores con crisantemos y lirios para ocasiones solemnes',
    price: 45000,
    category: 'funerals',
    image_url: '/assets/images/products/arrangements.jpg',
    in_stock: true,
    stock_quantity: 5,
  },
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Conectado a MongoDB');

    const db = client.db(DB_NAME);
    const productsCollection = db.collection('products');

    // Limpiar productos existentes
    await productsCollection.deleteMany({});
    console.log('Colección de productos limpiada');

    // Insertar productos
    const productsWithTimestamps = products.map((product) => ({
      ...product,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const result = await productsCollection.insertMany(productsWithTimestamps);
    console.log(`${result.insertedCount} productos insertados`);

    console.log('Base de datos poblada exitosamente');
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
  } finally {
    await client.close();
    console.log('Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, categories, products };
