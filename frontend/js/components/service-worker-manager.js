/**
 * Service Worker Manager
 *
 * PWA capabilities manager:
 * - Service Worker registration and lifecycle
 * - Cache strategies (cache-first, network-first, stale-while-revalidate)
 * - Offline support
 * - Background sync
 * - Push notifications
 * - App install prompts
 * - Update management
 *
 * Features:
 * - Automatic cache versioning
 * - Precaching critical assets
 * - Runtime caching with strategies
 * - Offline fallback pages
 * - Update notifications
 * - Cache cleanup
 *
 * Usage:
 *   ServiceWorkerManager.init({ swPath: '/sw.js' });
 */

class ServiceWorkerManager {
  constructor(options = {}) {
    this.options = {
      // Service Worker file
      swPath: '/sw.js',

      // Features
      enablePushNotifications: false,
      enableBackgroundSync: false,
      enableOffline: true,
      showInstallPrompt: true,
      showUpdateNotification: true,

      // Cache strategy
      cacheStrategy: 'network-first', // cache-first, network-first, stale-while-revalidate

      // Cache names
      cacheVersion: 'v1',
      staticCacheName: 'static',
      dynamicCacheName: 'dynamic',
      imageCacheName: 'images',

      // Cache limits
      maxCacheSize: 50,
      maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days

      // URLs to precache
      precacheUrls: [
        '/',
        '/offline.html',
        '/css/main.css',
        '/js/main.js',
      ],

      // Debug
      debug: false,
    };

    Object.assign(this.options, options);

    this.registration = null;
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
  }

  /**
   * Initialize Service Worker
   */
  async init() {
    if (!('serviceWorker' in navigator)) {
      this.log('Service Workers not supported');
      return;
    }

    this.log('Initializing Service Worker Manager...');

    // Register service worker
    await this.register();

    // Setup event listeners
    this.setupEventListeners();

    // Check for updates periodically
    this.checkForUpdates();

    this.log('Service Worker Manager initialized');
  }

  /**
   * Register service worker
   */
  async register() {
    try {
      this.registration = await navigator.serviceWorker.register(this.options.swPath, {
        scope: '/',
      });

      this.log('Service Worker registered', this.registration);

      // Handle different states
      if (this.registration.installing) {
        this.log('Service Worker installing');
        this.trackInstalling(this.registration.installing);
      } else if (this.registration.waiting) {
        this.log('Service Worker waiting');
        this.showUpdateNotification();
      } else if (this.registration.active) {
        this.log('Service Worker active');
      }

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        this.log('Service Worker update found');
        this.trackInstalling(this.registration.installing);
      });

      // Send precache list to service worker
      if (this.registration.active) {
        this.sendMessage({
          type: 'PRECACHE',
          urls: this.options.precacheUrls,
          version: this.options.cacheVersion,
        });
      }

      return this.registration;
    } catch (error) {
      this.log('Service Worker registration failed', error);
      throw error;
    }
  }

  /**
   * Track installing service worker
   */
  trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
      this.log('Service Worker state:', worker.state);

      if (worker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New service worker available
          this.showUpdateNotification();
        } else {
          // First install
          this.log('Service Worker installed for first time');
          this.dispatchEvent('sw:installed');
        }
      }

      if (worker.state === 'activated') {
        this.dispatchEvent('sw:activated');
      }
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.log('Back online');
      this.dispatchEvent('sw:online');
      this.syncPendingRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.log('Gone offline');
      this.dispatchEvent('sw:offline');
    });

    // Install prompt
    if (this.options.showInstallPrompt) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallButton();
        this.log('Install prompt available');
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.log('App installed');
        this.dispatchEvent('sw:appinstalled');
      });
    }

    // Service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    // Controlled change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.log('Controller changed - reloading');
      window.location.reload();
    });
  }

  /**
   * Show install button
   */
  showInstallButton() {
    const button = document.querySelector('[data-install-pwa]');
    if (button) {
      button.style.display = 'block';
      button.addEventListener('click', () => this.promptInstall());
    }
  }

  /**
   * Prompt app install
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      this.log('No install prompt available');
      return;
    }

    this.deferredPrompt.prompt();

    const result = await this.deferredPrompt.userChoice;
    this.log('Install prompt result:', result.outcome);

    if (result.outcome === 'accepted') {
      this.dispatchEvent('sw:installaccepted');
    } else {
      this.dispatchEvent('sw:installrejected');
    }

    this.deferredPrompt = null;
  }

  /**
   * Show update notification
   */
  showUpdateNotification() {
    if (!this.options.showUpdateNotification) return;

    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="sw-update-content">
        <p>¡Nueva versión disponible!</p>
        <button class="sw-update-btn" data-action="update">Actualizar</button>
        <button class="sw-update-btn" data-action="dismiss">Más tarde</button>
      </div>
    `;

    document.body.appendChild(notification);

    notification.addEventListener('click', (e) => {
      const action = e.target.dataset.action;

      if (action === 'update') {
        this.skipWaiting();
      }

      notification.remove();
    });

    this.dispatchEvent('sw:updateavailable');
  }

  /**
   * Skip waiting and activate new service worker
   */
  skipWaiting() {
    if (this.registration && this.registration.waiting) {
      this.sendMessage({ type: 'SKIP_WAITING' }, this.registration.waiting);
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      this.log('Checked for updates');
    } catch (error) {
      this.log('Update check failed', error);
    }

    // Check every hour
    setTimeout(() => this.checkForUpdates(), 60 * 60 * 1000);
  }

  /**
   * Send message to service worker
   */
  sendMessage(message, target = null) {
    const sw = target || this.registration?.active || navigator.serviceWorker.controller;

    if (sw) {
      sw.postMessage(message);
      this.log('Message sent to SW', message);
    }
  }

  /**
   * Handle message from service worker
   */
  handleMessage(data) {
    this.log('Message from SW', data);

    switch (data.type) {
      case 'CACHE_UPDATED':
        this.dispatchEvent('sw:cacheupdated', data);
        break;

      case 'OFFLINE_READY':
        this.dispatchEvent('sw:offlineready', data);
        break;

      case 'SYNC_COMPLETE':
        this.dispatchEvent('sw:synccomplete', data);
        break;

      default:
        this.dispatchEvent('sw:message', data);
    }
  }

  /**
   * Sync pending requests
   */
  async syncPendingRequests() {
    if (!this.options.enableBackgroundSync) return;

    if ('sync' in this.registration) {
      try {
        await this.registration.sync.register('sync-pending');
        this.log('Background sync registered');
      } catch (error) {
        this.log('Background sync failed', error);
      }
    }
  }

  /**
   * Request push notification permission
   */
  async requestNotificationPermission() {
    if (!this.options.enablePushNotifications) return false;

    if (!('Notification' in window)) {
      this.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      this.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.log('Notification permission:', permission);

    return permission === 'granted';
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush() {
    if (!this.options.enablePushNotifications) return null;

    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'YOUR_VAPID_PUBLIC_KEY'
        ),
      });

      this.log('Push subscription', subscription);
      this.dispatchEvent('sw:pushsubscribed', { subscription });

      return subscription;
    } catch (error) {
      this.log('Push subscription failed', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush() {
    try {
      const subscription = await this.registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        this.log('Unsubscribed from push');
        this.dispatchEvent('sw:pushunsubscribed');
        return true;
      }

      return false;
    } catch (error) {
      this.log('Unsubscribe failed', error);
      return false;
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      this.log('All caches cleared');
      this.dispatchEvent('sw:cachescleared');
    } catch (error) {
      this.log('Failed to clear caches', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize() {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100,
      };
    } catch (error) {
      this.log('Failed to get cache size', error);
      return null;
    }
  }

  /**
   * Convert VAPID key
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Dispatch custom event
   */
  dispatchEvent(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  /**
   * Log debug messages
   */
  log(...args) {
    if (this.options.debug) {
      console.log('[ServiceWorker]', ...args);
    }
  }

  /**
   * Unregister service worker
   */
  async unregister() {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      this.log('Service Worker unregistered');
      this.dispatchEvent('sw:unregistered');
      return result;
    } catch (error) {
      this.log('Unregister failed', error);
      return false;
    }
  }
}

// Create singleton
const serviceWorkerManagerInstance = new ServiceWorkerManager();

// Static methods
ServiceWorkerManager.init = (options) => {
  Object.assign(serviceWorkerManagerInstance.options, options);
  return serviceWorkerManagerInstance.init();
};

ServiceWorkerManager.register = () => serviceWorkerManagerInstance.register();
ServiceWorkerManager.unregister = () => serviceWorkerManagerInstance.unregister();
ServiceWorkerManager.skipWaiting = () => serviceWorkerManagerInstance.skipWaiting();
ServiceWorkerManager.clearCaches = () => serviceWorkerManagerInstance.clearCaches();
ServiceWorkerManager.getCacheSize = () => serviceWorkerManagerInstance.getCacheSize();
ServiceWorkerManager.subscribeToPush = () => serviceWorkerManagerInstance.subscribeToPush();
ServiceWorkerManager.unsubscribeFromPush = () => serviceWorkerManagerInstance.unsubscribeFromPush();
ServiceWorkerManager.promptInstall = () => serviceWorkerManagerInstance.promptInstall();

// Auto-initialize (can be disabled via meta tag)
document.addEventListener('DOMContentLoaded', () => {
  const swMeta = document.querySelector('meta[name="service-worker"]');
  if (swMeta && swMeta.content !== 'disabled') {
    ServiceWorkerManager.init({
      swPath: swMeta.dataset.path || '/sw.js',
      debug: swMeta.dataset.debug === 'true',
    });
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServiceWorkerManager;
}

window.ServiceWorkerManager = ServiceWorkerManager;
