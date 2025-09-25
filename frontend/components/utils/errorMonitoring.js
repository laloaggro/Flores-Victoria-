// errorMonitoring.js - Sistema de monitoreo de errores con Sentry

// Clase para manejar el monitoreo de errores
class ErrorMonitor {
  constructor() {
    this.isEnabled = false;
    this.init();
  }

  // Inicializar el monitoreo de errores
  init() {
    // Verificar si estamos en un entorno de producción
    const isProduction = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1';
        
    // Solo habilitar en producción
    if (isProduction) {
      this.isEnabled = true;
      this.setupGlobalErrorHandlers();
    }
  }

  // Configurar manejadores de errores globales
  setupGlobalErrorHandlers() {
    // Capturar errores de JavaScript no capturados
    window.addEventListener('error', (event) => {
      this.captureException(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Capturar promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason, {
        type: 'unhandledrejection'
      });
    });

    // Sobrescribir console.error para capturar errores de consola
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      this.captureMessage('console.error', 'error', args);
    };
  }

  // Capturar una excepción
  captureException(error, extraData = {}) {
    if (!this.isEnabled) return;

    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      extra: extraData
    };

    // Enviar error al servidor o servicio de monitoreo
    this.sendError(errorData);
  }

  // Capturar un mensaje
  captureMessage(message, level = 'info', extraData = {}) {
    if (!this.isEnabled) return;

    const messageData = {
      message,
      level,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      extra: extraData
    };

    // Enviar mensaje al servidor o servicio de monitoreo
    this.sendError(messageData);
  }

  // Enviar error al servidor
  sendError(errorData) {
    // En un entorno real, esto enviaría los datos a un servicio como Sentry
    // Por ahora, solo los registramos en la consola
    console.log('[Error Monitoring] Error capturado:', errorData);
        
    // Simular envío al servidor
    /*
        fetch('/api/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
        }).catch(error => {
            console.error('[Error Monitoring] Error al enviar datos de error:', error);
        });
        */
  }

  // Registrar un error manualmente
  logError(message, errorObj = null, extraData = {}) {
    if (errorObj instanceof Error) {
      this.captureException(errorObj, { ...extraData, manualMessage: message });
    } else {
      this.captureMessage(message, 'error', { ...extraData, additionalInfo: errorObj });
    }
  }

  // Registrar una advertencia
  logWarning(message, extraData = {}) {
    this.captureMessage(message, 'warning', extraData);
  }

  // Registrar información
  logInfo(message, extraData = {}) {
    this.captureMessage(message, 'info', extraData);
  }
}

// Crear instancia global
const errorMonitor = new ErrorMonitor();

// Funciones de utilidad para registrar errores
export function logError(message, errorObj = null, extraData = {}) {
  errorMonitor.logError(message, errorObj, extraData);
}

export function logWarning(message, extraData = {}) {
  errorMonitor.logWarning(message, extraData);
}

export function logInfo(message, extraData = {}) {
  errorMonitor.logInfo(message, extraData);
}

// Manejador global para funciones asíncronas
export function withErrorMonitoring(fn) {
  return function(...args) {
    try {
      const result = fn.apply(this, args);
            
      // Si es una promesa, añadir manejo de errores
      if (result && typeof result.catch === 'function') {
        return result.catch(error => {
          logError(`Error en función asíncrona: ${fn.name}`, error);
          throw error;
        });
      }
            
      return result;
    } catch (error) {
      logError(`Error en función: ${fn.name}`, error);
      throw error;
    }
  };
}

export { errorMonitor };