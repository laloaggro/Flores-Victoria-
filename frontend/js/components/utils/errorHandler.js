/**
 * Manejador de errores centralizado para la aplicación
 */

class ErrorHandler {
  constructor() {
    this.isDevMode =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  /**
   * Registrar un error en la consola con formato adecuado
   * @param {Error} error - El error a registrar
   * @param {string} context - Contexto donde ocurrió el error
   */
  logError(error, context = '') {
    if (this.isDevMode) {
      console.error(`[ErrorHandler] ${context}:`, error);
    } else {
      // En producción, podríamos enviar el error a un servicio de monitoreo
      console.error(`[ErrorHandler] ${context}:`, error.message);
    }
  }

  /**
   * Manejar errores de red o API
   * @param {Error} error - Error de red
   * @param {string} endpoint - Endpoint que causó el error
   */
  handleNetworkError(error, endpoint) {
    this.logError(error, `Network error in ${endpoint}`);

    // Mostrar notificación al usuario
    if (window.notifications) {
      window.notifications.showError(
        'Error de conexión',
        'No se pudo conectar con el servidor. Por favor, inténtelo de nuevo más tarde.'
      );
    }
  }

  /**
   * Manejar errores de validación
   * @param {Array} errors - Array de errores de validación
   * @param {string} formId - ID del formulario donde ocurrieron los errores
   */
  handleValidationErrors(errors, formId) {
    console.warn('[ErrorHandler] Validation errors:', errors);

    // Limpiar mensajes de error previos
    const form = document.getElementById(formId);
    if (form) {
      const errorElements = form.querySelectorAll('.error-message');
      errorElements.forEach((el) => el.remove());
    }

    // Mostrar nuevos mensajes de error
    errors.forEach((error) => {
      const field = document.getElementById(error.field);
      if (field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = error.message;
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }
    });
  }
}

// Crear una instancia global
window.errorHandler = new ErrorHandler();

// Exportar para uso como módulo
export default ErrorHandler;
export { ErrorHandler };
