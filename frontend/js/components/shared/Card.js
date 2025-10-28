// Componente de tarjeta compartido
class SharedCard extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const elevation = this.getAttribute('elevation') || '1';

    this.innerHTML = `
      <div class="shared-card shared-card--elevation-${elevation}">
        <slot></slot>
      </div>
    `;

    this.addStyles();
  }

  addStyles() {
    if (!this.querySelector('style')) {
      const style = document.createElement('style');
      style.textContent = `
        .shared-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .shared-card:hover {
          transform: translateY(-2px);
        }
        
        /* Elevaciones */
        .shared-card--elevation-1 {
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }
        
        .shared-card--elevation-1:hover {
          box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        }
        
        .shared-card--elevation-2 {
          box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        }
        
        .shared-card--elevation-2:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
        }
        
        .shared-card--elevation-3 {
          box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
        }
        
        .shared-card--elevation-3:hover {
          box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
        }
      `;
      this.appendChild(style);
    }
  }
}

customElements.define('shared-card', SharedCard);
export default SharedCard;
