/**
 * ============================================================================
 * Shipping Options Component
 * ============================================================================
 *
 * Componente para mostrar y seleccionar opciones de envío
 *
 * @module ShippingOptionsComponent
 * @version 1.0.0
 * @requires shipping-options.js (config)
 */

const ShippingOptionsComponent = {
  // ========================================
  // Estado
  // ========================================

  selectedOption: null,
  subtotal: 0,

  // ========================================
  // Métodos de renderizado
  // ========================================

  /**
   * Renderizar selector de opciones de envío
   * @param {string} containerId - ID del contenedor
   * @param {number} subtotal - Subtotal del pedido
   * @returns {void}
   */
  render(containerId, subtotal = 0) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Contenedor #${containerId} no encontrado`);
      return;
    }

    this.subtotal = subtotal;
    const options = window.ShippingConfig.getShippingOptions();

    container.innerHTML = `
      <div class="shipping-options-wrapper">
        <h3 class="shipping-title">
          <i class="fas fa-truck"></i> 
          Opciones de Entrega
        </h3>
        <div class="shipping-options-grid">
          ${Object.values(options)
            .map((option) => this.renderOption(option))
            .join('')}
        </div>
        ${this.renderSummary()}
      </div>
    `;

    this.attachEventListeners();
    this.applyStyles();
  },

  /**
   * Renderizar una opción de envío
   * @param {Object} option - Opción de envío
   * @returns {string} HTML de la opción
   */
  renderOption(option) {
    const isAvailable = window.ShippingConfig.isShippingAvailable(option.id);
    const availability = window.ShippingConfig.getAvailabilityMessage(option.id);

    return `
      <div class="shipping-option ${!isAvailable ? 'disabled' : ''}" 
           data-shipping-id="${option.id}"
           data-price="${option.price}">
        <input 
          type="radio" 
          name="shipping" 
          id="shipping-${option.id}" 
          value="${option.id}"
          ${!isAvailable ? 'disabled' : ''}
        >
        <label for="shipping-${option.id}">
          <div class="shipping-option-header">
            <div class="shipping-icon">${option.icon}</div>
            <div class="shipping-info">
              <h4 class="shipping-name">${option.name}</h4>
              <p class="shipping-description">${option.description}</p>
              <p class="shipping-subtitle">${option.subtitle}</p>
            </div>
            <div class="shipping-price">
              <span class="price">${option.priceFormatted}</span>
              <span class="estimated">${option.estimatedText}</span>
            </div>
          </div>
          <div class="shipping-option-features">
            ${option.features.map((feature) => `<span class="feature"><i class="fas fa-check"></i> ${feature}</span>`).join('')}
          </div>
          ${!isAvailable ? `<div class="availability-warning">${availability}</div>` : ''}
        </label>
      </div>
    `;
  },

  /**
   * Renderizar resumen de costos
   * @returns {string} HTML del resumen
   */
  renderSummary() {
    const selectedOption = this.selectedOption
      ? window.ShippingConfig.getShippingOption(this.selectedOption)
      : null;

    const costs = selectedOption
      ? window.ShippingConfig.calculateTotal(this.subtotal, this.selectedOption)
      : {
          subtotal: this.subtotal,
          shipping: 0,
          shippingFormatted: '-',
          total: this.subtotal,
          totalFormatted: window.ShippingConfig.formatPrice(this.subtotal),
        };

    return `
      <div class="shipping-summary">
        <h4>Resumen del Pedido</h4>
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${window.ShippingConfig.formatPrice(costs.subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Envío:</span>
          <span>${costs.shippingFormatted}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>${costs.totalFormatted}</span>
        </div>
        ${selectedOption ? `<div class="selected-info"><i class="fas fa-info-circle"></i> ${selectedOption.name} - ${selectedOption.estimatedText}</div>` : ''}
      </div>
    `;
  },

  // ========================================
  // Manejo de eventos
  // ========================================

  /**
   * Adjuntar event listeners
   * @returns {void}
   */
  attachEventListeners() {
    const options = document.querySelectorAll('.shipping-option:not(.disabled)');

    options.forEach((option) => {
      const radio = option.querySelector('input[type="radio"]');
      radio?.addEventListener('change', (e) => {
        this.handleOptionChange(e.target.value);
      });

      option.addEventListener('click', (e) => {
        if (!option.classList.contains('disabled')) {
          const radio = option.querySelector('input[type="radio"]');
          if (radio && e.target !== radio) {
            radio.checked = true;
            this.handleOptionChange(radio.value);
          }
        }
      });
    });
  },

  /**
   * Manejar cambio de opción seleccionada
   * @param {string} optionId - ID de la opción seleccionada
   * @returns {void}
   */
  handleOptionChange(optionId) {
    this.selectedOption = optionId;

    // Actualizar UI
    document.querySelectorAll('.shipping-option').forEach((opt) => {
      opt.classList.remove('selected');
    });

    const selected = document.querySelector(`[data-shipping-id="${optionId}"]`);
    if (selected) {
      selected.classList.add('selected');
    }

    // Actualizar resumen
    const summaryContainer = document.querySelector('.shipping-summary');
    if (summaryContainer) {
      summaryContainer.outerHTML = this.renderSummary();
    }

    // Emitir evento personalizado
    const event = new CustomEvent('shippingChanged', {
      detail: {
        optionId,
        option: window.ShippingConfig.getShippingOption(optionId),
        costs: window.ShippingConfig.calculateTotal(this.subtotal, optionId),
      },
    });
    document.dispatchEvent(event);
  },

  // ========================================
  // Estilos
  // ========================================

  /**
   * Aplicar estilos CSS al componente
   * @returns {void}
   */
  applyStyles() {
    if (document.getElementById('shipping-options-styles')) return;

    const styles = `
      <style id="shipping-options-styles">
        .shipping-options-wrapper {
          padding: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .shipping-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #2c1f2f;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .shipping-title i {
          color: #C2185B;
        }

        .shipping-options-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .shipping-option {
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .shipping-option:hover:not(.disabled) {
          border-color: #C2185B;
          box-shadow: 0 4px 12px rgba(194, 24, 91, 0.15);
        }

        .shipping-option.selected {
          border-color: #C2185B;
          background: rgba(194, 24, 91, 0.05);
        }

        .shipping-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f5f5f5;
        }

        .shipping-option input[type="radio"] {
          display: none;
        }

        .shipping-option label {
          cursor: pointer;
          display: block;
        }

        .shipping-option-header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1rem;
          align-items: start;
        }

        .shipping-icon {
          font-size: 2rem;
        }

        .shipping-info {
          flex: 1;
        }

        .shipping-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c1f2f;
          margin: 0 0 0.25rem 0;
        }

        .shipping-description {
          color: #666;
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
        }

        .shipping-subtitle {
          color: #999;
          font-size: 0.85rem;
          margin: 0;
        }

        .shipping-price {
          text-align: right;
        }

        .shipping-price .price {
          display: block;
          font-size: 1.3rem;
          font-weight: 700;
          color: #C2185B;
        }

        .shipping-price .estimated {
          display: block;
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .shipping-option-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .shipping-option-features .feature {
          font-size: 0.85rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .shipping-option-features .fa-check {
          color: #4caf50;
          font-size: 0.75rem;
        }

        .availability-warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 0.5rem;
          border-radius: 6px;
          margin-top: 1rem;
          font-size: 0.85rem;
          color: #856404;
        }

        .shipping-summary {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
        }

        .shipping-summary h4 {
          margin: 0 0 1rem 0;
          color: #2c1f2f;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .summary-row.total {
          font-size: 1.2rem;
          font-weight: 700;
          color: #C2185B;
          border-bottom: none;
          margin-top: 0.5rem;
          padding-top: 1rem;
          border-top: 2px solid #C2185B;
        }

        .selected-info {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(194, 24, 91, 0.1);
          border-radius: 6px;
          font-size: 0.9rem;
          color: #2c1f2f;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .selected-info i {
          color: #C2185B;
        }

        @media (max-width: 768px) {
          .shipping-options-wrapper {
            padding: 1rem;
          }

          .shipping-option-header {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .shipping-icon {
            display: none;
          }

          .shipping-price {
            text-align: left;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  },

  // ========================================
  // API pública
  // ========================================

  /**
   * Obtener opción seleccionada
   * @returns {string|null} ID de la opción seleccionada
   */
  getSelected() {
    return this.selectedOption;
  },

  /**
   * Establecer opción seleccionada
   * @param {string} optionId - ID de la opción
   * @returns {void}
   */
  setSelected(optionId) {
    const radio = document.querySelector(`#shipping-${optionId}`);
    if (radio && !radio.disabled) {
      radio.checked = true;
      this.handleOptionChange(optionId);
    }
  },

  /**
   * Actualizar subtotal
   * @param {number} newSubtotal - Nuevo subtotal
   * @returns {void}
   */
  updateSubtotal(newSubtotal) {
    this.subtotal = newSubtotal;
    const summaryContainer = document.querySelector('.shipping-summary');
    if (summaryContainer) {
      summaryContainer.outerHTML = this.renderSummary();
    }
  },
};

// Export para uso global
if (typeof window !== 'undefined') {
  window.ShippingOptionsComponent = ShippingOptionsComponent;
}

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShippingOptionsComponent;
}
