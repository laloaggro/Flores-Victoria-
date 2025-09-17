// i18n.js - Sistema de internacionalización

// Diccionarios de traducción
const translations = {
  es: {
    // Navegación
    'home': 'Inicio',
    'products': 'Productos',
    'about': 'Nosotros',
    'contact': 'Contacto',
    'login': 'Iniciar sesión',
    'cart': 'Carrito',
    'wishlist': 'Lista de deseos',
    'account': 'Mi cuenta',
    'logout': 'Cerrar sesión',
        
    // Página de inicio
    'welcome': 'Bienvenidos a Arreglos Victoria',
    'hero-subtitle': 'Más de 20 años creando hermosos momentos',
    'featured-products': 'Productos Destacados',
    'view-all': 'Ver todos',
        
    // Página de productos
    'our-products': 'Nuestros Productos',
    'filters': 'Filtros',
    'clear-filters': 'Limpiar filtros',
    'category': 'Categoría',
    'price-range': 'Rango de precio',
    'sort-by': 'Ordenar por',
    'name': 'Nombre',
    'price-low': 'Precio: Menor a Mayor',
    'price-high': 'Precio: Mayor a Menor',
    'newest': 'Más recientes',
        
    // Página de producto
    'add-to-cart': 'Agregar al carrito',
    'add-to-wishlist': 'Agregar a lista de deseos',
    'description': 'Descripción',
    'related-products': 'Productos relacionados',
        
    // Carrito
    'shopping-cart': 'Carrito de compras',
    'quantity': 'Cantidad',
    'price': 'Precio',
    'total': 'Total',
    'remove': 'Eliminar',
    'continue-shopping': 'Continuar comprando',
    'checkout': 'Finalizar compra',
    'empty-cart': 'Tu carrito está vacío',
        
    // Formularios
    'name-label': 'Nombre',
    'email-label': 'Correo electrónico',
    'password-label': 'Contraseña',
    'confirm-password-label': 'Confirmar contraseña',
    'phone-label': 'Teléfono',
    'message-label': 'Mensaje',
    'send-message': 'Enviar mensaje',
        
    // General
    'search': 'Buscar',
    'close': 'Cerrar',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito'
  },
    
  en: {
    // Navegación
    'home': 'Home',
    'products': 'Products',
    'about': 'About',
    'contact': 'Contact',
    'login': 'Login',
    'cart': 'Cart',
    'wishlist': 'Wishlist',
    'account': 'My Account',
    'logout': 'Logout',
        
    // Página de inicio
    'welcome': 'Welcome to Arreglos Victoria',
    'hero-subtitle': 'More than 20 years creating beautiful moments',
    'featured-products': 'Featured Products',
    'view-all': 'View all',
        
    // Página de productos
    'our-products': 'Our Products',
    'filters': 'Filters',
    'clear-filters': 'Clear filters',
    'category': 'Category',
    'price-range': 'Price range',
    'sort-by': 'Sort by',
    'name': 'Name',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    'newest': 'Newest',
        
    // Página de producto
    'add-to-cart': 'Add to cart',
    'add-to-wishlist': 'Add to wishlist',
    'description': 'Description',
    'related-products': 'Related products',
        
    // Carrito
    'shopping-cart': 'Shopping Cart',
    'quantity': 'Quantity',
    'price': 'Price',
    'total': 'Total',
    'remove': 'Remove',
    'continue-shopping': 'Continue shopping',
    'checkout': 'Checkout',
    'empty-cart': 'Your cart is empty',
        
    // Formularios
    'name-label': 'Name',
    'email-label': 'Email',
    'password-label': 'Password',
    'confirm-password-label': 'Confirm password',
    'phone-label': 'Phone',
    'message-label': 'Message',
    'send-message': 'Send message',
        
    // General
    'search': 'Search',
    'close': 'Close',
    'save': 'Save',
    'cancel': 'Cancel',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success'
  }
};

// Idioma actual
let currentLanguage = 'es';

// Detectar idioma del navegador
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('en') ? 'en' : 'es';
}

// Establecer idioma
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    translatePage();
    return true;
  }
  return false;
}

// Obtener idioma actual
export function getCurrentLanguage() {
  return currentLanguage;
}

// Obtener traducción para una clave
export function t(key) {
  return translations[currentLanguage][key] || key;
}

// Traducir toda la página
function translatePage() {
  // Traducir elementos con el atributo data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
        
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  });
    
  // Disparar evento de cambio de idioma
  document.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: currentLanguage }
  }));
}

// Inicializar internacionalización
export function initializeI18n() {
  console.log('🌍 Inicializando internacionalización');
    
  // Verificar si hay un idioma guardado
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage;
  } else {
    // Detectar idioma del navegador
    currentLanguage = detectLanguage();
  }
    
  // Traducir página
  translatePage();
    
  console.log(`✅ Internacionalización inicializada. Idioma: ${currentLanguage}`);
}

// Escuchar cambios en el DOM para traducir nuevos elementos
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.hasAttribute && node.hasAttribute('data-i18n')) {
            const key = node.getAttribute('data-i18n');
            const translation = t(key);
                        
            if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
              node.placeholder = translation;
            } else {
              node.textContent = translation;
            }
          }
                    
          // También buscar elementos hijos
          const children = node.querySelectorAll && node.querySelectorAll('[data-i18n]');
          if (children) {
            children.forEach(child => {
              const key = child.getAttribute('data-i18n');
              const translation = t(key);
                            
              if (child.tagName === 'INPUT' || child.tagName === 'TEXTAREA') {
                child.placeholder = translation;
              } else {
                child.textContent = translation;
              }
            });
          }
        }
      });
    }
  });
});

// Iniciar observador
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Inicializar cuando el DOM esté cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeI18n);
} else {
  initializeI18n();
}