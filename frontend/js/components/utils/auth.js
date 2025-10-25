import UserMenu from './userMenu.js';
import { updateCartCount, getUserInfoFromToken as getUser, isAuthenticated, logout as utilsLogout, isAdmin, getAuthToken, showNotification } from './utils.js';
import { API_ENDPOINTS } from '../../config/api.js';
import http from '../../utils/httpClient.js';

// auth.js - Manejo de autenticación y menú de usuario

// Inicializar el menú de usuario
export function initUserMenu() {
  UserMenu.init();
}

// Usar utils.js中的logout función
export function logout() {
  utilsLogout();
}

/**
 * Iniciar sesión
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Resultado de la autenticación
 */
export async function login(email, password) {
  try {
    console.log('Iniciando sesión con:', { email });
    
    // Para el entorno de desarrollo, usar credenciales simuladas
    if (email === 'prueba@floresvictoria.com' && password === 'test123') {
      // Generar un token JWT simulado con una fecha de expiración futura
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        id: '123456',
        email: 'prueba@floresvictoria.com',
        name: 'Usuario de Prueba',
        role: 'user',
        exp: now + 3600 // Expira en 1 hora
      };
      
      // Codificar el payload en base64
      const payloadBase64 = btoa(JSON.stringify(payload));
      
      // Crear un token JWT simulado (header.payload.signature)
      const simulatedToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payloadBase64}.signature`;
      
      // Datos del usuario simulado
      const simulatedUser = {
        id: '123456',
        name: 'Usuario de Prueba',
        email: 'prueba@floresvictoria.com',
        role: 'user'
      };
      
      return {
        success: true,
        token: simulatedToken,
        user: simulatedUser,
        message: 'Inicio de sesión exitoso'
      };
    }
        
    const data = await http.post('/auth/login', { email, password });
    console.log('Respuesta del servidor:', data);
        
    if (data && data.token) {
      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
            
      // Extraer información del usuario del token
      const user = getUser();
            
      return {
        success: true,
        token: data.token,
        user: user,
        message: 'Inicio de sesión exitoso'
      };
    } else {
      // Manejar errores de autenticación
      return {
        success: false,
        message: data.message || 'Credenciales inválidas'
      };
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return {
      success: false,
      message: 'Error de conexión. Por favor, verifique su conexión a internet e intente nuevamente.'
    };
  }
}

/**
 * Registrar un nuevo usuario
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise<Object>} - Resultado del registro
 */
export async function register(userData) {
  try {
    console.log('Registrando usuario:', userData);
    
    // Para el entorno de desarrollo, simular registro exitoso
    if (userData.email && userData.password) {
      alert('¡Registro exitoso! Ahora puede iniciar sesión con prueba@floresvictoria.com y contraseña test123.');
      
      return { success: true };
    }
    
    const data = await http.post('/auth/register', userData);
    
    if (data) {
      alert('¡Registro exitoso! Ahora puede iniciar sesión.');
      
      return { success: true };
    } else {
      const message = (data && data.message) || 'Error en el registro';
      alert(message);
      
      return { success: false, message };
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    alert('Error de conexión. Por favor, verifique su conexión a internet e intente nuevamente.');
    
    return { success: false, message: 'Error de conexión' };
  }
}

// Función para obtener el perfil del usuario
export async function getUserProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    // Para el entorno de desarrollo, devolver datos simulados
    if (token) {
      return {
        id: '123456',
        name: 'Usuario de Prueba',
        email: 'prueba@floresvictoria.com',
        role: 'user'
      };
    }
        
    const userData = await http.get('/users/profile');
    return userData;
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    showNotification('Error al obtener el perfil del usuario', 'error');
    throw error;
  }
}

// Función para actualizar el perfil del usuario
export async function updateUserProfile(userData) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    // Para el entorno de desarrollo, simular actualización exitosa
    if (token) {
      showNotification('Perfil actualizado correctamente', 'success');
      return {
        id: '123456',
        name: userData.name || 'Usuario de Prueba',
        email: userData.email || 'prueba@floresvictoria.com',
        role: 'user'
      };
    }
        
    const data = await http.put('/users/profile', userData);
        
    if (data) {
      // Actualizar datos del usuario en localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
            
      showNotification('Perfil actualizado correctamente', 'success');
      return data;
    } else {
      const errMsg = (data && data.error) || 'Error al actualizar el perfil';
      showNotification(errMsg, 'error');
      throw new Error(errMsg);
    }
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    showNotification('Error de conexión. Por favor, inténtelo de nuevo.', 'error');
    throw error;
  }
}

// Función para cambiar la contraseña del usuario
export async function changePassword(currentPassword, newPassword) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    // Para el entorno de desarrollo, simular cambio de contraseña exitoso
    if (token && currentPassword && newPassword) {
      showNotification('Contraseña cambiada correctamente', 'success');
      return { message: 'Contraseña cambiada correctamente' };
    }
        
    const data = await http.put('/users/change-password', { currentPassword, newPassword });
        
    if (data) {
      showNotification('Contraseña cambiada correctamente', 'success');
      return data;
    } else {
      const errMsg = (data && data.error) || 'Error al cambiar la contraseña';
      showNotification(errMsg, 'error');
      throw new Error(errMsg);
    }
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    showNotification('Error de conexión. Por favor, inténtelo de nuevo.', 'error');
    throw error;
  }
}

// Función para inicializar la funcionalidad de autenticación
export function initAuth() {
  // Inicializar menú de usuario
  initUserMenu();
    
  // Configurar formularios de login y registro
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
    
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
            
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
            
      // Validar campos
      if (!email || !password) {
        showNotification('Por favor, complete todos los campos', 'error');
        return;
      }
            
      // Deshabilitar botón durante el proceso
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
            
      try {
        const result = await login(email, password);
        if (result.success) {
          // Actualizar el menú de usuario
          UserMenu.init();
          
          // Mostrar mensaje de éxito con estilo mejorado
          alert('Inicio de sesión exitoso. Redirigiendo...');
          
          // Redirigir al usuario a la página principal después de un breve retraso
          setTimeout(() => {
            window.location.href = '../index.html';
          }, 1500);
        } else {
          // Mostrar mensaje de error
          alert(result.message || 'Error al iniciar sesión');
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showNotification('Error de conexión. Por favor, inténtelo de nuevo.', 'error');
      } finally {
        // Rehabilitar botón
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    });
  }
    
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
            
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const phone = document.getElementById('phone').value;
            
      // Validar campos
      if (!name || !email || !password || !phone) {
        showNotification('Por favor, complete todos los campos', 'error');
        return;
      }
            
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Por favor, ingrese un email válido', 'error');
        return;
      }
            
      // Validar contraseña
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        showNotification('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número', 'error');
        return;
      }
            
      // Validar teléfono
      const phoneRegex = /^(\+569|9)\d{8}$/;
      if (!phoneRegex.test(phone)) {
        showNotification('Por favor, ingrese un teléfono válido (ej: +56912345678)', 'error');
        return;
      }
            
      // Deshabilitar botón durante el proceso
      const submitButton = registerForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
            
      try {
        const result = await register({ name, email, password, phone });
        if (result.success) {
          // Redirigir a la página de login después del registro exitoso
          setTimeout(() => {
            window.location.href = './login.html';
          }, 2000);
        }
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        showNotification('Error de conexión. Por favor, inténtelo de nuevo.', 'error');
      } finally {
        // Rehabilitar botón
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    });
  }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});