// Service Worker registration (placeholder)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[SW] registered', reg.scope))
      .catch((err) => console.warn('[SW] failed', err));
  });
}
