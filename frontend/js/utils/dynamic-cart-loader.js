/**
 * Dynamic Cart Loader - Code Splitting
 * Carga el código del carrito solo cuando se necesita
 * Reduce el bundle inicial en ~15KB
 */

class DynamicCartLoader {
  constructor() {
    this.cartModule = null;
    this.isLoading = false;
    this.isLoaded = false;
  }

  /**
   * Cargar módulo del carrito de forma asíncrona
   */
  async loadCartModule() {
    if (this.isLoaded) {
      return this.cartModule;
    }

    if (this.isLoading) {
      // Esperar si ya está cargando
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.isLoaded) {
            clearInterval(checkInterval);
            resolve(this.cartModule);
          }
        }, 100);
      });
    }

    this.isLoading = true;

    try {
      // Dynamic import - Code splitting
      const module = await import('/js/components/cart-manager.js');
      
      this.cartModule = module;
      this.isLoaded = true;
      this.isLoading = false;

      return module;
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  /**
   * Agregar producto al carrito (con carga dinámica)
   */
  async addToCart(product) {
    try {
      const cartModule = await this.loadCartModule();
      
      // Llamar función del módulo cargado
      if (cartModule.addToCart) {
        return cartModule.addToCart(product);
      } else if (window.addToCart) {
        return window.addToCart(product);
      } else {
        throw new Error('Función addToCart no disponible');
      }
    } catch (error) {
      // Fallback: mostrar mensaje al usuario
      alert('Error al agregar al carrito. Por favor, recarga la página.');
      throw error;
    }
  }

  /**
   * Abrir carrito (con carga dinámica)
   */
  async openCart() {
    try {
      const cartModule = await this.loadCartModule();
      
      if (cartModule.openMiniCart) {
        return cartModule.openMiniCart();
      } else if (window.openMiniCart) {
        return window.openMiniCart();
      }
      // Fallback: redirigir a página del carrito
      window.location.href = '/pages/cart.html';
      return null;
    } catch (error) {
      window.location.href = '/pages/cart.html';
      throw error;
    }
  }

  /**
   * Pre-cargar módulo en hover (optimización)
   */
  preloadOnHover() {
    const cartButtons = document.querySelectorAll('[data-preload-cart]');
    
    for (const button of cartButtons) {
      button.addEventListener('mouseenter', () => {
        if (!this.isLoaded && !this.isLoading) {
          this.loadCartModule();
        }
      }, { once: true, passive: true });
    }
  }
}

// Instancia global
window.dynamicCartLoader = new DynamicCartLoader();

// Wrapper para mantener compatibilidad con código existente
window.addToCartDynamic = async function addToCartDynamic(product) {
  return window.dynamicCartLoader.addToCart(product);
};

window.openCartDynamic = async function openCartDynamic() {
  return window.dynamicCartLoader.openCart();
};

// Pre-cargar en hover de botones de carrito
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dynamicCartLoader.preloadOnHover();
  });
} else {
  window.dynamicCartLoader.preloadOnHover();
}
