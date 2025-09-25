// userMenu.js - Maneja la funcionalidad del menú de usuario

import { getUserInfoFromToken, isAuthenticated } from '/js/components/utils/utils.js';

/**
 * Clase para manejar la funcionalidad del menú de usuario
 */
class UserMenu {
  /**
     * Inicializa el menú de usuario
     */
  static init() {
    // Verificar si el DOM está completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupUserMenu());
    } else {
      this.setupUserMenu();
    }
    
    // Escuchar cambios en el estado de autenticación
    document.addEventListener('authStatusChanged', () => {
      this.setupUserMenu();
    });
  }
    
  /**
     * Configura el menú de usuario
     */
  static setupUserMenu() {
    // Verificar si el usuario está autenticado
    const isAuthenticatedUser = isAuthenticated();
        
    if (isAuthenticatedUser) {
      this.showUserMenu();
    } else {
      this.showLoginLink();
    }
    
    // Configurar dropdown
    this.setupDropdown();
  }
    
  /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} True si el usuario está autenticado, false en caso contrario
     */
  static checkAuthStatus() {
    return isAuthenticated();
  }
    
  /**
     * Muestra el menú de usuario con la información del usuario
     */
  static showUserMenu() {
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
        
    if (userMenuToggle && userDropdown) {
      // Obtener información del usuario del token
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
        
        // Configurar el cierre de sesión después de actualizar el contenido
        this.setupLogout();
      }
    }
  }
    
  /**
     * Muestra el enlace de inicio de sesión
     */
  static showLoginLink() {
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
        
    if (userMenuToggle && userDropdown) {
      userMenuToggle.innerHTML = '<span class="user-icon">👤</span>';
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
     * Configura el dropdown del menú de usuario
     */
  static setupDropdown() {
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
        
    if (userMenuToggle && userDropdown) {
      // Remover cualquier listener previo para evitar duplicados
      const clone = userMenuToggle.cloneNode(true);
      userMenuToggle.parentNode.replaceChild(clone, userMenuToggle);
      
      // Asegurarse de que el dropdown esté oculto inicialmente
      userDropdown.classList.remove('show');
            
      // Manejar clic en el botón de menú de usuario
      clone.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
                
        // Alternar visibilidad del dropdown
        userDropdown.classList.toggle('show');
      });
            
      // Cerrar dropdown al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!clone.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('show');
        }
      });
            
      // Cerrar dropdown al presionar Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          userDropdown.classList.remove('show');
        }
      });
    }
  }
    
  /**
     * Configura el cierre de sesión
     */
  static setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      // Remover cualquier listener previo para evitar duplicados
      const clone = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(clone, logoutBtn);
      
      clone.addEventListener('click', (e) => {
        e.preventDefault();
                
        // Eliminar token del localStorage
        localStorage.removeItem('token');
                
        // Disparar evento de cambio de estado de autenticación
        const event = new Event('authStatusChanged');
        document.dispatchEvent(event);
                
        // Redirigir a la página principal
        window.location.href = '/index.html';
      });
    }
  }
}

export default UserMenu;