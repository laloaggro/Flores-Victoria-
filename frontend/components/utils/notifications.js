// notifications.js - Sistema de notificaciones

class NotificationManager extends HTMLElement {
  constructor() {
    super();
    this.notifications = [];
    this.maxNotifications = 5;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
            <div class="notifications-container">
                <div class="notifications-list"></div>
            </div>
        `;
  }

  // Mostrar una notificación
  show(message, type = 'info', duration = 5000) {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration,
    };

    this.notifications.push(notification);
    this.renderNotification(notification);

    // Limitar el número de notificaciones
    if (this.notifications.length > this.maxNotifications) {
      const oldest = this.notifications.shift();
      this.removeNotification(oldest.id);
    }

    // Auto eliminar después de la duración
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }

    return id;
  }

  // Renderizar una notificación
  renderNotification(notification) {
    const container = this.querySelector('.notifications-list');
    if (!container) return;

    const notificationElement = document.createElement('div');
    notificationElement.className = `notification notification-${notification.type}`;
    notificationElement.setAttribute('data-id', notification.id);

    notificationElement.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${notification.message}</span>
                <button class="notification-close" aria-label="Cerrar notificación">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-progress">
                <div class="notification-progress-bar"></div>
            </div>
        `;

    container.appendChild(notificationElement);

    // Iniciar animación de progreso
    if (notification.duration > 0) {
      const progressBar = notificationElement.querySelector('.notification-progress-bar');
      progressBar.style.animation = `progress ${notification.duration}ms linear`;
    }

    // Añadir evento para cerrar
    const closeBtn = notificationElement.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification.id);
    });

    // Añadir clase para animación de entrada
    setTimeout(() => {
      notificationElement.classList.add('show');
    }, 10);
  }

  // Remover una notificación
  removeNotification(id) {
    const notificationElement = this.querySelector(`[data-id="${id}"]`);
    if (notificationElement) {
      notificationElement.classList.remove('show');
      setTimeout(() => {
        notificationElement.remove();
        this.notifications = this.notifications.filter((n) => n.id !== id);
      }, 300);
    }
  }

  // Limpiar todas las notificaciones
  clearAll() {
    const container = this.querySelector('.notifications-list');
    if (container) {
      container.innerHTML = '';
      this.notifications = [];
    }
  }
}

// Definir el elemento personalizado
customElements.define('notification-manager', NotificationManager);

// Crear una instancia global del manejador de notificaciones
const notificationManager = new NotificationManager();
document.body.appendChild(notificationManager);

// Funciones de utilidad para mostrar diferentes tipos de notificaciones
export function showNotification(message, options = {}) {
  const { type = 'info', duration = 5000, persistent = false } = options;

  return notificationManager.show(message, type, persistent ? 0 : duration);
}

export function showSuccess(message, duration = 5000) {
  return notificationManager.show(message, 'success', duration);
}

export function showError(message, duration = 5000) {
  return notificationManager.show(message, 'error', duration);
}

export function showWarning(message, duration = 5000) {
  return notificationManager.show(message, 'warning', duration);
}

export function showInfo(message, duration = 5000) {
  return notificationManager.show(message, 'info', duration);
}

export function clearNotifications() {
  notificationManager.clearAll();
}

// Añadir estilos para las notificaciones
const style = document.createElement('style');
style.textContent = `
    .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        width: 350px;
        max-width: calc(100vw - 40px);
    }

    .notification {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 10px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        overflow: hidden;
        border-left: 4px solid #4CAF50;
    }

    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }

    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 15px;
    }

    .notification-message {
        flex: 1;
        font-size: 14px;
        color: #333;
        line-height: 1.4;
    }

    .notification-close {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .notification-close:hover {
        background: #f5f5f5;
        color: #666;
    }

    .notification-progress {
        height: 3px;
        background: #f0f0f0;
        overflow: hidden;
    }

    .notification-progress-bar {
        height: 100%;
        background: #4CAF50;
        width: 100%;
        transform: scaleX(0);
        transform-origin: left;
    }

    @keyframes progress {
        from {
            transform: scaleX(1);
        }
        to {
            transform: scaleX(0);
        }
    }

    .notification-success {
        border-left-color: #4CAF50;
    }

    .notification-success .notification-progress-bar {
        background: #4CAF50;
    }

    .notification-error {
        border-left-color: #F44336;
    }

    .notification-error .notification-progress-bar {
        background: #F44336;
    }

    .notification-warning {
        border-left-color: #FF9800;
    }

    .notification-warning .notification-progress-bar {
        background: #FF9800;
    }

    .notification-info {
        border-left-color: #2196F3;
    }

    .notification-info .notification-progress-bar {
        background: #2196F3;
    }

    @media (max-width: 768px) {
        .notifications-container {
            width: calc(100vw - 40px);
            right: 20px;
            left: 20px;
        }
    }
`;

document.head.appendChild(style);
