/**
 * @fileoverview Data Transfer Objects (DTOs)
 * @description DTOs para separar representación de datos de modelos internos
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Clase base para DTOs con métodos comunes
 */
class BaseDTO {
  /**
   * Convierte el DTO a objeto plano
   * @returns {Object}
   */
  toJSON() {
    return { ...this };
  }

  /**
   * Valida que los campos requeridos estén presentes
   * @param {Array<string>} requiredFields - Campos requeridos
   * @throws {Error} Si falta algún campo
   */
  validate(requiredFields = []) {
    for (const field of requiredFields) {
      if (this[field] === undefined || this[field] === null) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
  }
}

// ================================================
// PRODUCT DTOs
// ================================================

/**
 * DTO para producto en lista (campos mínimos)
 */
class ProductListDTO extends BaseDTO {
  constructor(product) {
    super();
    this.id = product._id?.toString() || product.id;
    this.name = product.name;
    this.slug = product.slug;
    this.price = product.price;
    this.originalPrice = product.originalPrice;
    this.discount = product.discount || 0;
    this.image = product.images?.[0] || product.image;
    this.rating = product.averageRating || product.rating || 0;
    this.reviewCount = product.reviewCount || 0;
    this.stock = product.stock;
    this.isAvailable = product.stock > 0 && product.active !== false;
    this.category = product.category;
    this.occasion = product.occasion;
    this.isFeatured = product.featured || false;
  }

  static fromArray(products) {
    return products.map((p) => new ProductListDTO(p));
  }
}

/**
 * DTO para producto detallado
 */
class ProductDetailDTO extends BaseDTO {
  constructor(product) {
    super();
    this.id = product._id?.toString() || product.id;
    this.name = product.name;
    this.slug = product.slug;
    this.description = product.description;
    this.price = product.price;
    this.originalPrice = product.originalPrice;
    this.discount = product.discount || 0;
    this.images = product.images || [product.image].filter(Boolean);
    this.rating = product.averageRating || product.rating || 0;
    this.reviewCount = product.reviewCount || 0;
    this.stock = product.stock;
    this.isAvailable = product.stock > 0 && product.active !== false;
    this.category = product.category;
    this.occasion = product.occasion;
    this.isFeatured = product.featured || false;
    this.specifications = product.specifications || {};
    this.careInstructions = product.careInstructions;
    this.sku = product.sku;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

/**
 * DTO para crear producto
 */
class CreateProductDTO extends BaseDTO {
  constructor(data) {
    super();
    this.name = data.name;
    this.description = data.description;
    this.price = parseFloat(data.price);
    this.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
    this.stock = parseInt(data.stock, 10);
    this.category = data.category;
    this.occasion = data.occasion;
    this.images = data.images || [];
    this.featured = Boolean(data.featured);
    this.specifications = data.specifications || {};
    this.careInstructions = data.careInstructions;
    this.sku = data.sku;

    // Calcular discount si hay originalPrice
    if (this.originalPrice && this.originalPrice > this.price) {
      this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
  }

  validate() {
    super.validate(['name', 'description', 'price', 'stock', 'category']);

    if (this.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    if (this.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
  }
}

// ================================================
// USER DTOs
// ================================================

/**
 * DTO para usuario público (sin datos sensibles)
 */
class UserPublicDTO extends BaseDTO {
  constructor(user) {
    super();
    this.id = user.id || user._id?.toString();
    this.name = user.name;
    this.email = user.email;
    this.role = user.role || 'user';
    this.avatar = user.avatar;
    this.createdAt = user.createdAt || user.created_at;
  }
}

/**
 * DTO para perfil de usuario (datos propios)
 */
class UserProfileDTO extends BaseDTO {
  constructor(user) {
    super();
    this.id = user.id || user._id?.toString();
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role || 'user';
    this.avatar = user.avatar;
    this.addresses = user.addresses || [];
    this.preferences = user.preferences || {};
    this.emailVerified = user.emailVerified || user.email_verified || false;
    this.createdAt = user.createdAt || user.created_at;
    this.lastLogin = user.lastLogin || user.last_login;
  }
}

/**
 * DTO para registro de usuario
 */
class RegisterUserDTO extends BaseDTO {
  constructor(data) {
    super();
    this.name = data.name?.trim();
    this.email = data.email?.toLowerCase().trim();
    this.password = data.password;
    this.phone = data.phone?.trim();
  }

  validate() {
    super.validate(['name', 'email', 'password']);

    if (this.name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (!this._isValidEmail(this.email)) {
      throw new Error('Email inválido');
    }

    if (this.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
  }

  _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// ================================================
// ORDER DTOs
// ================================================

/**
 * DTO para orden en lista
 */
class OrderListDTO extends BaseDTO {
  constructor(order) {
    super();
    this.id = order._id?.toString() || order.id;
    this.orderNumber = order.orderNumber || order.order_number;
    this.status = order.status;
    this.total = order.total;
    this.currency = order.currency || 'CLP';
    this.itemCount = order.items?.length || order.item_count;
    this.createdAt = order.createdAt || order.created_at;
    this.updatedAt = order.updatedAt || order.updated_at;
  }

  static fromArray(orders) {
    return orders.map((o) => new OrderListDTO(o));
  }
}

/**
 * DTO para orden detallada
 */
class OrderDetailDTO extends BaseDTO {
  constructor(order) {
    super();
    this.id = order._id?.toString() || order.id;
    this.orderNumber = order.orderNumber || order.order_number;
    this.status = order.status;
    this.paymentStatus = order.paymentStatus || order.payment_status;
    this.items = order.items.map((item) => ({
      productId: item.productId || item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl || item.image_url,
      subtotal: item.price * item.quantity,
    }));
    this.subtotal = order.subtotal;
    this.taxes = order.taxes;
    this.shipping = order.shipping;
    this.discount = order.discount || 0;
    this.total = order.total;
    this.currency = order.currency || 'CLP';
    this.shippingAddress = order.shippingAddress || order.shipping_address;
    this.paymentMethod = order.paymentMethod || order.payment_method;
    this.statusHistory = order.statusHistory || order.status_history || [];
    this.trackingNumber = order.trackingNumber || order.tracking_number;
    this.estimatedDelivery = order.estimatedDelivery || order.estimated_delivery;
    this.notes = order.notes;
    this.createdAt = order.createdAt || order.created_at;
    this.updatedAt = order.updatedAt || order.updated_at;
  }
}

/**
 * DTO para crear orden
 */
class CreateOrderDTO extends BaseDTO {
  constructor(data) {
    super();
    this.userId = data.userId;
    this.items = data.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity, 10),
      imageUrl: item.imageUrl,
    }));
    this.shippingAddress = {
      street: data.shippingAddress.street,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      postalCode: data.shippingAddress.postalCode,
      country: data.shippingAddress.country || 'Chile',
      recipientName: data.shippingAddress.recipientName,
      phone: data.shippingAddress.phone,
      instructions: data.shippingAddress.instructions,
    };
    this.paymentMethod = data.paymentMethod;
    this.notes = data.notes;
    this.couponCode = data.couponCode;
  }

  validate() {
    super.validate(['userId', 'items', 'shippingAddress', 'paymentMethod']);

    if (this.items.length === 0) {
      throw new Error('La orden debe tener al menos un item');
    }

    for (const item of this.items) {
      if (!item.productId || !item.price || !item.quantity) {
        throw new Error('Items inválidos en la orden');
      }
    }

    const requiredAddressFields = ['street', 'city', 'postalCode', 'recipientName'];
    for (const field of requiredAddressFields) {
      if (!this.shippingAddress[field]) {
        throw new Error(`Campo de dirección requerido: ${field}`);
      }
    }
  }
}

// ================================================
// REVIEW DTOs
// ================================================

/**
 * DTO para review
 */
class ReviewDTO extends BaseDTO {
  constructor(review) {
    super();
    this.id = review._id?.toString() || review.id;
    this.productId = review.productId || review.product_id;
    this.userId = review.userId || review.user_id;
    this.userName = review.userName || review.user_name;
    this.rating = review.rating;
    this.title = review.title;
    this.comment = review.comment;
    this.verified = review.verified || false;
    this.helpful = review.helpful || 0;
    this.createdAt = review.createdAt || review.created_at;
  }

  static fromArray(reviews) {
    return reviews.map((r) => new ReviewDTO(r));
  }
}

/**
 * DTO para crear review
 */
class CreateReviewDTO extends BaseDTO {
  constructor(data) {
    super();
    this.productId = data.productId;
    this.rating = parseInt(data.rating, 10);
    this.title = data.title?.trim();
    this.comment = data.comment?.trim();
  }

  validate() {
    super.validate(['productId', 'rating', 'comment']);

    if (this.rating < 1 || this.rating > 5) {
      throw new Error('El rating debe estar entre 1 y 5');
    }

    if (this.comment.length < 10) {
      throw new Error('El comentario debe tener al menos 10 caracteres');
    }
  }
}

// ================================================
// CART DTOs
// ================================================

/**
 * DTO para item del carrito
 */
class CartItemDTO extends BaseDTO {
  constructor(item) {
    super();
    this.productId = item.productId || item.product_id;
    this.name = item.name;
    this.price = item.price;
    this.quantity = item.quantity;
    this.imageUrl = item.imageUrl || item.image_url;
    this.subtotal = item.price * item.quantity;
    this.stock = item.stock;
    this.isAvailable = item.stock >= item.quantity;
  }
}

/**
 * DTO para carrito completo
 */
class CartDTO extends BaseDTO {
  constructor(cart) {
    super();
    this.items = (cart.items || []).map((item) => new CartItemDTO(item));
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.updatedAt = cart.updatedAt || cart.updated_at;
  }
}

// ================================================
// API RESPONSE DTOs
// ================================================

/**
 * DTO para respuestas paginadas
 */
class PaginatedResponseDTO extends BaseDTO {
  constructor(data, pagination) {
    super();
    this.data = data;
    this.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    };
  }
}

/**
 * DTO para respuestas de error
 */
class ErrorResponseDTO extends BaseDTO {
  constructor(error, statusCode = 500) {
    super();
    this.error = true;
    this.statusCode = statusCode;
    this.message = error.message || 'Error interno del servidor';
    this.code = error.code || 'INTERNAL_ERROR';
    this.timestamp = new Date().toISOString();

    // Solo incluir detalles en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      this.details = error.details;
      this.stack = error.stack;
    }
  }
}

/**
 * DTO para respuestas exitosas
 */
class SuccessResponseDTO extends BaseDTO {
  constructor(data, message = 'Operación exitosa') {
    super();
    this.success = true;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = {
  // Base
  BaseDTO,

  // Products
  ProductListDTO,
  ProductDetailDTO,
  CreateProductDTO,

  // Users
  UserPublicDTO,
  UserProfileDTO,
  RegisterUserDTO,

  // Orders
  OrderListDTO,
  OrderDetailDTO,
  CreateOrderDTO,

  // Reviews
  ReviewDTO,
  CreateReviewDTO,

  // Cart
  CartItemDTO,
  CartDTO,

  // API Responses
  PaginatedResponseDTO,
  ErrorResponseDTO,
  SuccessResponseDTO,
};
