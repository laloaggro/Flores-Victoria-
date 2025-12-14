/**
 * Cookie Consent Banner con Google Consent Mode v2
 * Flores Victoria - Cumplimiento GDPR/CCPA
 *
 * Este módulo gestiona el consentimiento de cookies y configura
 * Google Analytics 4 según las preferencias del usuario.
 */

/* eslint-disable no-undef, no-console */
/* global gtag, dataLayer */

const CookieConsent = {
  STORAGE_KEY: 'flores_victoria_consent',
  VERSION: '1.0',

  // Configuración por defecto (denegado hasta que el usuario acepte)
  defaultConsent: {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted', // Cookies necesarias siempre permitidas
    personalization_storage: 'denied',
    security_storage: 'granted', // Cookies de seguridad siempre permitidas
  },

  /**
   * Inicializar el sistema de consentimiento
   * IMPORTANTE: Debe llamarse ANTES de cargar gtag.js
   */
  init() {
    // Inicializar dataLayer si no existe
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        dataLayer.push(arguments);
      };

    // Verificar si ya hay consentimiento guardado
    const savedConsent = this.getSavedConsent();

    if (savedConsent) {
      // Aplicar consentimiento guardado
      this.applyConsent(savedConsent);
      console.log('🍪 Consent: Usando preferencias guardadas');
    } else {
      // Aplicar consentimiento por defecto (denegado)
      this.setDefaultConsent();
      // Mostrar banner
      this.showBanner();
      console.log('🍪 Consent: Mostrando banner');
    }
  },

  /**
   * Establecer consentimiento por defecto (antes de interacción del usuario)
   */
  setDefaultConsent() {
    gtag('consent', 'default', {
      ...this.defaultConsent,
      wait_for_update: 500, // Esperar 500ms por actualización del usuario
    });

    // Configurar región para GDPR (Europa) y otros
    gtag('consent', 'default', {
      ...this.defaultConsent,
      region: ['ES', 'CL', 'MX', 'AR', 'CO', 'PE', 'EC', 'VE', 'UY', 'PY', 'BO'],
    });
  },

  /**
   * Aplicar consentimiento (cuando el usuario acepta/rechaza)
   */
  applyConsent(consent) {
    gtag('consent', 'update', consent);
  },

  /**
   * Obtener consentimiento guardado en localStorage
   */
  getSavedConsent() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // Verificar versión para invalidar consentimientos antiguos
        if (data.version === this.VERSION) {
          return data.consent;
        }
      }
    } catch (e) {
      console.warn('Error reading consent:', e);
    }
    return null;
  },

  /**
   * Guardar consentimiento en localStorage
   */
  saveConsent(consent) {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          version: this.VERSION,
          consent: consent,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Error saving consent:', e);
    }
  },

  /**
   * Usuario acepta todas las cookies
   */
  acceptAll() {
    const consent = {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
    };

    this.applyConsent(consent);
    this.saveConsent(consent);
    this.hideBanner();

    console.log('🍪 Consent: Usuario aceptó todas las cookies');

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: consent }));
  },

  /**
   * Usuario rechaza cookies opcionales (solo necesarias)
   */
  rejectOptional() {
    const consent = {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
    };

    this.applyConsent(consent);
    this.saveConsent(consent);
    this.hideBanner();

    console.log('🍪 Consent: Usuario rechazó cookies opcionales');

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: consent }));
  },

  /**
   * Usuario personaliza sus preferencias
   */
  saveCustomConsent(preferences) {
    const consent = {
      ad_storage: preferences.advertising ? 'granted' : 'denied',
      ad_user_data: preferences.advertising ? 'granted' : 'denied',
      ad_personalization: preferences.advertising ? 'granted' : 'denied',
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      functionality_storage: 'granted',
      personalization_storage: preferences.personalization ? 'granted' : 'denied',
      security_storage: 'granted',
    };

    this.applyConsent(consent);
    this.saveConsent(consent);
    this.hideBanner();
    this.hideSettings();

    console.log('🍪 Consent: Usuario guardó preferencias personalizadas');

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: consent }));
  },

  /**
   * Mostrar el banner de consentimiento
   */
  showBanner() {
    // Crear banner si no existe
    if (!document.getElementById('cookie-consent-banner')) {
      this.createBanner();
    }

    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.add('visible');
      banner.setAttribute('aria-hidden', 'false');
    }
  },

  /**
   * Ocultar el banner
   */
  hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.remove('visible');
      banner.setAttribute('aria-hidden', 'true');
    }
  },

  /**
   * Mostrar configuración avanzada
   */
  showSettings() {
    const settings = document.getElementById('cookie-consent-settings');
    if (settings) {
      settings.classList.add('visible');
      settings.setAttribute('aria-hidden', 'false');
    }
  },

  /**
   * Ocultar configuración avanzada
   */
  hideSettings() {
    const settings = document.getElementById('cookie-consent-settings');
    if (settings) {
      settings.classList.remove('visible');
      settings.setAttribute('aria-hidden', 'true');
    }
  },

  /**
   * Crear el HTML del banner
   */
  createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-consent-title');
    banner.setAttribute('aria-describedby', 'cookie-consent-description');
    banner.setAttribute('aria-hidden', 'true');

    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-icon">
          <i class="fas fa-cookie-bite"></i>
        </div>
        <div class="cookie-consent-text">
          <h3 id="cookie-consent-title">🍪 Utilizamos cookies</h3>
          <p id="cookie-consent-description">
            En Flores Victoria usamos cookies para mejorar tu experiencia, 
            analizar el tráfico y personalizar contenido. Puedes aceptar todas, 
            rechazar las opcionales o personalizar tu elección.
          </p>
          <a href="/pages/privacy.html" class="cookie-consent-link" target="_blank">
            Política de Privacidad
          </a>
        </div>
        <div class="cookie-consent-actions">
          <button type="button" class="cookie-btn cookie-btn-accept" onclick="CookieConsent.acceptAll()">
            <i class="fas fa-check"></i> Aceptar todas
          </button>
          <button type="button" class="cookie-btn cookie-btn-reject" onclick="CookieConsent.rejectOptional()">
            <i class="fas fa-times"></i> Solo necesarias
          </button>
          <button type="button" class="cookie-btn cookie-btn-settings" onclick="CookieConsent.showSettings()">
            <i class="fas fa-cog"></i> Personalizar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Crear modal de configuración
    this.createSettingsModal();
  },

  /**
   * Crear modal de configuración avanzada
   */
  createSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'cookie-consent-settings';
    modal.className = 'cookie-consent-settings';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'cookie-settings-title');
    modal.setAttribute('aria-hidden', 'true');

    // Obtener consentimiento actual o usar defaults
    const saved = this.getSavedConsent();
    const analyticsChecked = saved?.analytics_storage === 'granted' ? 'checked' : '';
    const personalizationChecked = saved?.personalization_storage === 'granted' ? 'checked' : '';
    const advertisingChecked = saved?.ad_storage === 'granted' ? 'checked' : '';

    modal.innerHTML = `
      <div class="cookie-settings-overlay" onclick="CookieConsent.hideSettings()"></div>
      <div class="cookie-settings-content">
        <div class="cookie-settings-header">
          <h3 id="cookie-settings-title">
            <i class="fas fa-sliders-h"></i> Preferencias de Cookies
          </h3>
          <button type="button" class="cookie-settings-close" onclick="CookieConsent.hideSettings()" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="cookie-settings-body">
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-info">
                <h4><i class="fas fa-shield-alt"></i> Cookies Necesarias</h4>
                <p>Esenciales para el funcionamiento del sitio. No se pueden desactivar.</p>
              </div>
              <div class="cookie-toggle disabled">
                <input type="checkbox" id="cookie-necessary" checked disabled>
                <label for="cookie-necessary">Siempre activas</label>
              </div>
            </div>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-info">
                <h4><i class="fas fa-chart-line"></i> Cookies de Análisis</h4>
                <p>Nos ayudan a entender cómo usas el sitio para mejorarlo.</p>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-analytics" ${analyticsChecked}>
                <label for="cookie-analytics">
                  <span class="toggle-switch"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-info">
                <h4><i class="fas fa-user-cog"></i> Cookies de Personalización</h4>
                <p>Permiten recordar tus preferencias y personalizar tu experiencia.</p>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-personalization" ${personalizationChecked}>
                <label for="cookie-personalization">
                  <span class="toggle-switch"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div class="cookie-category-info">
                <h4><i class="fas fa-ad"></i> Cookies de Publicidad</h4>
                <p>Se utilizan para mostrarte anuncios relevantes.</p>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-advertising" ${advertisingChecked}>
                <label for="cookie-advertising">
                  <span class="toggle-switch"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="cookie-settings-footer">
          <button type="button" class="cookie-btn cookie-btn-reject" onclick="CookieConsent.rejectOptional()">
            Rechazar opcionales
          </button>
          <button type="button" class="cookie-btn cookie-btn-accept" onclick="CookieConsent.saveFromSettings()">
            Guardar preferencias
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  /**
   * Guardar desde el modal de configuración
   */
  saveFromSettings() {
    const analytics = document.getElementById('cookie-analytics')?.checked || false;
    const personalization = document.getElementById('cookie-personalization')?.checked || false;
    const advertising = document.getElementById('cookie-advertising')?.checked || false;

    this.saveCustomConsent({
      analytics,
      personalization,
      advertising,
    });
  },

  /**
   * Reabrir el banner para cambiar preferencias
   */
  reopenBanner() {
    this.showBanner();
  },

  /**
   * Verificar si analytics está permitido
   */
  isAnalyticsAllowed() {
    const consent = this.getSavedConsent();
    return consent?.analytics_storage === 'granted';
  },
};

// Exportar para uso global
window.CookieConsent = CookieConsent;

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
} else {
  CookieConsent.init();
}
