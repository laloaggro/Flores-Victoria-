/**
 * 🎨 FLORES VICTORIA - ADVANCED LOADING STATES
 * ==============================================
 * Sistema completo de estados de carga modernos
 * Incluye: Skeleton loaders, Page transitions, Progress indicators
 */

class LoadingStates {
  constructor() {
    this.pageTransitionDuration = 400;
    this.init();
  }

  init() {
    this.initPageTransitions();
    this.createProgressBar();
    console.log('⏳ Loading states initialized');
  }

  /**
   * PAGE TRANSITIONS
   * Transiciones suaves entre páginas
   */
  initPageTransitions() {
    // Añadir clase de entrada a la página actual
    document.body.classList.add('page-transition');

    // Interceptar clicks en enlaces internos
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"], a[href^="./"], a[href^="../"]');
      
      if (!link || link.target === '_blank') return;
      if (link.href === window.location.href) return;

      e.preventDefault();
      this.transitionToPage(link.href);
    });
  }

  /**
   * Ejecutar transición de página
   */
  transitionToPage(url) {
    document.body.classList.add('page-exit');

    setTimeout(() => {
      window.location.href = url;
    }, this.pageTransitionDuration);
  }

  /**
   * PROGRESS BAR
   * Barra de progreso para navegación
   */
  createProgressBar() {
    if (document.querySelector('.page-progress-bar')) return;

    const progressBar = document.createElement('div');
    progressBar.className = 'page-progress-bar';
    progressBar.innerHTML = '<div class="page-progress-fill"></div>';
    document.body.appendChild(progressBar);

    // Mostrar durante navegación
    let progressInterval;

    window.addEventListener('beforeunload', () => {
      this.showProgress();
    });

    // Ocultar cuando la página carga
    window.addEventListener('load', () => {
      this.hideProgress();
    });
  }

  /**
   * Mostrar barra de progreso
   */
  showProgress() {
    const bar = document.querySelector('.page-progress-bar');
    const fill = document.querySelector('.page-progress-fill');
    
    if (!bar || !fill) return;

    bar.classList.add('active');
    fill.style.width = '0%';

    // Simular progreso
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 90) progress = 90;
      fill.style.width = `${progress}%`;
    }, 200);

    // Guardar intervalo para limpiarlo después
    this.progressInterval = interval;
  }

  /**
   * Ocultar barra de progreso
   */
  hideProgress() {
    const bar = document.querySelector('.page-progress-bar');
    const fill = document.querySelector('.page-progress-fill');
    
    if (!bar || !fill) return;

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    fill.style.width = '100%';
    
    setTimeout(() => {
      bar.classList.remove('active');
      fill.style.width = '0%';
    }, 300);
  }

  /**
   * SKELETON LOADER GENERATOR
   * Generar skeleton loaders para contenido
   */
  static createSkeleton(type = 'card', count = 1) {
    const templates = {
      card: `
        <div class="skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 80%;"></div>
        </div>
      `,
      list: `
        <div class="skeleton-list-item">
          <div class="skeleton skeleton-circle" style="width: 50px; height: 50px;"></div>
          <div style="flex: 1;">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 70%;"></div>
          </div>
        </div>
      `,
      text: `
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 90%;"></div>
        <div class="skeleton skeleton-text" style="width: 80%;"></div>
      `,
      product: `
        <div class="skeleton-product">
          <div class="skeleton skeleton-image" style="aspect-ratio: 1; border-radius: 12px;"></div>
          <div class="skeleton skeleton-title" style="margin-top: 1rem;"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
          <div class="skeleton skeleton-text" style="width: 40%; height: 32px; margin-top: 1rem;"></div>
        </div>
      `
    };

    const template = templates[type] || templates.card;
    return Array(count).fill(template).join('');
  }

  /**
   * SHOW SKELETON LOADER
   * Mostrar skeleton en un contenedor
   */
  static showSkeleton(containerSelector, type = 'card', count = 3) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = this.createSkeleton(type, count);
    container.classList.add('loading-skeleton');
  }

  /**
   * HIDE SKELETON LOADER
   * Ocultar skeleton y mostrar contenido real
   */
  static hideSkeleton(containerSelector, content) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.classList.remove('loading-skeleton');
    
    if (typeof content === 'string') {
      container.innerHTML = content;
    }
  }

  /**
   * LOADING SPINNER
   * Crear spinner de carga inline
   */
  static createSpinner(size = 'medium') {
    const sizes = {
      small: '20px',
      medium: '40px',
      large: '60px'
    };

    const spinner = document.createElement('div');
    spinner.className = `loading-spinner loading-spinner-${size}`;
    spinner.style.width = sizes[size] || sizes.medium;
    spinner.style.height = sizes[size] || sizes.medium;

    return spinner;
  }

  /**
   * SHOW FULL PAGE LOADER
   * Loader que cubre toda la página
   */
  static showFullPageLoader(message = 'Cargando...') {
    // Remover loader existente si hay
    this.hideFullPageLoader();

    const loader = document.createElement('div');
    loader.className = 'full-page-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <p class="loader-message">${message}</p>
      </div>
    `;

    document.body.appendChild(loader);
    document.body.style.overflow = 'hidden';

    // Forzar reflow para animación
    loader.offsetHeight;
    loader.classList.add('active');
  }

  /**
   * HIDE FULL PAGE LOADER
   */
  static hideFullPageLoader() {
    const loader = document.querySelector('.full-page-loader');
    if (!loader) return;

    loader.classList.remove('active');
    
    setTimeout(() => {
      loader.remove();
      document.body.style.overflow = '';
    }, 300);
  }

  /**
   * ASYNC CONTENT LOADER
   * Cargar contenido con skeleton automático
   */
  static async loadContent(containerSelector, fetchFunction, options = {}) {
    const {
      skeletonType = 'card',
      skeletonCount = 3,
      showLoader = true,
      errorMessage = 'Error al cargar contenido'
    } = options;

    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error(`Container ${containerSelector} not found`);
      return;
    }

    try {
      // Mostrar skeleton
      if (showLoader) {
        this.showSkeleton(containerSelector, skeletonType, skeletonCount);
      }

      // Ejecutar función de carga
      const content = await fetchFunction();

      // Pequeño delay para UX (opcional)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mostrar contenido
      this.hideSkeleton(containerSelector, content);

      return content;

    } catch (error) {
      console.error('Error loading content:', error);
      
      container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>${errorMessage}</p>
          <button onclick="location.reload()" class="btn btn-sm">
            Reintentar
          </button>
        </div>
      `;
    }
  }

  /**
   * BUTTON LOADING STATE
   * Añadir estado de carga a un botón
   */
  static setButtonLoading(button, loading = true) {
    if (!(button instanceof HTMLElement)) {
      button = document.querySelector(button);
    }
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.innerHTML;
      button.disabled = true;
      button.classList.add('btn-loading');
      
      const spinner = this.createSpinner('small');
      button.innerHTML = '';
      button.appendChild(spinner);
      
      if (button.dataset.loadingText) {
        const text = document.createElement('span');
        text.textContent = button.dataset.loadingText;
        text.style.marginLeft = '8px';
        button.appendChild(text);
      }
    } else {
      button.disabled = false;
      button.classList.remove('btn-loading');
      button.innerHTML = button.dataset.originalText || button.innerHTML;
      delete button.dataset.originalText;
    }
  }

  /**
   * PROGRESS CIRCLE
   * Círculo de progreso animado
   */
  static createProgressCircle(container, progress = 0, options = {}) {
    const {
      size = 100,
      strokeWidth = 8,
      color = '#C2185B',
      backgroundColor = '#f0f0f0',
      showPercentage = true
    } = options;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const svg = `
      <svg class="progress-circle" width="${size}" height="${size}">
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="${backgroundColor}"
          stroke-width="${strokeWidth}"
          fill="none"
        />
        <circle
          class="progress-circle-bar"
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="${color}"
          stroke-width="${strokeWidth}"
          fill="none"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          stroke-linecap="round"
          transform="rotate(-90 ${size / 2} ${size / 2})"
        />
        ${showPercentage ? `
          <text
            x="50%"
            y="50%"
            text-anchor="middle"
            dy=".3em"
            font-size="${size / 4}px"
            font-weight="bold"
            fill="${color}"
          >
            ${Math.round(progress)}%
          </text>
        ` : ''}
      </svg>
    `;

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      container.innerHTML = svg;
    }

    return svg;
  }
}

// Añadir estilos CSS dinámicamente
const addLoadingStyles = () => {
  if (document.querySelector('#loading-states-styles')) return;

  const style = document.createElement('style');
  style.id = 'loading-states-styles';
  style.textContent = `
    /* Page Transitions */
    .page-exit {
      animation: pageExit 0.4s ease-out forwards;
    }

    @keyframes pageExit {
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    /* Progress Bar */
    .page-progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(0, 0, 0, 0.05);
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .page-progress-bar.active {
      opacity: 1;
    }

    .page-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #C2185B, #7B1FA2);
      transition: width 0.2s ease;
      box-shadow: 0 0 10px rgba(194, 24, 91, 0.5);
    }

    /* Skeleton Loader */
    .skeleton-card,
    .skeleton-list-item,
    .skeleton-product {
      margin-bottom: 1.5rem;
      animation: fadeIn 0.3s ease;
    }

    .skeleton-list-item {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .skeleton-circle {
      border-radius: 50%;
    }

    /* Loading Spinner */
    .loading-spinner {
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top-color: #C2185B;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Full Page Loader */
    .full-page-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .full-page-loader.active {
      opacity: 1;
    }

    .loader-content {
      text-align: center;
    }

    .loader-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-top-color: #C2185B;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    .loader-message {
      color: #333;
      font-size: 1rem;
      margin: 0;
    }

    /* Button Loading */
    .btn-loading {
      pointer-events: none;
      opacity: 0.7;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* Error Message */
    .error-message {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .error-message i {
      font-size: 3rem;
      color: #e74c3c;
      margin-bottom: 1rem;
    }

    .error-message p {
      margin: 1rem 0;
      font-size: 1.1rem;
    }

    /* Progress Circle */
    .progress-circle {
      transition: all 0.3s ease;
    }

    .progress-circle-bar {
      transition: stroke-dashoffset 0.5s ease;
    }

    /* Dark mode */
    [data-theme="dark"] .full-page-loader {
      background: rgba(26, 14, 19, 0.95);
    }

    [data-theme="dark"] .loader-message {
      color: #e0e0e0;
    }

    [data-theme="dark"] .page-progress-bar {
      background: rgba(255, 255, 255, 0.05);
    }
  `;

  document.head.appendChild(style);
};

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addLoadingStyles();
    window.loadingStates = new LoadingStates();
  });
} else {
  addLoadingStyles();
  window.loadingStates = new LoadingStates();
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingStates;
}
