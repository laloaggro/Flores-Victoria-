// main.js - Punto de entrada principal de la aplicación

// Importar componentes
import '../components/header/Header.js';
import '../components/header/Footer.js';
import '../components/header/ThemeToggle.js';
import '../components/header/MobileMenu.js';
import '../components/header/LanguageSelector.js';
import '../components/cart/Cart.js';
import '../components/cart/CartItem.js';
import '../components/product/ProductCard.js';
import '../components/product/Products.js';
import '../components/product/ProductDetail.js';
import '../components/utils/notifications.js';
import '../components/utils/analytics.js';
import '../components/utils/errorMonitoring.js';

// Importar páginas
import './pages/home.js';
import './pages/products.js';
import './pages/contact.js';
import './pages/admin.js';

// Importar utilidades
import './utils/theme.js';
import './utils/cart.js';
import './utils/user.js';
import './utils/accessibility.js';
import './utils/validations.js';

// Importar estilos
import '../css/main.css';
import '../css/theme.css';

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

// Función para inicializar el menú móvil
function initializeMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }
}

// Función para inicializar otros componentes
function initializeComponents() {
  // Inicializar componentes específicos de páginas
  initializeHomePage();
  initializeProductsPage();
  initializeContactPage();
  initializeAdminPage();
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