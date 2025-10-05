const sqlite3 = require('sqlite3').verbose();
const { MongoClient } = require('mongodb');
const path = require('path');

// Conectar a SQLite
const dbPath = path.join(__dirname, 'products.db');
const sqliteDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos SQLite:', err.message);
    process.exit(1);
  } else {
    console.log('Conectado a la base de datos SQLite de productos');
  }
});

// Conectar a MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/floresvictoria?authSource=admin';
const client = new MongoClient(mongoUri);

async function migrateProducts() {
  try {
    // Conectar a MongoDB
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db('floresvictoria');
    const productsCollection = db.collection('products');
    
    // Limpiar colección existente
    await productsCollection.deleteMany({});
    console.log('Colección de productos limpiada');
    
    // Obtener productos de SQLite
    sqliteDb.all('SELECT * FROM products', async (err, rows) => {
      if (err) {
        console.error('Error al obtener productos de SQLite:', err.message);
        return;
      }
      
      // Convertir productos al formato de MongoDB
      const products = rows.map(row => ({
        name: row.name,
        description: row.description,
        price: row.price,
        image_url: row.image_url,
        category: row.category,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      // Insertar productos en MongoDB
      if (products.length > 0) {
        const result = await productsCollection.insertMany(products);
        console.log(`Migrados ${result.insertedCount} productos a MongoDB`);
      } else {
        console.log('No hay productos para migrar');
      }
      
      // Cerrar conexiones
      sqliteDb.close();
      await client.close();
      console.log('Migración completada');
    });
  } catch (error) {
    console.error('Error durante la migración:', error.message);
    process.exit(1);
  }
}

// Ejecutar migración
migrateProducts();