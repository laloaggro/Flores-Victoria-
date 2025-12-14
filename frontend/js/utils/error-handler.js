/**
 * Error Handler Global
 * Maneja errores del navegador y extensiones
 * Este script debe cargarse PRIMERO antes que cualquier otro
 */

(function () {
  'use strict';

  // Logger condicional
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.DEBUG === true);
  const logger = {
    log: (...args) => isDev && ,
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
  };

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
    'The message port closed before a response was received',
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
    return IGNORED_ERRORS.some((ignored) => errorMessage.includes(ignored.toLowerCase()));
  }

  // Guardar el console.error original
  const originalConsoleError = console.error;

  // Interceptar console.error para filtrar errores de extensiones
  console.error = function (...args) {
    const firstArg = args[0];

    if (typeof firstArg === 'string' && shouldIgnoreError({ message: firstArg })) {
      
      return;
    }

    if (firstArg instanceof Error && shouldIgnoreError(firstArg)) {
      
      return;
    }

    // Llamar al console.error original para errores reales
    originalConsoleError.apply(console, args);
  };

  // Manejar errores no capturados (fase de captura)
  globalThis.addEventListener(
    'error',
    (event) => {
      if (shouldIgnoreError(event.error || event)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        return false;
      }
    },
    true
  );

  // Manejar promesas rechazadas con ALTA prioridad
  globalThis.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event.reason;

      // Siempre prevenir el error por defecto y decidir después
      event.preventDefault();

      // Ignorar errores de extensiones y message channel
      if (shouldIgnoreError(reason)) {
        
        return;
      }

      // Ignorar errores sin detalles (típicamente de extensiones)
      if (!reason || (typeof reason === 'object' && !reason.message && !reason.stack)) {
        
        return;
      }

      // Solo mostrar errores reales de la aplicación
      originalConsoleError('❌ Promesa rechazada (aplicación):', reason);
    },
    true
  );

  logger.log('✅ Error handler global inicializado');
})();
