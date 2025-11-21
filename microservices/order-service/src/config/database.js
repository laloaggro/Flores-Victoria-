const { Pool } = require('pg');

const config = require('./index');
const logger = require('../logger');

// Crear pool de conexiones a PostgreSQL
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20, // máximo número de conexiones
  idleTimeoutMillis: 30000, // tiempo de inactividad antes de cerrar conexión
  connectionTimeoutMillis: 2000, // tiempo de espera para conexión
});

// Verificar conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error({ service: 'order-service', err: err.stack }, 'Error conectando a la base de datos');
  } else {
    logger.info({ service: 'order-service' }, 'Conexión a la base de datos establecida correctamente');
  }
});

module.exports = pool;
