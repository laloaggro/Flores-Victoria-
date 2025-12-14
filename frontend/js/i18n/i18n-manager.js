/**
 * @fileoverview i18n Manager
 * @description Sistema de internacionalización para el frontend
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Idiomas soportados
 */
const SUPPORTED_LANGUAGES = ['es', 'en'];
const DEFAULT_LANGUAGE = 'es';
const STORAGE_KEY = 'fv-language';

/**
 * Gestor de internacionalización
 */
class I18nManager {
  constructor() {
    this.currentLanguage = DEFAULT_LANGUAGE;
    this.translations = {};
    this.loadedLanguages = new Set();
    this.observers = new Set();
    this.interpolateRegex = /\{\{(\w+)\}\}/g;
  }

  /**
   * Inicializa el sistema i18n
   */
  async init() {
    // Detectar idioma preferido
    this.currentLanguage = this.detectLanguage();

    // Cargar traducciones del idioma actual
    await this.loadLanguage(this.currentLanguage);

    // Establecer atributos HTML
    this.updateHtmlAttributes();

    // Agregar hreflang tags
    this.updateHreflangTags();

    
    return this;
  }

  /**
   * Detecta el idioma preferido del usuario
   * @returns {string}
   */
  detectLanguage() {
    // 1. Verificar almacenamiento local
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }

    // 2. Verificar parámetro URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
      return urlLang;
    }

    // 3. Verificar atributo html lang
    const htmlLang = document.documentElement.lang?.split('-')[0];
    if (htmlLang && SUPPORTED_LANGUAGES.includes(htmlLang)) {
      return htmlLang;
    }

    // 4. Verificar preferencias del navegador
    const browserLangs = navigator.languages || [navigator.language];
    for (const lang of browserLangs) {
      const shortLang = lang.split('-')[0];
      if (SUPPORTED_LANGUAGES.includes(shortLang)) {
        return shortLang;
      }
    }

    return DEFAULT_LANGUAGE;
  }

  /**
   * Carga un archivo de traducciones
   * @param {string} lang - Código de idioma
   */
  async loadLanguage(lang) {
    if (this.loadedLanguages.has(lang)) {
      return this.translations[lang];
    }

    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language: ${lang}`);
      }

      const translations = await response.json();
      this.translations[lang] = translations;
      this.loadedLanguages.add(lang);

      
      return translations;
    } catch (error) {
      console.error(`[i18n] Error loading language ${lang}:`, error);

      // Fallback a español si falla la carga
      if (lang !== DEFAULT_LANGUAGE) {
        return this.loadLanguage(DEFAULT_LANGUAGE);
      }

      return {};
    }
  }

  /**
   * Cambia el idioma actual
   * @param {string} lang - Nuevo idioma
   */
  async setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`[i18n] Language not supported: ${lang}`);
      return false;
    }

    if (lang === this.currentLanguage) {
      return true;
    }

    // Cargar traducciones si es necesario
    await this.loadLanguage(lang);

    this.currentLanguage = lang;

    // Guardar preferencia
    localStorage.setItem(STORAGE_KEY, lang);

    // Actualizar DOM
    this.updateHtmlAttributes();
    this.updateHreflangTags();
    this.translatePage();

    // Notificar observadores
    this.notifyObservers();

    
    return true;
  }

  /**
   * Obtiene una traducción por clave
   * @param {string} key - Clave de traducción (dot notation)
   * @param {Object} params - Parámetros para interpolación
   * @returns {string}
   */
  t(key, params = {}) {
    const translations = this.translations[this.currentLanguage] || {};
    let value = this.getNestedValue(translations, key);

    // Fallback al idioma por defecto
    if (value === undefined && this.currentLanguage !== DEFAULT_LANGUAGE) {
      const defaultTranslations = this.translations[DEFAULT_LANGUAGE] || {};
      value = this.getNestedValue(defaultTranslations, key);
    }

    // Si no existe, devolver la clave
    if (value === undefined) {
      console.warn(`[i18n] Missing translation: ${key}`);
      return key;
    }

    // Interpolación de parámetros
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      value = value.replace(this.interpolateRegex, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value;
  }

  /**
   * Obtiene valor anidado de un objeto
   * @private
   */
  getNestedValue(obj, key) {
    return key.split('.').reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
  }

  /**
   * Traduce elementos del DOM con atributo data-i18n
   */
  translatePage() {
    // Traducir contenido de texto
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      element.textContent = this.t(key);
    });

    // Traducir placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      element.placeholder = this.t(key);
    });

    // Traducir títulos
    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
      const key = element.dataset.i18nTitle;
      element.title = this.t(key);
    });

    // Traducir aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      const key = element.dataset.i18nAria;
      element.setAttribute('aria-label', this.t(key));
    });

    // Traducir meta tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.dataset.i18n) {
      metaDesc.content = this.t(metaDesc.dataset.i18n);
    }
  }

  /**
   * Actualiza atributos del elemento HTML
   */
  updateHtmlAttributes() {
    document.documentElement.lang = this.currentLanguage;
    document.documentElement.dir = this.getDirection(this.currentLanguage);
  }

  /**
   * Obtiene dirección del texto
   * @param {string} lang
   * @returns {string}
   */
  getDirection(lang) {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
  }

  /**
   * Actualiza tags hreflang para SEO
   */
  updateHreflangTags() {
    // Eliminar tags existentes
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

    const currentUrl = new URL(window.location.href);
    const head = document.head;

    // Agregar hreflang para cada idioma soportado
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;

      const langUrl = new URL(currentUrl);
      langUrl.searchParams.set('lang', lang);
      link.href = langUrl.toString();

      head.appendChild(link);
    });

    // Agregar x-default
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    const defaultUrl = new URL(currentUrl);
    defaultUrl.searchParams.delete('lang');
    defaultLink.href = defaultUrl.toString();
    head.appendChild(defaultLink);
  }

  /**
   * Registra un observador de cambio de idioma
   * @param {Function} callback
   */
  onLanguageChange(callback) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  /**
   * Notifica a observadores del cambio de idioma
   * @private
   */
  notifyObservers() {
    this.observers.forEach((callback) => {
      try {
        callback(this.currentLanguage);
      } catch (error) {
        console.error('[i18n] Observer error:', error);
      }
    });
  }

  /**
   * Obtiene idiomas soportados
   * @returns {string[]}
   */
  getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
  }

  /**
   * Obtiene idioma actual
   * @returns {string}
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Formatea número según localización
   * @param {number} num
   * @param {Object} options
   * @returns {string}
   */
  formatNumber(num, options = {}) {
    return new Intl.NumberFormat(this.currentLanguage, options).format(num);
  }

  /**
   * Formatea moneda según localización
   * @param {number} amount
   * @param {string} currency
   * @returns {string}
   */
  formatCurrency(amount, currency = 'MXN') {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Formatea fecha según localización
   * @param {Date|string|number} date
   * @param {Object} options
   * @returns {string}
   */
  formatDate(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(dateObj);
  }

  /**
   * Formatea fecha relativa
   * @param {Date|string|number} date
   * @returns {string}
   */
  formatRelativeTime(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = dateObj - now;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });

    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
    return rtf.format(diffDay, 'day');
  }
}

/**
 * Componente de selector de idioma
 */
class LanguageSelector {
  constructor(i18n, containerId) {
    this.i18n = i18n;
    this.container = document.getElementById(containerId);
    if (this.container) {
      this.render();
    }
  }

  render() {
    const languages = this.i18n.getSupportedLanguages();
    const current = this.i18n.getCurrentLanguage();

    const languageNames = {
      es: { name: 'Español', flag: '🇪🇸' },
      en: { name: 'English', flag: '🇺🇸' },
    };

    this.container.innerHTML = `
      <div class="language-selector">
        <button class="language-selector__toggle" aria-label="Select language">
          ${languageNames[current].flag} ${languageNames[current].name}
        </button>
        <ul class="language-selector__dropdown" hidden>
          ${languages
            .map(
              (lang) => `
            <li>
              <button 
                class="language-selector__option ${lang === current ? 'active' : ''}"
                data-lang="${lang}"
              >
                ${languageNames[lang].flag} ${languageNames[lang].name}
              </button>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const toggle = this.container.querySelector('.language-selector__toggle');
    const dropdown = this.container.querySelector('.language-selector__dropdown');
    const options = this.container.querySelectorAll('.language-selector__option');

    toggle?.addEventListener('click', () => {
      const isHidden = dropdown.hidden;
      dropdown.hidden = !isHidden;
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        const lang = option.dataset.lang;
        this.i18n.setLanguage(lang);
        dropdown.hidden = true;
        this.render();
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        dropdown.hidden = true;
      }
    });
  }
}

// Instancia global
const i18n = new I18nManager();

// Exports
export { i18n, I18nManager, LanguageSelector, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };
