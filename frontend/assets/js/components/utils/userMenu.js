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
    }
  }
    
  /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} - Verdadero si el usuario está autenticado
     */
  static checkAuthStatus() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
            
      // Verificar si el token es válido
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
            
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error al verificar el estado de autenticación:', error);
      return false;
    }
  }
    
  /**
     * Muestra el menú de usuario
     */
  static showUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const loginLink = document.getElementById('loginLink');
        
    if (userMenu) {
      userMenu.style.display = 'block';
            
      // Mostrar nombre de usuario
      const user = this.getUserInfo();
      if (user) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
          userNameDisplay.textContent = user.name || 'Usuario';
        }
                
        // Mostrar avatar de Google si está disponible
        const userProfileImage = document.getElementById('userProfileImage');
        if (userProfileImage && user.picture) {
          userProfileImage.src = user.picture;
          userProfileImage.style.display = 'block';
        }
      }
    }
        
    if (loginLink) {
      loginLink.style.display = 'none';
    }
  }
    
  /**
     * Muestra el enlace de inicio de sesión
     */
  static showLoginLink() {
    const userMenu = document.getElementById('userMenu');
    const loginLink = document.getElementById('loginLink');
        
    if (userMenu) {
      userMenu.style.display = 'none';
    }
        
    if (loginLink) {
      loginLink.style.display = 'block';
    }
  }
    
  /**
     * Obtiene la información del usuario del token
     * @returns {Object|null} - Información del usuario o null si no está disponible
     */
  static getUserInfo() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
            
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || payload.id,
        name: payload.name || payload.username,
        email: payload.email,
        role: payload.role,
        picture: payload.picture || payload.image_url
      };
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return null;
    }
  }
    
  /**
     * Configura el dropdown del menú de usuario
     */
  static setupDropdown() {
    const userInfo = document.querySelector('.user-info');
    const userDropdown = document.querySelector('.user-dropdown');
        
    if (!userInfo || !userDropdown) return;
        
    // Toggle del dropdown al hacer clic en el botón de usuario
    userInfo.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = userInfo.getAttribute('aria-expanded') === 'true';
      userInfo.setAttribute('aria-expanded', !isExpanded);
      userDropdown.classList.toggle('show');
    });
        
    // Cerrar el dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!userInfo.contains(e.target)) {
        userInfo.setAttribute('aria-expanded', 'false');
        userDropdown.classList.remove('show');
      }
    });
        
    // Cerrar el dropdown al presionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        userInfo.setAttribute('aria-expanded', 'false');
        userDropdown.classList.remove('show');
      }
    });
  }
    
  /**
     * Configura el cierre de sesión
     */
  static setupLogout() {
    const logoutLink = document.getElementById('logoutLink');
    if (!logoutLink) return;
        
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.logout();
    });
  }
    
  /**
     * Cierra la sesión del usuario
     */
  static logout() {
    // Eliminar token del localStorage
    localStorage.removeItem('token');
        
    // Redirigir a la página de inicio de sesión
    window.location.href = 'login.html';
  }
    
  /**
     * Actualiza el contador del carrito
     * @param {number} count - Número de items en el carrito
     */
  static updateCartCount(count) {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = count;
    }
  }
    
  /**
     * Actualiza el contador de la lista de deseos
     * @param {number} count - Número de items en la lista de deseos
     */
  static updateWishlistCount(count) {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
      wishlistCount.textContent = count;
    }
  }
}

// Inicializar el menú de usuario cuando el DOM esté listo
UserMenu.init();

// Función de inicialización
function initializeUserMenu() {
  UserMenu.init();
}

// Exportar la clase y la función de inicialización
export default UserMenu;
export { initializeUserMenu };
