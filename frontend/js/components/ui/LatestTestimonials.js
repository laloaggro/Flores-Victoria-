// Componente para mostrar los últimos 3 testimonios en la página principal
class LatestTestimonials extends HTMLElement {
  constructor() {
    super();
    // Inicialización básica
  }

  /**
   * Se ejecuta cuando el elemento se conecta al DOM
   * Renderiza el contenido de los últimos testimonios
   */
  connectedCallback() {
    this.innerHTML = `
      <section class="testimonials latest-testimonials">
        <div class="container">
          <div class="section-header">
            <h2>Últimos Testimonios</h2>
            <p>Lo que dicen nuestros clientes</p>
          </div>
          
          <div class="testimonials-grid">
            <div class="testimonial-card">
              <div class="testimonial-header">
                <img src="/assets/images/testimonials/maria-gonzalez.jpg" alt="María González" class="testimonial-avatar" width="60" height="60">
                <div class="testimonial-info">
                  <h4>María González</h4>
                  <p>Cliente satisfecha</p>
                </div>
              </div>
              <div class="testimonial-content">
                <p>"Los arreglos florales de Victoria son simplemente espectaculares. Cada vez que he pedido, la calidad y el diseño superan mis expectativas."</p>
              </div>
              <div class="testimonial-rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-header">
                <img src="/assets/images/testimonials/carlos-elena.jpg" alt="Carlos y Elena" class="testimonial-avatar" width="60" height="60">
                <div class="testimonial-info">
                  <h4>Carlos y Elena</h4>
                  <p>Clientes para eventos especiales</p>
                </div>
              </div>
              <div class="testimonial-content">
                <p>"Para nuestro aniversario de bodas, Victoria creó un arreglo único que capturó perfectamente nuestra historia de amor. ¡Altamente recomendados!"</p>
              </div>
              <div class="testimonial-rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-header">
                <img src="/assets/images/testimonials/ana-flores.jpg" alt="Ana Flores" class="testimonial-avatar" width="60" height="60">
                <div class="testimonial-info">
                  <h4>Ana Flores</h4>
                  <p>Florista profesional</p>
                </div>
              </div>
              <div class="testimonial-content">
                <p>"Como florista profesional, reconozco la excelencia en el trabajo de mis colegas. Victoria demuestra un nivel artístico excepcional en cada arreglo."</p>
              </div>
              <div class="testimonial-rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
              </div>
            </div>
          </div>
          
          <div class="text-center" style="margin-top: 2rem;">
            <a href="/pages/testimonials.html" class="btn btn-primary">Ver todos los testimonios</a>
          </div>
        </div>
      </section>
    `;
  }
}

// Registrar el componente si no existe
if (!customElements.get('latest-testimonials')) {
  customElements.define('latest-testimonials', LatestTestimonials);
}
