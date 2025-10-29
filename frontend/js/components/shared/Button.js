// Componente de botón compartido
class SharedButton extends HTMLElement {
  constructor() {
    super();
    this._disabled = false;
  }

  static get observedAttributes() {
    return ['disabled', 'variant', 'size'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.updateStyles();
    }
  }

  connectedCallback() {
    this.render();
    this.updateStyles();
  }

  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || 'medium';
    const disabled = this.hasAttribute('disabled');

    this.innerHTML = `
      <button 
        class="shared-button shared-button--${variant} shared-button--${size}"
        ${disabled ? 'disabled' : ''}
      >
        <slot></slot>
      </button>
    `;
  }

  updateStyles() {
    if (!this.querySelector('style')) {
      const style = document.createElement('style');
      style.textContent = `
        .shared-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 4px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
        }
        
        .shared-button:focus {
          outline: 2px solid #e91e63;
          outline-offset: 2px;
        }
        
        .shared-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Variantes */
        .shared-button--primary {
          background-color: #e91e63;
          color: white;
        }
        
        .shared-button--primary:hover:not(:disabled) {
          background-color: #c2185b;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(233, 30, 99, 0.2);
        }
        
        .shared-button--secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .shared-button--secondary:hover:not(:disabled) {
          background-color: #5a6268;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(108, 117, 125, 0.2);
        }
        
        .shared-button--outline {
          background-color: transparent;
          color: #e91e63;
          border: 2px solid #e91e63;
        }
        
        .shared-button--outline:hover:not(:disabled) {
          background-color: #e91e63;
          color: white;
          transform: translateY(-2px);
        }
        
        /* Tamaños */
        .shared-button--small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
        
        .shared-button--medium {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        }
        
        .shared-button--large {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }
      `;
      this.appendChild(style);
    }
  }
}

customElements.define('shared-button', SharedButton);
export default SharedButton;
