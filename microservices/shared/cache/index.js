/**
 * @fileoverview Cache module exports
 */

const config = require('./config');
const redisCache = require('./redis-cache');

module.exports = {
  ...config,
  ...redisCache,
};
