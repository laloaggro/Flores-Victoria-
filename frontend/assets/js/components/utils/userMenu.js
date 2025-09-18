// userMenu.js - Maneja la funcionalidad del menú de usuario

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
  }
    
  /**
     * Configura el menú de usuario
     */
  static setupUserMenu() {
    // Verificar si el usuario está autenticado
    const isAuthenticated = this.checkAuthStatus();
        
    if (isAuthenticated) {
      this.showUserMenu();
      this.setupDropdown();
      this.setupLogout();
    } else {
      this.showLoginLink();
      this.setupDropdown(); // Configurar dropdown incluso para usuarios no autenticados
    }
  }
    
  /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} True si el usuario está autenticado, false en caso contrario
     */
  static checkAuthStatus() {
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
     * Muestra el menú de usuario con la información del usuario
     */
  static showUserMenu() {
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
        
    if (userMenuToggle && userDropdown) {
      // Obtener información del usuario del token
      const user = this.getUserInfo();
            
      if (user) {
        // Actualizar el contenido del botón de menú de usuario
        userMenuToggle.innerHTML = `
          <span class="user-icon">
            ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </span>
        `;
            
        // Actualizar el contenido del dropdown
        userDropdown.innerHTML = `
          <div class="user-info">
            <span class="user-name">${user.name || 'Usuario'}</span>
            <span class="user-email">${user.email || ''}</span>
          </div>
          <a href="/pages/profile.html" role="menuitem">Mi perfil</a>
          <a href="/pages/orders.html" role="menuitem">Mis pedidos</a>
          ${user.role === 'admin' ? '<a href="/admin-panel/" role="menuitem">Administración</a>' : ''}
          <a href="#" class="logout-link" role="menuitem">Cerrar sesión</a>
        `;
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
      // Restaurar el contenido original del botón de menú de usuario
      userMenuToggle.innerHTML = '<span class="user-icon">👤</span>';
            
      // Restaurar el contenido original del dropdown
      userDropdown.innerHTML = `
        <a href="/pages/login.html" role="menuitem">Iniciar sesión</a>
        <a href="/pages/register.html" role="menuitem">Registrarse</a>
      `;
    }
  }
    
  /**
     * Obtiene la información del usuario desde el token
     * @returns {Object|null} Información del usuario o null si no hay token válido
     */
  static getUserInfo() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
            
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id || payload.userId,
        name: payload.name || payload.username || 'Usuario',
        email: payload.email || '',
        role: payload.role || 'user'
      };
    } catch (e) {
      console.error('Error al obtener información del usuario:', e);
      return null;
    }
  }
    
  /**
     * Configura el dropdown del menú de usuario
     */
  static setupDropdown() {
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
        
    if (userMenuToggle && userDropdown) {
      // Toggle dropdown al hacer clic en el botón
      userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
      });
            
      // Cerrar dropdown al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      });
    }
  }
    
  /**
     * Configura el cierre de sesión
     */
  static setupLogout() {
    // Este método se llama después de mostrar el menú de usuario
    // La funcionalidad de cierre de sesión se maneja en los archivos HTML individuales
    // para permitir acciones específicas según la página
  }
    
  /**
     * Cierra la sesión del usuario
     */
  static logout() {
    // Eliminar token del localStorage
    localStorage.removeItem('token');
        
    // Mostrar enlaces de inicio de sesión
    this.showLoginLink();
        
    // Redirigir a la página principal
    window.location.href = '/index.html';
  }
}

// Exportar la clase
export default UserMenu;
