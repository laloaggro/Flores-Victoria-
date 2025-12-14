/**
 * Service Worker Update Helper
 * Utilidad para forzar la actualización del Service Worker
 */

(function () {
  'use strict';

  // Función para forzar la actualización del Service Worker
  globalThis.forceServiceWorkerUpdate = async function () {
    try {
      console.log('🔄 Forzando actualización del Service Worker...');

      // Desregistrar todos los Service Workers existentes
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Service Worker desregistrado:', registration.scope);
      }

      // Limpiar todo el cache
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log('🗑️ Cache eliminado:', cacheName);
      }

      console.log('✅ Limpieza completada. Recargando página...');
      
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
        console.log('ℹ️ No hay Service Worker registrado');
        return null;
      }

      const controller = navigator.serviceWorker.controller;
      
      if (!controller) {
        console.log('ℹ️ Service Worker registrado pero no activo');
        return null;
      }

      // Verificar si hay actualización esperando
      if (registration.waiting) {
        console.log('⚠️ Hay una actualización del Service Worker esperando');
        console.log('💡 Ejecuta: forceServiceWorkerUpdate() para actualizar');
      } else if (registration.installing) {
        console.log('🔄 Service Worker instalando nueva versión...');
      } else {
        console.log('✅ Service Worker actualizado y activo');
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
    console.log('🛠️ SW Update Helper cargado');
    console.log('💡 Comandos: forceServiceWorkerUpdate() | checkServiceWorkerVersion()');
  }
})();
