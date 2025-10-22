/**
 * Circuit Breaker para manejo de fallos en servicios
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minuto
    this.timeout = options.timeout || 10000; // 10 segundos

    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  /**
   * Ejecutar una función con circuit breaker
   * @param {function} fn - Función a ejecutar
   * @returns {any} Resultado de la función
   */
  async execute(fn) {
    // Verificar si el circuito está abierto
    if (this.state === 'OPEN') {
      // Verificar si es tiempo de resetear
      if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuito en estado HALF_OPEN');
      } else {
        throw new Error('Circuito abierto - servicio no disponible');
      }
    }

    try {
      // Ejecutar la función con timeout
      const result = await this._withTimeout(fn);

      // Resetear contador de fallos si tuvo éxito
      this.failureCount = 0;
      this.state = 'CLOSED';

      return result;
    } catch (error) {
      // Incrementar contador de fallos
      this.failureCount++;
      this.lastFailureTime = Date.now();

      // Abrir circuito si se supera el umbral
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
        console.log('Circuito abierto debido a múltiples fallos');
      }

      throw error;
    }
  }

  /**
   * Ejecutar una función con timeout
   * @param {function} fn - Función a ejecutar
   * @returns {any} Resultado de la función
   */
  _withTimeout(fn) {
    return new Promise((resolve, reject) => {
      // Configurar timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout ejecutando función'));
      }, this.timeout);

      // Ejecutar función
      fn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Obtener estado del circuit breaker
   * @returns {object} Estado actual
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      failureThreshold: this.failureThreshold,
      resetTimeout: this.resetTimeout,
    };
  }
}

module.exports = CircuitBreaker;
