// Funciones de autenticación
const Auth = {
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtener el token de autenticación
  getToken() {
    return localStorage.getItem('token');
  },

  // Guardar el token de autenticación
  setToken(token) {
    localStorage.setItem('token', token);
  },

  // Eliminar el token de autenticación (cerrar sesión)
  removeToken() {
    localStorage.removeItem('token');
  },

  // Obtener información del usuario
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Guardar información del usuario
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Eliminar información del usuario
  removeUser() {
    localStorage.removeItem('user');
  },

  // Cerrar sesión
  logout() {
    this.removeToken();
    this.removeUser();
  },

  // Obtener encabezados de autenticación
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

// Exportar el objeto Auth
window.Auth = Auth;