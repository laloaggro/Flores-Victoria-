/**
 * Error Handler Global
 * Maneja errores del navegador y extensiones
 * Este script debe cargarse PRIMERO antes que cualquier otro
 */

(function() {
  'use strict';

  // Suprimir errores conocidos de extensiones del navegador
  const IGNORED_ERRORS = [
    'message channel closed',
    'listener indicated an asynchronous response',
    'message channel',
    'Extension context invalidated',
    'chrome-extension://',
    'moz-extension://',
    'extension context',
    'Could not establish connection',
    'Receiving end does not exist',
    'The message port closed before a response was received'
  ];

  // Verificar si un error debe ser ignorado
  function shouldIgnoreError(error) {
    if (!error) return true; // Ignorar errores nulos/undefined
    
    // Convertir error a string para búsqueda
    const errorMessage = (
      error.message || 
      error.error?.message || 
      error.reason?.message || 
      error.toString()
    ).toLowerCase();
    
    // Verificar si coincide con algún error conocido de extensiones
    return IGNORED_ERRORS.some(ignored => 
      errorMessage.includes(ignored.toLowerCase())
    );
  }

  // Guardar el console.error original
  const originalConsoleError = console.error;
  
  // Interceptar console.error para filtrar errores de extensiones
  console.error = function(...args) {
    const firstArg = args[0];
    
    if (typeof firstArg === 'string' && shouldIgnoreError({ message: firstArg })) {
      console.debug('⚠️ Error de extensión filtrado en console.error');
      return;
    }
    
    if (firstArg instanceof Error && shouldIgnoreError(firstArg)) {
      console.debug('⚠️ Error de extensión filtrado en console.error');
      return;
    }
    
    // Llamar al console.error original para errores reales
    originalConsoleError.apply(console, args);
  };

  // Manejar errores no capturados (fase de captura)
  window.addEventListener('error', (event) => {
    if (shouldIgnoreError(event.error || event)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.debug('⚠️ Error de extensión ignorado:', event.error?.message || 'Sin mensaje');
      return false;
    }
  }, true);

  // Manejar promesas rechazadas con ALTA prioridad
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    
    // Siempre prevenir el error por defecto y decidir después
    event.preventDefault();
    
    // Ignorar errores de extensiones y message channel
    if (shouldIgnoreError(reason)) {
      console.debug('⚠️ Promesa rechazada ignorada (extensión):', reason?.message || reason);
      return;
    }
    
    // Ignorar errores sin detalles (típicamente de extensiones)
    if (!reason || (typeof reason === 'object' && !reason.message && !reason.stack)) {
      console.debug('⚠️ Error sin detalles ignorado');
      return;
    }
    
    // Solo mostrar errores reales de la aplicación
    originalConsoleError('❌ Promesa rechazada (aplicación):', reason);
  }, true);

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
