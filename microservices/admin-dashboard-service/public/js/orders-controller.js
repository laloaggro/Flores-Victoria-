/**
 * Orders Controller
 * Gestiona pedidos y actualización de estados
 * Version: 2.0.0
 */

class OrdersController {
    constructor() {
        this.API_BASE = '/api/orders'; // Conecta al order-service via API Gateway
        this.ADMIN_API = '/api/admin/stats/orders';
        this.orders = [];
        this.filteredOrders = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentStatus = 'all';
        this.sortField = 'createdAt';
        this.sortOrder = 'desc';
        
        this.statusLabels = {
            pending: { label: 'Pendiente', icon: 'clock', class: 'pending' },
            confirmed: { label: 'Confirmado', icon: 'check', class: 'confirmed' },
            preparing: { label: 'Preparando', icon: 'box', class: 'preparing' },
            shipped: { label: 'Enviado', icon: 'truck', class: 'shipped' },
            delivered: { label: 'Entregado', icon: 'check-double', class: 'delivered' },
            cancelled: { label: 'Cancelado', icon: 'times', class: 'cancelled' }
        };
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.loadOrders();
            this.loadStats();
            this.setupSidebar();
            this.setupTheme();
            this.setDefaultDateRange();
        });
    }

    setupEventListeners() {
        // Status filter tabs
        document.querySelectorAll('.status-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentStatus = tab.dataset.status;
                this.applyFilters();
            });
        });

        // Search
        document.getElementById('orderSearch')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('globalSearch')?.addEventListener('input', (e) => {
            document.getElementById('orderSearch').value = e.target.value;
            this.applyFilters();
        });

        // Date filters
        document.getElementById('dateFrom')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('dateTo')?.addEventListener('change', () => this.applyFilters());

        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.loadOrders());

        // Export button
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportOrders());

        // Modal controls
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('saveOrderChanges')?.addEventListener('click', () => this.saveOrderChanges());
        document.getElementById('printOrder')?.addEventListener('click', () => this.printOrder());

        // Sortable headers
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                this.sortBy(field);
            });
        });

        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());

        // Click outside modal to close
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeModal();
                }
            });
        });

        // User dropdown
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });
            
            document.addEventListener('click', () => {
                userDropdown.classList.remove('active');
            });
        }

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            window.location.href = '/login.html';
        });
    }

    setupSidebar() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                document.body.classList.toggle('sidebar-collapsed');
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            });

            if (localStorage.getItem('sidebarCollapsed') === 'true') {
                sidebar.classList.add('collapsed');
                document.body.classList.add('sidebar-collapsed');
            }
        }
    }

    setupTheme() {
        const toggle = document.getElementById('themeToggle');
        const icon = toggle?.querySelector('i');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        toggle?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }

    setDefaultDateRange() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
        document.getElementById('dateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
    }

    async loadOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        try {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center p-6">
                        <div class="spinner"></div>
                        <p class="text-muted mt-4">Cargando pedidos...</p>
                    </td>
                </tr>
            `;

            const response = await fetch(this.API_BASE);
            
            if (!response.ok) {
                throw new Error('Error al cargar pedidos');
            }

            const data = await response.json();
            this.orders = Array.isArray(data) ? data : data.orders || [];
            this.filteredOrders = [...this.orders];
            
            this.updateStatusCounts();
            this.renderOrders();

        } catch (error) {
            console.error('Error loading orders:', error);
            
            // Show sample data for demo
            this.orders = this.getSampleOrders();
            this.filteredOrders = [...this.orders];
            this.updateStatusCounts();
            this.renderOrders();
            
            this.showToast('Mostrando datos de demostración', 'warning');
        }
    }

    async loadStats() {
        try {
            const response = await fetch(this.ADMIN_API);
            if (!response.ok) throw new Error('Error fetching stats');
            
            const stats = await response.json();
            
            this.updateElement('totalOrders', stats.total || this.orders.length);
            this.updateElement('pendingOrders', stats.pending || this.orders.filter(o => o.status === 'pending').length);
            this.updateElement('deliveredOrders', stats.delivered || this.orders.filter(o => o.status === 'delivered').length);
            this.updateElement('monthlyRevenue', this.formatCurrency(stats.monthlyRevenue || this.calculateMonthlyRevenue()));
            
            // Update sidebar badge
            const pending = stats.pending || this.orders.filter(o => o.status === 'pending').length;
            document.getElementById('pendingBadge').textContent = pending;
            
        } catch (error) {
            console.warn('Stats not available, using local data');
            
            this.updateElement('totalOrders', this.orders.length);
            this.updateElement('pendingOrders', this.orders.filter(o => o.status === 'pending').length);
            this.updateElement('deliveredOrders', this.orders.filter(o => o.status === 'delivered').length);
            this.updateElement('monthlyRevenue', this.formatCurrency(this.calculateMonthlyRevenue()));
            
            const pending = this.orders.filter(o => o.status === 'pending').length;
            document.getElementById('pendingBadge').textContent = pending;
        }
    }

    calculateMonthlyRevenue() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return this.orders
            .filter(o => new Date(o.createdAt) >= startOfMonth && o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.total || 0), 0);
    }

    updateStatusCounts() {
        const counts = {
            all: this.orders.length,
            pending: this.orders.filter(o => o.status === 'pending').length,
            confirmed: this.orders.filter(o => o.status === 'confirmed').length,
            preparing: this.orders.filter(o => o.status === 'preparing').length,
            shipped: this.orders.filter(o => o.status === 'shipped').length,
            delivered: this.orders.filter(o => o.status === 'delivered').length,
            cancelled: this.orders.filter(o => o.status === 'cancelled').length
        };

        Object.keys(counts).forEach(status => {
            const el = document.getElementById(`count${status.charAt(0).toUpperCase() + status.slice(1)}`);
            if (el) el.textContent = counts[status];
        });
    }

    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    applyFilters() {
        const searchTerm = document.getElementById('orderSearch')?.value?.toLowerCase() || '';
        const dateFrom = document.getElementById('dateFrom')?.value;
        const dateTo = document.getElementById('dateTo')?.value;

        this.filteredOrders = this.orders.filter(order => {
            // Status filter
            if (this.currentStatus !== 'all' && order.status !== this.currentStatus) {
                return false;
            }

            // Search filter
            if (searchTerm && !(
                order.orderNumber?.toLowerCase().includes(searchTerm) ||
                order.customer?.name?.toLowerCase().includes(searchTerm) ||
                order.customer?.email?.toLowerCase().includes(searchTerm)
            )) {
                return false;
            }

            // Date filter
            if (dateFrom && new Date(order.createdAt) < new Date(dateFrom)) {
                return false;
            }
            if (dateTo && new Date(order.createdAt) > new Date(dateTo + 'T23:59:59')) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.renderOrders();
    }

    sortBy(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'desc';
        }

        this.filteredOrders.sort((a, b) => {
            let valA = this.getNestedValue(a, field);
            let valB = this.getNestedValue(b, field);

            // Handle dates
            if (field === 'createdAt' || field === 'deliveryDate') {
                valA = new Date(valA || 0);
                valB = new Date(valB || 0);
            }

            // Handle numbers
            if (typeof valA === 'number' && typeof valB === 'number') {
                return this.sortOrder === 'asc' ? valA - valB : valB - valA;
            }

            // Handle strings
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();

            if (this.sortOrder === 'asc') {
                return valA.localeCompare(valB);
            } else {
                return valB.localeCompare(valA);
            }
        });

        this.renderOrders();
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((o, k) => (o || {})[k], obj);
    }

    renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageOrders = this.filteredOrders.slice(start, end);

        if (pageOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center p-6">
                        <div class="empty-state">
                            <i class="fas fa-shopping-cart empty-state-icon"></i>
                            <h3 class="empty-state-title">No hay pedidos</h3>
                            <p class="empty-state-description">Los pedidos aparecerán aquí cuando se realicen</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pageOrders.map(order => `
            <tr data-id="${order.id}">
                <td>
                    <strong>#${order.orderNumber || order.id}</strong>
                </td>
                <td>
                    <div class="customer-info">
                        <div class="customer-avatar">${this.getInitials(order.customer?.name)}</div>
                        <div>
                            <strong>${this.escapeHtml(order.customer?.name || 'Cliente')}</strong>
                            <p class="text-sm text-muted">${this.escapeHtml(order.customer?.email || '-')}</p>
                        </div>
                    </div>
                </td>
                <td>
                    ${this.renderProductsPreview(order.items)}
                </td>
                <td>
                    <strong>${this.formatCurrency(order.total)}</strong>
                </td>
                <td>
                    ${this.renderStatusBadge(order.status)}
                </td>
                <td>
                    <span class="text-sm">${this.formatDate(order.createdAt)}</span>
                </td>
                <td>
                    <span class="text-sm">${this.formatDate(order.deliveryDate) || '-'}</span>
                </td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-sm btn-ghost" onclick="ordersController.viewOrder('${order.id}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost" onclick="ordersController.quickStatusUpdate('${order.id}')" title="Actualizar estado">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    renderProductsPreview(items) {
        if (!items || items.length === 0) {
            return '<span class="text-muted">Sin productos</span>';
        }

        const maxShow = 3;
        const shown = items.slice(0, maxShow);
        const remaining = items.length - maxShow;

        let html = '<div class="order-items-preview">';
        
        shown.forEach(item => {
            html += `<img src="${item.image || '/assets/img/placeholder.jpg'}" 
                         alt="${this.escapeHtml(item.name)}" 
                         title="${this.escapeHtml(item.name)}"
                         onerror="this.src='/assets/img/placeholder.jpg'">`;
        });

        if (remaining > 0) {
            html += `<span class="more">+${remaining}</span>`;
        }

        html += '</div>';
        return html;
    }

    renderStatusBadge(status) {
        const statusInfo = this.statusLabels[status] || { label: status, icon: 'question', class: '' };
        return `
            <span class="order-status ${statusInfo.class}">
                <i class="fas fa-${statusInfo.icon}"></i>
                ${statusInfo.label}
            </span>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredOrders.length);

        this.updateElement('showingCount', this.filteredOrders.length > 0 ? `${start}-${end}` : '0');
        this.updateElement('totalCount', this.filteredOrders.length);

        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderOrders();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderOrders();
        }
    }

    viewOrder(id) {
        const order = this.orders.find(o => o.id == id);
        if (!order) return;

        // Populate modal
        document.getElementById('modalOrderNumber').textContent = `#${order.orderNumber || order.id}`;
        document.getElementById('modalCustomerName').textContent = order.customer?.name || 'Cliente';
        document.getElementById('modalCustomerEmail').textContent = order.customer?.email || '-';
        document.getElementById('modalCustomerPhone').textContent = order.customer?.phone || '-';
        document.getElementById('modalCustomerAvatar').textContent = this.getInitials(order.customer?.name);
        
        document.getElementById('modalDeliveryAddress').textContent = order.deliveryAddress || '-';
        document.getElementById('modalDeliveryDate').textContent = this.formatDate(order.deliveryDate) || '-';
        document.getElementById('modalDeliveryTime').textContent = order.deliveryTime || '-';
        
        document.getElementById('modalStatusSelect').value = order.status;
        document.getElementById('modalNotes').value = order.notes || '';
        
        document.getElementById('modalSubtotal').textContent = this.formatCurrency(order.subtotal || order.total);
        document.getElementById('modalShipping').textContent = this.formatCurrency(order.shipping || 0);
        document.getElementById('modalTotal').textContent = this.formatCurrency(order.total);

        // Render items
        const itemsContainer = document.getElementById('modalOrderItems');
        if (order.items && order.items.length > 0) {
            itemsContainer.innerHTML = order.items.map(item => `
                <div class="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
                    <img src="${item.image || '/assets/img/placeholder.jpg'}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                         onerror="this.src='/assets/img/placeholder.jpg'">
                    <div class="flex-1">
                        <strong>${this.escapeHtml(item.name)}</strong>
                        <p class="text-sm text-muted">${item.quantity} x ${this.formatCurrency(item.price)}</p>
                    </div>
                    <strong>${this.formatCurrency(item.quantity * item.price)}</strong>
                </div>
            `).join('');
        } else {
            itemsContainer.innerHTML = '<p class="text-muted">Sin productos</p>';
        }

        // Store current order ID
        document.getElementById('orderModal').dataset.orderId = id;
        document.getElementById('orderModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('orderModal')?.classList.remove('active');
    }

    async saveOrderChanges() {
        const modal = document.getElementById('orderModal');
        const orderId = modal.dataset.orderId;
        const newStatus = document.getElementById('modalStatusSelect').value;
        const notes = document.getElementById('modalNotes').value;

        try {
            const response = await fetch(`${this.API_BASE}/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ status: newStatus, notes })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar pedido');
            }

            this.showToast('Pedido actualizado exitosamente', 'success');
            this.closeModal();
            this.loadOrders();
            this.loadStats();

        } catch (error) {
            console.error('Error updating order:', error);
            
            // Demo mode: update locally
            const order = this.orders.find(o => o.id == orderId);
            if (order) {
                order.status = newStatus;
                order.notes = notes;
            }
            
            this.updateStatusCounts();
            this.renderOrders();
            this.loadStats();
            this.closeModal();
            this.showToast('Pedido actualizado (modo demo)', 'warning');
        }
    }

    quickStatusUpdate(id) {
        this.viewOrder(id);
    }

    printOrder() {
        window.print();
    }

    exportOrders() {
        const csv = this.convertToCSV(this.filteredOrders);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        this.showToast('Exportación completada', 'success');
    }

    convertToCSV(orders) {
        const headers = ['# Pedido', 'Cliente', 'Email', 'Total', 'Estado', 'Fecha', 'Entrega'];
        const rows = orders.map(o => [
            o.orderNumber || o.id,
            `"${o.customer?.name || '-'}"`,
            o.customer?.email || '-',
            o.total,
            this.statusLabels[o.status]?.label || o.status,
            this.formatDate(o.createdAt),
            this.formatDate(o.deliveryDate) || '-'
        ]);
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    formatDate(dateStr) {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    getSampleOrders() {
        const now = new Date();
        return [
            {
                id: 1,
                orderNumber: 'FV-2024-001',
                customer: { name: 'María García', email: 'maria@email.com', phone: '+52 55 1234 5678' },
                items: [
                    { name: 'Ramo de Rosas Rojas', quantity: 1, price: 350, image: '/assets/img/products/roses.jpg' },
                    { name: 'Tarjeta personalizada', quantity: 1, price: 50, image: '/assets/img/products/card.jpg' }
                ],
                subtotal: 400,
                shipping: 75,
                total: 475,
                status: 'pending',
                createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
                deliveryDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                deliveryTime: '10:00 - 14:00',
                deliveryAddress: 'Av. Reforma 123, Col. Centro, CDMX',
                notes: 'Entregar con discreción, es sorpresa'
            },
            {
                id: 2,
                orderNumber: 'FV-2024-002',
                customer: { name: 'Juan Pérez', email: 'juan@email.com', phone: '+52 55 9876 5432' },
                items: [
                    { name: 'Arreglo Floral Premium', quantity: 1, price: 550, image: '/assets/img/products/premium.jpg' }
                ],
                subtotal: 550,
                shipping: 100,
                total: 650,
                status: 'confirmed',
                createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
                deliveryDate: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
                deliveryTime: '14:00 - 18:00',
                deliveryAddress: 'Calle Juárez 456, Col. Roma, CDMX'
            },
            {
                id: 3,
                orderNumber: 'FV-2024-003',
                customer: { name: 'Ana López', email: 'ana@email.com', phone: '+52 55 5555 5555' },
                items: [
                    { name: 'Orquídea Phalaenopsis', quantity: 2, price: 450, image: '/assets/img/products/orchid.jpg' },
                    { name: 'Maceta decorativa', quantity: 2, price: 120, image: '/assets/img/products/pot.jpg' }
                ],
                subtotal: 1140,
                shipping: 0,
                total: 1140,
                status: 'preparing',
                createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
                deliveryDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                deliveryTime: '09:00 - 12:00',
                deliveryAddress: 'Paseo de la Reforma 789, Col. Polanco, CDMX'
            },
            {
                id: 4,
                orderNumber: 'FV-2024-004',
                customer: { name: 'Carlos Ramírez', email: 'carlos@email.com', phone: '+52 55 1111 2222' },
                items: [
                    { name: 'Bouquet Silvestre', quantity: 1, price: 280, image: '/assets/img/products/wildflowers.jpg' }
                ],
                subtotal: 280,
                shipping: 75,
                total: 355,
                status: 'shipped',
                createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
                deliveryDate: new Date().toISOString(),
                deliveryTime: '16:00 - 20:00',
                deliveryAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX'
            },
            {
                id: 5,
                orderNumber: 'FV-2024-005',
                customer: { name: 'Laura Martínez', email: 'laura@email.com', phone: '+52 55 3333 4444' },
                items: [
                    { name: 'Centro de Mesa Elegante', quantity: 3, price: 680, image: '/assets/img/products/centerpiece.jpg' }
                ],
                subtotal: 2040,
                shipping: 150,
                total: 2190,
                status: 'delivered',
                createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
                deliveryDate: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
                deliveryTime: '10:00 - 14:00',
                deliveryAddress: 'Hotel Hilton, Salón Imperial, CDMX'
            },
            {
                id: 6,
                orderNumber: 'FV-2024-006',
                customer: { name: 'Roberto Sánchez', email: 'roberto@email.com', phone: '+52 55 6666 7777' },
                items: [
                    { name: 'Arreglo para Boda', quantity: 1, price: 1200, image: '/assets/img/products/wedding.jpg' }
                ],
                subtotal: 1200,
                shipping: 0,
                total: 1200,
                status: 'cancelled',
                createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Cancelado por el cliente - cambio de fecha'
            },
            {
                id: 7,
                orderNumber: 'FV-2024-007',
                customer: { name: 'Patricia Díaz', email: 'patricia@email.com', phone: '+52 55 8888 9999' },
                items: [
                    { name: 'Ramo de Tulipanes', quantity: 2, price: 320, image: '/assets/img/products/tulips.jpg' },
                    { name: 'Chocolates artesanales', quantity: 1, price: 180, image: '/assets/img/products/chocolates.jpg' }
                ],
                subtotal: 820,
                shipping: 75,
                total: 895,
                status: 'pending',
                createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
                deliveryDate: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
                deliveryTime: '10:00 - 14:00',
                deliveryAddress: 'Av. Universidad 567, Col. Narvarte, CDMX'
            },
            {
                id: 8,
                orderNumber: 'FV-2024-008',
                customer: { name: 'Fernando Torres', email: 'fernando@email.com', phone: '+52 55 0000 1111' },
                items: [
                    { name: 'Suculenta Decorativa', quantity: 5, price: 150, image: '/assets/img/products/succulent.jpg' }
                ],
                subtotal: 750,
                shipping: 100,
                total: 850,
                status: 'delivered',
                createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
                deliveryDate: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
                deliveryTime: '14:00 - 18:00',
                deliveryAddress: 'Oficinas Corporativas, Piso 15, Santa Fe, CDMX'
            }
        ];
    }
}

// Initialize controller
const ordersController = new OrdersController();
window.ordersController = ordersController;
