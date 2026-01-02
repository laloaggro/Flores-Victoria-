/**
 * Widget de Chat en Vivo - Flores Victoria
 * Cliente WebSocket para chat en tiempo real
 */

class LiveChatWidget {
    constructor(options = {}) {
        this.wsUrl = options.wsUrl || `ws://${window.location.host}/ws/chat`;
        this.position = options.position || 'bottom-right';
        this.primaryColor = options.primaryColor || '#d63384';
        this.title = options.title || 'Chat con Flores Victoria';
        this.greeting = options.greeting || '¡Hola! 🌸 ¿En qué podemos ayudarte?';
        this.placeholder = options.placeholder || 'Escribe tu mensaje...';
        
        this.ws = null;
        this.socketId = null;
        this.visitorId = null;
        this.conversationId = null;
        this.isConnected = false;
        this.isOpen = false;
        this.isMinimized = true;
        this.unreadCount = 0;
        this.messages = [];
        this.isTyping = false;
        this.agentTyping = false;
        this.agent = null;
        
        this.typingTimeout = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.init();
    }

    // ========================================================================
    // INICIALIZACIÓN
    // ========================================================================

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.loadSavedState();
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'live-chat-widget';
        widget.innerHTML = this.renderWidget();
        document.body.appendChild(widget);

        // Insertar estilos
        if (!document.getElementById('live-chat-styles')) {
            const styles = document.createElement('style');
            styles.id = 'live-chat-styles';
            styles.textContent = this.getStyles();
            document.head.appendChild(styles);
        }
    }

    renderWidget() {
        return `
            <!-- Botón flotante -->
            <button class="chat-launcher ${this.isMinimized ? '' : 'hidden'}" id="chat-launcher">
                <span class="launcher-icon">💬</span>
                <span class="unread-badge hidden" id="unread-badge">0</span>
            </button>

            <!-- Ventana de chat -->
            <div class="chat-window ${this.isMinimized ? 'hidden' : ''}" id="chat-window">
                <!-- Header -->
                <div class="chat-header">
                    <div class="header-info">
                        <div class="header-avatar">🌸</div>
                        <div>
                            <h3>${this.title}</h3>
                            <span class="status-indicator" id="status-indicator">
                                <span class="status-dot"></span>
                                <span id="status-text">Conectando...</span>
                            </span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="header-btn" id="minimize-btn" title="Minimizar">
                            <span>−</span>
                        </button>
                        <button class="header-btn" id="close-btn" title="Cerrar">
                            <span>×</span>
                        </button>
                    </div>
                </div>

                <!-- Cuerpo del chat -->
                <div class="chat-body" id="chat-body">
                    <div class="messages-container" id="messages-container">
                        <!-- Los mensajes se insertan aquí -->
                    </div>
                    
                    <!-- Indicador de typing -->
                    <div class="typing-indicator hidden" id="typing-indicator">
                        <div class="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                        <span class="typing-text">El agente está escribiendo...</span>
                    </div>
                </div>

                <!-- Footer / Input -->
                <div class="chat-footer">
                    <div class="input-container">
                        <textarea 
                            id="message-input" 
                            placeholder="${this.placeholder}"
                            rows="1"
                            maxlength="2000"
                        ></textarea>
                        <button class="send-btn" id="send-btn" disabled>
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="footer-info">
                        <span>Powered by Flores Victoria</span>
                    </div>
                </div>
            </div>

            <!-- Pre-chat form -->
            <div class="prechat-form hidden" id="prechat-form">
                <div class="prechat-header">
                    <h3>Antes de comenzar</h3>
                    <p>Por favor, completa tus datos</p>
                </div>
                <form id="prechat-form-content">
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" id="visitor-name" required placeholder="Tu nombre">
                    </div>
                    <div class="form-group">
                        <label>Email (opcional)</label>
                        <input type="email" id="visitor-email" placeholder="tu@email.com">
                    </div>
                    <button type="submit" class="start-chat-btn">Iniciar Chat</button>
                </form>
            </div>
        `;
    }

    attachEventListeners() {
        // Launcher button
        document.getElementById('chat-launcher').addEventListener('click', () => {
            this.toggleChat();
        });

        // Minimize button
        document.getElementById('minimize-btn').addEventListener('click', () => {
            this.minimizeChat();
        });

        // Close button
        document.getElementById('close-btn').addEventListener('click', () => {
            this.closeChat();
        });

        // Message input
        const input = document.getElementById('message-input');
        input.addEventListener('input', (e) => {
            this.handleInput(e);
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send button
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Pre-chat form
        document.getElementById('prechat-form-content').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startChat();
        });
    }

    // ========================================================================
    // WEBSOCKET CONNECTION
    // ========================================================================

    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        console.log('🔌 Conectando al servidor de chat...');
        
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
            console.log('✅ Conectado al servidor de chat');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('online', 'En línea');
            
            // Autenticar como visitante
            this.authenticate();
        };

        this.ws.onmessage = (event) => {
            this.handleServerMessage(JSON.parse(event.data));
        };

        this.ws.onclose = () => {
            console.log('🔌 Desconectado del servidor');
            this.isConnected = false;
            this.updateConnectionStatus('offline', 'Desconectado');
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('❌ Error de WebSocket:', error);
            this.updateConnectionStatus('error', 'Error de conexión');
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Máximo de intentos de reconexión alcanzado');
            this.updateConnectionStatus('error', 'No se puede conectar');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        
        console.log(`🔄 Reintentando conexión en ${delay/1000}s...`);
        this.updateConnectionStatus('connecting', 'Reconectando...');
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    // ========================================================================
    // HANDLERS DE MENSAJES DEL SERVIDOR
    // ========================================================================

    handleServerMessage(data) {
        console.log('📨 Mensaje del servidor:', data.type);

        switch (data.type) {
            case 'connected':
                this.socketId = data.socketId;
                break;

            case 'auth:success':
                this.visitorId = data.visitorId;
                this.saveState();
                break;

            case 'conversation:started':
                this.conversationId = data.conversation.id;
                this.saveState();
                this.showChat();
                break;

            case 'conversation:joined':
                this.conversationId = data.conversation.id;
                this.loadConversation(data.conversation);
                break;

            case 'message:new':
                this.addMessage(data.message);
                break;

            case 'message:sent':
                this.updateMessageStatus(data.message.id, 'sent');
                break;

            case 'message:read':
                this.updateMessageStatus(data.messageId, 'read');
                break;

            case 'typing':
                if (data.userId !== this.visitorId) {
                    this.showAgentTyping(data.isTyping);
                }
                break;

            case 'conversation:assigned':
                this.agent = data.agent;
                this.addSystemMessage(`${data.agent.name} se ha unido al chat`);
                break;

            case 'conversation:resolved':
                this.addSystemMessage('La conversación ha sido marcada como resuelta');
                break;

            case 'rating:submitted':
                this.addSystemMessage('¡Gracias por tu calificación!');
                break;

            case 'error':
                console.error('Error del servidor:', data.message);
                this.showError(data.message);
                break;
        }
    }

    // ========================================================================
    // ACCIONES
    // ========================================================================

    authenticate() {
        const savedState = this.getSavedState();
        
        this.send({
            type: 'auth:visitor',
            visitorId: savedState?.visitorId,
            name: savedState?.name,
            email: savedState?.email,
            userId: localStorage.getItem('userId') // Si está logueado
        });

        // Si hay una conversación guardada, intentar unirse
        if (savedState?.conversationId) {
            this.send({
                type: 'conversation:join',
                conversationId: savedState.conversationId
            });
        }
    }

    startChat() {
        const name = document.getElementById('visitor-name').value;
        const email = document.getElementById('visitor-email').value;

        // Guardar datos
        this.saveState({ name, email });

        // Re-autenticar con datos
        this.send({
            type: 'auth:visitor',
            visitorId: this.visitorId,
            name,
            email,
            userId: localStorage.getItem('userId')
        });

        // Iniciar conversación
        this.send({
            type: 'conversation:start',
            currentPage: window.location.href,
            userAgent: navigator.userAgent
        });

        // Ocultar formulario
        document.getElementById('prechat-form').classList.add('hidden');
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        
        if (!content) return;
        if (!this.conversationId) {
            // Mostrar pre-chat form si no hay conversación
            this.showPrechatForm();
            return;
        }

        // Agregar mensaje localmente (optimistic UI)
        const tempMessage = {
            id: `temp-${Date.now()}`,
            content,
            sender: {
                id: this.visitorId,
                type: 'visitor'
            },
            timestamp: new Date().toISOString(),
            status: 'sending'
        };
        this.addMessage(tempMessage);

        // Enviar al servidor
        this.send({
            type: 'message:send',
            content
        });

        // Limpiar input
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('send-btn').disabled = true;

        // Detener indicador de typing
        this.stopTyping();
    }

    handleInput(e) {
        const input = e.target;
        const sendBtn = document.getElementById('send-btn');
        
        // Auto-resize
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        
        // Enable/disable send button
        sendBtn.disabled = !input.value.trim();

        // Enviar indicador de typing
        if (!this.isTyping) {
            this.startTyping();
        }

        // Reset timeout
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 2000);
    }

    startTyping() {
        if (!this.conversationId) return;
        this.isTyping = true;
        this.send({
            type: 'message:typing',
            isTyping: true
        });
    }

    stopTyping() {
        if (!this.isTyping) return;
        this.isTyping = false;
        this.send({
            type: 'message:typing',
            isTyping: false
        });
    }

    handleQuickReply(replyId, text) {
        this.send({
            type: 'quick_reply:select',
            replyId,
            text
        });
    }

    submitRating(rating) {
        this.send({
            type: 'rating:submit',
            rating,
            feedback: ''
        });
    }

    // ========================================================================
    // UI UPDATES
    // ========================================================================

    toggleChat() {
        if (this.isMinimized) {
            this.openChat();
        } else {
            this.minimizeChat();
        }
    }

    openChat() {
        this.isMinimized = false;
        this.isOpen = true;
        document.getElementById('chat-launcher').classList.add('hidden');
        document.getElementById('chat-window').classList.remove('hidden');
        
        // Conectar si no está conectado
        if (!this.isConnected) {
            this.connect();
        }

        // Si no hay conversación, mostrar pre-chat
        const savedState = this.getSavedState();
        if (!savedState?.conversationId && !savedState?.name) {
            this.showPrechatForm();
        }

        // Limpiar badge
        this.unreadCount = 0;
        this.updateUnreadBadge();

        // Focus en input
        setTimeout(() => {
            document.getElementById('message-input').focus();
        }, 100);
    }

    minimizeChat() {
        this.isMinimized = true;
        document.getElementById('chat-window').classList.add('hidden');
        document.getElementById('chat-launcher').classList.remove('hidden');
    }

    closeChat() {
        if (confirm('¿Seguro que deseas cerrar el chat?')) {
            this.minimizeChat();
            // Opcionalmente desconectar
        }
    }

    showChat() {
        document.getElementById('prechat-form').classList.add('hidden');
        document.getElementById('chat-body').style.display = 'flex';
    }

    showPrechatForm() {
        document.getElementById('prechat-form').classList.remove('hidden');
    }

    addMessage(message) {
        const container = document.getElementById('messages-container');
        const isOwnMessage = message.sender.type === 'visitor';
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${isOwnMessage ? 'message-own' : 'message-other'}`;
        messageEl.id = `message-${message.id}`;
        messageEl.innerHTML = this.renderMessage(message);

        container.appendChild(messageEl);
        this.scrollToBottom();

        // Actualizar contador si está minimizado
        if (this.isMinimized && !isOwnMessage) {
            this.unreadCount++;
            this.updateUnreadBadge();
        }

        // Reproducir sonido
        if (!isOwnMessage && !this.isMinimized) {
            this.playNotificationSound();
        }
    }

    renderMessage(message) {
        const time = new Date(message.timestamp).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Quick replies
        if (message.type === 'quick_reply' && message.quickReplies) {
            return `
                <div class="message-content">
                    <p>${message.content}</p>
                    <div class="quick-replies">
                        ${message.quickReplies.map(reply => `
                            <button class="quick-reply-btn" onclick="liveChatWidget.handleQuickReply('${reply.id}', '${reply.text}')">
                                ${reply.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <span class="message-time">${time}</span>
            `;
        }

        // Rating request
        if (message.type === 'rating_request') {
            return `
                <div class="message-content">
                    <p>${message.content}</p>
                    <div class="rating-stars">
                        ${[1,2,3,4,5].map(n => `
                            <button class="star-btn" onclick="liveChatWidget.submitRating(${n})">
                                ⭐
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Normal message
        const statusIcon = message.status === 'read' ? '✓✓' : message.status === 'sent' ? '✓' : '◷';
        
        return `
            ${message.sender.avatar ? `
                <div class="message-avatar">
                    <img src="${message.sender.avatar}" alt="${message.sender.name}">
                </div>
            ` : ''}
            <div class="message-content">
                ${message.sender.type !== 'visitor' ? `
                    <span class="message-sender">${message.sender.name}</span>
                ` : ''}
                <p>${this.escapeHtml(message.content)}</p>
            </div>
            <div class="message-meta">
                <span class="message-time">${time}</span>
                ${message.sender.type === 'visitor' ? `
                    <span class="message-status">${statusIcon}</span>
                ` : ''}
            </div>
        `;
    }

    addSystemMessage(text) {
        const container = document.getElementById('messages-container');
        const messageEl = document.createElement('div');
        messageEl.className = 'message message-system';
        messageEl.innerHTML = `<span>${text}</span>`;
        container.appendChild(messageEl);
        this.scrollToBottom();
    }

    updateMessageStatus(messageId, status) {
        const messageEl = document.getElementById(`message-${messageId}`);
        if (messageEl) {
            const statusEl = messageEl.querySelector('.message-status');
            if (statusEl) {
                statusEl.textContent = status === 'read' ? '✓✓' : '✓';
            }
        }
    }

    showAgentTyping(isTyping) {
        const indicator = document.getElementById('typing-indicator');
        if (isTyping) {
            indicator.classList.remove('hidden');
            this.scrollToBottom();
        } else {
            indicator.classList.add('hidden');
        }
    }

    updateConnectionStatus(status, text) {
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        indicator.className = `status-indicator status-${status}`;
        statusText.textContent = text;
    }

    updateUnreadBadge() {
        const badge = document.getElementById('unread-badge');
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    loadConversation(conversation) {
        const container = document.getElementById('messages-container');
        container.innerHTML = '';
        
        conversation.messages.forEach(msg => {
            this.addMessage(msg);
        });

        if (conversation.agent) {
            this.agent = conversation.agent;
        }

        this.showChat();
    }

    scrollToBottom() {
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
    }

    showError(message) {
        // Mostrar toast de error
        const toast = document.createElement('div');
        toast.className = 'chat-toast error';
        toast.textContent = message;
        document.getElementById('chat-body').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    playNotificationSound() {
        // Crear un sonido simple con Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Ignorar si no hay soporte
        }
    }

    // ========================================================================
    // PERSISTENCIA
    // ========================================================================

    saveState(additionalData = {}) {
        const state = {
            visitorId: this.visitorId,
            conversationId: this.conversationId,
            ...additionalData
        };
        localStorage.setItem('flores_chat_state', JSON.stringify(state));
    }

    getSavedState() {
        try {
            return JSON.parse(localStorage.getItem('flores_chat_state'));
        } catch {
            return null;
        }
    }

    loadSavedState() {
        const saved = this.getSavedState();
        if (saved) {
            this.visitorId = saved.visitorId;
            this.conversationId = saved.conversationId;
        }
    }

    clearState() {
        localStorage.removeItem('flores_chat_state');
        this.visitorId = null;
        this.conversationId = null;
        this.messages = [];
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================================================
    // ESTILOS
    // ========================================================================

    getStyles() {
        return `
            #live-chat-widget {
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                font-size: 14px;
            }

            .hidden {
                display: none !important;
            }

            /* Launcher Button */
            .chat-launcher {
                position: fixed;
                ${this.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
                ${this.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${this.primaryColor}, #ff6b9d);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(214, 51, 132, 0.4);
                transition: all 0.3s ease;
                z-index: 999999;
            }

            .chat-launcher:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(214, 51, 132, 0.5);
            }

            .launcher-icon {
                font-size: 26px;
            }

            .unread-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #dc3545;
                color: white;
                font-size: 12px;
                font-weight: bold;
                min-width: 20px;
                height: 20px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Chat Window */
            .chat-window {
                position: fixed;
                ${this.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
                ${this.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
                width: 370px;
                height: 550px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                z-index: 999999;
                animation: slideUp 0.3s ease;
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

            /* Header */
            .chat-header {
                background: linear-gradient(135deg, ${this.primaryColor}, #ff6b9d);
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .header-avatar {
                width: 45px;
                height: 45px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }

            .header-info h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
                opacity: 0.9;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #28a745;
            }

            .status-offline .status-dot { background: #dc3545; }
            .status-connecting .status-dot { background: #ffc107; }

            .header-actions {
                display: flex;
                gap: 5px;
            }

            .header-btn {
                width: 30px;
                height: 30px;
                border: none;
                background: rgba(255,255,255,0.2);
                color: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .header-btn:hover {
                background: rgba(255,255,255,0.3);
            }

            /* Chat Body */
            .chat-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #f8f9fa;
            }

            .messages-container {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            /* Messages */
            .message {
                display: flex;
                max-width: 85%;
                animation: fadeIn 0.2s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .message-own {
                align-self: flex-end;
                flex-direction: row-reverse;
            }

            .message-other {
                align-self: flex-start;
            }

            .message-system {
                align-self: center;
                max-width: 100%;
            }

            .message-system span {
                background: #e9ecef;
                color: #666;
                padding: 5px 12px;
                border-radius: 12px;
                font-size: 12px;
            }

            .message-content {
                background: white;
                padding: 10px 14px;
                border-radius: 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .message-own .message-content {
                background: ${this.primaryColor};
                color: white;
                border-bottom-right-radius: 4px;
            }

            .message-other .message-content {
                border-bottom-left-radius: 4px;
            }

            .message-sender {
                font-size: 11px;
                font-weight: 600;
                color: ${this.primaryColor};
                margin-bottom: 3px;
                display: block;
            }

            .message-content p {
                margin: 0;
                line-height: 1.4;
                white-space: pre-wrap;
                word-break: break-word;
            }

            .message-meta {
                display: flex;
                align-items: center;
                gap: 5px;
                margin-top: 3px;
                padding: 0 5px;
            }

            .message-time {
                font-size: 10px;
                color: #999;
            }

            .message-own .message-time {
                color: rgba(255,255,255,0.7);
            }

            .message-status {
                font-size: 10px;
                color: rgba(255,255,255,0.7);
            }

            /* Quick Replies */
            .quick-replies {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }

            .quick-reply-btn {
                padding: 8px 14px;
                background: #f0f0f0;
                border: 1px solid #ddd;
                border-radius: 20px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }

            .quick-reply-btn:hover {
                background: ${this.primaryColor};
                color: white;
                border-color: ${this.primaryColor};
            }

            /* Rating */
            .rating-stars {
                display: flex;
                gap: 5px;
                margin-top: 10px;
            }

            .star-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                opacity: 0.5;
                transition: all 0.2s;
            }

            .star-btn:hover {
                opacity: 1;
                transform: scale(1.2);
            }

            /* Typing Indicator */
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 15px;
            }

            .typing-dots {
                display: flex;
                gap: 3px;
            }

            .typing-dots span {
                width: 8px;
                height: 8px;
                background: #999;
                border-radius: 50%;
                animation: bounce 1.4s infinite;
            }

            .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes bounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-8px); }
            }

            .typing-text {
                font-size: 12px;
                color: #888;
            }

            /* Footer */
            .chat-footer {
                padding: 12px;
                background: white;
                border-top: 1px solid #eee;
            }

            .input-container {
                display: flex;
                gap: 10px;
                align-items: flex-end;
            }

            .input-container textarea {
                flex: 1;
                padding: 12px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 24px;
                resize: none;
                font-family: inherit;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
                max-height: 100px;
            }

            .input-container textarea:focus {
                border-color: ${this.primaryColor};
            }

            .send-btn {
                width: 44px;
                height: 44px;
                border: none;
                background: ${this.primaryColor};
                color: white;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .send-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            .send-btn:not(:disabled):hover {
                background: #c12574;
                transform: scale(1.05);
            }

            .footer-info {
                text-align: center;
                font-size: 10px;
                color: #999;
                margin-top: 8px;
            }

            /* Pre-chat Form */
            .prechat-form {
                position: absolute;
                top: 60px;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                padding: 30px 20px;
                z-index: 10;
            }

            .prechat-header {
                text-align: center;
                margin-bottom: 25px;
            }

            .prechat-header h3 {
                color: ${this.primaryColor};
                margin-bottom: 5px;
            }

            .prechat-header p {
                color: #666;
                font-size: 13px;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                font-size: 13px;
                font-weight: 500;
                margin-bottom: 5px;
                color: #333;
            }

            .form-group input {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 14px;
                transition: border-color 0.2s;
            }

            .form-group input:focus {
                outline: none;
                border-color: ${this.primaryColor};
            }

            .start-chat-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, ${this.primaryColor}, #ff6b9d);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 10px;
                transition: all 0.3s;
            }

            .start-chat-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(214, 51, 132, 0.3);
            }

            /* Toast */
            .chat-toast {
                position: absolute;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                animation: fadeIn 0.3s ease;
            }

            .chat-toast.error {
                background: #dc3545;
                color: white;
            }

            /* Responsive */
            @media (max-width: 480px) {
                .chat-window {
                    width: 100%;
                    height: 100%;
                    right: 0;
                    bottom: 0;
                    border-radius: 0;
                }
            }
        `;
    }
}

// ============================================================================
// AUTO-INIT
// ============================================================================

// Inicializar automáticamente si hay configuración
if (typeof window !== 'undefined') {
    window.LiveChatWidget = LiveChatWidget;
    
    // Auto-init si existe el data attribute
    document.addEventListener('DOMContentLoaded', () => {
        const autoInit = document.querySelector('[data-live-chat]');
        if (autoInit) {
            window.liveChatWidget = new LiveChatWidget({
                wsUrl: autoInit.dataset.wsUrl,
                primaryColor: autoInit.dataset.primaryColor
            });
        }
    });
}

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LiveChatWidget };
}
