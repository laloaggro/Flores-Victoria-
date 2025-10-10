/**
 * Sistema de health checks mejorado
 */
class HealthCheck {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.checks = [];
  }

  /**
   * Registrar un health check
   * @param {string} name - Nombre del check
   * @param {function} checkFn - Función que realiza el check
   */
  registerCheck(name, checkFn) {
    this.checks.push({ name, checkFn });
  }

  /**
   * Ejecutar todos los health checks
   * @returns {object} Resultados de los checks
   */
  async runChecks() {
    const results = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      checks: []
    };

    for (const check of this.checks) {
      try {
        const checkResult = await check.checkFn();
        results.checks.push({
          name: check.name,
          status: 'ok',
          details: checkResult
        });
      } catch (error) {
        results.status = 'error';
        results.checks.push({
          name: check.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Crear middleware de health check para Express
   * @returns {function} Middleware de Express
   */
  createMiddleware() {
    return async (req, res) => {
      const results = await this.runChecks();
      const statusCode = results.status === 'ok' ? 200 : 503;
      res.status(statusCode).json(results);
    };
  }
}

module.exports = HealthCheck;