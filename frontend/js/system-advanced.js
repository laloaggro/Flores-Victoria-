/**
 * Sistema Principal Avanzado - Flores Victoria v3.0
 * Sistema completo con WebAssembly, PWA 3.0, IA y características avanzadas
 * Proyecto Open Source - Licencia MIT
 */

class FloresVictoriaAdvancedSystem {
  constructor() {
    this.version = '3.0.0';
    this.isInitialized = false;
    this.modules = new Map();
    this.features = {
      webAssembly: false,
      pwaAdvanced: false,
      aiRecommendations: false,
      chatbot: false,
      offlineSync: false,
      pushNotifications: false,
    };

    this.config = {
      apiBaseUrl: '/api',
      wasmEndpoint: '/wasm',
      maxRetries: 3,
      cacheTimeout: 300000, // 5 minutes
      syncInterval: 60000, // 1 minute
      batchSize: 10,
    };

    console.log('🌺 Flores Victoria v3.0 - Sistema Avanzado Inicializando...');
    this.init();
  }

  async init() {
    try {
      // Inicializar módulos en orden de dependencia
      await this.initializeCore();
      await this.loadModules();
      await this.setupFeatures();
      await this.registerServiceWorker();
      await this.initializeSync();

      this.isInitialized = true;
      console.log('✅ Sistema Flores Victoria v3.0 inicializado correctamente');
      this.displayWelcomeMessage();
    } catch (error) {
      console.error('❌ Error inicializando el sistema:', error);
      this.handleInitializationError(error);
    }
  }

  async initializeCore() {
    console.log('🔧 Inicializando núcleo del sistema...');

    // Configurar IndexedDB para almacenamiento offline
    await this.setupOfflineStorage();

    // Inicializar gestión de errores
    this.setupErrorHandling();

    // Configurar analytics
    this.setupAnalytics();

    console.log('✅ Núcleo del sistema inicializado');
  }

  async loadModules() {
    console.log('📦 Cargando módulos del sistema...');

    const moduleLoaders = [
      { name: 'wasm', loader: () => this.loadWASMProcessor() },
      { name: 'pwa', loader: () => this.loadPWAAdvanced() },
      { name: 'ai', loader: () => this.loadAIRecommendations() },
      { name: 'chatbot', loader: () => this.loadChatbot() },
      { name: 'cart', loader: () => this.loadCart() },
      { name: 'catalog', loader: () => this.loadCatalog() },
      { name: 'notifications', loader: () => this.loadNotifications() },
    ];

    await Promise.allSettled(
      moduleLoaders.map(async ({ name, loader }) => {
        try {
          const module = await loader();
          this.modules.set(name, module);
          console.log(`✅ Módulo ${name} cargado`);
        } catch (error) {
          console.warn(`⚠️ Error cargando módulo ${name}:`, error);
        }
      })
    );

    console.log(`✅ Módulos cargados: ${this.modules.size}`);
  }

  async setupFeatures() {
    console.log('🚀 Configurando características avanzadas...');

    // WebAssembly
    if (this.modules.has('wasm')) {
      this.features.webAssembly = true;
      console.log('✅ WebAssembly habilitado');
    }

    // PWA Avanzado
    if (this.modules.has('pwa')) {
      this.features.pwaAdvanced = true;
      await this.setupPWAFeatures();
      console.log('✅ PWA 3.0 habilitado');
    }

    // IA y Recomendaciones
    if (this.modules.has('ai')) {
      this.features.aiRecommendations = true;
      await this.setupAIFeatures();
      console.log('✅ IA y Recomendaciones habilitadas');
    }

    // Chatbot
    if (this.modules.has('chatbot')) {
      this.features.chatbot = true;
      console.log('✅ Chatbot habilitado');
    }

    // Configurar sincronización offline
    await this.setupOfflineFeatures();
  }

  async loadWASMProcessor() {
    if (typeof FloresVictoriaWASMProcessor !== 'undefined') {
      const processor = new FloresVictoriaWASMProcessor();
      await processor.init();
      return processor;
    }
    throw new Error('WASM Processor no disponible');
  }

  async loadPWAAdvanced() {
    if (typeof FloresVictoriaPWA !== 'undefined') {
      const pwa = new FloresVictoriaPWA();
      await pwa.init();
      return pwa;
    }
    throw new Error('PWA Advanced no disponible');
  }

  async loadAIRecommendations() {
    if (typeof RecommendationsManager !== 'undefined') {
      const ai = new RecommendationsManager();
      await ai.init();
      return ai;
    }
    throw new Error('AI Recommendations no disponible');
  }

  async loadChatbot() {
    if (typeof FloresVictoriaChatbot !== 'undefined') {
      const chatbot = new FloresVictoriaChatbot();
      await chatbot.init();
      return chatbot;
    }
    throw new Error('Chatbot no disponible');
  }

  async loadCart() {
    // Cargar sistema de carrito mejorado
    return {
      add: this.addToCart.bind(this),
      remove: this.removeFromCart.bind(this),
      sync: this.syncCart.bind(this),
      getItems: this.getCartItems.bind(this),
    };
  }

  async loadCatalog() {
    // Cargar catálogo con procesamiento de imágenes WASM
    return {
      load: this.loadCatalog.bind(this),
      search: this.searchProducts.bind(this),
      filter: this.filterProducts.bind(this),
    };
  }

  async loadNotifications() {
    // Sistema de notificaciones avanzado
    return {
      show: this.showNotification.bind(this),
      subscribe: this.subscribeToNotifications.bind(this),
      sync: this.syncNotifications.bind(this),
    };
  }

  async setupPWAFeatures() {
    const pwa = this.modules.get('pwa');
    if (pwa) {
      // Configurar características PWA
      await pwa.setupCamera();
      await pwa.setupGeolocation();
      await pwa.setupBackgroundSync();
      await pwa.setupInstallPrompt();
    }
  }

  async setupAIFeatures() {
    const ai = this.modules.get('ai');
    if (ai) {
      // Configurar recomendaciones personalizadas
      await ai.loadUserProfile();
      await ai.startRecommendationEngine();
    }
  }

  async setupOfflineStorage() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FloresVictoriaAdvanced', 3);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para carrito offline
        if (!db.objectStoreNames.contains('cart')) {
          const cartStore = db.createObjectStore('cart', { keyPath: 'id', autoIncrement: true });
          cartStore.createIndex('productId', 'productId', { unique: false });
          cartStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para favoritos
        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { keyPath: 'productId' });
          favStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para reseñas pendientes
        if (!db.objectStoreNames.contains('reviews')) {
          const reviewStore = db.createObjectStore('reviews', {
            keyPath: 'id',
            autoIncrement: true,
          });
          reviewStore.createIndex('productId', 'productId', { unique: false });
        }

        // Store para imágenes en caché
        if (!db.objectStoreNames.contains('imageCache')) {
          const imageStore = db.createObjectStore('imageCache', { keyPath: 'url' });
          imageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para sincronización
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('priority', 'priority', { unique: false });
        }
      };
    });
  }

  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      this.logError('Global Error', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
    });
  }

  setupAnalytics() {
    // Configurar analytics para métricas del sistema
    this.analytics = {
      events: [],
      performance: {
        loadTime: performance.now(),
        navigationStart: performance.timeOrigin,
      },
    };
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-advanced.js');
        console.log('✅ Service Worker registrado:', registration.scope);

        registration.addEventListener('updatefound', () => {
          console.log('🔄 Actualización de Service Worker disponible');
          this.handleServiceWorkerUpdate(registration);
        });

        this.features.offlineSync = true;
        this.features.pushNotifications = true;
      } catch (error) {
        console.warn('⚠️ Error registrando Service Worker:', error);
      }
    }
  }

  async initializeSync() {
    if (this.features.offlineSync) {
      // Configurar sincronización periódica
      setInterval(() => {
        this.syncPendingData();
      }, this.config.syncInterval);

      // Sincronizar al conectarse
      window.addEventListener('online', () => {
        console.log('🌐 Conexión restaurada - Sincronizando datos...');
        this.syncPendingData();
      });
    }
  }

  async setupOfflineFeatures() {
    // Configurar funcionalidades offline
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      this.features.offlineSync = true;
      console.log('✅ Sincronización offline habilitada');
    }

    // Configurar notificaciones push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      this.features.pushNotifications = true;
      console.log('✅ Notificaciones push habilitadas');
    }
  }

  // Métodos del carrito con soporte offline
  async addToCart(product, quantity = 1) {
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      timestamp: Date.now(),
    };

    // Agregar a IndexedDB
    await this.storeOfflineData('cart', item);

    // Intentar sincronizar inmediatamente si hay conexión
    if (navigator.onLine) {
      try {
        await this.syncCartItem(item);
      } catch (error) {
        console.warn('Error sincronizando item del carrito:', error);
      }
    }

    this.updateCartUI();
    this.trackEvent('cart_add', { productId: product.id, quantity });
  }

  async removeFromCart(productId) {
    await this.removeOfflineData('cart', productId);

    if (navigator.onLine) {
      try {
        await fetch(`${this.config.apiBaseUrl}/cart/${productId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.warn('Error eliminando del carrito online:', error);
      }
    }

    this.updateCartUI();
    this.trackEvent('cart_remove', { productId });
  }

  async getCartItems() {
    return await this.getOfflineData('cart');
  }

  // Procesamiento de imágenes con WASM
  async processImage(imageFile, operations) {
    const wasmProcessor = this.modules.get('wasm');
    if (wasmProcessor && wasmProcessor.isInitialized) {
      try {
        // Convertir archivo a ImageData
        const imageData = await this.fileToImageData(imageFile);

        // Procesar con WASM
        const result = await wasmProcessor.processImage(imageData, operations);

        if (result.success) {
          this.trackEvent('image_processed_wasm', {
            operations: operations.length,
            processingTime: result.processingTime,
          });
          return result;
        }
      } catch (error) {
        console.warn('Error procesando imagen con WASM:', error);
      }
    }

    // Fallback a procesamiento del servidor
    return await this.processImageServer(imageFile, operations);
  }

  async processImageServer(imageFile, operations) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('operations', JSON.stringify(operations));

    const response = await fetch('/api/wasm/process', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error procesando imagen en servidor');
    }

    return await response.json();
  }

  // Funciones de utilidad
  async fileToImageData(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve({
          data: imageData.data,
          width: img.width,
          height: img.height,
          channels: 4,
        });
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Gestión de datos offline
  async storeOfflineData(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineData(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeOfflineData(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Sincronización
  async syncPendingData() {
    if (!navigator.onLine) return;

    try {
      await Promise.all([
        this.syncCart(),
        this.syncFavorites(),
        this.syncReviews(),
        this.syncImageUploads(),
      ]);
      console.log('✅ Sincronización completada');
    } catch (error) {
      console.warn('⚠️ Error en sincronización:', error);
    }
  }

  async syncCart() {
    const cartItems = await this.getOfflineData('cart');
    for (const item of cartItems) {
      try {
        await this.syncCartItem(item);
      } catch (error) {
        console.warn('Error sincronizando item del carrito:', error);
      }
    }
  }

  async syncCartItem(item) {
    await fetch(`${this.config.apiBaseUrl}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  }

  // Notificaciones
  async showNotification(title, options = {}) {
    const notifications = this.modules.get('notifications');
    if (notifications) {
      return await notifications.show(title, options);
    }

    // Fallback nativo
    if ('Notification' in window) {
      return new Notification(title, options);
    }
  }

  // Analytics y tracking
  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.analytics.events.push(event);

    // Enviar a servidor si hay conexión
    if (navigator.onLine) {
      this.sendAnalytics([event]);
    }
  }

  async sendAnalytics(events) {
    try {
      await fetch(`${this.config.apiBaseUrl}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.warn('Error enviando analytics:', error);
    }
  }

  // Gestión de errores
  logError(type, error) {
    const errorData = {
      type,
      message: error.message || error,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    console.error(`${type}:`, error);

    // Enviar error al servidor para monitoreo
    if (navigator.onLine) {
      fetch(`${this.config.apiBaseUrl}/errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Fallar silenciosamente para evitar bucles
      });
    }
  }

  // UI Updates
  updateCartUI() {
    this.getCartItems().then((items) => {
      const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const cartCountElement = document.getElementById('cart-count');
      if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'inline' : 'none';
      }
    });
  }

  displayWelcomeMessage() {
    const featuresEnabled = Object.values(this.features).filter(Boolean).length;
    const totalFeatures = Object.keys(this.features).length;

    console.log(`
🌺 ================================ 🌺
   FLORES VICTORIA v${this.version}
   Sistema Avanzado E-commerce
   Open Source Project
🌺 ================================ 🌺

✨ Características habilitadas: ${featuresEnabled}/${totalFeatures}
📦 Módulos cargados: ${this.modules.size}
🚀 WebAssembly: ${this.features.webAssembly ? '✅' : '❌'}
📱 PWA 3.0: ${this.features.pwaAdvanced ? '✅' : '❌'}
🤖 IA Recomendaciones: ${this.features.aiRecommendations ? '✅' : '❌'}
💬 Chatbot: ${this.features.chatbot ? '✅' : '❌'}
🔄 Sync Offline: ${this.features.offlineSync ? '✅' : '❌'}
🔔 Push Notifications: ${this.features.pushNotifications ? '✅' : '❌'}

Listo para ofrecer la mejor experiencia! 🌸
`);

    // Mostrar notificación de bienvenida
    this.showWelcomeNotification();
  }

  showWelcomeNotification() {
    if (this.features.pushNotifications) {
      setTimeout(() => {
        this.showNotification('¡Bienvenido a Flores Victoria!', {
          body: 'Sistema avanzado v3.0 cargado correctamente',
          icon: '/images/icons/icon-192.png',
          tag: 'welcome',
          requireInteraction: false,
        });
      }, 2000);
    }
  }

  handleInitializationError(error) {
    console.error('Error crítico en inicialización:', error);

    // Mostrar mensaje de error al usuario
    const errorDiv = document.createElement('div');
    errorDiv.className = 'system-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h3>⚠️ Error del Sistema</h3>
        <p>Hubo un problema inicializando Flores Victoria v3.0</p>
        <button onclick="location.reload()">Recargar Página</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }

  handleServiceWorkerUpdate(registration) {
    const updateDiv = document.createElement('div');
    updateDiv.className = 'sw-update-available';
    updateDiv.innerHTML = `
      <div class="update-content">
        <h3>🔄 Actualización Disponible</h3>
        <p>Nueva versión de Flores Victoria disponible</p>
        <button onclick="window.floresVictoria.updateServiceWorker()">Actualizar</button>
      </div>
    `;
    document.body.appendChild(updateDiv);
  }

  updateServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }

  // API pública para uso externo
  getSystemInfo() {
    return {
      version: this.version,
      isInitialized: this.isInitialized,
      features: { ...this.features },
      modules: Array.from(this.modules.keys()),
      performance: this.analytics.performance,
    };
  }

  getModule(name) {
    return this.modules.get(name);
  }

  isFeatureEnabled(feature) {
    return this.features[feature] || false;
  }
}

// Inicializar sistema global
window.addEventListener('DOMContentLoaded', () => {
  window.floresVictoria = new FloresVictoriaAdvancedSystem();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloresVictoriaAdvancedSystem;
}
