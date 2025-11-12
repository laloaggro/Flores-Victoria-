// Admin Navigation Component
// Proporciona navegación consistente para todas las páginas de administración

class AdminHeader extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <header class="admin-header">
                <div class="container">
                    <div class="admin-header-content">
                        <div class="admin-brand">
                            <a href="/admin.html">
                                <img src="/logo.svg" alt="Arreglos Victoria Logo" height="50">
                                <span class="admin-brand-text">Panel Admin</span>
                            </a>
                        </div>
                        
                        <nav class="admin-nav">
                            <ul>
                                <li><a href="/admin.html" class="admin-nav-link" data-page="dashboard"><i class="fas fa-home"></i> Dashboard</a></li>
                                <li><a href="/admin-products.html" class="admin-nav-link" data-page="products"><i class="fas fa-box"></i> Productos</a></li>
                                <li><a href="/admin-orders.html" class="admin-nav-link" data-page="orders"><i class="fas fa-shopping-cart"></i> Pedidos</a></li>
                                <li><a href="/admin-users.html" class="admin-nav-link" data-page="users"><i class="fas fa-users"></i> Usuarios</a></li>
                                <li><a href="/control-center.html" class="admin-nav-link" data-page="services"><i class="fas fa-cog"></i> Servicios</a></li>
                                <li><a href="/monitoring.html" class="admin-nav-link" data-page="monitoring"><i class="fas fa-chart-line"></i> Monitoreo</a></li>
                            </ul>
                        </nav>
                        
                        <div class="admin-header-actions">
                            <button class="theme-toggle" id="admin-theme-toggle" aria-label="Cambiar tema" title="Cambiar tema">
                                <i class="fas fa-moon theme-icon"></i>
                            </button>
                            
                            <div class="admin-user-menu">
                                <button class="admin-user-toggle" aria-label="Menú de usuario">
                                    <i class="fas fa-user-circle"></i>
                                    <span class="admin-user-name" id="adminUserName">Admin</span>
                                </button>
                                <div class="admin-user-dropdown">
                                    <a href="/settings.html"><i class="fas fa-cog"></i> Configuración</a>
                                    <a href="/index.html"><i class="fas fa-store"></i> Ver Sitio</a>
                                    <a href="#" id="adminLogout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                                </div>
                            </div>
                            
                            <button class="admin-menu-toggle" aria-label="Menú móvil">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile menu -->
                <div class="admin-mobile-menu" id="adminMobileMenu">
                    <ul>
                        <li><a href="/admin.html"><i class="fas fa-home"></i> Dashboard</a></li>
                        <li><a href="/admin-products.html"><i class="fas fa-box"></i> Productos</a></li>
                        <li><a href="/admin-orders.html"><i class="fas fa-shopping-cart"></i> Pedidos</a></li>
                        <li><a href="/admin-users.html"><i class="fas fa-users"></i> Usuarios</a></li>
                        <li><a href="/control-center.html"><i class="fas fa-cog"></i> Servicios</a></li>
                        <li><a href="/monitoring.html"><i class="fas fa-chart-line"></i> Monitoreo</a></li>
                        <li><a href="/settings.html"><i class="fas fa-cog"></i> Configuración</a></li>
                        <li><a href="/index.html"><i class="fas fa-store"></i> Ver Sitio</a></li>
                        <li><a href="#" id="adminMobileLogout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a></li>
                    </ul>
                </div>
            </header>
        `;
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = this.querySelector('#admin-theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('admin-theme', newTheme);
                
                const icon = themeToggle.querySelector('.theme-icon');
                icon.className = newTheme === 'light' ? 'fas fa-moon theme-icon' : 'fas fa-sun theme-icon';
            });
        }

        // User menu toggle
        const userToggle = this.querySelector('.admin-user-toggle');
        const userDropdown = this.querySelector('.admin-user-dropdown');
        if (userToggle && userDropdown) {
            userToggle.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }

        // Mobile menu toggle
        const menuToggle = this.querySelector('.admin-menu-toggle');
        const mobileMenu = this.querySelector('#adminMobileMenu');
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('show');
                menuToggle.classList.toggle('active');
            });
        }

        // Logout handlers
        const logoutButtons = this.querySelectorAll('#adminLogout, #adminMobileLogout');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userRole');
                    window.location.href = '/login.html';
                }
            });
        });

        // Highlight active page
        this.highlightActivePage();
        
        // Load user info
        this.loadUserInfo();
    }

    highlightActivePage() {
        const currentPath = window.location.pathname;
        const navLinks = this.querySelectorAll('.admin-nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    loadUserInfo() {
        const userNameElement = this.querySelector('#adminUserName');
        if (userNameElement) {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData.name) {
                userNameElement.textContent = userData.name;
            }
        }
    }
}

// Define the custom element
customElements.define('admin-header', AdminHeader);

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('admin-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});
