-- ============================================
-- ÍNDICES OPTIMIZADOS PARA POSTGRESQL
-- Flores Victoria - Performance Optimization
-- ============================================

-- ============================================
-- USERS TABLE INDEXES
-- ============================================

-- Índice único en email para búsquedas rápidas de login
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email 
ON users (email);

-- Índice en role para filtrar usuarios por rol (admin/customer)
CREATE INDEX IF NOT EXISTS idx_users_role 
ON users (role);

-- Índice en created_at para ordenar usuarios por fecha de registro
CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON users (created_at DESC);

-- Índice compuesto para búsquedas frecuentes de usuarios activos por rol
CREATE INDEX IF NOT EXISTS idx_users_role_created 
ON users (role, created_at DESC);

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================

-- Índice en user_id para buscar pedidos de un usuario específico (query más común)
CREATE INDEX IF NOT EXISTS idx_orders_user_id 
ON orders (user_id);

-- Índice en status para filtrar pedidos por estado (pending, processing, delivered)
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders (status);

-- Índice en created_at para ordenar pedidos por fecha
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders (created_at DESC);

-- Índice compuesto para la consulta más frecuente: pedidos de un usuario ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_orders_user_created 
ON orders (user_id, created_at DESC);

-- Índice compuesto para buscar pedidos por usuario y estado
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
ON orders (user_id, status, created_at DESC);

-- Índice compuesto para reportes: pedidos por estado y fecha
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
ON orders (status, created_at DESC);

-- Índice en payment_method para analytics y reportes
CREATE INDEX IF NOT EXISTS idx_orders_payment_method 
ON orders (payment_method);

-- ============================================
-- AUTH_USERS TABLE INDEXES (Auth Service)
-- ============================================

-- Índice único en email para login rápido
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_email 
ON auth_users (email);

-- Índice en role para control de acceso
CREATE INDEX IF NOT EXISTS idx_auth_users_role 
ON auth_users (role);

-- Índice en created_at para auditoría
CREATE INDEX IF NOT EXISTS idx_auth_users_created_at 
ON auth_users (created_at DESC);

-- ============================================
-- CONTACTS TABLE INDEXES (Contact Service)
-- ============================================

-- Índice en email para búsquedas de contactos
CREATE INDEX IF NOT EXISTS idx_contacts_email 
ON contacts (email);

-- Índice en status para filtrar por estado (new, replied, resolved)
CREATE INDEX IF NOT EXISTS idx_contacts_status 
ON contacts (status);

-- Índice en created_at para ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_contacts_created_at 
ON contacts (created_at DESC);

-- Índice compuesto para dashboard: contactos por estado ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_contacts_status_created 
ON contacts (status, created_at DESC);

-- ============================================
-- REVIEWS TABLE INDEXES (Review Service)
-- ============================================

-- Índice en product_id para obtener todas las reseñas de un producto
CREATE INDEX IF NOT EXISTS idx_reviews_product_id 
ON reviews (product_id);

-- Índice en user_id para obtener todas las reseñas de un usuario
CREATE INDEX IF NOT EXISTS idx_reviews_user_id 
ON reviews (user_id);

-- Índice en rating para filtrar por calificación
CREATE INDEX IF NOT EXISTS idx_reviews_rating 
ON reviews (rating);

-- Índice en created_at para ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
ON reviews (created_at DESC);

-- Índice compuesto para la consulta más común: reseñas de un producto ordenadas por fecha
CREATE INDEX IF NOT EXISTS idx_reviews_product_created 
ON reviews (product_id, created_at DESC);

-- Índice compuesto para filtrar reseñas por producto y rating
CREATE INDEX IF NOT EXISTS idx_reviews_product_rating 
ON reviews (product_id, rating DESC);

-- ============================================
-- PERFORMANCE NOTES
-- ============================================
/*
ÍNDICES CREADOS:
- 24 índices optimizados para las consultas más frecuentes
- Índices simples para filtros individuales
- Índices compuestos para consultas combinadas
- Índices únicos para constraints de integridad

IMPACTO ESPERADO:
- Búsquedas de usuarios por email: ~10-100x más rápido
- Consulta de pedidos por usuario: ~10-50x más rápido
- Filtrado de pedidos por estado: ~5-20x más rápido
- Reseñas de productos: ~10-100x más rápido

MANTENIMIENTO:
- Los índices se actualizan automáticamente en INSERT/UPDATE/DELETE
- Overhead de escritura: ~5-15% (aceptable para mejor lectura)
- VACUUM y ANALYZE deben ejecutarse periódicamente

MONITOREO:
- Ver uso de índices: SELECT * FROM pg_stat_user_indexes;
- Ver índices no usados: SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
*/
