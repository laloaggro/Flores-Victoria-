// main.js - Punto de entrada principal de la aplicación

// === CHANGE TAG: v3.0.0 - Error Monitoring ===
import errorMonitor from '/js/utils/errorMonitor.js';
// Exponer para inspección en desarrollo
if (typeof window !== 'undefined') {
  window.__errorMonitor = errorMonitor;
}

// === CHANGE TAG: v1.0.0 - Initial setup ===
// La configuración de API se carga desde config/api.js como script global

// === CHANGE TAG: v1.1.0 - User Menu Sync ===
// Importar e inicializar el menú de usuario para TODAS las páginas que cargan /js/main.js
import UserMenu from '/js/components/utils/userMenu.js';
UserMenu.init();

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Funcionalidad básica del sitio
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar sistemas
  // eslint-disable-next-line no-undef
  if (typeof initCartSystem === 'function') {
    initCartSystem(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initThemeSystem === 'function') {
    initThemeSystem(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initUserSystem === 'function') {
    initUserSystem(); // eslint-disable-line no-undef
  }

  // Inicializar utilidades
  // eslint-disable-next-line no-undef
  if (typeof initAccessibility === 'function') {
    initAccessibility(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initAnalytics === 'function') {
    initAnalytics(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initErrorMonitoring === 'function') {
    initErrorMonitoring(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initI18n === 'function') {
    initI18n(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initNotifications === 'function') {
    initNotifications(); // eslint-disable-line no-undef
  }

  // Inicializar páginas
  // eslint-disable-next-line no-undef
  if (typeof initContactPage === 'function') {
    initContactPage(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initHomePage === 'function') {
    initHomePage(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initProductsPage === 'function') {
    initProductsPage(); // eslint-disable-line no-undef
  }

  // eslint-disable-next-line no-undef
  if (typeof initAdminPage === 'function') {
    initAdminPage(); // eslint-disable-line no-undef
  }

  console.log('Arreglos Victoria App initialized');
});
