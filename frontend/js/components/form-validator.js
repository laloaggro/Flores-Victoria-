/**
 * Form Validator Component
 * Sistema unificado de validación de formularios
 *
 * Uso:
 * const validator = new FormValidator(formElement);
 * validator.addRule('email', ['required', 'email']);
 * validator.onSubmit((data) => console.log('Valid data:', data));
 */

class FormValidator {
  constructor(formElement, options = {}) {
    this.form = formElement;
    this.rules = new Map();
    this.customValidators = new Map();
    this.errors = new Map();

    this.config = {
      showErrorsOnBlur: true,
      showErrorsOnInput: false,
      scrollToError: true,
      focusFirstError: true,
      submitCallback: null,
      errorClass: 'form-error',
      fieldErrorClass: 'field-error',
      ...options,
    };

    this.init();
  }

  init() {
    // Prevenir submit por defecto
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Event listeners en campos
    if (this.config.showErrorsOnBlur) {
      this.form.querySelectorAll('input, textarea, select').forEach((field) => {
        field.addEventListener('blur', () => this.validateField(field.name));
      });
    }

    if (this.config.showErrorsOnInput) {
      this.form.querySelectorAll('input, textarea, select').forEach((field) => {
        field.addEventListener('input', () => this.validateField(field.name));
      });
    }
  }

  // ==================== REGLAS DE VALIDACIÓN ====================

  addRule(fieldName, rules, customMessage = null) {
    this.rules.set(fieldName, {
      rules: Array.isArray(rules) ? rules : [rules],
      message: customMessage,
    });
    return this;
  }

  addCustomValidator(name, validatorFn) {
    this.customValidators.set(name, validatorFn);
    return this;
  }

  // ==================== VALIDADORES BUILT-IN ====================

  static validators = {
    required: (value) => value !== null && value !== undefined && value.trim() !== '',

    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value);
    },

    phone: (value) => {
      // Chilean format: +56912345678 or 912345678
      const phoneRegex = /^(\+?56)?9\d{8}$/;
      return !value || phoneRegex.test(value.replace(/\s/g, ''));
    },

    rut: (value) => {
      if (!value) return true;

      // Clean RUT
      const cleanRut = value.replace(/[.-]/g, '');
      if (!/^\d{7,8}[0-9Kk]$/.test(cleanRut)) return false;

      // Validate check digit
      const body = cleanRut.slice(0, -1);
      const dv = cleanRut.slice(-1).toUpperCase();

      let sum = 0;
      let multiplier = 2;

      for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
      }

      const expectedDv = 11 - (sum % 11);
      const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);

      return dv === calculatedDv;
    },

    minLength: (min) => (value) => !value || value.length >= min,

    maxLength: (max) => (value) => !value || value.length <= max,

    min: (minValue) => (value) => {
      const num = parseFloat(value);
      return !value || (!isNaN(num) && num >= minValue);
    },

    max: (maxValue) => (value) => {
      const num = parseFloat(value);
      return !value || (!isNaN(num) && num <= maxValue);
    },

    pattern: (regex) => (value) => !value || regex.test(value),

    url: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return !value;
      }
    },

    match: (otherFieldName) => (value, formData) => value === formData.get(otherFieldName),

    numeric: (value) => !value || /^\d+$/.test(value),

    alpha: (value) => !value || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value),

    alphanumeric: (value) => !value || /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(value),
  };

  // ==================== VALIDACIÓN ====================

  validateField(fieldName) {
    const rule = this.rules.get(fieldName);
    if (!rule) return true;

    const field = this.form.elements[fieldName];
    if (!field) return true;

    const value = field.value;
    const formData = new FormData(this.form);

    for (const ruleConfig of rule.rules) {
      let validator, params;

      // Parse rule (e.g., "minLength:5" or just "required")
      if (typeof ruleConfig === 'string') {
        const [ruleName, ...ruleParams] = ruleConfig.split(':');
        params = ruleParams.map((p) => {
          // Try to parse as number
          const num = parseFloat(p);
          return isNaN(num) ? p : num;
        });

        // Get validator function
        if (FormValidator.validators[ruleName]) {
          const validatorFn = FormValidator.validators[ruleName];
          validator = params.length > 0 ? validatorFn(...params) : validatorFn;
        } else if (this.customValidators.has(ruleName)) {
          validator = this.customValidators.get(ruleName);
        }
      } else if (typeof ruleConfig === 'function') {
        validator = ruleConfig;
      }

      if (!validator) continue;

      // Validate
      const isValid = validator(value, formData);

      if (!isValid) {
        const errorMessage = rule.message || this.getDefaultErrorMessage(ruleConfig, fieldName);
        this.setFieldError(fieldName, errorMessage);
        return false;
      }
    }

    this.clearFieldError(fieldName);
    return true;
  }

  validateAll() {
    this.errors.clear();
    let isValid = true;

    for (const [fieldName] of this.rules) {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    }

    return isValid;
  }

  // ==================== ERROR HANDLING ====================

  setFieldError(fieldName, message) {
    this.errors.set(fieldName, message);

    const field = this.form.elements[fieldName];
    if (!field) return;

    // Add error class to field
    field.classList.add(this.config.fieldErrorClass);
    field.setAttribute('aria-invalid', 'true');

    // Find or create error container
    let errorContainer = field.parentElement.querySelector(`.${this.config.errorClass}`);

    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = this.config.errorClass;
      errorContainer.setAttribute('role', 'alert');
      field.parentElement.appendChild(errorContainer);
    }

    errorContainer.textContent = message;
  }

  clearFieldError(fieldName) {
    this.errors.delete(fieldName);

    const field = this.form.elements[fieldName];
    if (!field) return;

    field.classList.remove(this.config.fieldErrorClass);
    field.removeAttribute('aria-invalid');

    const errorContainer = field.parentElement.querySelector(`.${this.config.errorClass}`);
    if (errorContainer) {
      errorContainer.remove();
    }
  }

  clearAllErrors() {
    for (const [fieldName] of this.errors) {
      this.clearFieldError(fieldName);
    }
    this.errors.clear();
  }

  getDefaultErrorMessage(rule, fieldName) {
    const messages = {
      required: 'Este campo es obligatorio',
      email: 'Ingresa un email válido',
      phone: 'Ingresa un teléfono válido',
      rut: 'Ingresa un RUT válido',
      url: 'Ingresa una URL válida',
      numeric: 'Solo se permiten números',
      alpha: 'Solo se permiten letras',
      alphanumeric: 'Solo se permiten letras y números',
    };

    const ruleName = typeof rule === 'string' ? rule.split(':')[0] : 'invalid';
    return messages[ruleName] || `El campo ${fieldName} no es válido`;
  }

  // ==================== SUBMIT ====================

  handleSubmit() {
    const isValid = this.validateAll();

    if (!isValid) {
      if (this.config.scrollToError) {
        const firstError = this.form.querySelector(`.${this.config.fieldErrorClass}`);
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });

          if (this.config.focusFirstError) {
            firstError.focus();
          }
        }
      }
      return;
    }

    // Get form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    // Call submit callback
    if (this.config.submitCallback) {
      this.config.submitCallback(data, formData);
    }
  }

  onSubmit(callback) {
    this.config.submitCallback = callback;
    return this;
  }

  // ==================== UTILITIES ====================

  getFormData() {
    return new FormData(this.form);
  }

  getFormObject() {
    return Object.fromEntries(this.getFormData().entries());
  }

  reset() {
    this.form.reset();
    this.clearAllErrors();
  }

  setFieldValue(fieldName, value) {
    const field = this.form.elements[fieldName];
    if (field) {
      field.value = value;
    }
  }
}

// Export para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidator;
}

// Global para uso directo en HTML
if (typeof window !== 'undefined') {
  window.FormValidator = FormValidator;
}
