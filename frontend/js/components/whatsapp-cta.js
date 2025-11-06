/**
 * WhatsApp CTA Component - Floating WhatsApp button
 */

const WhatsAppComponent = {
  config: {
    phoneNumber: '56963603177', // Sin espacios ni caracteres especiales
    message: '¡Hola! Me gustaría información sobre sus arreglos florales 🌸',
    buttonText: '¿Necesitas ayuda?',
  },

  render() {
    const encodedMessage = encodeURIComponent(this.config.message);
    const whatsappUrl = `https://wa.me/${this.config.phoneNumber}?text=${encodedMessage}`;

    return `
    <a href="${whatsappUrl}" 
       class="whatsapp-float" 
       target="_blank" 
       rel="noopener noreferrer"
       aria-label="Contactar por WhatsApp">
        <i class="fab fa-whatsapp"></i>
        <span class="whatsapp-text">${this.config.buttonText}</span>
    </a>
    `;
  },

  mount(elementId = 'whatsapp-root') {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = this.render();
    } else {
      // Si no hay elemento específico, agregar al body
      document.body.insertAdjacentHTML('beforeend', this.render());
    }
  },

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.mount());
    } else {
      this.mount();
    }
  },
};

// Auto-inicializar
WhatsAppComponent.init();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WhatsAppComponent;
}
