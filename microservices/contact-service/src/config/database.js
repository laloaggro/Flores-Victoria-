const { MongoClient } = require('mongodb');

const config = require('./index');

let dbInstance = null;

// Conectar a MongoDB
async function connectToDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const client = new MongoClient(config.database.uri, {
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('Conexión a MongoDB establecida correctamente');

    dbInstance = client.db('contactdb');
    return dbInstance;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
}

// Obtener la instancia de la base de datos
function getDb() {
  if (!dbInstance) {
    throw new Error('Base de datos no inicializada. Llama a connectToDatabase primero.');
  }
  return dbInstance;
}

module.exports = {
  connectToDatabase,
  getDb,
};
