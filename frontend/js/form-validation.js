/**
 * Form Validation System
 * Sistema de validación en tiempo real para formularios
 */

class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.fields = {};
    this.init();
  }
  
  init() {
    // Get all inputs
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Skip hidden inputs
      if (input.type === 'hidden') return;
      
      // Add to fields object
      this.fields[input.name || input.id] = {
        element: input,
        valid: false,
        touched: false
      };
      
      // Add event listeners
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.validateField(input, true));
    });
    
    // Handle form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  validateField(input, isInput = false) {
    const field = this.fields[input.name || input.id];
    if (!field) return;
    
    field.touched = true;
    
    // Clear previous errors
    this.clearFieldError(input);
    
    // Validation rules
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (input.hasAttribute('required') && !input.value.trim()) {
      isValid = false;
      errorMessage = 'Este campo es obligatorio';
    }
    
    // Email validation
    else if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        errorMessage = 'Por favor ingresa un email válido';
      }
    }
    
    // Phone validation
    else if (input.type === 'tel' && input.value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(input.value) || input.value.length < 10) {
        isValid = false;
        errorMessage = 'Por favor ingresa un teléfono válido (mín. 10 dígitos)';
      }
    }
    
    // Min length validation
    else if (input.hasAttribute('minlength') && input.value) {
      const minLength = parseInt(input.getAttribute('minlength'));
      if (input.value.length < minLength) {
        isValid = false;
        errorMessage = `Mínimo ${minLength} caracteres`;
      }
    }
    
    // Max length validation
    else if (input.hasAttribute('maxlength') && input.value) {
      const maxLength = parseInt(input.getAttribute('maxlength'));
      if (input.value.length > maxLength) {
        isValid = false;
        errorMessage = `Máximo ${maxLength} caracteres`;
      }
    }
    
    // Pattern validation
    else if (input.hasAttribute('pattern') && input.value) {
      const pattern = new RegExp(input.getAttribute('pattern'));
      if (!pattern.test(input.value)) {
        isValid = false;
        errorMessage = input.getAttribute('data-error') || 'Formato inválido';
      }
    }
    
    // Number validation
    else if (input.type === 'number' && input.value) {
      const min = input.getAttribute('min');
      const max = input.getAttribute('max');
      const value = parseFloat(input.value);
      
      if (min && value < parseFloat(min)) {
        isValid = false;
        errorMessage = `El valor mínimo es ${min}`;
      } else if (max && value > parseFloat(max)) {
        isValid = false;
        errorMessage = `El valor máximo es ${max}`;
      }
    }
    
    // URL validation
    else if (input.type === 'url' && input.value) {
      try {
        new URL(input.value);
      } catch {
        isValid = false;
        errorMessage = 'Por favor ingresa una URL válida';
      }
    }
    
    // Custom validation
    if (input.hasAttribute('data-validate')) {
      const validationType = input.getAttribute('data-validate');
      const customValidation = this.customValidations[validationType];
      
      if (customValidation) {
        const result = customValidation(input.value);
        if (!result.valid) {
          isValid = false;
          errorMessage = result.message;
        }
      }
    }
    
    field.valid = isValid;
    
    // Update UI
    if (!isValid && field.touched && !isInput) {
      this.showFieldError(input, errorMessage);
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.setAttribute('aria-invalid', 'false');
      if (isValid && field.touched) {
        this.showFieldSuccess(input);
      }
    }
    
    return isValid;
  }
  
  showFieldError(input, message) {
    const wrapper = this.getFieldWrapper(input);
    
    // Create error element
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = message;
    error.setAttribute('role', 'alert');
    error.style.cssText = `
      color: #d32f2f;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      animation: slideDown 0.3s ease;
    `;
    
    // Add error class to input
    input.classList.add('input-error');
    input.style.borderColor = '#d32f2f';
    
    // Append error
    wrapper.appendChild(error);
    
    // Announce to screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader(message);
    }
  }
  
  showFieldSuccess(input) {
    input.classList.remove('input-error');
    input.classList.add('input-success');
    input.style.borderColor = '#2d5016';
    
    const wrapper = this.getFieldWrapper(input);
    const successIcon = document.createElement('span');
    successIcon.className = 'field-success-icon';
    successIcon.innerHTML = '✓';
    successIcon.style.cssText = `
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #2d5016;
      font-weight: bold;
    `;
    
    if (wrapper.style.position !== 'relative') {
      wrapper.style.position = 'relative';
    }
    
    wrapper.appendChild(successIcon);
  }
  
  clearFieldError(input) {
    const wrapper = this.getFieldWrapper(input);
    const error = wrapper.querySelector('.field-error');
    const success = wrapper.querySelector('.field-success-icon');
    
    if (error) error.remove();
    if (success) success.remove();
    
    input.classList.remove('input-error', 'input-success');
    input.style.borderColor = '';
  }
  
  getFieldWrapper(input) {
    let wrapper = input.closest('.form-field') || 
                  input.closest('.form-group') ||
                  input.parentElement;
    
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'form-field-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }
    
    return wrapper;
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    let allValid = true;
    Object.values(this.fields).forEach(field => {
      if (!this.validateField(field.element)) {
        allValid = false;
      }
    });
    
    if (allValid) {
      // Show loading state
      this.setLoadingState(true);
      
      // Get form data
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());
      
      // Call success callback
      if (this.onSuccess) {
        this.onSuccess(data);
      } else {
        // Default: submit form
        this.form.submit();
      }
    } else {
      // Focus first invalid field
      const firstInvalid = this.form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Show error message
      this.showFormError('Por favor corrige los errores antes de continuar');
    }
  }
  
  showFormError(message) {
    let errorDiv = this.form.querySelector('.form-error-message');
    
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'form-error-message';
      errorDiv.setAttribute('role', 'alert');
      errorDiv.style.cssText = `
        background: #ffebee;
        color: #d32f2f;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 4px solid #d32f2f;
      `;
      this.form.insertBefore(errorDiv, this.form.firstChild);
    }
    
    errorDiv.textContent = message;
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
  
  setLoadingState(loading) {
    const submitBtn = this.form.querySelector('[type="submit"]');
    
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText || 'Enviar';
    }
  }
  
  // Custom validations
  customValidations = {
    cardNumber: (value) => {
      // Luhn algorithm
      const cleaned = value.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cleaned)) {
        return { valid: false, message: 'Número de tarjeta inválido' };
      }
      
      let sum = 0;
      let isEven = false;
      
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return {
        valid: sum % 10 === 0,
        message: 'Número de tarjeta inválido'
      };
    },
    
    postalCode: (value) => {
      const regex = /^\d{5}$/;
      return {
        valid: regex.test(value),
        message: 'Código postal debe ser de 5 dígitos'
      };
    },
    
    strongPassword: (value) => {
      const hasLength = value.length >= 8;
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*]/.test(value);
      
      const isStrong = hasLength && hasUpper && hasLower && hasNumber;
      
      if (!isStrong) {
        return {
          valid: false,
          message: 'La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números'
        };
      }
      
      return { valid: true };
    }
  };
}

// Initialize all forms
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    new FormValidator(form);
  });
  
  console.log('✅ Form validation system loaded');
});

// Export for manual initialization
window.FormValidator = FormValidator;
