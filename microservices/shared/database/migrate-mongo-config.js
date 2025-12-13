/**
 * @fileoverview Configuración de migrate-mongo para MongoDB
 * @description Configuración para migraciones de MongoDB
 * @version 3.0.0
 */

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27018/flores_db',
    databaseName: process.env.MONGODB_DB || 'flores_db',
    options: {},
  },

  migrationsDir: 'migrations/mongo',
  changelogCollectionName: 'migrations_changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};
