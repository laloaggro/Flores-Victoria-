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
 * Obtiene la información del usuario actual
 * @returns {Object|null} Información del usuario o null si no está autenticado
 */
export function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isTokenValid = payload.exp > Date.now() / 1000;
    
    if (!isTokenValid) {
      localStorage.removeItem('token');
      return null;
    }
    
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (e) {
    localStorage.removeItem('token');
    return null;
  }
}

/**
 * Cierra la sesión del usuario actual
 */
export function logout() {
  console.log('User logged out');
  // Eliminar el token del almacenamiento local
  localStorage.removeItem('token');
  
  // Actualizar el menú de usuario
  UserMenu.init();
  
  // Redirigir a la página de inicio
  window.location.href = '/index.html';
}