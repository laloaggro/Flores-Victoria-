// 🎁 Admin Promotion Management

const API_BASE = '/api/promotions';
let promotions = [];
let currentPage = 1;
let totalPages = 1;

// Cargar promociones al iniciar
document.addEventListener('DOMContentLoaded', () => {
  loadPromotions();
  loadStats();
  
  // Set default dates
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setMonth(tomorrow.getMonth() + 1);
  
  document.getElementById('startDate').valueAsDate = now;
  document.getElementById('endDate').valueAsDate = tomorrow;
});

// Cargar lista de promociones
async function loadPromotions(page = 1) {
  try {
    const response = await fetch(`${API_BASE}?page=${page}&limit=20`);
    const data = await response.json();
    
    promotions = data.promotions;
    currentPage = data.pagination.page;
    totalPages = data.pagination.pages;
    
    renderPromotions();
    renderPagination();
  } catch (error) {
    console.error('Error loading promotions:', error);
    showError('Error al cargar promociones');
  }
}

// Cargar estadísticas
async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/stats/overview`);
    const data = await response.json();
    
    document.getElementById('stat-total').textContent = data.stats.total;
    document.getElementById('stat-active').textContent = data.stats.active;
    document.getElementById('stat-expired').textContent = data.stats.expired;
    document.getElementById('stat-upcoming').textContent = data.stats.upcoming;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Renderizar tabla de promociones
function renderPromotions() {
  const tbody = document.getElementById('promotions-tbody');
  const emptyState = document.getElementById('empty-state');
  
  if (promotions.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  tbody.innerHTML = promotions.map(promo => {
    const status = getPromotionStatus(promo);
    const typeLabel = getTypeLabel(promo.type);
    const valueDisplay = getValueDisplay(promo);
    
    return `
      <tr>
        <td><strong>${promo.code}</strong></td>
        <td>${promo.name}</td>
        <td>${typeLabel}</td>
        <td>${valueDisplay}</td>
        <td>${promo.usageCount} / ${promo.usageLimit || '∞'}</td>
        <td>
          ${formatDate(promo.startDate)}<br>
          <small style="color:#999">hasta ${formatDate(promo.endDate)}</small>
        </td>
        <td>
          <span class="status-badge status-${status.class}">
            ${status.label}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-small btn-edit" onclick="editPromotion('${promo._id}')">
              ✏️ Editar
            </button>
            <button class="btn-small btn-delete" onclick="deletePromotion('${promo._id}')">
              🗑️ Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Obtener estado de la promoción
function getPromotionStatus(promo) {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  
  if (!promo.active) {
    return { label: 'Inactiva', class: 'inactive' };
  }
  
  if (now < start) {
    return { label: 'Programada', class: 'scheduled' };
  }
  
  if (now > end) {
    return { label: 'Expirada', class: 'inactive' };
  }
  
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return { label: 'Agotada', class: 'inactive' };
  }
  
  return { label: 'Activa', class: 'active' };
}

// Obtener etiqueta del tipo
function getTypeLabel(type) {
  const labels = {
    percentage: '📊 Porcentaje',
    fixed: '💰 Fijo',
    bogo: '🎯 BOGO',
    free_shipping: '📦 Envío Gratis'
  };
  return labels[type] || type;
}

// Obtener visualización del valor
function getValueDisplay(promo) {
  switch (promo.type) {
    case 'percentage':
      return `${promo.value}%`;
    case 'fixed':
      return `$${promo.value.toLocaleString('es-CL')}`;
    case 'bogo':
      return '2x1';
    case 'free_shipping':
      return 'Gratis';
    default:
      return promo.value;
  }
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Renderizar paginación
function renderPagination() {
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  if (currentPage > 1) {
    html += `<button class="page-btn" onclick="loadPromotions(${currentPage - 1})">‹ Anterior</button>`;
  }
  
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    html += `<button class="page-btn ${activeClass}" onclick="loadPromotions(${i})">${i}</button>`;
  }
  
  if (currentPage < totalPages) {
    html += `<button class="page-btn" onclick="loadPromotions(${currentPage + 1})">Siguiente ›</button>`;
  }
  
  pagination.innerHTML = html;
}

// Abrir modal de creación
function openCreateModal() {
  document.getElementById('modal-title').textContent = 'Nueva Promoción';
  document.getElementById('promotion-form').reset();
  document.getElementById('promotion-id').value = '';
  
  // Reset dates
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  document.getElementById('startDate').valueAsDate = now;
  document.getElementById('endDate').valueAsDate = nextMonth;
  document.getElementById('active').checked = true;
  
  document.getElementById('promotion-modal').classList.add('show');
}

// Editar promoción
async function editPromotion(id) {
  try {
    const promo = promotions.find(p => p._id === id);
    if (!promo) return;
    
    document.getElementById('modal-title').textContent = 'Editar Promoción';
    document.getElementById('promotion-id').value = promo._id;
    document.getElementById('name').value = promo.name;
    document.getElementById('description').value = promo.description;
    document.getElementById('code').value = promo.code;
    document.getElementById('type').value = promo.type;
    document.getElementById('value').value = promo.value;
    document.getElementById('minPurchaseAmount').value = promo.minPurchaseAmount || '';
    document.getElementById('maxDiscountAmount').value = promo.maxDiscountAmount || '';
    document.getElementById('usageLimit').value = promo.usageLimit || '';
    document.getElementById('perUserLimit').value = promo.perUserLimit;
    document.getElementById('autoApply').checked = promo.autoApply;
    document.getElementById('stackable').checked = promo.stackable;
    document.getElementById('active').checked = promo.active;
    
    // Dates
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    document.getElementById('startDate').value = startDate.toISOString().slice(0, 16);
    document.getElementById('endDate').value = endDate.toISOString().slice(0, 16);
    
    updateValueLabel();
    
    document.getElementById('promotion-modal').classList.add('show');
  } catch (error) {
    console.error('Error editing promotion:', error);
    showError('Error al cargar promoción');
  }
}

// Guardar promoción
async function savePromotion(event) {
  event.preventDefault();
  
  const id = document.getElementById('promotion-id').value;
  const formData = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    code: document.getElementById('code').value.toUpperCase(),
    type: document.getElementById('type').value,
    value: parseFloat(document.getElementById('value').value),
    minPurchaseAmount: parseFloat(document.getElementById('minPurchaseAmount').value) || 0,
    maxDiscountAmount: parseFloat(document.getElementById('maxDiscountAmount').value) || null,
    usageLimit: parseInt(document.getElementById('usageLimit').value) || null,
    perUserLimit: parseInt(document.getElementById('perUserLimit').value) || 1,
    startDate: new Date(document.getElementById('startDate').value).toISOString(),
    endDate: new Date(document.getElementById('endDate').value).toISOString(),
    autoApply: document.getElementById('autoApply').checked,
    stackable: document.getElementById('stackable').checked,
    active: document.getElementById('active').checked
  };
  
  try {
    const url = id ? `${API_BASE}/${id}` : API_BASE;
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al guardar');
    }
    
    showSuccess(id ? 'Promoción actualizada' : 'Promoción creada');
    closeModal();
    loadPromotions();
    loadStats();
  } catch (error) {
    console.error('Error saving promotion:', error);
    showError(error.message);
  }
}

// Eliminar promoción
async function deletePromotion(id) {
  if (!confirm('¿Estás seguro de eliminar esta promoción?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar');
    }
    
    showSuccess('Promoción eliminada');
    loadPromotions();
    loadStats();
  } catch (error) {
    console.error('Error deleting promotion:', error);
    showError('Error al eliminar promoción');
  }
}

// Cerrar modal
function closeModal() {
  document.getElementById('promotion-modal').classList.remove('show');
}

// Actualizar etiqueta del valor según tipo
function updateValueLabel() {
  const type = document.getElementById('type').value;
  const label = document.getElementById('value-label');
  const valueInput = document.getElementById('value');
  
  switch (type) {
    case 'percentage':
      label.textContent = 'Porcentaje de Descuento (%)*';
      valueInput.max = 100;
      valueInput.placeholder = '10';
      break;
    case 'fixed':
      label.textContent = 'Monto del Descuento ($)*';
      valueInput.max = '';
      valueInput.placeholder = '5000';
      break;
    case 'bogo':
      label.textContent = 'Cantidad BOGO*';
      valueInput.max = '';
      valueInput.placeholder = '2';
      break;
    case 'free_shipping':
      label.textContent = 'Valor (no aplicable)';
      valueInput.value = 0;
      valueInput.disabled = true;
      return;
  }
  
  valueInput.disabled = false;
}

// Filtrar promociones
function filterPromotions() {
  const statusFilter = document.getElementById('filter-status').value;
  const typeFilter = document.getElementById('filter-type').value;
  
  let filtered = [...promotions];
  
  if (statusFilter) {
    filtered = filtered.filter(promo => {
      const status = getPromotionStatus(promo);
      return status.class === statusFilter || 
             (statusFilter === 'active' && status.label === 'Activa') ||
             (statusFilter === 'inactive' && (status.label === 'Inactiva' || status.label === 'Expirada')) ||
             (statusFilter === 'scheduled' && status.label === 'Programada');
    });
  }
  
  if (typeFilter) {
    filtered = filtered.filter(promo => promo.type === typeFilter);
  }
  
  const tbody = document.getElementById('promotions-tbody');
  const emptyState = document.getElementById('empty-state');
  
  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    emptyState.querySelector('h3').textContent = 'No se encontraron promociones';
    emptyState.querySelector('p').textContent = 'Prueba con otros filtros';
    return;
  }
  
  emptyState.style.display = 'none';
  
  tbody.innerHTML = filtered.map(promo => {
    const status = getPromotionStatus(promo);
    const typeLabel = getTypeLabel(promo.type);
    const valueDisplay = getValueDisplay(promo);
    
    return `
      <tr>
        <td><strong>${promo.code}</strong></td>
        <td>${promo.name}</td>
        <td>${typeLabel}</td>
        <td>${valueDisplay}</td>
        <td>${promo.usageCount} / ${promo.usageLimit || '∞'}</td>
        <td>
          ${formatDate(promo.startDate)}<br>
          <small style="color:#999">hasta ${formatDate(promo.endDate)}</small>
        </td>
        <td>
          <span class="status-badge status-${status.class}">
            ${status.label}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-small btn-edit" onclick="editPromotion('${promo._id}')">
              ✏️ Editar
            </button>
            <button class="btn-small btn-delete" onclick="deletePromotion('${promo._id}')">
              🗑️ Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Mostrar notificaciones
function showSuccess(message) {
  showNotification(message, 'success');
}

function showError(message) {
  showNotification(message, 'error');
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
    color: ${type === 'success' ? '#155724' : '#721c24'};
    border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Cerrar modal al hacer clic fuera
document.getElementById('promotion-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'promotion-modal') {
    closeModal();
  }
});
