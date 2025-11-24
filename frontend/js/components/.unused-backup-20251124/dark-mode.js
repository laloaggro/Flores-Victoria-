/**
 * ============================================================================
 * Dark Mode Component v2.0.0 - Flores Victoria
 * ============================================================================
 *
 * Sistema completo de temas claro/oscuro con persistencia y transiciones.
 *
 * @component DarkMode
 * @version 2.0.0
 * @author Flores Victoria Team
 * @license MIT
 *
 * ⚠️  IMPORTANTE: Requiere CSS externo
 * Este componente requiere: /css/components/dark-mode.css
 *
 * En tu HTML, incluye ANTES de este script:
 * <link rel="stylesheet" href="/css/components/dark-mode.css">
 * <script src="/js/components/dark-mode.js"></script>
 *
 * @features
 * - 🌙 Toggle suave entre temas
 * - 💾 Persistencia en localStorage
 * - 🎨 Respeta prefers-color-scheme
 * - ⚡ Transiciones suaves CSS
 * - 🔄 Sync entre pestañas
 * - ♿ Accesibilidad completa
 * - 📱 Responsive
 * - 🎯 Sin FOUC (Flash of Unstyled Content)
 *
 * @example
 * // Auto-inicializado globalmente
 * FloresVictoriaComponents.DarkMode.toggle();
 * FloresVictoriaComponents.DarkMode.setTheme('dark');
 * FloresVictoriaComponents.DarkMode.getTheme();
 */

(function () {
  'use strict';

  // Logger condicional
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.DEBUG === true);
  const logger = {
    log: (...args) => isDev && console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
  };

  const DarkMode = {
    // Configuración
    config: {
      storageKey: 'flores-victoria-theme',
      attribute: 'data-theme',
      transitionDuration: 300,
      themes: ['light', 'dark', 'auto'],
    },

    // Estado
    state: {
      current: 'auto',
      systemPreference: null,
      isTransitioning: false,
    },

    // Referencias DOM
    refs: {
      toggle: null,
      icon: null,
      statusText: null,
    },

    /**
     * Inicialización
     */
    init() {
      logger.log('[DarkMode] 🌓 Initializing...');

      // Detectar preferencia del sistema
      this.detectSystemPreference();

      // Cargar tema guardado
      this.loadSavedTheme();

      // Aplicar tema inicial (antes de render para evitar FOUC)
      this.applyTheme(this.state.current);

      // Crear UI
      this.render();

      // Adjuntar event listeners
      this.attachEventListeners();

      // Sync entre pestañas
      this.setupStorageSync();

      logger.log('[DarkMode] ✅ Initialized with theme:', this.state.current);
    },

    /**
     * Detecta preferencia del sistema
     */
    detectSystemPreference() {
      if (window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.state.systemPreference = prefersDark.matches ? 'dark' : 'light';

        // Escuchar cambios en preferencia del sistema
        prefersDark.addEventListener('change', (e) => {
          this.state.systemPreference = e.matches ? 'dark' : 'light';

          // Si el tema es 'auto', actualizar
          if (this.state.current === 'auto') {
            this.applyTheme('auto');
            this.updateUI();
          }
        });
      } else {
        this.state.systemPreference = 'light';
      }
    },

    /**
     * Carga tema guardado desde localStorage
     */
    loadSavedTheme() {
      try {
        const saved = localStorage.getItem(this.config.storageKey);
        if (saved && this.config.themes.includes(saved)) {
          this.state.current = saved;
        }
      } catch (error) {
        logger.warn('[DarkMode] Could not load saved theme:', error);
      }
    },

    /**
     * Guarda tema en localStorage
     */
    saveTheme(theme) {
      try {
        localStorage.setItem(this.config.storageKey, theme);
      } catch (error) {
        logger.warn('[DarkMode] Could not save theme:', error);
      }
    },

    /**
     * Renderiza el toggle en el DOM
     */
    render() {
      // Buscar contenedor existente o crear uno
      let container = document.getElementById('dark-mode-toggle');

      if (!container) {
        container = document.createElement('div');
        container.id = 'dark-mode-toggle';
        container.className = 'dark-mode-toggle';

        // Agregar al header si existe, sino al body
        const header = document.querySelector('header') || document.body;
        header.appendChild(container);
      }

      // Renderizar contenido
      container.innerHTML = `
        <button 
          class="dark-mode-btn" 
          aria-label="Cambiar tema" 
          aria-pressed="false"
          title="Cambiar entre tema claro y oscuro"
        >
          <span class="dark-mode-icon" aria-hidden="true">
            ${this.getIcon()}
          </span>
          <span class="dark-mode-text" aria-live="polite">
            ${this.getStatusText()}
          </span>
        </button>
      `;

      // Guardar referencias
      this.refs.toggle = container.querySelector('.dark-mode-btn');
      this.refs.icon = container.querySelector('.dark-mode-icon');
      this.refs.statusText = container.querySelector('.dark-mode-text');

      // Inyectar estilos
      this.injectStyles();

      // Actualizar UI inicial
      this.updateUI();
    },

    /**
     * Obtiene el ícono según el tema actual
     */
    getIcon() {
      const effectiveTheme = this.getEffectiveTheme();

      const icons = {
        light: `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5" stroke-width="2"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-width="2" stroke-linecap="round"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-width="2" stroke-linecap="round"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke-width="2" stroke-linecap="round"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-width="2" stroke-linecap="round"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `,
        dark: `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `,
      };

      return icons[effectiveTheme] || icons.light;
    },

    /**
     * Obtiene el texto de estado
     */
    getStatusText() {
      const effectiveTheme = this.getEffectiveTheme();
      return effectiveTheme === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
    },

    /**
     * Obtiene el tema efectivo (resuelve 'auto')
     */
    getEffectiveTheme() {
      if (this.state.current === 'auto') {
        return this.state.systemPreference || 'light';
      }
      return this.state.current;
    },

    /**
     * Actualiza la UI del toggle
     */
    updateUI() {
      if (!this.refs.icon || !this.refs.statusText) return;

      // Actualizar ícono
      this.refs.icon.innerHTML = this.getIcon();

      // Actualizar texto
      this.refs.statusText.textContent = this.getStatusText();

      // Actualizar aria-pressed
      const effectiveTheme = this.getEffectiveTheme();
      this.refs.toggle.setAttribute('aria-pressed', effectiveTheme === 'dark');
    },

    /**
     * Aplica el tema al documento
     */
    applyTheme(theme) {
      const effectiveTheme = theme === 'auto' ? this.state.systemPreference : theme;

      // Prevenir transiciones durante la aplicación inicial
      if (!this.state.isTransitioning) {
        document.documentElement.classList.add('theme-transitioning');
      }

      // Aplicar atributo
      document.documentElement.setAttribute(this.config.attribute, effectiveTheme);

      // Actualizar meta theme-color
      this.updateThemeColor(effectiveTheme);

      // Restaurar transiciones después de un frame
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
        this.state.isTransitioning = false;
      }, 50);
    },

    /**
     * Actualiza el color del tema en la meta tag
     */
    updateThemeColor(theme) {
      let metaTheme = document.querySelector('meta[name="theme-color"]');

      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
      }

      metaTheme.content = theme === 'dark' ? '#1a202c' : '#C2185B';
    },

    /**
     * Toggle entre temas
     */
    toggle() {
      const current = this.state.current;
      let next;

      // Ciclo: auto → light → dark → auto
      if (current === 'auto') {
        next = 'light';
      } else if (current === 'light') {
        next = 'dark';
      } else {
        next = 'auto';
      }

      this.setTheme(next);
    },

    /**
     * Establece un tema específico
     */
    setTheme(theme) {
      if (!this.config.themes.includes(theme)) {
        logger.warn('[DarkMode] Invalid theme:', theme);
        return;
      }

      this.state.current = theme;
      this.state.isTransitioning = true;

      // Aplicar tema
      this.applyTheme(theme);

      // Guardar en localStorage
      this.saveTheme(theme);

      // Actualizar UI
      this.updateUI();

      // Emitir evento personalizado
      this.emitThemeChange(theme);

      // Analytics
      this.trackThemeChange(theme);

      logger.log('[DarkMode] Theme changed to:', theme);
    },

    /**
     * Obtiene el tema actual
     */
    getTheme() {
      return this.state.current;
    },

    /**
     * Adjunta event listeners
     */
    attachEventListeners() {
      if (this.refs.toggle) {
        this.refs.toggle.addEventListener('click', () => {
          this.toggle();
        });

        // Teclado: Enter o Space
        this.refs.toggle.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggle();
          }
        });
      }
    },

    /**
     * Configura sincronización entre pestañas
     */
    setupStorageSync() {
      window.addEventListener('storage', (e) => {
        if (e.key === this.config.storageKey && e.newValue) {
          const newTheme = e.newValue;
          if (this.config.themes.includes(newTheme) && newTheme !== this.state.current) {
            this.setTheme(newTheme);
          }
        }
      });
    },

    /**
     * Emite evento de cambio de tema
     */
    emitThemeChange(theme) {
      const event = new CustomEvent('themechange', {
        detail: {
          theme,
          effectiveTheme: this.getEffectiveTheme(),
        },
      });
      window.dispatchEvent(event);
    },

    /**
     * Tracking de analytics
     */
    trackThemeChange(theme) {
      if (window.FloresVictoriaComponents?.Analytics) {
        window.FloresVictoriaComponents.Analytics.track('theme_change', {
          theme,
          effective_theme: this.getEffectiveTheme(),
        });
      }
    },

    /**
     * Verifica que el CSS esté cargado
     * NOTA: Los estilos ahora están en /css/components/dark-mode.css
     * Asegúrate de incluir ese archivo en el HTML antes de este script
     */
    injectStyles() {
      // Verificar si el CSS está cargado
      const cssLoaded = Array.from(document.styleSheets).some((sheet) => {
        try {
          return sheet.href && sheet.href.includes('dark-mode.css');
        } catch (e) {
          return false;
        }
      });

      if (!cssLoaded) {
        logger.warn(
          '[DarkMode] ⚠️  CSS no detectado. Incluye /css/components/dark-mode.css en el HTML'
        );
      }
    },

    /**
     * Destruir componente
     */
    destroy() {
      if (this.refs.toggle) {
        this.refs.toggle.remove();
      }

      // Nota: Los estilos CSS están en archivo separado, no se eliminan aquí

      logger.log('[DarkMode] 🗑️  Destroyed');
    },
  };

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DarkMode.init());
  } else {
    DarkMode.init();
  }

  // Exportar globalmente
  window.FloresVictoriaComponents = window.FloresVictoriaComponents || {};
  window.FloresVictoriaComponents.DarkMode = DarkMode;
})();
