#!/bin/bash
# Script para crear índices optimizados en MongoDB
# Mejora el rendimiento de queries frecuentes

set -e

echo "📊 Creando índices en MongoDB..."

# Configuración de MongoDB
MONGO_HOST="localhost"
MONGO_PORT="27018"
MONGO_USER="admin"
MONGO_PASS="d3ZpzFH/pJKWw3z9dYXcTyT8I40bMvuc"

# Función para ejecutar comando en MongoDB
mongo_exec() {
    local db=$1
    local cmd=$2
    docker exec -i flores-victoria-mongodb mongo \
        --host localhost \
        --port 27017 \
        --username "$MONGO_USER" \
        --password "$MONGO_PASS" \
        --authenticationDatabase admin \
        "$db" \
        --eval "$cmd"
}

echo "🔍 Creando índices en products_db..."
mongo_exec "products_db" '
// Índice de texto para búsqueda
db.products.createIndex({ "name": "text", "description": "text" }, { name: "idx_product_search" });

// Índice compuesto para filtrado por categoría y precio
db.products.createIndex({ "category": 1, "price": 1 }, { name: "idx_category_price" });

// Índice para ordenar por fecha de creación
db.products.createIndex({ "createdAt": -1 }, { name: "idx_created_desc" });

// Índice para productos activos
db.products.createIndex({ "active": 1, "createdAt": -1 }, { name: "idx_active_created" });

// Índice para stock
db.products.createIndex({ "stock": 1 }, { name: "idx_stock" });

print("✅ Índices en products creados");
'

echo "👤 Creando índices en user_db..."
mongo_exec "user_db" '
// Índice único para email
db.users.createIndex({ "email": 1 }, { unique: true, name: "idx_email_unique" });

// Índice para fechas de creación
db.users.createIndex({ "createdAt": -1 }, { name: "idx_user_created" });

// Índice para usuarios activos
db.users.createIndex({ "active": 1 }, { name: "idx_user_active" });

print("✅ Índices en users creados");
'

echo "🛒 Creando índices en order_db..."
mongo_exec "order_db" '
// Índice compuesto para órdenes por usuario y estado
db.orders.createIndex({ "userId": 1, "status": 1 }, { name: "idx_user_status" });

// Índice para órdenes por fecha
db.orders.createIndex({ "createdAt": -1 }, { name: "idx_order_created" });

// Índice para órdenes por estado y fecha
db.orders.createIndex({ "status": 1, "createdAt": -1 }, { name: "idx_status_created" });

// Índice para total de órdenes
db.orders.createIndex({ "total": 1 }, { name: "idx_order_total" });

print("✅ Índices en orders creados");
'

echo "🛍️ Creando índices en cart_db..."
mongo_exec "cart_db" '
// Índice para carritos por usuario
db.carts.createIndex({ "userId": 1 }, { name: "idx_cart_user" });

// Índice para carritos activos
db.carts.createIndex({ "active": 1, "updatedAt": -1 }, { name: "idx_cart_active" });

print("✅ Índices en carts creados");
'

echo "⭐ Creando índices en review_db..."
mongo_exec "review_db" '
// Índice para reviews por producto
db.reviews.createIndex({ "productId": 1, "createdAt": -1 }, { name: "idx_product_reviews" });

// Índice para reviews por usuario
db.reviews.createIndex({ "userId": 1 }, { name: "idx_user_reviews" });

// Índice para rating
db.reviews.createIndex({ "rating": 1 }, { name: "idx_review_rating" });

print("✅ Índices en reviews creados");
'

echo "❤️  Creando índices en wishlist_db..."
mongo_exec "wishlist_db" '
// Índice compuesto para wishlist por usuario y producto
db.wishlists.createIndex({ "userId": 1, "productId": 1 }, { name: "idx_user_product" });

// Índice para wishlist por usuario
db.wishlists.createIndex({ "userId": 1, "createdAt": -1 }, { name: "idx_wishlist_user" });

print("✅ Índices en wishlists creados");
'

echo "📧 Creando índices en contact_db..."
mongo_exec "contact_db" '
// Índice para mensajes por email
db.messages.createIndex({ "email": 1 }, { name: "idx_message_email" });

// Índice para mensajes por fecha
db.messages.createIndex({ "createdAt": -1 }, { name: "idx_message_created" });

// Índice para mensajes por estado
db.messages.createIndex({ "status": 1, "createdAt": -1 }, { name: "idx_message_status" });

print("✅ Índices en messages creados");
'

echo ""
echo "✅ Todos los índices fueron creados exitosamente!"
echo ""
echo "📊 Verificar índices creados:"
echo "   docker exec -i flores-victoria-mongodb mongosh --quiet products_db --eval 'db.products.getIndexes()'"
echo ""
echo "🎯 Impacto esperado:"
echo "   - Búsquedas de texto: 5-10x más rápidas"
echo "   - Filtros por categoría: 3-5x más rápidas"
echo "   - Queries de usuario: 10-20x más rápidas"
echo "   - Ordenamiento: 2-3x más rápido"
