/**
 * @fileoverview Utils module exports
 */

const logger = require('./logger');
const resilientHttp = require('./resilient-http');
const cursorPagination = require('./cursor-pagination');

module.exports = {
  ...logger,
  ...resilientHttp,
  ...cursorPagination,
  ResilientHttpClient: resilientHttp.ResilientHttpClient,
  createServiceClient: resilientHttp.createServiceClient,
  serviceClients: resilientHttp.serviceClients,
};
