// Migrado de componente web personalizado a módulo ES6
/**
 * Componente para la sección de testimonios
 * Muestra una cuadrícula con testimonios de clientes
 *
 * Puede usarse como elemento personalizado <testimonials-component></testimonials-component>
 */
class Testimonials extends HTMLElement {
  constructor() {
    super();
    // Inicialización básica
  }

  /**
   * Método llamado cuando el elemento es conectado al DOM
   * Renderiza el contenido del testimonio
   */
  connectedCallback() {
    this.innerHTML = `
      <section class="testimonials">
        <div class="container">
          <div class="section-header">
            <h2>Lo que dicen nuestros clientes</h2>
            <p>Testimonios de quienes han disfrutado de nuestros arreglos florales</p>
          </div>
          
          <div class="testimonials-grid">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"Los arreglos florales de Victoria son simplemente espectaculares. Cada vez que he pedido, la calidad y el diseño superan mis expectativas."</p>
              </div>
              <div class="testimonial-author">
                <img src="assets/images/testimonial1.jpg" alt="María González" width="60" height="60">
                <div>
                  <h4>María González</h4>
                  <p>Cliente satisfecha</p>
                </div>
              </div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"Para nuestro aniversario de bodas, Victoria creó un arreglo único que capturó perfectamente nuestra historia de amor. ¡Altamente recomendados!"</p>
              </div>
              <div class="testimonial-author">
                <img src="assets/images/testimonial2.jpg" alt="Carlos y Elena" width="60" height="60">
                <div>
                  <h4>Carlos y Elena</h4>
                  <p>Clientes para eventos especiales</p>
                </div>
              </div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"Como florista profesional, reconozco la excelencia en el trabajo de mis colegas. Victoria demuestra un nivel artístico excepcional en cada arreglo."</p>
              </div>
              <div class="testimonial-author">
                <img src="assets/images/testimonial3.jpg" alt="Pedro Ramírez" width="60" height="60">
                <div>
                  <h4>Pedro Ramírez</h4>
                  <p>Florista asociado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Función para mostrar el modal de agregar testimonio
   * El modal permite a los usuarios autenticados crear nuevos testimonios
   */
  showTestimonialModal() {
    // Crear modal para agregar testimonio
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'testimonialModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'testimonialModalTitle');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="testimonialModalTitle">Agregar Testimonio</h3>
          <button class="close" aria-label="Cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <form id="testimonialForm">
            <div class="form-group">
              <label for="testimonialProduct">Producto adquirido:</label>
              <select id="testimonialProduct" class="form-input" required aria-required="true">
                <option value="">Selecciona un producto</option>
                <!-- Las opciones se cargarán dinámicamente -->
              </select>
            </div>
            <div class="form-group">
              <label for="testimonialRating">Calificación:</label>
              <div class="rating-input" role="radiogroup" aria-required="true">
                <input type="radio" id="star5" name="rating" value="5" required>
                <label for="star5" aria-label="5 estrellas"><i class="fas fa-star" aria-hidden="true"></i></label>
                <input type="radio" id="star4" name="rating" value="4">
                <label for="star4" aria-label="4 estrellas"><i class="fas fa-star" aria-hidden="true"></i></label>
                <input type="radio" id="star3" name="rating" value="3">
                <label for="star3" aria-label="3 estrellas"><i class="fas fa-star" aria-hidden="true"></i></label>
                <input type="radio" id="star2" name="rating" value="2">
                <label for="star2" aria-label="2 estrellas"><i class="fas fa-star" aria-hidden="true"></i></label>
                <input type="radio" id="star1" name="rating" value="1">
                <label for="star1" aria-label="1 estrella"><i class="fas fa-star" aria-hidden="true"></i></label>
              </div>
            </div>
            <div class="form-group">
              <label for="testimonialText">Tu testimonio:</label>
              <textarea id="testimonialText" class="form-input" rows="4" placeholder="Comparte tu experiencia con el producto..." required aria-required="true"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Enviar Testimonio</button>
          </form>
        </div>
      </div>
    `;

    // Añadir modal al documento
    document.body.appendChild(modal);

    // Configurar eventos del modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    // Añadir atributos de accesibilidad al botón de cierre
    closeBtn.setAttribute('aria-label', 'Cerrar modal');

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });

    // Manejar la tecla Escape para cerrar el modal
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.parentNode) {
        modal.remove();
      }
    });

    // Configurar envío del formulario
    const form = modal.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitTestimonial();
    });

    // Mostrar modal
    modal.style.display = 'block';

    // Cargar productos en el select
    this.loadUserProducts();

    // Enfocar el primer campo del formulario
    const firstInput = modal.querySelector('select, textarea, input');
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Cargar productos del usuario
   * Obtiene los productos que el usuario ha comprado para mostrarlos en el formulario de testimonios
   * En una implementación real, esto haría una llamada a la API
   */
  async loadUserProducts() {
    try {
      // En una implementación real, esto haría una llamada a la API para obtener
      // los productos que el usuario ha comprado
      // Por ahora, usaremos datos de ejemplo

      const products = [
        { id: 1, name: 'Ramo de Rosas Rojas' },
        { id: 2, name: 'Arreglo Especial Cumpleaños' },
        { id: 3, name: 'Arreglo Decorativo Premium' },
        { id: 4, name: 'Caja Sorpresa de Flores' },
        { id: 5, name: 'Centro de Mesa Elegante' },
      ];

      const select = document.getElementById('testimonialProduct');
      if (select) {
        products.forEach((product) => {
          const option = document.createElement('option');
          option.value = product.id;
          option.textContent = product.name;
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

  /**
   * Enviar testimonio
   * Procesa el formulario de testimonio y envía los datos a la API
   */
  async submitTestimonial() {
    try {
      const form = document.getElementById('testimonialForm');
      const formData = new FormData(form);

      const testimonialData = {
        product_id: formData.get('testimonialProduct'),
        rating: formData.get('rating'),
        text: formData.get('testimonialText'),
      };

      // Validar campos requeridos
      if (!testimonialData.product_id || !testimonialData.rating || !testimonialData.text) {
        alert('Por favor complete todos los campos');
        return;
      }

      // En una implementación real, esto haría una llamada a la API para guardar el testimonio
      // await fetch('/api/testimonials', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(testimonialData)
      // });

      // Cerrar modal
      const modal = document.getElementById('testimonialModal');
      if (modal) {
        modal.remove();
      }

      // Mostrar mensaje de éxito
      alert('¡Gracias por tu testimonio! Será revisado y publicado pronto.');
    } catch (error) {
      console.error('Error al enviar testimonio:', error);
      alert('Error al enviar testimonio. Por favor, inténtalo de nuevo.');
    }
  }
}

// Registrar el elemento personalizado si no existe
if (!customElements.get('testimonials-component')) {
  customElements.define('testimonials-component', Testimonials);
}

export default Testimonials;
