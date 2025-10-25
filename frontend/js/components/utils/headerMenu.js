// headerMenu.js - Maneja la funcionalidad del menú de usuario en el header

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si el usuario está autenticado, false en caso contrario
 */
export function isAuthenticated() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch (e) {
    // Si hay un error al parsear el token, eliminarlo
    localStorage.removeItem('token');
    return false;
  }
}

/**
 * Obtiene la información del usuario desde el token
 * @returns {Object|null} Información del usuario o null si no hay token válido
 */
export function getUserInfoFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId || payload.id, // Manejar ambos posibles nombres de propiedad
      name: payload.name || payload.username || 'Usuario',
      email: payload.email || '',
      role: payload.role || 'user',
      picture: payload.picture || null
    };
  } catch (e) {
    // Si hay un error al parsear el token, eliminarlo
    console.error('Error al parsear el token:', e);
    localStorage.removeItem('token');
    return null;
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
  const authenticated = isAuthenticated();
  
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
        ${user.role === 'admin' ? `
          <div class="dropdown-divider"></div>
          <a href="/pages/admin.html" role="menuitem">
            <i class="fas fa-cog"></i>
            <span>Panel de administración</span>
          </a>
        ` : ''}
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
    userMenuToggle.innerHTML = '<span class="user-icon">👤</span>';
    userDropdown.innerHTML = `
      <a href="/pages/login.html">Iniciar sesión</a>
      <a href="/pages/register.html">Registrarse</a>
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
  // Verificar si el DOM está completamente cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateUserMenu();
      setupUserMenuEvents();
    });
  } else {
    updateUserMenu();
    setupUserMenuEvents();
  }
  
  // Escuchar cambios en el estado de autenticación
  document.addEventListener('authStatusChanged', () => {
    updateUserMenu();
  });
}

// Inicializar automáticamente cuando se carga el módulo
init();