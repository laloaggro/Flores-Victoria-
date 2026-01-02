/**
 * Gift Cards Widget - Flores Victoria
 * Sistema de compra y canje de tarjetas de regalo
 */

class GiftCardsWidget {
    constructor() {
        this.apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
        this.designs = [];
        this.amounts = [];
        this.selectedAmount = null;
        this.selectedDesign = null;
        this.customAmount = null;
        
        this.init();
    }

    async init() {
        console.log('🎁 Iniciando Gift Cards Widget...');
        
        await this.loadOptions();
        this.setupStyles();
        this.createPurchaseWidget();
        this.createRedeemWidget();
        this.setupEventListeners();
    }

    // ========================================================================
    // CARGAR OPCIONES
    // ========================================================================

    async loadOptions() {
        try {
            const [designsRes, amountsRes] = await Promise.all([
                fetch(`${this.apiUrl}/gift-cards/designs`),
                fetch(`${this.apiUrl}/gift-cards/amounts`)
            ]);

            const designsData = await designsRes.json();
            const amountsData = await amountsRes.json();

            this.designs = designsData.data || this.getDefaultDesigns();
            this.amounts = amountsData.data || this.getDefaultAmounts();

        } catch (error) {
            console.log('Usando opciones por defecto');
            this.designs = this.getDefaultDesigns();
            this.amounts = this.getDefaultAmounts();
        }
    }

    getDefaultDesigns() {
        return [
            { id: 'romantic', name: 'Romántico', description: 'Ideal para parejas', colors: ['#ff6b6b', '#ee5a5a'], icon: '❤️' },
            { id: 'birthday', name: 'Cumpleaños', description: 'Para celebrar', colors: ['#ffd93d', '#ff6b6b'], icon: '🎂' },
            { id: 'thanks', name: 'Agradecimiento', description: 'Di gracias', colors: ['#6bcb77', '#4ecdc4'], icon: '🙏' },
            { id: 'sympathy', name: 'Condolencias', description: 'Con cariño', colors: ['#8b5cf6', '#a78bfa'], icon: '🕊️' },
            { id: 'celebration', name: 'Celebración', description: 'Para festejar', colors: ['#f093fb', '#f5576c'], icon: '🎉' },
            { id: 'classic', name: 'Clásico', description: 'Siempre elegante', colors: ['#667eea', '#764ba2'], icon: '🌸' }
        ];
    }

    getDefaultAmounts() {
        return [
            { value: 15000, label: '$15.000' },
            { value: 25000, label: '$25.000' },
            { value: 50000, label: '$50.000' },
            { value: 75000, label: '$75.000' },
            { value: 100000, label: '$100.000' },
            { value: 150000, label: '$150.000' }
        ];
    }

    // ========================================================================
    // ESTILOS
    // ========================================================================

    setupStyles() {
        if (document.getElementById('gift-cards-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'gift-cards-styles';
        styles.textContent = `
            /* Gift Cards Container */
            .gift-cards-section {
                padding: 40px 20px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .gift-cards-section h2 {
                text-align: center;
                font-size: 2rem;
                margin-bottom: 10px;
                color: #333;
            }

            .gift-cards-section .subtitle {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
            }

            /* Purchase Form */
            .gc-purchase-form {
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                padding: 30px;
                max-width: 800px;
                margin: 0 auto 40px;
            }

            /* Step Header */
            .gc-step {
                margin-bottom: 30px;
            }

            .gc-step-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 15px;
            }

            .gc-step-number {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            .gc-step-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #333;
            }

            /* Amount Selection */
            .gc-amounts {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
                margin-bottom: 15px;
            }

            .gc-amount-btn {
                padding: 15px;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                background: white;
                font-size: 1.1rem;
                font-weight: 600;
                color: #333;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .gc-amount-btn:hover {
                border-color: #ff6b9d;
                transform: translateY(-2px);
            }

            .gc-amount-btn.selected {
                border-color: #ff6b9d;
                background: linear-gradient(135deg, #fff0f5, #ffe4ec);
                color: #c44569;
            }

            .gc-custom-amount {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .gc-custom-amount input {
                flex: 1;
                padding: 12px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 1rem;
            }

            .gc-custom-amount input:focus {
                border-color: #ff6b9d;
                outline: none;
            }

            /* Design Selection */
            .gc-designs {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
            }

            .gc-design-card {
                padding: 20px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }

            .gc-design-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            }

            .gc-design-card.selected {
                border-color: #ff6b9d;
                box-shadow: 0 0 0 3px rgba(255,107,157,0.2);
            }

            .gc-design-icon {
                font-size: 2.5rem;
                margin-bottom: 10px;
            }

            .gc-design-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }

            .gc-design-desc {
                font-size: 0.85rem;
                color: #666;
            }

            /* Recipient Form */
            .gc-recipient-form {
                display: grid;
                gap: 15px;
            }

            .gc-form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            @media (max-width: 600px) {
                .gc-form-row {
                    grid-template-columns: 1fr;
                }
            }

            .gc-form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .gc-form-group label {
                font-weight: 500;
                color: #555;
                font-size: 0.9rem;
            }

            .gc-form-group input,
            .gc-form-group textarea,
            .gc-form-group select {
                padding: 12px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 1rem;
                transition: border-color 0.3s;
            }

            .gc-form-group input:focus,
            .gc-form-group textarea:focus,
            .gc-form-group select:focus {
                border-color: #ff6b9d;
                outline: none;
            }

            .gc-form-group textarea {
                resize: vertical;
                min-height: 80px;
            }

            /* Preview Card */
            .gc-preview {
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                border-radius: 16px;
                padding: 25px;
                color: white;
                margin: 20px 0;
                position: relative;
                overflow: hidden;
            }

            .gc-preview::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -50%;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
            }

            .gc-preview-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }

            .gc-preview-logo {
                font-size: 1.2rem;
                font-weight: bold;
            }

            .gc-preview-amount {
                font-size: 1.8rem;
                font-weight: bold;
            }

            .gc-preview-recipient {
                font-size: 1.1rem;
                margin-bottom: 8px;
            }

            .gc-preview-message {
                font-size: 0.9rem;
                opacity: 0.9;
                font-style: italic;
            }

            /* Submit Button */
            .gc-submit-btn {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 20px;
            }

            .gc-submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(196,69,105,0.3);
            }

            .gc-submit-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            /* Redeem Section */
            .gc-redeem-section {
                background: #f8f9fa;
                border-radius: 16px;
                padding: 25px;
                max-width: 500px;
                margin: 0 auto;
            }

            .gc-redeem-section h3 {
                text-align: center;
                margin-bottom: 20px;
                color: #333;
            }

            .gc-code-input {
                display: flex;
                gap: 8px;
                margin-bottom: 15px;
            }

            .gc-code-segment {
                flex: 1;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                text-align: center;
                font-family: monospace;
                font-size: 1.1rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .gc-code-segment:focus {
                border-color: #ff6b9d;
                outline: none;
            }

            .gc-pin-group {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
            }

            .gc-pin-group label {
                font-weight: 500;
                color: #555;
            }

            .gc-pin-group input {
                width: 100px;
                padding: 10px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                text-align: center;
                font-family: monospace;
                letter-spacing: 3px;
            }

            .gc-check-btn {
                width: 100%;
                padding: 14px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .gc-check-btn:hover {
                background: #5a6fd6;
            }

            /* Balance Result */
            .gc-balance-result {
                display: none;
                background: white;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                margin-top: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .gc-balance-result.show {
                display: block;
                animation: fadeIn 0.3s ease;
            }

            .gc-balance-result.success {
                border: 2px solid #6bcb77;
            }

            .gc-balance-result.error {
                border: 2px solid #ff6b6b;
            }

            .gc-balance-amount {
                font-size: 2rem;
                font-weight: bold;
                color: #6bcb77;
                margin: 10px 0;
            }

            .gc-balance-status {
                color: #666;
                font-size: 0.9rem;
            }

            /* Checkout Integration */
            .gc-checkout-widget {
                background: #f0f4ff;
                border: 2px dashed #667eea;
                border-radius: 12px;
                padding: 20px;
                margin: 15px 0;
            }

            .gc-checkout-widget h4 {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
                color: #333;
            }

            .gc-applied-card {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: white;
                padding: 12px 15px;
                border-radius: 8px;
                margin-top: 10px;
            }

            .gc-applied-card .amount {
                color: #6bcb77;
                font-weight: 600;
            }

            .gc-remove-btn {
                background: none;
                border: none;
                color: #ff6b6b;
                cursor: pointer;
                font-size: 1.2rem;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Toast Notification */
            .gc-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }

            .gc-toast.success {
                background: linear-gradient(135deg, #6bcb77, #4ecdc4);
            }

            .gc-toast.error {
                background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;

        document.head.appendChild(styles);
    }

    // ========================================================================
    // CREAR WIDGET DE COMPRA
    // ========================================================================

    createPurchaseWidget() {
        const container = document.getElementById('gift-cards-purchase');
        if (!container) return;

        container.innerHTML = `
            <div class="gift-cards-section">
                <h2>🎁 Tarjetas de Regalo</h2>
                <p class="subtitle">Regala flores a tus seres queridos</p>

                <div class="gc-purchase-form">
                    <!-- Paso 1: Monto -->
                    <div class="gc-step">
                        <div class="gc-step-header">
                            <span class="gc-step-number">1</span>
                            <span class="gc-step-title">Selecciona el monto</span>
                        </div>
                        <div class="gc-amounts" id="gc-amounts">
                            ${this.amounts.map(a => `
                                <button class="gc-amount-btn" data-amount="${a.value}">
                                    ${a.label}
                                </button>
                            `).join('')}
                        </div>
                        <div class="gc-custom-amount">
                            <span>Otro monto:</span>
                            <input type="number" id="gc-custom-amount" placeholder="Ej: 35000" min="10000" max="500000">
                            <span>CLP</span>
                        </div>
                    </div>

                    <!-- Paso 2: Diseño -->
                    <div class="gc-step">
                        <div class="gc-step-header">
                            <span class="gc-step-number">2</span>
                            <span class="gc-step-title">Elige un diseño</span>
                        </div>
                        <div class="gc-designs" id="gc-designs">
                            ${this.designs.map(d => `
                                <div class="gc-design-card" data-design="${d.id}" 
                                     style="background: linear-gradient(135deg, ${d.colors[0]}20, ${d.colors[1]}20)">
                                    <div class="gc-design-icon">${d.icon}</div>
                                    <div class="gc-design-name">${d.name}</div>
                                    <div class="gc-design-desc">${d.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Paso 3: Destinatario -->
                    <div class="gc-step">
                        <div class="gc-step-header">
                            <span class="gc-step-number">3</span>
                            <span class="gc-step-title">Datos del destinatario</span>
                        </div>
                        <div class="gc-recipient-form">
                            <div class="gc-form-row">
                                <div class="gc-form-group">
                                    <label>Nombre del destinatario *</label>
                                    <input type="text" id="gc-recipient-name" placeholder="María García" required>
                                </div>
                                <div class="gc-form-group">
                                    <label>Email del destinatario *</label>
                                    <input type="email" id="gc-recipient-email" placeholder="maria@email.com" required>
                                </div>
                            </div>
                            <div class="gc-form-group">
                                <label>Mensaje personalizado (opcional)</label>
                                <textarea id="gc-message" placeholder="Escribe un mensaje especial..."></textarea>
                            </div>
                            <div class="gc-form-row">
                                <div class="gc-form-group">
                                    <label>Fecha de envío</label>
                                    <input type="date" id="gc-delivery-date">
                                </div>
                                <div class="gc-form-group">
                                    <label>Tu nombre (remitente)</label>
                                    <input type="text" id="gc-sender-name" placeholder="Juan Pérez">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Preview -->
                    <div class="gc-preview" id="gc-preview">
                        <div class="gc-preview-header">
                            <span class="gc-preview-logo">🌸 Flores Victoria</span>
                            <span class="gc-preview-amount" id="preview-amount">$0</span>
                        </div>
                        <div class="gc-preview-recipient" id="preview-recipient">
                            Para: <strong>_____</strong>
                        </div>
                        <div class="gc-preview-message" id="preview-message">
                            "Tu mensaje aparecerá aquí"
                        </div>
                    </div>

                    <button class="gc-submit-btn" id="gc-purchase-btn" disabled>
                        🎁 Comprar Gift Card
                    </button>
                </div>
            </div>
        `;

        // Set min date to today
        const dateInput = document.getElementById('gc-delivery-date');
        if (dateInput) {
            dateInput.min = new Date().toISOString().split('T')[0];
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    // ========================================================================
    // CREAR WIDGET DE CANJE
    // ========================================================================

    createRedeemWidget() {
        const container = document.getElementById('gift-cards-redeem');
        if (!container) return;

        container.innerHTML = `
            <div class="gc-redeem-section">
                <h3>🔍 Consultar saldo de Gift Card</h3>
                
                <div class="gc-code-input" id="gc-code-input">
                    <input type="text" class="gc-code-segment" maxlength="4" placeholder="XXXX" data-segment="1">
                    <span>-</span>
                    <input type="text" class="gc-code-segment" maxlength="4" placeholder="XXXX" data-segment="2">
                    <span>-</span>
                    <input type="text" class="gc-code-segment" maxlength="4" placeholder="XXXX" data-segment="3">
                    <span>-</span>
                    <input type="text" class="gc-code-segment" maxlength="4" placeholder="XXXX" data-segment="4">
                </div>

                <div class="gc-pin-group">
                    <label>PIN de seguridad:</label>
                    <input type="password" id="gc-security-pin" maxlength="4" placeholder="****">
                </div>

                <button class="gc-check-btn" id="gc-check-balance-btn">
                    Consultar Saldo
                </button>

                <div class="gc-balance-result" id="gc-balance-result">
                    <div class="gc-balance-icon">💳</div>
                    <div class="gc-balance-amount" id="balance-amount">$0</div>
                    <div class="gc-balance-status" id="balance-status"></div>
                </div>
            </div>
        `;
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    setupEventListeners() {
        // Amount buttons
        document.querySelectorAll('.gc-amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gc-amount-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedAmount = parseInt(e.target.dataset.amount);
                document.getElementById('gc-custom-amount').value = '';
                this.updatePreview();
                this.validateForm();
            });
        });

        // Custom amount
        const customInput = document.getElementById('gc-custom-amount');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                document.querySelectorAll('.gc-amount-btn').forEach(b => b.classList.remove('selected'));
                this.selectedAmount = parseInt(e.target.value) || 0;
                this.updatePreview();
                this.validateForm();
            });
        }

        // Design cards
        document.querySelectorAll('.gc-design-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const designCard = e.target.closest('.gc-design-card');
                document.querySelectorAll('.gc-design-card').forEach(c => c.classList.remove('selected'));
                designCard.classList.add('selected');
                this.selectedDesign = designCard.dataset.design;
                this.updatePreviewDesign();
                this.validateForm();
            });
        });

        // Recipient inputs
        ['gc-recipient-name', 'gc-recipient-email', 'gc-message'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.updatePreview();
                    this.validateForm();
                });
            }
        });

        // Purchase button
        const purchaseBtn = document.getElementById('gc-purchase-btn');
        if (purchaseBtn) {
            purchaseBtn.addEventListener('click', () => this.handlePurchase());
        }

        // Code segments (auto-focus next)
        document.querySelectorAll('.gc-code-segment').forEach((input, index, inputs) => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
                if (e.target.value.length === 4 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });

        // Check balance button
        const checkBtn = document.getElementById('gc-check-balance-btn');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.handleCheckBalance());
        }
    }

    // ========================================================================
    // ACTUALIZACIONES DE PREVIEW
    // ========================================================================

    updatePreview() {
        const previewAmount = document.getElementById('preview-amount');
        const previewRecipient = document.getElementById('preview-recipient');
        const previewMessage = document.getElementById('preview-message');

        if (previewAmount) {
            previewAmount.textContent = this.selectedAmount 
                ? `$${this.selectedAmount.toLocaleString('es-CL')}` 
                : '$0';
        }

        const recipientName = document.getElementById('gc-recipient-name')?.value;
        if (previewRecipient) {
            previewRecipient.innerHTML = recipientName 
                ? `Para: <strong>${recipientName}</strong>` 
                : 'Para: <strong>_____</strong>';
        }

        const message = document.getElementById('gc-message')?.value;
        if (previewMessage) {
            previewMessage.textContent = message 
                ? `"${message}"` 
                : '"Tu mensaje aparecerá aquí"';
        }
    }

    updatePreviewDesign() {
        const preview = document.getElementById('gc-preview');
        if (!preview || !this.selectedDesign) return;

        const design = this.designs.find(d => d.id === this.selectedDesign);
        if (design) {
            preview.style.background = `linear-gradient(135deg, ${design.colors[0]}, ${design.colors[1]})`;
        }
    }

    validateForm() {
        const purchaseBtn = document.getElementById('gc-purchase-btn');
        if (!purchaseBtn) return;

        const recipientName = document.getElementById('gc-recipient-name')?.value;
        const recipientEmail = document.getElementById('gc-recipient-email')?.value;

        const isValid = this.selectedAmount >= 10000 
            && this.selectedDesign 
            && recipientName 
            && recipientEmail 
            && this.isValidEmail(recipientEmail);

        purchaseBtn.disabled = !isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ========================================================================
    // ACCIONES
    // ========================================================================

    async handlePurchase() {
        const purchaseBtn = document.getElementById('gc-purchase-btn');
        purchaseBtn.disabled = true;
        purchaseBtn.innerHTML = '<span class="spinner"></span> Procesando...';

        try {
            const data = {
                amount: this.selectedAmount,
                designId: this.selectedDesign,
                recipientName: document.getElementById('gc-recipient-name').value,
                recipientEmail: document.getElementById('gc-recipient-email').value,
                personalMessage: document.getElementById('gc-message').value,
                deliveryDate: document.getElementById('gc-delivery-date').value,
                purchaserName: document.getElementById('gc-sender-name').value
            };

            const response = await fetch(`${this.apiUrl}/gift-cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('¡Gift Card creada! Procede al pago.', 'success');
                
                // Redirect to payment or show success
                if (result.data?.paymentUrl) {
                    window.location.href = result.data.paymentUrl;
                } else {
                    // Show confirmation modal
                    this.showConfirmation(result.data);
                }
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Error:', error);
            this.showToast(error.message || 'Error al crear gift card', 'error');
        } finally {
            purchaseBtn.disabled = false;
            purchaseBtn.textContent = '🎁 Comprar Gift Card';
            this.validateForm();
        }
    }

    async handleCheckBalance() {
        const segments = document.querySelectorAll('.gc-code-segment');
        const code = Array.from(segments).map(s => s.value).join('-');
        const pin = document.getElementById('gc-security-pin').value;

        if (code.length < 19) {
            this.showToast('Ingresa el código completo', 'error');
            return;
        }

        const btn = document.getElementById('gc-check-balance-btn');
        btn.disabled = true;
        btn.textContent = 'Consultando...';

        try {
            const response = await fetch(`${this.apiUrl}/gift-cards/check-balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, securityPin: pin })
            });

            const result = await response.json();
            const resultDiv = document.getElementById('gc-balance-result');
            const amountDiv = document.getElementById('balance-amount');
            const statusDiv = document.getElementById('balance-status');

            if (result.success && result.data.valid) {
                resultDiv.className = 'gc-balance-result show success';
                amountDiv.textContent = `$${result.data.balance.toLocaleString('es-CL')}`;
                statusDiv.textContent = `Estado: ${result.data.status} | Expira: ${new Date(result.data.expiresAt).toLocaleDateString('es-CL')}`;
            } else {
                resultDiv.className = 'gc-balance-result show error';
                amountDiv.textContent = '❌';
                statusDiv.textContent = result.data?.message || 'Gift Card no válida';
            }

        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error al consultar balance', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Consultar Saldo';
        }
    }

    showConfirmation(giftCard) {
        const modal = document.createElement('div');
        modal.className = 'gc-modal';
        modal.innerHTML = `
            <div class="gc-modal-content">
                <h3>✅ Gift Card Creada</h3>
                <p>Tu Gift Card será enviada a <strong>${giftCard.recipient?.email}</strong></p>
                <p>Monto: <strong>$${giftCard.amount?.toLocaleString('es-CL')}</strong></p>
                <button onclick="this.closest('.gc-modal').remove()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `gc-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    // ========================================================================
    // INTEGRACIÓN CON CHECKOUT
    // ========================================================================

    createCheckoutWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="gc-checkout-widget">
                <h4>🎁 ¿Tienes una Gift Card?</h4>
                <div class="gc-code-input gc-code-input-small">
                    <input type="text" id="checkout-gc-code" placeholder="Código: XXXX-XXXX-XXXX-XXXX">
                    <button id="apply-gc-btn" class="gc-apply-btn">Aplicar</button>
                </div>
                <div id="gc-applied-container"></div>
            </div>
        `;

        document.getElementById('apply-gc-btn')?.addEventListener('click', () => {
            this.applyGiftCardToCheckout();
        });
    }

    async applyGiftCardToCheckout() {
        const code = document.getElementById('checkout-gc-code')?.value;
        if (!code) return;

        try {
            const response = await fetch(`${this.apiUrl}/gift-cards/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const result = await response.json();

            if (result.success && result.data.valid) {
                const container = document.getElementById('gc-applied-container');
                container.innerHTML = `
                    <div class="gc-applied-card">
                        <span>Gift Card aplicada</span>
                        <span class="amount">-$${result.data.balance.toLocaleString('es-CL')}</span>
                        <button class="gc-remove-btn" onclick="giftCardsWidget.removeAppliedCard()">✕</button>
                    </div>
                `;
                
                // Emit event for checkout to handle
                window.dispatchEvent(new CustomEvent('giftCardApplied', {
                    detail: { code, balance: result.data.balance }
                }));
            } else {
                this.showToast('Gift Card no válida', 'error');
            }

        } catch (error) {
            this.showToast('Error validando Gift Card', 'error');
        }
    }

    removeAppliedCard() {
        const container = document.getElementById('gc-applied-container');
        if (container) container.innerHTML = '';
        document.getElementById('checkout-gc-code').value = '';
        
        window.dispatchEvent(new CustomEvent('giftCardRemoved'));
    }
}

// Auto-inicializar
let giftCardsWidget;
document.addEventListener('DOMContentLoaded', () => {
    giftCardsWidget = new GiftCardsWidget();
});

// Exportar para uso externo
window.GiftCardsWidget = GiftCardsWidget;
