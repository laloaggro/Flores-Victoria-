/**
 * 🎨 THEME TOGGLE MANAGER - FLORES VICTORIA v3.0
 * Manages dark/light mode with localStorage persistence
 */

class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme() || this.getPreferredTheme();
    this.init();
  }

  /**
   * Get stored theme from localStorage
   */
  getStoredTheme() {
    return localStorage.getItem('theme');
  }

  /**
   * Get user's preferred theme from system settings
   */
  getPreferredTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Set theme and persist to localStorage
   */
  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateToggleButton();
  }

  /**
   * Toggle between light and dark mode
   */
  toggle() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
  }

  /**
   * Update toggle button icon and text
   */
  updateToggleButton() {
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    
    if (!toggleBtn) return;

    if (this.theme === 'dark') {
      icon.textContent = '☀️';
      text.textContent = 'Modo Claro';
      toggleBtn.setAttribute('aria-label', 'Cambiar a modo claro');
    } else {
      icon.textContent = '🌙';
      text.textContent = 'Modo Oscuro';
      toggleBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
    }
  }

  /**
   * Initialize theme manager
   */
  init() {
    // Apply stored/preferred theme immediately
    this.setTheme(this.theme);

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupToggleButton());
    } else {
      this.setupToggleButton();
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.getStoredTheme()) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Setup toggle button event listener
   */
  setupToggleButton() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
      this.updateToggleButton();
    } else {
      // Create toggle button if it doesn't exist
      this.createToggleButton();
    }
  }

  /**
   * Create toggle button dynamically
   */
  createToggleButton() {
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Cambiar tema');
    
    const icon = document.createElement('span');
    icon.id = 'theme-icon';
    icon.className = 'theme-toggle-icon';
    
    const text = document.createElement('span');
    text.id = 'theme-text';
    
    button.appendChild(icon);
    button.appendChild(text);
    document.body.appendChild(button);
    
    button.addEventListener('click', () => this.toggle());
    this.updateToggleButton();
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
