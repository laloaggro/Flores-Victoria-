/**
 * Schemas de validación para Auth Service
 */

const { Joi, commonSchemas } = require('../../../shared/middleware/validation');

// Schema para registro de usuario
const registerSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  name: Joi.string().trim().min(2).max(100).required(),
  phone: commonSchemas.phone.optional(),
  acceptTerms: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must accept the terms and conditions',
  }),
});

// Schema para login
const loginSchema = Joi.object({
  email: commonSchemas.email,
  password: Joi.string().trim().required(), // No validar patrón en login
  rememberMe: Joi.boolean().optional(),
});

// Schema para login con Google
const googleAuthSchema = Joi.object({
  token: Joi.string().trim().required(),
  clientId: Joi.string().trim().optional(),
});

// Schema para refresh token
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().trim().required(),
});

// Schema para cambio de contraseña
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().trim().required(),
  newPassword: commonSchemas.password,
  confirmPassword: Joi.string().trim().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

// Schema para reset de contraseña (solicitud)
const requestPasswordResetSchema = Joi.object({
  email: commonSchemas.email,
});

// Schema para reset de contraseña (confirmación)
const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required(),
  newPassword: commonSchemas.password,
  confirmPassword: Joi.string().trim().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

// Schema para verificación de email
const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required(),
});

// Schema para actualización de perfil
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  phone: commonSchemas.phone.optional(),
  avatar: commonSchemas.url.optional(),
  preferences: Joi.object({
    newsletter: Joi.boolean().optional(),
    notifications: Joi.boolean().optional(),
    language: Joi.string().valid('es', 'en').optional(),
  }).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  refreshTokenSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updateProfileSchema,
};
