/**
 * Toast Notifications Component
 * Sistema de notificaciones tipo toast
 *
 * Uso:
 * ToastComponent.show('Mensaje de éxito', 'success');
 * ToastComponent.show('Error', 'error');
 * ToastComponent.show('Información', 'info');
 */

const ToastComponent = {
  container: null,

  init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);

    this.injectStyles();
  },

  injectStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      }
      
      .toast {
        background: white;
        padding: 16px 20px;
        margin-bottom: 12px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        pointer-events: all;
        animation: slideIn 0.3s ease;
        border-left: 4px solid;
      }
      
      .toast.removing {
        animation: slideOut 0.3s ease;
      }
      
      .toast-success { border-color: #4caf50; }
      .toast-error { border-color: #f44336; }
      .toast-info { border-color: #2196f3; }
      .toast-warning { border-color: #ff9800; }
      
      .toast-icon {
        font-size: 20px;
        flex-shrink: 0;
      }
      
      .toast-success .toast-icon { color: #4caf50; }
      .toast-error .toast-icon { color: #f44336; }
      .toast-info .toast-icon { color: #2196f3; }
      .toast-warning .toast-icon { color: #ff9800; }
      
      .toast-content {
        flex: 1;
        color: #333;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .toast-close {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 0;
        font-size: 20px;
        line-height: 1;
        flex-shrink: 0;
      }
      
      .toast-close:hover {
        color: #333;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      
      @media (max-width: 768px) {
        .toast-container {
          top: 10px;
          right: 10px;
          left: 10px;
        }
        
        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  },

  show(message, type = 'info', duration = 4000) {
    this.init();

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">${message}</div>
      <button class="toast-close" aria-label="Cerrar">×</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  },

  remove(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  },

  success(message, duration) {
    return this.show(message, 'success', duration);
  },

  error(message, duration) {
    return this.show(message, 'error', duration);
  },

  info(message, duration) {
    return this.show(message, 'info', duration);
  },

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastComponent;
}
