const Joi = require('joi');

/**
 * Schemas de validación usando Joi para el proyecto Flores Victoria
 */

// Schema para registro de usuario
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'Email es requerido'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales',
      'any.required': 'Contraseña es requerida'
    }),
  
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'Nombre es requerido'
    }),
  
  phone: Joi.string()
    .pattern(/^\+?56\s?9\s?\d{4}\s?\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Número de teléfono chileno inválido (ej: +56 9 1234 5678)'
    })
});

// Schema para login
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'Email es requerido'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Contraseña es requerida'
    })
});

// Schema para creación de producto
const productSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.min': 'El nombre del producto debe tener al menos 3 caracteres',
      'any.required': 'Nombre del producto es requerido'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .trim()
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
  
  price: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'El precio debe ser un número positivo',
      'any.required': 'Precio es requerido'
    }),
  
  category: Joi.string()
    .valid('Ramos', 'Arreglos', 'Plantas', 'Ocasiones Especiales', 'Flores Individuales')
    .required()
    .messages({
      'any.only': 'Categoría inválida',
      'any.required': 'Categoría es requerida'
    }),
  
  stock: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'El stock no puede ser negativo'
    }),
  
  discount: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.min': 'El descuento no puede ser negativo',
      'number.max': 'El descuento no puede exceder 100%'
    }),
  
  images: Joi.array()
    .items(Joi.string().uri())
    .optional()
    .messages({
      'string.uri': 'URL de imagen inválida'
    }),
  
  featured: Joi.boolean()
    .default(false),
  
  tags: Joi.array()
    .items(Joi.string())
    .optional()
});

// Schema para actualización de producto
const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .trim(),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .trim(),
  
  price: Joi.number()
    .positive()
    .optional(),
  
  category: Joi.string()
    .valid('Ramos', 'Arreglos', 'Plantas', 'Ocasiones Especiales', 'Flores Individuales')
    .optional(),
  
  stock: Joi.number()
    .integer()
    .min(0)
    .optional(),
  
  discount: Joi.number()
    .min(0)
    .max(100)
    .optional(),
  
  images: Joi.array()
    .items(Joi.string().uri())
    .optional(),
  
  featured: Joi.boolean()
    .optional(),
  
  tags: Joi.array()
    .items(Joi.string())
    .optional()
}).min(1);

// Schema para creación de orden
const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .required()
          .messages({
            'any.required': 'ID de producto es requerido'
          }),
        
        quantity: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.positive': 'La cantidad debe ser mayor a 0',
            'any.required': 'Cantidad es requerida'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Debe incluir al menos un producto',
      'any.required': 'Items son requeridos'
    }),
  
  deliveryAddress: Joi.object({
    street: Joi.string()
      .required()
      .trim()
      .messages({
        'any.required': 'Calle es requerida'
      }),
    
    number: Joi.string()
      .optional()
      .trim(),
    
    apartment: Joi.string()
      .optional()
      .trim(),
    
    commune: Joi.string()
      .required()
      .trim()
      .messages({
        'any.required': 'Comuna es requerida'
      }),
    
    city: Joi.string()
      .required()
      .trim()
      .messages({
        'any.required': 'Ciudad es requerida'
      }),
    
    region: Joi.string()
      .required()
      .trim()
      .messages({
        'any.required': 'Región es requerida'
      }),
    
    postalCode: Joi.string()
      .pattern(/^\d{7}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Código postal debe tener 7 dígitos'
      }),
    
    instructions: Joi.string()
      .max(500)
      .optional()
      .trim()
  }).required(),
  
  paymentMethod: Joi.string()
    .valid('webpay', 'transfer', 'cash')
    .required()
    .messages({
      'any.only': 'Método de pago inválido',
      'any.required': 'Método de pago es requerido'
    }),
  
  deliveryDate: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.greater': 'La fecha de entrega debe ser futura',
      'any.required': 'Fecha de entrega es requerida'
    }),
  
  message: Joi.string()
    .max(300)
    .optional()
    .trim()
});

// Schema para contacto
const contactSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'any.required': 'Nombre es requerido'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'Email es requerido'
    }),
  
  phone: Joi.string()
    .pattern(/^\+?56\s?9\s?\d{4}\s?\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Número de teléfono chileno inválido'
    }),
  
  subject: Joi.string()
    .max(200)
    .optional()
    .trim(),
  
  message: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .trim()
    .messages({
      'string.min': 'El mensaje debe tener al menos 10 caracteres',
      'string.max': 'El mensaje no puede exceder 1000 caracteres',
      'any.required': 'Mensaje es requerido'
    })
});

// Middleware de validación genérico
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retornar todos los errores
      stripUnknown: true // Remover campos desconocidos
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Errores de validación',
        errors
      });
    }

    // Reemplazar req.body con los valores validados y sanitizados
    req.body = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  productSchema,
  updateProductSchema,
  orderSchema,
  contactSchema,
  validate
};
