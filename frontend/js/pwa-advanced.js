/**
 * 📱 Flores Victoria PWA 3.0 Advanced
 * Progressive Web App with advanced features
 *
 * @author Eduardo Garay (@laloaggro)
 * @version 2.1.0
 * @license MIT
 */

class FloresVictoriaPWA {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.cameraStream = null;
    this.notificationPermission = 'default';
    this.installPrompt = null;
    this.geolocation = null;

    this.initialize();
  }

  /**
   * 🚀 Initialize PWA
   */
  async initialize() {
    try {
      console.log('📱 Inicializando Flores Victoria PWA 3.0...');

      // Register service worker
      await this.registerServiceWorker();

      // Setup event listeners
      this.setupEventListeners();

      // Initialize features
      await this.initializeFeatures();

      // Check for updates
      this.checkForUpdates();

      console.log('✅ PWA 3.0 inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando PWA:', error);
    }
  }

  /**
   * 🔧 Register service worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw-advanced.js', {
          scope: '/',
        });

        console.log('✅ Service Worker registrado:', this.swRegistration.scope);

        // Listen for updates
        this.swRegistration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate();
        });
      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error);
      }
    }
  }

  /**
   * 🎧 Setup event listeners
   */
  setupEventListeners() {
    // Online/offline status
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));

    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallBanner();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('📱 App instalada correctamente');
      this.hideInstallBanner();
      this.trackEvent('pwa_installed');
    });

    // Visibility change for background sync
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleAppVisible();
      } else {
        this.handleAppHidden();
      }
    });

    // Page lifecycle events
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        this.handlePageRestored();
      }
    });

    // Handle share target
    if ('serviceWorker' in navigator && 'share' in navigator) {
      this.setupShareTarget();
    }
  }

  /**
   * 🔧 Initialize advanced features
   */
  async initializeFeatures() {
    // Request permissions
    await this.requestPermissions();

    // Initialize background sync
    this.initializeBackgroundSync();

    // Initialize push notifications
    await this.initializePushNotifications();

    // Initialize geolocation
    this.initializeGeolocation();

    // Initialize camera features
    this.initializeCameraFeatures();

    // Initialize shortcuts
    this.initializeDynamicShortcuts();

    // Initialize offline capabilities
    this.initializeOfflineCapabilities();
  }

  /**
   * 🔐 Request permissions
   */
  async requestPermissions() {
    try {
      // Notification permission
      if ('Notification' in window) {
        this.notificationPermission = await Notification.requestPermission();
        console.log('🔔 Notification permission:', this.notificationPermission);
      }

      // Background sync permission (implicit)
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        console.log('🔄 Background sync available');
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
    }
  }

  /**
   * 🔄 Initialize background sync
   */
  initializeBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          this.handleSyncComplete(event.data);
        }
      });

      console.log('✅ Background sync initialized');
    }
  }

  /**
   * 🔔 Initialize push notifications
   */
  async initializePushNotifications() {
    if (this.notificationPermission === 'granted' && this.swRegistration) {
      try {
        // Get existing subscription
        let subscription = await this.swRegistration.pushManager.getSubscription();

        if (!subscription) {
          // Create new subscription
          subscription = await this.subscribeToPush();
        }

        if (subscription) {
          console.log('✅ Push notifications initialized');
          await this.sendSubscriptionToServer(subscription);
        }
      } catch (error) {
        console.error('❌ Error initializing push notifications:', error);
      }
    }
  }

  /**
   * 📍 Initialize geolocation
   */
  initializeGeolocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.geolocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          console.log('📍 Geolocation obtained:', this.geolocation);
          this.handleLocationUpdate();
        },
        (error) => {
          console.warn('⚠️ Geolocation error:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    }
  }

  /**
   * 📸 Initialize camera features
   */
  initializeCameraFeatures() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      console.log('📸 Camera features available');
      this.setupCameraInterface();
    }
  }

  /**
   * ⚡ Initialize dynamic shortcuts
   */
  async initializeDynamicShortcuts() {
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        if (relatedApps.length > 0) {
          this.updateDynamicShortcuts();
        }
      } catch (error) {
        console.warn('⚠️ Error checking installed apps:', error);
      }
    }
  }

  /**
   * 📴 Initialize offline capabilities
   */
  initializeOfflineCapabilities() {
    // Setup offline message
    this.createOfflineIndicator();

    // Cache critical resources
    this.precacheResources();

    // Setup offline forms
    this.setupOfflineForms();
  }

  /**
   * 🔔 Subscribe to push notifications
   */
  async subscribeToPush() {
    try {
      const applicationServerKey = this.urlB64ToUint8Array(
        'BCqO8SrCCYs6s3j4UrzVP3ZfzK5vc-_Zx8-zFsw6SgT1TzQ2-EQt8YXgBz6G8h5YP9A4b_U6_Rw1OPTj8y3K7NhA'
      );

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log('✅ Push subscription created');
      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to push:', error);
      return null;
    }
  }

  /**
   * 📸 Setup camera interface
   */
  setupCameraInterface() {
    // Create camera button if it doesn't exist
    if (!document.getElementById('camera-trigger')) {
      const cameraButton = document.createElement('button');
      cameraButton.id = 'camera-trigger';
      cameraButton.innerHTML = '📸';
      cameraButton.className = 'pwa-camera-btn';
      cameraButton.title = 'Tomar foto de tu ocasión especial';

      cameraButton.addEventListener('click', () => this.openCamera());

      // Add to appropriate container or create floating button
      const container = document.querySelector('.main-actions') || document.body;
      container.appendChild(cameraButton);
    }
  }

  /**
   * 📸 Open camera
   */
  async openCamera() {
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      this.showCameraModal();
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      this.showCameraError();
    }
  }

  /**
   * 📸 Show camera modal
   */
  showCameraModal() {
    const modal = document.createElement('div');
    modal.className = 'camera-modal';
    modal.innerHTML = `
      <div class="camera-container">
        <div class="camera-header">
          <h3>📸 Captura tu momento especial</h3>
          <button class="close-camera">×</button>
        </div>
        <div class="camera-preview">
          <video id="camera-video" autoplay playsinline></video>
          <canvas id="camera-canvas" style="display: none;"></canvas>
        </div>
        <div class="camera-controls">
          <button class="camera-flip">🔄</button>
          <button class="camera-capture">📸 Capturar</button>
          <button class="camera-cancel">Cancelar</button>
        </div>
        <div class="camera-result" style="display: none;">
          <img id="captured-image" alt="Foto capturada">
          <div class="result-actions">
            <button class="use-photo">Usar foto</button>
            <button class="retake-photo">Tomar otra</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup video stream
    const video = document.getElementById('camera-video');
    video.srcObject = this.cameraStream;

    // Setup event listeners
    this.setupCameraControls(modal);
  }

  /**
   * 🎮 Setup camera controls
   */
  setupCameraControls(modal) {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const context = canvas.getContext('2d');
    const capturedImage = document.getElementById('captured-image');

    // Close camera
    modal.querySelector('.close-camera').addEventListener('click', () => {
      this.closeCamera(modal);
    });

    // Cancel
    modal.querySelector('.camera-cancel').addEventListener('click', () => {
      this.closeCamera(modal);
    });

    // Capture photo
    modal.querySelector('.camera-capture').addEventListener('click', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      capturedImage.src = imageData;

      modal.querySelector('.camera-preview').style.display = 'none';
      modal.querySelector('.camera-controls').style.display = 'none';
      modal.querySelector('.camera-result').style.display = 'block';
    });

    // Use photo
    modal.querySelector('.use-photo').addEventListener('click', () => {
      const imageData = capturedImage.src;
      this.handleCapturedPhoto(imageData);
      this.closeCamera(modal);
    });

    // Retake photo
    modal.querySelector('.retake-photo').addEventListener('click', () => {
      modal.querySelector('.camera-preview').style.display = 'block';
      modal.querySelector('.camera-controls').style.display = 'flex';
      modal.querySelector('.camera-result').style.display = 'none';
    });
  }

  /**
   * 📸 Handle captured photo
   */
  async handleCapturedPhoto(imageData) {
    try {
      // Store photo for offline use
      await this.storeOfflineData('captured_photos', {
        id: Date.now(),
        data: imageData,
        timestamp: new Date().toISOString(),
        location: this.geolocation,
      });

      // Show success message
      this.showNotification('Foto guardada', {
        body: 'Tu foto se ha guardado correctamente',
        icon: '/images/icons/camera-success.png',
      });

      // Trigger any photo handlers
      this.dispatchEvent('photo-captured', { imageData });
    } catch (error) {
      console.error('❌ Error handling captured photo:', error);
    }
  }

  /**
   * 📸 Close camera
   */
  closeCamera(modal) {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }

    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  /**
   * 🌐 Handle online status
   */
  handleOnlineStatus(isOnline) {
    this.isOnline = isOnline;

    if (isOnline) {
      console.log('🌐 Conexión restaurada');
      this.hideOfflineIndicator();
      this.syncOfflineData();
    } else {
      console.log('📴 Conexión perdida');
      this.showOfflineIndicator();
    }

    // Update UI
    document.body.classList.toggle('offline', !isOnline);
    this.dispatchEvent('connectivity-change', { isOnline });
  }

  /**
   * 📴 Create offline indicator
   */
  createOfflineIndicator() {
    if (!document.getElementById('offline-indicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.className = 'offline-indicator hidden';
      indicator.innerHTML = `
        <div class="offline-content">
          <span class="offline-icon">📴</span>
          <span class="offline-text">Modo sin conexión</span>
          <button class="retry-connection">Reintentar</button>
        </div>
      `;

      indicator.querySelector('.retry-connection').addEventListener('click', () => {
        window.location.reload();
      });

      document.body.appendChild(indicator);
    }
  }

  /**
   * 📴 Show offline indicator
   */
  showOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.classList.remove('hidden');
    }
  }

  /**
   * 🌐 Hide offline indicator
   */
  hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
    }
  }

  /**
   * 🔄 Sync offline data
   */
  async syncOfflineData() {
    if (!this.isOnline) return;

    try {
      const offlineData = await this.getOfflineData();

      for (const item of offlineData) {
        await this.syncDataItem(item);
      }

      // Clear synced data
      await this.clearSyncedOfflineData();

      console.log('✅ Offline data synced');
    } catch (error) {
      console.error('❌ Error syncing offline data:', error);
    }
  }

  /**
   * 💾 Store offline data
   */
  async storeOfflineData(type, data) {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['offline_data'], 'readwrite');
      const store = transaction.objectStore('offline_data');

      await store.add({
        type,
        data,
        timestamp: Date.now(),
        synced: false,
      });

      console.log('💾 Data stored offline:', type);
    } catch (error) {
      console.error('❌ Error storing offline data:', error);
    }
  }

  /**
   * 🔔 Show notification
   */
  async showNotification(title, options = {}) {
    if (this.notificationPermission === 'granted') {
      try {
        if (this.swRegistration) {
          await this.swRegistration.showNotification(title, {
            icon: '/images/icons/icon-192x192.png',
            badge: '/images/icons/badge-72x72.png',
            vibrate: [200, 100, 200],
            ...options,
          });
        } else {
          new Notification(title, options);
        }
      } catch (error) {
        console.error('❌ Error showing notification:', error);
      }
    }
  }

  /**
   * 📍 Handle location update
   */
  handleLocationUpdate() {
    if (this.geolocation) {
      // Update location-based features
      this.updateLocationBasedServices();

      // Show location-based notifications
      this.checkLocationNotifications();
    }
  }

  /**
   * 📍 Update location-based services
   */
  updateLocationBasedServices() {
    // Update delivery estimates
    this.updateDeliveryEstimates();

    // Show nearby stores
    this.showNearbyStores();

    // Update local promotions
    this.updateLocalPromotions();
  }

  /**
   * 🚚 Update delivery estimates
   */
  updateDeliveryEstimates() {
    if (this.geolocation) {
      // In a real implementation, this would call your delivery API
      console.log('🚚 Updating delivery estimates for location:', this.geolocation);

      // Example: Show estimated delivery time
      const deliveryBadge = document.querySelector('.delivery-estimate');
      if (deliveryBadge) {
        deliveryBadge.textContent = 'Entrega en 2-3 horas en tu zona';
        deliveryBadge.classList.add('location-updated');
      }
    }
  }

  /**
   * 🏪 Show nearby stores
   */
  showNearbyStores() {
    if (this.geolocation) {
      // Example nearby stores
      const nearbyStores = [
        { name: 'Flores Victoria Centro', distance: '1.2 km' },
        { name: 'Flores Victoria Mall', distance: '3.8 km' },
      ];

      this.dispatchEvent('nearby-stores-found', { stores: nearbyStores });
    }
  }

  /**
   * 📱 Show install banner
   */
  showInstallBanner() {
    if (!document.getElementById('install-banner')) {
      const banner = document.createElement('div');
      banner.id = 'install-banner';
      banner.className = 'install-banner';
      banner.innerHTML = `
        <div class="install-content">
          <div class="install-icon">📱</div>
          <div class="install-text">
            <h4>Instalar Flores Victoria</h4>
            <p>Acceso rápido desde tu pantalla de inicio</p>
          </div>
          <div class="install-actions">
            <button class="install-app">Instalar</button>
            <button class="dismiss-install">×</button>
          </div>
        </div>
      `;

      banner.querySelector('.install-app').addEventListener('click', () => {
        this.installApp();
      });

      banner.querySelector('.dismiss-install').addEventListener('click', () => {
        this.hideInstallBanner();
      });

      document.body.appendChild(banner);
    }
  }

  /**
   * 📱 Install app
   */
  async installApp() {
    if (this.installPrompt) {
      try {
        this.installPrompt.prompt();
        const result = await this.installPrompt.userChoice;

        if (result.outcome === 'accepted') {
          console.log('📱 User accepted installation');
        } else {
          console.log('📱 User dismissed installation');
        }

        this.installPrompt = null;
        this.hideInstallBanner();
      } catch (error) {
        console.error('❌ Error installing app:', error);
      }
    }
  }

  /**
   * 📱 Hide install banner
   */
  hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.remove();
    }
  }

  /**
   * 🔄 Check for updates
   */
  checkForUpdates() {
    if (this.swRegistration) {
      setInterval(() => {
        this.swRegistration.update();
      }, 60000); // Check every minute
    }
  }

  /**
   * 🔄 Handle service worker update
   */
  handleServiceWorkerUpdate() {
    const newWorker = this.swRegistration.installing;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.showUpdateNotification();
      }
    });
  }

  /**
   * 🔄 Show update notification
   */
  showUpdateNotification() {
    this.showNotification('Actualización disponible', {
      body: 'Una nueva versión está disponible. Toca para actualizar.',
      tag: 'app-update',
      actions: [
        { action: 'update', title: 'Actualizar ahora' },
        { action: 'dismiss', title: 'Más tarde' },
      ],
    });
  }

  /**
   * 🛠️ Utility methods
   */
  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  async openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FloresVictoriaDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('offline_data')) {
          const store = db.createObjectStore('offline_data', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  trackEvent(eventName, properties = {}) {
    // Track PWA events for analytics
    console.log('📊 PWA Event:', eventName, properties);

    // In a real implementation, send to analytics service
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
  }

  // Placeholder methods for full implementation
  async sendSubscriptionToServer(subscription) {
    console.log('📤 Would send subscription to server:', subscription);
  }

  async getOfflineData() {
    return []; // Implement IndexedDB query
  }

  async syncDataItem(item) {
    console.log('🔄 Would sync item:', item);
  }

  async clearSyncedOfflineData() {
    console.log('🧹 Would clear synced data');
  }

  handleAppVisible() {
    console.log('👁️ App became visible');
  }

  handleAppHidden() {
    console.log('🙈 App became hidden');
  }

  handlePageRestored() {
    console.log('🔄 Page restored from cache');
  }

  setupShareTarget() {
    console.log('🔗 Share target available');
  }

  updateDynamicShortcuts() {
    console.log('⚡ Updating dynamic shortcuts');
  }

  precacheResources() {
    console.log('💾 Precaching resources');
  }

  setupOfflineForms() {
    console.log('📝 Setting up offline forms');
  }

  handleSyncComplete(data) {
    console.log('✅ Sync complete:', data);
  }

  showCameraError() {
    this.showNotification('Error de cámara', {
      body: 'No se pudo acceder a la cámara',
      icon: '/images/icons/error.png',
    });
  }

  updateLocalPromotions() {
    console.log('🎯 Updating local promotions');
  }

  checkLocationNotifications() {
    console.log('📍 Checking location notifications');
  }
}

// PWA Styles
const pwaCSS = `
  .offline-indicator {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #e53e3e;
    color: white;
    z-index: 10001;
    transition: transform 0.3s ease;
  }

  .offline-indicator.hidden {
    transform: translateY(-100%);
  }

  .offline-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    gap: 1rem;
  }

  .offline-icon {
    font-size: 1.2rem;
  }

  .retry-connection {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .retry-connection:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .body.offline {
    filter: grayscale(0.3);
  }

  .install-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    z-index: 10000;
    transform: translateY(0);
    transition: transform 0.3s ease;
  }

  .install-content {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
  }

  .install-icon {
    font-size: 2rem;
  }

  .install-text {
    flex: 1;
  }

  .install-text h4 {
    margin: 0 0 0.25rem;
    font-size: 1.1rem;
  }

  .install-text p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .install-actions {
    display: flex;
    gap: 0.5rem;
  }

  .install-app {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .install-app:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .dismiss-install {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    opacity: 0.7;
  }

  .dismiss-install:hover {
    opacity: 1;
  }

  .camera-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 10002;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .camera-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    max-width: 500px;
    width: 90vw;
    max-height: 90vh;
  }

  .camera-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .camera-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .close-camera {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
  }

  .camera-preview {
    position: relative;
    background: black;
  }

  .camera-preview video {
    width: 100%;
    height: auto;
    display: block;
  }

  .camera-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    background: #f7fafc;
  }

  .camera-controls button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .camera-capture {
    background: #48bb78;
    color: white;
  }

  .camera-capture:hover {
    background: #38a169;
  }

  .camera-flip {
    background: #edf2f7;
    color: #4a5568;
  }

  .camera-cancel {
    background: #e53e3e;
    color: white;
  }

  .camera-result {
    padding: 1rem;
    text-align: center;
  }

  .camera-result img {
    max-width: 100%;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .result-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .result-actions button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }

  .use-photo {
    background: #48bb78;
    color: white;
  }

  .retake-photo {
    background: #edf2f7;
    color: #4a5568;
  }

  .pwa-camera-btn {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 9998;
    transition: transform 0.3s ease;
  }

  .pwa-camera-btn:hover {
    transform: scale(1.1);
  }

  .delivery-estimate.location-updated {
    animation: pulse 2s ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @media (max-width: 768px) {
    .camera-container {
      width: 95vw;
      height: 95vh;
    }

    .camera-controls {
      flex-wrap: wrap;
    }

    .install-content {
      flex-direction: column;
      text-align: center;
      gap: 0.75rem;
    }

    .install-actions {
      justify-content: center;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pwaCSS;
  document.head.appendChild(style);
}

// Global initialization
if (typeof window !== 'undefined') {
  window.FloresVictoriaPWA = FloresVictoriaPWA;

  // Auto-initialize PWA
  document.addEventListener('DOMContentLoaded', () => {
    window.floresPWA = new FloresVictoriaPWA();
  });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloresVictoriaPWA;
}
