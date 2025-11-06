/**
 * Service Worker Registration
 * Registra y gestiona el Service Worker
 */

(function () {
  'use strict';

  // Verificar soporte
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no soportados en este navegador');
    return;
  }

  // Registrar cuando la página cargue
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registrado:', registration.scope);

      // Manejar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Hay una nueva versión disponible
            showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  });

  // Notificar al usuario sobre actualizaciones
  function showUpdateNotification() {
    // Verificar si existe el componente de toast
    if (window.Toast && typeof window.Toast.show === 'function') {
      window.Toast.show(
        'Nueva versión disponible. Actualiza para obtener las últimas mejoras.',
        'info',
        {
          duration: 10000,
          action: {
            text: 'Actualizar',
            onClick: () => {
              window.location.reload();
            },
          },
        }
      );
    } else {
      // Fallback a confirmación nativa
      if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar ahora?')) {
        window.location.reload();
      }
    }
  }

  // Escuchar mensajes del Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('📦 Cache actualizado:', event.data.url);
    }
  });

  // Método público para limpiar cache
  window.clearServiceWorkerCache = async () => {
    if (!navigator.serviceWorker.controller) {
      console.warn('No hay Service Worker activo');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE',
    });

    console.log('🗑️ Limpiando cache del Service Worker...');
  };

  // Método público para verificar estado
  window.getServiceWorkerStatus = async () => {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return { registered: false };
    }

    return {
      registered: true,
      scope: registration.scope,
      active: !!registration.active,
      waiting: !!registration.waiting,
      installing: !!registration.installing,
    };
  };
})();
