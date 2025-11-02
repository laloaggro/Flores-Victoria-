/**
 * ================================================
 * ARTILLERY HELPER FUNCTIONS
 * ================================================
 * Funciones auxiliares para load testing
 */

module.exports = {
  /**
   * Genera un producto random para testing
   */
  generateRandomProduct: function(userContext, events, done) {
    userContext.vars.randomProductId = Math.floor(Math.random() * 50) + 1;
    return done();
  },

  /**
   * Genera un email random
   */
  generateRandomEmail: function(userContext, events, done) {
    const randomNum = Math.floor(Math.random() * 10000);
    userContext.vars.email = `test${randomNum}@example.com`;
    return done();
  },

  /**
   * Genera búsqueda random
   */
  generateRandomSearch: function(userContext, events, done) {
    const searches = [
      'rosas',
      'tulipanes',
      'margaritas',
      'lirios',
      'orquídeas',
      'girasoles',
      'claveles',
      'flores rojas',
      'ramo',
      'bodas'
    ];
    userContext.vars.searchTerm = searches[Math.floor(Math.random() * searches.length)];
    return done();
  },

  /**
   * Log custom metric
   */
  logResponseTime: function(requestParams, response, context, ee, next) {
    const responseTime = response.timings.phases.total;
    ee.emit('customStat', {
      stat: 'response_time_ms',
      value: responseTime
    });
    return next();
  },

  /**
   * Log slow requests
   */
  checkSlowRequest: function(requestParams, response, context, ee, next) {
    const responseTime = response.timings.phases.total;
    if (responseTime > 500) {
      console.log(`⚠️  Slow request: ${requestParams.url} - ${responseTime}ms`);
    }
    return next();
  },

  /**
   * Capturar errores
   */
  captureError: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 400) {
      console.log(`❌ Error: ${requestParams.url} - Status: ${response.statusCode}`);
    }
    return next();
  }
};
