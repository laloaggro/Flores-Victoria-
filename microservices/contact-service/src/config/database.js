const { MongoClient } = require('mongodb');
const logger = require('../logger.simple');
const config = require('./index');

let dbInstance = null;

// Conectar a MongoDB
async function connectToDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const client = new MongoClient(config.database.uri);

    await client.connect();
    logger.info({ service: 'contact-service' }, 'Conexión a MongoDB establecida correctamente');

    dbInstance = client.db('contactdb');
    return dbInstance;
  } catch (error) {
    logger.error({ service: 'contact-service', error }, 'Error conectando a MongoDB');
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
