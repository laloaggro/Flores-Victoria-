/**
 * Main JavaScript Entry Point
 * Este archivo importa todos los CSS y JS necesarios para que Vite los procese
 */

// Importar estilos principales (Vite los procesará y generará con hash)
// import '../css/base.css';

// Log cuando la app está lista
console.log('✅ Flores Victoria - App loaded');

// Performance monitoring
if ('PerformanceObserver' in window) {
  try {
    // Monitor LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('📊 LCP:', Math.round(lastEntry.startTime), 'ms');
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('📊 FID:', Math.round(entry.processingStart - entry.startTime), 'ms');
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.warn('⚠️ Performance monitoring not available');
  }
}

// Remover splash screen cuando la página cargue
window.addEventListener('load', () => {
  const splash = document.querySelector('.app-splash');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('loaded');
      setTimeout(() => splash.remove(), 300);
    }, 500);
  }
});

/**
 * Service Worker Registration
 * Registra el SW para caching offline-first y mejor performance
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);

        // Verificar actualizaciones cada hora
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        );

        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Nueva versión disponible. Recarga para actualizar.');
              // Opcional: mostrar notificación al usuario
            }
          });
        });
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker registration failed:', error);
      });
  });
}
