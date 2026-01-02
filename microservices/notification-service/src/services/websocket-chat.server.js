/**
 * WebSocket Server para Chat en Vivo - Flores Victoria
 * Manejo de conexiones en tiempo real
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const {
    LiveChatService,
    CONVERSATION_STATUS,
    MESSAGE_TYPES
} = require('./live-chat.service');

// ============================================================================
// WEBSOCKET CHAT SERVER
// ============================================================================

class WebSocketChatServer {
    constructor(server, options = {}) {
        this.wss = new WebSocket.Server({ 
            server,
            path: options.path || '/ws/chat'
        });
        
        this.chatService = new LiveChatService();
        this.connections = new Map(); // socketId -> { ws, type, userId, conversationId }
        this.heartbeatInterval = options.heartbeatInterval || 30000;
        
        this.init();
    }

    init() {
        // Configurar eventos del WebSocket Server
        this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
        
        // Configurar eventos del chat service
        this.setupChatServiceEvents();
        
        // Iniciar heartbeat
        this.startHeartbeat();
        
        console.log('🔌 WebSocket Chat Server inicializado');
    }

    // ========================================================================
    // MANEJO DE CONEXIONES
    // ========================================================================

    handleConnection(ws, req) {
        const socketId = uuidv4();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        console.log(`📱 Nueva conexión WebSocket: ${socketId} desde ${ip}`);

        // Guardar conexión
        this.connections.set(socketId, {
            ws,
            socketId,
            type: null, // 'visitor' | 'agent'
            userId: null,
            conversationId: null,
            isAlive: true,
            connectedAt: new Date()
        });

        // Configurar eventos del socket
        ws.on('message', (data) => this.handleMessage(socketId, data));
        ws.on('close', () => this.handleDisconnection(socketId));
        ws.on('error', (error) => this.handleError(socketId, error));
        ws.on('pong', () => {
            const conn = this.connections.get(socketId);
            if (conn) conn.isAlive = true;
        });

        // Enviar confirmación de conexión
        this.send(socketId, {
            type: 'connected',
            socketId,
            timestamp: new Date().toISOString()
        });
    }

    handleDisconnection(socketId) {
        const connection = this.connections.get(socketId);
        if (!connection) return;

        console.log(`📴 Desconexión: ${socketId}`);

        // Si es un agente, desconectarlo del servicio
        if (connection.type === 'agent' && connection.userId) {
            this.chatService.disconnectAgent(connection.userId);
        }

        // Si es un visitante en conversación, notificar
        if (connection.type === 'visitor' && connection.conversationId) {
            const conv = this.chatService.getConversation(connection.conversationId);
            if (conv && conv.agent) {
                this.broadcastToConversation(connection.conversationId, {
                    type: 'visitor_disconnected',
                    conversationId: connection.conversationId
                }, socketId);
            }
        }

        this.connections.delete(socketId);
    }

    handleError(socketId, error) {
        console.error(`❌ Error en socket ${socketId}:`, error.message);
    }

    // ========================================================================
    // PROCESAMIENTO DE MENSAJES
    // ========================================================================

    handleMessage(socketId, rawData) {
        try {
            const data = JSON.parse(rawData.toString());
            const connection = this.connections.get(socketId);

            if (!connection) return;

            console.log(`📨 Mensaje recibido [${socketId}]:`, data.type);

            switch (data.type) {
                // ============ AUTENTICACIÓN ============
                case 'auth:visitor':
                    this.handleVisitorAuth(socketId, data);
                    break;

                case 'auth:agent':
                    this.handleAgentAuth(socketId, data);
                    break;

                // ============ CONVERSACIONES ============
                case 'conversation:start':
                    this.handleStartConversation(socketId, data);
                    break;

                case 'conversation:join':
                    this.handleJoinConversation(socketId, data);
                    break;

                // ============ MENSAJES ============
                case 'message:send':
                    this.handleSendMessage(socketId, data);
                    break;

                case 'message:read':
                    this.handleMessageRead(socketId, data);
                    break;

                case 'message:typing':
                    this.handleTyping(socketId, data);
                    break;

                case 'quick_reply:select':
                    this.handleQuickReply(socketId, data);
                    break;

                // ============ AGENTE ============
                case 'agent:status':
                    this.handleAgentStatus(socketId, data);
                    break;

                case 'agent:assign':
                    this.handleAgentAssign(socketId, data);
                    break;

                case 'agent:transfer':
                    this.handleAgentTransfer(socketId, data);
                    break;

                case 'conversation:resolve':
                    this.handleResolveConversation(socketId, data);
                    break;

                // ============ RATING ============
                case 'rating:submit':
                    this.handleRatingSubmit(socketId, data);
                    break;

                // ============ ADMIN ============
                case 'admin:stats':
                    this.handleGetStats(socketId);
                    break;

                case 'admin:conversations':
                    this.handleGetConversations(socketId, data);
                    break;

                default:
                    this.send(socketId, {
                        type: 'error',
                        message: `Tipo de mensaje no reconocido: ${data.type}`
                    });
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
            this.send(socketId, {
                type: 'error',
                message: 'Error procesando mensaje'
            });
        }
    }

    // ========================================================================
    // HANDLERS
    // ========================================================================

    handleVisitorAuth(socketId, data) {
        const connection = this.connections.get(socketId);
        connection.type = 'visitor';
        connection.userId = data.visitorId || `visitor-${uuidv4()}`;
        connection.userData = {
            name: data.name || 'Visitante',
            email: data.email,
            userId: data.userId // Si está logueado
        };

        this.send(socketId, {
            type: 'auth:success',
            visitorId: connection.userId
        });
    }

    handleAgentAuth(socketId, data) {
        // Validar token de agente (en producción)
        const connection = this.connections.get(socketId);
        connection.type = 'agent';
        connection.userId = data.agentId;

        // Registrar agente en el servicio
        const agent = this.chatService.registerAgent({
            id: data.agentId,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            maxChats: data.maxChats || 5,
            skills: data.skills || []
        });

        this.send(socketId, {
            type: 'auth:success',
            agent,
            waitingConversations: this.chatService.getWaitingConversations(),
            myConversations: this.chatService.getAgentConversations(data.agentId)
        });
    }

    handleStartConversation(socketId, data) {
        const connection = this.connections.get(socketId);
        if (connection.type !== 'visitor') return;

        const result = this.chatService.startConversation({
            visitorId: connection.userId,
            visitorName: connection.userData?.name,
            visitorEmail: connection.userData?.email,
            userId: connection.userData?.userId,
            currentPage: data.currentPage,
            userAgent: data.userAgent,
            metadata: data.metadata
        });

        connection.conversationId = result.conversation.id;

        this.send(socketId, {
            type: 'conversation:started',
            ...result
        });
    }

    handleJoinConversation(socketId, data) {
        const connection = this.connections.get(socketId);
        const { conversationId } = data;

        const conversation = this.chatService.getConversation(conversationId);
        if (!conversation) {
            return this.send(socketId, {
                type: 'error',
                message: 'Conversación no encontrada'
            });
        }

        connection.conversationId = conversationId;

        this.send(socketId, {
            type: 'conversation:joined',
            conversation
        });
    }

    handleSendMessage(socketId, data) {
        const connection = this.connections.get(socketId);
        if (!connection.conversationId) {
            return this.send(socketId, {
                type: 'error',
                message: 'No estás en una conversación'
            });
        }

        try {
            const senderData = {
                id: connection.userId,
                name: connection.type === 'agent' 
                    ? this.chatService.agents.get(connection.userId)?.name 
                    : connection.userData?.name || 'Visitante',
                type: connection.type,
                avatar: connection.type === 'agent'
                    ? this.chatService.agents.get(connection.userId)?.avatar
                    : null
            };

            const message = this.chatService.sendMessage(
                connection.conversationId,
                senderData,
                data.content,
                data.messageType || MESSAGE_TYPES.TEXT
            );

            // Confirmar al remitente
            this.send(socketId, {
                type: 'message:sent',
                message
            });

            // El broadcast se hace a través del evento del servicio

        } catch (error) {
            this.send(socketId, {
                type: 'error',
                message: error.message
            });
        }
    }

    handleMessageRead(socketId, data) {
        const connection = this.connections.get(socketId);
        this.chatService.markAsRead(
            data.conversationId || connection.conversationId,
            data.messageId,
            connection.userId
        );
    }

    handleTyping(socketId, data) {
        const connection = this.connections.get(socketId);
        if (!connection.conversationId) return;

        this.chatService.setTyping(
            connection.conversationId,
            connection.userId,
            data.isTyping
        );
    }

    handleQuickReply(socketId, data) {
        const connection = this.connections.get(socketId);
        if (!connection.conversationId) return;

        // Primero enviar el mensaje del usuario
        const senderData = {
            id: connection.userId,
            name: connection.userData?.name || 'Visitante',
            type: 'visitor'
        };

        this.chatService.sendMessage(
            connection.conversationId,
            senderData,
            data.text,
            MESSAGE_TYPES.TEXT
        );

        // Luego procesar la respuesta del bot
        this.chatService.handleQuickReply(connection.conversationId, data.replyId);
    }

    handleAgentStatus(socketId, data) {
        const connection = this.connections.get(socketId);
        if (connection.type !== 'agent') return;

        const agent = this.chatService.updateAgentStatus(
            connection.userId,
            data.status
        );

        this.send(socketId, {
            type: 'agent:status_updated',
            agent
        });
    }

    handleAgentAssign(socketId, data) {
        const connection = this.connections.get(socketId);
        if (connection.type !== 'agent') return;

        const success = this.chatService.assignAgent(
            data.conversationId,
            connection.userId
        );

        if (success) {
            connection.conversationId = data.conversationId;
            const conversation = this.chatService.getConversation(data.conversationId);
            
            this.send(socketId, {
                type: 'conversation:assigned_success',
                conversation
            });
        } else {
            this.send(socketId, {
                type: 'error',
                message: 'No se pudo asignar la conversación'
            });
        }
    }

    handleAgentTransfer(socketId, data) {
        const connection = this.connections.get(socketId);
        if (connection.type !== 'agent') return;

        try {
            const conversation = this.chatService.transferConversation(
                data.conversationId,
                connection.userId,
                data.toAgentId,
                data.reason
            );

            this.send(socketId, {
                type: 'conversation:transferred_success',
                conversation
            });
        } catch (error) {
            this.send(socketId, {
                type: 'error',
                message: error.message
            });
        }
    }

    handleResolveConversation(socketId, data) {
        const connection = this.connections.get(socketId);
        if (connection.type !== 'agent') return;

        try {
            const conversation = this.chatService.resolveConversation(
                data.conversationId,
                data.resolution
            );

            this.send(socketId, {
                type: 'conversation:resolved_success',
                conversation
            });
        } catch (error) {
            this.send(socketId, {
                type: 'error',
                message: error.message
            });
        }
    }

    handleRatingSubmit(socketId, data) {
        const connection = this.connections.get(socketId);
        
        this.chatService.saveRating(
            data.conversationId || connection.conversationId,
            data.rating,
            data.feedback
        );

        this.send(socketId, {
            type: 'rating:submitted',
            success: true
        });
    }

    handleGetStats(socketId) {
        const stats = this.chatService.getStats();
        this.send(socketId, {
            type: 'admin:stats_result',
            stats
        });
    }

    handleGetConversations(socketId, data) {
        const connection = this.connections.get(socketId);
        
        let conversations;
        if (data.filter === 'waiting') {
            conversations = this.chatService.getWaitingConversations();
        } else if (data.filter === 'my' && connection.type === 'agent') {
            conversations = this.chatService.getAgentConversations(connection.userId);
        } else if (data.search) {
            conversations = this.chatService.searchConversations(data.search);
        } else {
            conversations = Array.from(this.chatService.conversations.values())
                .slice(0, 50);
        }

        this.send(socketId, {
            type: 'admin:conversations_result',
            conversations
        });
    }

    // ========================================================================
    // EVENTOS DEL CHAT SERVICE
    // ========================================================================

    setupChatServiceEvents() {
        // Nuevo mensaje
        this.chatService.on('message:new', ({ conversationId, message }) => {
            this.broadcastToConversation(conversationId, {
                type: 'message:new',
                conversationId,
                message
            });
        });

        // Mensaje leído
        this.chatService.on('message:read', ({ conversationId, messageId, readerId }) => {
            this.broadcastToConversation(conversationId, {
                type: 'message:read',
                conversationId,
                messageId,
                readerId
            });
        });

        // Typing
        this.chatService.on('typing', ({ conversationId, userId, isTyping }) => {
            this.broadcastToConversation(conversationId, {
                type: 'typing',
                conversationId,
                userId,
                isTyping
            });
        });

        // Nueva conversación (notificar a agentes)
        this.chatService.on('conversation:new', (conversation) => {
            this.broadcastToAgents({
                type: 'conversation:new',
                conversation
            });
        });

        // Conversación asignada
        this.chatService.on('conversation:assigned', ({ conversationId, agentId }) => {
            const conversation = this.chatService.getConversation(conversationId);
            this.broadcastToConversation(conversationId, {
                type: 'conversation:assigned',
                conversationId,
                agent: conversation.agent
            });
        });

        // Conversación resuelta
        this.chatService.on('conversation:resolved', (conversation) => {
            this.broadcastToConversation(conversation.id, {
                type: 'conversation:resolved',
                conversationId: conversation.id
            });
        });

        // Agente online
        this.chatService.on('agent:online', (agent) => {
            this.broadcastToAgents({
                type: 'agent:online',
                agent: { id: agent.id, name: agent.name, status: agent.status }
            });
        });

        // Agente offline
        this.chatService.on('agent:offline', (agent) => {
            this.broadcastToAgents({
                type: 'agent:offline',
                agentId: agent.id
            });
        });
    }

    // ========================================================================
    // UTILIDADES DE COMUNICACIÓN
    // ========================================================================

    send(socketId, data) {
        const connection = this.connections.get(socketId);
        if (connection && connection.ws.readyState === WebSocket.OPEN) {
            connection.ws.send(JSON.stringify(data));
        }
    }

    broadcast(data, excludeSocketId = null) {
        const message = JSON.stringify(data);
        for (const [socketId, conn] of this.connections) {
            if (socketId !== excludeSocketId && conn.ws.readyState === WebSocket.OPEN) {
                conn.ws.send(message);
            }
        }
    }

    broadcastToConversation(conversationId, data, excludeSocketId = null) {
        const message = JSON.stringify(data);
        for (const [socketId, conn] of this.connections) {
            if (
                socketId !== excludeSocketId &&
                conn.conversationId === conversationId &&
                conn.ws.readyState === WebSocket.OPEN
            ) {
                conn.ws.send(message);
            }
        }
    }

    broadcastToAgents(data) {
        const message = JSON.stringify(data);
        for (const [, conn] of this.connections) {
            if (conn.type === 'agent' && conn.ws.readyState === WebSocket.OPEN) {
                conn.ws.send(message);
            }
        }
    }

    // ========================================================================
    // HEARTBEAT
    // ========================================================================

    startHeartbeat() {
        setInterval(() => {
            for (const [socketId, conn] of this.connections) {
                if (!conn.isAlive) {
                    console.log(`💔 Heartbeat fallido: ${socketId}`);
                    conn.ws.terminate();
                    this.connections.delete(socketId);
                    continue;
                }
                conn.isAlive = false;
                conn.ws.ping();
            }
        }, this.heartbeatInterval);
    }

    // ========================================================================
    // GETTERS
    // ========================================================================

    getOnlineAgents() {
        return Array.from(this.chatService.agents.values())
            .filter(a => a.status !== 'offline');
    }

    getConnectionCount() {
        return this.connections.size;
    }

    getStats() {
        return {
            connections: this.connections.size,
            visitors: Array.from(this.connections.values()).filter(c => c.type === 'visitor').length,
            agents: Array.from(this.connections.values()).filter(c => c.type === 'agent').length,
            ...this.chatService.getStats()
        };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = { WebSocketChatServer };
