/**
 * Registro y gestión del Service Worker
 * Maneja la instalación, actualización y notificaciones del SW
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isUpdateAvailable = false;
  }

  /**
   * Inicializa y registra el Service Worker
   */
  async init() {
    // Verificar soporte de Service Workers
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers no soportados en este navegador');
      return false;
    }

    try {
      // Registrar Service Worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registrado:', this.registration);

      // Configurar listeners para actualizaciones
      this.setupUpdateListeners();

      // Verificar actualizaciones cada hora
      setInterval(() => this.checkForUpdates(), 60 * 60 * 1000);

      return true;
    } catch (error) {
      console.error('❌ Error al registrar Service Worker:', error);
      return false;
    }
  }

  /**
   * Configura listeners para detectar actualizaciones del SW
   */
  setupUpdateListeners() {
    if (!this.registration) return;

    // Detectar nuevo SW instalándose
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing;
      console.log('🔄 Nueva versión del Service Worker detectada');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Hay una actualización disponible
          this.isUpdateAvailable = true;
          this.showUpdateNotification();
        }
      });
    });

    // Detectar cuando el SW toma control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker actualizado, recargando página...');
      window.location.reload();
    });
  }

  /**
   * Verifica si hay actualizaciones disponibles
   */
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('✅ Verificación de actualizaciones completada');
    } catch (error) {
      console.error('❌ Error al verificar actualizaciones:', error);
    }
  }

  /**
   * Muestra notificación de actualización disponible
   */
  showUpdateNotification() {
    // Crear notificación visual
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="sw-update-content">
        <span class="sw-update-icon">🔄</span>
        <div class="sw-update-text">
          <strong>Nueva versión disponible</strong>
          <p>Hay una actualización disponible para Arreglos Victoria</p>
        </div>
        <button class="btn btn-sm btn-primary sw-update-btn">
          Actualizar ahora
        </button>
        <button class="btn btn-sm btn-ghost sw-dismiss-btn">
          Más tarde
        </button>
      </div>
    `;

    // Agregar estilos si no existen
    if (!document.getElementById('sw-update-styles')) {
      const styles = document.createElement('style');
      styles.id = 'sw-update-styles';
      styles.textContent = `
        .sw-update-notification {
          position: fixed;
          bottom: var(--space-4, 1rem);
          left: 50%;
          transform: translateX(-50%);
          background: var(--white);
          border: 2px solid var(--primary);
          border-radius: var(--radius-lg, 12px);
          box-shadow: var(--shadow-lg);
          padding: var(--space-4, 1rem);
          max-width: 500px;
          width: calc(100% - 2rem);
          z-index: 10000;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .sw-update-content {
          display: flex;
          align-items: center;
          gap: var(--space-3, 0.75rem);
          flex-wrap: wrap;
        }

        .sw-update-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .sw-update-text {
          flex: 1;
          min-width: 200px;
        }

        .sw-update-text strong {
          display: block;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .sw-update-text p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .sw-update-btn,
        .sw-dismiss-btn {
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .sw-update-content {
            flex-direction: column;
            text-align: center;
          }
          
          .sw-update-btn,
          .sw-dismiss-btn {
            width: 100%;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Agregar al DOM
    document.body.appendChild(notification);

    // Configurar botones
    const updateBtn = notification.querySelector('.sw-update-btn');
    const dismissBtn = notification.querySelector('.sw-dismiss-btn');

    updateBtn.addEventListener('click', () => {
      this.applyUpdate();
      notification.remove();
    });

    dismissBtn.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-ocultar después de 30 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 30000);
  }

  /**
   * Aplica la actualización del Service Worker
   */
  applyUpdate() {
    if (!this.registration || !this.registration.waiting) return;

    // Enviar mensaje al SW para que se active inmediatamente
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Precarga URLs específicas en el cache
   */
  async precacheUrls(urls) {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls: urls
    });
  }

  /**
   * Obtiene información del estado del Service Worker
   */
  getStatus() {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.registration,
      updateAvailable: this.isUpdateAvailable,
      controller: !!navigator.serviceWorker.controller
    };
  }
}

// Crear instancia global
const swManager = new ServiceWorkerManager();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => swManager.init());
} else {
  swManager.init();
}

// Exportar para uso global
window.swManager = swManager;

// Event listener para instalar la PWA
window.addEventListener('beforeinstallprompt', (event) => {
  // Prevenir el prompt automático
  event.preventDefault();
  
  // Guardar el evento para usarlo después
  window.deferredInstallPrompt = event;
  
  // Mostrar botón de instalación personalizado
  const installButton = document.getElementById('install-pwa-btn');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', async () => {
      if (window.deferredInstallPrompt) {
        window.deferredInstallPrompt.prompt();
        const { outcome } = await window.deferredInstallPrompt.userChoice;
        console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
        window.deferredInstallPrompt = null;
        installButton.style.display = 'none';
      }
    });
  }
  
  console.log('💡 PWA instalable - Evento beforeinstallprompt capturado');
});

// Detectar cuando la app es instalada
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalada exitosamente');
  window.deferredInstallPrompt = null;
  
  // Ocultar botón de instalación
  const installButton = document.getElementById('install-pwa-btn');
  if (installButton) {
    installButton.style.display = 'none';
  }
});

console.log('✅ Service Worker Manager inicializado');
