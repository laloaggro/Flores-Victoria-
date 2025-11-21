const { Client } = require('pg');

const config = require('./index');
const logger = require('../logger');

// Configurar cliente de PostgreSQL
const client = new Client({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
});

// Función para conectar a la base de datos
const connect = async () => {
  try {
    await client.connect();
    logger.info({ service: 'user-service' }, 'Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    logger.error({ service: 'user-service', error }, 'Error conectando a PostgreSQL');
    throw error;
  }
};

// Función para desconectar de la base de datos
const disconnect = async () => {
  try {
    await client.end();
    logger.info({ service: 'user-service' }, 'Conexión a PostgreSQL cerrada correctamente');
  } catch (error) {
    logger.error({ service: 'user-service', error }, 'Error cerrando conexión a PostgreSQL');
    throw error;
  }
};

module.exports = {
  client,
  connect,
  disconnect,
};
