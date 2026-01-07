/**
 * Dashboard Controller
 * Gestiona la carga de datos y actualización del dashboard
 * Version: 2.0.0
 */

class DashboardController {
    constructor() {
        this.API_BASE = '/api/admin';
        this.refreshInterval = 60000; // 1 minuto
        this.intervalId = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadAllData();
            this.startAutoRefresh();
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        // Botón de refresh manual
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAllData());
        }

        // Detectar visibilidad de la página para pausar/reanudar refresh
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                this.startAutoRefresh();
                this.loadAllData();
            }
        });
    }

    startAutoRefresh() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.loadAllData(), this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    async loadAllData() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.showLoadingState();

        try {
            await Promise.all([
                this.loadStats(),
                this.loadActivity(),
                this.loadServiceStatus()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Error al cargar los datos del dashboard');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
            this.updateLastRefreshTime();
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.API_BASE}/stats`);
            if (!response.ok) throw new Error('Error fetching stats');
            
            const stats = await response.json();
            this.updateStatsUI(stats);
        } catch (error) {
            console.warn('Error loading stats:', error);
            this.updateStatsUI(this.getFallbackStats());
        }
    }

    async loadActivity() {
        try {
            const response = await fetch(`${this.API_BASE}/stats/activity?limit=10`);
            if (!response.ok) throw new Error('Error fetching activity');
            
            const data = await response.json();
            this.updateActivityUI(data.activities);
        } catch (error) {
            console.warn('Error loading activity:', error);
            this.updateActivityUI([]);
        }
    }

    async loadServiceStatus() {
        try {
            const response = await fetch('/api/dashboard/services');
            if (!response.ok) throw new Error('Error fetching services');
            
            const services = await response.json();
            this.updateServicesUI(services);
        } catch (error) {
            console.warn('Error loading services:', error);
        }
    }

    updateStatsUI(stats) {
        // Actualizar las tarjetas de estadísticas
        this.animateValue('stat-products', stats.totalProducts || 0);
        this.animateValue('stat-orders', stats.totalOrders || 0);
        this.animateValue('stat-users', stats.totalUsers || 0);
        this.animateValue('stat-revenue', this.formatCurrency(stats.monthlyRevenue || 0));

        // Actualizar indicadores de cambio
        this.updateChangeIndicator('stat-products-change', stats.productChange, 'vs. mes anterior');
        this.updateChangeIndicator('stat-orders-change', stats.orderChange, 'vs. mes anterior');
        this.updateChangeIndicator('stat-users-change', stats.userChange, 'nuevos esta semana');
        this.updateChangeIndicator('stat-revenue-change', stats.revenueChange, 'vs. mes anterior');

        // Actualizar pedidos pendientes si existe el elemento
        const pendingEl = document.getElementById('stat-pending-orders');
        if (pendingEl) {
            pendingEl.textContent = stats.pendingOrders || 0;
        }

        // Actualizar productos con bajo stock
        const lowStockEl = document.getElementById('stat-low-stock');
        if (lowStockEl) {
            lowStockEl.textContent = stats.lowStockProducts || 0;
        }
    }

    updateActivityUI(activities) {
        const container = document.getElementById('activity-feed');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox empty-state-icon"></i>
                    <p class="empty-state-title">Sin actividad reciente</p>
                    <p class="empty-state-description">La actividad aparecerá aquí cuando haya cambios</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">
                        <strong>${this.escapeHtml(activity.title)}</strong>
                        ${activity.description ? ` - ${this.escapeHtml(activity.description)}` : ''}
                    </p>
                    <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    updateServicesUI(services) {
        const container = document.getElementById('services-status');
        if (!container || !services) return;

        const servicesList = Array.isArray(services) ? services : services.services || [];
        
        container.innerHTML = servicesList.map(service => {
            const statusClass = service.status === 'healthy' ? 'online' : 
                               service.status === 'degraded' ? 'pending' : 'offline';
            return `
                <div class="service-item">
                    <span class="status-badge ${statusClass}">
                        ${service.name}
                    </span>
                    <span class="service-response">${service.responseTime || '-'}ms</span>
                </div>
            `;
        }).join('');
    }

    updateChangeIndicator(elementId, change, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const numChange = parseFloat(change) || 0;
        const isPositive = numChange >= 0;
        const icon = isPositive ? 'arrow-up' : 'arrow-down';
        const className = isPositive ? 'positive' : 'negative';
        
        element.className = `stat-change ${className}`;
        element.innerHTML = `
            <i class="fas fa-${icon}"></i>
            ${Math.abs(numChange)}% ${suffix}
        `;
    }

    animateValue(elementId, endValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const isNumber = typeof endValue === 'number';
        const finalValue = isNumber ? endValue : endValue;
        
        if (isNumber && endValue > 0) {
            // Animación para números
            const duration = 800;
            const startValue = 0;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
                
                element.textContent = currentValue.toLocaleString('es-MX');
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        } else {
            element.textContent = finalValue;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'hace un momento';
        
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);

        const intervals = [
            { label: 'año', seconds: 31536000 },
            { label: 'mes', seconds: 2592000 },
            { label: 'semana', seconds: 604800 },
            { label: 'día', seconds: 86400 },
            { label: 'hora', seconds: 3600 },
            { label: 'minuto', seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `hace ${count} ${interval.label}${count > 1 ? 's' : ''}`;
            }
        }

        return 'hace un momento';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getFallbackStats() {
        return {
            totalProducts: 0,
            totalOrders: 0,
            totalUsers: 0,
            monthlyRevenue: 0,
            pendingOrders: 0,
            lowStockProducts: 0
        };
    }

    showLoadingState() {
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach(card => {
            card.classList.add('loading');
        });
    }

    hideLoadingState() {
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach(card => {
            card.classList.remove('loading');
        });
    }

    updateLastRefreshTime() {
        const element = document.getElementById('last-refresh');
        if (element) {
            element.textContent = `Última actualización: ${new Date().toLocaleTimeString('es-MX')}`;
        }
    }

    showError(message) {
        // Crear toast de error
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}

// Instanciar el controlador
const dashboardController = new DashboardController();

// Exportar para uso global
window.dashboardController = dashboardController;
