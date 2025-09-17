// Componente para el selector de idioma
import i18n from '../../assets/js/i18n/index.js';

class LanguageSelector extends HTMLElement {
  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const currentLang = i18n.getCurrentLanguage();
    const supportedLanguages = i18n.getSupportedLanguages();
    
    this.innerHTML = `
      <div class="language-selector">
        <button class="language-toggle" aria-label="${i18n.t('common.language')}" aria-haspopup="true" aria-expanded="false">
          <i class="fas fa-globe"></i>
          <span class="language-text">${currentLang.toUpperCase()}</span>
        </button>
        <ul class="language-dropdown" role="menu">
          ${supportedLanguages.map(lang => `
            <li>
              <button 
                class="language-option ${lang === currentLang ? 'active' : ''}" 
                data-lang="${lang}"
                role="menuitem"
              >
                ${lang === 'es' ? 'Español' : 'English'}
              </button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    
    this.addStyles();
  }

  addStyles() {
    if (!this.querySelector('style')) {
      const style = document.createElement('style');
      style.textContent = `
        .language-selector {
          position: relative;
          display: inline-block;
        }
        
        .language-toggle {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }
        
        .language-toggle:hover {
          opacity: 0.8;
        }
        
        .language-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          list-style: none;
          padding: 0.5rem 0;
          margin: 0;
          min-width: 120px;
          z-index: 1000;
          display: none;
        }
        
        .language-dropdown.show {
          display: block;
        }
        
        .language-option {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .language-option:hover,
        .language-option.active {
          background-color: #f8f9fa;
        }
        
        .language-option.active {
          font-weight: bold;
        }
      `;
      this.appendChild(style);
    }
  }

  attachEventListeners() {
    const toggleButton = this.querySelector('.language-toggle');
    const dropdown = this.querySelector('.language-dropdown');
    const options = this.querySelectorAll('.language-option');
    
    toggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
      toggleButton.setAttribute('aria-expanded', !isExpanded);
      dropdown.classList.toggle('show');
    });
    
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.dataset.lang;
        this.changeLanguage(lang);
      });
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', () => {
      toggleButton.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('show');
    });
  }

  changeLanguage(lang) {
    if (i18n.setLanguage(lang)) {
      // Actualizar la interfaz
      this.render();
      this.attachEventListeners();
      
      // Recargar la página para aplicar los cambios
      window.location.reload();
    }
  }
}

customElements.define('language-selector', LanguageSelector);
export default LanguageSelector;