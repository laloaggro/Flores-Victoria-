/**
 * Coupon & Loyalty Widget - Flores Victoria
 * Componentes reutilizables para cupones y puntos de fidelidad en el frontend
 * 
 * Uso:
 * 1. Incluir este script en la página
 * 2. Llamar a CouponWidget.init() o LoyaltyWidget.init()
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_CONFIG = {
    baseUrl: window.API_BASE_URL || 'http://localhost:3000/api',
    promotionService: '/promotions',
    loyaltyService: '/loyalty'
};

// ============================================================================
// WIDGET DE CUPONES
// ============================================================================

const CouponWidget = {
    container: null,
    appliedCoupon: null,
    originalTotal: 0,

    /**
     * Inicializar widget de cupones
     * @param {Object} options - Configuración
     * @param {string} options.containerId - ID del contenedor
     * @param {number} options.cartTotal - Total del carrito
     * @param {Function} options.onApply - Callback cuando se aplica cupón
     * @param {Function} options.onRemove - Callback cuando se quita cupón
     */
    init(options = {}) {
        this.containerId = options.containerId || 'coupon-widget';
        this.originalTotal = options.cartTotal || 0;
        this.onApply = options.onApply || (() => {});
        this.onRemove = options.onRemove || (() => {});
        
        this.render();
        this.attachEvents();
    },

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container #${this.containerId} not found`);
            return;
        }

        container.innerHTML = `
            <div class="coupon-widget">
                <div class="coupon-header">
                    <i class="fas fa-ticket-alt"></i>
                    <span>¿Tienes un cupón?</span>
                </div>
                
                <div class="coupon-input-group" id="coupon-input-group">
                    <input type="text" 
                           id="coupon-code-input" 
                           placeholder="Ingresa tu código"
                           maxlength="20"
                           autocomplete="off">
                    <button type="button" id="apply-coupon-btn" class="btn-apply">
                        Aplicar
                    </button>
                </div>
                
                <div class="coupon-message" id="coupon-message" style="display: none;">
                    <!-- Mensaje de éxito/error -->
                </div>
                
                <div class="coupon-applied" id="coupon-applied" style="display: none;">
                    <div class="applied-info">
                        <span class="applied-code"></span>
                        <span class="applied-discount"></span>
                    </div>
                    <button type="button" id="remove-coupon-btn" class="btn-remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="available-coupons" id="available-coupons" style="display: none;">
                    <div class="available-header">
                        <i class="fas fa-tags"></i> Cupones disponibles
                    </div>
                    <div class="available-list" id="available-coupons-list">
                        <!-- Lista de cupones disponibles -->
                    </div>
                </div>
            </div>
            
            <style>
                .coupon-widget {
                    padding: 15px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: #f9fafb;
                    margin: 15px 0;
                }
                
                .coupon-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                    font-weight: 600;
                    color: #374151;
                }
                
                .coupon-header i {
                    color: #667eea;
                }
                
                .coupon-input-group {
                    display: flex;
                    gap: 8px;
                }
                
                .coupon-input-group input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                
                .coupon-input-group input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                
                .btn-apply {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-apply:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                
                .btn-apply:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .coupon-message {
                    margin-top: 10px;
                    padding: 10px;
                    border-radius: 8px;
                    font-size: 14px;
                }
                
                .coupon-message.success {
                    background: #d1fae5;
                    color: #065f46;
                }
                
                .coupon-message.error {
                    background: #fee2e2;
                    color: #991b1b;
                }
                
                .coupon-applied {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: #d1fae5;
                    border-radius: 8px;
                    margin-top: 10px;
                }
                
                .applied-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .applied-code {
                    font-weight: 700;
                    color: #065f46;
                }
                
                .applied-discount {
                    font-size: 13px;
                    color: #047857;
                }
                
                .btn-remove {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: #fecaca;
                    color: #991b1b;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .btn-remove:hover {
                    background: #fca5a5;
                }
                
                .available-coupons {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px dashed #d1d5db;
                }
                
                .available-header {
                    font-size: 13px;
                    color: #6b7280;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .available-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .available-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background: white;
                    border-radius: 8px;
                    border: 1px dashed #d1d5db;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .available-item:hover {
                    border-color: #667eea;
                    background: #f5f3ff;
                }
                
                .available-item-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .available-item-code {
                    font-weight: 600;
                    color: #374151;
                }
                
                .available-item-desc {
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .available-item-value {
                    font-weight: 700;
                    color: #667eea;
                }
            </style>
        `;
        
        this.container = container;
    },

    attachEvents() {
        const applyBtn = document.getElementById('apply-coupon-btn');
        const removeBtn = document.getElementById('remove-coupon-btn');
        const input = document.getElementById('coupon-code-input');

        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyCoupon());
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeCoupon());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyCoupon();
                }
            });
        }
    },

    async applyCoupon() {
        const input = document.getElementById('coupon-code-input');
        const code = input.value.trim().toUpperCase();
        
        if (!code) {
            this.showMessage('Ingresa un código de cupón', 'error');
            return;
        }

        const applyBtn = document.getElementById('apply-coupon-btn');
        applyBtn.disabled = true;
        applyBtn.textContent = 'Validando...';

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.promotionService}/coupons/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    code,
                    orderTotal: this.originalTotal
                })
            });

            const result = await response.json();

            if (result.success && result.data.valid) {
                this.appliedCoupon = result.data;
                this.showAppliedCoupon(result.data);
                this.onApply(result.data);
            } else {
                this.showMessage(result.data?.message || 'Cupón no válido', 'error');
            }
        } catch (error) {
            console.error('Error validando cupón:', error);
            this.showMessage('Error al validar cupón', 'error');
        } finally {
            applyBtn.disabled = false;
            applyBtn.textContent = 'Aplicar';
        }
    },

    removeCoupon() {
        this.appliedCoupon = null;
        
        document.getElementById('coupon-input-group').style.display = 'flex';
        document.getElementById('coupon-applied').style.display = 'none';
        document.getElementById('coupon-code-input').value = '';
        
        this.hideMessage();
        this.onRemove();
    },

    showAppliedCoupon(coupon) {
        document.getElementById('coupon-input-group').style.display = 'none';
        
        const appliedDiv = document.getElementById('coupon-applied');
        appliedDiv.style.display = 'flex';
        appliedDiv.querySelector('.applied-code').textContent = coupon.code;
        appliedDiv.querySelector('.applied-discount').textContent = this.formatDiscount(coupon);
        
        this.hideMessage();
    },

    showMessage(text, type) {
        const messageDiv = document.getElementById('coupon-message');
        messageDiv.textContent = text;
        messageDiv.className = `coupon-message ${type}`;
        messageDiv.style.display = 'block';
    },

    hideMessage() {
        document.getElementById('coupon-message').style.display = 'none';
    },

    formatDiscount(coupon) {
        switch (coupon.discountType) {
            case 'percentage':
                return `-${coupon.discountValue}% de descuento`;
            case 'fixed_amount':
                return `-$${coupon.discountValue.toLocaleString('es-CL')} CLP`;
            case 'free_shipping':
                return 'Envío gratis';
            default:
                return 'Descuento aplicado';
        }
    },

    async loadAvailableCoupons(userId) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.promotionService}/coupons/available?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                this.renderAvailableCoupons(result.data);
            }
        } catch (error) {
            console.error('Error cargando cupones disponibles:', error);
        }
    },

    renderAvailableCoupons(coupons) {
        const container = document.getElementById('available-coupons');
        const list = document.getElementById('available-coupons-list');
        
        list.innerHTML = coupons.map(coupon => `
            <div class="available-item" data-code="${coupon.code}" onclick="CouponWidget.selectCoupon('${coupon.code}')">
                <div class="available-item-info">
                    <span class="available-item-code">${coupon.code}</span>
                    <span class="available-item-desc">${coupon.description}</span>
                </div>
                <span class="available-item-value">${this.formatDiscount(coupon)}</span>
            </div>
        `).join('');
        
        container.style.display = 'block';
    },

    selectCoupon(code) {
        document.getElementById('coupon-code-input').value = code;
        this.applyCoupon();
    },

    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    },

    updateCartTotal(newTotal) {
        this.originalTotal = newTotal;
    }
};

// ============================================================================
// WIDGET DE PUNTOS DE FIDELIDAD
// ============================================================================

const LoyaltyWidget = {
    container: null,
    userAccount: null,
    pointsToRedeem: 0,

    /**
     * Inicializar widget de fidelidad
     * @param {Object} options - Configuración
     * @param {string} options.containerId - ID del contenedor
     * @param {number} options.cartTotal - Total del carrito
     * @param {Function} options.onRedeem - Callback cuando se canjean puntos
     */
    init(options = {}) {
        this.containerId = options.containerId || 'loyalty-widget';
        this.cartTotal = options.cartTotal || 0;
        this.onRedeem = options.onRedeem || (() => {});
        
        this.loadUserAccount();
    },

    async loadUserAccount() {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.loyaltyService}/account`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.userAccount = result.data;
                this.render();
                this.attachEvents();
            }
        } catch (error) {
            console.error('Error cargando cuenta de lealtad:', error);
        }
    },

    render() {
        const container = document.getElementById(this.containerId);
        if (!container || !this.userAccount) return;

        const { tier, currentPoints, tierInfo } = this.userAccount;
        const maxRedeemable = Math.min(currentPoints, Math.floor(this.cartTotal / 10));
        const tierColors = {
            bronze: '#CD7F32',
            silver: '#C0C0C0',
            gold: '#FFD700',
            platinum: '#E5E4E2'
        };
        const tierEmojis = {
            bronze: '🥉',
            silver: '🥈',
            gold: '🥇',
            platinum: '💎'
        };

        container.innerHTML = `
            <div class="loyalty-widget">
                <div class="loyalty-header">
                    <div class="loyalty-tier" style="background: ${tierColors[tier]}">
                        <span class="tier-emoji">${tierEmojis[tier]}</span>
                        <span class="tier-name">${tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
                    </div>
                    <div class="loyalty-points">
                        <span class="points-value">${currentPoints.toLocaleString('es-CL')}</span>
                        <span class="points-label">puntos</span>
                    </div>
                </div>
                
                ${tierInfo.discount > 0 ? `
                <div class="loyalty-benefit tier-discount">
                    <i class="fas fa-check-circle"></i>
                    <span>Descuento ${tierInfo.discount}% por ser ${tier}</span>
                </div>
                ` : ''}
                
                ${tierInfo.freeShipping ? `
                <div class="loyalty-benefit free-shipping">
                    <i class="fas fa-truck"></i>
                    <span>Envío gratis incluido</span>
                </div>
                ` : ''}
                
                ${currentPoints >= 100 ? `
                <div class="loyalty-redeem">
                    <div class="redeem-header">
                        <i class="fas fa-gift"></i>
                        <span>Canjear puntos</span>
                    </div>
                    <div class="redeem-slider-group">
                        <input type="range" 
                               id="points-slider" 
                               min="0" 
                               max="${maxRedeemable}"
                               step="100"
                               value="0">
                        <div class="redeem-values">
                            <span class="redeem-points" id="redeem-points">0 puntos</span>
                            <span class="redeem-value" id="redeem-value">-$0</span>
                        </div>
                    </div>
                    <button type="button" id="redeem-points-btn" class="btn-redeem" disabled>
                        Canjear puntos
                    </button>
                </div>
                ` : `
                <div class="loyalty-info">
                    <i class="fas fa-info-circle"></i>
                    <span>Necesitas al menos 100 puntos para canjear</span>
                </div>
                `}
                
                <div class="loyalty-earn">
                    <i class="fas fa-coins"></i>
                    <span>Ganarás <strong>${this.calculatePointsToEarn()}</strong> puntos con esta compra</span>
                </div>
            </div>
            
            <style>
                .loyalty-widget {
                    padding: 15px;
                    border: 1px solid #fde68a;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #fffbeb, #fef3c7);
                    margin: 15px 0;
                }
                
                .loyalty-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .loyalty-tier {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 15px;
                    border-radius: 20px;
                    color: #333;
                    font-weight: 600;
                }
                
                .tier-emoji {
                    font-size: 1.2em;
                }
                
                .loyalty-points {
                    text-align: right;
                }
                
                .points-value {
                    font-size: 1.5em;
                    font-weight: 700;
                    color: #92400e;
                }
                
                .points-label {
                    display: block;
                    font-size: 12px;
                    color: #b45309;
                }
                
                .loyalty-benefit {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    background: rgba(255,255,255,0.7);
                    border-radius: 8px;
                    margin-bottom: 10px;
                    font-size: 14px;
                    color: #065f46;
                }
                
                .loyalty-benefit i {
                    color: #10b981;
                }
                
                .loyalty-redeem {
                    padding: 15px;
                    background: white;
                    border-radius: 10px;
                    margin: 15px 0;
                }
                
                .redeem-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: #92400e;
                    margin-bottom: 12px;
                }
                
                .redeem-slider-group {
                    margin-bottom: 12px;
                }
                
                #points-slider {
                    width: 100%;
                    height: 8px;
                    -webkit-appearance: none;
                    background: #e5e7eb;
                    border-radius: 4px;
                    outline: none;
                }
                
                #points-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #f59e0b;
                    border-radius: 50%;
                    cursor: pointer;
                }
                
                .redeem-values {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                }
                
                .redeem-points {
                    font-size: 14px;
                    color: #6b7280;
                }
                
                .redeem-value {
                    font-weight: 700;
                    color: #059669;
                }
                
                .btn-redeem {
                    width: 100%;
                    padding: 10px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-redeem:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }
                
                .btn-redeem:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .loyalty-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    background: rgba(255,255,255,0.5);
                    border-radius: 8px;
                    font-size: 13px;
                    color: #92400e;
                }
                
                .loyalty-earn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    background: white;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #374151;
                }
                
                .loyalty-earn i {
                    color: #f59e0b;
                }
            </style>
        `;
        
        this.container = container;
    },

    attachEvents() {
        const slider = document.getElementById('points-slider');
        const redeemBtn = document.getElementById('redeem-points-btn');

        if (slider) {
            slider.addEventListener('input', (e) => {
                const points = parseInt(e.target.value);
                this.updateRedeemPreview(points);
            });
        }

        if (redeemBtn) {
            redeemBtn.addEventListener('click', () => this.redeemPoints());
        }
    },

    updateRedeemPreview(points) {
        this.pointsToRedeem = points;
        const value = points * 10; // $10 CLP por punto
        
        document.getElementById('redeem-points').textContent = `${points.toLocaleString('es-CL')} puntos`;
        document.getElementById('redeem-value').textContent = `-$${value.toLocaleString('es-CL')}`;
        
        const redeemBtn = document.getElementById('redeem-points-btn');
        redeemBtn.disabled = points === 0;
    },

    async redeemPoints() {
        if (this.pointsToRedeem === 0) return;

        const redeemBtn = document.getElementById('redeem-points-btn');
        redeemBtn.disabled = true;
        redeemBtn.textContent = 'Procesando...';

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.loyaltyService}/redeem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    points: this.pointsToRedeem,
                    type: 'discount'
                })
            });

            const result = await response.json();

            if (result.success) {
                this.onRedeem({
                    points: this.pointsToRedeem,
                    discountValue: this.pointsToRedeem * 10
                });
                
                // Actualizar UI
                this.userAccount.currentPoints -= this.pointsToRedeem;
                this.render();
                this.attachEvents();
            } else {
                alert(result.error || 'Error al canjear puntos');
            }
        } catch (error) {
            console.error('Error canjeando puntos:', error);
            alert('Error al canjear puntos');
        } finally {
            redeemBtn.textContent = 'Canjear puntos';
        }
    },

    calculatePointsToEarn() {
        if (!this.userAccount) return 0;
        
        const basePoints = Math.floor(this.cartTotal / 1000); // 1 punto por $1,000
        const multiplier = this.userAccount.tierInfo.multiplier || 1;
        
        return Math.floor(basePoints * multiplier);
    },

    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    },

    updateCartTotal(newTotal) {
        this.cartTotal = newTotal;
        if (this.userAccount) {
            this.render();
            this.attachEvents();
        }
    }
};

// ============================================================================
// WIDGET DE RESEÑAS
// ============================================================================

const ReviewWidget = {
    container: null,
    productId: null,
    orderId: null,

    /**
     * Inicializar formulario de reseña
     * @param {Object} options - Configuración
     * @param {string} options.containerId - ID del contenedor
     * @param {string} options.productId - ID del producto
     * @param {string} options.orderId - ID del pedido
     * @param {Function} options.onSubmit - Callback al enviar
     */
    init(options = {}) {
        this.containerId = options.containerId || 'review-widget';
        this.productId = options.productId;
        this.orderId = options.orderId;
        this.onSubmit = options.onSubmit || (() => {});
        
        this.render();
        this.attachEvents();
    },

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="review-form-widget">
                <h3 class="review-form-title">
                    <i class="fas fa-star"></i>
                    Deja tu reseña
                </h3>
                
                <div class="review-rating-select">
                    <span class="rating-label">Tu calificación:</span>
                    <div class="star-rating" id="star-rating">
                        ${[1,2,3,4,5].map(i => `
                            <span class="star" data-rating="${i}">
                                <i class="far fa-star"></i>
                            </span>
                        `).join('')}
                    </div>
                    <input type="hidden" id="review-rating" value="0">
                </div>
                
                <div class="review-form-group">
                    <label for="review-title">Título (opcional)</label>
                    <input type="text" id="review-title" placeholder="Resume tu experiencia" maxlength="100">
                </div>
                
                <div class="review-form-group">
                    <label for="review-comment">Tu comentario</label>
                    <textarea id="review-comment" 
                              placeholder="Cuéntanos sobre tu experiencia con este producto..."
                              rows="4"
                              minlength="10"
                              maxlength="2000"></textarea>
                    <span class="char-count"><span id="char-count">0</span>/2000</span>
                </div>
                
                <div class="review-form-group">
                    <label>Fotos (opcional, máx. 5)</label>
                    <div class="photo-upload-area" id="photo-upload-area">
                        <input type="file" id="review-photos" accept="image/*" multiple hidden>
                        <div class="photo-preview" id="photo-preview"></div>
                        <button type="button" class="btn-add-photo" id="add-photo-btn">
                            <i class="fas fa-camera"></i>
                            Agregar fotos
                        </button>
                    </div>
                </div>
                
                <button type="button" id="submit-review-btn" class="btn-submit-review" disabled>
                    <i class="fas fa-paper-plane"></i>
                    Enviar reseña
                </button>
                
                <p class="review-note">
                    <i class="fas fa-info-circle"></i>
                    Tu reseña será revisada antes de publicarse. Ganarás <strong>100 puntos</strong> de fidelidad.
                </p>
            </div>
            
            <style>
                .review-form-widget {
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                
                .review-form-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #374151;
                    margin-bottom: 20px;
                }
                
                .review-form-title i {
                    color: #f59e0b;
                }
                
                .review-rating-select {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .rating-label {
                    color: #6b7280;
                }
                
                .star-rating {
                    display: flex;
                    gap: 5px;
                }
                
                .star-rating .star {
                    font-size: 1.8em;
                    cursor: pointer;
                    color: #d1d5db;
                    transition: all 0.2s ease;
                }
                
                .star-rating .star:hover,
                .star-rating .star.active {
                    color: #f59e0b;
                }
                
                .star-rating .star.active i {
                    font-weight: 900;
                }
                
                .review-form-group {
                    margin-bottom: 15px;
                }
                
                .review-form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #374151;
                }
                
                .review-form-group input,
                .review-form-group textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: inherit;
                }
                
                .review-form-group input:focus,
                .review-form-group textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                
                .char-count {
                    display: block;
                    text-align: right;
                    font-size: 12px;
                    color: #9ca3af;
                    margin-top: 5px;
                }
                
                .photo-upload-area {
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                }
                
                .photo-preview {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-bottom: 10px;
                }
                
                .photo-preview img {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 8px;
                }
                
                .btn-add-photo {
                    padding: 10px 20px;
                    background: #f3f4f6;
                    border: none;
                    border-radius: 8px;
                    color: #374151;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .btn-add-photo:hover {
                    background: #e5e7eb;
                }
                
                .btn-submit-review {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    margin-top: 20px;
                }
                
                .btn-submit-review:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
                }
                
                .btn-submit-review:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .review-note {
                    margin-top: 15px;
                    padding: 10px;
                    background: #f9fafb;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .review-note i {
                    color: #667eea;
                }
            </style>
        `;

        this.container = container;
    },

    attachEvents() {
        // Star rating
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.currentTarget.dataset.rating);
                this.setRating(rating);
            });
            
            star.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.currentTarget.dataset.rating);
                this.highlightStars(rating);
            });
        });

        const starContainer = document.querySelector('.star-rating');
        starContainer.addEventListener('mouseleave', () => {
            const currentRating = parseInt(document.getElementById('review-rating').value);
            this.highlightStars(currentRating);
        });

        // Character count
        const comment = document.getElementById('review-comment');
        comment.addEventListener('input', () => {
            document.getElementById('char-count').textContent = comment.value.length;
            this.validateForm();
        });

        // Photo upload
        const addPhotoBtn = document.getElementById('add-photo-btn');
        const photoInput = document.getElementById('review-photos');
        
        addPhotoBtn.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Submit
        document.getElementById('submit-review-btn').addEventListener('click', () => this.submitReview());
    },

    setRating(rating) {
        document.getElementById('review-rating').value = rating;
        this.highlightStars(rating);
        this.validateForm();
    },

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.innerHTML = '<i class="fas fa-star"></i>';
            } else {
                star.classList.remove('active');
                star.innerHTML = '<i class="far fa-star"></i>';
            }
        });
    },

    handlePhotoUpload(e) {
        const files = Array.from(e.target.files).slice(0, 5);
        const preview = document.getElementById('photo-preview');
        
        preview.innerHTML = '';
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    },

    validateForm() {
        const rating = parseInt(document.getElementById('review-rating').value);
        const comment = document.getElementById('review-comment').value;
        
        const isValid = rating > 0 && comment.length >= 10;
        document.getElementById('submit-review-btn').disabled = !isValid;
    },

    async submitReview() {
        const rating = parseInt(document.getElementById('review-rating').value);
        const title = document.getElementById('review-title').value;
        const comment = document.getElementById('review-comment').value;
        const photos = document.getElementById('review-photos').files;

        const submitBtn = document.getElementById('submit-review-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            const formData = new FormData();
            formData.append('productId', this.productId);
            formData.append('orderId', this.orderId);
            formData.append('rating', rating);
            formData.append('title', title);
            formData.append('comment', comment);
            
            Array.from(photos).forEach(photo => {
                formData.append('photos', photo);
            });

            const response = await fetch(`${API_CONFIG.baseUrl}/reviews`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess();
                this.onSubmit(result.data);
            } else {
                alert(result.error || 'Error al enviar reseña');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar reseña';
            }
        } catch (error) {
            console.error('Error enviando reseña:', error);
            alert('Error al enviar reseña');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar reseña';
        }
    },

    showSuccess() {
        this.container.innerHTML = `
            <div class="review-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>¡Gracias por tu reseña!</h3>
                <p>Tu opinión será revisada y publicada pronto.</p>
                <p class="points-earned">
                    <i class="fas fa-coins"></i>
                    +100 puntos de fidelidad
                </p>
            </div>
            
            <style>
                .review-success {
                    text-align: center;
                    padding: 40px 20px;
                }
                
                .success-icon {
                    font-size: 4em;
                    color: #10b981;
                    margin-bottom: 20px;
                }
                
                .review-success h3 {
                    color: #374151;
                    margin-bottom: 10px;
                }
                
                .review-success p {
                    color: #6b7280;
                }
                
                .points-earned {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: #fef3c7;
                    border-radius: 20px;
                    color: #92400e;
                    font-weight: 600;
                    margin-top: 15px;
                }
                
                .points-earned i {
                    color: #f59e0b;
                }
            </style>
        `;
    },

    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }
};

// Exportar widgets para uso global
if (typeof window !== 'undefined') {
    window.CouponWidget = CouponWidget;
    window.LoyaltyWidget = LoyaltyWidget;
    window.ReviewWidget = ReviewWidget;
}

// Exportar para módulos ES6
export { CouponWidget, LoyaltyWidget, ReviewWidget };
