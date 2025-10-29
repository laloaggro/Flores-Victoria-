// Script para crear índices en MongoDB
// Ejecutar con: docker exec -i flores-victoria-mongodb mongo < create-indexes.js

// Products DB
print('🔍 Creando índices en products_db...');
db = db.getSiblingDB('products_db');

db.products.createIndex({ name: 'text', description: 'text' }, { name: 'idx_product_search' });
db.products.createIndex({ category: 1, price: 1 }, { name: 'idx_category_price' });
db.products.createIndex({ createdAt: -1 }, { name: 'idx_created_desc' });
db.products.createIndex({ active: 1, createdAt: -1 }, { name: 'idx_active_created' });
db.products.createIndex({ stock: 1 }, { name: 'idx_stock' });
print('✅ Índices en products creados');

// Users DB
print('👤 Creando índices en user_db...');
db = db.getSiblingDB('user_db');

db.users.createIndex({ email: 1 }, { unique: true, name: 'idx_email_unique' });
db.users.createIndex({ createdAt: -1 }, { name: 'idx_user_created' });
db.users.createIndex({ active: 1 }, { name: 'idx_user_active' });
print('✅ Índices en users creados');

// Orders DB
print('🛒 Creando índices en order_db...');
db = db.getSiblingDB('order_db');

db.orders.createIndex({ userId: 1, status: 1 }, { name: 'idx_user_status' });
db.orders.createIndex({ createdAt: -1 }, { name: 'idx_order_created' });
db.orders.createIndex({ status: 1, createdAt: -1 }, { name: 'idx_status_created' });
db.orders.createIndex({ total: 1 }, { name: 'idx_order_total' });
print('✅ Índices en orders creados');

// Carts DB
print('🛍️ Creando índices en cart_db...');
db = db.getSiblingDB('cart_db');

db.carts.createIndex({ userId: 1 }, { name: 'idx_cart_user' });
db.carts.createIndex({ active: 1, updatedAt: -1 }, { name: 'idx_cart_active' });
print('✅ Índices en carts creados');

// Reviews DB
print('⭐ Creando índices en review_db...');
db = db.getSiblingDB('review_db');

db.reviews.createIndex({ productId: 1, createdAt: -1 }, { name: 'idx_product_reviews' });
db.reviews.createIndex({ userId: 1 }, { name: 'idx_user_reviews' });
db.reviews.createIndex({ rating: 1 }, { name: 'idx_review_rating' });
print('✅ Índices en reviews creados');

// Wishlist DB
print('❤️  Creando índices en wishlist_db...');
db = db.getSiblingDB('wishlist_db');

db.wishlists.createIndex({ userId: 1, productId: 1 }, { name: 'idx_user_product' });
db.wishlists.createIndex({ userId: 1, createdAt: -1 }, { name: 'idx_wishlist_user' });
print('✅ Índices en wishlists creados');

// Contact DB
print('📧 Creando índices en contact_db...');
db = db.getSiblingDB('contact_db');

db.messages.createIndex({ email: 1 }, { name: 'idx_message_email' });
db.messages.createIndex({ createdAt: -1 }, { name: 'idx_message_created' });
db.messages.createIndex({ status: 1, createdAt: -1 }, { name: 'idx_message_status' });
print('✅ Índices en messages creados');

print('');
print('✅ Todos los índices fueron creados exitosamente!');
