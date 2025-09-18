// main.js - Punto de entrada principal de la aplicación

// Importar componentes
import '../../components/header/Header.js';
import '../../components/header/Footer.js';
import '../../components/header/ThemeToggle.js';
import '../../components/header/MobileMenu.js';
import '../../components/header/LanguageSelector.js';
import '../../components/cart/Cart.js';
import '../../components/cart/CartItem.js';
import '../../components/product/ProductCard.js';
import '../../components/product/Products.js';
import '../../components/product/ProductDetail.js';
import '../../components/utils/notifications.js';
import '../../components/utils/analytics.js';
import '../../components/utils/errorMonitoring.js';

// Importar páginas
import './pages/contact.js';
import './pages/home.js';
import './pages/products.js';
import './pages/admin.js';

// Importar utilidades
import { initializeTheme } from './components/utils/theme.js';
import { initializeCart } from './components/utils/cart.js';
import { initializeUser } from './components/utils/user.js';
import { initAccessibility as initializeMobileMenu } from './components/utils/accessibility.js';
import './components/utils/utils.js';


// Función para inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  console.log('Arreglos Victoria App initialized');
  
  // Inicializar tema
  initializeTheme();
  
  // Inicializar carrito
  initializeCart();
  
  // Inicializar menú móvil
  initializeMobileMenu();
  
  // Inicializar otros componentes
  initializeComponents();
});


// Función para inicializar otros componentes
function initializeComponents() {
  // Inicializar componentes adicionales si es necesario
  console.log('Additional components initialized');
}

// Servicio de notificaciones
export const notificationService = {
  show(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
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

export default {
  notificationService,
  getUrlParams,
  formatPrice,
  validateEmail,
  validatePhone,
  showValidationError,
  clearValidationError,
  smoothScrollTo,
  loadContent
};