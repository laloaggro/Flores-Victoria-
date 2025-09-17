// theme.js - Manejo del tema claro/oscuro

// Función para actualizar el ícono del botón de tema
function updateThemeIcon() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
  }
}

// Función para cambiar el tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
  // Aplicar el nuevo tema
  document.documentElement.setAttribute('data-theme', newTheme);
    
  // Guardar la preferencia en localStorage
  localStorage.setItem('theme', newTheme);
    
  // Actualizar el ícono del botón de tema
  updateThemeIcon();
  
  // Dispatch theme change event
  window.dispatchEvent(new CustomEvent('themechange', { detail: newTheme }));
}

// Inicializar el tema cuando se carga la página
function initializeTheme() {
  // Verificar si hay una preferencia de tema guardada
  let savedTheme = localStorage.getItem('theme');
    
  // Si no hay preferencia guardada, usar la preferencia del sistema
  if (!savedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    savedTheme = prefersDark ? 'dark' : 'light';
  }
    
  // Aplicar el tema
  document.documentElement.setAttribute('data-theme', savedTheme);
    
  // Actualizar el ícono del botón de tema
  updateThemeIcon();
}

// Inicializar el tema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
});

// Escuchar cambios en las preferencias del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const currentTheme = localStorage.getItem('theme');
  // Solo actualizar si no hay preferencia guardada
  if (!currentTheme) {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeIcon();
  }
});

// Exponer funciones globalmente
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
window.initializeTheme = initializeTheme;