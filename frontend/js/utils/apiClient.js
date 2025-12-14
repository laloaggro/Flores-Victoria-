/**
 * @fileoverview Enhanced API Client with AbortController
 * @description Cliente HTTP con timeout, cancelación y retry
 * @author Flores Victoria Team
 * @version 2.0.0
 */

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  timeout: 10000,
  retries: 2,
  retryDelay: 1000,
  baseURL: '',
};

/**
 * Store de requests activos para cancelación
 */
const activeRequests = new Map();

/**
 * Cliente HTTP mejorado con AbortController
 */
class ApiClient {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  /**
   * Realiza una petición HTTP con control de timeout y cancelación
   * @param {string} url - URL de la petición
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<Object>} Respuesta parseada
   */
  async request(url, options = {}) {
    const {
      timeout = this.config.timeout,
      retries = this.config.retries,
      retryDelay = this.config.retryDelay,
      requestId = this.generateRequestId(),
      ...fetchOptions
    } = options;

    const fullUrl = this.buildUrl(url);

    // Cancelar request anterior con el mismo ID si existe
    if (options.cancelPrevious && activeRequests.has(requestId)) {
      this.cancelRequest(requestId);
    }

    // Crear AbortController
    const controller = new AbortController();
    activeRequests.set(requestId, controller);

    // Setup timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // Aplicar interceptors de request
    let finalOptions = {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    };

    for (const interceptor of this.interceptors.request) {
      finalOptions = await interceptor(finalOptions);
    }

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(fullUrl, finalOptions);
        clearTimeout(timeoutId);
        activeRequests.delete(requestId);

        // Parsear respuesta
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Aplicar interceptors de response
        let result = { response, data, status: response.status };
        for (const interceptor of this.interceptors.response) {
          result = await interceptor(result);
        }

        // Manejar errores HTTP
        if (!response.ok) {
          const error = new HttpError(
            data.message || `HTTP Error ${response.status}`,
            response.status,
            data
          );

          // Retry solo en ciertos status codes
          if (this.shouldRetry(response.status, attempt, retries)) {
            lastError = error;
            await this.delay(retryDelay * (attempt + 1));
            continue;
          }

          throw error;
        }

        return result.data;
      } catch (error) {
        clearTimeout(timeoutId);
        activeRequests.delete(requestId);

        // Manejar cancelación
        if (error.name === 'AbortError') {
          throw new RequestCancelledError('Request was cancelled or timed out', requestId);
        }

        // Manejar error de red
        if (error instanceof TypeError && error.message.includes('fetch')) {
          if (attempt < retries) {
            lastError = error;
            await this.delay(retryDelay * (attempt + 1));
            continue;
          }
          throw new NetworkError('Network error - unable to connect');
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * GET request
   * @param {string} url - URL
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>}
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param {string} url - URL
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>}
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   * @param {string} url - URL
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>}
   */
  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   * @param {string} url - URL
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>}
   */
  async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * @param {string} url - URL
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>}
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Cancela un request específico
   * @param {string} requestId - ID del request
   */
  cancelRequest(requestId) {
    const controller = activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      activeRequests.delete(requestId);
    }
  }

  /**
   * Cancela todos los requests activos
   */
  cancelAllRequests() {
    for (const [id, controller] of activeRequests) {
      controller.abort();
    }
    activeRequests.clear();
  }

  /**
   * Verifica si un request está activo
   * @param {string} requestId - ID del request
   * @returns {boolean}
   */
  isRequestActive(requestId) {
    return activeRequests.has(requestId);
  }

  /**
   * Obtiene el número de requests activos
   * @returns {number}
   */
  getActiveRequestCount() {
    return activeRequests.size;
  }

  /**
   * Registra un interceptor de request
   * @param {Function} interceptor - Función interceptora
   * @returns {Function} Función para remover el interceptor
   */
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
    return () => {
      const index = this.interceptors.request.indexOf(interceptor);
      if (index > -1) {
        this.interceptors.request.splice(index, 1);
      }
    };
  }

  /**
   * Registra un interceptor de response
   * @param {Function} interceptor - Función interceptora
   * @returns {Function} Función para remover el interceptor
   */
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
    return () => {
      const index = this.interceptors.response.indexOf(interceptor);
      if (index > -1) {
        this.interceptors.response.splice(index, 1);
      }
    };
  }

  /**
   * Construye la URL completa
   * @private
   */
  buildUrl(url) {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.config.baseURL}${url}`;
  }

  /**
   * Genera un ID único para el request
   * @private
   */
  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Determina si debe reintentar
   * @private
   */
  shouldRetry(status, attempt, maxRetries) {
    const retryableStatus = [408, 429, 500, 502, 503, 504];
    return attempt < maxRetries && retryableStatus.includes(status);
  }

  /**
   * Delay helper
   * @private
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Error HTTP personalizado
 */
class HttpError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Error de request cancelado
 */
class RequestCancelledError extends Error {
  constructor(message, requestId) {
    super(message);
    this.name = 'RequestCancelledError';
    this.requestId = requestId;
  }
}

/**
 * Error de red
 */
class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Hook personalizado para requests abortables
 * Uso: const { data, loading, error, cancel } = useAbortableRequest('/api/products')
 */
const createAbortableRequest = () => {
  let controller = null;

  return {
    execute: async (url, options = {}) => {
      // Cancelar request anterior
      if (controller) {
        controller.abort();
      }

      controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          return { cancelled: true };
        }
        throw error;
      }
    },

    cancel: () => {
      if (controller) {
        controller.abort();
        controller = null;
      }
    },
  };
};

// Exportar instancia global pre-configurada
const apiClient = new ApiClient({
  baseURL: window.API_URL || '',
  timeout: 15000,
});

// Auto-añadir token de auth si existe
apiClient.addRequestInterceptor((options) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return options;
});

// Exportaciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ApiClient,
    apiClient,
    HttpError,
    RequestCancelledError,
    NetworkError,
    createAbortableRequest,
  };
}

// Exponer globalmente para uso en scripts tradicionales
window.ApiClient = ApiClient;
window.apiClient = apiClient;
window.createAbortableRequest = createAbortableRequest;
