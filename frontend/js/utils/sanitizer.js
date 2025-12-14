/**
 * @fileoverview Input Sanitizer para Frontend
 * @description Sanitización de contenido dinámico para prevenir XSS
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    span: ['class'],
  },
  allowedProtocols: ['http', 'https', 'mailto'],
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'noscript'],
};

/**
 * Entidades HTML para escape
 */
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Regex para detectar patrones peligrosos
 */
const DANGEROUS_PATTERNS = [
  /javascript:/gi,
  /data:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi, // onclick, onerror, etc.
  /<script/gi,
  /<\/script/gi,
  /<!--/g,
  /-->/g,
  /expression\s*\(/gi, // CSS expression
  /url\s*\(/gi, // CSS url()
];

/**
 * Clase principal de Sanitizer
 */
class Sanitizer {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Escapa caracteres HTML
   * @param {string} str - String a escapar
   * @returns {string}
   */
  escapeHtml(str) {
    if (typeof str !== 'string') {
      return String(str || '');
    }
    return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
  }

  /**
   * Sanitiza HTML permitiendo solo tags seguros
   * @param {string} html - HTML a sanitizar
   * @param {Object} options - Opciones de sanitización
   * @returns {string}
   */
  sanitizeHtml(html, options = {}) {
    if (typeof html !== 'string') {
      return '';
    }

    const config = { ...this.config, ...options };
    let result = html;

    // Remover tags peligrosos completamente
    for (const tag of config.stripIgnoreTagBody) {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
      result = result.replace(regex, '');
    }

    // Detectar y remover patrones peligrosos
    for (const pattern of DANGEROUS_PATTERNS) {
      result = result.replace(pattern, '');
    }

    // Parsear y reconstruir HTML seguro
    result = this._parseAndClean(result, config);

    return result;
  }

  /**
   * Parsea y limpia HTML
   * @private
   */
  _parseAndClean(html, config) {
    // Parser simple basado en regex para evitar dependencias
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*)>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
      // Añadir texto antes del tag (escapado)
      if (match.index > lastIndex) {
        const text = html.slice(lastIndex, match.index);
        parts.push(this.escapeHtml(text));
      }

      const [fullMatch, tagName, attributes] = match;
      const isClosing = fullMatch.startsWith('</');
      const normalizedTag = tagName.toLowerCase();

      if (config.allowedTags.includes(normalizedTag)) {
        if (isClosing) {
          parts.push(`</${normalizedTag}>`);
        } else {
          const cleanedAttrs = this._cleanAttributes(normalizedTag, attributes, config);
          parts.push(`<${normalizedTag}${cleanedAttrs ? ' ' + cleanedAttrs : ''}>`);
        }
      }
      // Tags no permitidos se omiten

      lastIndex = match.index + fullMatch.length;
    }

    // Añadir texto restante
    if (lastIndex < html.length) {
      parts.push(this.escapeHtml(html.slice(lastIndex)));
    }

    return parts.join('');
  }

  /**
   * Limpia atributos de un tag
   * @private
   */
  _cleanAttributes(tagName, attrString, config) {
    const allowedAttrs = config.allowedAttributes[tagName] || [];
    if (allowedAttrs.length === 0 || !attrString.trim()) {
      return '';
    }

    const attrRegex = /([a-zA-Z-]+)\s*=\s*["']([^"']*)["']/g;
    const cleanedAttrs = [];
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const [, attrName, attrValue] = attrMatch;
      const normalizedAttr = attrName.toLowerCase();

      if (allowedAttrs.includes(normalizedAttr)) {
        // Validar URLs en href/src
        if (['href', 'src'].includes(normalizedAttr)) {
          if (!this._isValidUrl(attrValue, config.allowedProtocols)) {
            continue;
          }
        }

        // Escapar valor del atributo
        const safeValue = this.escapeHtml(attrValue);
        cleanedAttrs.push(`${normalizedAttr}="${safeValue}"`);
      }
    }

    return cleanedAttrs.join(' ');
  }

  /**
   * Valida URL contra protocolos permitidos
   * @private
   */
  _isValidUrl(url, allowedProtocols) {
    const trimmedUrl = url.trim().toLowerCase();

    // URLs relativas son seguras
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
      return true;
    }

    // Verificar protocolo
    for (const protocol of allowedProtocols) {
      if (trimmedUrl.startsWith(`${protocol}:`)) {
        return true;
      }
    }

    // Rechazar si tiene otro protocolo
    if (trimmedUrl.includes(':')) {
      return false;
    }

    return true;
  }

  /**
   * Sanitiza texto plano (sin HTML)
   * @param {string} text - Texto a sanitizar
   * @returns {string}
   */
  sanitizeText(text) {
    if (typeof text !== 'string') {
      return String(text || '');
    }
    return this.escapeHtml(text.trim());
  }

  /**
   * Sanitiza para uso en atributos HTML
   * @param {string} value - Valor del atributo
   * @returns {string}
   */
  sanitizeAttribute(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return this.escapeHtml(value)
      .replace(/\n/g, '&#10;')
      .replace(/\r/g, '&#13;');
  }

  /**
   * Sanitiza para uso en URLs
   * @param {string} url - URL a sanitizar
   * @returns {string}
   */
  sanitizeUrl(url) {
    if (typeof url !== 'string') {
      return '';
    }

    const trimmed = url.trim();

    // Verificar protocolo seguro
    if (!this._isValidUrl(trimmed, this.config.allowedProtocols)) {
      return '#';
    }

    return encodeURI(trimmed);
  }

  /**
   * Sanitiza JSON para inserción segura en HTML
   * @param {*} data - Datos a serializar
   * @returns {string}
   */
  sanitizeJson(data) {
    const json = JSON.stringify(data);
    // Escapar caracteres que podrían romper el contexto HTML
    return json
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
  }

  /**
   * Detecta contenido potencialmente peligroso
   * @param {string} content - Contenido a analizar
   * @returns {{safe: boolean, threats: string[]}}
   */
  detectThreats(content) {
    if (typeof content !== 'string') {
      return { safe: true, threats: [] };
    }

    const threats = [];

    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(content)) {
        threats.push(pattern.toString());
        pattern.lastIndex = 0; // Reset regex
      }
    }

    return {
      safe: threats.length === 0,
      threats,
    };
  }
}

/**
 * Helper para renderizar contenido de usuario de forma segura
 * @param {HTMLElement} element - Elemento donde insertar
 * @param {string} content - Contenido a insertar
 * @param {Object} options - Opciones
 */
const safeRender = (element, content, options = {}) => {
  const sanitizer = new Sanitizer(options);

  if (options.allowHtml) {
    element.innerHTML = sanitizer.sanitizeHtml(content);
  } else {
    element.textContent = sanitizer.sanitizeText(content);
  }
};

/**
 * Template tag para strings sanitizados
 * @example html`<div>${userInput}</div>`
 */
const html = (strings, ...values) => {
  const sanitizer = new Sanitizer();
  const result = [];

  strings.forEach((str, i) => {
    result.push(str);
    if (i < values.length) {
      result.push(sanitizer.escapeHtml(String(values[i])));
    }
  });

  return result.join('');
};

/**
 * Crea un element seguro con contenido sanitizado
 * @param {string} tag - Tag del elemento
 * @param {Object} attrs - Atributos
 * @param {string} content - Contenido
 */
const createSafeElement = (tag, attrs = {}, content = '') => {
  const sanitizer = new Sanitizer();
  const element = document.createElement(tag);

  // Sanitizar y aplicar atributos
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') {
      element.className = sanitizer.sanitizeAttribute(value);
    } else if (key === 'href' || key === 'src') {
      element.setAttribute(key, sanitizer.sanitizeUrl(value));
    } else if (!key.startsWith('on')) {
      // No permitir event handlers
      element.setAttribute(key, sanitizer.sanitizeAttribute(value));
    }
  }

  // Añadir contenido como texto seguro
  element.textContent = sanitizer.sanitizeText(content);

  return element;
};

// Instancia global para uso directo
const defaultSanitizer = new Sanitizer();

// Export para módulos ES6 y CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Sanitizer,
    safeRender,
    html,
    createSafeElement,
    defaultSanitizer,
    escapeHtml: (str) => defaultSanitizer.escapeHtml(str),
    sanitizeHtml: (str, opts) => defaultSanitizer.sanitizeHtml(str, opts),
    sanitizeText: (str) => defaultSanitizer.sanitizeText(str),
    sanitizeUrl: (str) => defaultSanitizer.sanitizeUrl(str),
    detectThreats: (str) => defaultSanitizer.detectThreats(str),
  };
}

// Export global para browser
if (typeof window !== 'undefined') {
  window.Sanitizer = Sanitizer;
  window.safeRender = safeRender;
  window.html = html;
  window.createSafeElement = createSafeElement;
  window.sanitize = defaultSanitizer;
}
