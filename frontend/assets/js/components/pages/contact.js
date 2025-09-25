// contact.js - Funcionalidad de la página de contacto

// Importar utilidades
import { showNotification, API_BASE_URL } from '../utils/utils.js';

// Importar UserMenu
import UserMenu from '../utils/userMenu.js';

// Función para manejar el envío del formulario de contacto
async function handleContactFormSubmit(e) {
  e.preventDefault();
    
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
    
  // Deshabilitar botón y mostrar indicador de carga
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
  try {
    // Obtener datos del formulario
    const formData = new FormData(form);
    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
        
    // Validar datos
    if (!contactData.name || !contactData.email || !contactData.message) {
      showNotification('Por favor complete todos los campos requeridos', 'error');
      return;
    }
        
    // Enviar datos al servidor
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    });
        
    const result = await response.json();
        
    if (response.ok) {
      showNotification('Mensaje enviado correctamente. Nos pondremos en contacto pronto.', 'success');
      form.reset();
    } else {
      throw new Error(result.message || 'Error al enviar el mensaje');
    }
  } catch (error) {
    console.error('Error al enviar el formulario de contacto:', error);
    showNotification(error.message || 'Error al enviar el mensaje. Por favor intente nuevamente.', 'error');
  } finally {
    // Rehabilitar botón
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Función para mostrar notificaciones ya está importada desde '../utils/utils.js'

// Función para validar el formulario
function validateContactForm(form) {
  // Limpiar errores previos
  clearContactFormErrors(form);
    
  let isValid = true;
  const errors = [];
    
  // Validar nombre
  const name = form.querySelector('#contactName');
  if (name && !name.value.trim()) {
    errors.push({ field: name, message: 'El nombre es obligatorio' });
    isValid = false;
  }
    
  // Validar email
  const email = form.querySelector('#contactEmail');
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      errors.push({ field: email, message: 'El email es obligatorio' });
      isValid = false;
    } else if (!emailRegex.test(email.value.trim())) {
      errors.push({ field: email, message: 'El email no es válido' });
      isValid = false;
    }
  }
    
  // Validar asunto
  const subject = form.querySelector('#contactSubject');
  if (subject && !subject.value.trim()) {
    errors.push({ field: subject, message: 'El asunto es obligatorio' });
    isValid = false;
  }
    
  // Validar mensaje
  const message = form.querySelector('#contactMessageText');
  if (message && !message.value.trim()) {
    errors.push({ field: message, message: 'El mensaje es obligatorio' });
    isValid = false;
  } else if (message && message.value.trim().length < 10) {
    errors.push({ field: message, message: 'El mensaje debe tener al menos 10 caracteres' });
    isValid = false;
  }
    
  // Mostrar errores si los hay
  if (!isValid) {
    errors.forEach(error => {
      showContactFieldError(error.field, error.message);
    });
  }
    
  return isValid;
}

// Función para mostrar errores en campos
function showContactFieldError(field, message) {
  // Crear elemento de error
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.id = field.id + '-error';
    
  // Insertar después del campo
  field.parentNode.insertBefore(errorElement, field.nextSibling);
    
  // Marcar campo como inválido
  field.setAttribute('aria-invalid', 'true');
  field.classList.add('invalid');
}

// Función para limpiar errores del formulario
function clearContactFormErrors(form) {
  // Eliminar mensajes de error
  const errorElements = form.querySelectorAll('.error-message');
  errorElements.forEach(element => element.remove());
    
  // Limpiar estado de campos
  const fields = form.querySelectorAll('input, textarea');
  fields.forEach(field => {
    field.setAttribute('aria-invalid', 'false');
    field.classList.remove('invalid');
  });
}

// Función para agregar token CSRF a formularios
function addCSRFTokenToForms() {
  const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
  if (!csrfTokenMeta) return;
    
  const csrfToken = csrfTokenMeta.getAttribute('content');
  if (!csrfToken) return;
    
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    // Verificar si el formulario ya tiene un token CSRF
    const existingToken = form.querySelector('input[name="_token"]');
    if (!existingToken) {
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = '_token';
      tokenInput.value = csrfToken;
      form.appendChild(tokenInput);
    }
  });
}

// Función para inicializar la página de contacto
function initializeContactForm() {
  // Inicializar UserMenu
  UserMenu.init();
    
  // Obtener formulario de contacto
  const contactForm = document.getElementById('contactForm');
    
  // Añadir event listener para el envío del formulario
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
    
  console.log('✅ Página de contacto inicializada');
}

// Exportar función de inicialización
export { initializeContactForm };