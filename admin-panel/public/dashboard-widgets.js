/**
 * Dashboard Widgets System with Drag & Drop
 * Permite personalizar el dashboard con widgets movibles y redimensionables
 */

const DashboardWidgets = (function() {
    'use strict';

    let grid;
    let widgets = [];
    let isEditMode = false;
    const STORAGE_KEY = 'flores-dashboard-layout';

    // Widget types disponibles
    const widgetTypes = {
        'system-status': {
            title: 'Estado del Sistema',
            icon: 'fa-server',
            minWidth: 2,
            minHeight: 2,
            defaultSize: { w: 4, h: 3 },
            render: renderSystemStatus
        },
        'orders-chart': {
            title: 'Gráfico de Pedidos',
            icon: 'fa-chart-line',
            minWidth: 3,
            minHeight: 2,
            defaultSize: { w: 6, h: 3 },
            render: renderOrdersChart
        },
        'revenue': {
            title: 'Ingresos',
            icon: 'fa-dollar-sign',
            minWidth: 2,
            minHeight: 2,
            defaultSize: { w: 3, h: 2 },
            render: renderRevenue
        },
        'recent-orders': {
            title: 'Pedidos Recientes',
            icon: 'fa-shopping-cart',
            minWidth: 3,
            minHeight: 3,
            defaultSize: { w: 4, h: 4 },
            render: renderRecentOrders
        },
        'users-online': {
            title: 'Usuarios en Línea',
            icon: 'fa-users',
            minWidth: 2,
            minHeight: 2,
            defaultSize: { w: 3, h: 2 },
            render: renderUsersOnline
        },
        'top-products': {
            title: 'Productos Más Vendidos',
            icon: 'fa-crown',
            minWidth: 3,
            minHeight: 3,
            defaultSize: { w: 4, h: 3 },
            render: renderTopProducts
        },
        'alerts': {
            title: 'Alertas del Sistema',
            icon: 'fa-exclamation-triangle',
            minWidth: 3,
            minHeight: 2,
            defaultSize: { w: 4, h: 3 },
            render: renderAlerts
        },
        'performance': {
            title: 'Métricas de Rendimiento',
            icon: 'fa-tachometer-alt',
            minWidth: 3,
            minHeight: 2,
            defaultSize: { w: 5, h: 3 },
            render: renderPerformance
        },
        'quick-actions': {
            title: 'Acciones Rápidas',
            icon: 'fa-bolt',
            minWidth: 2,
            minHeight: 2,
            defaultSize: { w: 3, h: 3 },
            render: renderQuickActions
        }
    };

    // Default layout para nuevos usuarios
    const defaultLayout = [
        { type: 'system-status', x: 0, y: 0, w: 4, h: 3 },
        { type: 'orders-chart', x: 4, y: 0, w: 6, h: 3 },
        { type: 'revenue', x: 10, y: 0, w: 3, h: 2 },
        { type: 'users-online', x: 10, y: 2, w: 3, h: 2 },
        { type: 'recent-orders', x: 0, y: 3, w: 4, h: 4 },
        { type: 'top-products', x: 4, y: 3, w: 4, h: 3 },
        { type: 'alerts', x: 8, y: 3, w: 5, h: 3 },
        { type: 'performance', x: 0, y: 7, w: 6, h: 3 },
        { type: 'quick-actions', x: 6, y: 6, w: 3, h: 3 }
    ];

    // Inicializar el sistema de widgets
    function init() {
        const container = document.getElementById('dashboard-grid');
        if (!container) {
            console.error('Dashboard grid container not found');
            return;
        }

        // Inicializar grid simple (sin GridStack para evitar dependencias)
        initSimpleGrid();
        
        // Cargar layout guardado o usar default
        loadLayout();

        // Setup event listeners
        setupEventListeners();

        console.log('Dashboard Widgets initialized');
    }

    // Inicializar grid simple con CSS Grid
    function initSimpleGrid() {
        const container = document.getElementById('dashboard-grid');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
        container.style.gap = '20px';
        container.style.padding = '20px';
    }

    // Cargar layout guardado
    function loadLayout() {
        const user = window.auth?.getCurrentUser();
        const storageKey = user ? `${STORAGE_KEY}-${user.username}` : STORAGE_KEY;
        
        const saved = localStorage.getItem(storageKey);
        const layout = saved ? JSON.parse(saved) : defaultLayout;

        widgets = layout;
        renderWidgets();
    }

    // Guardar layout actual
    function saveLayout() {
        const user = window.auth?.getCurrentUser();
        const storageKey = user ? `${STORAGE_KEY}-${user.username}` : STORAGE_KEY;
        
        localStorage.setItem(storageKey, JSON.stringify(widgets));
        
        if (window.notify) {
            notify({
                type: 'success',
                title: 'Layout Guardado',
                message: 'La configuración del dashboard ha sido guardada',
                duration: 2000
            });
        }
    }

    // Renderizar todos los widgets
    function renderWidgets() {
        const container = document.getElementById('dashboard-grid');
        container.innerHTML = '';

        widgets.forEach((widget, index) => {
            const widgetType = widgetTypes[widget.type];
            if (!widgetType) return;

            const widgetEl = createWidgetElement(widget, widgetType, index);
            container.appendChild(widgetEl);
        });

        // Actualizar datos de todos los widgets
        updateAllWidgets();
    }

    // Crear elemento de widget
    function createWidgetElement(widget, widgetType, index) {
        const div = document.createElement('div');
        div.className = 'dashboard-widget';
        div.dataset.widgetId = index;
        div.dataset.widgetType = widget.type;
        
        if (isEditMode) {
            div.classList.add('edit-mode');
            div.draggable = true;
        }

        div.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    <i class="fas ${widgetType.icon}"></i>
                    <span>${widgetType.title}</span>
                </div>
                <div class="widget-actions">
                    ${isEditMode ? `
                        <button class="widget-btn" onclick="DashboardWidgets.removeWidget(${index})" title="Eliminar widget">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="widget-btn" onclick="DashboardWidgets.refreshWidget(${index})" title="Actualizar">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content" id="widget-content-${index}">
                <div class="widget-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando...</p>
                </div>
            </div>
        `;

        // Drag events
        if (isEditMode) {
            div.addEventListener('dragstart', handleDragStart);
            div.addEventListener('dragover', handleDragOver);
            div.addEventListener('drop', handleDrop);
            div.addEventListener('dragend', handleDragEnd);
        }

        return div;
    }

    // Toggle edit mode
    function toggleEditMode() {
        isEditMode = !isEditMode;
        
        const btn = document.getElementById('editModeBtn');
        if (btn) {
            btn.innerHTML = isEditMode 
                ? '<i class="fas fa-save"></i> Guardar Layout'
                : '<i class="fas fa-edit"></i> Editar Dashboard';
            btn.classList.toggle('active', isEditMode);
        }

        if (isEditMode) {
            showWidgetPalette();
        } else {
            hideWidgetPalette();
            saveLayout();
        }

        renderWidgets();
    }

    // Mostrar paleta de widgets disponibles
    function showWidgetPalette() {
        let palette = document.getElementById('widget-palette');
        if (!palette) {
            palette = document.createElement('div');
            palette.id = 'widget-palette';
            palette.className = 'widget-palette';
            document.querySelector('.container').insertBefore(
                palette, 
                document.getElementById('dashboard-grid')
            );
        }

        const availableTypes = Object.keys(widgetTypes).filter(type => 
            !widgets.some(w => w.type === type)
        );

        palette.innerHTML = `
            <h3><i class="fas fa-plus-circle"></i> Agregar Widgets</h3>
            <div class="widget-palette-grid">
                ${availableTypes.map(type => {
                    const widgetType = widgetTypes[type];
                    return `
                        <button class="palette-widget" onclick="DashboardWidgets.addWidget('${type}')">
                            <i class="fas ${widgetType.icon}"></i>
                            <span>${widgetType.title}</span>
                        </button>
                    `;
                }).join('')}
                ${availableTypes.length === 0 ? '<p style="color: var(--text-secondary);">Todos los widgets están en uso</p>' : ''}
            </div>
        `;
        palette.style.display = 'block';
    }

    // Ocultar paleta
    function hideWidgetPalette() {
        const palette = document.getElementById('widget-palette');
        if (palette) {
            palette.style.display = 'none';
        }
    }

    // Agregar nuevo widget
    function addWidget(type) {
        const widgetType = widgetTypes[type];
        if (!widgetType) return;

        const newWidget = {
            type: type,
            x: 0,
            y: widgets.length,
            ...widgetType.defaultSize
        };

        widgets.push(newWidget);
        renderWidgets();

        if (window.notify) {
            notify({
                type: 'success',
                title: 'Widget Agregado',
                message: `${widgetType.title} ha sido agregado al dashboard`,
                duration: 2000
            });
        }
    }

    // Remover widget
    function removeWidget(index) {
        if (confirm('¿Estás seguro de que deseas eliminar este widget?')) {
            const widget = widgets[index];
            const widgetType = widgetTypes[widget.type];
            
            widgets.splice(index, 1);
            renderWidgets();

            if (window.notify) {
                notify({
                    type: 'info',
                    title: 'Widget Eliminado',
                    message: `${widgetType.title} ha sido eliminado`,
                    duration: 2000
                });
            }
        }
    }

    // Refrescar widget específico
    function refreshWidget(index) {
        const widget = widgets[index];
        const widgetType = widgetTypes[widget.type];
        const content = document.getElementById(`widget-content-${index}`);
        
        if (content && widgetType) {
            content.innerHTML = '<div class="widget-loading"><i class="fas fa-spinner fa-spin"></i><p>Actualizando...</p></div>';
            setTimeout(() => {
                widgetType.render(content);
            }, 500);
        }
    }

    // Actualizar todos los widgets
    function updateAllWidgets() {
        widgets.forEach((widget, index) => {
            const widgetType = widgetTypes[widget.type];
            const content = document.getElementById(`widget-content-${index}`);
            
            if (content && widgetType) {
                setTimeout(() => {
                    widgetType.render(content);
                }, 100 * index); // Stagger updates
            }
        });
    }

    // Drag & Drop handlers
    let draggedElement = null;

    function handleDragStart(e) {
        draggedElement = e.currentTarget;
        e.currentTarget.style.opacity = '0.5';
    }

    function handleDragOver(e) {
        e.preventDefault();
        return false;
    }

    function handleDrop(e) {
        e.preventDefault();
        
        if (draggedElement !== e.currentTarget) {
            const draggedIndex = parseInt(draggedElement.dataset.widgetId);
            const targetIndex = parseInt(e.currentTarget.dataset.widgetId);
            
            // Swap widgets
            [widgets[draggedIndex], widgets[targetIndex]] = [widgets[targetIndex], widgets[draggedIndex]];
            renderWidgets();
        }
        
        return false;
    }

    function handleDragEnd(e) {
        e.currentTarget.style.opacity = '1';
        draggedElement = null;
    }

    // Reset layout
    function resetLayout() {
        if (confirm('¿Estás seguro de que deseas restaurar el layout por defecto? Se perderán todos los cambios.')) {
            widgets = JSON.parse(JSON.stringify(defaultLayout));
            saveLayout();
            renderWidgets();

            if (window.notify) {
                notify({
                    type: 'info',
                    title: 'Layout Restaurado',
                    message: 'El dashboard ha sido restaurado a su configuración por defecto',
                    duration: 3000
                });
            }
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Auto-refresh cada 30 segundos
        setInterval(() => {
            if (!isEditMode) {
                updateAllWidgets();
            }
        }, 30000);
    }

    // ===== WIDGET RENDER FUNCTIONS =====

    function renderSystemStatus(container) {
        // Mock data - en producción vendría del backend
        const services = [
            { name: 'API Gateway', status: 'online', uptime: '99.9%' },
            { name: 'Auth Service', status: 'online', uptime: '99.8%' },
            { name: 'Product Service', status: 'online', uptime: '99.7%' },
            { name: 'MongoDB', status: 'online', uptime: '99.9%' },
            { name: 'Redis', status: 'warning', uptime: '98.5%' }
        ];

        container.innerHTML = `
            <div class="service-list">
                ${services.map(service => `
                    <div class="service-item">
                        <div class="service-info">
                            <span class="service-status ${service.status}">
                                <i class="fas fa-circle"></i>
                            </span>
                            <span class="service-name">${service.name}</span>
                        </div>
                        <span class="service-uptime">${service.uptime}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderOrdersChart(container) {
        const data = [45, 52, 48, 65, 72, 68, 85];
        const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const max = Math.max(...data);

        container.innerHTML = `
            <div class="chart-container">
                <div class="chart-bars">
                    ${data.map((value, i) => `
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar" style="height: ${(value / max * 100)}%">
                                <span class="chart-value">${value}</span>
                            </div>
                            <span class="chart-label">${labels[i]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderRevenue(container) {
        const revenue = 45850;
        const growth = 12.5;

        container.innerHTML = `
            <div class="stat-widget">
                <div class="stat-value">$${revenue.toLocaleString()}</div>
                <div class="stat-label">Ingresos del Mes</div>
                <div class="stat-trend positive">
                    <i class="fas fa-arrow-up"></i>
                    ${growth}% vs mes anterior
                </div>
            </div>
        `;
    }

    function renderUsersOnline(container) {
        const online = 127;
        const total = 1543;

        container.innerHTML = `
            <div class="stat-widget">
                <div class="stat-value">${online}</div>
                <div class="stat-label">Usuarios en Línea</div>
                <div class="stat-info">
                    <i class="fas fa-users"></i>
                    ${total} total registrados
                </div>
            </div>
        `;
    }

    function renderRecentOrders(container) {
        const orders = [
            { id: '#12345', customer: 'María García', amount: 450, status: 'completed' },
            { id: '#12346', customer: 'Juan Pérez', amount: 320, status: 'processing' },
            { id: '#12347', customer: 'Ana López', amount: 180, status: 'pending' },
            { id: '#12348', customer: 'Carlos Ruiz', amount: 560, status: 'completed' }
        ];

        container.innerHTML = `
            <div class="order-list">
                ${orders.map(order => `
                    <div class="order-item">
                        <div class="order-info">
                            <strong>${order.id}</strong>
                            <span>${order.customer}</span>
                        </div>
                        <div class="order-details">
                            <span class="order-amount">$${order.amount}</span>
                            <span class="order-status ${order.status}">${order.status}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderTopProducts(container) {
        const products = [
            { name: 'Rosa Roja Premium', sales: 245, trend: 'up' },
            { name: 'Ramo de Lirios', sales: 189, trend: 'up' },
            { name: 'Orquídea Blanca', sales: 156, trend: 'down' },
            { name: 'Girasoles', sales: 143, trend: 'up' }
        ];

        container.innerHTML = `
            <div class="product-list">
                ${products.map((product, i) => `
                    <div class="product-item">
                        <span class="product-rank">#${i + 1}</span>
                        <div class="product-info">
                            <strong>${product.name}</strong>
                            <span>${product.sales} ventas</span>
                        </div>
                        <i class="fas fa-arrow-${product.trend} trend-icon ${product.trend}"></i>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderAlerts(container) {
        const alerts = [
            { type: 'warning', message: 'Redis memoria al 85%', time: 'Hace 5 min' },
            { type: 'info', message: 'Backup completado exitosamente', time: 'Hace 1 hora' },
            { type: 'success', message: 'Actualización aplicada', time: 'Hace 2 horas' }
        ];

        container.innerHTML = `
            <div class="alert-list">
                ${alerts.map(alert => `
                    <div class="alert-item ${alert.type}">
                        <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : alert.type === 'info' ? 'info-circle' : 'check-circle'}"></i>
                        <div class="alert-content">
                            <p>${alert.message}</p>
                            <small>${alert.time}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderPerformance(container) {
        const metrics = [
            { label: 'CPU', value: 45, max: 100, unit: '%', status: 'good' },
            { label: 'Memoria', value: 68, max: 100, unit: '%', status: 'warning' },
            { label: 'Disco', value: 52, max: 100, unit: '%', status: 'good' },
            { label: 'Red', value: 234, max: 1000, unit: 'Mbps', status: 'good' }
        ];

        container.innerHTML = `
            <div class="metrics-grid">
                ${metrics.map(metric => `
                    <div class="metric-item">
                        <div class="metric-header">
                            <span class="metric-label">${metric.label}</span>
                            <span class="metric-value">${metric.value}${metric.unit}</span>
                        </div>
                        <div class="metric-bar">
                            <div class="metric-fill ${metric.status}" style="width: ${(metric.value / metric.max * 100)}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderQuickActions(container) {
        const actions = [
            { icon: 'fa-plus', label: 'Nuevo Pedido', action: 'createOrder' },
            { icon: 'fa-user-plus', label: 'Nuevo Usuario', action: 'createUser' },
            { icon: 'fa-box', label: 'Nuevo Producto', action: 'createProduct' },
            { icon: 'fa-file-export', label: 'Exportar Datos', action: 'exportData' }
        ];

        container.innerHTML = `
            <div class="actions-grid">
                ${actions.map(action => `
                    <button class="action-btn" onclick="console.log('${action.action}')">
                        <i class="fas ${action.icon}"></i>
                        <span>${action.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    // Public API
    return {
        init,
        toggleEditMode,
        addWidget,
        removeWidget,
        refreshWidget,
        resetLayout,
        updateAllWidgets
    };
})();

// Auto-initialize cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DashboardWidgets.init();
    });
} else {
    DashboardWidgets.init();
}
