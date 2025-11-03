/**
 * Main JavaScript Entry Point
 * Este archivo importa todos los CSS y JS necesarios para que Vite los procese
 */

// Importar estilos principales (Vite los procesará y generará con hash)
import './css/main.css';

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
