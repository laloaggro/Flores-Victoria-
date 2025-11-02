/**
 * 🔧 FLORES VICTORIA - SERVICE WORKER CLEANUP
 * =============================================
 * Desinstala todos los service workers y limpia cachés
 * Úsalo cuando haya problemas de "Sin conexión"
 */

(async function cleanupServiceWorkers() {
  console.log('🧹 Iniciando limpieza de Service Workers...');

  try {
    // 1. Desregistrar todos los service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      console.log(`📋 Encontrados ${registrations.length} service workers registrados`);

      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Service Worker desregistrado:', registration.scope);
      }
    }

    // 2. Limpiar TODOS los cachés
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      console.log(`📋 Encontrados ${cacheNames.length} cachés`);

      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log('✅ Caché eliminado:', cacheName);
      }
    }

    // 3. Limpiar localStorage relacionado con SW
    const swKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('sw-') || key.includes('cache-'))) {
        swKeys.push(key);
      }
    }

    swKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('✅ LocalStorage limpiado:', key);
    });

    console.log('');
    console.log('✅ ¡LIMPIEZA COMPLETADA!');
    console.log('');
    console.log('📌 PRÓXIMOS PASOS:');
    console.log('1. Cierra TODAS las pestañas de este sitio');
    console.log('2. Cierra el navegador completamente');
    console.log('3. Abre el navegador y vuelve a cargar el sitio');
    console.log('4. El sitio funcionará sin Service Worker');
    console.log('');

    // Mostrar alerta visual
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: 'Poppins', sans-serif;
      text-align: center;
      min-width: 400px;
    `;
    alertDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 1.5rem;">✅ Limpieza Completada</h3>
      <p style="margin: 0 0 15px 0;">Todos los Service Workers y cachés han sido eliminados</p>
      <ol style="text-align: left; margin: 15px 0; padding-left: 20px;">
        <li>Cierra todas las pestañas de este sitio</li>
        <li>Cierra el navegador completamente</li>
        <li>Abre el navegador y recarga el sitio</li>
      </ol>
      <button onclick="this.parentElement.remove()" style="
        background: white;
        color: #059669;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 10px;
      ">Entendido</button>
    `;
    document.body.appendChild(alertDiv);

    return {
      success: true,
      serviceWorkersRemoved: registrations.length,
      cachesRemoved: cacheNames.length,
      localStorageKeysRemoved: swKeys.length
    };

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    
    alert('Error al limpiar Service Workers. Por favor:\n\n' +
          '1. Abre DevTools (F12)\n' +
          '2. Ve a Application > Service Workers\n' +
          '3. Haz click en "Unregister" en cada uno\n' +
          '4. Ve a Application > Cache Storage\n' +
          '5. Elimina todos los cachés\n' +
          '6. Recarga la página');

    return {
      success: false,
      error: error.message
    };
  }
})();
