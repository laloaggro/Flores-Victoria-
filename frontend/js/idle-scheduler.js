/**
 * Idle Task Scheduler - Ejecuta tareas no críticas cuando el navegador está libre
 * Flores Victoria - Performance Optimization
 *
 * Evita bloquear el hilo principal dividiendo tareas largas
 */

(function () {
  'use strict';

  // Polyfill para requestIdleCallback
  window.requestIdleCallback =
    window.requestIdleCallback ||
    function (callback, options) {
      const start = Date.now();
      return setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, options?.timeout || 1);
    };

  window.cancelIdleCallback =
    window.cancelIdleCallback ||
    function (id) {
      clearTimeout(id);
    };

  /**
   * IdleScheduler - Planifica tareas para ejecutar cuando el navegador esté libre
   */
  const IdleScheduler = {
    queue: [],
    isRunning: false,

    /**
     * Agregar tarea a la cola
     * @param {Function} task - Función a ejecutar
     * @param {Object} options - Opciones {priority: 'high'|'low', timeout: ms}
     */
    addTask(task, options = {}) {
      const taskObj = {
        fn: task,
        priority: options.priority || 'low',
        timeout: options.timeout || 5000,
      };

      if (options.priority === 'high') {
        this.queue.unshift(taskObj);
      } else {
        this.queue.push(taskObj);
      }

      if (!this.isRunning) {
        this.runTasks();
      }
    },

    /**
     * Ejecutar tareas en cola
     */
    runTasks() {
      if (this.queue.length === 0) {
        this.isRunning = false;
        return;
      }

      this.isRunning = true;

      requestIdleCallback(
        (deadline) => {
          // Ejecutar tareas mientras haya tiempo disponible
          while (deadline.timeRemaining() > 0 && this.queue.length > 0) {
            const task = this.queue.shift();
            try {
              task.fn();
            } catch (e) {
              console.warn('IdleScheduler: Error en tarea', e);
            }
          }

          // Continuar con más tareas si quedan
          if (this.queue.length > 0) {
            this.runTasks();
          } else {
            this.isRunning = false;
          }
        },
        { timeout: 2000 }
      );
    },

    /**
     * Ejecutar función en chunks para evitar bloquear el hilo principal
     * @param {Array} items - Items a procesar
     * @param {Function} processor - Función que procesa cada item
     * @param {number} chunkSize - Cantidad de items por chunk
     */
    processInChunks(items, processor, chunkSize = 10) {
      return new Promise((resolve) => {
        let index = 0;

        const processChunk = () => {
          const chunk = items.slice(index, index + chunkSize);
          chunk.forEach(processor);
          index += chunkSize;

          if (index < items.length) {
            requestIdleCallback(processChunk, { timeout: 1000 });
          } else {
            resolve();
          }
        };

        requestIdleCallback(processChunk, { timeout: 1000 });
      });
    },
  };

  // Exponer globalmente
  window.IdleScheduler = IdleScheduler;

  // Auto-optimizar la carga inicial
  document.addEventListener('DOMContentLoaded', () => {
    // Diferir inicialización de componentes no críticos
    IdleScheduler.addTask(() => {
      // Inicializar tooltips
      if (window.initTooltips) window.initTooltips();
    });

    IdleScheduler.addTask(() => {
      // Precargar imágenes del viewport
      if (window.preloadVisibleImages) window.preloadVisibleImages();
    });

    IdleScheduler.addTask(() => {
      // Analytics no críticos
      if (window.initSecondaryAnalytics) window.initSecondaryAnalytics();
    });
  });
})();
