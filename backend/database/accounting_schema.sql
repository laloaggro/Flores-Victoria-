-- =====================================================
-- SISTEMA CONTABLE COMPLETO - FLORES VICTORIA
-- Base de datos diseñada para floristería con contabilidad
-- =====================================================

-- ============================
-- 1. PLAN DE CUENTAS
-- ============================
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    account_type ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE') NOT NULL,
    parent_account_id INTEGER,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(id)
);

-- ============================
-- 2. CLIENTES Y PROVEEDORES
-- ============================
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    business_name VARCHAR(200),
    contact_name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    tax_id VARCHAR(20), -- RUT en Chile
    payment_terms INTEGER DEFAULT 30, -- días
    credit_limit DECIMAL(15,2) DEFAULT 0,
    customer_type ENUM('INDIVIDUAL', 'BUSINESS') DEFAULT 'INDIVIDUAL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_code VARCHAR(20) UNIQUE NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    tax_id VARCHAR(20), -- RUT en Chile
    payment_terms INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 3. INVENTARIO AVANZADO
-- ============================
CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_category_id) REFERENCES product_categories(id)
);

CREATE TABLE IF NOT EXISTS products_accounting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category_id INTEGER,
    unit_of_measure VARCHAR(20) DEFAULT 'UNIT',
    cost_method ENUM('FIFO', 'LIFO', 'AVERAGE') DEFAULT 'AVERAGE',
    standard_cost DECIMAL(10,4) DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 19.00, -- IVA 19% en Chile
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 1000,
    reorder_point INTEGER DEFAULT 10,
    is_service BOOLEAN DEFAULT FALSE,
    expiration_control BOOLEAN DEFAULT TRUE, -- Para flores
    shelf_life_days INTEGER DEFAULT 7, -- Vida útil flores
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

CREATE TABLE IF NOT EXISTS inventory_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_code VARCHAR(20) UNIQUE NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    location_type ENUM('WAREHOUSE', 'STORE', 'DISPLAY', 'COLD_ROOM') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    product_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    movement_type ENUM('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT') NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,4),
    total_cost DECIMAL(15,2),
    reference_type ENUM('PURCHASE', 'SALE', 'PRODUCTION', 'ADJUSTMENT', 'TRANSFER', 'INITIAL') NOT NULL,
    reference_id INTEGER,
    notes TEXT,
    user_id INTEGER,
    FOREIGN KEY (product_id) REFERENCES products_accounting(id),
    FOREIGN KEY (location_id) REFERENCES inventory_locations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================
-- 4. FACTURACIÓN Y VENTAS
-- ============================
CREATE TABLE IF NOT EXISTS document_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_code VARCHAR(10) UNIQUE NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    requires_tax_id BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    document_type_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_terms INTEGER DEFAULT 30,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    status ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'DRAFT',
    payment_status ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERPAID') DEFAULT 'PENDING',
    currency VARCHAR(3) DEFAULT 'CLP',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invoice_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    cost_price DECIMAL(10,4), -- Para cálculo de margen
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products_accounting(id)
);

-- ============================
-- 5. PAGOS Y COBRANZAS
-- ============================
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method_code VARCHAR(20) UNIQUE NOT NULL,
    method_name VARCHAR(50) NOT NULL,
    requires_reference BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_date DATE NOT NULL,
    customer_id INTEGER NOT NULL,
    payment_method_id INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CLP',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    reference_number VARCHAR(50),
    bank_account_id INTEGER,
    notes TEXT,
    status ENUM('PENDING', 'CONFIRMED', 'REJECTED') DEFAULT 'CONFIRMED',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payment_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    invoice_id INTEGER NOT NULL,
    allocated_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- ============================
-- 6. COMPRAS Y PROVEEDORES
-- ============================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    status ENUM('DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'CANCELLED') DEFAULT 'DRAFT',
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CLP',
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS purchase_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    purchase_order_id INTEGER,
    receipt_date DATE NOT NULL,
    invoice_number VARCHAR(50), -- Número de factura del proveedor
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status ENUM('DRAFT', 'POSTED', 'PAID') DEFAULT 'DRAFT',
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================
-- 7. CONTABILIDAD GENERAL
-- ============================
CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_number VARCHAR(20) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50), -- INVOICE, PAYMENT, ADJUSTMENT, etc.
    reference_id INTEGER,
    total_debit DECIMAL(15,2) NOT NULL,
    total_credit DECIMAL(15,2) NOT NULL,
    status ENUM('DRAFT', 'POSTED', 'REVERSED') DEFAULT 'DRAFT',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    posted_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_entry_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    description TEXT,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id)
);

-- ============================
-- 8. CUENTAS BANCARIAS
-- ============================
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_type ENUM('CHECKING', 'SAVINGS', 'CREDIT_LINE') NOT NULL,
    currency VARCHAR(3) DEFAULT 'CLP',
    initial_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_account_id INTEGER NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_number VARCHAR(50),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2),
    reconciled BOOLEAN DEFAULT FALSE,
    payment_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- ============================
-- 9. REPORTES Y KPI
-- ============================
CREATE TABLE IF NOT EXISTS financial_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,
    status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpi_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type ENUM('CURRENCY', 'PERCENTAGE', 'QUANTITY', 'RATIO') NOT NULL,
    category VARCHAR(50), -- SALES, INVENTORY, FINANCIAL, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_name)
);

-- ============================
-- 10. AUDITORÍA CONTABLE
-- ============================
CREATE TABLE IF NOT EXISTS accounting_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================
CREATE INDEX IF NOT EXISTS idx_invoices_customer_date ON invoices(customer_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_payments_customer_date ON payments(customer_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_date_name ON kpi_metrics(metric_date, metric_name);

-- ============================
-- VISTAS PARA REPORTES
-- ============================
CREATE VIEW IF NOT EXISTS customer_balance AS
SELECT 
    c.id as customer_id,
    c.customer_code,
    c.business_name,
    c.contact_name,
    COALESCE(SUM(CASE WHEN i.status != 'CANCELLED' THEN i.total_amount ELSE 0 END), 0) as total_invoiced,
    COALESCE(SUM(pa.allocated_amount), 0) as total_paid,
    COALESCE(SUM(CASE WHEN i.status != 'CANCELLED' THEN i.total_amount ELSE 0 END), 0) - 
    COALESCE(SUM(pa.allocated_amount), 0) as balance_due
FROM customers c
LEFT JOIN invoices i ON c.id = i.customer_id
LEFT JOIN payment_allocations pa ON i.id = pa.invoice_id
GROUP BY c.id, c.customer_code, c.business_name, c.contact_name;

CREATE VIEW IF NOT EXISTS product_stock AS
SELECT 
    p.id as product_id,
    p.product_code,
    p.product_name,
    l.location_name,
    COALESCE(SUM(CASE WHEN im.movement_type IN ('IN', 'TRANSFER') THEN im.quantity 
                      WHEN im.movement_type IN ('OUT') THEN -im.quantity 
                      ELSE 0 END), 0) as current_stock,
    p.minimum_stock,
    p.reorder_point,
    CASE WHEN COALESCE(SUM(CASE WHEN im.movement_type IN ('IN', 'TRANSFER') THEN im.quantity 
                               WHEN im.movement_type IN ('OUT') THEN -im.quantity 
                               ELSE 0 END), 0) <= p.reorder_point 
         THEN 'REORDER' 
         ELSE 'OK' END as stock_status
FROM products_accounting p
CROSS JOIN inventory_locations l
LEFT JOIN inventory_movements im ON p.id = im.product_id AND l.id = im.location_id
WHERE p.is_active = TRUE AND l.is_active = TRUE
GROUP BY p.id, p.product_code, p.product_name, l.id, l.location_name, p.minimum_stock, p.reorder_point;