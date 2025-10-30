-- =====================================================
-- PostgreSQL Performance Optimizations
-- =====================================================

-- ÍNDICES PARA CONSULTAS FRECUENTES
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Addresses table indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = true;

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Order timeline table indexes
CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_created ON order_timeline(created_at DESC);

-- =====================================================
-- PARTITIONING (para orders con alto volumen)
-- =====================================================

-- Particionar orders por mes
-- Solo si hay > 1M de órdenes

-- 1. Crear tabla particionada
CREATE TABLE IF NOT EXISTS orders_partitioned (
  LIKE orders INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- 2. Crear particiones por mes
CREATE TABLE IF NOT EXISTS orders_2024_01 PARTITION OF orders_partitioned
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS orders_2024_02 PARTITION OF orders_partitioned
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE IF NOT EXISTS orders_2024_03 PARTITION OF orders_partitioned
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- =====================================================
-- VISTAS MATERIALIZADAS
-- =====================================================

-- Vista para estadísticas de ventas por día
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_sales AS
SELECT
  DATE(created_at) as sale_date,
  COUNT(*) as order_count,
  SUM(total) as total_revenue,
  AVG(total) as avg_order_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- Índice en la vista materializada
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(sale_date DESC);

-- Refrescar vista (ejecutar cada noche)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;

-- Vista para productos más vendidos
CREATE MATERIALIZED VIEW IF NOT EXISTS top_products AS
SELECT
  oi.product_id,
  oi.product_name,
  SUM(oi.quantity) as total_quantity_sold,
  COUNT(DISTINCT oi.order_id) as order_count,
  SUM(oi.subtotal) as total_revenue
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY oi.product_id, oi.product_name
ORDER BY total_revenue DESC
LIMIT 100;

-- =====================================================
-- OPTIMIZACIONES DE QUERIES
-- =====================================================

-- Query optimizada para listar órdenes con paginación
-- MAL:
-- SELECT * FROM orders WHERE user_id = '...' ORDER BY created_at DESC;

-- BIEN:
-- SELECT id, order_number, status, total, created_at
-- FROM orders
-- WHERE user_id = '...'
-- ORDER BY created_at DESC
-- LIMIT 20 OFFSET 0;

-- Query optimizada para búsqueda de usuarios
-- Usar ILIKE con índice
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin(name gin_trgm_ops);

-- =====================================================
-- VACUUM Y AUTOVACUUM
-- =====================================================

-- Configurar autovacuum más agresivo
ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE order_items SET (autovacuum_vacuum_scale_factor = 0.05);

-- Manual vacuum analyze (ejecutar semanalmente)
-- VACUUM ANALYZE orders;
-- VACUUM ANALYZE order_items;
-- VACUUM ANALYZE users;

-- =====================================================
-- CONNECTION POOLING
-- =====================================================

-- En la aplicación, usar pool de conexiones:
-- const pool = new Pool({
--   max: 20,              // Máximo de conexiones
--   min: 5,               // Mínimo de conexiones
--   idle: 10000,          -- Cerrar conexiones idle después de 10s
--   connectionTimeoutMillis: 5000,
--   idleTimeoutMillis: 30000,
-- });

-- =====================================================
-- EXPLAIN ANALYZE
-- =====================================================

-- Analizar queries lentas
-- EXPLAIN ANALYZE
-- SELECT * FROM orders WHERE user_id = '...' AND status = 'pending';

-- =====================================================
-- ARCHIVADO DE DATOS ANTIGUOS
-- =====================================================

-- Mover órdenes antiguas a tabla de archivo (> 2 años)
CREATE TABLE IF NOT EXISTS orders_archive (LIKE orders INCLUDING ALL);

-- Script de archivado (ejecutar mensualmente)
-- INSERT INTO orders_archive
-- SELECT * FROM orders
-- WHERE created_at < NOW() - INTERVAL '2 years';
--
-- DELETE FROM orders
-- WHERE created_at < NOW() - INTERVAL '2 years';

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- Ver queries lentas
-- SELECT query, mean_exec_time, calls
-- FROM pg_stat_statements
-- ORDER BY mean_exec_time DESC
-- LIMIT 10;

-- Ver tamaño de tablas
-- SELECT
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver índices no utilizados
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   pg_size_pretty(pg_relation_size(indexrelid))
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0 AND schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- =====================================================
-- BACKUP AUTOMÁTICO
-- =====================================================

-- Script de backup (ejecutar diariamente)
-- pg_dump -U admin -d flores_victoria -F c -b -v \
--   -f "/backups/flores_victoria_$(date +%Y%m%d).backup"

-- Retention: 7 días daily, 4 semanales, 12 mensuales
