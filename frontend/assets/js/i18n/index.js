// Sistema de internacionalización para el sitio web
import esTranslations from './es.js';
import enTranslations from './en.js';

const translations = {
  es: esTranslations,
  en: enTranslations
};

class I18n {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.translations = translations;
  }

  detectLanguage() {
    // Detectar idioma del navegador
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.split('-')[0];
    
    // Verificar si el idioma está soportado
    return this.translations[lang] ? lang : 'es'; // Por defecto español
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      this.updatePageLanguage();
      return true;
    }
    return false;
  }

  t(key) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (!translation[k]) {
        // Si no se encuentra la traducción, devolver la clave
        return key;
      }
      translation = translation[k];
    }
    
    return translation;
  }

  updatePageLanguage() {
    // Actualizar el atributo lang del html
    document.documentElement.lang = this.currentLanguage;
    
    // Emitir evento de cambio de idioma
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: this.currentLanguage }
    }));
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getSupportedLanguages() {
    return Object.keys(this.translations);
  }
}

// Crear instancia global
const i18n = new I18n();

// Exportar para su uso en otros módulos
export default i18n;

// Función para facilitar el uso en el HTML
export function t(key) {
  return i18n.t(key);
}