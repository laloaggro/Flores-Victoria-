/**
 * WebSocket Notification System
 * Real-time notifications for critical events
 */

class NotificationSystem {
    constructor() {
        this.ws = null;
        this.reconnectInterval = 5000;
        this.maxReconnectAttempts = 10;
        this.reconnectAttempts = 0;
        this.notifications = [];
        this.maxNotifications = 50;
        this.init();
    }

    /**
     * Initialize notification system
     */
    init() {
        this.createNotificationContainer();
        this.loadSavedNotifications();
        this.connect();
        this.setupEventListeners();
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        try {
            // Try to connect to WebSocket server (if available)
            // For now, we'll simulate with polling
            console.log('📡 Notification system initialized');
            this.startPolling();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.startPolling();
        }
    }

    /**
     * Start polling for notifications (fallback)
     */
    startPolling() {
        setInterval(() => {
            this.checkForNotifications();
        }, 30000); // Check every 30 seconds
    }

    /**
     * Check for new notifications
     */
    async checkForNotifications() {
        try {
            // Check MCP server for events
            const response = await fetch('http://localhost:5050/metrics');
            const data = await response.json();
            
            // Check for critical conditions
            if (data.healthyServices < data.totalServices) {
                const downServices = data.totalServices - data.healthyServices;
                this.notify({
                    type: 'warning',
                    title: 'Servicios Degradados',
                    message: `${downServices} servicio(s) no están respondiendo`,
                    timestamp: new Date(),
                    action: {
                        text: 'Ver Detalles',
                        url: '/services/'
                    }
                });
            }

            // Check for high error rates
            if (data.eventsCount > 100) {
                this.notify({
                    type: 'info',
                    title: 'Alta Actividad',
                    message: `${data.eventsCount} eventos registrados en el sistema`,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    }

    /**
     * Create notification container
     */
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';

        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            }

            .notification {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
                display: flex;
                gap: 15px;
                position: relative;
                overflow: hidden;
            }

            [data-theme="dark"] .notification {
                background: var(--card-bg);
                color: var(--text-primary);
            }

            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .notification::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 4px;
                height: 100%;
            }

            .notification.success::before {
                background: #10b981;
            }

            .notification.error::before {
                background: #ef4444;
            }

            .notification.warning::before {
                background: #f59e0b;
            }

            .notification.info::before {
                background: #3b82f6;
            }

            .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }

            .notification.success .notification-icon {
                background: #d1fae5;
                color: #065f46;
            }

            .notification.error .notification-icon {
                background: #fee2e2;
                color: #991b1b;
            }

            .notification.warning .notification-icon {
                background: #fef3c7;
                color: #92400e;
            }

            .notification.info .notification-icon {
                background: #dbeafe;
                color: #1e40af;
            }

            [data-theme="dark"] .notification.success .notification-icon {
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
            }

            [data-theme="dark"] .notification.error .notification-icon {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }

            [data-theme="dark"] .notification.warning .notification-icon {
                background: rgba(245, 158, 11, 0.2);
                color: #f59e0b;
            }

            [data-theme="dark"] .notification.info .notification-icon {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
            }

            .notification-content {
                flex: 1;
            }

            .notification-title {
                font-weight: 600;
                margin-bottom: 5px;
                font-size: 15px;
            }

            .notification-message {
                color: #666;
                font-size: 14px;
                margin-bottom: 8px;
            }

            [data-theme="dark"] .notification-message {
                color: var(--text-secondary);
            }

            .notification-time {
                font-size: 12px;
                color: #999;
            }

            .notification-action {
                display: inline-block;
                padding: 6px 12px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 6px;
                text-decoration: none;
                font-size: 13px;
                margin-top: 10px;
                transition: all 0.3s ease;
            }

            .notification-action:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }

            .notification-close {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: transparent;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #999;
                transition: all 0.3s ease;
            }

            .notification-close:hover {
                background: #f3f4f6;
                color: #333;
            }

            [data-theme="dark"] .notification-close:hover {
                background: var(--light);
                color: var(--text-primary);
            }

            @media (max-width: 768px) {
                .notification-container {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }

                .notification {
                    padding: 15px;
                }
            }

            /* Notification Bell Button */
            .notification-bell {
                position: fixed;
                bottom: 90px;
                right: 80px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--card-bg);
                border: 2px solid var(--border-color);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
                box-shadow: var(--shadow);
                z-index: 9997;
                position: relative;
            }

            .notification-bell:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-lg);
            }

            .notification-bell i {
                color: var(--text-primary);
            }

            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                border: 2px solid var(--card-bg);
            }

            @media (max-width: 768px) {
                .notification-bell {
                    bottom: 150px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(container);
        this.createBellButton();
    }

    /**
     * Create notification bell button
     */
    createBellButton() {
        const button = document.createElement('button');
        button.id = 'notificationBell';
        button.className = 'notification-bell';
        button.setAttribute('aria-label', 'Notifications');
        button.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
        `;

        button.addEventListener('click', () => {
            this.showNotificationHistory();
        });

        document.body.appendChild(button);
    }

    /**
     * Show notification
     * @param {Object} notification 
     */
    notify(notification) {
        const {
            type = 'info',
            title,
            message,
            timestamp = new Date(),
            action = null,
            duration = 5000
        } = notification;

        // Add to notifications array
        this.notifications.unshift({
            id: Date.now(),
            type,
            title,
            message,
            timestamp,
            action,
            read: false
        });

        // Limit notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }

        // Save to localStorage
        this.saveNotifications();
        this.updateBadge();

        // Create notification element
        const container = document.getElementById('notificationContainer');
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notif.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
                <div class="notification-time">${this.formatTime(timestamp)}</div>
                ${action ? `<a href="${action.url}" class="notification-action">${action.text}</a>` : ''}
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close handler
        notif.querySelector('.notification-close').addEventListener('click', () => {
            notif.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notif.remove();
            }, 300);
        });

        container.appendChild(notif);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notif.parentElement) {
                    notif.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        notif.remove();
                    }, 300);
                }
            }, duration);
        }

        // Play notification sound
        this.playNotificationSound();
    }

    /**
     * Format timestamp
     * @param {Date} timestamp 
     * @returns {string}
     */
    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        if (diff < 60000) {
            return 'Hace un momento';
        } else if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `Hace ${mins} minuto${mins > 1 ? 's' : ''}`;
        } else if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        } else {
            return timestamp.toLocaleDateString('es-ES');
        }
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        // Simple beep sound (can be replaced with actual audio file)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    /**
     * Update badge count
     */
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        const unread = this.notifications.filter(n => !n.read).length;
        
        if (unread > 0) {
            badge.textContent = unread > 99 ? '99+' : unread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Show notification history
     */
    showNotificationHistory() {
        alert(`Historial de Notificaciones\n\nTotal: ${this.notifications.length}\nNo leídas: ${this.notifications.filter(n => !n.read).length}`);
        
        // Mark all as read
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateBadge();
    }

    /**
     * Save notifications to localStorage
     */
    saveNotifications() {
        try {
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }

    /**
     * Load saved notifications
     */
    loadSavedNotifications() {
        try {
            const saved = localStorage.getItem('notifications');
            if (saved) {
                this.notifications = JSON.parse(saved);
                this.updateBadge();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for custom notification events
        window.addEventListener('notification', (e) => {
            this.notify(e.detail);
        });
    }
}

// Add slideOut animation
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(slideOutStyle);

// Create and export notification system instance
const notificationSystem = new NotificationSystem();

// Make it globally available
if (typeof window !== 'undefined') {
    window.notificationSystem = notificationSystem;
    
    // Helper function to send notifications
    window.notify = (notification) => {
        notificationSystem.notify(notification);
    };
}

// Example notifications on page load (for testing)
setTimeout(() => {
    notificationSystem.notify({
        type: 'success',
        title: '¡Bienvenido!',
        message: 'Sistema de notificaciones en tiempo real activado',
        duration: 4000
    });
}, 2000);
