/**
 * Products Controller
 * Gestiona CRUD de productos y UI
 * Version: 2.0.0
 */

class ProductsController {
    constructor() {
        this.API_BASE = '/api/products'; // Conecta al product-service via API Gateway
        this.ADMIN_API = '/api/admin/stats/products';
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'id';
        this.sortOrder = 'asc';
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.loadProducts();
            this.loadStats();
            this.setupSidebar();
            this.setupTheme();
        });
    }

    setupEventListeners() {
        // Add Product Button
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Modal controls
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelProduct')?.addEventListener('click', () => this.closeModal());
        document.getElementById('saveProduct')?.addEventListener('click', () => this.saveProduct());

        // Delete modal controls
        document.getElementById('closeDeleteModal')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancelDelete')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirmDelete')?.addEventListener('click', () => this.deleteProduct());

        // Search and filters
        document.getElementById('productSearch')?.addEventListener('input', (e) => {
            this.filterProducts(e.target.value);
        });
        
        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('statusFilter')?.addEventListener('change', () => {
            this.applyFilters();
        });

        // Global search
        document.getElementById('globalSearch')?.addEventListener('input', (e) => {
            this.filterProducts(e.target.value);
        });

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

        // Export button
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportProducts());

        // Click outside modal to close
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closeModal();
                    this.closeDeleteModal();
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

            // Restore sidebar state
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

    async loadProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        try {
            // Show loading state
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center p-6">
                        <div class="spinner"></div>
                        <p class="text-muted mt-4">Cargando productos...</p>
                    </td>
                </tr>
            `;

            const response = await fetch(this.API_BASE);
            
            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }

            const data = await response.json();
            this.products = Array.isArray(data) ? data : data.products || [];
            this.filteredProducts = [...this.products];
            
            this.renderProducts();

        } catch (error) {
            console.error('Error loading products:', error);
            
            // Show sample data for demo
            this.products = this.getSampleProducts();
            this.filteredProducts = [...this.products];
            this.renderProducts();
            
            this.showToast('Mostrando datos de demostración', 'warning');
        }
    }

    async loadStats() {
        try {
            const response = await fetch(this.ADMIN_API);
            if (!response.ok) throw new Error('Error fetching stats');
            
            const stats = await response.json();
            
            this.updateElement('totalProducts', stats.total || this.products.length);
            this.updateElement('activeProducts', stats.active || this.products.filter(p => p.active !== false).length);
            this.updateElement('lowStockProducts', stats.lowStock || this.products.filter(p => p.stock < 10).length);
            this.updateElement('totalCategories', stats.categories || new Set(this.products.map(p => p.category)).size);
            
        } catch (error) {
            console.warn('Stats not available, using local data');
            
            this.updateElement('totalProducts', this.products.length);
            this.updateElement('activeProducts', this.products.filter(p => p.active !== false).length);
            this.updateElement('lowStockProducts', this.products.filter(p => p.stock < 10).length);
            this.updateElement('totalCategories', new Set(this.products.map(p => p.category)).size);
        }
    }

    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(start, end);

        if (pageProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center p-6">
                        <div class="empty-state">
                            <i class="fas fa-box-open empty-state-icon"></i>
                            <h3 class="empty-state-title">No hay productos</h3>
                            <p class="empty-state-description">Agrega tu primer producto para comenzar</p>
                            <button class="btn btn-primary mt-4" onclick="productsController.openModal()">
                                <i class="fas fa-plus"></i> Agregar Producto
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pageProducts.map(product => `
            <tr data-id="${product.id}">
                <td><span class="text-muted">#${product.id}</span></td>
                <td>
                    <img src="${product.image || '/assets/img/placeholder.jpg'}" 
                         alt="${this.escapeHtml(product.name)}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-lg);"
                         onerror="this.src='/assets/img/placeholder.jpg'">
                </td>
                <td>
                    <strong>${this.escapeHtml(product.name)}</strong>
                    ${product.sku ? `<br><span class="text-muted text-xs">SKU: ${product.sku}</span>` : ''}
                </td>
                <td><span class="badge badge-gray">${this.escapeHtml(product.category || 'Sin categoría')}</span></td>
                <td><strong>${this.formatCurrency(product.price)}</strong></td>
                <td>
                    ${this.renderStockBadge(product.stock)}
                </td>
                <td>
                    ${product.active !== false 
                        ? '<span class="status-badge online">Activo</span>' 
                        : '<span class="status-badge offline">Inactivo</span>'}
                </td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-sm btn-ghost" onclick="productsController.viewProduct(${product.id})" title="Ver">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost" onclick="productsController.editProduct(${product.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-ghost text-error" onclick="productsController.confirmDelete(${product.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    renderStockBadge(stock) {
        if (stock === undefined || stock === null) {
            return '<span class="badge badge-gray">N/A</span>';
        }
        
        if (stock <= 0) {
            return `<span class="badge badge-error">${stock} (Agotado)</span>`;
        } else if (stock < 10) {
            return `<span class="badge badge-warning">${stock} (Bajo)</span>`;
        } else {
            return `<span class="badge badge-success">${stock}</span>`;
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);

        this.updateElement('showingCount', this.filteredProducts.length > 0 ? `${start}-${end}` : '0');
        this.updateElement('totalCount', this.filteredProducts.length);

        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;

        // Update page buttons
        const pagination = document.getElementById('pagination');
        if (pagination) {
            const buttons = pagination.querySelectorAll('.pagination-btn:not(#prevPage):not(#nextPage)');
            buttons.forEach(btn => btn.remove());

            for (let i = 1; i <= Math.min(totalPages, 5); i++) {
                const btn = document.createElement('button');
                btn.className = `pagination-btn${i === this.currentPage ? ' active' : ''}`;
                btn.textContent = i;
                btn.addEventListener('click', () => this.goToPage(i));
                pagination.insertBefore(btn, document.getElementById('nextPage'));
            }
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderProducts();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderProducts();
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
    }

    filterProducts(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.name?.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term) ||
                product.sku?.toLowerCase().includes(term) ||
                product.category?.toLowerCase().includes(term)
            );
        }
        
        this.applyFilters();
    }

    applyFilters() {
        const category = document.getElementById('categoryFilter')?.value;
        const status = document.getElementById('statusFilter')?.value;
        const searchTerm = document.getElementById('productSearch')?.value?.toLowerCase() || '';

        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (searchTerm && !(
                product.name?.toLowerCase().includes(searchTerm) ||
                product.description?.toLowerCase().includes(searchTerm) ||
                product.sku?.toLowerCase().includes(searchTerm)
            )) {
                return false;
            }

            // Category filter
            if (category && product.category?.toLowerCase() !== category.toLowerCase()) {
                return false;
            }

            // Status filter
            if (status === 'active' && product.active === false) return false;
            if (status === 'inactive' && product.active !== false) return false;
            if (status === 'low-stock' && product.stock >= 10) return false;

            return true;
        });

        this.currentPage = 1;
        this.renderProducts();
    }

    sortBy(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'asc';
        }

        this.filteredProducts.sort((a, b) => {
            let valA = a[field];
            let valB = b[field];

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

        // Update sort indicators
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === field) {
                th.classList.add(this.sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });

        this.renderProducts();
    }

    openModal(product = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');

        if (product) {
            title.textContent = 'Editar Producto';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productStock').value = product.stock || '';
            document.getElementById('productSku').value = product.sku || '';
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productActive').checked = product.active !== false;
        } else {
            title.textContent = 'Nuevo Producto';
            form.reset();
            document.getElementById('productId').value = '';
            document.getElementById('productActive').checked = true;
        }

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('productModal')?.classList.remove('active');
    }

    async saveProduct() {
        const id = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            stock: parseInt(document.getElementById('productStock').value) || 0,
            sku: document.getElementById('productSku').value.trim(),
            image: document.getElementById('productImage').value.trim(),
            active: document.getElementById('productActive').checked
        };

        // Validation
        if (!productData.name) {
            this.showToast('El nombre es obligatorio', 'error');
            return;
        }
        if (!productData.category) {
            this.showToast('La categoría es obligatoria', 'error');
            return;
        }
        if (productData.price < 0) {
            this.showToast('El precio no puede ser negativo', 'error');
            return;
        }

        try {
            const isEdit = !!id;
            const url = isEdit ? `${this.API_BASE}/${id}` : this.API_BASE;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                throw new Error('Error al guardar producto');
            }

            this.showToast(`Producto ${isEdit ? 'actualizado' : 'creado'} exitosamente`, 'success');
            this.closeModal();
            this.loadProducts();
            this.loadStats();

        } catch (error) {
            console.error('Error saving product:', error);
            
            // Demo mode: add locally
            if (!id) {
                const newId = Math.max(...this.products.map(p => p.id), 0) + 1;
                this.products.push({ id: newId, ...productData });
            } else {
                const index = this.products.findIndex(p => p.id == id);
                if (index !== -1) {
                    this.products[index] = { id: parseInt(id), ...productData };
                }
            }
            
            this.filteredProducts = [...this.products];
            this.renderProducts();
            this.loadStats();
            this.closeModal();
            this.showToast('Producto guardado (modo demo)', 'warning');
        }
    }

    viewProduct(id) {
        const product = this.products.find(p => p.id == id);
        if (product) {
            // For now, just open in edit mode as read-only alternative
            this.openModal(product);
        }
    }

    editProduct(id) {
        const product = this.products.find(p => p.id == id);
        if (product) {
            this.openModal(product);
        }
    }

    confirmDelete(id) {
        document.getElementById('deleteProductId').value = id;
        document.getElementById('deleteModal').classList.add('active');
    }

    closeDeleteModal() {
        document.getElementById('deleteModal')?.classList.remove('active');
    }

    async deleteProduct() {
        const id = document.getElementById('deleteProductId').value;

        try {
            const response = await fetch(`${this.API_BASE}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar producto');
            }

            this.showToast('Producto eliminado exitosamente', 'success');
            this.closeDeleteModal();
            this.loadProducts();
            this.loadStats();

        } catch (error) {
            console.error('Error deleting product:', error);
            
            // Demo mode: delete locally
            this.products = this.products.filter(p => p.id != id);
            this.filteredProducts = [...this.products];
            this.renderProducts();
            this.loadStats();
            this.closeDeleteModal();
            this.showToast('Producto eliminado (modo demo)', 'warning');
        }
    }

    exportProducts() {
        const csv = this.convertToCSV(this.filteredProducts);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        this.showToast('Exportación completada', 'success');
    }

    convertToCSV(products) {
        const headers = ['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'SKU', 'Estado'];
        const rows = products.map(p => [
            p.id,
            `"${p.name}"`,
            p.category,
            p.price,
            p.stock,
            p.sku || '',
            p.active !== false ? 'Activo' : 'Inactivo'
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

    getSampleProducts() {
        return [
            { id: 1, name: 'Ramo de Rosas Rojas', category: 'ramos', price: 350, stock: 25, sku: 'RR-001', active: true, image: '/assets/img/products/roses.jpg' },
            { id: 2, name: 'Arreglo Floral Premium', category: 'arreglos', price: 550, stock: 12, sku: 'AF-002', active: true, image: '/assets/img/products/premium.jpg' },
            { id: 3, name: 'Orquídea Phalaenopsis', category: 'plantas', price: 450, stock: 8, sku: 'OP-003', active: true, image: '/assets/img/products/orchid.jpg' },
            { id: 4, name: 'Bouquet Silvestre', category: 'ramos', price: 280, stock: 15, sku: 'BS-004', active: true, image: '/assets/img/products/wildflowers.jpg' },
            { id: 5, name: 'Centro de Mesa Elegante', category: 'arreglos', price: 680, stock: 5, sku: 'CM-005', active: true, image: '/assets/img/products/centerpiece.jpg' },
            { id: 6, name: 'Suculenta Decorativa', category: 'plantas', price: 150, stock: 30, sku: 'SD-006', active: true, image: '/assets/img/products/succulent.jpg' },
            { id: 7, name: 'Ramo de Tulipanes', category: 'ramos', price: 320, stock: 18, sku: 'RT-007', active: true, image: '/assets/img/products/tulips.jpg' },
            { id: 8, name: 'Arreglo para Boda', category: 'arreglos', price: 1200, stock: 3, sku: 'AB-008', active: true, image: '/assets/img/products/wedding.jpg' },
            { id: 9, name: 'Cactus Mini', category: 'plantas', price: 95, stock: 45, sku: 'CM-009', active: true, image: '/assets/img/products/cactus.jpg' },
            { id: 10, name: 'Florero de Cristal', category: 'accesorios', price: 180, stock: 20, sku: 'FC-010', active: true, image: '/assets/img/products/vase.jpg' },
            { id: 11, name: 'Girasoles Brillantes', category: 'ramos', price: 250, stock: 0, sku: 'GB-011', active: false, image: '/assets/img/products/sunflowers.jpg' },
            { id: 12, name: 'Corona Fúnebre', category: 'arreglos', price: 800, stock: 2, sku: 'CF-012', active: true, image: '/assets/img/products/wreath.jpg' }
        ];
    }
}

// Initialize controller
const productsController = new ProductsController();
window.productsController = productsController;
