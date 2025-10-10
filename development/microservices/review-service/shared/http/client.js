const axios = require('axios');
const CircuitBreaker = require('../circuitbreaker/circuitBreaker');

/**
 * Cliente HTTP con circuit breaker
 */
class HttpClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 10000,
      ...options
    });
    
    // Crear circuit breaker
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000,
      timeout: options.timeout || 10000
    });
  }

  /**
   * Realizar solicitud GET
   * @param {string} url - URL de la solicitud
   * @param {object} config - Configuración adicional
   * @returns {object} Respuesta de la solicitud
   */
  async get(url, config = {}) {
    return this._request(() => this.client.get(url, config));
  }

  /**
   * Realizar solicitud POST
   * @param {string} url - URL de la solicitud
   * @param {object} data - Datos a enviar
   * @param {object} config - Configuración adicional
   * @returns {object} Respuesta de la solicitud
   */
  async post(url, data = {}, config = {}) {
    return this._request(() => this.client.post(url, data, config));
  }

  /**
   * Realizar solicitud PUT
   * @param {string} url - URL de la solicitud
   * @param {object} data - Datos a enviar
   * @param {object} config - Configuración adicional
   * @returns {object} Respuesta de la solicitud
   */
  async put(url, data = {}, config = {}) {
    return this._request(() => this.client.put(url, data, config));
  }

  /**
   * Realizar solicitud DELETE
   * @param {string} url - URL de la solicitud
   * @param {object} config - Configuración adicional
   * @returns {object} Respuesta de la solicitud
   */
  async delete(url, config = {}) {
    return this._request(() => this.client.delete(url, config));
  }

  /**
   * Realizar solicitud con circuit breaker
   * @param {function} requestFn - Función de solicitud
   * @returns {object} Respuesta de la solicitud
   */
  async _request(requestFn) {
    try {
      const response = await this.circuitBreaker.execute(requestFn);
      return response;
    } catch (error) {
      console.error('Error en solicitud HTTP:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estado del circuit breaker
   * @returns {object} Estado del circuit breaker
   */
  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }
}

module.exports = HttpClient;