// Sistema de internacionalización para el sitio web
import enTranslations from './en.js';
import esTranslations from './es.js';

const translations = {
  es: esTranslations,
  en: enTranslations,
};

class I18n {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.translations = translations;
  }

  detectLanguage() {
    // Verificar si hay un idioma guardado en localStorage
    const savedLang = localStorage.getItem('language');
    if (savedLang && this.translations && this.translations[savedLang]) {
      return savedLang;
    }

    // Detectar idioma del navegador
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.split('-')[0];

    // Verificar si el idioma está soportado
    if (this.translations && this.translations[lang]) {
      return lang;
    }

    // Por defecto español
    return 'es';
  }

  setLanguage(lang) {
    if (this.translations && this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      this.updatePageLanguage();
      return true;
    }
    return false;
  }

  t(key) {
    const translation = this.translations[this.currentLanguage];
    if (!translation) return key;

    // Manejar claves anidadas (por ejemplo, 'common.home')
    const keys = key.split('.');
    let value = translation;

    for (const k of keys) {
      if (value && typeof value === 'object' && value[k] !== undefined) {
        value = value[k];
      } else {
        return key; // Devolver la clave original si no se encuentra la traducción
      }
    }

    return value;
  }

  updatePageLanguage() {
    // Actualizar todos los elementos con el atributo data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });

    // Disparar evento personalizado
    document.dispatchEvent(
      new CustomEvent('languageChanged', {
        detail: { language: this.currentLanguage },
      })
    );
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getSupportedLanguages() {
    return Object.keys(this.translations);
  }
}

// Verificar si ya existe un sistema de i18n global
let i18nInstance;
if (typeof window.i18n === 'undefined') {
  // Crear instancia global si no existe
  i18nInstance = new I18n();
  window.i18n = i18nInstance;
} else {
  // Usar el sistema de i18n existente
  i18nInstance = window.i18n;
}

export default i18nInstance;
