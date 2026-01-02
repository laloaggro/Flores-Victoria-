/**
 * Widget de Suscripciones - Flores Victoria
 * Interfaz de usuario para gestión de suscripciones
 */

class SubscriptionWidget {
    constructor(options = {}) {
        this.apiBase = options.apiBase || '/api/promotions/subscriptions';
        this.container = options.container || document.body;
        this.onSubscribe = options.onSubscribe || (() => {});
        this.currency = 'CLP';
        
        this.state = {
            plans: [],
            frequencies: [],
            selectedPlan: null,
            selectedFrequency: 'weekly',
            step: 1,
            userSubscriptions: [],
            loading: false
        };
        
        this.init();
    }

    async init() {
        await this.loadPlans();
        this.render();
    }

    // ========================================================================
    // API CALLS
    // ========================================================================

    async loadPlans() {
        try {
            const response = await fetch(`${this.apiBase}/plans`);
            const data = await response.json();
            
            if (data.success) {
                this.state.plans = data.plans;
                this.state.frequencies = data.frequencies;
            }
        } catch (error) {
            console.error('Error cargando planes:', error);
        }
    }

    async loadUserSubscriptions() {
        try {
            const response = await fetch(`${this.apiBase}/my`, {
                headers: this.getAuthHeaders()
            });
            const data = await response.json();
            
            if (data.success) {
                this.state.userSubscriptions = data.subscriptions;
            }
        } catch (error) {
            console.error('Error cargando suscripciones:', error);
        }
    }

    async createSubscription(subscriptionData) {
        this.state.loading = true;
        this.render();

        try {
            const response = await fetch(`${this.apiBase}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscriptionData)
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('¡Suscripción creada exitosamente!');
                this.onSubscribe(data.subscription);
                await this.loadUserSubscriptions();
            } else {
                this.showError(data.error);
            }

            return data;
        } catch (error) {
            this.showError('Error al crear suscripción');
            throw error;
        } finally {
            this.state.loading = false;
            this.render();
        }
    }

    async pauseSubscription(subscriptionId, reason = '') {
        try {
            const response = await fetch(`${this.apiBase}/${subscriptionId}/pause`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();
            if (data.success) {
                this.showSuccess('Suscripción pausada');
                await this.loadUserSubscriptions();
            }
            return data;
        } catch (error) {
            this.showError('Error al pausar suscripción');
        }
    }

    async resumeSubscription(subscriptionId) {
        try {
            const response = await fetch(`${this.apiBase}/${subscriptionId}/resume`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();
            if (data.success) {
                this.showSuccess('Suscripción reanudada');
                await this.loadUserSubscriptions();
            }
            return data;
        } catch (error) {
            this.showError('Error al reanudar suscripción');
        }
    }

    async cancelSubscription(subscriptionId, reason = '') {
        if (!confirm('¿Estás seguro de cancelar esta suscripción?')) return;

        try {
            const response = await fetch(`${this.apiBase}/${subscriptionId}/cancel`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();
            if (data.success) {
                this.showSuccess('Suscripción cancelada');
                await this.loadUserSubscriptions();
            }
            return data;
        } catch (error) {
            this.showError('Error al cancelar suscripción');
        }
    }

    async skipDelivery(deliveryId, reason = '') {
        try {
            const response = await fetch(`${this.apiBase}/deliveries/${deliveryId}/skip`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();
            if (data.success) {
                this.showSuccess('Entrega omitida');
            }
            return data;
        } catch (error) {
            this.showError('Error al omitir entrega');
        }
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'x-user-id': localStorage.getItem('userId') || 'guest'
        };
    }

    // ========================================================================
    // RENDER METHODS
    // ========================================================================

    render() {
        const html = `
            <div class="subscription-widget">
                ${this.renderStyles()}
                
                <div class="subscription-header">
                    <h2>🌸 Suscripciones de Flores</h2>
                    <p>Recibe flores frescas en tu hogar con entregas programadas</p>
                </div>

                <div class="subscription-tabs">
                    <button class="tab-btn ${this.state.step === 1 ? 'active' : ''}" 
                            onclick="subscriptionWidget.showStep(1)">
                        💐 Planes
                    </button>
                    <button class="tab-btn ${this.state.step === 2 ? 'active' : ''}" 
                            onclick="subscriptionWidget.showStep(2)">
                        📋 Mis Suscripciones
                    </button>
                </div>

                <div class="subscription-content">
                    ${this.state.step === 1 ? this.renderPlansView() : this.renderMySubscriptions()}
                </div>
            </div>
        `;

        if (typeof this.container === 'string') {
            document.querySelector(this.container).innerHTML = html;
        } else {
            this.container.innerHTML = html;
        }

        this.attachEventListeners();
    }

    renderPlansView() {
        return `
            <div class="plans-section">
                <!-- Selector de frecuencia -->
                <div class="frequency-selector">
                    <h3>Selecciona tu frecuencia de entrega</h3>
                    <div class="frequency-options">
                        ${this.state.frequencies.map(freq => `
                            <label class="frequency-option ${this.state.selectedFrequency === freq.id ? 'selected' : ''}">
                                <input type="radio" name="frequency" value="${freq.id}" 
                                       ${this.state.selectedFrequency === freq.id ? 'checked' : ''}
                                       onchange="subscriptionWidget.selectFrequency('${freq.id}')">
                                <div class="frequency-card">
                                    <span class="freq-name">${freq.name}</span>
                                    <span class="freq-discount">-${freq.discount}%</span>
                                    <span class="freq-desc">${freq.description}</span>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Planes disponibles -->
                <div class="plans-grid">
                    ${this.state.plans.map(plan => this.renderPlanCard(plan)).join('')}
                </div>

                <!-- Modal de suscripción -->
                <div id="subscription-modal" class="modal hidden">
                    ${this.renderSubscriptionModal()}
                </div>
            </div>
        `;
    }

    renderPlanCard(plan) {
        const freq = this.state.frequencies.find(f => f.id === this.state.selectedFrequency);
        const pricing = plan.frequencies?.find(f => f.id === this.state.selectedFrequency) || {
            price: plan.basePrice,
            savings: 0
        };

        return `
            <div class="plan-card ${plan.popular ? 'popular' : ''}">
                ${plan.popular ? '<span class="popular-badge">⭐ Más Popular</span>' : ''}
                
                <div class="plan-header">
                    <h3>${plan.name}</h3>
                    <p class="plan-description">${plan.description}</p>
                </div>

                <div class="plan-price">
                    ${pricing.savings > 0 ? `
                        <span class="original-price">$${plan.basePrice.toLocaleString('es-CL')}</span>
                    ` : ''}
                    <span class="current-price">$${pricing.price.toLocaleString('es-CL')}</span>
                    <span class="price-period">/${freq?.name.toLowerCase() || 'entrega'}</span>
                </div>

                ${pricing.savings > 0 ? `
                    <div class="savings-badge">
                        Ahorras $${pricing.savings.toLocaleString('es-CL')} por entrega
                    </div>
                ` : ''}

                <ul class="plan-features">
                    ${plan.features.map(f => `<li>✓ ${f}</li>`).join('')}
                </ul>

                <button class="subscribe-btn" onclick="subscriptionWidget.openSubscriptionModal('${plan.id}')">
                    Suscribirme
                </button>
            </div>
        `;
    }

    renderSubscriptionModal() {
        const plan = this.state.plans.find(p => p.id === this.state.selectedPlan);
        if (!plan) return '';

        return `
            <div class="modal-content">
                <button class="modal-close" onclick="subscriptionWidget.closeModal()">&times;</button>
                
                <h2>Configurar Suscripción</h2>
                <h3>${plan.name}</h3>

                <form id="subscription-form" onsubmit="subscriptionWidget.handleSubmit(event)">
                    <!-- Dirección de entrega -->
                    <div class="form-section">
                        <h4>📍 Dirección de Entrega</h4>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Calle y número *</label>
                                <input type="text" name="street" required placeholder="Av. Principal 123">
                            </div>
                            <div class="form-group">
                                <label>Depto/Oficina</label>
                                <input type="text" name="apartment" placeholder="Depto 45">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Comuna *</label>
                                <select name="comuna" required>
                                    <option value="">Seleccionar comuna</option>
                                    <option value="providencia">Providencia</option>
                                    <option value="las-condes">Las Condes</option>
                                    <option value="vitacura">Vitacura</option>
                                    <option value="nunoa">Ñuñoa</option>
                                    <option value="santiago-centro">Santiago Centro</option>
                                    <option value="la-reina">La Reina</option>
                                    <option value="lo-barnechea">Lo Barnechea</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Ciudad *</label>
                                <input type="text" name="city" value="Santiago" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Instrucciones de entrega</label>
                            <textarea name="deliveryInstructions" 
                                      placeholder="Ej: Dejar con el conserje, tocar timbre 2 veces..."></textarea>
                        </div>
                    </div>

                    <!-- Preferencias de entrega -->
                    <div class="form-section">
                        <h4>📅 Preferencias de Entrega</h4>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Día preferido *</label>
                                <select name="preferredDay" required>
                                    <option value="1">Lunes</option>
                                    <option value="2">Martes</option>
                                    <option value="3">Miércoles</option>
                                    <option value="4">Jueves</option>
                                    <option value="5">Viernes</option>
                                    <option value="6" selected>Sábado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Horario *</label>
                                <select name="preferredTimeSlot" required>
                                    <option value="morning">Mañana (9:00 - 13:00)</option>
                                    <option value="afternoon">Tarde (14:00 - 18:00)</option>
                                    <option value="evening">Noche (18:00 - 21:00)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Fecha de inicio</label>
                            <input type="date" name="startDate" 
                                   min="${new Date().toISOString().split('T')[0]}">
                            <small>Dejar vacío para la próxima fecha disponible</small>
                        </div>
                    </div>

                    <!-- Mensaje de regalo (opcional) -->
                    <div class="form-section">
                        <h4>💌 Mensaje Personalizado (opcional)</h4>
                        <div class="form-group">
                            <textarea name="giftMessage" maxlength="200"
                                      placeholder="Un mensaje especial para incluir en cada entrega..."></textarea>
                        </div>
                    </div>

                    <!-- Resumen -->
                    <div class="subscription-summary">
                        <h4>Resumen de tu Suscripción</h4>
                        <div class="summary-row">
                            <span>Plan:</span>
                            <span>${plan.name}</span>
                        </div>
                        <div class="summary-row">
                            <span>Frecuencia:</span>
                            <span>${this.state.frequencies.find(f => f.id === this.state.selectedFrequency)?.name}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total por entrega:</span>
                            <span>$${this.getSelectedPrice().toLocaleString('es-CL')} CLP</span>
                        </div>
                    </div>

                    <button type="submit" class="submit-btn" ${this.state.loading ? 'disabled' : ''}>
                        ${this.state.loading ? 'Procesando...' : '🌸 Confirmar Suscripción'}
                    </button>
                </form>
            </div>
        `;
    }

    renderMySubscriptions() {
        if (this.state.userSubscriptions.length === 0) {
            return `
                <div class="empty-subscriptions">
                    <div class="empty-icon">📭</div>
                    <h3>No tienes suscripciones activas</h3>
                    <p>¡Suscríbete para recibir flores frescas regularmente!</p>
                    <button class="cta-btn" onclick="subscriptionWidget.showStep(1)">
                        Ver Planes
                    </button>
                </div>
            `;
        }

        return `
            <div class="my-subscriptions">
                ${this.state.userSubscriptions.map(sub => this.renderSubscriptionCard(sub)).join('')}
            </div>
        `;
    }

    renderSubscriptionCard(sub) {
        const statusClasses = {
            'active': 'status-active',
            'paused': 'status-paused',
            'cancelled': 'status-cancelled'
        };

        return `
            <div class="subscription-card ${statusClasses[sub.status] || ''}">
                <div class="sub-header">
                    <div>
                        <h3>${sub.planName}</h3>
                        <span class="sub-frequency">${sub.frequencyName}</span>
                    </div>
                    <span class="status-badge">${sub.statusLabel}</span>
                </div>

                <div class="sub-details">
                    <div class="detail-row">
                        <span>💰 Precio:</span>
                        <span>$${sub.finalPrice.toLocaleString('es-CL')} CLP</span>
                    </div>
                    <div class="detail-row">
                        <span>📦 Entregas completadas:</span>
                        <span>${sub.deliveriesCompleted}</span>
                    </div>
                    ${sub.status === 'active' ? `
                        <div class="detail-row highlight">
                            <span>📅 Próxima entrega:</span>
                            <span>${sub.nextDeliveryFormatted}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="sub-address">
                    <strong>📍 Dirección:</strong>
                    <p>${sub.deliveryAddress.street}, ${sub.deliveryAddress.comuna}</p>
                </div>

                <div class="sub-actions">
                    ${sub.status === 'active' ? `
                        <button class="action-btn pause" onclick="subscriptionWidget.pauseSubscription('${sub.id}')">
                            ⏸️ Pausar
                        </button>
                        <button class="action-btn skip" onclick="subscriptionWidget.skipNextDelivery('${sub.id}')">
                            ⏭️ Saltar entrega
                        </button>
                        <button class="action-btn cancel" onclick="subscriptionWidget.cancelSubscription('${sub.id}')">
                            ❌ Cancelar
                        </button>
                    ` : ''}
                    ${sub.status === 'paused' ? `
                        <button class="action-btn resume" onclick="subscriptionWidget.resumeSubscription('${sub.id}')">
                            ▶️ Reanudar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderStyles() {
        return `
            <style>
                .subscription-widget {
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .subscription-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .subscription-header h2 {
                    font-size: 2rem;
                    color: #d63384;
                    margin-bottom: 10px;
                }

                .subscription-tabs {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 30px;
                }

                .tab-btn {
                    padding: 12px 30px;
                    border: 2px solid #d63384;
                    background: white;
                    color: #d63384;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s;
                }

                .tab-btn.active, .tab-btn:hover {
                    background: #d63384;
                    color: white;
                }

                /* Frecuencias */
                .frequency-selector {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .frequency-options {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .frequency-option {
                    cursor: pointer;
                }

                .frequency-option input {
                    display: none;
                }

                .frequency-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px 30px;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    transition: all 0.3s;
                }

                .frequency-option.selected .frequency-card,
                .frequency-option:hover .frequency-card {
                    border-color: #d63384;
                    background: #fff0f5;
                }

                .freq-name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #333;
                }

                .freq-discount {
                    color: #28a745;
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .freq-desc {
                    font-size: 0.85rem;
                    color: #666;
                    margin-top: 5px;
                }

                /* Planes */
                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 25px;
                }

                .plan-card {
                    background: white;
                    border-radius: 16px;
                    padding: 30px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    position: relative;
                    transition: transform 0.3s;
                }

                .plan-card:hover {
                    transform: translateY(-5px);
                }

                .plan-card.popular {
                    border: 3px solid #d63384;
                }

                .popular-badge {
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #d63384;
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .plan-header h3 {
                    font-size: 1.4rem;
                    color: #333;
                    margin-bottom: 8px;
                }

                .plan-description {
                    color: #666;
                    font-size: 0.95rem;
                }

                .plan-price {
                    margin: 20px 0;
                    text-align: center;
                }

                .original-price {
                    text-decoration: line-through;
                    color: #999;
                    font-size: 1rem;
                    display: block;
                }

                .current-price {
                    font-size: 2.2rem;
                    font-weight: 700;
                    color: #d63384;
                }

                .price-period {
                    color: #666;
                    font-size: 0.9rem;
                }

                .savings-badge {
                    background: #e8f5e9;
                    color: #2e7d32;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    text-align: center;
                    margin-bottom: 20px;
                }

                .plan-features {
                    list-style: none;
                    padding: 0;
                    margin: 20px 0;
                }

                .plan-features li {
                    padding: 8px 0;
                    color: #555;
                    border-bottom: 1px solid #f0f0f0;
                }

                .subscribe-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #d63384, #ff6b9d);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .subscribe-btn:hover {
                    background: linear-gradient(135deg, #c12574, #e85a8a);
                    transform: scale(1.02);
                }

                /* Modal */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal.hidden {
                    display: none;
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                }

                .modal-close {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: #666;
                }

                .form-section {
                    margin-bottom: 25px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }

                .form-section h4 {
                    color: #d63384;
                    margin-bottom: 15px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #333;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #d63384;
                }

                .form-group small {
                    color: #888;
                    font-size: 0.8rem;
                }

                .subscription-summary {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                }

                .summary-row.total {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #d63384;
                    border-top: 2px solid #ddd;
                    margin-top: 10px;
                    padding-top: 15px;
                }

                .submit-btn {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #d63384, #ff6b9d);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.2rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .submit-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                /* Mis Suscripciones */
                .empty-subscriptions {
                    text-align: center;
                    padding: 60px 20px;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }

                .cta-btn {
                    padding: 14px 40px;
                    background: #d63384;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    margin-top: 20px;
                }

                .my-subscriptions {
                    display: grid;
                    gap: 20px;
                }

                .subscription-card {
                    background: white;
                    border-radius: 16px;
                    padding: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border-left: 5px solid #28a745;
                }

                .subscription-card.status-paused {
                    border-left-color: #ffc107;
                }

                .subscription-card.status-cancelled {
                    border-left-color: #dc3545;
                    opacity: 0.7;
                }

                .sub-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .sub-header h3 {
                    margin: 0;
                    color: #333;
                }

                .sub-frequency {
                    color: #666;
                    font-size: 0.9rem;
                }

                .status-badge {
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    background: #e8f5e9;
                    color: #2e7d32;
                }

                .sub-details {
                    margin-bottom: 15px;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                }

                .detail-row.highlight {
                    background: #fff0f5;
                    margin: 10px -15px;
                    padding: 10px 15px;
                    border-radius: 8px;
                }

                .sub-address {
                    background: #f8f9fa;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }

                .sub-actions {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .action-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                }

                .action-btn.pause {
                    background: #fff3cd;
                    color: #856404;
                }

                .action-btn.skip {
                    background: #e3f2fd;
                    color: #1565c0;
                }

                .action-btn.cancel {
                    background: #ffebee;
                    color: #c62828;
                }

                .action-btn.resume {
                    background: #e8f5e9;
                    color: #2e7d32;
                }

                .action-btn:hover {
                    transform: scale(1.05);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .frequency-options {
                        flex-direction: column;
                        align-items: center;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .modal-content {
                        padding: 25px;
                    }
                }
            </style>
        `;
    }

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    attachEventListeners() {
        // Los eventos están inline en el HTML por simplicidad
    }

    showStep(step) {
        this.state.step = step;
        if (step === 2) {
            this.loadUserSubscriptions().then(() => this.render());
        } else {
            this.render();
        }
    }

    selectFrequency(frequencyId) {
        this.state.selectedFrequency = frequencyId;
        this.render();
    }

    openSubscriptionModal(planId) {
        this.state.selectedPlan = planId;
        const modal = document.getElementById('subscription-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.innerHTML = this.renderSubscriptionModal();
        }
    }

    closeModal() {
        const modal = document.getElementById('subscription-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.state.selectedPlan = null;
    }

    getSelectedPrice() {
        const plan = this.state.plans.find(p => p.id === this.state.selectedPlan);
        if (!plan) return 0;
        
        const freq = plan.frequencies?.find(f => f.id === this.state.selectedFrequency);
        return freq?.price || plan.basePrice;
    }

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const subscriptionData = {
            planId: this.state.selectedPlan,
            frequency: this.state.selectedFrequency,
            deliveryAddress: {
                street: formData.get('street'),
                apartment: formData.get('apartment'),
                comuna: formData.get('comuna'),
                city: formData.get('city')
            },
            deliveryInstructions: formData.get('deliveryInstructions'),
            preferredDay: parseInt(formData.get('preferredDay')),
            preferredTimeSlot: formData.get('preferredTimeSlot'),
            giftMessage: formData.get('giftMessage'),
            startDate: formData.get('startDate') || null
        };

        try {
            await this.createSubscription(subscriptionData);
            this.closeModal();
            this.showStep(2);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // ========================================================================
    // NOTIFICATIONS
    // ========================================================================

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <style>
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 500;
                    z-index: 2000;
                    animation: slideIn 0.3s ease;
                }
                .notification-success { background: #28a745; }
                .notification-error { background: #dc3545; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
            ${message}
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SubscriptionWidget = SubscriptionWidget;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SubscriptionWidget };
}
