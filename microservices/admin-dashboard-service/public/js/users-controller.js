/**
 * Users Controller
 * Manages user data, filtering, and CRUD operations for the admin panel
 */

(function() {
    'use strict';

    // ================================
    // State Management
    // ================================
    const state = {
        users: [],
        filteredUsers: [],
        currentPage: 1,
        perPage: 10,
        currentRole: 'all',
        searchQuery: '',
        statusFilter: '',
        sortField: 'createdAt',
        sortOrder: 'desc',
        editingUserId: null
    };

    // Sample data for development/demo
    const sampleUsers = [
        {
            id: '1',
            firstName: 'María',
            lastName: 'González',
            email: 'maria.gonzalez@email.com',
            phone: '+52 55 1234 5678',
            role: 'customer',
            status: 'active',
            emailVerified: true,
            createdAt: '2024-01-15T10:30:00Z',
            lastLogin: '2025-01-10T14:22:00Z',
            ordersCount: 12,
            totalSpent: 8450.00,
            address: 'Col. Roma Norte, CDMX'
        },
        {
            id: '2',
            firstName: 'Carlos',
            lastName: 'Mendoza',
            email: 'carlos.admin@floresvictoria.com',
            phone: '+52 55 9876 5432',
            role: 'admin',
            status: 'active',
            emailVerified: true,
            createdAt: '2023-06-01T09:00:00Z',
            lastLogin: '2025-01-11T09:15:00Z',
            ordersCount: 0,
            totalSpent: 0,
            address: 'Oficina Central'
        },
        {
            id: '3',
            firstName: 'Ana',
            lastName: 'Rodríguez',
            email: 'ana.rodriguez@email.com',
            phone: '+52 55 5555 1234',
            role: 'customer',
            status: 'active',
            emailVerified: true,
            createdAt: '2024-03-20T16:45:00Z',
            lastLogin: '2025-01-09T11:30:00Z',
            ordersCount: 5,
            totalSpent: 3200.00,
            address: 'Polanco, CDMX'
        },
        {
            id: '4',
            firstName: 'Roberto',
            lastName: 'Martínez',
            email: 'roberto.manager@floresvictoria.com',
            phone: '+52 55 4444 3333',
            role: 'manager',
            status: 'active',
            emailVerified: true,
            createdAt: '2023-08-15T08:00:00Z',
            lastLogin: '2025-01-11T08:45:00Z',
            ordersCount: 0,
            totalSpent: 0,
            address: 'Sucursal Norte'
        },
        {
            id: '5',
            firstName: 'Laura',
            lastName: 'Sánchez',
            email: 'laura.sanchez@email.com',
            phone: '+52 55 2222 1111',
            role: 'customer',
            status: 'inactive',
            emailVerified: false,
            createdAt: '2024-06-10T12:00:00Z',
            lastLogin: '2024-08-15T10:00:00Z',
            ordersCount: 2,
            totalSpent: 850.00,
            address: 'Coyoacán, CDMX'
        },
        {
            id: '6',
            firstName: 'Miguel',
            lastName: 'Torres',
            email: 'miguel.viewer@floresvictoria.com',
            phone: '+52 55 3333 4444',
            role: 'viewer',
            status: 'active',
            emailVerified: true,
            createdAt: '2024-09-01T10:00:00Z',
            lastLogin: '2025-01-10T16:00:00Z',
            ordersCount: 0,
            totalSpent: 0,
            address: 'Oficina Contabilidad'
        },
        {
            id: '7',
            firstName: 'Patricia',
            lastName: 'Hernández',
            email: 'patricia.h@email.com',
            phone: '+52 55 6666 7777',
            role: 'customer',
            status: 'active',
            emailVerified: true,
            createdAt: '2024-11-05T14:30:00Z',
            lastLogin: '2025-01-11T10:15:00Z',
            ordersCount: 8,
            totalSpent: 5600.00,
            address: 'Santa Fe, CDMX'
        },
        {
            id: '8',
            firstName: 'Eduardo',
            lastName: 'López',
            email: 'eduardo.lopez@email.com',
            phone: '+52 55 8888 9999',
            role: 'customer',
            status: 'suspended',
            emailVerified: true,
            createdAt: '2024-02-28T09:15:00Z',
            lastLogin: '2024-12-01T08:00:00Z',
            ordersCount: 1,
            totalSpent: 320.00,
            address: 'Naucalpan, Edo. Mex.'
        }
    ];

    // ================================
    // API Functions
    // ================================
    async function fetchUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                }
            });
            
            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            return data.users || data;
        } catch (error) {
            console.warn('Using sample users data:', error.message);
            return sampleUsers;
        }
    }

    async function saveUser(userData) {
        try {
            const method = userData.id ? 'PUT' : 'POST';
            const url = userData.id ? `/api/admin/users/${userData.id}` : '/api/admin/users';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) throw new Error('Save failed');
            
            return await response.json();
        } catch (error) {
            console.warn('Simulating save:', error.message);
            // Simulate save
            if (userData.id) {
                const index = state.users.findIndex(u => u.id === userData.id);
                if (index !== -1) {
                    state.users[index] = { ...state.users[index], ...userData };
                }
            } else {
                userData.id = Date.now().toString();
                userData.createdAt = new Date().toISOString();
                userData.lastLogin = null;
                userData.ordersCount = 0;
                userData.totalSpent = 0;
                state.users.push(userData);
            }
            return userData;
        }
    }

    async function deleteUser(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                }
            });
            
            if (!response.ok) throw new Error('Delete failed');
            
            return true;
        } catch (error) {
            console.warn('Simulating delete:', error.message);
            state.users = state.users.filter(u => u.id !== userId);
            return true;
        }
    }

    // ================================
    // UI Functions
    // ================================
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        container.appendChild(toast);
        
        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function formatDate(dateString) {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }

    function formatDateTime(dateString) {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    }

    function getInitials(firstName, lastName) {
        return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
    }

    function getRoleBadge(role) {
        const roleClasses = {
            admin: 'admin',
            manager: 'manager',
            viewer: 'viewer',
            customer: 'customer'
        };
        const roleLabels = {
            admin: 'Admin',
            manager: 'Manager',
            viewer: 'Viewer',
            customer: 'Cliente'
        };
        return `<span class="user-role-badge ${roleClasses[role] || 'customer'}">${roleLabels[role] || role}</span>`;
    }

    function getStatusBadge(status) {
        const statusClasses = {
            active: 'badge-success',
            inactive: 'badge-warning',
            suspended: 'badge-error'
        };
        const statusLabels = {
            active: 'Activo',
            inactive: 'Inactivo',
            suspended: 'Suspendido'
        };
        return `<span class="badge ${statusClasses[status] || 'badge-default'}">${statusLabels[status] || status}</span>`;
    }

    function updateStats() {
        const total = state.users.length;
        const active = state.users.filter(u => u.status === 'active').length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newToday = state.users.filter(u => new Date(u.createdAt) >= today).length;
        const admins = state.users.filter(u => u.role === 'admin').length;
        
        document.getElementById('totalUsers').textContent = total;
        document.getElementById('activeUsers').textContent = active;
        document.getElementById('newUsersToday').textContent = newToday;
        document.getElementById('adminUsers').textContent = admins;
    }

    function updateFilterCounts() {
        const counts = {
            all: state.users.length,
            customer: state.users.filter(u => u.role === 'customer').length,
            admin: state.users.filter(u => u.role === 'admin').length,
            manager: state.users.filter(u => u.role === 'manager').length,
            viewer: state.users.filter(u => u.role === 'viewer').length
        };
        
        document.getElementById('countAll').textContent = counts.all;
        document.getElementById('countCustomers').textContent = counts.customer;
        document.getElementById('countAdmins').textContent = counts.admin;
        document.getElementById('countManagers').textContent = counts.manager;
        document.getElementById('countViewers').textContent = counts.viewer;
    }

    function applyFilters() {
        let filtered = [...state.users];
        
        // Filter by role
        if (state.currentRole !== 'all') {
            filtered = filtered.filter(u => u.role === state.currentRole);
        }
        
        // Filter by status
        if (state.statusFilter) {
            filtered = filtered.filter(u => u.status === state.statusFilter);
        }
        
        // Filter by search query
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(u => 
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query)
            );
        }
        
        // Sort
        filtered.sort((a, b) => {
            let valA = a[state.sortField];
            let valB = b[state.sortField];
            
            if (state.sortField === 'createdAt' || state.sortField === 'lastLogin') {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            }
            
            if (state.sortOrder === 'asc') {
                return valA > valB ? 1 : -1;
            }
            return valA < valB ? 1 : -1;
        });
        
        state.filteredUsers = filtered;
        state.currentPage = 1;
        renderTable();
    }

    function renderTable() {
        const tbody = document.getElementById('usersTableBody');
        const start = (state.currentPage - 1) * state.perPage;
        const end = start + state.perPage;
        const pageUsers = state.filteredUsers.slice(start, end);
        
        if (pageUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center p-6">
                        <i class="fas fa-users text-muted" style="font-size: 2rem;"></i>
                        <p class="text-muted mt-4">No se encontraron usuarios</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageUsers.map(user => `
                <tr>
                    <td>
                        <div class="flex items-center gap-3">
                            <div class="avatar avatar-sm" style="background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary)); color: white;">
                                ${getInitials(user.firstName, user.lastName)}
                            </div>
                            <div>
                                <div class="font-medium">${user.firstName} ${user.lastName}</div>
                                ${user.emailVerified ? '<span class="text-success text-xs"><i class="fas fa-check-circle"></i> Verificado</span>' : '<span class="text-warning text-xs"><i class="fas fa-clock"></i> No verificado</span>'}
                            </div>
                        </div>
                    </td>
                    <td class="text-muted">${user.email}</td>
                    <td>${getRoleBadge(user.role)}</td>
                    <td>${getStatusBadge(user.status)}</td>
                    <td class="text-muted">${formatDate(user.createdAt)}</td>
                    <td class="text-muted">${formatDate(user.lastLogin)}</td>
                    <td>
                        ${user.ordersCount > 0 ? 
                            `<span class="font-medium">${user.ordersCount}</span> <span class="text-muted text-sm">(${formatCurrency(user.totalSpent)})</span>` : 
                            '<span class="text-muted">-</span>'
                        }
                    </td>
                    <td>
                        <div class="flex gap-2">
                            <button class="btn btn-sm btn-ghost" onclick="viewUser('${user.id}')" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost" onclick="editUser('${user.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost text-error" onclick="confirmDeleteUser('${user.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        // Update pagination info
        document.getElementById('showingCount').textContent = pageUsers.length;
        document.getElementById('totalCount').textContent = state.filteredUsers.length;
        
        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(state.filteredUsers.length / state.perPage);
        const pagination = document.getElementById('pagination');
        
        let html = `
            <button class="pagination-btn" id="prevPage" ${state.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `<button class="pagination-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        if (totalPages > 5) {
            html += `<span class="pagination-ellipsis">...</span>`;
            html += `<button class="pagination-btn ${totalPages === state.currentPage ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        html += `
            <button class="pagination-btn" id="nextPage" ${state.currentPage >= totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = html;
        
        // Add event listeners
        pagination.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentPage = parseInt(btn.dataset.page);
                renderTable();
            });
        });
        
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderTable();
            }
        });
        
        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(state.filteredUsers.length / state.perPage);
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderTable();
            }
        });
    }

    // ================================
    // Modal Functions
    // ================================
    function openUserModal(userId = null) {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const title = document.getElementById('modalTitle');
        const passwordGroup = document.getElementById('passwordGroup');
        
        form.reset();
        state.editingUserId = userId;
        
        if (userId) {
            const user = state.users.find(u => u.id === userId);
            if (user) {
                title.textContent = 'Editar Usuario';
                document.getElementById('userId').value = user.id;
                document.getElementById('userName').value = user.firstName;
                document.getElementById('userLastName').value = user.lastName;
                document.getElementById('userEmail').value = user.email;
                document.getElementById('userRole').value = user.role;
                document.getElementById('userStatus').value = user.status;
                document.getElementById('userPhone').value = user.phone || '';
                document.getElementById('userVerified').checked = user.emailVerified;
                document.getElementById('userPassword').required = false;
                passwordGroup.querySelector('.form-label').textContent = 'Nueva Contraseña';
            }
        } else {
            title.textContent = 'Nuevo Usuario';
            document.getElementById('userPassword').required = true;
            passwordGroup.querySelector('.form-label').textContent = 'Contraseña *';
        }
        
        modal.classList.add('active');
    }

    function closeUserModal() {
        document.getElementById('userModal').classList.remove('active');
        state.editingUserId = null;
    }

    function openDetailsModal(userId) {
        const user = state.users.find(u => u.id === userId);
        if (!user) return;
        
        const modal = document.getElementById('userDetailsModal');
        
        document.getElementById('detailAvatar').textContent = getInitials(user.firstName, user.lastName);
        document.getElementById('detailName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('detailEmail').textContent = user.email;
        document.getElementById('detailRole').innerHTML = getRoleBadge(user.role).replace('user-role-badge', 'user-role-badge');
        document.getElementById('detailStatus').innerHTML = getStatusBadge(user.status);
        document.getElementById('detailPhone').textContent = user.phone || 'No registrado';
        document.getElementById('detailAddress').textContent = user.address || 'No registrada';
        document.getElementById('detailCreated').textContent = formatDateTime(user.createdAt);
        document.getElementById('detailLastLogin').textContent = formatDateTime(user.lastLogin);
        document.getElementById('detailOrderCount').textContent = user.ordersCount;
        document.getElementById('detailTotalSpent').textContent = formatCurrency(user.totalSpent);
        document.getElementById('detailAvgOrder').textContent = user.ordersCount > 0 ? 
            formatCurrency(user.totalSpent / user.ordersCount) : '$0';
        
        document.getElementById('editUserFromDetails').onclick = () => {
            modal.classList.remove('active');
            openUserModal(userId);
        };
        
        modal.classList.add('active');
    }

    function closeDetailsModal() {
        document.getElementById('userDetailsModal').classList.remove('active');
    }

    function openDeleteModal(userId) {
        document.getElementById('deleteUserId').value = userId;
        document.getElementById('deleteModal').classList.add('active');
    }

    function closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
    }

    // ================================
    // Global Functions (for onclick handlers)
    // ================================
    window.viewUser = function(userId) {
        openDetailsModal(userId);
    };

    window.editUser = function(userId) {
        openUserModal(userId);
    };

    window.confirmDeleteUser = function(userId) {
        openDeleteModal(userId);
    };

    // ================================
    // Event Handlers
    // ================================
    function setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
        
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const html = document.documentElement;
            const current = html.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.querySelector('#themeToggle i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
        
        // User dropdown
        document.getElementById('userDropdown')?.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            document.getElementById('userDropdown')?.classList.remove('active');
        });
        
        // Add user button
        document.getElementById('addUserBtn')?.addEventListener('click', () => openUserModal());
        
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                state.currentRole = this.dataset.role;
                applyFilters();
            });
        });
        
        // Search input
        document.getElementById('userSearch')?.addEventListener('input', debounce((e) => {
            state.searchQuery = e.target.value;
            applyFilters();
        }, 300));
        
        // Global search
        document.getElementById('globalSearch')?.addEventListener('input', debounce((e) => {
            state.searchQuery = e.target.value;
            applyFilters();
        }, 300));
        
        // Status filter
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            state.statusFilter = e.target.value;
            applyFilters();
        });
        
        // Sort columns
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', function() {
                const field = this.dataset.sort;
                if (state.sortField === field) {
                    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortField = field;
                    state.sortOrder = 'desc';
                }
                applyFilters();
            });
        });
        
        // Modal events
        document.getElementById('closeModal')?.addEventListener('click', closeUserModal);
        document.getElementById('cancelUser')?.addEventListener('click', closeUserModal);
        document.getElementById('closeDetailsModal')?.addEventListener('click', closeDetailsModal);
        document.getElementById('closeDetailsBtn')?.addEventListener('click', closeDetailsModal);
        document.getElementById('closeDeleteModal')?.addEventListener('click', closeDeleteModal);
        document.getElementById('cancelDelete')?.addEventListener('click', closeDeleteModal);
        
        // Save user
        document.getElementById('saveUser')?.addEventListener('click', async () => {
            const form = document.getElementById('userForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const userData = {
                id: document.getElementById('userId').value || null,
                firstName: document.getElementById('userName').value,
                lastName: document.getElementById('userLastName').value,
                email: document.getElementById('userEmail').value,
                role: document.getElementById('userRole').value,
                status: document.getElementById('userStatus').value,
                phone: document.getElementById('userPhone').value,
                emailVerified: document.getElementById('userVerified').checked
            };
            
            const password = document.getElementById('userPassword').value;
            if (password) {
                userData.password = password;
            }
            
            try {
                await saveUser(userData);
                closeUserModal();
                showToast(userData.id ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente', 'success');
                await loadUsers();
            } catch (error) {
                showToast('Error al guardar el usuario', 'error');
            }
        });
        
        // Confirm delete
        document.getElementById('confirmDelete')?.addEventListener('click', async () => {
            const userId = document.getElementById('deleteUserId').value;
            try {
                await deleteUser(userId);
                closeDeleteModal();
                showToast('Usuario eliminado correctamente', 'success');
                await loadUsers();
            } catch (error) {
                showToast('Error al eliminar el usuario', 'error');
            }
        });
        
        // Export button
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            exportUsers();
        });
        
        // Close modals on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    backdrop.classList.remove('active');
                }
            });
        });
        
        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
            }
        });
    }

    // ================================
    // Utilities
    // ================================
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

    function exportUsers() {
        const headers = ['Nombre', 'Email', 'Rol', 'Estado', 'Registrado', 'Último acceso', 'Pedidos', 'Total gastado'];
        const rows = state.filteredUsers.map(u => [
            `${u.firstName} ${u.lastName}`,
            u.email,
            u.role,
            u.status,
            formatDate(u.createdAt),
            formatDate(u.lastLogin),
            u.ordersCount,
            u.totalSpent
        ]);
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showToast('Exportación completada', 'success');
    }

    // ================================
    // Initialization
    // ================================
    async function loadUsers() {
        state.users = await fetchUsers();
        updateStats();
        updateFilterCounts();
        applyFilters();
    }

    async function init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        setupEventListeners();
        await loadUsers();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
