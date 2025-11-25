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
      const module = await import('../components/cart-manager.js');

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
      } else if (globalThis.addToCart) {
        return globalThis.addToCart(product);
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
      } else if (globalThis.openMiniCart) {
        return globalThis.openMiniCart();
      }
      // Fallback: redirigir a página del carrito
      globalThis.location.href = '/pages/cart.html';
      return null;
    } catch (error) {
      globalThis.location.href = '/pages/cart.html';
      throw error;
    }
  }

  /**
   * Pre-cargar módulo en hover (optimización)
   */
  preloadOnHover() {
    const cartButtons = document.querySelectorAll('[data-preload-cart]');

    for (const button of cartButtons) {
      button.addEventListener(
        'mouseenter',
        () => {
          if (!this.isLoaded && !this.isLoading) {
            this.loadCartModule();
          }
        },
        { once: true, passive: true }
      );
    }
  }
}

// Instancia global
globalThis.dynamicCartLoader = new DynamicCartLoader();

// Wrapper para mantener compatibilidad con código existente
globalThis.addToCartDynamic = async function addToCartDynamic(product) {
  return globalThis.dynamicCartLoader.addToCart(product);
};

globalThis.openCartDynamic = async function openCartDynamic() {
  return globalThis.dynamicCartLoader.openCart();
};

// Pre-cargar en hover de botones de carrito
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    globalThis.dynamicCartLoader.preloadOnHover();
  });
} else {
  globalThis.dynamicCartLoader.preloadOnHover();
}
