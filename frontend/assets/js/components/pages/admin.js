// admin.js - Funcionalidad del panel de administración
import { API_BASE_URL, isAuthenticated, isAdmin, logout, showNotification, getAuthToken } from '../utils/utils.js';
import UserMenu from '../utils/userMenu.js';

// Función para configurar funcionalidad de actividad reciente
function setupActivityFunctionality() {
    const refreshActivityBtn = document.getElementById('refreshActivityBtn');
    const viewAllActivityBtn = document.getElementById('viewAllActivityBtn');
    
    if (refreshActivityBtn) {
        refreshActivityBtn.addEventListener('click', function() {
            refreshActivity();
        });
    }
    
    if (viewAllActivityBtn) {
        viewAllActivityBtn.addEventListener('click', function() {
            showNotification('Funcionalidad para ver todo el historial en desarrollo', 'info');
        });
    }
}

// Función para refrescar la actividad reciente
function refreshActivity() {
    showNotification('Actividad actualizada', 'info');
    // En una implementación real, esto cargaría la actividad reciente desde la API
    console.log('Refrescando actividad reciente...');
}

// Función para cargar datos del dashboard
async function loadDashboardData() {
    try {
        const token = getAuthToken();
        
        // Llamada a la API para obtener datos del dashboard
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar datos del dashboard');
        }
        
        const data = await response.json();
        updateDashboardUI(data);
        
        // Actualizar la última actualización
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = new Date().toLocaleString('es-ES');
        }
    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        showNotification('Error al cargar datos del dashboard', 'error');
    }
}

// Función para inicializar la página de administración
async function initializeAdmin() {
    // Verificar autenticación y rol de administrador
    if (!isAuthenticated() || !isAdmin()) {
        window.location.href = '/login.html';
        return;
    }
    
    // Inicializar el menú de usuario
    UserMenu.init();
    
    // Configurar el evento de logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
            window.location.href = '../index.html';
        });
    }
    
    // Configurar botones de navegación
    setupNavigationButtons();
    
    // Configurar funcionalidad de logs
    setupLogsFunctionality();
    
    // Configurar funcionalidad de actividad reciente
    setupActivityFunctionality();
    
    // Cargar datos del dashboard
    await loadDashboardData();
    
    console.log('✅ Página de administración inicializada');
}

// Exportar función de inicialización
export { initializeAdmin };

// Función para configurar todos los botones de navegación
function setupNavigationButtons() {
    // Botones de gestión de productos
    const manageProductsBtn = document.getElementById('manageProductsBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    
    // Botones de gestión de pedidos
    const manageOrdersBtn = document.getElementById('manageOrdersBtn');
    const viewPendingOrdersBtn = document.getElementById('viewPendingOrdersBtn');
    
    // Botones de gestión de usuarios
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    const addUserBtn = document.getElementById('addUserBtn');
    
    // Botones de estadísticas
    const viewStatsBtn = document.getElementById('viewStatsBtn');
    const generateReportBtn = document.getElementById('generateReportBtn');

    // Botones de configuración
    const manageSettingsBtn = document.getElementById('manageSettingsBtn');
    const manageConfigurationBtn = document.getElementById('manageConfigurationBtn');
    
    // Configurar eventos para productos
    if (manageProductsBtn) {
        manageProductsBtn.addEventListener('click', function() {
            window.location.href = 'products.html';
        });
    }
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            showAddProductModal();
        });
    }
    
    // Configurar eventos para pedidos
    if (manageOrdersBtn) {
        manageOrdersBtn.addEventListener('click', function() {
            window.location.href = 'admin-orders.html';
        });
    }
    
    if (viewPendingOrdersBtn) {
        viewPendingOrdersBtn.addEventListener('click', function() {
            window.location.href = 'admin-orders.html#pending';
        });
    }

    // Configurar eventos para usuarios
    if (manageUsersBtn) {
        manageUsersBtn.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            showNotification('Funcionalidad para agregar nuevo usuario en desarrollo', 'info');
        });
    }
    
    // Configurar eventos para estadísticas
    if (viewStatsBtn) {
        viewStatsBtn.addEventListener('click', function() {
            showStatistics();
        });
    }
    
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            showNotification('Funcionalidad para generar informes en desarrollo', 'info');
        });
    }

    // Configurar eventos para configuración
    if (manageSettingsBtn) {
        manageSettingsBtn.addEventListener('click', function() {
            window.location.href = 'settings.html';
        });
    }

    if (manageConfigurationBtn) {
        manageConfigurationBtn.addEventListener('click', function() {
            window.location.href = 'configuration.html';
        });
    }
}


// Función para actualizar la interfaz del dashboard
function updateDashboardUI(data) {
    // Actualizar estadísticas
    document.getElementById('totalProducts').textContent = data.totalProducts || 0;
    document.getElementById('totalOrders').textContent = data.totalOrders || 0;
    document.getElementById('totalUsers').textContent = data.totalUsers || 0;
    document.getElementById('pendingOrders').textContent = data.pendingOrders || 0;
}

// Función para mostrar estadísticas en un modal
function showStatistics() {
    // Crear modal para mostrar estadísticas
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'statisticsModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Estadísticas del Sitio</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="stats-container">
                    <div class="stat-card">
                        <h3>Ventas Totales</h3>
                        <p class="stat-value">$125,430</p>
                        <p class="stat-description">Ingresos generados este mes</p>
                    </div>
                    <div class="stat-card">
                        <h3>Pedidos</h3>
                        <p class="stat-value">1,243</p>
                        <p class="stat-description">Pedidos procesados</p>
                    </div>
                    <div class="stat-card">
                        <h3>Productos</h3>
                        <p class="stat-value">86</p>
                        <p class="stat-description">Productos en catálogo</p>
                    </div>
                    <div class="stat-card">
                        <h3>Usuarios</h3>
                        <p class="stat-value">2,189</p>
                        <p class="stat-description">Usuarios registrados</p>
                    </div>
                </div>
                <div class="chart-container">
                    <h3>Ventas por Categoría</h3>
                    <div class="chart-placeholder">
                        <p>Gráfico de ventas por categoría</p>
                        <div class="chart-bars">
                            <div class="chart-bar" style="height: 80%;">
                                <span>Arreglos</span>
                            </div>
                            <div class="chart-bar" style="height: 65%;">
                                <span>Ramos</span>
                            </div>
                            <div class="chart-bar" style="height: 45%;">
                                <span>Plantas</span>
                            </div>
                            <div class="chart-bar" style="height: 30%;">
                                <span>Accesorios</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="stats-actions">
                    <button class="btn btn-primary" id="exportStatsBtn">
                        <i class="fas fa-download"></i> Exportar Estadísticas
                    </button>
                    <button class="btn btn-secondary" id="refreshStatsBtn">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Añadir modal al documento
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    // Configurar botón de exportar estadísticas
    const exportStatsBtn = modal.querySelector('#exportStatsBtn');
    if (exportStatsBtn) {
        exportStatsBtn.addEventListener('click', function() {
            showNotification('Funcionalidad de exportación en desarrollo', 'info');
        });
    }
    
    // Configurar botón de actualizar estadísticas
    const refreshStatsBtn = modal.querySelector('#refreshStatsBtn');
    if (refreshStatsBtn) {
        refreshStatsBtn.addEventListener('click', function() {
            showNotification('Estadísticas actualizadas', 'success');
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
    
    // Mostrar modal
    modal.style.display = 'block';
}

// Función para mostrar el modal de agregar producto
function showAddProductModal() {
    // Verificar si el modal ya existe
    const existingModal = document.getElementById('addProductModal');
    if (existingModal) {
        existingModal.style.display = 'block';
        const firstInput = existingModal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
        return;
    }
    
    // Crear modal para agregar producto
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'addProductModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Agregar Nuevo Producto</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <form id="addProductForm">
                    <div class="form-group">
                        <label for="productName">Nombre del Producto:</label>
                        <input type="text" id="productName" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="productPrice">Precio:</label>
                        <input type="number" id="productPrice" class="form-control" min="0" step="100" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="productCategory">Categoría:</label>
                        <select id="productCategory" class="form-control" required>
                            <option value="">Seleccionar categoría</option>
                            <option value="arreglos">Arreglos Florales</option>
                            <option value="ramos">Ramos</option>
                            <option value="plantas">Plantas</option>
                            <option value="accesorios">Accesorios</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="productImage">URL de la Imagen:</label>
                        <input type="text" id="productImage" class="form-control" placeholder="https://ejemplo.com/imagen.jpg">
                    </div>
                    
                    <div class="form-group">
                        <label for="productDescription">Descripción:</label>
                        <textarea id="productDescription" class="form-control" rows="3" placeholder="Descripción del producto"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancelAddProduct">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Agregar Producto</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Añadir modal al documento
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Configurar botón de cancelar
    const cancelBtn = document.getElementById('cancelAddProduct');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Configurar formulario de agregar producto
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addProduct();
        });
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Cerrar modal con la tecla Escape
    const closeOnEscape = function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    
    document.addEventListener('keydown', closeOnEscape);
    
    // Mostrar modal
    modal.style.display = 'block';
    
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    
    // Enfocar el primer campo
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
        firstInput.focus();
    }
}

// Función para agregar un producto
async function addProduct() {
    try {
        const form = document.getElementById('addProductForm');
        if (!form) return;
        
        const productName = document.getElementById('productName').value;
        const productPrice = parseFloat(document.getElementById('productPrice').value);
        const productCategory = document.getElementById('productCategory').value;
        const productImage = document.getElementById('productImage').value;
        const productDescription = document.getElementById('productDescription').value;
        
        // Validar campos requeridos
        if (!productName || !productPrice || !productCategory) {
            showNotification('Por favor complete todos los campos obligatorios', 'error');
            return;
        }
        
        // Validar precio
        if (productPrice <= 0) {
            showNotification('El precio debe ser mayor que cero', 'error');
            return;
        }
        
        // Preparar datos para enviar
        const productData = {
            name: productName,
            price: productPrice,
            category: productCategory,
            description: productDescription || ''
        };
        
        // Agregar imagen si se proporcionó
        if (productImage) {
            productData.image = productImage;
        }
        
        // Obtener token de autenticación
        const token = getAuthToken();
        
        // Enviar solicitud a la API
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Producto agregado exitosamente', 'success');
            const modal = document.getElementById('addProductModal');
            if (modal) {
                modal.style.display = 'none';
                // Restaurar scroll del body
                document.body.style.overflow = '';
            }
            // Recargar la página de productos si estamos ahí
            if (window.location.pathname.includes('products.html')) {
                window.location.reload();
            }
        } else {
            showNotification(`Error al agregar el producto: ${result.message || 'Error desconocido'}`, 'error');
        }
        
    } catch (error) {
        console.error('Error al agregar producto:', error);
        showNotification(`Error al agregar el producto: ${error.message}`, 'error');
    }
}

// Función para configurar la funcionalidad de logs
function setupLogsFunctionality() {
    const refreshLogsBtn = document.getElementById('refreshLogsBtn');
    const clearLogsBtn = document.getElementById('clearLogsBtn');
    const logLevelFilter = document.getElementById('logLevelFilter');
    const logsList = document.getElementById('logsList');
    
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', function() {
            refreshLogs();
        });
    }
    
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas limpiar todos los logs?')) {
                clearLogs();
            }
        });
    }
    
    if (logLevelFilter) {
        logLevelFilter.addEventListener('change', function() {
            filterLogs(this.value);
        });
    }
}

// Función para refrescar los logs
function refreshLogs() {
    showNotification('Logs actualizados', 'info');
    // En una implementación real, esto cargaría los logs desde la API
    console.log('Refrescando logs...');
}

// Función para limpiar los logs
function clearLogs() {
    const logsList = document.getElementById('logsList');
    if (logsList) {
        logsList.innerHTML = '<p class="no-logs">No hay logs para mostrar.</p>';
        showNotification('Logs limpiados correctamente', 'success');
    }
}

// Función para filtrar los logs por nivel
function filterLogs(level) {
    showNotification(`Filtrando logs por nivel: ${level}`, 'info');
    // En una implementación real, esto filtraría los logs existentes
    console.log(`Filtrando logs por nivel: ${level}`);
}

