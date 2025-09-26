// user.js - Utilidades para el manejo de usuarios

import UserMenu from './userMenu.js';

/**
 * Inicializa el sistema de usuarios
 */
export function initializeUser() {
  console.log('User system initialized');
  // Inicializar el menú de usuario
  UserMenu.init();
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si el usuario está autenticado
 */
export function isAuthenticated() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isTokenValid = payload.exp > Date.now() / 1000;
    
    // Si el token no es válido, eliminarlo
    if (!isTokenValid) {
      localStorage.removeItem('authToken');
    }
    
    return isTokenValid;
  } catch (e) {
    // Si hay un error al parsear el token, eliminarlo
    localStorage.removeItem('authToken');
    return false;
  }
}

/**
 * Obtiene la información del usuario actual
 * @returns {Object|null} Información del usuario o null si no está autenticado
 */
export function getCurrentUser() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isTokenValid = payload.exp > Date.now() / 1000;
    
    if (!isTokenValid) {
      localStorage.removeItem('authToken');
      return null;
    }
    
    return {
      id: payload.id,
      name: payload.username || payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (e) {
    localStorage.removeItem('authToken');
    return null;
  }
}

/**
 * Cierra la sesión del usuario
 */
export function logout() {
  localStorage.removeItem('authToken');
  
  // Disparar evento de cambio de estado de autenticación
  const event = new CustomEvent('authStatusChanged');
  document.dispatchEvent(event);
  
  // Redirigir a la página principal
  window.location.href = '/index.html';
}