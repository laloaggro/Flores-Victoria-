/**
 * UX Enhancements para Arreglos Victoria
 * Incluye: Scroll to Top, Loading States, Toast Notifications, Smooth Scroll
 */

class UXEnhancements {
  constructor() {
    this.scrollTopBtn = null;
    this.toastContainer = null;
    this.loadingOverlay = null;
    this.init();
  }

  /**
   * Inicializa todos los componentes UX
   */
  init() {
    this.initScrollToTop();
    this.initToastSystem();
    this.initLoadingOverlay();
    this.initSmoothScroll();
    this.initFormValidation();
    console.log('✅ UX Enhancements inicializado');
  }

  /**
   * Botón Scroll to Top
   */
  initScrollToTop() {
    // Crear botón
    this.scrollTopBtn = document.createElement('button');
    this.scrollTopBtn.className = 'scroll-to-top';
    this.scrollTopBtn.innerHTML = '↑';
    this.scrollTopBtn.setAttribute('aria-label', 'Volver arriba');
    this.scrollTopBtn.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary, #2d5016);
      color: white;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.1));
    `;

    document.body.appendChild(this.scrollTopBtn);

    // Mostrar/ocultar según scroll
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        this.scrollTopBtn.style.opacity = '1';
        this.scrollTopBtn.style.visibility = 'visible';
      } else {
        this.scrollTopBtn.style.opacity = '0';
        this.scrollTopBtn.style.visibility = 'hidden';
      }
    });

    // Acción de click
    this.scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });

    // Hover effect
    this.scrollTopBtn.addEventListener('mouseenter', () => {
      this.scrollTopBtn.style.transform = 'translateY(-5px)';
      this.scrollTopBtn.style.boxShadow = 'var(--shadow-xl, 0 20px 40px rgba(0,0,0,0.15))';
    });

    this.scrollTopBtn.addEventListener('mouseleave', () => {
      this.scrollTopBtn.style.transform = 'translateY(0)';
      this.scrollTopBtn.style.boxShadow = 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.1))';
    });
  }

  /**
   * Sistema de Toast Notifications
   */
  initToastSystem() {
    // Crear contenedor de toasts
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    `;

    document.body.appendChild(this.toastContainer);
  }

  /**
   * Muestra una notificación toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: success, error, warning, info
   * @param {number} duration - Duración en ms (0 = permanente)
   */
  showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };

    const colors = {
      success: 'var(--success, #10b981)',
      error: 'var(--danger, #ef4444)',
      warning: 'var(--warning, #f59e0b)',
      info: 'var(--info, #3b82f6)',
    };

    toast.innerHTML = `
      <div style="
        display: flex;
        align-items: start;
        gap: 0.75rem;
        background: white;
        padding: 1rem 1.25rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-xl, 0 20px 40px rgba(0,0,0,0.15));
        border-left: 4px solid ${colors[type]};
        animation: slideInRight 0.3s ease-out;
      ">
        <span style="
          font-size: 1.5rem;
          color: ${colors[type]};
          flex-shrink: 0;
        ">${icons[type]}</span>
        <p style="
          margin: 0;
          color: var(--text-primary, #1f2937);
          font-size: 0.875rem;
          line-height: 1.5;
          flex: 1;
        ">${message}</p>
        <button class="toast-close" style="
          background: none;
          border: none;
          color: var(--text-secondary, #6b7280);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          flex-shrink: 0;
        ">×</button>
      </div>
    `;

    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    if (!document.querySelector('style[data-toast-animations]')) {
      style.dataset.toastAnimations = '';
      document.head.appendChild(style);
    }

    this.toastContainer.appendChild(toast);

    // Botón cerrar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.removeToast(toast));

    // Auto-cerrar
    if (duration > 0) {
      setTimeout(() => this.removeToast(toast), duration);
    }

    return toast;
  }

  /**
   * Remueve un toast con animación
   */
  removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }

  /**
   * Loading Overlay Global
   */
  initLoadingOverlay() {
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.className = 'loading-overlay';
    this.loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      flex-direction: column;
      gap: 1rem;
    `;

    this.loadingOverlay.innerHTML = `
      <div class="spinner" style="
        width: 60px;
        height: 60px;
        border: 4px solid var(--gray-200, #e5e7eb);
        border-top-color: var(--primary, #2d5016);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <p class="loading-text" style="
        color: var(--text-primary, #1f2937);
        font-size: 1rem;
        font-weight: 500;
        margin: 0;
      ">Cargando...</p>
    `;

    // Agregar animación de spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    if (!document.querySelector('style[data-spinner-animation]')) {
      style.dataset.spinnerAnimation = '';
      document.head.appendChild(style);
    }

    document.body.appendChild(this.loadingOverlay);
  }

  /**
   * Muestra el loading overlay
   */
  showLoading(text = 'Cargando...') {
    if (this.loadingOverlay) {
      const loadingText = this.loadingOverlay.querySelector('.loading-text');
      if (loadingText) {
        loadingText.textContent = text;
      }
      this.loadingOverlay.style.display = 'flex';
    }
  }

  /**
   * Oculta el loading overlay
   */
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'none';
    }
  }

  /**
   * Smooth Scroll para enlaces internos
   */
  initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    });
  }

  /**
   * Validación visual mejorada para formularios
   */
  initFormValidation() {
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form.matches('form')) return;

      // Validar campos requeridos
      const requiredFields = form.querySelectorAll('[required]');
      let hasErrors = false;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          this.showFieldError(field, 'Este campo es requerido');
          hasErrors = true;
        } else {
          this.clearFieldError(field);
        }
      });

      // Validar emails
      const emailFields = form.querySelectorAll('input[type="email"]');
      emailFields.forEach((field) => {
        if (field.value && !this.isValidEmail(field.value)) {
          this.showFieldError(field, 'Email inválido');
          hasErrors = true;
        }
      });

      if (hasErrors) {
        e.preventDefault();
        this.showToast('Por favor corrige los errores en el formulario', 'error');
      }
    });

    // Validación en tiempo real
    document.addEventListener(
      'blur',
      (e) => {
        const field = e.target;
        if (field.matches('input, textarea, select')) {
          if (field.hasAttribute('required') && !field.value.trim()) {
            this.showFieldError(field, 'Este campo es requerido');
          } else if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            this.showFieldError(field, 'Email inválido');
          } else {
            this.clearFieldError(field);
          }
        }
      },
      true
    );
  }

  /**
   * Muestra error en un campo
   */
  showFieldError(field, message) {
    this.clearFieldError(field);

    field.style.borderColor = 'var(--danger, #ef4444)';

    const error = document.createElement('span');
    error.className = 'field-error';
    error.style.cssText = `
      color: var(--danger, #ef4444);
      font-size: 0.75rem;
      display: block;
      margin-top: 0.25rem;
    `;
    error.textContent = message;

    field.parentElement.appendChild(error);
  }

  /**
   * Limpia error de un campo
   */
  clearFieldError(field) {
    field.style.borderColor = '';
    const error = field.parentElement.querySelector('.field-error');
    if (error) {
      error.remove();
    }
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Helpers públicos
   */
  toast = {
    success: (msg, duration) => this.showToast(msg, 'success', duration),
    error: (msg, duration) => this.showToast(msg, 'error', duration),
    warning: (msg, duration) => this.showToast(msg, 'warning', duration),
    info: (msg, duration) => this.showToast(msg, 'info', duration),
  };

  loading = {
    show: (text) => this.showLoading(text),
    hide: () => this.hideLoading(),
  };
}

// Crear instancia global
window.uxEnhancements = new UXEnhancements();

// Exportar métodos globales de conveniencia
window.toast = window.uxEnhancements.toast;
window.loading = window.uxEnhancements.loading;

console.log('✅ UX Enhancements cargado - Usa window.toast y window.loading');
