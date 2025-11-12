/**
 * Utility functions
 * Funciones de utilidad comunes
 */

/**
 * Sleep/delay helper
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry con backoff exponencial
 * @param {Function} fn - Función a reintentar
 * @param {Object} options - Opciones
 * @returns {Promise}
 */
async function retry(fn, options = {}) {
  const { maxAttempts = 3, delay = 1000, backoff = 2, onRetry = null } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      const waitTime = delay * Math.pow(backoff, attempt - 1);

      if (onRetry) {
        onRetry(error, attempt, waitTime);
      }

      await sleep(waitTime);
    }
  }

  throw lastError;
}

/**
 * Genera un slug a partir de un texto
 * @param {string} text - Texto a convertir
 * @returns {string} Slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con -
    .replace(/-+/g, '-'); // Eliminar guiones duplicados
}

/**
 * Paginación helper
 * @param {number} page - Página actual
 * @param {number} limit - Items por página
 * @returns {Object} Skip y limit para MongoDB
 */
function getPagination(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return { skip, limit: Math.min(limit, 100) }; // Max 100 items
}

/**
 * Formatea respuesta paginada
 * @param {Array} data - Datos
 * @param {number} total - Total de items
 * @param {number} page - Página actual
 * @param {number} limit - Items por página
 * @returns {Object} Respuesta formateada
 */
function formatPaginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Genera un código aleatorio
 * @param {number} length - Longitud del código
 * @param {string} chars - Caracteres permitidos
 * @returns {string} Código generado
 */
function generateCode(length = 6, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Formatea precio en moneda local
 * @param {number} amount - Monto
 * @param {string} currency - Moneda
 * @returns {string} Precio formateado
 */
function formatCurrency(amount, currency = 'CLP') {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formatea fecha
 * @param {Date|string} date - Fecha
 * @param {string} locale - Locale
 * @returns {string} Fecha formateada
 */
function formatDate(date, locale = 'es-CL') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Calcula tiempo transcurrido en formato legible
 * @param {Date|string} date - Fecha
 * @returns {string} Tiempo transcurrido
 */
function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
    segundo: 1,
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);

    if (interval >= 1) {
      return interval === 1
        ? `hace 1 ${name}`
        : `hace ${interval} ${name}${name === 'mes' ? 'es' : 's'}`;
    }
  }

  return 'ahora mismo';
}

/**
 * Deep merge de objetos
 * @param {Object} target - Objeto destino
 * @param {Object} source - Objeto fuente
 * @returns {Object} Objeto merged
 */
function deepMerge(target, source) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

/**
 * Verifica si es un objeto
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Omit keys de un objeto
 * @param {Object} obj - Objeto
 * @param {string[]} keys - Keys a omitir
 * @returns {Object} Objeto sin las keys
 */
function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Pick keys de un objeto
 * @param {Object} obj - Objeto
 * @param {string[]} keys - Keys a mantener
 * @returns {Object} Objeto solo con las keys
 */
function pick(obj, keys) {
  const result = {};
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Debounce function
 * @param {Function} fn - Función a debounce
 * @param {number} delay - Delay en ms
 * @returns {Function} Función debounced
 */
function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Función a throttle
 * @param {number} limit - Límite en ms
 * @returns {Function} Función throttled
 */
function throttle(fn, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Grupo de chunks de un array
 * @param {Array} array - Array a dividir
 * @param {number} size - Tamaño de cada chunk
 * @returns {Array} Array de chunks
 */
function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Valores únicos de un array
 * @param {Array} array - Array
 * @returns {Array} Array con valores únicos
 */
function unique(array) {
  return [...new Set(array)];
}

/**
 * Randomiza un array (Fisher-Yates shuffle)
 * @param {Array} array - Array a randomizar
 * @returns {Array} Array randomizado
 */
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = {
  sleep,
  retry,
  slugify,
  getPagination,
  formatPaginatedResponse,
  generateCode,
  formatCurrency,
  formatDate,
  timeAgo,
  deepMerge,
  isObject,
  omit,
  pick,
  debounce,
  throttle,
  chunk,
  unique,
  shuffle,
};
