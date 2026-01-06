/**
 * Flores Victoria - UI Components Module
 * Toast notifications, modals, and common UI utilities
 * Version: 2.0.0
 */

// ==================== TOAST NOTIFICATIONS ====================

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = this.getIcon(type);
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="toast-content">
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    this.container.appendChild(toast);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  }

  getIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      danger: 'fa-times-circle',
      info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  error(message, duration) {
    return this.show(message, 'danger', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// ==================== MODAL MANAGER ====================

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.backdrop = null;
    this.init();
  }

  init() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.addEventListener('click', () => this.close());
    document.body.appendChild(this.backdrop);

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });
  }

  open(options = {}) {
    const {
      title = 'Modal',
      content = '',
      size = 'md',
      showFooter = true,
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      onConfirm = null,
      onCancel = null,
      dangerous = false
    } = options;

    // Close existing modal
    if (this.activeModal) {
      this.close();
    }

    const modal = document.createElement('div');
    modal.className = `modal modal-${size}`;
    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" data-action="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${showFooter ? `
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
          <button class="btn ${dangerous ? 'btn-danger' : 'btn-primary'}" data-action="confirm">${confirmText}</button>
        </div>
      ` : ''}
    `;

    // Event handlers
    modal.querySelector('[data-action="close"]')?.addEventListener('click', () => this.close());
    modal.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      if (onCancel) onCancel();
      this.close();
    });
    modal.querySelector('[data-action="confirm"]')?.addEventListener('click', () => {
      if (onConfirm) onConfirm();
      this.close();
    });

    document.body.appendChild(modal);
    this.activeModal = modal;

    // Animate in
    requestAnimationFrame(() => {
      this.backdrop.classList.add('active');
      modal.classList.add('active');
    });

    return modal;
  }

  confirm(message, options = {}) {
    return new Promise((resolve) => {
      this.open({
        title: options.title || 'Confirmar',
        content: `<p>${message}</p>`,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        dangerous: options.dangerous || false,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }

  alert(message, options = {}) {
    return new Promise((resolve) => {
      this.open({
        title: options.title || 'Aviso',
        content: `<p>${message}</p>`,
        showFooter: true,
        confirmText: 'Aceptar',
        cancelText: '',
        onConfirm: () => resolve()
      });
      // Hide cancel button
      this.activeModal.querySelector('[data-action="cancel"]')?.remove();
    });
  }

  close() {
    if (!this.activeModal) return;

    this.backdrop.classList.remove('active');
    this.activeModal.classList.remove('active');

    setTimeout(() => {
      this.activeModal?.remove();
      this.activeModal = null;
    }, 200);
  }
}

// ==================== LOADING STATES ====================

class LoadingManager {
  static show(element, text = 'Cargando...') {
    if (!element) return;
    
    element.classList.add('loading');
    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>${text}</span>
      </div>
    `;
    element.disabled = true;
  }

  static hide(element) {
    if (!element) return;
    
    element.classList.remove('loading');
    if (element.dataset.originalContent) {
      element.innerHTML = element.dataset.originalContent;
      delete element.dataset.originalContent;
    }
    element.disabled = false;
  }

  static skeleton(container, count = 3) {
    if (!container) return;
    
    container.innerHTML = Array(count).fill(0).map(() => `
      <div class="skeleton-item">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 60%"></div>
        </div>
      </div>
    `).join('');
  }
}

// ==================== DROPDOWN ====================

class DropdownManager {
  static init() {
    document.addEventListener('click', (e) => {
      const dropdown = e.target.closest('.dropdown');
      
      // Close all dropdowns
      document.querySelectorAll('.dropdown.active').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });

      // Toggle clicked dropdown
      if (dropdown) {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        if (trigger && trigger.contains(e.target)) {
          dropdown.classList.toggle('active');
        }
      }
    });
  }
}

// ==================== TABS ====================

class TabsManager {
  static init(container) {
    if (!container) return;

    const tabs = container.querySelectorAll('[data-tab]');
    const panels = container.querySelectorAll('[data-tab-panel]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        // Update tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panels
        panels.forEach(p => {
          p.classList.toggle('active', p.dataset.tabPanel === target);
        });
      });
    });
  }
}

// ==================== THEME MANAGER ====================

class ThemeManager {
  static init() {
    const savedTheme = localStorage.getItem('fv_admin_theme') || 'light';
    this.setTheme(savedTheme);

    // Setup toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.themeToggle;
        this.setTheme(theme);
      });
    });
  }

  static setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('fv_admin_theme', theme);

    // Update toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeToggle === theme);
    });
  }

  static toggle() {
    const current = document.documentElement.dataset.theme || 'light';
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }
}

// ==================== FORMAT UTILITIES ====================

const Format = {
  currency(value, currency = 'MXN') {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency
    }).format(value);
  },

  number(value) {
    return new Intl.NumberFormat('es-MX').format(value);
  },

  date(date, options = {}) {
    const defaults = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat('es-MX', { ...defaults, ...options }).format(new Date(date));
  },

  dateTime(date) {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },

  relative(date) {
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return rtf.format(-days, 'day');
    if (hours > 0) return rtf.format(-hours, 'hour');
    if (minutes > 0) return rtf.format(-minutes, 'minute');
    return rtf.format(-seconds, 'second');
  },

  percentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`;
  },

  truncate(str, length = 50) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }
};

// ==================== INITIALIZE ====================

// Create global instances
window.Toast = new ToastManager();
window.Modal = new ModalManager();
window.Loading = LoadingManager;
window.Format = Format;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  DropdownManager.init();
  ThemeManager.init();
});

// Additional toast styles
const uiStyles = document.createElement('style');
uiStyles.textContent = `
  .toast-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .toast-success .toast-icon { color: var(--success); }
  .toast-warning .toast-icon { color: var(--warning); }
  .toast-danger .toast-icon { color: var(--danger); }
  .toast-info .toast-icon { color: var(--info); }

  .toast-content {
    flex: 1;
  }

  .toast-message {
    font-size: 0.875rem;
    color: var(--text-primary);
    margin: 0;
  }

  .toast-close {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .toast-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    color: var(--text-muted);
  }

  .skeleton-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .skeleton-content {
    flex: 1;
  }

  .modal-md { max-width: 500px; }
  .modal-lg { max-width: 700px; }
  .modal-xl { max-width: 900px; }
  .modal-full { max-width: 95vw; max-height: 95vh; }
`;
document.head.appendChild(uiStyles);

export { ToastManager, ModalManager, LoadingManager, DropdownManager, TabsManager, ThemeManager, Format };
