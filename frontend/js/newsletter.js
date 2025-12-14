/**
 * Newsletter Popup con Descuento - Flores Victoria
 * Popup de suscripción con cupón 10% OFF
 */

/* eslint-disable no-console */

const NewsletterPopup = {
  // Configuración
  config: {
    delayMs: 5000, // Mostrar después de 5 segundos
    cookieDays: 7, // No mostrar de nuevo por 7 días
    exitIntentEnabled: true, // Detectar intención de salida
    discountCode: 'BIENVENIDO10',
    discountPercent: 10,
  },

  // Estado
  isShown: false,

  /**
   * Verificar si debe mostrar popup
   */
  shouldShow() {
    // No mostrar si ya está suscrito
    if (localStorage.getItem('newsletter_subscribed')) {
      return false;
    }

    // No mostrar si lo cerró recientemente
    const dismissed = localStorage.getItem('newsletter_dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysDiff = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      if (daysDiff < this.config.cookieDays) {
        return false;
      }
    }

    return true;
  },

  /**
   * Crear HTML del popup
   */
  createPopup() {
    const popup = document.createElement('div');
    popup.id = 'newsletter-popup';
    popup.innerHTML = `
      <style>
        #newsletter-popup {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 10000;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        #newsletter-popup.active {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .newsletter-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
        }
        
        .newsletter-modal {
          position: relative;
          width: 90%;
          max-width: 480px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          animation: popIn 0.4s ease;
        }
        
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .newsletter-header {
          background: linear-gradient(135deg, #C2185B, #E91E63);
          color: white;
          text-align: center;
          padding: 30px 20px;
        }
        
        .newsletter-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        
        .newsletter-header h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        
        .newsletter-discount {
          display: inline-block;
          margin-top: 12px;
          padding: 8px 20px;
          background: rgba(255,255,255,0.2);
          border-radius: 30px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .newsletter-body {
          padding: 30px;
          text-align: center;
        }
        
        .newsletter-body p {
          color: #666;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 24px;
        }
        
        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .newsletter-input {
          padding: 14px 18px;
          border: 2px solid #eee;
          border-radius: 10px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .newsletter-input:focus {
          border-color: #C2185B;
        }
        
        .newsletter-submit {
          padding: 16px;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .newsletter-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(194, 24, 91, 0.4);
        }
        
        .newsletter-dismiss {
          margin-top: 16px;
          background: none;
          border: none;
          color: #999;
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
        }
        
        .newsletter-dismiss:hover {
          color: #666;
        }
        
        .newsletter-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .newsletter-close:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .newsletter-success {
          display: none;
          text-align: center;
          padding: 40px 30px;
        }
        
        .newsletter-success.active {
          display: block;
        }
        
        .newsletter-success .success-icon {
          font-size: 60px;
          margin-bottom: 16px;
        }
        
        .newsletter-success h3 {
          margin: 0 0 12px;
          font-size: 24px;
          color: #333;
        }
        
        .newsletter-success p {
          color: #666;
          margin: 0 0 20px;
        }
        
        .newsletter-coupon-code {
          display: inline-block;
          padding: 14px 28px;
          background: #f5f5f5;
          border: 2px dashed #C2185B;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 700;
          color: #C2185B;
          letter-spacing: 2px;
          cursor: pointer;
        }
        
        .newsletter-coupon-code:hover {
          background: #fce4ec;
        }
        
        .copy-hint {
          font-size: 12px;
          color: #999;
          margin-top: 8px;
        }
        
        .newsletter-benefits {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .benefit {
          font-size: 12px;
          color: #666;
        }
        
        @media (max-width: 480px) {
          .newsletter-modal {
            width: 95%;
            margin: 10px;
          }
          
          .newsletter-header h2 {
            font-size: 22px;
          }
          
          .newsletter-benefits {
            flex-direction: column;
            gap: 8px;
          }
        }
      </style>
      
      <div class="newsletter-overlay" onclick="NewsletterPopup.close()"></div>
      
      <div class="newsletter-modal">
        <button class="newsletter-close" onclick="NewsletterPopup.close()" aria-label="Cerrar">✕</button>
        
        <div class="newsletter-content">
          <div class="newsletter-header">
            <div class="newsletter-icon">🌸</div>
            <h2>¡Bienvenido a Flores Victoria!</h2>
            <div class="newsletter-discount">${this.config.discountPercent}% OFF en tu primera compra</div>
          </div>
          
          <div class="newsletter-body">
            <p>Suscríbete a nuestro newsletter y recibe un <strong>cupón de descuento</strong> instantáneo, además de ofertas exclusivas y novedades florales.</p>
            
            <form class="newsletter-form" onsubmit="NewsletterPopup.subscribe(event)">
              <input 
                type="email" 
                class="newsletter-input" 
                id="newsletter-email"
                placeholder="Tu correo electrónico"
                required
              >
              <button type="submit" class="newsletter-submit">
                🎁 Obtener mi ${this.config.discountPercent}% de descuento
              </button>
            </form>
            
            <button class="newsletter-dismiss" onclick="NewsletterPopup.dismiss()">
              No, gracias. Prefiero pagar precio completo.
            </button>
            
            <div class="newsletter-benefits">
              <span class="benefit">✓ Sin spam</span>
              <span class="benefit">✓ Ofertas exclusivas</span>
              <span class="benefit">✓ Cancela cuando quieras</span>
            </div>
          </div>
        </div>
        
        <div class="newsletter-success" id="newsletter-success">
          <div class="success-icon">🎉</div>
          <h3>¡Gracias por suscribirte!</h3>
          <p>Aquí está tu cupón de descuento:</p>
          <div class="newsletter-coupon-code" onclick="NewsletterPopup.copyCoupon()">${this.config.discountCode}</div>
          <p class="copy-hint">Click para copiar</p>
          <button class="newsletter-submit" style="margin-top: 20px;" onclick="NewsletterPopup.close()">
            ¡Empezar a comprar!
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    return popup;
  },

  /**
   * Mostrar popup
   */
  show() {
    if (this.isShown || !this.shouldShow()) return;

    const popup = document.getElementById('newsletter-popup') || this.createPopup();
    popup.classList.add('active');
    this.isShown = true;

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';

    console.log('📧 Newsletter popup mostrado');
  },

  /**
   * Cerrar popup
   */
  close() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) {
      popup.classList.remove('active');
    }
    document.body.style.overflow = '';
  },

  /**
   * Descartar popup
   */
  dismiss() {
    localStorage.setItem('newsletter_dismissed', new Date().toISOString());
    this.close();
  },

  /**
   * Manejar suscripción
   */
  subscribe(event) {
    event.preventDefault();

    const email = document.getElementById('newsletter-email').value;

    // En producción, enviar a la API
    console.log('📧 Newsletter subscription:', email);

    // Marcar como suscrito
    localStorage.setItem('newsletter_subscribed', 'true');
    localStorage.setItem('newsletter_email', email);

    // Track analytics
    if (window.AnalyticsService) {
      window.AnalyticsService.subscribe(email);
    }

    // Mostrar éxito
    document.querySelector('.newsletter-content').style.display = 'none';
    document.getElementById('newsletter-success').classList.add('active');
  },

  /**
   * Copiar cupón
   */
  copyCoupon() {
    navigator.clipboard.writeText(this.config.discountCode).then(() => {
      const codeEl = document.querySelector('.newsletter-coupon-code');
      codeEl.textContent = '¡Copiado!';
      setTimeout(() => {
        codeEl.textContent = this.config.discountCode;
      }, 2000);
    });
  },

  /**
   * Detectar intención de salida
   */
  setupExitIntent() {
    if (!this.config.exitIntentEnabled) return;

    let exitTriggered = false;

    document.addEventListener('mouseout', (e) => {
      if (exitTriggered || this.isShown) return;

      // Detectar si el mouse sale por arriba
      if (e.clientY < 10 && e.relatedTarget === null) {
        exitTriggered = true;
        this.show();
      }
    });
  },

  /**
   * Inicializar
   */
  init() {
    if (!this.shouldShow()) {
      console.log('📧 Newsletter popup: ya suscrito o recientemente descartado');
      return;
    }

    // Mostrar después de delay
    setTimeout(() => {
      this.show();
    }, this.config.delayMs);

    // Configurar exit intent como backup
    this.setupExitIntent();

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });

    console.log('📧 Newsletter popup inicializado');
  },
};

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
  NewsletterPopup.init();
});

window.NewsletterPopup = NewsletterPopup;
