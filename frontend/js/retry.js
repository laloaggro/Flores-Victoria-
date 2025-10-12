// Sistema de Reintentos para Solicitudes HTTP
// Implementa un sistema de reintentos automáticos para manejar errores de red

class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.exponentialBackoff = options.exponentialBackoff || true;
    this.retryableErrors = options.retryableErrors || ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'];
  }

  // Calcular el retraso para el siguiente reintento
  calculateDelay(attempt) {
    if (this.exponentialBackoff) {
      return this.retryDelay * Math.pow(2, attempt - 1);
    }
    return this.retryDelay;
  }

  // Verificar si un error es reintentable
  isRetryable(error) {
    // Si es un error de red conocido
    if (this.retryableErrors.includes(error.code)) {
      return true;
    }
    
    // Si es un error HTTP 5xx (errores del servidor)
    if (error.response && error.response.status >= 500 && error.response.status < 600) {
      return true;
    }
    
    // Si es un error de red (sin respuesta)
    if (!error.response) {
      return true;
    }
    
    return false;
  }

  // Ejecutar una función con reintentos
  async execute(fn, retries = this.maxRetries) {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        lastError = error;
        
        // Si es el último intento o el error no es reintentable, lanzar el error
        if (attempt === retries || !this.isRetryable(error)) {
          throw error;
        }
        
        // Esperar antes de reintentar
        const delay = this.calculateDelay(attempt + 1);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  // Función de utilidad para esperar
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Función para realizar solicitudes fetch con reintentos
  async fetch(url, options = {}, retries = this.maxRetries) {
    return this.execute(async () => {
      const response = await fetch(url, options);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status}`);
        error.response = response;
        error.status = response.status;
        throw error;
      }
      
      return response;
    }, retries);
  }
}

// Crear una instancia global
window.retryHandler = new RetryHandler({
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true
});

// Función de utilidad para solicitudes HTTP con reintentos
window.httpRequest = async (url, options = {}) => {
  try {
    // Verificar si hay datos en caché
    const cacheKey = window.cache ? window.cache.generateKey(url, options) : null;
    if (cacheKey && window.cache) {
      const cachedData = window.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Realizar la solicitud con reintentos
    const response = await window.retryHandler.fetch(url, options);
    const data = await response.json();
    
    // Guardar en caché si es una solicitud GET
    if (cacheKey && window.cache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      window.cache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutos
    }
    
    return data;
  } catch (error) {
    console.error('Error en la solicitud HTTP:', error);
    throw error;
  }
};

// Exportar la clase para uso en módulos ES6
// NOTA: No usamos export porque este archivo se carga directamente en el HTML
// como un script normal, no como un módulo ES6.