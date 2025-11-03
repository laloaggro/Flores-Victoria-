/**
 * @flores-victoria/shared
 * Biblioteca compartida para microservicios
 */

const auth = require('./lib/auth');
const logger = require('./lib/logger');
const validators = require('./lib/validators');
const errors = require('./lib/errors');
const middleware = require('./lib/middleware');
const utils = require('./lib/utils');
const config = require('./lib/config');

module.exports = {
  auth,
  logger,
  validators,
  errors,
  middleware,
  utils,
  config,
};
