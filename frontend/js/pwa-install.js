/**
 * PWA Install Prompt Banner - Flores Victoria
 * Banner personalizado para instalar la app
 */

/* eslint-disable no-console */

const PWAInstallPrompt = {
  // Evento de instalación diferido
  deferredPrompt: null,

  // Configuración
  config: {
    delayMs: 10000, // Mostrar después de 10 segundos
    dismissDays: 14, // No mostrar por 14 días si descarta
    minPageViews: 2, // Mostrar después de 2 páginas vistas
  },

  /**
   * Verificar si debe mostrar
   */
  shouldShow() {
    // No mostrar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return false;
    }

    // No mostrar si ya instaló
    if (localStorage.getItem('pwa_installed')) {
      return false;
    }

    // No mostrar si descartó recientemente
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) {
      const daysDiff = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysDiff < this.config.dismissDays) {
        return false;
      }
    }

    // Verificar page views mínimos
    let pageViews = parseInt(localStorage.getItem('pwa_pageviews') || '0');
    pageViews++;
    localStorage.setItem('pwa_pageviews', pageViews);

    if (pageViews < this.config.minPageViews) {
      return false;
    }

    return true;
  },

  /**
   * Crear banner
   */
  createBanner() {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <style>
        #pwa-install-banner {
          display: none;
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          max-width: 420px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 9997;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          animation: slideUp 0.4s ease;
        }
        
        #pwa-install-banner.active {
          display: block;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .pwa-banner-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
        }
        
        .pwa-app-icon {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .pwa-app-icon img {
          width: 48px;
          height: 48px;
        }
        
        .pwa-app-icon span {
          font-size: 32px;
        }
        
        .pwa-info {
          flex: 1;
        }
        
        .pwa-info h4 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        
        .pwa-info p {
          margin: 0;
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }
        
        .pwa-actions {
          display: flex;
          gap: 8px;
          padding: 0 16px 16px;
        }
        
        .pwa-install-btn {
          flex: 1;
          padding: 12px 20px;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .pwa-install-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(194, 24, 91, 0.4);
        }
        
        .pwa-dismiss-btn {
          padding: 12px 16px;
          background: #f5f5f5;
          color: #666;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .pwa-dismiss-btn:hover {
          background: #eee;
        }
        
        .pwa-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          background: #f5f5f5;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #999;
        }
        
        .pwa-close:hover {
          background: #eee;
        }
        
        .pwa-benefits {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: #f9f9f9;
          border-top: 1px solid #eee;
        }
        
        .pwa-benefit {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #666;
        }
        
        .pwa-benefit-icon {
          font-size: 14px;
        }
        
        @media (max-width: 480px) {
          #pwa-install-banner {
            left: 10px;
            right: 10px;
            bottom: 10px;
          }
          
          .pwa-benefits {
            flex-wrap: wrap;
          }
        }
      </style>
      
      <button class="pwa-close" onclick="PWAInstallPrompt.dismiss()" aria-label="Cerrar">✕</button>
      
      <div class="pwa-banner-content">
        <div class="pwa-app-icon">
          <span>🌸</span>
        </div>
        <div class="pwa-info">
          <h4>Instala Flores Victoria</h4>
          <p>Acceso rápido, notificaciones y funciona sin internet</p>
        </div>
      </div>
      
      <div class="pwa-actions">
        <button class="pwa-dismiss-btn" onclick="PWAInstallPrompt.dismiss()">Ahora no</button>
        <button class="pwa-install-btn" onclick="PWAInstallPrompt.install()">📲 Instalar App</button>
      </div>
      
      <div class="pwa-benefits">
        <span class="pwa-benefit"><span class="pwa-benefit-icon">⚡</span> Más rápido</span>
        <span class="pwa-benefit"><span class="pwa-benefit-icon">📴</span> Sin internet</span>
        <span class="pwa-benefit"><span class="pwa-benefit-icon">🔔</span> Notificaciones</span>
        <span class="pwa-benefit"><span class="pwa-benefit-icon">💾</span> Sin espacio</span>
      </div>
    `;

    document.body.appendChild(banner);
    return banner;
  },

  /**
   * Mostrar banner
   */
  show() {
    if (!this.deferredPrompt || !this.shouldShow()) {
      return;
    }

    const banner = document.getElementById('pwa-install-banner') || this.createBanner();
    banner.classList.add('active');

    console.log('📲 PWA install banner mostrado');
  },

  /**
   * Instalar PWA
   */
  async install() {
    if (!this.deferredPrompt) {
      console.log('📲 No hay prompt diferido disponible');
      return;
    }

    // Mostrar prompt nativo
    this.deferredPrompt.prompt();

    // Esperar respuesta
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('📲 Usuario aceptó instalar PWA');
      localStorage.setItem('pwa_installed', 'true');

      // Track analytics
      if (window.AnalyticsService) {
        window.gtag?.('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'accepted',
        });
      }
    } else {
      console.log('📲 Usuario rechazó instalar PWA');
    }

    // Limpiar prompt
    this.deferredPrompt = null;
    this.hide();
  },

  /**
   * Descartar banner
   */
  dismiss() {
    localStorage.setItem('pwa_dismissed', Date.now().toString());
    this.hide();

    console.log('📲 PWA install banner descartado');
  },

  /**
   * Ocultar banner
   */
  hide() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('active');
    }
  },

  /**
   * Inicializar
   */
  init() {
    // Capturar evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevenir el prompt automático
      e.preventDefault();

      // Guardar para usar después
      this.deferredPrompt = e;

      console.log('📲 PWA install prompt capturado');

      // Mostrar banner después de delay
      setTimeout(() => {
        this.show();
      }, this.config.delayMs);
    });

    // Detectar si ya está instalada
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa_installed', 'true');
      this.hide();
      console.log('📲 PWA instalada exitosamente');
    });

    // Verificar si ya está en modo standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      localStorage.setItem('pwa_installed', 'true');
      console.log('📲 App ejecutándose en modo standalone');
    }

    console.log('📲 PWA Install Prompt inicializado');
  },
};

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
  PWAInstallPrompt.init();
});

window.PWAInstallPrompt = PWAInstallPrompt;
