/**
 * ============================================================================
 * Footer Component - Unified Site Footer
 * ============================================================================
 *
 * Componente de footer unificado con información de contacto, enlaces rápidos,
 * redes sociales y horarios de atención.
 *
 * @module FooterComponent
 * @version 2.0.0
 * @requires Font Awesome 6+ (para iconos)
 *
 * Uso:
 *   1. Agregar en HTML: <div id="footer-root"></div>
 *   2. Incluir script: <script src="/js/components/footer-component.js"></script>
 *   3. Auto-inicialización al cargar la página
 *
 * Características:
 *   - Grid responsive con 4 columnas (1 en móvil)
 *   - Enlaces a redes sociales activas
 *   - Información de contacto actualizada
 *   - Horarios de atención
 *   - Enlaces legales y de navegación
 *   - Copyright dinámico por año
 */

// Logger condicional
const _isDev_footer =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.DEBUG === true);
const _logger_footer = {
  log: (...args) => _isDev_footer && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  debug: (...args) => _isDev_footer && console.debug(...args),
};

const FooterComponent = {
  // ========================================
  // Configuración
  // ========================================

  config: {
    mountPoint: 'footer-root',
    enableAutoInit: true,
    businessInfo: {
      name: 'Flores Victoria',
      tagline:
        'Tu florería de confianza en Recoleta. Arreglos florales únicos y frescos para cada ocasión especial.',
      address: 'Av. Recoleta 1234, Recoleta, Santiago',
      phone: '+56 2 2345 6789',
      email: 'contacto@flores-victoria.cl',
    },
    socialLinks: [
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/profile.php?id=61578999845743',
        icon: 'fab fa-facebook-f',
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/arreglosvictoria/',
        icon: 'fab fa-instagram',
      },
      {
        name: 'Twitter',
        url: '#',
        icon: 'fab fa-twitter',
      },
      {
        name: 'Pinterest',
        url: '#',
        icon: 'fab fa-pinterest',
      },
    ],
    quickLinks: [
      { label: 'Inicio', path: '/index.html' },
      { label: 'Productos', path: '/pages/products.html' },
      { label: 'Categorías', path: '/pages/products.html' },
      { label: 'Galería', path: '/pages/gallery.html' },
      { label: 'Nosotros', path: '/pages/about.html' },
      { label: 'Blog', path: '/pages/blog.html' },
      { label: 'Contacto', path: '/pages/contact.html' },
    ],
    legalLinks: [
      { label: 'Política de Privacidad', path: '/pages/privacy.html' },
      { label: 'Términos y Condiciones', path: '/pages/terms.html' },
      { label: 'Preguntas Frecuentes', path: '/pages/faq.html' },
      { label: 'Testimonios', path: '/pages/testimonials.html' },
      { label: 'Mapa del Sitio', path: '/pages/sitemap.html' },
    ],
    businessHours: [
      { days: 'Lunes a Viernes', hours: '9:00 - 19:00' },
      { days: 'Sábado', hours: '9:00 - 18:00' },
      { days: 'Domingo', hours: '10:00 - 15:00' },
    ],
  },

  // ========================================
  // Métodos de renderizado
  // ========================================

  /**
   * Genera la sección de información del negocio
   * @returns {string} HTML de la sección about
   */
  renderAboutSection() {
    const { name, tagline } = this.config.businessInfo;

    return `
      <div class="footer-section footer-about">
        <h3 class="footer-title">${name}</h3>
        <p class="footer-description">${tagline}</p>
        ${this.renderSocialLinks()}
      </div>
    `;
  },

  /**
   * Genera los enlaces de redes sociales
   * @returns {string} HTML de los enlaces sociales
   */
  renderSocialLinks() {
    const links = this.config.socialLinks
      .map(
        (social) => `
      <a href="${social.url}" 
         aria-label="${social.name}" 
         target="_blank" 
         rel="noopener noreferrer"
         class="social-link">
        <i class="${social.icon}" aria-hidden="true"></i>
      </a>
    `
      )
      .join('');

    return `
      <div class="social-links" role="list" aria-label="Redes sociales">
        ${links}
      </div>
    `;
  },

  /**
   * Genera la sección de enlaces rápidos
   * @returns {string} HTML de enlaces rápidos
   */
  renderQuickLinksSection() {
    const links = this.config.quickLinks
      .map(
        (link) => `
      <li><a href="${link.path}" class="footer-link">${link.label}</a></li>
    `
      )
      .join('');

    return `
      <div class="footer-section footer-links">
        <h4 class="footer-title">Enlaces Rápidos</h4>
        <nav aria-label="Enlaces de navegación del footer">
          <ul class="footer-menu">
            ${links}
          </ul>
        </nav>
      </div>
    `;
  },

  /**
   * Genera la sección de contacto
   * @returns {string} HTML de información de contacto
   */
  renderContactSection() {
    const { address, phone, email } = this.config.businessInfo;

    return `
      <div class="footer-section footer-contact">
        <h4 class="footer-title">Contacto</h4>
        <address class="footer-address">
          <p class="contact-item">
            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
            <span>${address}</span>
          </p>
          <p class="contact-item">
            <i class="fas fa-phone" aria-hidden="true"></i>
            <a href="tel:${phone.replace(/\s/g, '')}" class="contact-link">${phone}</a>
          </p>
          <p class="contact-item">
            <i class="fas fa-envelope" aria-hidden="true"></i>
            <a href="mailto:${email}" class="contact-link">${email}</a>
          </p>
        </address>
      </div>
    `;
  },

  /**
   * Genera la sección de horarios
   * @returns {string} HTML de horarios de atención
   */
  renderHoursSection() {
    const hours = this.config.businessHours
      .map(
        (schedule) => `
      <p class="footer-hours">
        <strong>${schedule.days}:</strong> ${schedule.hours}
      </p>
    `
      )
      .join('');

    return `
      <div class="footer-section footer-hours">
        <h4 class="footer-title">Horario de Atención</h4>
        <div class="business-hours">
          ${hours}
        </div>
      </div>
    `;
  },

  /**
   * Genera el footer bottom con copyright y enlaces legales
   * @returns {string} HTML del footer bottom
   */
  renderFooterBottom() {
    const currentYear = new Date().getFullYear();
    const { name } = this.config.businessInfo;

    const legalLinks = this.config.legalLinks
      .map(
        (link) => `
      <a href="${link.path}" class="footer-bottom-link">${link.label}</a>
    `
      )
      .join('');

    return `
      <div class="footer-bottom">
        <p class="copyright">
          &copy; ${currentYear} ${name}. Todos los derechos reservados.
        </p>
        <nav class="footer-bottom-links" aria-label="Enlaces legales">
          ${legalLinks}
        </nav>
      </div>
    `;
  },

  /**
   * Genera el HTML completo del footer
   * @returns {string} HTML del footer completo
   */
  render() {
    return `
      <footer class="site-footer" role="contentinfo">
        <div class="container">
          <div class="footer-grid">
            ${this.renderAboutSection()}
            ${this.renderQuickLinksSection()}
            ${this.renderContactSection()}
            ${this.renderHoursSection()}
          </div>
          ${this.renderFooterBottom()}
        </div>
      </footer>
    `;
  },

  // ========================================
  // Lifecycle methods
  // ========================================

  /**
   * Monta el componente en el DOM
   * @param {string} elementId - ID del elemento donde montar
   */
  mount(elementId = this.config.mountPoint) {
    const element = document.getElementById(elementId);

    if (!element) {
      _logger_footer.warn(`⚠️ Footer: Mount point #${elementId} not found`);
      return;
    }

    element.innerHTML = this.render();
    this.attachEventListeners();
    _logger_footer.log('✅ Footer component mounted successfully');
  },

  /**
   * Adjunta event listeners (para futuras interacciones)
   */
  attachEventListeners() {
    // Event listeners para tracking de clicks en redes sociales
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const platform = link.getAttribute('aria-label');
        _logger_footer.log(`Social link clicked: ${platform}`);
        // Aquí se puede integrar con analytics
      });
    });

    // Event listeners para enlaces de contacto
    const contactLinks = document.querySelectorAll('.contact-link');
    contactLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const type = link.href.startsWith('tel:') ? 'phone' : 'email';
        _logger_footer.log(`Contact link clicked: ${type}`);
        // Aquí se puede integrar con analytics
      });
    });
  },

  /**
   * Inicializa el componente
   */
  init() {
    if (!this.config.enableAutoInit) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.mount());
    } else {
      this.mount();
    }
  },

  /**
   * Destruye el componente y limpia
   */
  destroy() {
    const mountPoint = document.getElementById(this.config.mountPoint);
    if (mountPoint) {
      mountPoint.innerHTML = '';
    }
  },
};

// ========================================
// Auto-inicialización
// ========================================
FooterComponent.init();

// ========================================
// Export para uso en módulos
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FooterComponent;
}

if (typeof globalThis !== 'undefined') {
  globalThis.FooterComponent = FooterComponent;
}
