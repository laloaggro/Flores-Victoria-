/**
 * Footer Component - Unified footer for all pages
 * Usage: Include this script in your HTML and add <div id="footer-root"></div>
 */

const FooterComponent = {
  render() {
    return `
    <footer class="site-footer" role="contentinfo">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-section">
                    <h3>Arreglos Florales Victoria</h3>
                    <p>Tu destino para los arreglos florales más hermosos y frescos de la ciudad.</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/profile.php?id=61578999845743" aria-label="Facebook" target="_blank" rel="noopener"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/arreglosvictoria/" aria-label="Instagram" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>
                        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest"></i></a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Enlaces Rápidos</h4>
                    <ul>
                        <li><a href="/index.html">Inicio</a></li>
                        <li><a href="/pages/products.html">Productos</a></li>
                        <li><a href="/pages/gallery.html">Galería</a></li>
                        <li><a href="/pages/about.html">Nosotros</a></li>
                        <li><a href="/pages/blog.html">Blog</a></li>
                        <li><a href="/pages/contact.html">Contacto</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Contacto</h4>
                    <address>
                        <p><i class="fas fa-map-marker-alt"></i> Pajonales #6723, Huechuraba, Santiago</p>
                        <p><i class="fas fa-phone"></i> +56 9 6360 3177</p>
                        <p><i class="fas fa-envelope"></i> arreglosvictoriafloreria@gmail.com</p>
                    </address>
                </div>
                
                <div class="footer-section">
                    <h4>Horario de Atención</h4>
                    <p class="footer-hours">Lunes a Viernes: 9:00 - 19:00</p>
                    <p class="footer-hours">Sábado: 9:00 - 18:00</p>
                    <p class="footer-hours">Domingo: 10:00 - 15:00</p>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Arreglos Florales Victoria. Todos los derechos reservados.</p>
                <div class="footer-bottom-links">
                    <a href="/pages/privacy.html">Política de Privacidad</a>
                    <a href="/pages/terms.html">Términos y Condiciones</a>
                    <a href="/pages/faq.html">Preguntas Frecuentes</a>
                    <a href="/pages/testimonials.html">Testimonios</a>
                    <a href="/pages/sitemap.html">Mapa del Sitio</a>
                </div>
            </div>
        </div>
    </footer>
    `;
  },

  mount(elementId = 'footer-root') {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = this.render();
      console.log('Footer mounted successfully');
    } else {
      console.warn(`Footer mount point #${elementId} not found`);
    }
  },
};

// Auto-mount on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    FooterComponent.mount();
  });
} else {
  FooterComponent.mount();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FooterComponent;
}
