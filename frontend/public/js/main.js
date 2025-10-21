// main.js - Punto de entrada principal de la aplicación

// === CHANGE TAG: v1.0.0 - Initial setup ===
// La configuración de API se carga desde config/api.js como script global

// === CHANGE TAG: v1.1.0 - User Menu Sync ===
// Importar e inicializar el menú de usuario para TODAS las páginas que cargan /js/main.js
import UserMenu from '/js/components/utils/userMenu.js';
UserMenu.init();

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Funcionalidad básica del sitio
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar sistemas
  if (typeof initCartSystem === 'function') {
    initCartSystem();
  }
  
  if (typeof initThemeSystem === 'function') {
    initThemeSystem();
  }
  
  if (typeof initUserSystem === 'function') {
    initUserSystem();
  }
  
  // Inicializar utilidades
  if (typeof initAccessibility === 'function') {
    initAccessibility();
  }
  
  if (typeof initAnalytics === 'function') {
    initAnalytics();
  }
  
  if (typeof initErrorMonitoring === 'function') {
    initErrorMonitoring();
  }
  
  if (typeof initI18n === 'function') {
    initI18n();
  }
  
  if (typeof initNotifications === 'function') {
    initNotifications();
  }
  
  // Inicializar páginas
  if (typeof initContactPage === 'function') {
    initContactPage();
  }
  
  if (typeof initHomePage === 'function') {
    initHomePage();
  }
  
  if (typeof initProductsPage === 'function') {
    initProductsPage();
  }
  
  if (typeof initAdminPage === 'function') {
    initAdminPage();
  }
  
  console.log('Arreglos Victoria App initialized');
});