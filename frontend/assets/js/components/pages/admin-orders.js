// admin-orders.js - Manejo de la página de gestión de pedidos del administrador
import { initUserMenu } from '../auth.js';
import { API_BASE_URL, isAuthenticated, isAdmin, getAuthToken, showNotification } from '../utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación y rol de administrador
  if (!isAuthenticated() || !isAdmin()) {
    window.location.href = '/login.html';
    return;
  }

  // Inicializar menú de usuario
  initUserMenu();
    
  // Cargar pedidos
  await loadOrders();
});

// Configurar eventos
function setupEventListeners() {
  // Botón de refrescar pedidos
  const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
  if (refreshOrdersBtn) {
    refreshOrdersBtn.addEventListener('click', loadAllOrders);
  }
    
  // Formulario de edición de pedido
  const editOrderForm = document.getElementById('editOrderForm');
  if (editOrderForm) {
    editOrderForm.addEventListener('submit', updateOrderStatus);
  }
    
  // Botón de cancelar edición
  const cancelEditOrder = document.getElementById('cancelEditOrder');
  if (cancelEditOrder) {
    cancelEditOrder.addEventListener('click', closeEditOrderModal);
  }
    
  // Cerrar modal al hacer clic en la X
  const closeButtons = document.querySelectorAll('.btn-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', closeEditOrderModal);
  });
    
  // Cerrar modal al hacer clic fuera del contenido
  const modal = document.getElementById('editOrderModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeEditOrderModal();
      }
    });
  }
    
  // Cerrar modal con la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEditOrderModal();
    }
  });
}

// Cargar pedidos
async function loadOrders() {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar pedidos');
    }

    const orders = await response.json();
    renderOrders(orders);
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    const ordersContainer = document.getElementById('ordersContainer');
    if (ordersContainer) {
      ordersContainer.innerHTML = '<p>Error al cargar pedidos. Por favor, intenta nuevamente.</p>';
    }
    showNotification('Error al cargar pedidos', 'error');
  }
}

// Generar pedidos de ejemplo (simulación)
function generateMockOrders() {
  return [
    {
      id: 'ORD-001',
      date: '2025-08-25T10:30:00Z',
      customer: 'Juan Pérez',
      total: 25990,
      status: 'pending'
    },
    {
      id: 'ORD-002',
      date: '2025-08-24T14:15:00Z',
      customer: 'María González',
      total: 18500,
      status: 'processing'
    },
    {
      id: 'ORD-003',
      date: '2025-08-23T09:45:00Z',
      customer: 'Carlos López',
      total: 32750,
      status: 'shipped'
    },
    {
      id: 'ORD-004',
      date: '2025-08-22T16:20:00Z',
      customer: 'Ana Rodríguez',
      total: 15200,
      status: 'delivered'
    },
    {
      id: 'ORD-005',
      date: '2025-08-21T11:10:00Z',
      customer: 'Pedro Sánchez',
      total: 21000,
      status: 'cancelled'
    }
  ];
}

// Renderizar pedidos
function renderOrders(orders) {
  const ordersContainer = document.getElementById('ordersContainer');
  if (!ordersContainer) return;

  if (!orders || orders.length === 0) {
    ordersContainer.innerHTML = '<p>No hay pedidos disponibles.</p>';
    return;
  }

  ordersContainer.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Pedido #${order.id}</h3>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Cliente:</strong> ${order.customerName}</p>
                <p><strong>Fecha:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                <p><strong>Total:</strong> $${order.total}</p>
            </div>
            <div class="order-actions">
                <button onclick="updateOrderStatus(${order.id}, 'processing')" class="btn btn-secondary">Procesando</button>
                <button onclick="updateOrderStatus(${order.id}, 'shipped')" class="btn btn-warning">Enviado</button>
                <button onclick="updateOrderStatus(${order.id}, 'delivered')" class="btn btn-success">Entregado</button>
            </div>
        </div>
    `).join('');
}

// Obtener etiqueta de estado en español
function getStatusLabel(status) {
  const statusLabels = {
    'pending': 'Pendiente',
    'processing': 'Procesando',
    'shipped': 'Enviado',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
    
  return statusLabels[status] || status;
}

// Ver detalles del pedido
window.viewOrderDetails = function(orderId) {
  showNotification(`Funcionalidad para ver detalles del pedido #${orderId}`, 'info');
  // En una implementación real, esto mostraría un modal con los detalles del pedido
};

// Editar estado del pedido
window.editOrderStatus = function(orderId, currentStatus) {
  const modal = document.getElementById('editOrderModal');
  const orderIdInput = document.getElementById('editOrderId');
  const statusSelect = document.getElementById('orderStatus');
    
  if (modal && orderIdInput && statusSelect) {
    orderIdInput.value = orderId;
    statusSelect.value = currentStatus;
    modal.style.display = 'block';
        
    // Prevenir el scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }
};

// Cerrar modal de edición de pedido
function closeEditOrderModal() {
  const modal = document.getElementById('editOrderModal');
  if (modal) {
    modal.style.display = 'none';
        
    // Restaurar el scroll del body
    document.body.style.overflow = '';
        
    // Limpiar el formulario
    const editOrderForm = document.getElementById('editOrderForm');
    if (editOrderForm) {
      editOrderForm.reset();
    }
  }
}

// Actualizar estado del pedido
async function updateOrderStatus(e) {
  e.preventDefault();
    
  try {
    const orderId = document.getElementById('editOrderId').value;
    const status = document.getElementById('orderStatus').value;
    const notes = document.getElementById('orderNotes').value;
        
    // En una implementación real, esto enviaría una solicitud a la API
    console.log(`Actualizando pedido ${orderId} a estado: ${status}`);
    console.log(`Notas: ${notes}`);
        
    // Simular actualización
    setTimeout(() => {
      showNotification(`Estado del pedido #${orderId} actualizado a ${getStatusLabel(status)}`, 'success');
      closeEditOrderModal();
      loadAllOrders(); // Recargar la lista de pedidos
    }, 500);
        
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    showNotification('Error al actualizar el estado del pedido', 'error');
  }
}

// Función para limitar la frecuencia de ejecución de una función
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Función para filtrar pedidos
function filterOrders() {
  const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const rows = document.querySelectorAll('#ordersList tr:not(.no-results)');
    
  rows.forEach(row => {
    const orderId = row.cells[0].textContent.toLowerCase();
    const customer = row.cells[2].textContent.toLowerCase();
    const statusCell = row.cells[4].querySelector('.order-status');
    const status = statusCell ? statusCell.classList[1] : '';
        
    const matchesSearch = orderId.includes(searchTerm) || customer.includes(searchTerm);
    const matchesStatus = !statusFilter || status === statusFilter;
        
    if (matchesSearch && matchesStatus) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Función para inicializar la página de pedidos de administración
function initializeAdminOrders() {
  console.log('✅ Página de pedidos de administración inicializada');
}

// Exportar función de inicialización
export { initializeAdminOrders };