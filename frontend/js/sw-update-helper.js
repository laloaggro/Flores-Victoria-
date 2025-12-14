/**
 * Service Worker Update Helper
 * Utilidad para forzar la actualización del Service Worker
 */

(function () {
  'use strict';

  // Función para forzar la actualización del Service Worker
  globalThis.forceServiceWorkerUpdate = async function () {
    try {
      

      // Desregistrar todos los Service Workers existentes
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
        
      }

      // Limpiar todo el cache
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        
      }

      
      
      // Recargar la página para registrar el nuevo SW
      setTimeout(() => {
        globalThis.location.reload(true);
      }, 500);
    } catch (error) {
      console.error('❌ Error al actualizar Service Worker:', error);
    }
  };

  // Función para verificar la versión del SW
  globalThis.checkServiceWorkerVersion = async function () {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        
        return null;
      }

      const controller = navigator.serviceWorker.controller;
      
      if (!controller) {
        
        return null;
      }

      // Verificar si hay actualización esperando
      if (registration.waiting) {
        
        
      } else if (registration.installing) {
        
      } else {
        
      }

      return {
        active: !!registration.active,
        waiting: !!registration.waiting,
        installing: !!registration.installing,
        scope: registration.scope,
      };
    } catch (error) {
      console.error('❌ Error al verificar versión:', error);
      return null;
    }
  };

  // DESHABILITADO: Auto-verificación causa recargas en desarrollo
  // Para verificar manualmente, ejecuta en consola: checkServiceWorkerVersion()
  // if ('serviceWorker' in navigator) {
  //   globalThis.addEventListener('load', () => {
  //     setTimeout(() => {
  //       globalThis.checkServiceWorkerVersion();
  //     }, 2000);
  //   });
  // }

  // Logs solo en desarrollo
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    
    
  }
})();
