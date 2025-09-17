// profile.js - Manejo de la página de perfil de usuario
import { formatPrice, getUserInfoFromToken as getUser } from '../utils/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario está logueado
  const token = localStorage.getItem('token');
  const user = getUser();
    
  if (!token || !user) {
    // Si no hay token o usuario, redirigir al login
    window.location.href = 'login.html';
    return;
  }
    
  // Mostrar información del usuario
  displayUserInfo(user);
    
  // Configurar event listeners
  setupEventListeners();
    
  // Cargar datos adicionales del usuario
  // loadUserProfile(); // Esta función no está definida, la eliminamos
});

// Mostrar información del usuario
function displayUserInfo(user) {
  // Actualizar elementos del DOM con la información del usuario
  const userNameElement = document.getElementById('userName');
  const userEmailElement = document.getElementById('userEmail');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
    
  // Campos del formulario
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const birthDate = document.getElementById('birthDate');
  const address = document.getElementById('address');
    
  if (userNameElement) userNameElement.textContent = user.name || 'Usuario';
  if (userEmailElement) userEmailElement.textContent = user.email || '';
    
  // Rellenar el formulario con los datos del usuario
  if (firstName) firstName.value = user.firstName || '';
  if (lastName) lastName.value = user.lastName || '';
  if (email) email.value = user.email || '';
  if (phone) phone.value = user.phone || '';
  if (birthDate) birthDate.value = user.birthDate || '';
  if (address) address.value = user.address || '';
}

// Configurar event listeners
function setupEventListeners() {
  // Botón de cerrar sesión
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
    
  // Formulario de perfil
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      updateProfile();
    });
  }
    
  // Formulario de cambio de contraseña
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      changePassword();
    });
  }
    
  // Formulario de configuración
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      updateSettings();
    });
  }
}

// Actualizar perfil
function updateProfile() {
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const birthDate = document.getElementById('birthDate');
  const address = document.getElementById('address');
    
  // Validación básica
  if (!firstName.value || !lastName.value) {
    alert('Por favor complete los campos obligatorios (Nombre y Apellido)');
    return;
  }
    
  // Obtener usuario actual
  const user = getUser() || {};
    
  // Actualizar datos del usuario
  user.firstName = firstName.value;
  user.lastName = lastName.value;
  user.email = email.value;
  user.phone = phone.value;
  user.birthDate = birthDate.value;
  user.address = address.value;
    
  // Guardar usuario actualizado
  // saveUser(user); // Esta función no está definida, usaremos localStorage directamente
    
  // Guardar en localStorage
  localStorage.setItem('user', JSON.stringify(user));
    
  // Actualizar información en el header
  // updateHeaderUserInfo(); // Esta función no está definida
    
  // Mostrar mensaje de éxito
  alert('Perfil actualizado correctamente');
}

// Configurar navegación del perfil
function setupProfileNavigation() {
  // La navegación se maneja ahora con el script en línea en profile.html
}

// Cargar pedidos del usuario
async function loadUserOrders(userId) {
  try {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
        
    ordersList.innerHTML = '<p>Cargando pedidos...</p>';
        
    // En un entorno real, esto sería una llamada a la API
    const response = await fetch(`http://localhost:5000/api/orders/user/${userId}`);
        
    if (!response.ok) {
      throw new Error('Error al cargar los pedidos');
    }
        
    const orders = await response.json();
        
    if (orders.length === 0) {
      ordersList.innerHTML = '<p>No tienes pedidos aún.</p>';
      return;
    }
        
    // Mostrar pedidos
    ordersList.innerHTML = `
            <div class="orders-container">
                ${orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <div>
                                <h3>Pedido #${order.id}</h3>
                                <p class="order-date">${new Date(order.date).toLocaleDateString('es-CL')}</p>
                            </div>
                            <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                        </div>
                        
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <span>${item.productName}</span>
                                    <span>${item.quantity} x ${formatPrice(item.price)}</span>
                                    <span>${formatPrice(item.quantity * item.price)}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="order-total">
                            <strong>Total: ${formatPrice(order.total)}</strong>
                        </div>
                        
                        <div class="order-details">
                            <p><strong>Dirección de envío:</strong> ${order.shippingAddress}</p>
                            <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    const ordersList = document.getElementById('ordersList');
    if (ordersList) {
      ordersList.innerHTML = '<p>Error al cargar los pedidos. Por favor, inténtalo nuevamente.</p>';
    }
  }
}

// Cargar estadísticas del usuario
function loadUserStats() {
  // En una implementación real, aquí se haría una llamada al servidor
  // para obtener estadísticas del usuario
}

// Cambiar contraseña
function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
  // Validación básica
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    alert('Por favor complete todos los campos');
    return;
  }
    
  if (newPassword !== confirmNewPassword) {
    alert('Las contraseñas nuevas no coinciden');
    return;
  }
    
  if (newPassword.length < 6) {
    alert('La nueva contraseña debe tener al menos 6 caracteres');
    return;
  }
    
  // En una implementación real, aquí se haría una llamada al servidor
  // para cambiar la contraseña
    
  // Mostrar mensaje de éxito
  alert('Contraseña actualizada correctamente');
    
  // Limpiar el formulario
  document.getElementById('changePasswordForm').reset();
}

// Actualizar configuración
function updateSettings() {
  const notifications = document.getElementById('notifications').checked;
  const newsletter = document.getElementById('newsletter').checked;
    
  // En una implementación real, aquí se haría una llamada al servidor
  // para guardar la configuración
    
  // Mostrar mensaje de éxito
  alert('Configuración guardada correctamente');
}

// Manejar cierre de sesión
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}