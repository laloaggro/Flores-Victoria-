// orders.js - Manejo de la página de pedidos del usuario
import { initUserMenu } from './auth.js';
import { getUserInfoFromToken as getUser, API_BASE_URL } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar menú de usuario
  initUserMenu();

  // Verificar si el usuario está logueado
  const token = localStorage.getItem('token');
  const user = getUser();

  if (!token || !user) {
    // Si no hay token o usuario, redirigir al login
    window.location.href = 'login.html';
    return;
  }

  // Cargar pedidos del usuario
  loadUserOrders(user.id);
});

// Cargar pedidos del usuario
async function loadUserOrders(userId) {
  try {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    // En un entorno real, esto sería una llamada a la API
    const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar los pedidos');
    }

    const orders = await response.json();

    if (orders.length === 0) {
      ordersList.innerHTML =
        '<tr><td colspan="5" class="text-center">No tienes pedidos aún.</td></tr>';
      return;
    }

    // Renderizar pedidos
    renderOrders(orders);
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    document.getElementById('ordersList').innerHTML =
      '<tr><td colspan="5" class="text-center">Error al cargar los pedidos. Por favor, intenta nuevamente.</td></tr>';
  }
}

// Renderizar pedidos en la tabla
function renderOrders(orders) {
  const ordersList = document.getElementById('ordersList');

  ordersList.innerHTML = orders
    .map(
      (order) => `
        <tr>
            <td>#${order.id}</td>
            <td>${new Date(order.date).toLocaleDateString('es-CL')}</td>
            <td>$${order.total.toLocaleString('es-CL')}</td>
            <td><span class="order-status ${order.status.toLowerCase()}">${getStatusLabel(order.status)}</span></td>
            <td><button class="btn-small btn-secondary" onclick="viewOrderDetails('${order.id}')">Ver Detalles</button></td>
        </tr>
    `
    )
    .join('');
}

// Obtener etiqueta de estado en español
function getStatusLabel(status) {
  const statusLabels = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return statusLabels[status] || status;
}

// Hacer la función viewOrderDetails disponible globalmente
window.viewOrderDetails = function (orderId) {
  alert(
    `Funcionalidad para ver detalles del pedido #${orderId}. En una implementación completa, esto mostraría los detalles del pedido.`
  );
};

// Exportar funciones necesarias
export { loadUserOrders };
