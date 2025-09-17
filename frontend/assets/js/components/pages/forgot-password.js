import { showNotification, API_BASE_URL } from '../utils/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotPasswordForm');
  const emailInput = document.getElementById('email');
  const submitBtn = document.querySelector('button[type="submit"]');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
            
      const email = emailInput.value.trim();
            
      if (!email) {
        showNotification('Por favor ingrese su correo electrónico', 'error');
        return;
      }
            
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Por favor ingrese un correo electrónico válido', 'error');
        return;
      }
            
      // Deshabilitar botón y mostrar indicador de carga
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
      try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email })
        });
                
        const data = await response.json();
                
        if (response.ok) {
          showNotification('Se ha enviado un enlace de recuperación a su correo electrónico', 'success');
          form.reset();
        } else {
          throw new Error(data.message || 'Error al enviar solicitud de recuperación');
        }
      } catch (error) {
        console.error('Error al enviar solicitud de recuperación:', error);
        showNotification(error.message || 'Error al enviar solicitud de recuperación. Por favor intente nuevamente.', 'error');
      } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});