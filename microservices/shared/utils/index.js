/**
 * @fileoverview Utils module exports
 */

const logger = require('./logger');
const resilientHttp = require('./resilient-http');

module.exports = {
  ...logger,
  ...resilientHttp,
  ResilientHttpClient: resilientHttp.ResilientHttpClient,
  createServiceClient: resilientHttp.createServiceClient,
  serviceClients: resilientHttp.serviceClients,
};
