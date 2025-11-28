-- Schema para order-service en PostgreSQL

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices optimizados
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders (payment_method);

-- Comentarios
COMMENT ON TABLE orders IS 'Pedidos de clientes';
COMMENT ON COLUMN orders.user_id IS 'ID del usuario que realizó el pedido';
COMMENT ON COLUMN orders.items IS 'Items del pedido en formato JSON';
COMMENT ON COLUMN orders.total IS 'Total del pedido';
COMMENT ON COLUMN orders.status IS 'Estado: pending, processing, shipped, delivered, cancelled';
