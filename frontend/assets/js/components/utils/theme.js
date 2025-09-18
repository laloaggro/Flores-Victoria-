// theme.js - Manejo del tema claro/oscuro

/**
 * Inicializa el sistema de temas
 */
export function initializeTheme() {
  // Aplicar el tema guardado o el tema del sistema
  applySavedTheme();
  
  // Agregar evento al botón de cambio de tema
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  console.log('Theme system initialized');
}

// Función para aplicar el tema guardado
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const themeIcon = document.querySelector('.theme-icon');
  
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
  }
}

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
  if (newTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  
  // Guardar preferencia del usuario
  localStorage.setItem('theme', newTheme);
  
  // Actualizar ícono
  updateThemeIcon();
  
  // Disparar evento personalizado
  document.dispatchEvent(new CustomEvent('themeChanged', {
    detail: { theme: newTheme }
  }));
}