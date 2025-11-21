const { MongoClient } = require('mongodb');

const config = require('./index');
const logger = require('../logger');

let dbInstance = null;

// Conectar a MongoDB
const connectToDatabase = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const client = new MongoClient(config.database.uri);
    await client.connect();

    dbInstance = client.db('reviews_db');
    logger.info({ service: 'review-service' }, 'Conexión a MongoDB establecida correctamente');

    return dbInstance;
  } catch (error) {
    logger.error({ service: 'review-service', error }, 'Error conectando a MongoDB');
    throw error;
  }
};

module.exports = {
  connectToDatabase,
};
