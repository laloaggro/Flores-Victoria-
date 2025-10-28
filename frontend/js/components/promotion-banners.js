// 🎨 Promotion Banners Component

class PromotionBanners {
  constructor() {
    this.API_BASE = '/api/promotions';
    this.container = null;
    this.activePromotions = [];
  }

  // Inicializar componente
  async init(containerId = 'promotion-banners') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    await this.loadActivePromotions();
    this.render();
  }

  // Cargar promociones activas
  async loadActivePromotions() {
    try {
      const response = await fetch(`${this.API_BASE}/active`);
      const data = await response.json();
      this.activePromotions = data.promotions || [];
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  }

  // Renderizar banners
  render() {
    if (!this.container || this.activePromotions.length === 0) {
      if (this.container) this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';
    this.container.innerHTML = `
      <div class="promo-banners-wrapper">
        <div class="promo-banners-slider">
          ${this.activePromotions.map((promo, index) => this.renderBanner(promo, index)).join('')}
        </div>
        ${this.activePromotions.length > 1 ? this.renderControls() : ''}
      </div>
    `;

    if (this.activePromotions.length > 1) {
      this.initSlider();
    }
  }

  // Renderizar un banner individual
  renderBanner(promo, index) {
    const icon = this.getPromotionIcon(promo.type);
    const bgColor = this.getPromotionColor(promo.type);
    
    return `
      <div class="promo-banner" data-index="${index}" style="background: ${bgColor}">
        <div class="promo-banner-content">
          <div class="promo-icon">${icon}</div>
          <div class="promo-info">
            <h3 class="promo-title">${promo.name}</h3>
            <p class="promo-desc">${promo.description}</p>
            <div class="promo-code-container">
              <span class="promo-code-label">Código:</span>
              <span class="promo-code-value">${promo.code}</span>
              <button class="copy-code-btn" onclick="promoBanners.copyCode('${promo.code}')">
                📋 Copiar
              </button>
            </div>
          </div>
          <div class="promo-value-badge">
            ${this.getValueBadge(promo)}
          </div>
        </div>
      </div>
    `;
  }

  // Renderizar controles del slider
  renderControls() {
    return `
      <div class="promo-slider-controls">
        <button class="promo-slider-btn prev" onclick="promoBanners.prevSlide()">‹</button>
        <div class="promo-slider-dots"></div>
        <button class="promo-slider-btn next" onclick="promoBanners.nextSlide()">›</button>
      </div>
    `;
  }

  // Obtener icono según tipo
  getPromotionIcon(type) {
    const icons = {
      percentage: '📊',
      fixed: '💰',
      bogo: '🎯',
      free_shipping: '📦'
    };
    return icons[type] || '🎁';
  }

  // Obtener color según tipo
  getPromotionColor(type) {
    const colors = {
      percentage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fixed: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      bogo: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      free_shipping: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    };
    return colors[type] || 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
  }

  // Obtener badge de valor
  getValueBadge(promo) {
    switch (promo.type) {
      case 'percentage':
        return `<div class="value-big">${promo.value}%</div><div class="value-small">DESCUENTO</div>`;
      case 'fixed':
        return `<div class="value-big">$${promo.value.toLocaleString('es-CL')}</div><div class="value-small">OFF</div>`;
      case 'bogo':
        return `<div class="value-big">2x1</div><div class="value-small">COMPRA 1 LLEVA 2</div>`;
      case 'free_shipping':
        return `<div class="value-big">GRATIS</div><div class="value-small">ENVÍO</div>`;
      default:
        return '';
    }
  }

  // Inicializar slider
  initSlider() {
    this.currentSlide = 0;
    this.updateSlider();
    
    // Auto-rotate cada 5 segundos
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  // Actualizar slider
  updateSlider() {
    const banners = this.container.querySelectorAll('.promo-banner');
    banners.forEach((banner, index) => {
      banner.style.display = index === this.currentSlide ? 'block' : 'none';
    });

    // Update dots
    const dotsContainer = this.container.querySelector('.promo-slider-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = this.activePromotions.map((_, index) => 
        `<span class="dot ${index === this.currentSlide ? 'active' : ''}" 
               onclick="promoBanners.goToSlide(${index})"></span>`
      ).join('');
    }
  }

  // Navegación del slider
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.activePromotions.length;
    this.updateSlider();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.activePromotions.length) % this.activePromotions.length;
    this.updateSlider();
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.updateSlider();
  }

  // Copiar código al portapapeles
  copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      this.showCopyNotification('Código copiado: ' + code);
    }).catch(err => {
      console.error('Error copying code:', err);
      // Fallback para navegadores antiguos
      const input = document.createElement('input');
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.showCopyNotification('Código copiado: ' + code);
    });
  }

  // Mostrar notificación de copiado
  showCopyNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #4CAF50;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Destruir componente
  destroy() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Estilos inyectados
const bannerStyles = `
.promo-banners-wrapper {
  position: relative;
  margin: 20px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.promo-banner {
  padding: 30px;
  color: white;
  animation: fadeIn 0.5s ease-out;
}

.promo-banner-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.promo-icon {
  font-size: 64px;
  line-height: 1;
}

.promo-info {
  flex: 1;
}

.promo-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.promo-desc {
  font-size: 16px;
  margin: 0 0 15px 0;
  opacity: 0.95;
}

.promo-code-container {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.promo-code-label {
  font-size: 14px;
  opacity: 0.9;
}

.promo-code-value {
  background: rgba(255,255,255,0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
}

.copy-code-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.4);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.copy-code-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.promo-value-badge {
  text-align: center;
  background: rgba(255,255,255,0.2);
  padding: 20px;
  border-radius: 12px;
  min-width: 150px;
}

.value-big {
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 5px;
}

.value-small {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: 1px;
}

.promo-slider-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.promo-slider-btn {
  background: rgba(255,255,255,0.3);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.promo-slider-btn:hover {
  background: rgba(255,255,255,0.5);
  transform: scale(1.1);
}

.promo-slider-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: white;
  width: 30px;
  border-radius: 5px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .promo-banner {
    padding: 20px;
  }

  .promo-banner-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 15px;
  }

  .promo-icon {
    font-size: 48px;
  }

  .promo-title {
    font-size: 22px;
  }

  .promo-desc {
    font-size: 14px;
  }

  .promo-code-container {
    justify-content: center;
  }

  .value-big {
    font-size: 36px;
  }

  .promo-value-badge {
    min-width: auto;
  }
}
`;

// Inyectar estilos
if (!document.getElementById('promo-banners-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'promo-banners-styles';
  styleSheet.textContent = bannerStyles;
  document.head.appendChild(styleSheet);
}

// Crear instancia global
const promoBanners = new PromotionBanners();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromotionBanners;
}
