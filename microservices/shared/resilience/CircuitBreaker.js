/**
 * @fileoverview Circuit Breaker Pattern Implementation
 * @description Protege servicios de fallos en cascada
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { TIMEOUTS, LIMITS } = require('../constants');

/**
 * Estados del Circuit Breaker
 */
const STATES = {
  CLOSED: 'CLOSED', // Funcionando normalmente
  OPEN: 'OPEN', // Bloqueando llamadas
  HALF_OPEN: 'HALF_OPEN', // Probando recuperación
};

/**
 * Circuit Breaker para proteger llamadas a servicios externos
 */
class CircuitBreaker {
  /**
   * @param {Object} options - Opciones de configuración
   * @param {number} [options.failureThreshold=5] - Fallos antes de abrir circuito
   * @param {number} [options.resetTimeout=30000] - Tiempo antes de probar recuperación
   * @param {number} [options.halfOpenRequests=3] - Requests a permitir en HALF_OPEN
   * @param {Function} [options.onStateChange] - Callback en cambio de estado
   * @param {Function} [options.onFailure] - Callback en cada fallo
   * @param {string} [options.name='default'] - Nombre del circuito
   */
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || TIMEOUTS.HEALTH_CHECK_INTERVAL;
    this.halfOpenRequests = options.halfOpenRequests || 3;
    this.onStateChange = options.onStateChange || null;
    this.onFailure = options.onFailure || null;

    this.state = STATES.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;

    // Métricas
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      lastStateChange: new Date(),
    };
  }

  /**
   * Ejecuta una función protegida por el circuit breaker
   * @param {Function} fn - Función async a ejecutar
   * @param {*} fallback - Valor de fallback si el circuito está abierto
   * @returns {Promise<*>} Resultado de la función o fallback
   */
  async execute(fn, fallback = null) {
    this.metrics.totalRequests++;

    // Si el circuito está abierto, verificar si podemos intentar recuperación
    if (this.state === STATES.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(STATES.HALF_OPEN);
      } else {
        this.metrics.rejectedRequests++;
        if (fallback !== null) {
          return typeof fallback === 'function' ? fallback() : fallback;
        }
        throw new CircuitBreakerOpenError(this.name);
      }
    }

    // En HALF_OPEN, limitar requests
    if (this.state === STATES.HALF_OPEN) {
      if (this.halfOpenAttempts >= this.halfOpenRequests) {
        this.metrics.rejectedRequests++;
        throw new CircuitBreakerOpenError(this.name, 'Too many half-open attempts');
      }
      this.halfOpenAttempts++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onError(error);
      throw error;
    }
  }

  /**
   * Maneja éxito de operación
   */
  onSuccess() {
    this.metrics.successfulRequests++;
    this.successes++;
    this.failures = 0;

    if (this.state === STATES.HALF_OPEN) {
      // Si suficientes éxitos en HALF_OPEN, cerrar circuito
      if (this.successes >= this.halfOpenRequests) {
        this.transitionTo(STATES.CLOSED);
      }
    }
  }

  /**
   * Maneja error de operación
   * @param {Error} error - Error ocurrido
   */
  onError(error) {
    this.metrics.failedRequests++;
    this.failures++;
    this.successes = 0;
    this.lastFailureTime = Date.now();

    if (this.onFailure) {
      this.onFailure(error, this);
    }

    // En HALF_OPEN, un fallo abre el circuito inmediatamente
    if (this.state === STATES.HALF_OPEN) {
      this.transitionTo(STATES.OPEN);
      return;
    }

    // En CLOSED, verificar umbral de fallos
    if (this.state === STATES.CLOSED && this.failures >= this.failureThreshold) {
      this.transitionTo(STATES.OPEN);
    }
  }

  /**
   * Verifica si debemos intentar recuperación
   * @returns {boolean}
   */
  shouldAttemptReset() {
    return Date.now() - this.lastFailureTime >= this.resetTimeout;
  }

  /**
   * Transiciona a un nuevo estado
   * @param {string} newState - Nuevo estado
   */
  transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    this.metrics.lastStateChange = new Date();

    // Reset contadores según estado
    if (newState === STATES.CLOSED) {
      this.failures = 0;
      this.successes = 0;
      this.halfOpenAttempts = 0;
    } else if (newState === STATES.HALF_OPEN) {
      this.halfOpenAttempts = 0;
      this.successes = 0;
    }

    if (this.onStateChange) {
      this.onStateChange(oldState, newState, this);
    }

    console.log(`[CircuitBreaker:${this.name}] State changed: ${oldState} -> ${newState}`);
  }

  /**
   * Obtiene el estado actual del circuit breaker
   * @returns {Object} Estado y métricas
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      metrics: { ...this.metrics },
    };
  }

  /**
   * Fuerza el cierre del circuito (útil para testing/admin)
   */
  forceClose() {
    this.transitionTo(STATES.CLOSED);
  }

  /**
   * Fuerza la apertura del circuito (útil para mantenimiento)
   */
  forceOpen() {
    this.transitionTo(STATES.OPEN);
  }

  /**
   * Resetea todas las métricas
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      lastStateChange: new Date(),
    };
  }
}

/**
 * Error específico cuando el circuito está abierto
 */
class CircuitBreakerOpenError extends Error {
  constructor(circuitName, reason = 'Circuit is open') {
    super(`CircuitBreaker [${circuitName}]: ${reason}`);
    this.name = 'CircuitBreakerOpenError';
    this.circuitName = circuitName;
    this.isCircuitBreakerError = true;
  }
}

/**
 * Registry de Circuit Breakers para gestión centralizada
 */
class CircuitBreakerRegistry {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Obtiene o crea un circuit breaker
   * @param {string} name - Nombre del servicio
   * @param {Object} options - Opciones de configuración
   * @returns {CircuitBreaker}
   */
  get(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker({ name, ...options }));
    }
    return this.breakers.get(name);
  }

  /**
   * Obtiene el estado de todos los circuit breakers
   * @returns {Object[]}
   */
  getAllStatus() {
    return Array.from(this.breakers.values()).map((cb) => cb.getStatus());
  }

  /**
   * Resetea todos los circuit breakers
   */
  resetAll() {
    this.breakers.forEach((cb) => cb.forceClose());
  }
}

// Singleton del registry
const registry = new CircuitBreakerRegistry();

module.exports = {
  CircuitBreaker,
  CircuitBreakerOpenError,
  CircuitBreakerRegistry,
  registry,
  STATES,
};
