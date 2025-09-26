// Funciones de autenticación

/**
 * Guarda el token de autenticación en localStorage
 * @param {string} token - Token JWT
 */
function saveAuthToken(token) {
  localStorage.setItem('authToken', token);
}

/**
 * Obtiene el token de autenticación de localStorage
 * @returns {string|null} Token JWT o null si no existe
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Elimina el token de autenticación de localStorage
 */
function removeAuthToken() {
  localStorage.removeItem('authToken');
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si el usuario está autenticado
 */
function isAuthenticated() {
  const token = getAuthToken();
  return !!token;
}

/**
 * Decodifica un token JWT
 * @param {string} token - Token JWT
 * @returns {object|null} Payload decodificado o null si es inválido
 */
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Verifica si el token es válido y no ha expirado
 * @returns {boolean} True si el token es válido
 */
function isTokenValid() {
  const token = getAuthToken();
  if (!token) return false;
  
  const payload = decodeToken(token);
  if (!payload) return false;
  
  // Verificar si el token ha expirado
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp > currentTime;
}

/**
 * Obtiene la información del usuario del token
 * @returns {object|null} Información del usuario o null
 */
function getUserInfo() {
  const token = getAuthToken();
  if (!token) return null;
  
  const payload = decodeToken(token);
  if (!payload) return null;
  
  return {
    id: payload.id,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role
  };
}