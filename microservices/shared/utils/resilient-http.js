/**
 * @fileoverview Resilient HTTP Client for Microservices
 * @description Cliente HTTP con circuit breaker, retry y backoff exponencial
 * 
 * @features
 * - Circuit breaker por servicio
 * - Retry automático con backoff exponencial
 * - Timeout configurable
 * - Métricas de latencia
 * - Cache de respuestas (opcional)
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { CircuitBreaker, CircuitOpenError } = require('../middleware/circuit-breaker');

// Configuración por defecto
const DEFAULT_CONFIG = {
  timeout: 5000,           // 5 segundos
  retries: 3,              // 3 intentos
  retryDelay: 1000,        // 1 segundo inicial
  maxRetryDelay: 10000,    // 10 segundos máximo
  backoffFactor: 2,        // Multiplicador exponencial
  circuitBreaker: {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000,        // 30 segundos en OPEN
  },
};

// Cache de circuit breakers por servicio
const circuitBreakers = new Map();

// Métricas
const metrics = {
  requests: new Map(),
  latencies: new Map(),
};

/**
 * Obtiene o crea un circuit breaker para un servicio
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} options - Opciones del circuit breaker
 * @returns {CircuitBreaker}
 */
function getCircuitBreaker(serviceName, options = {}) {
  if (!circuitBreakers.has(serviceName)) {
    const cb = new CircuitBreaker({
      name: serviceName,
      ...DEFAULT_CONFIG.circuitBreaker,
      ...options,
      onOpen: () => {
        console.warn(`[CircuitBreaker] ${serviceName} - OPEN (servicio no disponible)`);
      },
      onClose: () => {
        console.info(`[CircuitBreaker] ${serviceName} - CLOSED (servicio recuperado)`);
      },
      onHalfOpen: () => {
        console.info(`[CircuitBreaker] ${serviceName} - HALF_OPEN (probando servicio)`);
      },
    });
    circuitBreakers.set(serviceName, cb);
  }
  return circuitBreakers.get(serviceName);
}

/**
 * Calcula el delay para retry con backoff exponencial
 * @param {number} attempt - Número de intento (0-indexed)
 * @param {Object} config - Configuración
 * @returns {number} Delay en ms
 */
function calculateBackoff(attempt, config) {
  const delay = config.retryDelay * Math.pow(config.backoffFactor, attempt);
  // Agregar jitter aleatorio (±10%) para evitar thundering herd
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, config.maxRetryDelay);
}

/**
 * Espera un tiempo determinado
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica si un error es retryable
 * @param {Error} error - Error a verificar
 * @returns {boolean}
 */
function isRetryable(error) {
  // Network errors
  if (error.code === 'ECONNREFUSED' || 
      error.code === 'ENOTFOUND' || 
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNRESET') {
    return true;
  }
  
  // HTTP 5xx errors
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // HTTP 429 Too Many Requests
  if (error.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Cliente HTTP resiliente
 */
class ResilientHttpClient {
  /**
   * @param {Object} config - Configuración del cliente
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.serviceName = config.serviceName || 'default';
  }

  /**
   * Realiza una petición HTTP con retry y circuit breaker
   * @param {string} url - URL de la petición
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<Response>}
   */
  async fetch(url, options = {}) {
    const circuitBreaker = getCircuitBreaker(this.serviceName, this.config.circuitBreaker);
    const startTime = Date.now();
    
    // Registrar métrica de request
    this._recordRequest();

    try {
      const result = await circuitBreaker.execute(
        () => this._fetchWithRetry(url, options),
        // Fallback cuando el circuito está abierto
        options.fallback
      );
      
      // Registrar latencia exitosa
      this._recordLatency(Date.now() - startTime);
      
      return result;
    } catch (error) {
      // Registrar latencia fallida
      this._recordLatency(Date.now() - startTime, true);
      throw error;
    }
  }

  /**
   * Realiza fetch con retry y backoff
   * @private
   */
  async _fetchWithRetry(url, options = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          options.timeout || this.config.timeout
        );

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': options.requestId || this._generateRequestId(),
            'X-Service-Name': this.serviceName,
            'X-Internal-Request': 'true',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        // Si es error de servidor, puede ser retryable
        if (!response.ok && response.status >= 500) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.response = response;
          throw error;
        }

        return response;
      } catch (error) {
        lastError = error;
        
        // Si es el último intento o no es retryable, lanzar
        if (attempt === this.config.retries || !isRetryable(error)) {
          throw error;
        }

        // Calcular delay y esperar
        const delay = calculateBackoff(attempt, this.config);
        console.warn(
          `[${this.serviceName}] Retry ${attempt + 1}/${this.config.retries} ` +
          `after ${Math.round(delay)}ms - ${error.message}`
        );
        
        await sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * GET request
   * @param {string} url - URL
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<any>}
   */
  async get(url, options = {}) {
    const response = await this.fetch(url, { ...options, method: 'GET' });
    return response.json();
  }

  /**
   * POST request
   * @param {string} url - URL
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<any>}
   */
  async post(url, data, options = {}) {
    const response = await this.fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * PUT request
   * @param {string} url - URL
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<any>}
   */
  async put(url, data, options = {}) {
    const response = await this.fetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * DELETE request
   * @param {string} url - URL
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<any>}
   */
  async delete(url, options = {}) {
    const response = await this.fetch(url, { ...options, method: 'DELETE' });
    return response.json();
  }

  /**
   * Genera un request ID único
   * @private
   */
  _generateRequestId() {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Registra una petición en métricas
   * @private
   */
  _recordRequest() {
    const current = metrics.requests.get(this.serviceName) || 0;
    metrics.requests.set(this.serviceName, current + 1);
  }

  /**
   * Registra latencia en métricas
   * @private
   */
  _recordLatency(ms, failed = false) {
    const key = `${this.serviceName}:${failed ? 'failed' : 'success'}`;
    const latencies = metrics.latencies.get(key) || [];
    latencies.push(ms);
    // Mantener solo las últimas 100 mediciones
    if (latencies.length > 100) {
      latencies.shift();
    }
    metrics.latencies.set(key, latencies);
  }

  /**
   * Obtiene métricas del cliente
   * @returns {Object}
   */
  getMetrics() {
    const successLatencies = metrics.latencies.get(`${this.serviceName}:success`) || [];
    const failedLatencies = metrics.latencies.get(`${this.serviceName}:failed`) || [];
    
    return {
      serviceName: this.serviceName,
      totalRequests: metrics.requests.get(this.serviceName) || 0,
      circuitBreakerState: getCircuitBreaker(this.serviceName).getState(),
      latency: {
        success: this._calculateLatencyStats(successLatencies),
        failed: this._calculateLatencyStats(failedLatencies),
      },
    };
  }

  /**
   * Calcula estadísticas de latencia
   * @private
   */
  _calculateLatencyStats(latencies) {
    if (latencies.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0 };
    }
    
    const sorted = [...latencies].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      count: sorted.length,
      avg: Math.round(sum / sorted.length),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// CLIENTS PRE-CONFIGURADOS PARA SERVICIOS INTERNOS
// ═══════════════════════════════════════════════════════════════

// URLs de servicios (desde variables de entorno)
const SERVICE_URLS = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  user: process.env.USER_SERVICE_URL || 'http://user-service:3002',
  product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3009',
  order: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
  cart: process.env.CART_SERVICE_URL || 'http://cart-service:3004',
  wishlist: process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:3005',
  review: process.env.REVIEW_SERVICE_URL || 'http://review-service:3006',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3007',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3008',
};

/**
 * Crea un cliente para un servicio interno
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} config - Configuración adicional
 * @returns {ResilientHttpClient}
 */
function createServiceClient(serviceName, config = {}) {
  const baseUrl = SERVICE_URLS[serviceName];
  if (!baseUrl) {
    console.warn(`[ServiceClient] URL no configurada para servicio: ${serviceName}`);
  }
  
  const client = new ResilientHttpClient({
    serviceName,
    ...config,
  });

  // Wrapper con baseUrl
  return {
    baseUrl,
    
    async get(path, options = {}) {
      return client.get(`${baseUrl}${path}`, options);
    },
    
    async post(path, data, options = {}) {
      return client.post(`${baseUrl}${path}`, data, options);
    },
    
    async put(path, data, options = {}) {
      return client.put(`${baseUrl}${path}`, data, options);
    },
    
    async delete(path, options = {}) {
      return client.delete(`${baseUrl}${path}`, options);
    },
    
    getMetrics() {
      return client.getMetrics();
    },
    
    getCircuitBreakerState() {
      return getCircuitBreaker(serviceName).getState();
    },
  };
}

/**
 * Obtiene el estado de todos los circuit breakers
 * @returns {Object}
 */
function getAllCircuitBreakerStates() {
  const states = {};
  for (const [name, cb] of circuitBreakers) {
    states[name] = cb.getState();
  }
  return states;
}

/**
 * Resetea todos los circuit breakers
 */
function resetAllCircuitBreakers() {
  for (const [name, cb] of circuitBreakers) {
    cb.reset();
  }
}

module.exports = {
  ResilientHttpClient,
  createServiceClient,
  getCircuitBreaker,
  getAllCircuitBreakerStates,
  resetAllCircuitBreakers,
  SERVICE_URLS,
  CircuitOpenError,
};
