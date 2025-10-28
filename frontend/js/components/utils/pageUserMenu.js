// === CHANGE TAG: v2.1.0 - Fix user menu initialization conflict ===
// Fecha: 2025-09-21
// Motivo: Corregir error de inicialización múltiple del menú de usuario
// Acción: Eliminar inicialización automática para evitar conflictos con otras inicializaciones
// === CHANGE TAG: v2.1.0 - Fix user menu initialization conflict ===
// === CHANGE TAG: v2.1.0 - Fix user menu initialization conflict ===
// Fecha: 2025-09-21
// Motivo: Corregir error de inicialización múltiple del menú de usuario
// Acción: Eliminar inicialización automática para evitar conflictos con otras inicializaciones
// === CHANGE TAG: v2.1.0 - Fix user menu initialization conflict ===
// pageUserMenu.js - Maneja la funcionalidad del menú de usuario en todas las páginas

import { getUserInfoFromToken, isAuthenticated } from './utils.js';

/**
 * Genera un color basado en el nombre del usuario para el avatar
 * @param {string} name - Nombre del usuario
 * @returns {string} Color en formato hexadecimal
 */
function generateColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convertir el hash a un color hexadecimal
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }

  return color;
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si el usuario está autenticado, false en caso contrario
 */
export function checkAuthStatus() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const isTokenValid = payload.exp > Date.now() / 1000;

    // Si el token no es válido, eliminarlo
    if (!isTokenValid) {
      localStorage.removeItem('token');
    }

    return isTokenValid;
  } catch (e) {
    // Si hay un error al parsear el token, eliminarlo
    localStorage.removeItem('token');
    return false;
  }
}

/**
 * Actualiza el menú de usuario según el estado de autenticación
 */
export function updateUserMenu() {
  const userMenuToggle = document.querySelector('.user-menu-toggle');
  const userDropdown = document.querySelector('.user-dropdown');

  if (!userMenuToggle || !userDropdown) {
    console.warn('No se encontraron elementos de menú de usuario');
    return;
  }

  // Verificar si el usuario está autenticado
  const authenticated = checkAuthStatus();

  if (authenticated) {
    // Usuario autenticado
    const user = getUserInfoFromToken();
    if (user) {
      // Actualizar el contenido del botón de menú de usuario
      userMenuToggle.innerHTML = `
        <div class="user-avatar">
          <span class="user-initials">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
        </div>
        <span class="user-name-desktop">${user.name || 'Usuario'}</span>
      `;

      // Actualizar el contenido del dropdown
      userDropdown.innerHTML = `
        <div class="user-info-dropdown">
          <div class="user-avatar-large">
            <span class="user-initials-large">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div class="user-details">
            <span class="user-name">${user.name || 'Usuario'}</span>
            <span class="user-email">${user.email || ''}</span>
          </div>
        </div>
        <div class="dropdown-divider"></div>
        <a href="/pages/profile.html" role="menuitem">
          <i class="fas fa-user-circle"></i>
          <span>Mi perfil</span>
        </a>
        <a href="/pages/orders.html" role="menuitem">
          <i class="fas fa-box"></i>
          <span>Mis pedidos</span>
        </a>
        ${
          user.role === 'admin'
            ? `
          <div class="dropdown-divider"></div>
          <a href="/pages/admin.html" role="menuitem">
            <i class="fas fa-cog"></i>
            <span>Panel de administración</span>
          </a>
        `
            : ''
        }
        <div class="dropdown-divider"></div>
        <button id="logout-btn" class="logout-btn" role="menuitem">
          <i class="fas fa-sign-out-alt"></i>
          <span>Cerrar sesión</span>
        </button>
      `;

      // Configurar el cierre de sesión
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('token');
          window.location.href = '/index.html';
        });
      }
    }
  } else {
    // Usuario no autenticado
    userMenuToggle.innerHTML = `
      <div class="user-avatar">
        <span class="user-initials">U</span>
      </div>
    `;

    userDropdown.innerHTML = `
      <a href="/pages/login.html" role="menuitem">
        <i class="fas fa-sign-in-alt"></i>
        <span>Iniciar sesión</span>
      </a>
      <a href="/pages/register.html" role="menuitem">
        <i class="fas fa-user-plus"></i>
        <span>Registrarse</span>
      </a>
    `;
  }
}

/**
 * Configura los eventos del menú de usuario
 */
export function setupUserMenuEvents() {
  const userMenuToggle = document.querySelector('.user-menu-toggle');
  const userDropdown = document.querySelector('.user-dropdown');

  if (!userMenuToggle || !userDropdown) {
    console.warn('No se encontraron elementos de menú de usuario para configurar eventos');
    return;
  }

  // Manejar clic en el botón de menú de usuario
  userMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    userDropdown.classList.toggle('show');
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove('show');
    }
  });

  // Cerrar dropdown al presionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      userDropdown.classList.remove('show');
    }
  });

  // Escuchar cambios en el estado de autenticación
  document.addEventListener('authStatusChanged', () => {
    updateUserMenu();
  });
}

/**
 * Inicializa el menú de usuario
 */
export function init() {
  // Actualizar el menú de usuario al cargar la página
  updateUserMenu();

  // Escuchar cambios en el estado de autenticación
  document.addEventListener('authStatusChanged', updateUserMenu);

  // Configurar el toggle del menú de usuario
  const userMenuToggle = document.querySelector('.user-menu-toggle');
  const userDropdown = document.querySelector('.user-dropdown');

  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

    // Cerrar el menú cuando se hace clic fuera de él
    document.addEventListener('click', (e) => {
      if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });
  }
}
