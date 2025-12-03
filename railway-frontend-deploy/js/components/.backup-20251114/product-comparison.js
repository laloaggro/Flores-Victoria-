/**
 * ============================================================================
 * Product Comparison Component v1.0.0 - Flores Victoria
 * ============================================================================
 *
 * Sistema de comparación de productos lado a lado
 *
 * ⚠️  IMPORTANTE: Requiere CSS externo
 * ============================================================================
 * Este componente requiere el archivo CSS externo:
 *   /css/components/product-comparison.css
 *
 * Asegúrate de incluir en tu HTML ANTES de este script:
 *   <link rel="stylesheet" href="/css/components/product-comparison.css">
 *   <script src="/js/components/product-comparison.js"></script>
 *
 * @author Flores Victoria Team
 * @version 1.0.0
 * @date 2025-11-12
 *
 * @example
 * const comparison = new ProductComparison(productsData);
 * comparison.addProduct(productId);
 * comparison.removeProduct(productId);
 * comparison.showComparisonModal();
 */

(function () {
  'use strict';

  class ProductComparison {
    constructor(products, config = {}) {
      this.products = products || [];
      this.config = {
        maxProducts: 4,
        minProducts: 2,
        storageKey: 'floresVictoriaComparison',
        ...config,
      };

      this.selectedProducts = [];
      this.loadFromStorage();
      this.init();
    }

    /**
     * Inicializa el componente
     */
    init() {
      this.injectHTML();
      this.attachEventListeners();
      this.updateFloatingBar();
      console.log('✅ ProductComparison v1.0.0 - Inicializado');
    }

    /**
     * Inyecta el HTML necesario en el DOM
     */
    injectHTML() {
      // Verificar si ya existe
      if (document.getElementById('comparisonFloatingBar')) return;

      const html = `
        <!-- Barra flotante de comparación -->
        <div class="comparison-floating-bar" id="comparisonFloatingBar" style="display: none;">
          <div class="comparison-bar-content">
            <div class="comparison-bar-header">
              <h4>
                <i class="fas fa-balance-scale"></i>
                Comparar Productos (<span id="comparisonCount">0</span>/${this.config.maxProducts})
              </h4>
              <button class="btn-clear-comparison" id="btnClearComparison" title="Limpiar todo">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div class="comparison-bar-products" id="comparisonBarProducts">
              <!-- Productos seleccionados -->
            </div>
            <div class="comparison-bar-actions">
              <button class="btn-compare" id="btnCompare" disabled>
                <i class="fas fa-eye"></i> Comparar Ahora
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de comparación -->
        <div class="comparison-modal" id="comparisonModal">
          <div class="comparison-modal-overlay" id="comparisonModalOverlay"></div>
          <div class="comparison-modal-content">
            <div class="comparison-modal-header">
              <h3>
                <i class="fas fa-balance-scale"></i>
                Comparación de Productos
              </h3>
              <button class="btn-close-modal" id="btnCloseModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="comparison-modal-body" id="comparisonModalBody">
              <!-- Tabla de comparación -->
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * Adjunta event listeners
     */
    attachEventListeners() {
      // Botón limpiar todo
      const btnClear = document.getElementById('btnClearComparison');
      if (btnClear) {
        btnClear.addEventListener('click', () => this.clearAll());
      }

      // Botón comparar
      const btnCompare = document.getElementById('btnCompare');
      if (btnCompare) {
        btnCompare.addEventListener('click', () => this.showComparisonModal());
      }

      // Cerrar modal
      const btnClose = document.getElementById('btnCloseModal');
      const overlay = document.getElementById('comparisonModalOverlay');
      if (btnClose) {
        btnClose.addEventListener('click', () => this.closeModal());
      }
      if (overlay) {
        overlay.addEventListener('click', () => this.closeModal());
      }

      // ESC para cerrar modal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal();
        }
      });

      // Hacer la barra flotante arrastrable
      this.makeDraggable();
    }

    /**
     * Hace que la barra flotante sea arrastrable
     */
    makeDraggable() {
      const bar = document.getElementById('comparisonFloatingBar');
      if (!bar) return;

      let isDragging = false;
      let currentX;
      let currentY;
      let initialX;
      let initialY;
      let xOffset = 0;
      let yOffset = 0;

      // Obtener el header como área de arrastre
      const dragHandle = bar.querySelector('.comparison-bar-header');
      if (!dragHandle) return;

      dragHandle.addEventListener('mousedown', dragStart);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);

      // Soporte táctil
      dragHandle.addEventListener('touchstart', dragStart);
      document.addEventListener('touchmove', drag);
      document.addEventListener('touchend', dragEnd);

      function dragStart(e) {
        // No arrastrar si se hace clic en un botón
        if (e.target.closest('button')) return;

        if (e.type === 'touchstart') {
          initialX = e.touches[0].clientX - xOffset;
          initialY = e.touches[0].clientY - yOffset;
        } else {
          initialX = e.clientX - xOffset;
          initialY = e.clientY - yOffset;
        }

        isDragging = true;
        bar.classList.add('dragging');
        bar.style.transition = 'none';
        bar.style.animation = 'none';
      }

      function drag(e) {
        if (!isDragging) return;

        e.preventDefault();

        if (e.type === 'touchmove') {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        // Limitar el movimiento dentro de la ventana
        const barRect = bar.getBoundingClientRect();
        const maxX = window.innerWidth - barRect.width;
        const maxY = 0; // Límite superior
        const minY = -(window.innerHeight - barRect.height); // Límite inferior

        // Ajustar límites
        xOffset = Math.max(0, Math.min(xOffset, maxX));
        yOffset = Math.max(minY, Math.min(yOffset, maxY));

        setTranslate(xOffset, yOffset, bar);
      }

      function dragEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        bar.classList.remove('dragging');
        initialX = currentX;
        initialY = currentY;

        // Restaurar transición suave
        bar.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
      }

      function setTranslate(xPos, yPos, el) {
        // Cambiar a posicionamiento absoluto cuando se arrastra
        if (!el.dataset.positioned) {
          const rect = el.getBoundingClientRect();
          el.style.left = `${rect.left}px`;
          el.style.bottom = `${window.innerHeight - rect.bottom}px`;
          el.style.right = 'auto';
          el.dataset.positioned = 'true';
        }
        
        el.style.left = `${xPos}px`;
        el.style.bottom = `${-yPos}px`;
      }
    }

    /**
     * Agrega un producto a la comparación
     * @param {number} productId - ID del producto
     * @returns {boolean} - true si se agregó, false si no
     */
    addProduct(productId) {
      // Verificar límite
      if (this.selectedProducts.length >= this.config.maxProducts) {
        this.showToast(
          `Solo puedes comparar hasta ${this.config.maxProducts} productos a la vez`,
          'warning'
        );
        return false;
      }

      // Verificar si ya existe
      if (this.selectedProducts.includes(productId)) {
        return false;
      }

      this.selectedProducts.push(productId);
      this.saveToStorage();
      this.updateFloatingBar();
      this.updateCheckboxes();
      this.showToast('Producto agregado a la comparación', 'success');
      return true;
    }

    /**
     * Remueve un producto de la comparación
     * @param {number} productId - ID del producto
     */
    removeProduct(productId) {
      const index = this.selectedProducts.indexOf(productId);
      if (index > -1) {
        this.selectedProducts.splice(index, 1);
        this.saveToStorage();
        this.updateFloatingBar();
        this.updateCheckboxes();
        this.showToast('Producto removido de la comparación', 'info');
      }
    }

    /**
     * Limpia todos los productos de la comparación
     */
    clearAll() {
      if (this.selectedProducts.length === 0) return;

      if (confirm('¿Deseas eliminar todos los productos de la comparación?')) {
        this.selectedProducts = [];
        this.saveToStorage();
        this.updateFloatingBar();
        this.updateCheckboxes();
        this.showToast('Comparación limpiada', 'info');
      }
    }

    /**
     * Actualiza la barra flotante
     */
    updateFloatingBar() {
      const bar = document.getElementById('comparisonFloatingBar');
      const count = document.getElementById('comparisonCount');
      const productsContainer = document.getElementById('comparisonBarProducts');
      const btnCompare = document.getElementById('btnCompare');

      if (!bar || !count || !productsContainer || !btnCompare) return;

      // Actualizar contador
      count.textContent = this.selectedProducts.length;

      // Mostrar/ocultar barra
      if (this.selectedProducts.length === 0) {
        bar.style.display = 'none';
        return;
      }

      bar.style.display = 'flex';

      // Habilitar/deshabilitar botón comparar
      btnCompare.disabled = this.selectedProducts.length < this.config.minProducts;

      // Renderizar productos en la barra
      productsContainer.innerHTML = this.selectedProducts
        .map((id) => {
          const product = this.products.find((p) => p.id === id);
          if (!product) return '';

          // Usar la imagen del producto desde products.json o fallback
          const imagePath = product.image_url || product.image || '/images/placeholder.svg';

          return `
            <div class="comparison-bar-product" data-product-id="${id}">
              <img src="${imagePath}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'80\\' height=\\'80\\'%3E%3Crect fill=\\'%23f0f0f0\\' width=\\'80\\' height=\\'80\\'/%3E%3Ctext fill=\\'%23999\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' font-size=\\'12\\'%3E%3C/text%3E%3C/svg%3E';">
              <button class="btn-remove-product" onclick="window.productComparisonInstance.removeProduct(${id})" title="Quitar de comparación">
                <i class="fas fa-times"></i>
              </button>
            </div>
          `;
        })
        .join('');
    }

    /**
     * Actualiza los checkboxes en las tarjetas de productos
     */
    updateCheckboxes() {
      document.querySelectorAll('.comparison-checkbox').forEach((checkbox) => {
        const productId = parseInt(checkbox.dataset.productId);
        checkbox.checked = this.selectedProducts.includes(productId);
      });
    }

    /**
     * Muestra el modal de comparación
     */
    showComparisonModal() {
      if (this.selectedProducts.length < this.config.minProducts) {
        this.showToast(
          `Selecciona al menos ${this.config.minProducts} productos para comparar`,
          'warning'
        );
        return;
      }

      const modal = document.getElementById('comparisonModal');
      const body = document.getElementById('comparisonModalBody');

      if (!modal || !body) return;

      // Obtener productos seleccionados
      const selectedProducts = this.selectedProducts
        .map((id) => this.products.find((p) => p.id === id))
        .filter((p) => p);

      // Renderizar tabla de comparación
      body.innerHTML = this.renderComparisonTable(selectedProducts);

      // Mostrar modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el modal de comparación
     */
    closeModal() {
      const modal = document.getElementById('comparisonModal');
      if (!modal) return;

      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    /**
     * Renderiza la tabla de comparación
     * @param {Array} products - Productos a comparar
     * @returns {string} - HTML de la tabla
     */
    renderComparisonTable(products) {
      if (products.length === 0) return '<p>No hay productos para comparar</p>';

      const features = [
        { key: 'image', label: 'Imagen', type: 'image' },
        { key: 'name', label: 'Nombre', type: 'text' },
        { key: 'price', label: 'Precio', type: 'price' },
        { key: 'original_price', label: 'Precio Original', type: 'price' },
        { key: 'size', label: 'Tamaño', type: 'text' },
        { key: 'color', label: 'Color', type: 'text' },
        { key: 'category', label: 'Categoría', type: 'category' },
        { key: 'type', label: 'Tipo', type: 'text' },
        { key: 'description', label: 'Descripción', type: 'text' },
        { key: 'featured', label: 'Destacado', type: 'badge' },
        { key: 'bestseller', label: 'Más Vendido', type: 'badge' },
        { key: 'new', label: 'Nuevo', type: 'badge' },
      ];

      return `
        <div class="comparison-table-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="feature-column">Característica</th>
                ${products
                  .map(
                    (p) => `
                  <th class="product-column">
                    <button class="btn-remove-from-comparison" 
                            onclick="window.productComparisonInstance.removeProduct(${p.id})">
                      <i class="fas fa-times"></i>
                    </button>
                  </th>
                `
                  )
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${features
                .map((feature) => {
                  // Saltar características vacías en todos los productos
                  const hasValue = products.some(
                    (p) =>
                      p[feature.key] !== undefined &&
                      p[feature.key] !== null &&
                      p[feature.key] !== ''
                  );
                  if (!hasValue && feature.key !== 'image') return '';

                  return `
                    <tr>
                      <td class="feature-label">${feature.label}</td>
                      ${products
                        .map((p) => {
                          const value = p[feature.key];
                          return `<td class="product-value">${this.formatFeatureValue(
                            value,
                            feature.type,
                            p
                          )}</td>`;
                        })
                        .join('')}
                    </tr>
                  `;
                })
                .join('')}
              <tr>
                <td class="feature-label">Acciones</td>
                ${products
                  .map(
                    (p) => `
                  <td class="product-actions">
                    <button class="btn-add-to-cart" onclick="addToCart(${p.id})">
                      <i class="fas fa-shopping-cart"></i> Agregar
                    </button>
                  </td>
                `
                  )
                  .join('')}
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    /**
     * Formatea el valor de una característica según su tipo
     * @param {*} value - Valor a formatear
     * @param {string} type - Tipo de valor
     * @param {Object} product - Producto completo
     * @returns {string} - HTML formateado
     */
    formatFeatureValue(value, type, product) {
      if (value === undefined || value === null || value === '') {
        return '<span class="empty-value">—</span>';
      }

      switch (type) {
        case 'image': {
          const imageId = `${product.id}`.toUpperCase();
          const imagePath = `/images/products/watermarked/${imageId}-watermarked.webp`;
          return `<img src="${imagePath}" alt="${product.name}" class="comparison-product-image" onerror="this.src='/images/placeholder.svg';">`;
        }

        case 'price':
          return `<span class="price-value">$${this.formatPrice(value)}</span>`;

        case 'category':
          return this.getCategoryName(value);

        case 'badge':
          return value
            ? '<span class="badge badge-success"><i class="fas fa-check"></i> Sí</span>'
            : '<span class="badge badge-secondary"><i class="fas fa-times"></i> No</span>';

        case 'text':
        default:
          return this.escapeHtml(value.toString());
      }
    }

    /**
     * Obtiene el nombre legible de una categoría
     * @param {string} category - Categoría
     * @returns {string} - Nombre legible
     */
    getCategoryName(category) {
      const categories = {
        anniversary: 'Aniversario',
        birthday: 'Cumpleaños',
        graduation: 'Graduación',
        sympathy: 'Pésame',
        romance: 'Romance',
        congratulations: 'Felicitaciones',
        getwell: 'Recuperación',
        thankyou: 'Agradecimiento',
        all: 'Todas',
      };
      return categories[category] || category;
    }

    /**
     * Formatea precio con separador de miles
     * @param {number} price - Precio
     * @returns {string} - Precio formateado
     */
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} - Texto escapado
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Guarda en localStorage
     */
    saveToStorage() {
      try {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.selectedProducts));
      } catch (e) {
        console.warn('No se pudo guardar en localStorage:', e);
      }
    }

    /**
     * Carga desde localStorage
     */
    loadFromStorage() {
      try {
        const stored = localStorage.getItem(this.config.storageKey);
        if (stored) {
          this.selectedProducts = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('No se pudo cargar desde localStorage:', e);
        this.selectedProducts = [];
      }
    }

    /**
     * Muestra un toast notification
     * @param {string} message - Mensaje
     * @param {string} type - Tipo (success, error, warning, info)
     */
    showToast(message, type = 'info') {
      // Verificar si existe el componente Toast
      if (typeof window.Toast !== 'undefined') {
        window.Toast.show(message, type);
      } else {
        console.log(`[Toast ${type}] ${message}`);
      }
    }

    /**
     * Verifica si un producto está seleccionado
     * @param {number} productId - ID del producto
     * @returns {boolean} - true si está seleccionado
     */
    isSelected(productId) {
      return this.selectedProducts.includes(productId);
    }

    /**
     * Toggle de un producto (agregar/remover)
     * @param {number} productId - ID del producto
     */
    toggleProduct(productId) {
      if (this.isSelected(productId)) {
        this.removeProduct(productId);
      } else {
        this.addProduct(productId);
      }
    }
  }

  // Exportar globalmente
  window.ProductComparison = ProductComparison;

  console.log('✅ ProductComparison v1.0.0 - Cargado correctamente');
})();
