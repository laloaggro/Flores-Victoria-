/**
 * Loading Spinner Component
 * Indicador de carga global
 *
 * Uso:
 * LoadingComponent.show();
 * LoadingComponent.hide();
 * LoadingComponent.show('Cargando productos...');
 */

const LoadingComponent = {
  overlay: null,

  init() {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'loading-overlay';
    this.overlay.className = 'loading-overlay hidden';
    this.overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Cargando...</div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.injectStyles();
  },

  injectStyles() {
    if (document.getElementById('loading-styles')) return;

    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.3s ease;
      }

      .loading-overlay.hidden {
        opacity: 0;
        pointer-events: none;
      }

      .loading-spinner {
        background: white;
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }

      .spinner {
        width: 50px;
        height: 50px;
        margin: 0 auto 16px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--primary, #A2C9A5);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  },

  show(message = 'Cargando...') {
    this.init();
    const textElement = this.overlay.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = message;
    }
    this.overlay.classList.remove('hidden');
  },

  hide() {
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingComponent;
}
