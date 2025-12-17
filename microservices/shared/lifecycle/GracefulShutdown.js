/**
 * @fileoverview Graceful Shutdown Manager
 * @description Manejo ordenado del cierre de servicios con drenaje de conexiones
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { TIMEOUTS } = require('../constants');

/**
 * Estado del shutdown
 */
const SHUTDOWN_STATE = {
  RUNNING: 'RUNNING',
  SHUTTING_DOWN: 'SHUTTING_DOWN',
  TERMINATED: 'TERMINATED',
};

/**
 * Señales de sistema para shutdown
 */
const SHUTDOWN_SIGNALS = ['SIGTERM', 'SIGINT', 'SIGHUP'];

/**
 * Clase para manejo de graceful shutdown
 */
class GracefulShutdown {
  /**
   * @param {Object} options - Opciones de configuración
   * @param {number} [options.timeout=30000] - Timeout máximo para shutdown
   * @param {boolean} [options.exitOnComplete=true] - Salir del proceso al completar
   * @param {Function} [options.onShutdown] - Callback al iniciar shutdown
   * @param {Function} [options.onComplete] - Callback al completar shutdown
   * @param {Object} [options.logger] - Logger instance
   */
  constructor(options = {}) {
    this.timeout = options.timeout || TIMEOUTS.SERVICE_CALL * 3;
    this.exitOnComplete = options.exitOnComplete !== false;
    this.onShutdownCallback = options.onShutdown || null;
    this.onCompleteCallback = options.onComplete || null;
    this.logger = options.logger || console;

    this.state = SHUTDOWN_STATE.RUNNING;
    this.server = null;
    this.cleanupTasks = [];
    this.connections = new Set();

    // Métricas
    this.metrics = {
      shutdownStartTime: null,
      shutdownEndTime: null,
      cleanupTasksRun: 0,
      connectionsClosed: 0,
      errors: [],
    };

    // Binding para event handlers
    this._handleShutdown = this._handleShutdown.bind(this);
  }

  /**
   * Registra el servidor HTTP para tracking de conexiones
   * @param {Object} server - HTTP server instance
   * @returns {GracefulShutdown} this
   */
  registerServer(server) {
    this.server = server;

    // Track conexiones activas
    server.on('connection', (socket) => {
      this.connections.add(socket);
      socket.on('close', () => {
        this.connections.delete(socket);
      });
    });

    return this;
  }

  /**
   * Registra una tarea de limpieza
   * @param {string} name - Nombre de la tarea
   * @param {Function} task - Función async de limpieza
   * @param {number} [priority=0] - Prioridad (mayor = antes)
   * @returns {GracefulShutdown} this
   */
  registerCleanup(name, task, priority = 0) {
    this.cleanupTasks.push({ name, task, priority });
    // Ordenar por prioridad descendente
    this.cleanupTasks.sort((a, b) => b.priority - a.priority);
    return this;
  }

  /**
   * Registra handlers de señales del sistema
   * @returns {GracefulShutdown} this
   */
  registerSignalHandlers() {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      process.on(signal, () => {
        this.logger.info(`[Shutdown] Received ${signal}`);
        this._handleShutdown(signal);
      });
    });

    // Manejar excepciones no capturadas
    process.on('uncaughtException', (error) => {
      this.logger.error('[Shutdown] Uncaught exception:', { error: error.message });
      this._handleShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason) => {
      this.logger.error('[Shutdown] Unhandled rejection:', { reason });
      // No hacer shutdown inmediato por unhandled rejection
    });

    return this;
  }

  /**
   * Inicia el proceso de shutdown
   * @param {string} reason - Razón del shutdown
   * @returns {Promise<void>}
   */
  async shutdown(reason = 'manual') {
    return this._handleShutdown(reason);
  }

  /**
   * Handler principal de shutdown
   * @private
   */
  async _handleShutdown(reason) {
    // Evitar múltiples shutdowns
    if (this.state !== SHUTDOWN_STATE.RUNNING) {
      this.logger.warn('[Shutdown] Already shutting down, ignoring signal');
      return;
    }

    this.state = SHUTDOWN_STATE.SHUTTING_DOWN;
    this.metrics.shutdownStartTime = Date.now();

    this.logger.info(`[Shutdown] Starting graceful shutdown (reason: ${reason})`);

    // Callback de inicio de shutdown
    if (this.onShutdownCallback) {
      try {
        await this.onShutdownCallback(reason);
      } catch (error) {
        this.metrics.errors.push({ phase: 'onShutdown', error: error.message });
      }
    }

    // Establecer timeout de seguridad
    const timeoutId = setTimeout(() => {
      this.logger.error('[Shutdown] Timeout reached, forcing exit');
      this._forceExit(1);
    }, this.timeout);

    try {
      // 1. Dejar de aceptar nuevas conexiones
      await this._stopAcceptingConnections();

      // 2. Esperar a que terminen requests en vuelo
      await this._drainConnections();

      // 3. Ejecutar tareas de limpieza
      await this._runCleanupTasks();

      // 4. Completar
      clearTimeout(timeoutId);
      this._complete();
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error('[Shutdown] Error during shutdown:', { error: error.message });
      this._forceExit(1);
    }
  }

  /**
   * Detiene el servidor para no aceptar nuevas conexiones
   * @private
   */
  async _stopAcceptingConnections() {
    if (!this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.logger.info('[Shutdown] Stopping server...');

      this.server.close((err) => {
        if (err) {
          this.logger.warn('[Shutdown] Server close error:', { error: err.message });
        } else {
          this.logger.info('[Shutdown] Server stopped accepting connections');
        }
        resolve();
      });
    });
  }

  /**
   * Drena conexiones existentes con timeout
   * @private
   */
  async _drainConnections() {
    const connectionCount = this.connections.size;

    if (connectionCount === 0) {
      this.logger.info('[Shutdown] No active connections to drain');
      return;
    }

    this.logger.info(`[Shutdown] Draining ${connectionCount} connections...`);

    const drainTimeout = Math.min(this.timeout / 2, 10000);

    await Promise.race([
      // Esperar a que todas las conexiones cierren naturalmente
      new Promise((resolve) => {
        const checkConnections = setInterval(() => {
          if (this.connections.size === 0) {
            clearInterval(checkConnections);
            resolve();
          }
        }, 100);
      }),
      // O timeout
      new Promise((resolve) => setTimeout(resolve, drainTimeout)),
    ]);

    // Forzar cierre de conexiones restantes
    if (this.connections.size > 0) {
      this.logger.warn(`[Shutdown] Forcing close of ${this.connections.size} connections`);
      this.connections.forEach((socket) => {
        socket.destroy();
        this.metrics.connectionsClosed++;
      });
    }
  }

  /**
   * Ejecuta todas las tareas de limpieza registradas
   * @private
   */
  async _runCleanupTasks() {
    if (this.cleanupTasks.length === 0) {
      return;
    }

    this.logger.info(`[Shutdown] Running ${this.cleanupTasks.length} cleanup tasks...`);

    for (const { name, task } of this.cleanupTasks) {
      try {
        this.logger.info(`[Shutdown] Running cleanup: ${name}`);
        await Promise.race([
          task(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
        ]);
        this.metrics.cleanupTasksRun++;
        this.logger.info(`[Shutdown] Completed: ${name}`);
      } catch (error) {
        this.logger.error(`[Shutdown] Cleanup failed: ${name}`, { error: error.message });
        this.metrics.errors.push({ task: name, error: error.message });
      }
    }
  }

  /**
   * Completa el shutdown exitosamente
   * @private
   */
  _complete() {
    this.state = SHUTDOWN_STATE.TERMINATED;
    this.metrics.shutdownEndTime = Date.now();

    const duration = this.metrics.shutdownEndTime - this.metrics.shutdownStartTime;
    this.logger.info(`[Shutdown] Completed in ${duration}ms`, {
      cleanupTasksRun: this.metrics.cleanupTasksRun,
      connectionsClosed: this.metrics.connectionsClosed,
      errors: this.metrics.errors.length,
    });

    // Callback de completado
    if (this.onCompleteCallback) {
      this.onCompleteCallback(this.metrics);
    }

    if (this.exitOnComplete) {
      this._forceExit(0);
    }
  }

  /**
   * Fuerza la salida del proceso
   * @private
   */
  _forceExit(code) {
    this.logger.info(`[Shutdown] Exiting with code ${code}`);
    process.exit(code);
  }

  /**
   * Verifica si el servicio está en shutdown
   * @returns {boolean}
   */
  isShuttingDown() {
    return this.state !== SHUTDOWN_STATE.RUNNING;
  }

  /**
   * Obtiene métricas del shutdown
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Middleware Express para rechazar requests durante shutdown
   * @returns {Function}
   */
  middleware() {
    return (req, res, next) => {
      if (this.isShuttingDown()) {
        res.setHeader('Connection', 'close');
        return res.status(503).json({
          error: true,
          code: 'SERVICE_UNAVAILABLE',
          message: 'Servicio en proceso de apagado, intente más tarde',
        });
      }
      next();
    };
  }
}

/**
 * Factory para crear instancia preconfigurada
 * @param {Object} options - Opciones
 * @returns {GracefulShutdown}
 */
const createGracefulShutdown = (options = {}) => {
  const shutdown = new GracefulShutdown(options);
  shutdown.registerSignalHandlers();
  return shutdown;
};

module.exports = {
  GracefulShutdown,
  createGracefulShutdown,
  SHUTDOWN_STATE,
  SHUTDOWN_SIGNALS,
};
