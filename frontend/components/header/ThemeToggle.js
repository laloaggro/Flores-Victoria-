// ThemeToggle.js - Componente para alternar entre temas claro y oscuro

class ThemeToggle extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.updateIcon();
    
    // Escuchar cambios de tema desde otros componentes
    window.addEventListener('themechange', () => {
      this.updateIcon();
    });
  }

  render() {
    this.innerHTML = `
      <button class="theme-toggle" id="theme-toggle" aria-label="Cambiar tema" title="Cambiar tema">
        <span class="theme-icon">🌙</span>
      </button>
    `;
  }

  setupEventListeners() {
    const themeToggle = this.querySelector('#theme-toggle');
    
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        // Verificar si la función toggleTheme está disponible
        if (typeof window.toggleTheme === 'function') {
          window.toggleTheme();
        } else {
          // Fallback en caso de que la función no esté disponible
          const currentTheme = document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
          this.updateIcon();
          window.dispatchEvent(new CustomEvent('themechange', { detail: newTheme }));
        }
      });
    }
  }

  updateIcon() {
    const themeToggle = this.querySelector('#theme-toggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    
    if (themeIcon) {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
  }
}

customElements.define('theme-toggle', ThemeToggle);