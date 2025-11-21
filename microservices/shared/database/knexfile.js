/**
 * @fileoverview Configuración de Knex para migraciones PostgreSQL
 * @description Configuración para manejo de migraciones y seeds en PostgreSQL
 * @version 3.0.0
 */

const path = require('path');

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5433,
      database: process.env.POSTGRES_DB || 'flores_db',
      user: process.env.POSTGRES_USER || 'flores_user',
      password: process.env.POSTGRES_PASSWORD || 'flores_password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations', 'postgres'),
      tableName: 'knex_migrations',
      extension: 'js',
      loadExtensions: ['.js'],
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations', 'postgres'),
      tableName: 'knex_migrations',
      extension: 'js',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5433,
      database: process.env.POSTGRES_TEST_DB || 'flores_test_db',
      user: process.env.POSTGRES_USER || 'flores_user',
      password: process.env.POSTGRES_PASSWORD || 'flores_password',
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations', 'postgres'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },
};
