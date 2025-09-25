// main.js - Punto de entrada principal de la aplicación

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Importar configuración
import './config/api.js'; // CONFIG: api

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Importar componentes
import '../../components/header/Footer.js';  // COMPONENTE: Footer
import '../../components/header/ThemeToggle.js';  // COMPONENTE: ThemeToggle
import '../../components/header/MobileMenu.js';  // COMPONENTE: MobileMenu
import '../../components/header/LanguageSelector.js';  // COMPONENTE: LanguageSelector
import '../../components/cart/Cart.js';  // COMPONENTE: Cart
import '../../components/cart/CartItem.js';  // COMPONENTE: CartItem
import '../../components/product/ProductCard.js';  // COMPONENTE: ProductCard
import '../../components/product/Products.js';  // COMPONENTE: Products
import '../../components/product/ProductDetail.js';  // COMPONENTE: ProductDetail
import '../../components/utils/notifications.js';  // UTILIDAD: notifications
import '../../components/utils/analytics.js';  // UTILIDAD: analytics
import '../../components/utils/errorMonitoring.js';  // UTILIDAD: errorMonitoring

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Importar páginas
import './pages/contact.js';  // PÁGINA: contact
import './pages/home.js';  // PÁGINA: home
import './pages/products.js';  // PÁGINA: products
import './pages/admin.js';  // PÁGINA: admin

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Importar utilidades
import { initializeTheme } from './components/utils/theme.js';  // UTILIDAD: theme
import { initializeCart } from './components/utils/cart.js';  // UTILIDAD: cart
import { initializeUser } from './components/utils/user.js';  // UTILIDAD: user
import { initAccessibility as initializeMobileMenu } from './components/utils/accessibility.js';  // UTILIDAD: accessibility
import './components/utils/utils.js';  // UTILIDAD: utils

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  console.log('Arreglos Victoria App initialized');
  
  // Inicializar componentes
  initializeTheme();
  initializeCart();
  initializeUser();
  initializeMobileMenu();
});

// === CHANGE TAG: v2.1.0 - Fix user menu initialization conflict ===
// Fecha: 2025-09-21
// Motivo: Corregir error "Uncaught (in promise) Error: A listener indicated an asynchronous response"
// Acción: Mover la inicialización del menú de usuario a una carga diferida para evitar conflictos
// === CHANGE TAG: v2.1.0 - Fix user menu initialization conflict ===
// Función para inicializar el menú móvil
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('active');
    });
    
    // Cerrar el menú cuando se hace clic fuera de él
    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target) && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
      }
    });
    
    // Cerrar el menú cuando se redimensiona la ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        mobileMenu.classList.remove('active');
      }
    });
  }
}

// Función para inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  console.log('Arreglos Victoria App initialized');
  
  // Inicializar tema
  initializeTheme();
  
  // Inicializar carrito
  initializeCart();
  
  // Inicializar menú móvil
  initializeMobileMenu();
  initMobileMenu(); // Inicializar funcionalidad del menú móvil
  
  // Inicializar sistema de usuarios
  initializeUser();
});

// === CHANGE TAG: v2.1.0 - Fix user menu initialization conflict ===
// Función para inicializar otros componentes
function initializeComponents() {
  // Inicializar componentes adicionales si es necesario
  console.log('Additional components initialized');
  
  // Cargar e inicializar el menú de usuario de forma asíncrona
  import('./components/utils/pageUserMenu.js')
    .then(module => {
      module.init();
    })
    .catch(error => {
      console.error('Error al cargar pageUserMenu.js:', error);
    });
}
// === CHANGE TAG: v2.1.0 - Fix user menu initialization conflict ===

// === CHANGE TAG: v1.0.0 - Initial setup ===
// Servicio de notificaciones
const notificationService = {
  show(message, type = 'info') {  // FUNCIÓN: show notification
    const notification = document.createElement('div');  // ELEMENTO: notification div
    notification.className = `notification notification-${type}`;  // CLASE: notification
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Cerrar notificación
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    });
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }
    }, 5000);
  }
};

// Exportar el servicio de notificaciones
export { notificationService };

// Función para obtener parámetros de la URL
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const paramsObj = {};
  for (const [key, value] of params) {
    paramsObj[key] = value;
  }
  return paramsObj;
}

// Función para formatear precios
export function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(price);
}

// Función para validar email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Función para validar teléfono
export function validatePhone(phone) {
  const re = /^\+?[\d\s\-\(\)]{8,}$/;
  return re.test(phone);
}

// Función para mostrar errores de validación
export function showValidationError(field, message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  // Remover error existente si lo hay
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  field.parentNode.appendChild(errorElement);
  field.classList.add('error');
}

// Función para limpiar errores de validación
export function clearValidationError(field) {
  const errorElement = field.parentNode.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
  field.classList.remove('error');
}

// Función para hacer scroll suave
export function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Función para cargar contenido dinámicamente
export async function loadContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al cargar contenido: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error al cargar contenido:', error);
    throw error;
  }
}

// Verificar el estado de autenticación cuando la página se carga completamente
window.addEventListener('load', () => {
  // Disparar evento de cambio de estado de autenticación
  const event = new Event('authStatusChanged');
  document.dispatchEvent(event);
});