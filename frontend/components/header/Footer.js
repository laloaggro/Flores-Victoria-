class Footer extends HTMLElement {
  connectedCallback() {
    // Verificar si Font Awesome ya está cargado
    const isFontAwesomeLoaded =
      document.querySelector('link[href*="font-awesome"]') ||
      document.querySelector('link[href*="fontawesome"]') ||
      document.querySelector('link[href*="cdnjs.cloudflare.com/ajax/libs/font-awesome"]');

    // Si Font Awesome no está cargado, cargarlo
    if (!isFontAwesomeLoaded) {
      const fontAwesomeLink = document.createElement('link');
      fontAwesomeLink.rel = 'stylesheet';
      fontAwesomeLink.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      fontAwesomeLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontAwesomeLink);
    }

    this.innerHTML = `
      <footer class="site-footer" role="contentinfo">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3>Arreglos Florales Victoria</h3>
              <p>Creando hermosos momentos desde 2010 en el corazón de Recoleta.</p>
              <div class="social-links">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i class="fab fa-facebook-f" aria-hidden="true"></i>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i class="fab fa-instagram" aria-hidden="true"></i>
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <i class="fab fa-twitter" aria-hidden="true"></i>
                </a>
                <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                  <i class="fab fa-pinterest" aria-hidden="true"></i>
                </a>
              </div>
            </div>
            
            <div class="footer-section">
              <h4>Enlaces Rápidos</h4>
              <div class="footer-contact">
                <p><a href="/"><i class="fas fa-home" aria-hidden="true"></i> Inicio</a></p>
                <p><a href="/pages/products.html"><i class="fas fa-shopping-bag" aria-hidden="true"></i> Productos</a></p>
                <p><a href="/pages/about.html"><i class="fas fa-info-circle" aria-hidden="true"></i> Nosotros</a></p>
                <p><a href="/pages/contact.html"><i class="fas fa-envelope" aria-hidden="true"></i> Contacto</a></p>
              </div>
            </div>
            
            <div class="footer-section">
              <h4>Legal</h4>
              <div class="footer-contact">
                <p><a href="/pages/privacy.html"><i class="fas fa-user-secret" aria-hidden="true"></i> Privacidad</a></p>
                <p><a href="/pages/terms.html"><i class="fas fa-file-contract" aria-hidden="true"></i> Términos</a></p>
                <p><a href="/pages/shipping.html"><i class="fas fa-truck" aria-hidden="true"></i> Envíos</a></p>
                <p><a href="/pages/faq.html"><i class="fas fa-question-circle" aria-hidden="true"></i> FAQ</a></p>
              </div>
            </div>
            
            <div class="footer-section">
              <h4>Contacto</h4>
              <address class="footer-contact">
                <p><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Av. Recoleta 1234, Recoleta, Santiago</p>
                <p><i class="fas fa-phone" aria-hidden="true"></i> +56 9 1234 5678</p>
                <p><i class="fas fa-envelope" aria-hidden="true"></i> contacto@arreglosvictoria.cl</p>
              </address>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>&copy; 2025 Arreglos Florales Victoria. Todos los derechos reservados.</p>
            <div class="footer-bottom-links">
              <a href="/pages/sitemap.html">Mapa del Sitio</a>
            </div>
            <p>Diseñado con <i class="fas fa-heart" aria-label="amor"></i> en Santiago, Chile</p>
          </div>
        </div>
      </footer>
    `;
  }
}

// Registramos el componente personalizado para que pueda ser usado en el HTML
customElements.define('site-footer', Footer);

export default Footer;
