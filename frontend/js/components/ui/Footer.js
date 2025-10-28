// Migrado de componente web personalizado a módulo ES6
/**
 * Componente web personalizado para el pie de página del sitio
 * @class Footer
 * @extends HTMLElement
 */
class Footer extends HTMLElement {
  /**
   * Se ejecuta cuando el elemento se conecta al DOM
   * Renderiza el contenido del pie de página
   */
  connectedCallback() {
    this.innerHTML = this.render();
  }

  /**
   * Renderiza el contenido completo del footer
   * @returns {string} HTML del footer
   */
  render() {
    return `
      <footer class="site-footer">
        <div class="footer-content">
          ${this.renderCompanyInfo()}
          ${this.renderQuickLinks()}
          ${this.renderInformationLinks()}
          ${this.renderContactInfo()}
        </div>
        
        ${this.renderFooterBottom()}
      </footer>
    `;
  }

  /**
   * Renderiza la sección de información de la empresa
   * @returns {string} HTML de la sección de información de la empresa
   */
  renderCompanyInfo() {
    return `
      <div class="footer-section">
        <h3>Arreglos Florales Victoria</h3>
        <p>Florería familiar en Recoleta con más de 20 años de experiencia. Flores naturales y arreglos florales para todas las ocasiones.</p>
        <div class="social-links">
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza los enlaces rápidos
   * @returns {string} HTML de los enlaces rápidos
   */
  renderQuickLinks() {
    return `
      <div class="footer-section">
        <h4>Enlaces Rápidos</h4>
        <ul class="footer-links">
          <li><a href="/index.html">Inicio</a></li>
          <li><a href="/pages/products.html">Productos</a></li>
          <li><a href="/pages/about.html">Nosotros</a></li>
          <li><a href="/pages/contact.html">Contacto</a></li>
        </ul>
      </div>
    `;
  }

  /**
   * Renderiza los enlaces de información
   * @returns {string} HTML de los enlaces de información
   */
  renderInformationLinks() {
    return `
      <div class="footer-section">
        <h4>Información</h4>
        <ul class="footer-links">
          <li><a href="/pages/privacy.html">Política de Privacidad</a></li>
          <li><a href="/pages/terms.html">Términos y Condiciones</a></li>
          <li><a href="/pages/shipping.html">Envíos y Devoluciones</a></li>
          <li><a href="/pages/faq.html">Preguntas Frecuentes</a></li>
        </ul>
      </div>
    `;
  }

  /**
   * Renderiza la información de contacto
   * @returns {string} HTML de la información de contacto
   */
  renderContactInfo() {
    return `
      <div class="footer-section">
        <h4>Contacto</h4>
        <address>
          <p><i class="fas fa-map-marker-alt"></i> Recoleta, Santiago</p>
          <p><i class="fas fa-phone"></i> +56 9 1234 5678</p>
          <p><i class="fas fa-envelope"></i> info@arreglosvictoria.cl</p>
        </address>
      </div>
    `;
  }

  /**
   * Renderiza la sección inferior del footer
   * @returns {string} HTML de la sección inferior del footer
   */
  renderFooterBottom() {
    return `
      <div class="footer-bottom">
        <p>&copy; 2025 Arreglos Florales Victoria. Todos los derechos reservados.</p>
        <div class="footer-bottom-links">
          <a href="/pages/privacy.html">Política de Privacidad</a>
          <a href="/pages/terms.html">Términos y Condiciones</a>
          <a href="/pages/shipping.html">Envíos y Devoluciones</a>
          <a href="/pages/faq.html">Preguntas Frecuentes</a>
        </div>
      </div>
    `;
  }
}

// Registramos el componente personalizado para que pueda ser usado en el HTML
if (!customElements.get('site-footer')) {
  customElements.define('site-footer', Footer);
}

export default Footer;
