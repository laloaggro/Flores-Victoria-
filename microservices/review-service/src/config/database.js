const { MongoClient } = require('mongodb');
const logger = require('../logger.simple');
const config = require('./index');

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
    logger.error('Error conectando a MongoDB', { error });
    throw error;
  }
};

module.exports = {
  connectToDatabase,
};
