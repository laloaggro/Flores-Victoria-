/**
 * Toast Notification System
 * Sistema de notificaciones reutilizable para todo el sitio
 */

class ToastNotification {
    constructor(options = {}) {
        this.container = null;
        this.defaultOptions = {
            duration: 3000,
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
            maxToasts: 3,
            animation: 'slide', // slide, fade, bounce
            pauseOnHover: true,
            closeButton: true,
            progressBar: true
        };
        this.options = { ...this.defaultOptions, ...options };
        this.toasts = [];
        this.init();
    }

    init() {
        if (!this.container) {
            this.createContainer();
        }
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = `toast-container toast-${this.options.position}`;
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', customOptions = {}) {
        const toastOptions = { ...this.options, ...customOptions };
        
        // Limitar número de toasts
        if (this.toasts.length >= this.options.maxToasts) {
            this.remove(this.toasts[0]);
        }

        const toast = this.createToast(message, type, toastOptions);
        this.toasts.push(toast);
        this.container.appendChild(toast.element);

        // Trigger reflow para animación
        toast.element.offsetHeight;
        toast.element.classList.add('toast-show');

        // Auto-remove
        if (toastOptions.duration > 0) {
            toast.timeout = setTimeout(() => {
                this.remove(toast);
            }, toastOptions.duration);
        }

        return toast;
    }

    createToast(message, type, options) {
        const toast = {
            id: Date.now() + Math.random(),
            element: null,
            timeout: null,
            progressInterval: null
        };

        const toastEl = document.createElement('div');
        toastEl.className = `toast toast-${type} toast-${options.animation}`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');

        // Icon
        const icon = this.getIcon(type);
        
        // Content
        const content = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            ${options.closeButton ? '<button class="toast-close" aria-label="Cerrar notificación">&times;</button>' : ''}
            ${options.progressBar ? '<div class="toast-progress"><div class="toast-progress-bar"></div></div>' : ''}
        `;

        toastEl.innerHTML = content;
        toast.element = toastEl;

        // Event listeners
        if (options.closeButton) {
            const closeBtn = toastEl.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.remove(toast));
        }

        if (options.pauseOnHover && options.duration > 0) {
            toastEl.addEventListener('mouseenter', () => {
                clearTimeout(toast.timeout);
                if (toast.progressInterval) {
                    clearInterval(toast.progressInterval);
                }
            });

            toastEl.addEventListener('mouseleave', () => {
                const remaining = options.duration - (Date.now() - toast.startTime);
                if (remaining > 0) {
                    toast.timeout = setTimeout(() => this.remove(toast), remaining);
                }
            });
        }

        // Progress bar animation
        if (options.progressBar && options.duration > 0) {
            const progressBar = toastEl.querySelector('.toast-progress-bar');
            let progress = 0;
            toast.startTime = Date.now();
            
            toast.progressInterval = setInterval(() => {
                progress += 10;
                const percentage = Math.min((progress / options.duration) * 100, 100);
                progressBar.style.width = `${100 - percentage}%`;
                
                if (percentage >= 100) {
                    clearInterval(toast.progressInterval);
                }
            }, 10);
        }

        return toast;
    }

    remove(toast) {
        if (!toast || !toast.element) return;

        toast.element.classList.remove('toast-show');
        toast.element.classList.add('toast-hide');

        clearTimeout(toast.timeout);
        if (toast.progressInterval) {
            clearInterval(toast.progressInterval);
        }

        setTimeout(() => {
            if (toast.element && toast.element.parentNode) {
                toast.element.parentNode.removeChild(toast.element);
            }
            this.toasts = this.toasts.filter(t => t.id !== toast.id);
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    // Métodos de conveniencia
    success(message, options) {
        return this.show(message, 'success', options);
    }

    error(message, options) {
        return this.show(message, 'error', options);
    }

    warning(message, options) {
        return this.show(message, 'warning', options);
    }

    info(message, options) {
        return this.show(message, 'info', options);
    }

    // Limpiar todas las notificaciones
    clear() {
        this.toasts.forEach(toast => this.remove(toast));
    }
}

// Instancia global
window.Toast = new ToastNotification({
    position: 'top-right',
    duration: 3000,
    maxToasts: 3
});

// Ejemplos de uso:
// Toast.success('¡Producto agregado al carrito!');
// Toast.error('Error al procesar el pago');
// Toast.warning('Stock limitado');
// Toast.info('Envío gratis en compras sobre $50.000');

export default ToastNotification;
