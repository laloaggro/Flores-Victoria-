// accessibility.js - Utilidades para mejorar la accesibilidad

/**
 * Inicializa las mejoras de accesibilidad para el sitio
 */
export function initializeAccessibility() {
  console.log('🔧 Inicializando mejoras de accesibilidad');
    
  // Añadir atributos ARIA a elementos interactivos
  addAriaAttributes();
    
  // Configurar navegación por teclado
  setupKeyboardNavigation();
    
  // Configurar soporte para lectores de pantalla
  setupScreenReaderSupport();
    
  console.log('✅ Mejoras de accesibilidad inicializadas');
}

/**
 * Añade atributos ARIA a elementos interactivos
 */
function addAriaAttributes() {
  // Añadir roles y atributos ARIA a elementos de navegación
  const navElements = document.querySelectorAll('nav, .nav, .navigation');
  navElements.forEach(nav => {
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Navegación principal');
  });
    
  // Añadir atributos ARIA a formularios
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    if (!form.getAttribute('aria-label') && !form.getAttribute('aria-labelledby')) {
      form.setAttribute('aria-label', 'Formulario');
    }
  });
    
  // Añadir atributos ARIA a botones
  const buttons = document.querySelectorAll('button, [role="button"]');
  buttons.forEach(button => {
    if (!button.getAttribute('aria-label') && button.textContent.trim() === '') {
      // Si el botón no tiene texto visible, añadir aria-label
      const ariaLabel = getAriaLabelForButton(button);
      if (ariaLabel) {
        button.setAttribute('aria-label', ariaLabel);
      }
    }
  });
    
  // Añadir atributos ARIA a enlaces
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    if (!link.getAttribute('aria-label') && link.textContent.trim() === '') {
      // Si el enlace no tiene texto visible, añadir aria-label
      if (link.querySelector('img')) {
        const altText = link.querySelector('img').getAttribute('alt');
        if (altText) {
          link.setAttribute('aria-label', altText);
        }
      }
    }
  });
}

/**
 * Genera un aria-label apropiado para un botón basado en su contenido
 * @param {HTMLElement} button - El botón
 * @returns {string|null} - El aria-label o null si no se puede determinar
 */
function getAriaLabelForButton(button) {
  // Buscar iconos comunes y asignar etiquetas apropiadas
  if (button.querySelector('.fa-search')) return 'Buscar';
  if (button.querySelector('.fa-shopping-cart')) return 'Carrito de compras';
  if (button.querySelector('.fa-user')) return 'Usuario';
  if (button.querySelector('.fa-heart')) return 'Lista de deseos';
  if (button.querySelector('.fa-times')) return 'Cerrar';
  if (button.querySelector('.fa-bars')) return 'Menú';
    
  return null;
}

/**
 * Configura la navegación por teclado
 */
function setupKeyboardNavigation() {
  // Añadir funcionalidad de salto a contenido principal
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Saltar al contenido principal';
  skipLink.classList.add('skip-link');
  document.body.insertBefore(skipLink, document.body.firstChild);
    
  // Asegurar que los elementos interactivos puedan recibir foco
  const interactiveElements = document.querySelectorAll('div, span, li');
  interactiveElements.forEach(el => {
    if (el.onclick || el.hasAttribute('data-action')) {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
            
      // Añadir indicador visual de foco si no existe
      if (!el.classList.contains('focusable')) {
        el.classList.add('focusable');
      }
    }
  });
    
  // Manejar eventos de teclado para componentes personalizados
  document.addEventListener('keydown', handleKeyboardEvents);
}

/**
 * Maneja eventos de teclado para navegación y accesibilidad
 * @param {KeyboardEvent} e - El evento de teclado
 */
function handleKeyboardEvents(e) {
  // Manejar Escape para cerrar modales, menús, etc.
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal.active, .mobile-menu-overlay.active');
    openModals.forEach(modal => {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open', 'mobile-menu-open');
    });
  }
    
  // Manejar Enter y Space para activar elementos enfocados
  if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute('tabindex')) {
    e.target.click();
  }
}

/**
 * Configura el soporte para lectores de pantalla
 */
function setupScreenReaderSupport() {
  // Añadir landmark roles
  const mainContent = document.querySelector('main, .main, #main');
  if (mainContent) {
    mainContent.setAttribute('role', 'main');
    mainContent.setAttribute('id', 'main-content');
  }
    
  const header = document.querySelector('header, .header');
  if (header) {
    header.setAttribute('role', 'banner');
  }
    
  const footer = document.querySelector('footer, .footer');
  if (footer) {
    footer.setAttribute('role', 'contentinfo');
  }
    
  // Añadir regiones para contenido importante
  const articles = document.querySelectorAll('article');
  articles.forEach(article => {
    article.setAttribute('role', 'article');
  });
    
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    if (!section.getAttribute('aria-label') && !section.getAttribute('aria-labelledby')) {
      section.setAttribute('role', 'region');
    }
  });
}

/**
 * Anuncia un mensaje para lectores de pantalla
 * @param {string} message - El mensaje a anunciar
 * @param {string} type - Tipo de mensaje (polite, assertive)
 */
export function announceToScreenReader(message, type = 'polite') {
  // Crear un elemento de anuncio si no existe
  let announcer = document.getElementById('screen-reader-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.setAttribute('id', 'screen-reader-announcer');
    announcer.setAttribute('aria-live', type);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }
    
  // Anunciar el mensaje
  announcer.textContent = message;
}

/**
 * Establece el contraste de colores para usuarios con discapacidad visual
 * @param {string} level - Nivel de contraste (normal, alto, muy-alto)
 */
export function setContrastLevel(level) {
  document.body.classList.remove('contrast-normal', 'contrast-high', 'contrast-very-high');
  document.body.classList.add(`contrast-${level}`);
    
  // Guardar preferencia en localStorage
  localStorage.setItem('contrastLevel', level);
    
  // Anunciar cambio a lectores de pantalla
  announceToScreenReader(`Nivel de contraste establecido a ${level.replace('-', ' ')}`);
}

// Inicializar accesibilidad cuando el DOM esté cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAccessibility);
} else {
  initializeAccessibility();
}