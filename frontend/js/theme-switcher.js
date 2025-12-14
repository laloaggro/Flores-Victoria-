/**
 * Theme Switcher - Flores Victoria
 * Permite alternar entre tema base y tema romántico
 */

(function () {
  'use strict';

  const THEME_KEY = 'flores-victoria-theme';
  const THEMES = {
    base: { id: 'base', name: 'Clásico', icon: '🌿', description: 'Tema original limpio' },
    roses: { id: 'roses', name: 'Jardín de Rosas', icon: '🌹', description: 'Pasión y romance' },
    sunflower: {
      id: 'sunflower',
      name: 'Campo de Girasoles',
      icon: '🌻',
      description: 'Alegría y energía',
    },
    lavender: {
      id: 'lavender',
      name: 'Campos de Lavanda',
      icon: '💜',
      description: 'Serenidad y calma',
    },
    cherry: { id: 'cherry', name: 'Cerezo en Flor', icon: '🌸', description: 'Elegancia japonesa' },
    wedding: {
      id: 'wedding',
      name: 'Boda de Ensueño',
      icon: '💐',
      description: 'Celebración especial',
    },
    spring: {
      id: 'spring',
      name: 'Primavera Fresca',
      icon: '🌷',
      description: 'Renovación y vida',
    },
  };

  // Inicializar tema
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || THEMES.base;
    applyTheme(savedTheme);
    createThemeSwitcher();
  }

  // Aplicar tema
  function applyTheme(themeId) {
    const theme = Object.values(THEMES).find((t) => t.id === themeId) || THEMES.base;

    if (theme.id === 'base') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme.id);
    }

    localStorage.setItem(THEME_KEY, theme.id);
    updateSwitcherButton(theme);

    // Animación de transición
    document.body.style.transition = 'all 0.5s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 500);
  }

  // Cambiar tema (ciclo entre todos)
  function toggleTheme() {
    const currentTheme = localStorage.getItem(THEME_KEY) || 'base';
    const themeIds = Object.keys(THEMES);
    const currentIndex = themeIds.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeIds.length;
    const nextTheme = themeIds[nextIndex];

    applyTheme(nextTheme);
    showThemeNotification(THEMES[nextTheme]);
  }

  // Mostrar notificación del tema
  function showThemeNotification(theme) {
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.innerHTML = `
      <span class="theme-notification-icon">${theme.icon}</span>
      <div class="theme-notification-text">
        <strong>${theme.name}</strong>
        <small>${theme.description}</small>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 10000;
      animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      .theme-notification-icon {
        font-size: 2rem;
      }
      .theme-notification-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .theme-notification-text strong {
        font-size: 1rem;
      }
      .theme-notification-text small {
        font-size: 0.875rem;
        opacity: 0.8;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }

  // Crear botón de cambio de tema
  function createThemeSwitcher() {
    const switcher = document.createElement('button');
    switcher.id = 'theme-switcher';
    switcher.className = 'theme-switcher';
    switcher.setAttribute('aria-label', 'Cambiar tema');

    const currentTheme = localStorage.getItem(THEME_KEY) || 'base';
    const theme = THEMES[currentTheme];
    switcher.innerHTML = `<span class="theme-icon-current">${theme.icon}</span>`;

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

      .theme-icon-current {
        transition: all 0.3s ease;
        display: inline-block;
      }

      [data-theme="romantic"] .theme-switcher {
        background: linear-gradient(135deg, #E91E63 0%, #BA68C8 100%);
      }
      
      [data-theme="elegant"] .theme-switcher {
        background: linear-gradient(135deg, #9C27B0 0%, #FFB300 100%);
      }
      
      [data-theme="tropical"] .theme-switcher {
        background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
      }
      
      [data-theme="minimalist"] .theme-switcher {
        background: linear-gradient(135deg, #000000 0%, #FF4757 100%);
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
      const iconElement = switcher.querySelector('.theme-icon-current');
      if (iconElement) {
        iconElement.textContent = theme.icon;
      }
      switcher.setAttribute('aria-label', `Cambiar tema (actual: ${theme.name})`);
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

  // Logs solo en desarrollo
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    
    
  }
})();
