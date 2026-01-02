/**
 * Servicio de Chat en Vivo - Flores Victoria
 * Sistema de soporte en tiempo real con WebSockets
 */

const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CHAT_CONFIG = {
    maxMessageLength: 2000,
    maxAttachmentSize: 5 * 1024 * 1024, // 5MB
    typingTimeout: 3000, // 3 segundos
    inactivityTimeout: 30 * 60 * 1000, // 30 minutos
    autoGreetingDelay: 2000, // 2 segundos
    maxMessagesPerConversation: 500
};

// Estados de conversación
const CONVERSATION_STATUS = {
    WAITING: 'waiting',      // Esperando agente
    ACTIVE: 'active',        // En conversación
    ON_HOLD: 'on_hold',      // En espera
    RESOLVED: 'resolved',    // Resuelto
    CLOSED: 'closed'         // Cerrado
};

// Tipos de mensaje
const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
    SYSTEM: 'system',
    BOT: 'bot',
    QUICK_REPLY: 'quick_reply'
};

// Prioridades
const PRIORITIES = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
};

// Respuestas automáticas del bot
const BOT_RESPONSES = {
    greeting: '¡Hola! 🌸 Bienvenido a Flores Victoria. ¿En qué podemos ayudarte hoy?',
    waiting: 'Un agente se conectará contigo en breve. Mientras tanto, ¿puedes describir tu consulta?',
    away: 'Nuestros agentes no están disponibles en este momento. Déjanos tu mensaje y te responderemos pronto.',
    quickReplies: [
        { id: 'order-status', text: '📦 Estado de mi pedido' },
        { id: 'delivery', text: '🚚 Consulta sobre envío' },
        { id: 'products', text: '🌹 Información de productos' },
        { id: 'complaint', text: '⚠️ Reclamo o problema' },
        { id: 'other', text: '💬 Otra consulta' }
    ],
    orderStatus: 'Por favor, proporciona tu número de pedido y te daré información actualizada.',
    delivery: '¿Tienes alguna pregunta sobre el envío de tu pedido o nuestras zonas de cobertura?',
    products: '¿Qué producto te interesa? Puedo darte información sobre precios, disponibilidad y más.',
    complaint: 'Lamentamos que hayas tenido un problema. Un agente te atenderá con prioridad.',
    thanks: '¡Gracias por contactarnos! ¿Hay algo más en lo que podamos ayudarte?',
    goodbye: '¡Gracias por elegir Flores Victoria! 🌸 ¡Que tengas un excelente día!'
};

// ============================================================================
// CLASE PRINCIPAL - CHAT SERVICE
// ============================================================================

class LiveChatService extends EventEmitter {
    constructor() {
        super();
        this.conversations = new Map();
        this.agents = new Map();
        this.userSessions = new Map();
        this.messageQueue = [];
        this.stats = {
            totalConversations: 0,
            activeConversations: 0,
            resolvedToday: 0,
            avgResponseTime: 0,
            avgResolutionTime: 0
        };
    }

    // ========================================================================
    // GESTIÓN DE CONVERSACIONES
    // ========================================================================

    /**
     * Iniciar nueva conversación
     */
    startConversation(userData) {
        const {
            visitorId,
            visitorName,
            visitorEmail,
            userId,
            currentPage,
            userAgent,
            metadata = {}
        } = userData;

        // Verificar si ya existe una conversación activa
        const existingConv = this.findActiveConversation(visitorId || userId);
        if (existingConv) {
            return {
                success: true,
                conversation: existingConv,
                isExisting: true
            };
        }

        const conversation = {
            id: `conv-${uuidv4()}`,
            status: CONVERSATION_STATUS.WAITING,
            priority: PRIORITIES.NORMAL,
            
            // Datos del visitante
            visitor: {
                id: visitorId || `visitor-${uuidv4()}`,
                name: visitorName || 'Visitante',
                email: visitorEmail || null,
                userId: userId || null,
                isAuthenticated: !!userId
            },
            
            // Contexto
            context: {
                startPage: currentPage,
                userAgent,
                ...metadata
            },
            
            // Agente asignado
            agent: null,
            
            // Mensajes
            messages: [],
            
            // Tiempos
            createdAt: new Date(),
            updatedAt: new Date(),
            firstResponseAt: null,
            resolvedAt: null,
            
            // Metadata
            tags: [],
            notes: '',
            rating: null,
            feedback: null
        };

        this.conversations.set(conversation.id, conversation);
        this.stats.totalConversations++;
        this.stats.activeConversations++;

        // Enviar saludo automático
        setTimeout(() => {
            this.addBotMessage(conversation.id, BOT_RESPONSES.greeting);
            
            // Enviar quick replies
            setTimeout(() => {
                this.addQuickReplies(conversation.id, BOT_RESPONSES.quickReplies);
            }, 1000);
        }, CHAT_CONFIG.autoGreetingDelay);

        // Emitir evento
        this.emit('conversation:new', conversation);

        // Intentar asignar agente
        this.tryAssignAgent(conversation.id);

        return {
            success: true,
            conversation,
            isExisting: false
        };
    }

    /**
     * Buscar conversación activa de un usuario
     */
    findActiveConversation(visitorOrUserId) {
        for (const [, conv] of this.conversations) {
            if (
                (conv.visitor.id === visitorOrUserId || conv.visitor.userId === visitorOrUserId) &&
                conv.status !== CONVERSATION_STATUS.CLOSED &&
                conv.status !== CONVERSATION_STATUS.RESOLVED
            ) {
                return conv;
            }
        }
        return null;
    }

    /**
     * Obtener conversación por ID
     */
    getConversation(conversationId) {
        return this.conversations.get(conversationId);
    }

    /**
     * Enviar mensaje
     */
    sendMessage(conversationId, senderData, content, type = MESSAGE_TYPES.TEXT) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error('Conversación no encontrada');
        }

        // Validar longitud
        if (content.length > CHAT_CONFIG.maxMessageLength) {
            throw new Error(`El mensaje excede el límite de ${CHAT_CONFIG.maxMessageLength} caracteres`);
        }

        const message = {
            id: `msg-${uuidv4()}`,
            conversationId,
            type,
            content,
            sender: {
                id: senderData.id,
                name: senderData.name,
                type: senderData.type, // 'visitor', 'agent', 'bot', 'system'
                avatar: senderData.avatar || null
            },
            timestamp: new Date(),
            status: 'sent',
            readAt: null,
            metadata: senderData.metadata || {}
        };

        conversation.messages.push(message);
        conversation.updatedAt = new Date();

        // Si es el primer mensaje del agente, registrar tiempo de respuesta
        if (senderData.type === 'agent' && !conversation.firstResponseAt) {
            conversation.firstResponseAt = new Date();
            const responseTime = conversation.firstResponseAt - conversation.createdAt;
            this.updateAverageResponseTime(responseTime);
        }

        // Emitir evento
        this.emit('message:new', {
            conversationId,
            message
        });

        // Procesar respuestas automáticas si es del visitante
        if (senderData.type === 'visitor' && conversation.status === CONVERSATION_STATUS.WAITING) {
            this.processBotResponse(conversationId, content);
        }

        return message;
    }

    /**
     * Agregar mensaje del bot
     */
    addBotMessage(conversationId, content) {
        return this.sendMessage(
            conversationId,
            {
                id: 'bot',
                name: 'Asistente Victoria',
                type: 'bot'
            },
            content,
            MESSAGE_TYPES.BOT
        );
    }

    /**
     * Agregar quick replies
     */
    addQuickReplies(conversationId, replies) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        const message = {
            id: `msg-${uuidv4()}`,
            conversationId,
            type: MESSAGE_TYPES.QUICK_REPLY,
            content: 'Selecciona una opción:',
            quickReplies: replies,
            sender: {
                id: 'bot',
                name: 'Asistente Victoria',
                type: 'bot'
            },
            timestamp: new Date(),
            status: 'sent'
        };

        conversation.messages.push(message);
        this.emit('message:new', { conversationId, message });
    }

    /**
     * Manejar selección de quick reply
     */
    handleQuickReply(conversationId, replyId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        const responses = {
            'order-status': BOT_RESPONSES.orderStatus,
            'delivery': BOT_RESPONSES.delivery,
            'products': BOT_RESPONSES.products,
            'complaint': () => {
                conversation.priority = PRIORITIES.HIGH;
                return BOT_RESPONSES.complaint;
            },
            'other': BOT_RESPONSES.waiting
        };

        const response = responses[replyId];
        if (response) {
            const message = typeof response === 'function' ? response() : response;
            this.addBotMessage(conversationId, message);
        }

        // Intentar asignar agente con mayor prioridad si es reclamo
        if (replyId === 'complaint') {
            this.tryAssignAgent(conversationId);
        }
    }

    /**
     * Procesar respuesta automática del bot
     */
    processBotResponse(conversationId, userMessage) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        const lowerMessage = userMessage.toLowerCase();

        // Detectar intención básica
        if (lowerMessage.includes('pedido') || lowerMessage.includes('orden') || lowerMessage.includes('order')) {
            this.addBotMessage(conversationId, BOT_RESPONSES.orderStatus);
        } else if (lowerMessage.includes('envío') || lowerMessage.includes('entrega') || lowerMessage.includes('delivery')) {
            this.addBotMessage(conversationId, BOT_RESPONSES.delivery);
        } else if (lowerMessage.includes('gracias') || lowerMessage.includes('thanks')) {
            this.addBotMessage(conversationId, BOT_RESPONSES.thanks);
        } else if (lowerMessage.includes('problema') || lowerMessage.includes('reclamo') || lowerMessage.includes('queja')) {
            conversation.priority = PRIORITIES.HIGH;
            this.addBotMessage(conversationId, BOT_RESPONSES.complaint);
            this.tryAssignAgent(conversationId);
        }
    }

    /**
     * Marcar mensaje como leído
     */
    markAsRead(conversationId, messageId, readerId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        const message = conversation.messages.find(m => m.id === messageId);
        if (message && !message.readAt) {
            message.readAt = new Date();
            message.readBy = readerId;
            this.emit('message:read', { conversationId, messageId, readerId });
        }
    }

    /**
     * Indicador de escritura
     */
    setTyping(conversationId, userId, isTyping) {
        this.emit('typing', {
            conversationId,
            userId,
            isTyping
        });
    }

    // ========================================================================
    // GESTIÓN DE AGENTES
    // ========================================================================

    /**
     * Registrar agente
     */
    registerAgent(agentData) {
        const agent = {
            id: agentData.id,
            name: agentData.name,
            email: agentData.email,
            avatar: agentData.avatar || null,
            status: 'available', // available, busy, away, offline
            maxConcurrentChats: agentData.maxChats || 5,
            activeChats: 0,
            skills: agentData.skills || [],
            lastActivity: new Date(),
            stats: {
                totalChats: 0,
                resolvedChats: 0,
                avgRating: 0
            }
        };

        this.agents.set(agent.id, agent);
        this.emit('agent:online', agent);

        // Asignar chats en espera
        this.assignPendingChats(agent.id);

        return agent;
    }

    /**
     * Actualizar estado del agente
     */
    updateAgentStatus(agentId, status) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;

        agent.status = status;
        agent.lastActivity = new Date();
        this.emit('agent:status', { agentId, status });

        if (status === 'available') {
            this.assignPendingChats(agentId);
        }

        return agent;
    }

    /**
     * Desconectar agente
     */
    disconnectAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        // Reasignar sus conversaciones activas
        for (const [, conv] of this.conversations) {
            if (conv.agent?.id === agentId && conv.status === CONVERSATION_STATUS.ACTIVE) {
                conv.agent = null;
                conv.status = CONVERSATION_STATUS.WAITING;
                this.addBotMessage(conv.id, 'El agente se ha desconectado. Te asignaremos otro agente pronto.');
                this.tryAssignAgent(conv.id);
            }
        }

        agent.status = 'offline';
        this.emit('agent:offline', agent);
    }

    /**
     * Intentar asignar agente a conversación
     */
    tryAssignAgent(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation || conversation.agent) return false;

        // Buscar agente disponible
        const availableAgent = this.findAvailableAgent(conversation);
        
        if (availableAgent) {
            this.assignAgent(conversationId, availableAgent.id);
            return true;
        }

        // No hay agentes disponibles
        if (!conversation.messages.some(m => m.content.includes('no están disponibles'))) {
            const isBusinessHours = this.isBusinessHours();
            if (!isBusinessHours) {
                this.addBotMessage(conversationId, BOT_RESPONSES.away);
            }
        }

        return false;
    }

    /**
     * Buscar agente disponible
     */
    findAvailableAgent(conversation) {
        let bestAgent = null;
        let lowestLoad = Infinity;

        for (const [, agent] of this.agents) {
            if (
                agent.status === 'available' &&
                agent.activeChats < agent.maxConcurrentChats
            ) {
                // Priorizar por carga
                if (agent.activeChats < lowestLoad) {
                    lowestLoad = agent.activeChats;
                    bestAgent = agent;
                }
            }
        }

        return bestAgent;
    }

    /**
     * Asignar agente a conversación
     */
    assignAgent(conversationId, agentId) {
        const conversation = this.conversations.get(conversationId);
        const agent = this.agents.get(agentId);

        if (!conversation || !agent) return false;

        conversation.agent = {
            id: agent.id,
            name: agent.name,
            avatar: agent.avatar
        };
        conversation.status = CONVERSATION_STATUS.ACTIVE;
        agent.activeChats++;

        // Mensaje de sistema
        this.sendMessage(
            conversationId,
            { id: 'system', name: 'Sistema', type: 'system' },
            `${agent.name} se ha unido al chat`,
            MESSAGE_TYPES.SYSTEM
        );

        this.emit('conversation:assigned', { conversationId, agentId });

        return true;
    }

    /**
     * Asignar chats pendientes a un agente
     */
    assignPendingChats(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent || agent.status !== 'available') return;

        // Ordenar por prioridad y tiempo de espera
        const waitingConversations = Array.from(this.conversations.values())
            .filter(c => c.status === CONVERSATION_STATUS.WAITING && !c.agent)
            .sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

        for (const conv of waitingConversations) {
            if (agent.activeChats >= agent.maxConcurrentChats) break;
            this.assignAgent(conv.id, agentId);
        }
    }

    /**
     * Transferir conversación a otro agente
     */
    transferConversation(conversationId, fromAgentId, toAgentId, reason = '') {
        const conversation = this.conversations.get(conversationId);
        const fromAgent = this.agents.get(fromAgentId);
        const toAgent = this.agents.get(toAgentId);

        if (!conversation || !fromAgent || !toAgent) {
            throw new Error('Conversación o agentes no encontrados');
        }

        // Actualizar contadores
        fromAgent.activeChats--;
        toAgent.activeChats++;

        // Actualizar conversación
        const oldAgent = conversation.agent;
        conversation.agent = {
            id: toAgent.id,
            name: toAgent.name,
            avatar: toAgent.avatar
        };

        // Agregar nota interna
        conversation.notes += `\n[${new Date().toISOString()}] Transferido de ${oldAgent.name} a ${toAgent.name}. Razón: ${reason}`;

        // Mensaje de sistema
        this.sendMessage(
            conversationId,
            { id: 'system', name: 'Sistema', type: 'system' },
            `La conversación ha sido transferida a ${toAgent.name}`,
            MESSAGE_TYPES.SYSTEM
        );

        this.emit('conversation:transferred', {
            conversationId,
            fromAgentId,
            toAgentId,
            reason
        });

        return conversation;
    }

    // ========================================================================
    // RESOLUCIÓN Y CIERRE
    // ========================================================================

    /**
     * Resolver conversación
     */
    resolveConversation(conversationId, resolution = {}) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error('Conversación no encontrada');
        }

        conversation.status = CONVERSATION_STATUS.RESOLVED;
        conversation.resolvedAt = new Date();
        conversation.resolution = resolution;

        // Actualizar estadísticas
        this.stats.activeConversations--;
        this.stats.resolvedToday++;

        // Actualizar tiempo de resolución promedio
        const resolutionTime = conversation.resolvedAt - conversation.createdAt;
        this.updateAverageResolutionTime(resolutionTime);

        // Liberar agente
        if (conversation.agent) {
            const agent = this.agents.get(conversation.agent.id);
            if (agent) {
                agent.activeChats--;
                agent.stats.resolvedChats++;
            }
        }

        // Mensaje de cierre
        this.addBotMessage(conversationId, BOT_RESPONSES.goodbye);

        // Solicitar calificación
        setTimeout(() => {
            this.requestRating(conversationId);
        }, 1000);

        this.emit('conversation:resolved', conversation);

        return conversation;
    }

    /**
     * Cerrar conversación
     */
    closeConversation(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        if (conversation.status !== CONVERSATION_STATUS.RESOLVED) {
            conversation.status = CONVERSATION_STATUS.CLOSED;
        }

        conversation.closedAt = new Date();

        if (conversation.agent) {
            const agent = this.agents.get(conversation.agent.id);
            if (agent && agent.activeChats > 0) {
                agent.activeChats--;
            }
        }

        if (this.stats.activeConversations > 0) {
            this.stats.activeConversations--;
        }

        this.emit('conversation:closed', conversation);
    }

    /**
     * Solicitar calificación
     */
    requestRating(conversationId) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        const message = {
            id: `msg-${uuidv4()}`,
            conversationId,
            type: 'rating_request',
            content: '¿Cómo calificarías tu experiencia?',
            sender: { id: 'system', type: 'system' },
            timestamp: new Date(),
            ratingOptions: [1, 2, 3, 4, 5]
        };

        conversation.messages.push(message);
        this.emit('message:new', { conversationId, message });
    }

    /**
     * Guardar calificación
     */
    saveRating(conversationId, rating, feedback = '') {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) return;

        conversation.rating = rating;
        conversation.feedback = feedback;

        // Actualizar promedio del agente
        if (conversation.agent) {
            const agent = this.agents.get(conversation.agent.id);
            if (agent) {
                const totalRatings = agent.stats.resolvedChats || 1;
                agent.stats.avgRating = (
                    (agent.stats.avgRating * (totalRatings - 1) + rating) / totalRatings
                ).toFixed(1);
            }
        }

        this.emit('conversation:rated', {
            conversationId,
            rating,
            feedback
        });

        this.addBotMessage(
            conversationId,
            rating >= 4 
                ? '¡Gracias por tu calificación! 🌸 Nos alegra haberte ayudado.'
                : 'Gracias por tu feedback. Trabajaremos para mejorar.'
        );
    }

    // ========================================================================
    // ESTADÍSTICAS Y REPORTES
    // ========================================================================

    getStats() {
        const onlineAgents = Array.from(this.agents.values())
            .filter(a => a.status !== 'offline').length;

        const avgWaitTime = this.calculateAverageWaitTime();

        return {
            ...this.stats,
            onlineAgents,
            avgWaitTime,
            conversationsByStatus: this.getConversationsByStatus(),
            conversationsByPriority: this.getConversationsByPriority()
        };
    }

    getConversationsByStatus() {
        const counts = {};
        for (const status of Object.values(CONVERSATION_STATUS)) {
            counts[status] = 0;
        }
        for (const [, conv] of this.conversations) {
            counts[conv.status]++;
        }
        return counts;
    }

    getConversationsByPriority() {
        const counts = {};
        for (const priority of Object.values(PRIORITIES)) {
            counts[priority] = 0;
        }
        for (const [, conv] of this.conversations) {
            if (conv.status !== CONVERSATION_STATUS.CLOSED) {
                counts[conv.priority]++;
            }
        }
        return counts;
    }

    calculateAverageWaitTime() {
        const waitingConvs = Array.from(this.conversations.values())
            .filter(c => c.status === CONVERSATION_STATUS.WAITING);

        if (waitingConvs.length === 0) return 0;

        const totalWaitTime = waitingConvs.reduce((sum, conv) => {
            return sum + (Date.now() - new Date(conv.createdAt).getTime());
        }, 0);

        return Math.round(totalWaitTime / waitingConvs.length / 1000); // segundos
    }

    updateAverageResponseTime(newTime) {
        const currentAvg = this.stats.avgResponseTime;
        const count = this.stats.totalConversations;
        this.stats.avgResponseTime = Math.round(
            (currentAvg * (count - 1) + newTime) / count
        );
    }

    updateAverageResolutionTime(newTime) {
        const currentAvg = this.stats.avgResolutionTime;
        const count = this.stats.resolvedToday || 1;
        this.stats.avgResolutionTime = Math.round(
            (currentAvg * (count - 1) + newTime) / count
        );
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    isBusinessHours() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        // Lunes a Viernes 9:00 - 18:00, Sábado 10:00 - 14:00
        if (day >= 1 && day <= 5) {
            return hour >= 9 && hour < 18;
        } else if (day === 6) {
            return hour >= 10 && hour < 14;
        }
        return false;
    }

    getWaitingConversations() {
        return Array.from(this.conversations.values())
            .filter(c => c.status === CONVERSATION_STATUS.WAITING)
            .sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
    }

    getAgentConversations(agentId) {
        return Array.from(this.conversations.values())
            .filter(c => c.agent?.id === agentId && c.status === CONVERSATION_STATUS.ACTIVE);
    }

    searchConversations(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.conversations.values())
            .filter(conv => 
                conv.visitor.name?.toLowerCase().includes(lowerQuery) ||
                conv.visitor.email?.toLowerCase().includes(lowerQuery) ||
                conv.messages.some(m => m.content.toLowerCase().includes(lowerQuery))
            );
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    LiveChatService,
    CONVERSATION_STATUS,
    MESSAGE_TYPES,
    PRIORITIES,
    BOT_RESPONSES,
    CHAT_CONFIG
};
