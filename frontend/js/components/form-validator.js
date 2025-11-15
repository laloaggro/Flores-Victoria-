/**
 * ============================================================================
 * Form Validator Component - Sistema Unificado de Validación
 * ============================================================================
 *
 * ⚠️ IMPORTANTE: Requiere CSS externo
 * Este componente requiere: /css/components/form-validator.css
 *
 * En tu HTML, incluye ANTES de este script:
 * <link rel="stylesheet" href="/css/components/form-validator.css">
 * <script src="/js/components/form-validator.js"></script>
 *
 * Sistema robusto de validación de formularios con validadores built-in,
 * validadores personalizados, y manejo avanzado de errores.
 *
 * @module FormValidatorComponent
 * @version 2.0.0
 *
 * Uso básico:
 * const formEl = document.querySelector('#contact-form');
 * const validator = FormValidatorComponent.createValidator(formEl);
 * validator.addRule('email', ['required', 'email']);
 *
 * Validadores disponibles:
 * required, email, phone, rut, minLength:n, maxLength:n,
 * min:n, max:n, pattern:/regex/, url, match:fieldName,
 * numeric, alpha, alphanumeric, date, time, datetime,
 * creditCard, postalCode, color, file
 *
 * Características:
 * - 19 validadores built-in
 * - Validadores personalizados
 * - Validación en tiempo real (blur/input)
 * - Manejo de errores con ARIA
 * - Scroll automático a errores
 * - Mensajes personalizables
 * - Soporte multi-formularios
 */

const FormValidatorComponent = {
 // ========================================
 // Configuración por defecto
 // ========================================

 defaultConfig: {
 showErrorsOnBlur: true,
 showErrorsOnInput: false,
 scrollToError: true,
 focusFirstError: true,
 submitCallback: null,
 errorClass: 'form-error',
 fieldErrorClass: 'field-error',
 successClass: 'field-success',
 animateErrors: true,
 debounceInput: 300, // ms
 },

 // ========================================
 // Estado de instancias
 // ========================================

 validators: new Map(),

 // ========================================
 // Factory Method - Crear validador
 // ========================================

 /**
 * Crea una nueva instancia de validador para un formulario
 * @param {HTMLFormElement} formElement - Elemento del formulario
 * @param {Object} [options={}] - Opciones de configuración
 * @returns {Object} Instancia del validador
 */
 createValidator(formElement, options = {}) {
 if (!formElement || !(formElement instanceof HTMLFormElement)) {
 console.error('FormValidator: Invalid form element');
 return null;
 }

 const formId = formElement.id || `form-${Date.now()}`;

 const validator = {
 form: formElement,
 formId,
 rules: new Map(),
 customValidators: new Map(),
 errors: new Map(),
 config: { ...this.defaultConfig, ...options },
 debounceTimers: new Map(),

 /**
 * Inicializa el validador
 */
 init() {
 this.attachEventListeners();
 this.injectStyles();
 return this;
 },

 /**
 * Adjunta event listeners al formulario
 */
 attachEventListeners() {
 // Submit
 this.form.addEventListener('submit', (e) => {
 e.preventDefault();
 this.handleSubmit();
 });

 // Blur validation
 if (this.config.showErrorsOnBlur) {
 this.form.querySelectorAll('input, textarea, select').forEach((field) => {
 field.addEventListener('blur', () => {
 if (field.name) this.validateField(field.name);
 });
 });
 }

 // Input validation con debounce
 if (this.config.showErrorsOnInput) {
 this.form.querySelectorAll('input, textarea, select').forEach((field) => {
 field.addEventListener('input', () => {
 if (!field.name) return;

 // Clear previous timer
 if (this.debounceTimers.has(field.name)) {
 clearTimeout(this.debounceTimers.get(field.name));
 }

 // Set new timer
 const timer = setTimeout(() => {
 this.validateField(field.name);
 this.debounceTimers.delete(field.name);
 }, this.config.debounceInput);

 this.debounceTimers.set(field.name, timer);
 });
 });
 }
 },

 /**
 * Añade regla de validación a un campo
 * @param {string} fieldName - Nombre del campo
 * @param {string|string[]|Function} rules - Reglas a aplicar
 * @param {string} [customMessage] - Mensaje de error personalizado
 * @returns {Object} this para encadenar
 */
 addRule(fieldName, rules, customMessage = null) {
 this.rules.set(fieldName, {
 rules: Array.isArray(rules) ? rules : [rules],
 message: customMessage,
 });
 return this;
 },

 /**
 * Añade validador personalizado
 * @param {string} name - Nombre del validador
 * @param {Function} validatorFn - Función validadora
 * @returns {Object} this para encadenar
 */
 addCustomValidator(name, validatorFn) {
 if (typeof validatorFn !== 'function') {
 console.error('Custom validator must be a function');
 return this;
 }
 this.customValidators.set(name, validatorFn);
 return this;
 },

 /**
 * Valida un campo específico
 * @param {string} fieldName - Nombre del campo
 * @returns {boolean} true si es válido
 */
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
 const num = parseFloat(p);
 return isNaN(num) ? p : num;
 });

 // Get validator function
 if (FormValidatorComponent.builtInValidators[ruleName]) {
 const validatorFn = FormValidatorComponent.builtInValidators[ruleName];
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
 },

 /**
 * Valida todos los campos
 * @returns {boolean} true si todo es válido
 */
 validateAll() {
 this.errors.clear();
 let isValid = true;

 for (const [fieldName] of this.rules) {
 if (!this.validateField(fieldName)) {
 isValid = false;
 }
 }

 return isValid;
 },

 /**
 * Establece error en un campo
 * @param {string} fieldName - Nombre del campo
 * @param {string} message - Mensaje de error
 */
 setFieldError(fieldName, message) {
 this.errors.set(fieldName, message);

 const field = this.form.elements[fieldName];
 if (!field) return;

 // Add error class
 field.classList.remove(this.config.successClass);
 field.classList.add(this.config.fieldErrorClass);
 field.setAttribute('aria-invalid', 'true');

 // Find or create error container
 let errorContainer = field.parentElement.querySelector(`.${this.config.errorClass}`);

 if (!errorContainer) {
 errorContainer = document.createElement('div');
 errorContainer.className = this.config.errorClass;
 errorContainer.setAttribute('role', 'alert');
 errorContainer.setAttribute('aria-live', 'polite');
 field.parentElement.appendChild(errorContainer);
 }

 errorContainer.textContent = message;

 if (this.config.animateErrors) {
 errorContainer.style.animation = 'slideDown 0.3s ease';
 }
 },

 /**
 * Limpia el error de un campo
 * @param {string} fieldName - Nombre del campo
 */
 clearFieldError(fieldName) {
 this.errors.delete(fieldName);

 const field = this.form.elements[fieldName];
 if (!field) return;

 field.classList.remove(this.config.fieldErrorClass);
 field.classList.add(this.config.successClass);
 field.removeAttribute('aria-invalid');

 const errorContainer = field.parentElement.querySelector(`.${this.config.errorClass}`);
 if (errorContainer) {
 errorContainer.remove();
 }
 },

 /**
 * Limpia todos los errores
 */
 clearAllErrors() {
 for (const [fieldName] of this.errors) {
 this.clearFieldError(fieldName);
 }
 this.errors.clear();
 },

 /**
 * Obtiene mensaje de error por defecto
 * @param {string|Function} rule - Regla que falló
 * @param {string} fieldName - Nombre del campo
 * @returns {string} Mensaje de error
 */
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
 date: 'Ingresa una fecha válida',
 time: 'Ingresa una hora válida',
 datetime: 'Ingresa fecha y hora válidas',
 creditCard: 'Número de tarjeta inválido',
 postalCode: 'Código postal inválido',
 color: 'Color inválido',
 file: 'Archivo inválido',
 };

 const ruleName = typeof rule === 'string' ? rule.split(':')[0] : 'invalid';
 return messages[ruleName] || `El campo ${fieldName} no es válido`;
 },

 /**
 * Maneja el submit del formulario
 */
 handleSubmit() {
 const isValid = this.validateAll();

 if (!isValid) {
 if (this.config.scrollToError) {
 const firstError = this.form.querySelector(`.${this.config.fieldErrorClass}`);
 if (firstError) {
 firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });

 if (this.config.focusFirstError) {
 setTimeout(() => firstError.focus(), 300);
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
 },

 /**
 * Establece callback de submit
 * @param {Function} callback - Función a ejecutar
 * @returns {Object} this para encadenar
 */
 onSubmit(callback) {
 if (typeof callback !== 'function') {
 console.error('onSubmit requires a function');
 return this;
 }
 this.config.submitCallback = callback;
 return this;
 },

 /**
 * Obtiene FormData del formulario
 * @returns {FormData} Datos del formulario
 */
 getFormData() {
 return new FormData(this.form);
 },

 /**
 * Obtiene objeto plano de los datos
 * @returns {Object} Datos como objeto
 */
 getFormObject() {
 return Object.fromEntries(this.getFormData().entries());
 },

 /**
 * Resetea el formulario
 */
 reset() {
 this.form.reset();
 this.clearAllErrors();
 // Remove success classes
 this.form.querySelectorAll(`.${this.config.successClass}`).forEach((el) => {
 el.classList.remove(this.config.successClass);
 });
 },

 /**
 * Establece valor de un campo
 * @param {string} fieldName - Nombre del campo
 * @param {*} value - Valor a establecer
 */
 setFieldValue(fieldName, value) {
 const field = this.form.elements[fieldName];
 if (field) {
 field.value = value;
 // Trigger validation if enabled
 if (this.config.showErrorsOnInput) {
 this.validateField(fieldName);
 }
 }
 },

 /**
 * Inyecta estilos CSS
 */
 injectStyles() {
 // Verificar que form-validator.css esté cargado
 const cssLoaded = Array.from(document.styleSheets).some((sheet) => {
 try {
 return sheet.href && sheet.href.includes('form-validator.css');
 } catch (e) {
 return false;
 }
 });

 if (!cssLoaded) {
 console.warn(
 '[FormValidator] CSS file not detected. Make sure to include /css/components/form-validator.css in your HTML.'
 );
 }
 },

 /**
 * Destruye el validador
 */
 destroy() {
 // Clear timers
 this.debounceTimers.forEach((timer) => clearTimeout(timer));
 this.debounceTimers.clear();

 // Clear errors
 this.clearAllErrors();

 // Remove event listeners (form will be recreated if needed)
 this.form.removeEventListener('submit', this.handleSubmit);

 },
 };

 // Store instance
 this.validators.set(formId, validator);

 // Initialize and return
 return validator.init();
 },

 // ========================================
 // Validadores Built-in
 // ========================================

 builtInValidators: {
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
 if (!value) return true;
 try {
 new URL(value);
 return true;
 } catch {
 return false;
 }
 },

 match: (otherFieldName) => (value, formData) => value === formData.get(otherFieldName),

 numeric: (value) => !value || /^\d+$/.test(value),

 alpha: (value) => !value || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value),

 alphanumeric: (value) => !value || /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(value),

 date: (value) => {
 if (!value) return true;
 const date = new Date(value);
 return date instanceof Date && !isNaN(date);
 },

 time: (value) => {
 if (!value) return true;
 return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
 },

 datetime: (value) => {
 if (!value) return true;
 const date = new Date(value);
 return date instanceof Date && !isNaN(date);
 },

 creditCard: (value) => {
 if (!value) return true;
 // Luhn algorithm
 const cleaned = value.replace(/\s/g, '');
 if (!/^\d{13,19}$/.test(cleaned)) return false;

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

 return sum % 10 === 0;
 },

 postalCode: (value) => {
 if (!value) return true;
 // Chilean postal code format
 return /^\d{7}$/.test(value);
 },

 color: (value) => {
 if (!value) return true;
 return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
 },

 file:
 (extensions = []) =>
 (value, formData, field) => {
 if (!value || !field || !field.files || field.files.length === 0) return true;

 const file = field.files[0];
 const ext = file.name.split('.').pop().toLowerCase();

 if (extensions.length > 0 && !extensions.includes(ext)) {
 return false;
 }

 return true;
 },
 },

 // ========================================
 // Métodos de utilidad
 // ========================================

 /**
 * Obtiene un validador por ID de formulario
 * @param {string} formId - ID del formulario
 * @returns {Object|null} Instancia del validador
 */
 getValidator(formId) {
 return this.validators.get(formId) || null;
 },

 /**
 * Destruye un validador específico
 * @param {string} formId - ID del formulario
 */
 destroyValidator(formId) {
 const validator = this.validators.get(formId);
 if (validator) {
 validator.destroy();
 this.validators.delete(formId);
 }
 },

 /**
 * Destruye todos los validadores
 */
 destroyAll() {
 this.validators.forEach((validator) => validator.destroy());
 this.validators.clear();
 },
};

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
 module.exports = FormValidatorComponent;
}
