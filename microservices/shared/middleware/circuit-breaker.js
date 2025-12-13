/**
 * @fileoverview Circuit Breaker Pattern Implementation
 * @description Protege servicios de llamadas fallidas repetidas
 *
 * Estados:
 * - CLOSED: Operación normal, llamadas pasan
 * - OPEN: Circuito abierto, llamadas se rechazan inmediatamente
 * - HALF_OPEN: Prueba si el servicio se recuperó
 *
 * @author Flores Victoria Team
 * @version 1.0.0
 */

// Estados del circuit breaker
const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

/**
 * Clase Circuit Breaker
 * Implementa el patrón para proteger llamadas a servicios externos
 */
class CircuitBreaker {
  /**
   * @param {Object} options - Opciones de configuración
   * @param {string} options.name - Nombre del circuit breaker
   * @param {number} options.failureThreshold - Número de fallos antes de abrir (default: 5)
   * @param {number} options.successThreshold - Éxitos para cerrar desde half-open (default: 2)
   * @param {number} options.timeout - Tiempo en ms antes de intentar half-open (default: 30000)
   * @param {Function} options.onOpen - Callback cuando se abre el circuito
   * @param {Function} options.onClose - Callback cuando se cierra el circuito
   * @param {Function} options.onHalfOpen - Callback cuando entra en half-open
   */
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 30000;
    this.onOpen = options.onOpen || (() => {});
    this.onClose = options.onClose || (() => {});
    this.onHalfOpen = options.onHalfOpen || (() => {});

    // Estado interno
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
  }

  /**
   * Verifica si se puede hacer una llamada
   * @returns {boolean}
   */
  canRequest() {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      // Verificar si es tiempo de intentar half-open
      if (Date.now() >= this.nextAttempt) {
        this._toHalfOpen();
        return true;
      }
      return false;
    }

    // HALF_OPEN - permitir requests limitados
    return true;
  }

  /**
   * Registra un éxito
   */
  recordSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this._toClosed();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  /**
   * Registra un fallo
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Un fallo en half-open vuelve a abrir
      this._toOpen();
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failureCount >= this.failureThreshold) {
        this._toOpen();
      }
    }
  }

  /**
   * Ejecuta una función protegida por el circuit breaker
   * @param {Function} fn - Función async a ejecutar
   * @param {Function} fallback - Función de fallback si el circuito está abierto
   * @returns {Promise<any>}
   */
  async execute(fn, fallback) {
    if (!this.canRequest()) {
      if (fallback) {
        return fallback();
      }
      throw new CircuitOpenError(
        `Circuit breaker '${this.name}' is OPEN. Service unavailable.`,
        this.name
      );
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Obtiene el estado actual
   * @returns {Object}
   */
  getState() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
    };
  }

  /**
   * Resetea el circuit breaker a estado inicial
   */
  reset() {
    this._toClosed();
  }

  // Métodos privados de transición de estado
  _toOpen() {
    this.state = CircuitState.OPEN;
    this.successCount = 0;
    this.nextAttempt = Date.now() + this.timeout;
    console.warn(`[CircuitBreaker] ${this.name}: OPEN (failures: ${this.failureCount})`);
    this.onOpen(this.getState());
  }

  _toClosed() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = null;
    console.info(`[CircuitBreaker] ${this.name}: CLOSED (recovered)`);
    this.onClose(this.getState());
  }

  _toHalfOpen() {
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
    console.info(`[CircuitBreaker] ${this.name}: HALF_OPEN (testing recovery)`);
    this.onHalfOpen(this.getState());
  }
}

/**
 * Error personalizado para circuito abierto
 */
class CircuitOpenError extends Error {
  constructor(message, circuitName) {
    super(message);
    this.name = 'CircuitOpenError';
    this.circuitName = circuitName;
    this.statusCode = 503;
  }
}

// ====================================================================
// REGISTRO DE CIRCUIT BREAKERS
// ====================================================================

const circuits = new Map();

/**
 * Obtiene o crea un circuit breaker por nombre
 * @param {string} name - Nombre del servicio
 * @param {Object} options - Opciones de configuración
 * @returns {CircuitBreaker}
 */
function getCircuitBreaker(name, options = {}) {
  if (!circuits.has(name)) {
    circuits.set(name, new CircuitBreaker({ name, ...options }));
  }
  return circuits.get(name);
}

/**
 * Obtiene el estado de todos los circuit breakers
 * @returns {Object}
 */
function getAllCircuitsState() {
  const states = {};
  circuits.forEach((circuit, name) => {
    states[name] = circuit.getState();
  });
  return states;
}

/**
 * Resetea todos los circuit breakers
 */
function resetAllCircuits() {
  circuits.forEach((circuit) => circuit.reset());
}

// ====================================================================
// MIDDLEWARE PARA EXPRESS
// ====================================================================

/**
 * Middleware que protege rutas con circuit breaker
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} options - Opciones del circuit breaker
 * @returns {Function} Middleware de Express
 */
function circuitBreakerMiddleware(serviceName, options = {}) {
  const circuit = getCircuitBreaker(serviceName, options);

  return async (req, res, next) => {
    if (!circuit.canRequest()) {
      return res.status(503).json({
        status: 'error',
        message: `Service '${serviceName}' is temporarily unavailable`,
        code: 'SERVICE_UNAVAILABLE',
        retryAfter: Math.ceil((circuit.nextAttempt - Date.now()) / 1000),
      });
    }

    // Interceptar la respuesta para registrar éxito/fallo
    const originalEnd = res.end;
    res.end = function (...args) {
      if (res.statusCode >= 500) {
        circuit.recordFailure();
      } else {
        circuit.recordSuccess();
      }
      return originalEnd.apply(this, args);
    };

    next();
  };
}

/**
 * Endpoint para ver estado de circuit breakers
 * @returns {Function} Middleware de Express
 */
function circuitBreakerStatusEndpoint() {
  return (req, res) => {
    res.json({
      status: 'ok',
      circuits: getAllCircuitsState(),
      timestamp: new Date().toISOString(),
    });
  };
}

// ====================================================================
// EXPORTS
// ====================================================================

module.exports = {
  CircuitBreaker,
  CircuitOpenError,
  CircuitState,
  getCircuitBreaker,
  getAllCircuitsState,
  resetAllCircuits,
  circuitBreakerMiddleware,
  circuitBreakerStatusEndpoint,
};
