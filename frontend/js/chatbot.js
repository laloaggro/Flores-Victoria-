/**
 * Chat Bot de Soporte - Flores Victoria
 * Respuestas automáticas FAQ para florería
 */

/* eslint-disable no-console */

// Configuración de contacto
const WHATSAPP_NUMBER = '56963603177';
const WHATSAPP_MESSAGE = '¡Hola! Me interesa información sobre sus arreglos florales 💐';

const ChatBot = {
  isOpen: false,
  messages: [],

  // Base de conocimientos FAQ
  faq: [
    {
      keywords: ['horario', 'abren', 'cierran', 'abierto', 'hora'],
      answer:
        '🕐 Nuestro horario es:\n• Lunes a Viernes: 9:00 AM - 7:00 PM\n• Sábados: 10:00 AM - 4:00 PM\n• Domingos: Cerrado\n\n¿Te puedo ayudar con algo más?',
    },
    {
      keywords: ['envio', 'envío', 'delivery', 'entrega', 'domicilio', 'llegar'],
      answer:
        '🚚 Ofrecemos envío a domicilio:\n• Entrega el mismo día (pedidos antes de 2 PM)\n• Envío gratis en pedidos mayores a $100.000\n• Cobertura en toda la ciudad\n\n¿Quieres que te ayude a hacer un pedido?',
    },
    {
      keywords: ['precio', 'costo', 'cuanto', 'cuánto', 'vale', 'económico', 'barato'],
      answer:
        '💐 Tenemos arreglos para todos los presupuestos:\n• Desde $35.000 (bouquets sencillos)\n• Arreglos premium desde $65.000\n• Arreglos de lujo desde $150.000\n\n¿Te gustaría ver nuestro catálogo?',
    },
    {
      keywords: ['pago', 'pagar', 'tarjeta', 'efectivo', 'transferencia', 'nequi', 'daviplata'],
      answer:
        '💳 Aceptamos múltiples formas de pago:\n• Tarjetas de crédito/débito\n• Transferencia bancaria\n• Nequi / Daviplata\n• Efectivo contra entrega\n\n¿Necesitas más información?',
    },
    {
      keywords: ['rosas', 'rosa'],
      answer:
        '🌹 Tenemos hermosas rosas:\n• Rosas rojas (amor y pasión)\n• Rosas rosadas (gratitud)\n• Rosas blancas (pureza)\n• Rosas amarillas (amistad)\n\nTenemos ramos desde 6 hasta 100 rosas. ¿Cuántas necesitas?',
    },
    {
      keywords: ['cumpleaños', 'cumple', 'feliz'],
      answer:
        '🎂 ¡Tenemos arreglos perfectos para cumpleaños!\n• Bouquets coloridos con globo\n• Arreglos con peluche incluido\n• Cajas de rosas personalizadas\n\n¿Para quién es el regalo?',
    },
    {
      keywords: ['boda', 'bodas', 'matrimonio', 'novia', 'novio'],
      answer:
        '💒 Somos expertos en bodas:\n• Bouquet de novia\n• Centros de mesa\n• Decoración ceremonial\n• Boutonnière para novio\n\n¿Te gustaría agendar una cita para planificar tu boda?',
    },
    {
      keywords: ['funeral', 'funebre', 'condolencia', 'pésame', 'falleció', 'muerte'],
      answer:
        '🕊️ Entendemos lo difícil de estos momentos. Ofrecemos:\n• Coronas fúnebres\n• Arreglos de condolencias\n• Cruces florales\n• Entrega urgente disponible\n\nTe acompañamos en este momento. ¿Cómo puedo ayudarte?',
    },
    {
      keywords: ['aniversario', 'años'],
      answer:
        '💕 Para celebrar el amor:\n• Ramos románticos de rosas\n• Arreglos con chocolates\n• Cajas de flores premium\n• Personalización con mensaje\n\n¿Cuántos años celebran?',
    },
    {
      keywords: ['personalizar', 'personalizado', 'especial', 'único'],
      answer:
        '✨ ¡Creamos arreglos personalizados!\n• Elige las flores\n• Selecciona los colores\n• Agrega extras (chocolates, peluches)\n• Incluye tarjeta con mensaje\n\nContáctanos por WhatsApp para diseñar algo único.',
    },
    {
      keywords: ['ubicacion', 'ubicación', 'dirección', 'direccion', 'donde', 'dónde', 'tienda'],
      answer:
        '📍 Nuestra tienda está ubicada en:\nCarrera 22A #85-78\nBarrio Polo Club, Bogotá\n\nTambién puedes comprar en línea y recibir en tu casa. ¿Prefieres visitarnos o hacer pedido a domicilio?',
    },
    {
      keywords: ['contacto', 'telefono', 'teléfono', 'llamar', 'whatsapp'],
      answer:
        '📞 Puedes contactarnos:\n• WhatsApp: +56 9 6360 3177\n• Email: contacto@flores-victoria.com\n\nO escríbeme aquí y te ayudo con gusto.',
    },
    {
      keywords: ['descuento', 'promoción', 'promo', 'oferta', 'cupón', 'cupon'],
      answer:
        '🎁 ¡Tenemos ofertas especiales!\n• 10% OFF en tu primera compra (código: BIENVENIDO10)\n• Envío gratis sobre $100.000\n• Promociones de temporada\n\nSuscríbete a nuestro newsletter para más descuentos.',
    },
    {
      keywords: ['garantia', 'garantía', 'duran', 'frescas', 'calidad'],
      answer:
        '✅ Garantía de Frescura:\n• Flores 100% frescas garantizadas\n• Duración mínima 5-7 días\n• Si no estás satisfecho, lo reponemos\n• Incluimos cuidados con cada entrega\n\n¿Alguna otra pregunta?',
    },
    {
      keywords: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'hi'],
      answer:
        '¡Hola! 👋 Bienvenido a Flores Victoria 🌺\n\nSoy el asistente virtual. Puedo ayudarte con:\n• Información de productos\n• Horarios y envíos\n• Precios y promociones\n• Ocasiones especiales\n\n¿En qué puedo ayudarte hoy?',
    },
    {
      keywords: ['gracias', 'thanks', 'genial', 'perfecto', 'excelente'],
      answer:
        '¡Con mucho gusto! 😊\n\nSi necesitas algo más, aquí estoy. También puedes:\n• Explorar nuestro catálogo\n• Contactarnos por WhatsApp\n• Visitar nuestra tienda\n\n¡Gracias por elegir Flores Victoria! 🌸',
    },
  ],

  // Respuesta por defecto
  defaultResponse:
    '🤔 No estoy seguro de entender tu pregunta.\n\nPuedo ayudarte con:\n• Precios y productos\n• Envíos y horarios\n• Ocasiones especiales\n• Formas de pago\n\nO si prefieres, contáctanos por WhatsApp para atención personalizada. 💬',

  /**
   * Buscar respuesta en FAQ
   */
  findAnswer(message) {
    const lowerMessage = message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    for (const item of this.faq) {
      for (const keyword of item.keywords) {
        const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (lowerMessage.includes(normalizedKeyword)) {
          return item.answer;
        }
      }
    }

    return this.defaultResponse;
  },

  /**
   * Crear widget de chat
   */
  createWidget() {
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.innerHTML = `
      <style>
        #chatbot-widget {
          position: fixed;
          bottom: 100px;
          right: 20px;
          z-index: 9998;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .chatbot-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(194, 24, 91, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .chatbot-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(194, 24, 91, 0.5);
        }
        
        .chatbot-toggle svg {
          width: 28px;
          height: 28px;
          fill: white;
        }
        
        .chatbot-window {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        
        .chatbot-window.open {
          display: flex;
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .chatbot-header {
          background: linear-gradient(135deg, #C2185B, #E91E63);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .chatbot-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .chatbot-info h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
        
        .chatbot-info span {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .chatbot-close {
          margin-left: auto;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
        }
        
        .chatbot-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .chat-message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        
        .chat-message.bot {
          background: #f0f0f0;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        
        .chat-message.user {
          background: linear-gradient(135deg, #C2185B, #E91E63);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        
        .chatbot-input {
          padding: 12px 16px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 8px;
        }
        
        .chatbot-input input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
        }
        
        .chatbot-input input:focus {
          border-color: #C2185B;
        }
        
        .chatbot-input button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chatbot-input button svg {
          width: 20px;
          height: 20px;
          fill: white;
        }
        
        .quick-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 16px;
          border-top: 1px solid #eee;
        }
        
        .quick-reply {
          padding: 8px 14px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .quick-reply:hover {
          background: #C2185B;
          color: white;
          border-color: #C2185B;
        }
        
        @media (max-width: 480px) {
          .chatbot-window {
            width: calc(100vw - 40px);
            height: 60vh;
            bottom: 70px;
            right: -10px;
          }
        }
      </style>
      
      <button class="chatbot-toggle" aria-label="Abrir asistente virtual de Flores Victoria" aria-expanded="false" aria-controls="chatbot-window">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8z"/></svg>
      </button>
      
      <div class="chatbot-window" id="chatbot-window" role="dialog" aria-labelledby="chatbot-title" aria-modal="true">
        <div class="chatbot-header">
          <div class="chatbot-avatar" aria-hidden="true">🌸</div>
          <div class="chatbot-info">
            <h4 id="chatbot-title">Asistente Flores Victoria</h4>
            <span aria-live="polite">🟢 En línea</span>
          </div>
          <button class="chatbot-close" aria-label="Cerrar asistente virtual">✕</button>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite" aria-label="Historial de conversación"></div>
        
        <div class="quick-replies" role="group" aria-label="Respuestas rápidas">
          <button class="quick-reply" data-message="Horarios" aria-label="Preguntar por horarios">🕐 Horarios</button>
          <button class="quick-reply" data-message="Envíos" aria-label="Preguntar por envíos">🚚 Envíos</button>
          <button class="quick-reply" data-message="Precios" aria-label="Preguntar por precios">💰 Precios</button>
          <button class="quick-reply" data-message="Contacto" aria-label="Información de contacto">📞 Contacto</button>
        </div>
        
        <div class="chatbot-input" role="form">
          <input type="text" placeholder="Escribe tu mensaje..." id="chatbot-input-field" aria-label="Escribe tu mensaje al asistente">
          <button id="chatbot-send" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    this.bindEvents();

    // Mensaje inicial después de 2 segundos
    setTimeout(() => {
      if (!this.isOpen) {
        this.addMessage('bot', '¡Hola! 👋 ¿Necesitas ayuda con flores? Estoy aquí para ayudarte.');
      }
    }, 3000);
  },

  /**
   * Vincular eventos
   */
  bindEvents() {
    const toggle = document.querySelector('.chatbot-toggle');
    const closeBtn = document.querySelector('.chatbot-close');
    const window = document.querySelector('.chatbot-window');
    const input = document.getElementById('chatbot-input-field');
    const sendBtn = document.getElementById('chatbot-send');
    const quickReplies = document.querySelectorAll('.quick-reply');

    toggle.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      window.classList.toggle('open', this.isOpen);
      toggle.setAttribute('aria-expanded', this.isOpen.toString());
      if (this.isOpen && this.messages.length === 0) {
        this.addMessage(
          'bot',
          '¡Hola! 👋 Bienvenido a Flores Victoria 🌺\n\nSoy el asistente virtual. ¿En qué puedo ayudarte hoy?'
        );
      }
    });

    closeBtn.addEventListener('click', () => {
      this.isOpen = false;
      window.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });

    sendBtn.addEventListener('click', () => this.sendMessage());

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    quickReplies.forEach((btn) => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.message;
        this.sendMessage();
      });
    });
  },

  /**
   * Abrir WhatsApp con mensaje predefinido
   */
  openWhatsApp() {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  },

  /**
   * Enviar mensaje
   */
  sendMessage() {
    const input = document.getElementById('chatbot-input-field');
    const message = input.value.trim();

    if (!message) return;

    // Mensaje del usuario
    this.addMessage('user', message);
    input.value = '';

    // Simular typing
    setTimeout(
      () => {
        const response = this.findAnswer(message);
        this.addMessage('bot', response);
      },
      500 + Math.random() * 500
    );
  },

  /**
   * Agregar mensaje al chat
   */
  addMessage(type, text) {
    this.messages.push({ type, text });

    const container = document.getElementById('chatbot-messages');
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message ${type}`;
    msgEl.textContent = text;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  },

  /**
   * Inicializar
   */
  init() {
    this.createWidget();
    console.log('💬 ChatBot inicializado');
  },
};

// Auto-inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  ChatBot.init();
});

window.ChatBot = ChatBot;
