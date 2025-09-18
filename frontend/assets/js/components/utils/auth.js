import UserMenu from './userMenu.js';
import { updateCartCount, getUserInfoFromToken as getUser, isAuthenticated, logout as utilsLogout, isAdmin, API_BASE_URL, getAuthToken } from './utils.js';

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
      // Generar un token JWT simulado
      const simulatedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1NiIsImVtYWlsIjoicHJ1ZWJhQGZsb3Jlc3ZpY3RvcmlhLmNvbSIsIm5hbWUiOiJVc3VhcmlvIGRlIFBydWViYSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', simulatedToken);
      
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
        
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
        
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
        
    if (response.ok && data.token) {
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
      showNotification('¡Registro exitoso! Ahora puede iniciar sesión con prueba@floresvictoria.com y contraseña test123.', 'success');
      return { 
        success: true, 
        message: '¡Registro exitoso! Ahora puede iniciar sesión con prueba@floresvictoria.com y contraseña test123.' 
      };
    }
        
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
        
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
        
    if (response.ok) {
      showNotification('¡Registro exitoso! Ahora puede iniciar sesión.', 'success');
      return { success: true, user: data.user };
    } else {
      // Manejar errores específicos
      const errorMessage = data.message || 'Error desconocido al registrar usuario';
      showNotification(errorMessage, 'error');
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    showNotification('Error de conexión. Por favor, inténtelo de nuevo.', 'error');
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
        
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
        
    if (!response.ok) {
      throw new Error('Error al obtener el perfil del usuario');
    }
        
    const userData = await response.json();
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
        
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
        
    const data = await response.json();
        
    if (response.ok) {
      // Actualizar datos del usuario en localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
            
      showNotification('Perfil actualizado correctamente', 'success');
      return data;
    } else {
      showNotification(data.error || 'Error al actualizar el perfil', 'error');
      throw new Error(data.error || 'Error al actualizar el perfil');
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
        
    const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
        
    const data = await response.json();
        
    if (response.ok) {
      showNotification('Contraseña cambiada correctamente', 'success');
      return data;
    } else {
      showNotification(data.error || 'Error al cambiar la contraseña', 'error');
      throw new Error(data.error || 'Error al cambiar la contraseña');
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
          
          // Mostrar mensaje de éxito
          showNotification('Inicio de sesión exitoso. Redirigiendo...', 'success');
          
          // Redirigir al usuario a la página principal después de un breve retraso
          setTimeout(() => {
            window.location.href = '../index.html';
          }, 1500);
        } else {
          // Mostrar mensaje de error
          showNotification(result.message || 'Error al iniciar sesión', 'error');
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