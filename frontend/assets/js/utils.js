// utils.js - Funciones de utilidad generales

/**
 * Formatea un número como precio en formato chileno
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(price);
}

/**
 * Obtiene un parámetro de la URL
 * @param {string} name - Nombre del parámetro
 * @returns {string|null} Valor del parámetro o null si no existe
 */
export function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Espera un tiempo determinado
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promesa que se resuelve después del tiempo especificado
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica si un elemento está visible en la pantalla
 * @param {Element} element - Elemento a verificar
 * @returns {boolean} True si el elemento está visible
 */
export function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}