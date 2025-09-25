// i18n.js - Sistema de internacionalización

// Verificar si ya existe un sistema de i18n global
if (typeof window.i18n !== 'undefined') {
  // Si ya existe, usarlo y salir
  export default window.i18n;
} else {
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
      'search-placeholder': 'Buscar productos...',
      'no-products': 'No se encontraron productos',
      'product-added': 'Producto agregado al carrito',
      'product-added-wishlist': 'Producto agregado a la lista de deseos',
      'product-removed-wishlist': 'Producto eliminado de la lista de deseos',
          
      // Detalles del producto
      'product-description': 'Descripción',
      'product-price': 'Precio',
      'add-to-cart': 'Agregar al carrito',
      'add-to-wishlist': 'Agregar a lista de deseos',
      'remove-from-wishlist': 'Eliminar de lista de deseos',
      'quantity': 'Cantidad',
      'related-products': 'Productos relacionados',
          
      // Carrito
      'shopping-cart': 'Carrito de compras',
      'cart-empty': 'Tu carrito está vacío',
      'cart-continue-shopping': 'Continuar comprando',
      'cart-checkout': 'Proceder al pago',
      'cart-total': 'Total',
      'cart-remove': 'Eliminar',
      'cart-update': 'Actualizar',
          
      // Lista de deseos
      'wishlist-title': 'Lista de deseos',
      'wishlist-empty': 'Tu lista de deseos está vacía',
      'wishlist-continue-shopping': 'Continuar comprando',
      'wishlist-add-to-cart': 'Agregar al carrito',
          
      // Pie de página
      'footer-hours': 'Lunes a Domingo 9:00 AM - 9:00 PM',
      'quick-links': 'Enlaces Rápidos',
      'information': 'Información',
      'opening-hours': 'Horario de Atención',
          
      // Tema
      'theme-toggle-light': 'Cambiar a modo claro',
      'theme-toggle-dark': 'Cambiar a modo oscuro'
    },
    
    en: {
      // Navigation
      'home': 'Home',
      'products': 'Products',
      'about': 'About',
      'contact': 'Contact',
      'login': 'Login',
      'cart': 'Cart',
      'wishlist': 'Wishlist',
      'account': 'My Account',
      'logout': 'Logout',
          
      // Home page
      'welcome': 'Welcome to Arreglos Victoria',
      'hero-subtitle': 'More than 20 years creating beautiful moments',
      'featured-products': 'Featured Products',
      'view-all': 'View all',
          
      // Products page
      'our-products': 'Our Products',
      'filters': 'Filters',
      'clear-filters': 'Clear filters',
      'category': 'Category',
      'price-range': 'Price range',
      'sort-by': 'Sort by',
      'name': 'Name',
      'price-low': 'Price: Low to High',
      'price-high': 'Price: High to Low',
      'search-placeholder': 'Search products...',
      'no-products': 'No products found',
      'product-added': 'Product added to cart',
      'product-added-wishlist': 'Product added to wishlist',
      'product-removed-wishlist': 'Product removed from wishlist',
          
      // Product details
      'product-description': 'Description',
      'product-price': 'Price',
      'add-to-cart': 'Add to cart',
      'add-to-wishlist': 'Add to wishlist',
      'remove-from-wishlist': 'Remove from wishlist',
      'quantity': 'Quantity',
      'related-products': 'Related products',
          
      // Cart
      'shopping-cart': 'Shopping Cart',
      'cart-empty': 'Your cart is empty',
      'cart-continue-shopping': 'Continue shopping',
      'cart-checkout': 'Proceed to checkout',
      'cart-total': 'Total',
      'cart-remove': 'Remove',
      'cart-update': 'Update',
          
      // Wishlist
      'wishlist-title': 'Wishlist',
      'wishlist-empty': 'Your wishlist is empty',
      'wishlist-continue-shopping': 'Continue shopping',
      'wishlist-add-to-cart': 'Add to cart',
          
      // Footer
      'footer-hours': 'Monday to Sunday 9:00 AM - 9:00 PM',
      'quick-links': 'Quick Links',
      'information': 'Information',
      'opening-hours': 'Opening Hours',
          
      // Theme
      'theme-toggle-light': 'Switch to light mode',
      'theme-toggle-dark': 'Switch to dark mode'
    }
  };

  class I18n {
    constructor() {
      this.currentLanguage = this.detectLanguage();
      this.translations = translations;
    }
    
    detectLanguage() {
      // Verificar si hay un idioma guardado en localStorage
      const savedLang = localStorage.getItem('language');
      if (savedLang && this.translations[savedLang]) {
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
      if (this.translations[lang]) {
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
      elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = this.t(key);
      });
      
      // Disparar evento personalizado
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
  
  // Hacerlo disponible globalmente
  window.i18n = i18n;
  
  // Exportar para uso en módulos
  export default i18n;
}