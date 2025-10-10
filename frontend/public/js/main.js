// main.js - Punto de entrada principal de la aplicación

// === CHANGE TAG: v1.0.0 - Initial setup ===
// NOTA: No usamos import porque este archivo se carga como un script normal
// Si necesitas módulos, usa 'type="module"' en la etiqueta script en el HTML
// import './config/api.js'; // CONFIG: api

// === CHANGE TAG: v1.0.0 - Initial setup ===
// NOTA: No usamos import porque este archivo se carga como un script normal
// Si necesitas módulos, usa 'type="module"' en la etiqueta script en el HTML
// import '../../components/header/Footer.js';  // COMPONENTE: Footer
// import '../../components/header/ThemeToggle.js';  // COMPONENTE: ThemeToggle
// import '../../components/header/MobileMenu.js';  // COMPONENTE: MobileMenu

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Importar utilidades
import '../utils/accessibility.js';  // UTIL: accessibility
import '../utils/analytics.js';  // UTIL: analytics
import '../utils/errorMonitoring.js';  // UTIL: errorMonitoring
import '../utils/i18n.js';  // UTIL: i18n
import '../utils/notifications.js';  // UTIL: notifications

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Importar sistemas
import '../systems/cart.js';  // SISTEMA: cart
import '../systems/theme.js';  // SISTEMA: theme
import '../systems/user.js';  // SISTEMA: user

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Importar páginas
import '../pages/contact.js';  // PÁGINA: contact
import '../pages/home.js';  // PÁGINA: home
import '../pages/products.js';  // PÁGINA: products
import '../pages/admin.js';  // PÁGINA: admin

// === CHANGE TAG: v2.1.0 - Fix module loading issues ===
// Fecha: 2025-09-21
// Motivo: Corregir problemas de carga de módulos ES6
// Acción: Reemplazar imports con carga dinámica o carga directa en HTML
// NOTA: No usamos import porque este archivo se carga como un script normal
// Si necesitas módulos, usa 'type="module"' en la etiqueta script en el HTML
/*
import '../utils/accessibility.js';  // UTIL: accessibility
import '../utils/analytics.js';  // UTIL: analytics
import '../utils/errorMonitoring.js';  // UTIL: errorMonitoring
import '../utils/i18n.js';  // UTIL: i18n
import '../utils/notifications.js';  // UTIL: notifications

import '../systems/cart.js';  // SISTEMA: cart
import '../systems/theme.js';  // SISTEMA: theme
import '../systems/user.js';  // SISTEMA: user

import '../pages/contact.js';  // PÁGINA: contact
import '../pages/home.js';  // PÁGINA: home
import '../pages/products.js';  // PÁGINA: products
import '../pages/admin.js';  // PÁGINA: admin
*/

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Inicializar la aplicación cuando el DOM esté listo
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