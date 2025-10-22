const { Client } = require('pg');

const config = require('./index');

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
    console.log('Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error);
    throw error;
  }
};

// Función para desconectar de la base de datos
const disconnect = async () => {
  try {
    await client.end();
    console.log('Conexión a PostgreSQL cerrada correctamente');
  } catch (error) {
    console.error('Error cerrando conexión a PostgreSQL:', error);
    throw error;
  }
};

module.exports = {
  client,
  connect,
  disconnect,
};
