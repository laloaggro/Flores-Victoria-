/**
 * Theme Switcher - Flores Victoria
 * Permite alternar entre tema base y tema romántico
 */

(function () {
  'use strict';

  const THEME_KEY = 'flores-victoria-theme';
  const THEMES = {
    base: 'base',
    romantic: 'romantic',
  };

  // Inicializar tema
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || THEMES.base;
    applyTheme(savedTheme);
    createThemeSwitcher();
  }

  // Aplicar tema
  function applyTheme(theme) {
    if (theme === THEMES.romantic) {
      document.documentElement.setAttribute('data-theme', 'romantic');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
    updateSwitcherButton(theme);
  }

  // Cambiar tema
  function toggleTheme() {
    const currentTheme = localStorage.getItem(THEME_KEY) || THEMES.base;
    const newTheme = currentTheme === THEMES.base ? THEMES.romantic : THEMES.base;
    applyTheme(newTheme);

    // Animación de transición
    document.body.style.transition = 'all 0.5s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 500);
  }

  // Crear botón de cambio de tema
  function createThemeSwitcher() {
    const switcher = document.createElement('button');
    switcher.id = 'theme-switcher';
    switcher.className = 'theme-switcher';
    switcher.setAttribute('aria-label', 'Cambiar tema');
    switcher.innerHTML = `
      <span class="theme-icon base">🌿</span>
      <span class="theme-icon romantic">🌸</span>
    `;

    // Estilos inline para el botón
    const styles = document.createElement('style');
    styles.textContent = `
      .theme-switcher {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
        border: 3px solid rgba(255, 255, 255, 0.8);
        cursor: pointer;
        box-shadow: 
          0 4px 15px rgba(194, 24, 91, 0.4),
          0 0 0 0 rgba(194, 24, 91, 0.4);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        animation: breathe 3s ease-in-out infinite;
      }

      @keyframes breathe {
        0%, 100% {
          box-shadow: 
            0 4px 15px rgba(194, 24, 91, 0.4),
            0 0 0 0 rgba(194, 24, 91, 0.4);
        }
        50% {
          box-shadow: 
            0 4px 15px rgba(194, 24, 91, 0.4),
            0 0 0 8px rgba(194, 24, 91, 0);
        }
      }

      .theme-switcher:hover {
        transform: scale(1.15) rotate(15deg);
        box-shadow: 
          0 8px 25px rgba(194, 24, 91, 0.6),
          0 0 0 4px rgba(255, 255, 255, 0.8);
        animation: none;
      }

      .theme-switcher:active {
        transform: scale(0.9) rotate(-5deg);
      }

      .theme-icon {
        position: absolute;
        transition: all 0.3s ease;
      }

      .theme-icon.base {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      .theme-icon.romantic {
        opacity: 0;
        transform: rotate(-180deg) scale(0);
      }

      [data-theme="romantic"] .theme-icon.base {
        opacity: 0;
        transform: rotate(180deg) scale(0);
      }

      [data-theme="romantic"] .theme-icon.romantic {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      [data-theme="romantic"] .theme-switcher {
        background: linear-gradient(135deg, #E91E63 0%, #BA68C8 100%);
      }

      /* Animación de pulso */
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .theme-switcher.pulse {
        animation: pulse 0.5s ease;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .theme-switcher {
          width: 50px;
          height: 50px;
          font-size: 1.5rem;
          bottom: 15px;
          right: 15px;
        }
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(switcher);

    // Event listener
    switcher.addEventListener('click', () => {
      toggleTheme();
      switcher.classList.add('pulse');
      setTimeout(() => switcher.classList.remove('pulse'), 500);
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'theme-tooltip';
    tooltip.textContent = 'Cambiar tema';
    tooltip.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      z-index: 9998;
      white-space: nowrap;
    `;
    document.body.appendChild(tooltip);

    switcher.addEventListener('mouseenter', () => {
      tooltip.style.opacity = '1';
    });

    switcher.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  }

  // Actualizar botón según tema actual
  function updateSwitcherButton(theme) {
    const switcher = document.getElementById('theme-switcher');
    if (switcher) {
      if (theme === THEMES.romantic) {
        switcher.setAttribute('aria-label', 'Cambiar a tema base');
      } else {
        switcher.setAttribute('aria-label', 'Cambiar a tema romántico');
      }
    }
  }

  // API pública
  globalThis.FloresVictoriaTheme = {
    toggle: toggleTheme,
    set: applyTheme,
    get: () => localStorage.getItem(THEME_KEY) || THEMES.base,
    themes: THEMES,
  };

  // Inicializar al cargar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  console.log('🎨 Theme Switcher cargado');
  console.log('💡 Comandos disponibles:');
  console.log('   - FloresVictoriaTheme.toggle(): Alternar tema');
  console.log('   - FloresVictoriaTheme.set("romantic"): Establecer tema romántico');
  console.log('   - FloresVictoriaTheme.set("base"): Establecer tema base');
  console.log('   - FloresVictoriaTheme.get(): Ver tema actual');
})();
