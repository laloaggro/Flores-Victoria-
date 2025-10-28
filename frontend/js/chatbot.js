/**
 * 🤖 Flores Victoria AI Chatbot
 * Intelligent conversational assistant for floristry queries and customer support
 *
 * @author Eduardo Garay (@laloaggro)
 * @version 2.1.0
 * @license MIT
 */

class FloresVictoriaChatbot {
  constructor(options = {}) {
    this.apiBaseUrl = options.apiUrl || 'http://localhost:3013';
    this.userId = options.userId || this.getUserId();
    this.sessionId = this.generateSessionId();
    this.conversation = [];
    this.isTyping = false;
    this.isInitialized = false;

    // Knowledge base for flowers and floristry
    this.flowerKnowledge = this.initializeFlowerKnowledge();
    this.occasionMapping = this.initializeOccasionMapping();
    this.careInstructions = this.initializeCareInstructions();

    this.initialize();
  }

  /**
   * 🚀 Initialize the chatbot
   */
  async initialize() {
    try {
      console.log('🤖 Inicializando Flores Victoria Chatbot...');

      // Create or find chat container
      this.createChatInterface();

      // Setup event listeners
      this.setupEventListeners();

      // Load conversation history
      await this.loadConversationHistory();

      // Send welcome message
      this.sendWelcomeMessage();

      this.isInitialized = true;
      console.log('✅ Chatbot inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando chatbot:', error);
    }
  }

  /**
   * 🎨 Create chat interface
   */
  createChatInterface() {
    // Check if chat container already exists
    let chatContainer = document.getElementById('flores-chatbot');

    if (!chatContainer) {
      chatContainer = document.createElement('div');
      chatContainer.id = 'flores-chatbot';
      chatContainer.className = 'flores-chatbot-container';

      chatContainer.innerHTML = `
        <div class="chatbot-header">
          <div class="chatbot-avatar">🌸</div>
          <div class="chatbot-info">
            <h4>Asistente Virtual</h4>
            <span class="chatbot-status online">En línea</span>
          </div>
          <div class="chatbot-controls">
            <button class="btn-minimize" title="Minimizar">−</button>
            <button class="btn-close" title="Cerrar">×</button>
          </div>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages">
          <!-- Messages will be added here -->
        </div>
        
        <div class="chatbot-typing" id="chatbot-typing" style="display: none;">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="typing-text">Escribiendo...</span>
        </div>
        
        <div class="chatbot-input-container">
          <div class="quick-actions">
            <button class="quick-btn" data-message="¿Qué flores recomiendas para San Valentín?">💕 San Valentín</button>
            <button class="quick-btn" data-message="¿Cómo cuido mis flores?">🌱 Cuidados</button>
            <button class="quick-btn" data-message="¿Cuáles son sus precios?">💰 Precios</button>
          </div>
          
          <div class="input-row">
            <input type="text" 
                   id="chatbot-input" 
                   placeholder="Escribe tu pregunta sobre flores..."
                   class="chatbot-input">
            <button id="chatbot-send" class="btn-send" title="Enviar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(chatContainer);
    }

    this.chatContainer = chatContainer;
    this.messagesContainer = document.getElementById('chatbot-messages');
    this.inputField = document.getElementById('chatbot-input');
    this.sendButton = document.getElementById('chatbot-send');
    this.typingIndicator = document.getElementById('chatbot-typing');
  }

  /**
   * 🎧 Setup event listeners
   */
  setupEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', () => {
      this.sendUserMessage();
    });

    // Enter key press
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendUserMessage();
      }
    });

    // Quick action buttons
    document.querySelectorAll('.quick-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const message = e.target.dataset.message;
        this.inputField.value = message;
        this.sendUserMessage();
      });
    });

    // Minimize/maximize
    const minimizeBtn = this.chatContainer.querySelector('.btn-minimize');
    minimizeBtn.addEventListener('click', () => {
      this.chatContainer.classList.toggle('minimized');
    });

    // Close chat
    const closeBtn = this.chatContainer.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      this.chatContainer.style.display = 'none';
    });

    // Auto-resize input
    this.inputField.addEventListener('input', () => {
      this.inputField.style.height = 'auto';
      this.inputField.style.height = `${this.inputField.scrollHeight}px`;
    });
  }

  /**
   * 📨 Send user message
   */
  async sendUserMessage() {
    const message = this.inputField.value.trim();

    if (!message) return;

    // Add user message to UI
    this.addMessageToUI('user', message);

    // Clear input
    this.inputField.value = '';
    this.inputField.style.height = 'auto';

    // Add to conversation history
    this.conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Process message and get response
      const response = await this.processMessage(message);

      // Hide typing indicator
      this.hideTypingIndicator();

      // Add bot response to UI
      this.addMessageToUI('bot', response.content, response.type);

      // Add to conversation history
      this.conversation.push({
        role: 'bot',
        content: response.content,
        type: response.type,
        timestamp: new Date().toISOString(),
      });

      // Save conversation
      this.saveConversationHistory();
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      this.hideTypingIndicator();
      this.addMessageToUI(
        'bot',
        'Lo siento, ha ocurrido un error. Por favor intenta de nuevo.',
        'error'
      );
    }
  }

  /**
   * 🧠 Process user message and generate response
   */
  async processMessage(message) {
    try {
      // Analyze message intent
      const intent = this.analyzeIntent(message);

      // Generate response based on intent
      let response;

      switch (intent.type) {
        case 'flower_recommendation':
          response = await this.handleFlowerRecommendation(intent);
          break;
        case 'care_instructions':
          response = this.handleCareInstructions(intent);
          break;
        case 'occasion_advice':
          response = this.handleOccasionAdvice(intent);
          break;
        case 'price_inquiry':
          response = await this.handlePriceInquiry(intent);
          break;
        case 'order_status':
          response = await this.handleOrderStatus(intent);
          break;
        case 'greeting':
          response = this.handleGreeting();
          break;
        case 'goodbye':
          response = this.handleGoodbye();
          break;
        default:
          response = await this.handleGeneralQuery(message);
      }

      return response;
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return {
        content: 'Disculpa, no he podido procesar tu mensaje. ¿Podrías reformularlo?',
        type: 'text',
      };
    }
  }

  /**
   * 🎯 Analyze message intent
   */
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Flower recommendation patterns
    if (this.matchesPattern(lowerMessage, ['recomien', 'sugier', 'mejor', 'flor', 'ramo'])) {
      return {
        type: 'flower_recommendation',
        entities: this.extractEntities(lowerMessage),
      };
    }

    // Care instructions patterns
    if (this.matchesPattern(lowerMessage, ['cuid', 'manten', 'agua', 'rieg', 'conserv'])) {
      return {
        type: 'care_instructions',
        entities: this.extractEntities(lowerMessage),
      };
    }

    // Occasion advice patterns
    if (
      this.matchesPattern(lowerMessage, [
        'ocasión',
        'evento',
        'cumpleaños',
        'boda',
        'valentín',
        'madre',
      ])
    ) {
      return {
        type: 'occasion_advice',
        entities: this.extractEntities(lowerMessage),
      };
    }

    // Price inquiry patterns
    if (this.matchesPattern(lowerMessage, ['precio', 'cost', 'cuant', 'vale', '$'])) {
      return {
        type: 'price_inquiry',
        entities: this.extractEntities(lowerMessage),
      };
    }

    // Order status patterns
    if (this.matchesPattern(lowerMessage, ['pedido', 'orden', 'compra', 'estado', 'entreg'])) {
      return {
        type: 'order_status',
        entities: this.extractEntities(lowerMessage),
      };
    }

    // Greeting patterns
    if (this.matchesPattern(lowerMessage, ['hola', 'buenas', 'saludos', 'hi', 'hello'])) {
      return { type: 'greeting' };
    }

    // Goodbye patterns
    if (this.matchesPattern(lowerMessage, ['adiós', 'chao', 'gracias', 'bye', 'hasta'])) {
      return { type: 'goodbye' };
    }

    return {
      type: 'general',
      entities: this.extractEntities(lowerMessage),
    };
  }

  /**
   * 🌸 Handle flower recommendation
   */
  async handleFlowerRecommendation(intent) {
    const entities = intent.entities;
    let recommendations = [];

    // Check for occasion in the message
    if (entities.occasion) {
      const occasionFlowers = this.occasionMapping[entities.occasion];
      if (occasionFlowers) {
        recommendations = occasionFlowers;
      }
    }

    // Check for color preferences
    if (entities.colors && entities.colors.length > 0) {
      const colorFlowers = this.getFlowersByColor(entities.colors[0]);
      recommendations = [...recommendations, ...colorFlowers];
    }

    // Default recommendations if none found
    if (recommendations.length === 0) {
      recommendations = ['rosas', 'tulipanes', 'girasoles', 'orquídeas'];
    }

    const response = this.generateFlowerRecommendationResponse(recommendations, entities);

    return {
      content: response,
      type: 'recommendation',
    };
  }

  /**
   * 🌱 Handle care instructions
   */
  handleCareInstructions(intent) {
    const entities = intent.entities;
    let instructions = [];

    if (entities.flowers && entities.flowers.length > 0) {
      const flower = entities.flowers[0];
      instructions = this.careInstructions[flower] || this.careInstructions.general;
    } else {
      instructions = this.careInstructions.general;
    }

    const response = `🌱 **Consejos de cuidado:**\n\n${instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}`;

    return {
      content: response,
      type: 'care_guide',
    };
  }

  /**
   * 🎉 Handle occasion advice
   */
  handleOccasionAdvice(intent) {
    const entities = intent.entities;
    const occasion = entities.occasion || 'general';

    const advice = this.getOccasionAdvice(occasion);

    return {
      content: advice,
      type: 'occasion_advice',
    };
  }

  /**
   * 💰 Handle price inquiry
   */
  async handlePriceInquiry(intent) {
    // In a real implementation, this would query your product database
    const priceRanges = {
      rosas: '$25.000 - $60.000',
      tulipanes: '$30.000 - $45.000',
      girasoles: '$20.000 - $40.000',
      orquídeas: '$50.000 - $120.000',
      general: '$20.000 - $120.000',
    };

    const entities = intent.entities;
    let flower = 'general';

    if (entities.flowers && entities.flowers.length > 0) {
      flower = entities.flowers[0];
    }

    const priceRange = priceRanges[flower] || priceRanges.general;

    return {
      content: `💰 Los precios de ${flower === 'general' ? 'nuestras flores' : flower} varían entre ${priceRange}, dependiendo del tamaño y la temporada. ¿Te gustaría ver nuestro catálogo completo?`,
      type: 'price_info',
    };
  }

  /**
   * 📦 Handle order status
   */
  async handleOrderStatus(intent) {
    // In a real implementation, this would integrate with your order system
    return {
      content:
        '📦 Para consultar el estado de tu pedido, por favor proporciona tu número de orden o email. También puedes revisar tu cuenta en nuestro sitio web.',
      type: 'order_info',
    };
  }

  /**
   * 👋 Handle greeting
   */
  handleGreeting() {
    const greetings = [
      '¡Hola! 🌸 Soy tu asistente virtual de Flores Victoria. ¿En qué puedo ayudarte hoy?',
      '¡Buenas! 🌺 Estoy aquí para ayudarte with todo lo relacionado con flores. ¿Qué necesitas?',
      '¡Saludos! 🌷 ¿Buscas flores para alguna ocasión especial? Puedo ayudarte a elegir las perfectas.',
    ];

    return {
      content: greetings[Math.floor(Math.random() * greetings.length)],
      type: 'greeting',
    };
  }

  /**
   * 👋 Handle goodbye
   */
  handleGoodbye() {
    const goodbyes = [
      '¡Hasta pronto! 🌸 Fue un placer ayudarte. ¡Que tengas un día hermoso!',
      '¡Adiós! 🌺 Espero haber sido de ayuda. ¡Vuelve cuando gustes!',
      '¡Gracias por visitarnos! 🌷 Que disfrutes mucho tus flores.',
    ];

    return {
      content: goodbyes[Math.floor(Math.random() * goodbyes.length)],
      type: 'goodbye',
    };
  }

  /**
   * ❓ Handle general query
   */
  async handleGeneralQuery(message) {
    // For general queries, we can provide helpful information
    const generalResponses = [
      'Somos Flores Victoria, especialistas en arreglos florales para toda ocasión. ¿Te puedo ayudar a encontrar algo específico?',
      'Ofrecemos una amplia variedad de flores frescas, ramos personalizados y arreglos para eventos. ¿Qué estás buscando?',
      'Puedo ayudarte con recomendaciones de flores, consejos de cuidado, información sobre precios y más. ¿En qué te ayudo?',
    ];

    return {
      content: generalResponses[Math.floor(Math.random() * generalResponses.length)],
      type: 'general',
    };
  }

  /**
   * 💬 Add message to UI
   */
  addMessageToUI(sender, content, type = 'text') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;

    const time = new Date().toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let messageHTML = '';

    if (sender === 'bot') {
      messageHTML = `
        <div class="message-content">
          <div class="message-avatar">🌸</div>
          <div class="message-bubble">
            <div class="message-text">${this.formatMessage(content, type)}</div>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
    } else {
      messageHTML = `
        <div class="message-content">
          <div class="message-bubble">
            <div class="message-text">${content}</div>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
    }

    messageElement.innerHTML = messageHTML;
    this.messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * 📝 Format message content
   */
  formatMessage(content, type) {
    switch (type) {
      case 'recommendation':
        return this.formatRecommendationMessage(content);
      case 'care_guide':
        return this.formatCareGuideMessage(content);
      default:
        return content.replace(/\n/g, '<br>');
    }
  }

  /**
   * 🎨 Format recommendation message
   */
  formatRecommendationMessage(content) {
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }

  /**
   * 📋 Format care guide message
   */
  formatCareGuideMessage(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/(\d+\.)/g, '<br><strong>$1</strong>');
  }

  /**
   * ⌨️ Show typing indicator
   */
  showTypingIndicator() {
    this.isTyping = true;
    this.typingIndicator.style.display = 'flex';
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * ⌨️ Hide typing indicator
   */
  hideTypingIndicator() {
    this.isTyping = false;
    this.typingIndicator.style.display = 'none';
  }

  /**
   * 💬 Send welcome message
   */
  sendWelcomeMessage() {
    setTimeout(() => {
      this.addMessageToUI(
        'bot',
        '¡Hola! 🌸 Soy tu asistente virtual de Flores Victoria. Puedo ayudarte con recomendaciones de flores, consejos de cuidado, información sobre precios y más. ¿En qué te puedo ayudar?',
        'greeting'
      );
    }, 1000);
  }

  /**
   * 🔧 Utility methods
   */
  getUserId() {
    let userId = localStorage.getItem('flores_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('flores_user_id', userId);
    }
    return userId;
  }

  generateSessionId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  matchesPattern(text, patterns) {
    return patterns.some((pattern) => text.includes(pattern));
  }

  extractEntities(message) {
    const entities = {
      flowers: [],
      colors: [],
      occasions: [],
      prices: [],
    };

    // Extract flowers
    const flowers = ['rosa', 'tulipán', 'girasol', 'orquídea', 'lirio', 'clavel', 'margarita'];
    flowers.forEach((flower) => {
      if (message.includes(flower)) {
        entities.flowers.push(flower);
      }
    });

    // Extract colors
    const colors = ['rojo', 'rosa', 'blanco', 'amarillo', 'azul', 'morado', 'naranja'];
    colors.forEach((color) => {
      if (message.includes(color)) {
        entities.colors.push(color);
      }
    });

    // Extract occasions
    const occasions = {
      valentín: 'valentine',
      madre: 'mother-day',
      cumpleaños: 'birthday',
      boda: 'wedding',
      aniversario: 'anniversary',
    };

    Object.keys(occasions).forEach((occasion) => {
      if (message.includes(occasion)) {
        entities.occasions.push(occasions[occasion]);
        entities.occasion = occasions[occasion];
      }
    });

    return entities;
  }

  getFlowersByColor(color) {
    const colorMapping = {
      rojo: ['rosas rojas', 'claveles rojos'],
      rosa: ['rosas rosadas', 'tulipanes rosados'],
      blanco: ['rosas blancas', 'lirios blancos'],
      amarillo: ['girasoles', 'tulipanes amarillos'],
      morado: ['orquídeas moradas', 'lirios morados'],
    };

    return colorMapping[color] || [];
  }

  generateFlowerRecommendationResponse(recommendations, entities) {
    let response = '🌸 **Mis recomendaciones para ti:**\n\n';

    if (entities.occasion) {
      response += `Para ${entities.occasion}, te sugiero:\n`;
    }

    recommendations.slice(0, 3).forEach((flower, index) => {
      response += `${index + 1}. **${flower.charAt(0).toUpperCase() + flower.slice(1)}** - Hermosas y perfectas para la ocasión\n`;
    });

    response +=
      '\n¿Te gustaría saber más sobre alguna de estas opciones o ver nuestro catálogo completo?';

    return response;
  }

  getOccasionAdvice(occasion) {
    const adviceMap = {
      valentine:
        '💕 Para San Valentín, las rosas rojas son clásicas, pero también puedes considerar tulipanes rosados o un ramo mixto con colores románticos.',
      'mother-day':
        '👩 Para el Día de la Madre, los tulipanes, rosas rosadas o un arreglo colorido son perfectos para mostrar tu amor y gratitud.',
      birthday:
        '🎂 Para cumpleaños, flores alegres y coloridas como girasoles, gerberas o un ramo mixto siempre son una excelente elección.',
      wedding:
        '💒 Para bodas, considera rosas blancas, peonías o lirios. Podemos crear arreglos personalizados que combinen con tu decoración.',
      general:
        '🌺 Para cualquier ocasión, puedo ayudarte a elegir las flores perfectas según tus gustos y presupuesto.',
    };

    return adviceMap[occasion] || adviceMap.general;
  }

  initializeFlowerKnowledge() {
    return {
      rosas: {
        meanings: ['amor', 'pasión', 'respeto'],
        colors: ['rojo', 'rosa', 'blanco', 'amarillo'],
        occasions: ['valentine', 'anniversary', 'mother-day'],
      },
      tulipanes: {
        meanings: ['amor perfecto', 'elegancia', 'gracia'],
        colors: ['rojo', 'rosa', 'blanco', 'amarillo', 'morado'],
        occasions: ['spring', 'mother-day', 'birthday'],
      },
      girasoles: {
        meanings: ['felicidad', 'lealtad', 'admiración'],
        colors: ['amarillo'],
        occasions: ['birthday', 'summer', 'friendship'],
      },
    };
  }

  initializeOccasionMapping() {
    return {
      valentine: ['rosas rojas', 'tulipanes rosados', 'orquídeas'],
      'mother-day': ['tulipanes', 'rosas rosadas', 'lirios'],
      birthday: ['girasoles', 'gerberas', 'ramo mixto'],
      wedding: ['rosas blancas', 'peonías', 'lirios blancos'],
      anniversary: ['rosas', 'orquídeas', 'claveles'],
    };
  }

  initializeCareInstructions() {
    return {
      general: [
        'Corta los tallos en diagonal bajo agua corriente',
        'Cambia el agua cada 2-3 días',
        'Mantén las flores lejos del sol directo y calor',
        'Agrega conservante floral al agua',
        'Retira hojas marchitas regularmente',
      ],
      rosas: [
        'Corta los tallos 2-3 cm bajo agua tibia',
        'Cambia el agua diariamente',
        'Mantén en lugar fresco',
        'Rocía pétalos ligeramente con agua',
      ],
      tulipanes: [
        'Corta tallos en diagonal',
        'Usa agua fría',
        'Mantén en lugar fresco y sombreado',
        'No agregues conservante (no lo necesitan)',
      ],
    };
  }

  async loadConversationHistory() {
    try {
      const history = localStorage.getItem(`chat_history_${this.userId}`);
      if (history) {
        this.conversation = JSON.parse(history);
        // Optionally restore recent messages to UI
      }
    } catch (error) {
      console.warn('No se pudo cargar historial de conversación:', error);
    }
  }

  saveConversationHistory() {
    try {
      // Keep only last 50 messages
      const recentConversation = this.conversation.slice(-50);
      localStorage.setItem(`chat_history_${this.userId}`, JSON.stringify(recentConversation));
    } catch (error) {
      console.warn('No se pudo guardar historial de conversación:', error);
    }
  }

  /**
   * 🌐 Public API methods
   */
  show() {
    this.chatContainer.style.display = 'flex';
    this.chatContainer.classList.remove('minimized');
  }

  hide() {
    this.chatContainer.style.display = 'none';
  }

  sendMessage(message) {
    this.inputField.value = message;
    this.sendUserMessage();
  }

  clearConversation() {
    this.conversation = [];
    this.messagesContainer.innerHTML = '';
    this.sendWelcomeMessage();
    localStorage.removeItem(`chat_history_${this.userId}`);
  }
}

// CSS for the chatbot
const chatbotCSS = `
  .flores-chatbot-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    height: 600px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .flores-chatbot-container.minimized {
    height: 60px;
    overflow: hidden;
  }

  .chatbot-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
    border-radius: 16px 16px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .chatbot-avatar {
    font-size: 1.5rem;
    margin-right: 0.5rem;
  }

  .chatbot-info h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .chatbot-status {
    font-size: 0.8rem;
    opacity: 0.9;
  }

  .chatbot-status.online::before {
    content: '●';
    color: #48bb78;
    margin-right: 4px;
  }

  .chatbot-controls {
    display: flex;
    gap: 0.5rem;
  }

  .btn-minimize,
  .btn-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .btn-minimize:hover,
  .btn-close:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .chatbot-messages {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    max-height: 400px;
  }

  .message {
    margin-bottom: 1rem;
  }

  .message-content {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .user-message .message-content {
    justify-content: flex-end;
  }

  .message-avatar {
    font-size: 1.2rem;
    margin-bottom: 0.25rem;
  }

  .message-bubble {
    max-width: 80%;
    padding: 0.75rem 1rem;
    border-radius: 18px;
    position: relative;
  }

  .bot-message .message-bubble {
    background: #f7fafc;
    color: #2d3748;
    border-bottom-left-radius: 6px;
  }

  .user-message .message-bubble {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 6px;
  }

  .message-text {
    line-height: 1.4;
  }

  .message-time {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-top: 0.25rem;
  }

  .chatbot-typing {
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #718096;
  }

  .typing-indicator {
    display: flex;
    gap: 2px;
  }

  .typing-indicator span {
    width: 6px;
    height: 6px;
    background: #cbd5e0;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }

  .chatbot-input-container {
    border-top: 1px solid #e2e8f0;
    padding: 1rem;
  }

  .quick-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .quick-btn {
    background: #edf2f7;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #4a5568;
  }

  .quick-btn:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .chatbot-input {
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    resize: none;
    max-height: 100px;
    outline: none;
    transition: border-color 0.2s;
  }

  .chatbot-input:focus {
    border-color: #667eea;
  }

  .btn-send {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }

  .btn-send:hover {
    transform: scale(1.05);
  }

  .btn-send:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    .flores-chatbot-container {
      width: calc(100vw - 40px);
      height: calc(100vh - 40px);
      bottom: 20px;
      right: 20px;
      left: 20px;
      border-radius: 12px;
    }

    .chatbot-messages {
      max-height: calc(100vh - 200px);
    }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = chatbotCSS;
  document.head.appendChild(style);
}

// Global initialization
if (typeof window !== 'undefined') {
  window.FloresVictoriaChatbot = FloresVictoriaChatbot;

  // Auto-initialize
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize chatbot
    window.floresChatbot = new FloresVictoriaChatbot({
      apiUrl: window.location.origin.includes('localhost')
        ? 'http://localhost:3013'
        : '/api/chatbot',
    });

    // Add floating chat button if it doesn't exist
    if (!document.getElementById('chat-trigger')) {
      const chatButton = document.createElement('button');
      chatButton.id = 'chat-trigger';
      chatButton.innerHTML = '💬';
      chatButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        transition: transform 0.3s ease;
      `;

      chatButton.addEventListener('click', () => {
        window.floresChatbot.show();
        chatButton.style.display = 'none';
      });

      chatButton.addEventListener('mouseenter', () => {
        chatButton.style.transform = 'scale(1.1)';
      });

      chatButton.addEventListener('mouseleave', () => {
        chatButton.style.transform = 'scale(1)';
      });

      document.body.appendChild(chatButton);
    }
  });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloresVictoriaChatbot;
}
