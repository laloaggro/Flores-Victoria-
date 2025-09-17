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
    // En desarrollo con Vite, el backend está en localhost:5000
    return 'http://localhost:5000';
  }
  
  // En producción, usar la URL del API Gateway
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // URL del API Gateway en producción
    return 'http://localhost:3000'; // Cambiar por la URL real del API Gateway en producción
  }
  
  // Detectar si se está usando Live Server (puerto 5500)
  if (typeof window !== 'undefined' && window.location.port === '5500') {
    // Cuando se usa Live Server, el API Gateway está en localhost:3000
    return 'http://localhost:3000';
  }
  
  // En desarrollo normal, usar localhost con puerto 5000 (backend)
  return 'http://localhost:5000';
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
 * Función para verificar si el usuario está autenticado
 * Verifica si hay un token válido almacenado en el localStorage
 * @returns {boolean} True si el usuario está autenticado, false en caso contrario
 */
const isAuthenticated = () => {
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
};

/**
 * Función para obtener información del usuario desde el token
 * Extrae la información del usuario desde el token JWT almacenado
 * @returns {Object|null} Información del usuario o null si no hay token válido
 */
const getUserInfoFromToken = () => {
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
};

/**
 * Función para obtener el token de autenticación
 * @returns {string|null} Token de autenticación o null si no existe
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
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