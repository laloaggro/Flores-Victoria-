/**
 * Error Handler Global
 * Maneja errores del navegador y extensiones
 */

(function() {
  'use strict';

  // Suprimir errores conocidos de extensiones del navegador
  const IGNORED_ERRORS = [
    'message channel closed',
    'listener indicated an asynchronous response',
    'Extension context invalidated',
    'chrome-extension://',
    'moz-extension://'
  ];

  // Verificar si un error debe ser ignorado
  function shouldIgnoreError(error) {
    if (!error) return false;
    
    const errorMessage = (error.message || error.toString()).toLowerCase();
    
    return IGNORED_ERRORS.some(ignored => 
      errorMessage.includes(ignored.toLowerCase())
    );
  }

  // Manejar errores no capturados
  window.addEventListener('error', (event) => {
    if (shouldIgnoreError(event.error)) {
      event.preventDefault();
      event.stopPropagation();
      console.debug('⚠️ Error de extensión ignorado:', event.error.message);
      return true;
    }
  }, true);

  // Manejar promesas rechazadas
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldIgnoreError(event.reason)) {
      event.preventDefault();
      console.debug('⚠️ Promesa rechazada ignorada:', event.reason.message || event.reason);
      return;
    }
    
    // Log errores reales para debugging
    console.error('❌ Promesa rechazada:', event.reason);
  });

  // Manejar errores de mensajes de extensiones
  if (window.chrome && chrome.runtime) {
    const originalSendMessage = chrome.runtime.sendMessage;
    
    chrome.runtime.sendMessage = function(...args) {
      try {
        return originalSendMessage.apply(this, args);
      } catch (error) {
        if (shouldIgnoreError(error)) {
          console.debug('⚠️ Error de chrome.runtime ignorado');
          return;
        }
        throw error;
      }
    };
  }

  console.log('✅ Error handler global inicializado');

})();
