/**
 * Funciones de accesibilidad para el sitio web
 */

/**
 * Inicializa las funciones de accesibilidad
 */
export function initAccessibility() {
  // Saltar al contenido principal
  createSkipLink();

  // Manejar el enfoque para navegación por teclado
  handleKeyboardFocus();

  // Ajustar el tamaño de fuente según las preferencias del usuario
  adjustFontSize();

  console.log('Accesibilidad inicializada');
}

/**
 * Crea un enlace para saltar al contenido principal
 */
function createSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Saltar al contenido principal';
  skipLink.className = 'skip-link';

  // Agregar estilos básicos
  const style = document.createElement('style');
  style.textContent = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      transition: top 0.3s;
    }
    
    .skip-link:focus {
      top: 0;
    }
  `;

  document.head.appendChild(style);
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Maneja el enfoque para navegación por teclado
 */
function handleKeyboardFocus() {
  // Agregar clase para indicar cuando el usuario está usando teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });

  // Remover la clase cuando el usuario usa el mouse
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('user-is-tabbing');
  });
}

/**
 * Ajusta el tamaño de fuente según las preferencias del usuario
 */
function adjustFontSize() {
  // Verificar preferencias del sistema
  const prefersLargeFonts = window.matchMedia('(min-resolution: 2dppx)');

  if (prefersLargeFonts.matches) {
    document.body.classList.add('large-fonts');
  }

  // Escuchar cambios en las preferencias
  prefersLargeFonts.addEventListener('change', (e) => {
    if (e.matches) {
      document.body.classList.add('large-fonts');
    } else {
      document.body.classList.remove('large-fonts');
    }
  });
}
