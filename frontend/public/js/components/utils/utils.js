/**
 * utils.js - Funciones de utilidad compartidas
 * Contiene funciones auxiliares utilizadas en múltiples partes de la aplicación
 */

/**
 * Determinar la URL base del API según el entorno
 * Devuelve la URL correcta dependiendo de si se está en desarrollo o producción
 * @returns {string} URL base del API
 */
const getApiBaseUrl = () => {
  // Detectar si estamos en un entorno de desarrollo Vite
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    // En desarrollo con Vite, el API Gateway está en localhost:3000
    return 'http://localhost:3000';
  }
  
  // En producción, usar la URL del API Gateway
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // URL del API Gateway en producción
    return 'https://api.floresvictoria.cl'; // Esta es la URL real del API Gateway en producción
  }
  
  // Detectar si se está usando Live Server (puerto 5500)
  if (typeof window !== 'undefined' && window.location.port === '5500') {
    // Cuando se usa Live Server, el API Gateway está en localhost:3000
    return 'http://localhost:3000';
  }
  
  // En desarrollo normal, usar localhost con puerto 3000 (API Gateway)
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Función para verificar la conectividad con el backend
 * Realiza una serie de intentos para conectar con diferentes endpoints del backend
 * @returns {Promise<boolean>} True si se puede conectar, false en caso contrario
 */
const checkBackendConnectivity = async () => {
  try {
    // Probar primero con un endpoint que probablemente exista
    const endpointsToTry = [
      '/api/users/login',  // Endpoint de login
      '/api/products',  // Endpoint que debería existir
      '/api/users/profile',  // Endpoint para verificar sesión
      '/',  // Página principal como último recurso
    ];

    for (const endpoint of endpointsToTry) {
      const response = await fetch(API_BASE_URL + endpoint, { method: 'HEAD' });
      if (response.ok) {
        console.log(`Conectividad verificada con: ${API_BASE_URL}${endpoint}`);
        return true;
      }
    }
    
    throw new Error('No se pudo establecer conexión con ninguno de los endpoints');
  } catch (error) {
    console.error('Error al verificar conectividad con el backend:', error);
    return false;
  }
};

/**
 * Función para mostrar notificaciones al usuario
 * Crea y muestra notificaciones temporales en la esquina superior derecha
 * @param {string} message - Mensaje a mostrar en la notificación
 * @param {string} type - Tipo de notificación (info, success, warning, error)
 */
export const showNotification = (message, type = 'info') => {
  // Crear contenedor de notificaciones si no existe
  let notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999999999;
      width: 300px;
    `;
    document.body.appendChild(notificationContainer);
  }

  // Crear notificación
  const notification = document.createElement('div');
  notification.style.cssText = `
    background-color: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
    border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
    color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
    position: relative;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;

  notification.innerHTML = `
    ${message}
    <button style="
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: inherit;
    ">&times;</button>
  `;

  // Añadir evento para cerrar notificación
  notification.querySelector('button').addEventListener('click', () => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });

  // Añadir notificación al contenedor
  notificationContainer.appendChild(notification);

  // Mostrar notificación con animación
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Eliminar automáticamente después de 5 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
};

/**
 * Función para mostrar una notificación de inicio de sesión exitoso con estilo mejorado
 * @param {string} message - Mensaje a mostrar en la notificación
 * @param {number} duration - Duración en milisegundos antes de redirigir (por defecto 1500ms)
 */
export const showLoginSuccess = (message, duration = 1500) => {
  // Crear contenedor de notificaciones si no existe
  let notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999999999;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    document.body.appendChild(notificationContainer);
  }

  // Crear notificación modal
  const notification = document.createElement('div');
  notification.style.cssText = `
    background-color: #fff;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
    text-align: center;
    max-width: 90%;
    width: 400px;
  `;

  notification.innerHTML = `
    <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
    <h3 style="margin-top: 0; color: #28a745;">¡Inicio de sesión exitoso!</h3>
    <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">${message}</p>
    <div style="border-radius: 50%; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #28a745; animation: spin 1s linear infinite; margin: 0 auto;"></div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // Añadir notificación al contenedor
  notificationContainer.appendChild(notification);
  
  // Eliminar automáticamente después de la duración especificada
  setTimeout(() => {
    if (notificationContainer.parentNode) {
      notificationContainer.parentNode.removeChild(notificationContainer);
    }
  }, duration);
};

/**
 * Función para verificar si el usuario está autenticado
 * Verifica si hay un token válido almacenado en el localStorage
 * @returns {boolean} True si el usuario está autenticado, false en caso contrario
 */
const isAuthenticated = () => {
  try {
    // Aceptar token en cualquiera de las claves conocidas
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    // Si hay token, determinar validez
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        // Token con formato JWT: validar expiración si existe
        try {
          const payload = JSON.parse(atob(parts[1]));
          if (!payload.exp) return true; // sin exp => asumir válido según backend
          return payload.exp > Date.now() / 1000;
        } catch {
          // Token no parseable como JWT: tratar como opaco (válido por presencia)
          return true;
        }
      }
      // Token opaco (1 parte u otro formato): válido por presencia
      return true;
    }

    // Sin token, pero existe un objeto de usuario válido
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      return true;
    }

    return false;
  } catch (e) {
    // En caso de error, limpiar posibles claves y retornar no autenticado
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    return false;
  }
};

/**
 * Función para obtener información del usuario desde el token
 * Extrae la información del usuario desde el token JWT almacenado
 * @returns {Object|null} Información del usuario o null si no hay token válido
 */
const getUserInfoFromToken = () => {
  try {
    console.log('[getUserInfoFromToken] Iniciando...');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    console.log('[getUserInfoFromToken] Token:', token ? 'existe' : 'no existe');
    console.log('[getUserInfoFromToken] UserStr:', userStr ? 'existe' : 'no existe');
    
    if (!token && !userStr) {
      console.log('[getUserInfoFromToken] No hay token ni user, retornando null');
      return null;
    }

    // Intentar JWT primero
    if (token) {
      const parts = token.split('.');
      console.log('[getUserInfoFromToken] Partes del token:', parts.length);
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('[getUserInfoFromToken] Payload JWT:', payload);
          return {
            id: payload.userId || payload.id,
            name: payload.name || payload.username || 'Usuario',
            email: payload.email || '',
            role: payload.role || 'user',
            picture: payload.picture || null
          };
        } catch (e) {
          console.log('[getUserInfoFromToken] Error parseando JWT, usando modo opaco:', e);
          // Falla parseo: caer al modo opaco
        }
      }
    }

    // Modo opaco: usar el objeto 'user' del localStorage
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const user = JSON.parse(userStr);
        console.log('[getUserInfoFromToken] Usuario del localStorage:', user);
        
        // Verificar que el objeto user tenga al menos algún campo válido
        if (!user || typeof user !== 'object') {
          console.error('[getUserInfoFromToken] User no es un objeto válido');
          return null;
        }
        
        const userInfo = {
          id: user.id || user._id || user.userId,
          name: user.name || user.username || 'Usuario',
          email: user.email || '',
          role: user.role || 'user',
          picture: user.picture || null
        };
        console.log('[getUserInfoFromToken] UserInfo construido:', userInfo);
        return userInfo;
      } catch (e) {
        console.error('[getUserInfoFromToken] Error parseando user del localStorage:', e);
        // Limpiar el user inválido
        localStorage.removeItem('user');
        return null;
      }
    }

    console.log('[getUserInfoFromToken] No se pudo obtener info de usuario, retornando null');
    return null;
  } catch (e) {
    console.error('[getUserInfoFromToken] Error general:', e);
    return null;
  }
};

/**
 * Función para formatear fechas
 * Formatea una fecha en el formato local de Chile (es-ES)
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada
 */
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

/**
 * Función para validar email
 * Valida el formato de un email usando una expresión regular
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email tiene un formato válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Función para validar contraseña
 * Valida que la contraseña cumpla con los requisitos mínimos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {boolean} True si la contraseña cumple con los requisitos
 */
const isValidPassword = (password) => {
  // Al menos 8 caracteres, una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Función para validar teléfono
 * Valida que el teléfono tenga el formato chileno correcto
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si el teléfono tiene un formato válido
 */
const isValidPhone = (phone) => {
  // Formato chileno: +569xxxxxxxx o 9xxxxxxxx
  const phoneRegex = /^(\+569|9)\d{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Función para formatear precios
 * Formatea un número como precio en formato chileno (CLP)
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado con separadores de miles
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Función para actualizar el contador del carrito en el header
 * Actualiza la cantidad de productos mostrada en el icono del carrito
 */
const updateCartCount = () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const savedForLater = JSON.parse(localStorage.getItem('savedForLater')) || [];
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0) + 
                     savedForLater.reduce((total, item) => total + item.quantity, 0);
  
  // Actualizar contador en el header
  const cartCountElement = document.getElementById('cartCount');
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
    cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
  }
};

/**
 * Función para obtener el carrito del localStorage
 * @returns {Array} Carrito de compras actual
 */
const getCart = () => {
  return JSON.parse(localStorage.getItem('cart')) || [];
};

/**
 * Función para guardar el carrito en el localStorage
 * @param {Array} cart - Carrito de compras a guardar
 */
const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
};

/**
 * Función para agregar un producto al carrito
 * Agrega un producto al carrito o incrementa su cantidad si ya existe
 * @param {Object} product - Producto a agregar al carrito
 */
const addToCart = (product) => {
  const cart = getCart();
  
  // Verificar si el producto ya está en el carrito
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    // Incrementar cantidad si ya existe
    existingItem.quantity += 1;
  } else {
    // Agregar nuevo producto al carrito
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || product.image,
      quantity: 1
    });
  }
  
  // Guardar carrito actualizado
  saveCart(cart);
  
  // Mostrar notificación
  showNotification(`"${product.name}" agregado al carrito`, 'success');
};

/**
 * Función para eliminar un producto del carrito
 * Elimina un producto específico del carrito
 * @param {string} productId - ID del producto a eliminar
 */
const removeFromCart = (productId) => {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
};

/**
 * Función para actualizar la cantidad de un producto en el carrito
 * Actualiza la cantidad de un producto específico en el carrito
 * @param {string} productId - ID del producto
 * @param {number} quantity - Nueva cantidad
 */
const updateCartQuantity = (productId, quantity) => {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
};

/**
 * Función para cerrar sesión
 * Elimina los datos de autenticación y redirige al usuario a la página principal
 */
const logout = () => {
  localStorage.clear()
  window.location.href = 'index.html';
};

/**
 * Función para obtener el token de autenticación
 * @returns {string|null} Token de autenticación o null si no existe
 */
const getAuthToken = () => {
  // Compatibilidad: algunas páginas usan 'authToken'; estandarizamos a 'token'
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

/**
 * Función para verificar si el usuario es administrador
 * @returns {boolean} True si el usuario tiene rol de administrador
 */
const isAdmin = () => {
  const user = getUserInfoFromToken();
  return user && user.role === 'admin';
};

// Exportar funciones
export {
  checkBackendConnectivity,
  isAuthenticated,
  getUserInfoFromToken,
  getAuthToken,
  isAdmin,
  formatPrice,
  updateCartCount,
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  formatDate,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  logout
};