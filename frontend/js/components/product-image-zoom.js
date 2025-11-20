/**
 * Product Image Zoom Enhancement
 * Añade zoom interactivo a las imágenes de productos
 */

(function () {
  'use strict';

  /**
   * Inicializar zoom en imágenes de productos
   */
  function initProductImageZoom() {
    // Observador para detectar nuevas imágenes agregadas dinámicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            attachZoomToImages(node);
          }
        });
      });
    });

    // Observar cambios en el DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Inicializar zoom en imágenes existentes
    attachZoomToImages(document);
  }

  /**
   * Adjuntar zoom a imágenes dentro de un contenedor
   */
  function attachZoomToImages(container) {
    const productImages = container.querySelectorAll
      ? container.querySelectorAll('.product-image, .product-card .product-image')
      : [];

    productImages.forEach((imageContainer) => {
      // Evitar duplicar listeners
      if (imageContainer.dataset.zoomEnabled) return;
      imageContainer.dataset.zoomEnabled = 'true';

      const img = imageContainer.querySelector('img');
      if (!img) return;

      // Zoom con seguimiento del mouse
      imageContainer.addEventListener('mousemove', (e) => {
        const rect = imageContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Actualizar variables CSS para el gradiente
        imageContainer.style.setProperty('--mouse-x', `${x}%`);
        imageContainer.style.setProperty('--mouse-y', `${y}%`);

        // Ajustar transform-origin para zoom centrado en el cursor
        img.style.transformOrigin = `${x}% ${y}%`;
      });

      // Reset al salir
      imageContainer.addEventListener('mouseleave', () => {
        img.style.transformOrigin = 'center center';
      });

      // Click para abrir Quick View (si está disponible)
      imageContainer.addEventListener('click', () => {
        const productCard = imageContainer.closest('.product-card');
        if (productCard && window.QuickViewModal) {
          const productId = productCard.dataset.productId;
          if (productId) {
            window.QuickViewModal.open(productId);
          }
        }
      });
    });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductImageZoom);
  } else {
    initProductImageZoom();
  }

  // Exportar para uso externo si es necesario
  window.ProductImageZoom = {
    init: initProductImageZoom,
    attachTo: attachZoomToImages,
  };
})();
