// MongoDB initialization script for Flores Victoria

db = db.getSiblingDB('flores-victoria');

// Create collections
db.createCollection('products');
db.createCollection('orders');
db.createCollection('users');
db.createCollection('categories');

// Create indexes
db.products.createIndex({ name: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ createdAt: -1 });

db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.categories.createIndex({ slug: 1 }, { unique: true });

// Insert seed data
db.categories.insertMany([
  {
    _id: ObjectId(),
    name: 'Ramos de Flores',
    slug: 'ramos',
    description: 'Hermosos ramos para toda ocasión',
    active: true,
    createdAt: new Date(),
  },
  {
    _id: ObjectId(),
    name: 'Arreglos Florales',
    slug: 'arreglos',
    description: 'Arreglos personalizados',
    active: true,
    createdAt: new Date(),
  },
  {
    _id: ObjectId(),
    name: 'Plantas',
    slug: 'plantas',
    description: 'Plantas decorativas y de interior',
    active: true,
    createdAt: new Date(),
  },
]);

// Insert sample products
const categoryRamos = db.categories.findOne({ slug: 'ramos' })._id;

db.products.insertMany([
  {
    _id: ObjectId(),
    name: 'Ramo de Rosas Rojas',
    slug: 'ramo-rosas-rojas',
    description: 'Elegante ramo de 12 rosas rojas',
    price: 35000,
    category: categoryRamos,
    images: ['/images/products/rosas-rojas.webp'],
    stock: 50,
    featured: true,
    active: true,
    createdAt: new Date(),
  },
  {
    _id: ObjectId(),
    name: 'Ramo Primaveral',
    slug: 'ramo-primaveral',
    description: 'Mezcla de flores de temporada',
    price: 28000,
    category: categoryRamos,
    images: ['/images/products/primaveral.webp'],
    stock: 30,
    featured: true,
    active: true,
    createdAt: new Date(),
  },
]);

print('✅ MongoDB initialized with seed data');
