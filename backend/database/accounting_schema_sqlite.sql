-- ================================================================
-- SCHEMA CONTABLE PARA FLORISTERÍA - SQLite Compatible
-- Versión: 2.0 - Optimizado para SQLite
-- ================================================================

-- Configurar pragmas para optimización
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- ================================================================
-- 1. PLAN DE CUENTAS (Chart of Accounts)
-- ================================================================
CREATE TABLE chart_of_accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    account_type VARCHAR(20) CHECK(account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')) NOT NULL,
    parent_account_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(account_id)
);

-- ================================================================
-- 2. CLIENTES (Customers)
-- ================================================================
CREATE TABLE customers_accounting (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    rut VARCHAR(20) UNIQUE,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    customer_type VARCHAR(20) CHECK(customer_type IN ('INDIVIDUAL', 'BUSINESS')) DEFAULT 'INDIVIDUAL',
    payment_terms INTEGER DEFAULT 30, -- días
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 3. PROVEEDORES (Suppliers)
-- ================================================================
CREATE TABLE suppliers (
    supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    rut VARCHAR(20) UNIQUE,
    payment_terms INTEGER DEFAULT 30, -- días
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 4. CATEGORÍAS DE PRODUCTOS (Product Categories)
-- ================================================================
CREATE TABLE product_categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES product_categories(category_id)
);

-- ================================================================
-- 5. PRODUCTOS CONTABLES (Products for Accounting)
-- ================================================================
CREATE TABLE products_accounting (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER,
    unit_of_measure VARCHAR(20) DEFAULT 'UNIT',
    cost_method VARCHAR(20) CHECK(cost_method IN ('FIFO', 'LIFO', 'AVERAGE')) DEFAULT 'FIFO',
    standard_cost DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 19.00, -- IVA Chile 19%
    is_service BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id)
);

-- ================================================================
-- 6. UBICACIONES DE INVENTARIO (Inventory Locations)
-- ================================================================
CREATE TABLE inventory_locations (
    location_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    location_type VARCHAR(20) CHECK(location_type IN ('WAREHOUSE', 'STORE', 'DISPLAY')) DEFAULT 'WAREHOUSE',
    address TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 7. MOVIMIENTOS DE INVENTARIO (Inventory Movements)
-- ================================================================
CREATE TABLE inventory_movements (
    movement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    movement_type VARCHAR(20) CHECK(movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT')) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    reference_type VARCHAR(50), -- 'INVOICE', 'PURCHASE', 'ADJUSTMENT'
    reference_id INTEGER,
    notes TEXT,
    movement_date DATE NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products_accounting(product_id),
    FOREIGN KEY (location_id) REFERENCES inventory_locations(location_id)
);

-- ================================================================
-- 8. INVENTARIO ACTUAL (Current Inventory)
-- ================================================================
CREATE TABLE current_inventory (
    inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    quantity_on_hand DECIMAL(10,3) DEFAULT 0,
    quantity_reserved DECIMAL(10,3) DEFAULT 0,
    quantity_available DECIMAL(10,3) DEFAULT 0,
    average_cost DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    last_movement_date DATE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products_accounting(product_id),
    FOREIGN KEY (location_id) REFERENCES inventory_locations(location_id),
    UNIQUE(product_id, location_id)
);

-- ================================================================
-- 9. FACTURAS DE VENTA (Sales Invoices)
-- ================================================================
CREATE TABLE invoices (
    invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) CHECK(status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')) DEFAULT 'DRAFT',
    payment_terms INTEGER DEFAULT 30,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers_accounting(customer_id)
);

-- ================================================================
-- 10. DETALLES DE FACTURAS (Invoice Line Items)
-- ================================================================
CREATE TABLE invoice_details (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 19.00,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products_accounting(product_id)
);

-- ================================================================
-- 11. COMPRAS (Purchase Orders)
-- ================================================================
CREATE TABLE purchase_orders (
    po_id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) CHECK(status IN ('PENDING', 'CONFIRMED', 'RECEIVED', 'CANCELLED')) DEFAULT 'PENDING',
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- ================================================================
-- 12. DETALLES DE COMPRAS (Purchase Order Details)
-- ================================================================
CREATE TABLE purchase_order_details (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    quantity_received DECIMAL(10,3) DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products_accounting(product_id)
);

-- ================================================================
-- 13. FACTURAS DE COMPRA (Purchase Invoices)
-- ================================================================
CREATE TABLE purchase_invoices (
    purchase_invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(50) NOT NULL,
    supplier_id INTEGER NOT NULL,
    po_id INTEGER,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) CHECK(status IN ('DRAFT', 'SENT', 'CONFIRMED', 'PAID')) DEFAULT 'DRAFT',
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
);

-- ================================================================
-- 14. PAGOS (Payments)
-- ================================================================
CREATE TABLE payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    payment_type VARCHAR(20) CHECK(payment_type IN ('RECEIVABLE', 'PAYABLE')) NOT NULL,
    reference_type VARCHAR(20), -- 'INVOICE', 'PURCHASE_INVOICE'
    reference_id INTEGER,
    customer_id INTEGER,
    supplier_id INTEGER,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50), -- 'CASH', 'CHECK', 'TRANSFER', 'CARD'
    bank_account_id INTEGER,
    notes TEXT,
    status VARCHAR(20) CHECK(status IN ('DRAFT', 'POSTED', 'PAID')) DEFAULT 'DRAFT',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers_accounting(customer_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- ================================================================
-- 15. ASIENTOS CONTABLES (Journal Entries)
-- ================================================================
CREATE TABLE journal_entries (
    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50), -- 'INVOICE', 'PAYMENT', 'ADJUSTMENT'
    reference_id INTEGER,
    total_debit DECIMAL(15,2) NOT NULL,
    total_credit DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) CHECK(status IN ('DRAFT', 'POSTED', 'REVERSED')) DEFAULT 'DRAFT',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    posted_at DATETIME,
    CHECK (total_debit = total_credit)
);

-- ================================================================
-- 16. LÍNEAS DE ASIENTOS CONTABLES (Journal Entry Lines)
-- ================================================================
CREATE TABLE journal_entry_lines (
    line_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entry_id) REFERENCES journal_entries(entry_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(account_id),
    CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0))
);

-- ================================================================
-- 17. CUENTAS BANCARIAS (Bank Accounts)
-- ================================================================
CREATE TABLE bank_accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(20) CHECK(account_type IN ('CHECKING', 'SAVINGS', 'CREDIT')) DEFAULT 'CHECKING',
    currency VARCHAR(3) DEFAULT 'CLP',
    initial_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 18. MOVIMIENTOS BANCARIOS (Bank Transactions)
-- ================================================================
CREATE TABLE bank_transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_number VARCHAR(50),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) NOT NULL,
    is_reconciled BOOLEAN DEFAULT 0,
    reconciled_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(account_id),
    CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0))
);

-- ================================================================
-- 19. PERÍODOS CONTABLES (Accounting Periods)
-- ================================================================
CREATE TABLE accounting_periods (
    period_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,
    status VARCHAR(20) CHECK(status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME
);

-- ================================================================
-- 20. MÉTRICAS KPI (Key Performance Indicators)
-- ================================================================
CREATE TABLE kpi_metrics (
    kpi_id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type VARCHAR(20) CHECK(metric_type IN ('CURRENCY', 'PERCENTAGE', 'QUANTITY')) NOT NULL,
    period_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 21. AUDITORÍA (Audit Trail)
-- ================================================================
CREATE TABLE audit_trail (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) CHECK(action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    changed_by INTEGER,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- DATOS INICIALES
-- ================================================================

-- Plan de Cuentas Básico
INSERT INTO chart_of_accounts (account_code, name, account_type, description) VALUES
-- ACTIVOS
('1000', 'ACTIVOS', 'ASSET', 'Activos Totales'),
('1100', 'ACTIVOS CORRIENTES', 'ASSET', 'Activos Corrientes'),
('1110', 'Caja y Bancos', 'ASSET', 'Efectivo y equivalentes'),
('1120', 'Cuentas por Cobrar', 'ASSET', 'Deudores comerciales'),
('1130', 'Inventario', 'ASSET', 'Mercaderías y productos'),
('1200', 'ACTIVOS FIJOS', 'ASSET', 'Activos Fijos'),
('1210', 'Equipos y Mobiliario', 'ASSET', 'Equipos y mobiliario'),
('1220', 'Depreciación Acumulada', 'ASSET', 'Depreciación de activos fijos'),

-- PASIVOS
('2000', 'PASIVOS', 'LIABILITY', 'Pasivos Totales'),
('2100', 'PASIVOS CORRIENTES', 'LIABILITY', 'Pasivos Corrientes'),
('2110', 'Cuentas por Pagar', 'LIABILITY', 'Acreedores comerciales'),
('2120', 'IVA por Pagar', 'LIABILITY', 'Impuesto al valor agregado'),
('2130', 'Préstamos', 'LIABILITY', 'Obligaciones financieras'),

-- PATRIMONIO
('3000', 'PATRIMONIO', 'EQUITY', 'Patrimonio Total'),
('3100', 'Capital', 'EQUITY', 'Capital aportado'),
('3200', 'Utilidades Acumuladas', 'EQUITY', 'Resultados acumulados'),

-- INGRESOS
('4000', 'INGRESOS', 'REVENUE', 'Ingresos Totales'),
('4100', 'Ventas', 'REVENUE', 'Ingresos por ventas'),
('4200', 'Otros Ingresos', 'REVENUE', 'Ingresos diversos'),

-- GASTOS
('5000', 'GASTOS', 'EXPENSE', 'Gastos Totales'),
('5100', 'Costo de Ventas', 'EXPENSE', 'Costo directo de productos vendidos'),
('5200', 'Gastos Operativos', 'EXPENSE', 'Gastos de operación'),
('5210', 'Sueldos y Salarios', 'EXPENSE', 'Remuneraciones'),
('5220', 'Arriendo', 'EXPENSE', 'Gastos de arriendo'),
('5230', 'Servicios Básicos', 'EXPENSE', 'Luz, agua, gas'),
('5240', 'Marketing y Publicidad', 'EXPENSE', 'Gastos de marketing'),
('5300', 'Gastos Financieros', 'EXPENSE', 'Intereses y comisiones bancarias');

-- Categorías de Productos
INSERT INTO product_categories (name, description) VALUES
('Flores Naturales', 'Flores frescas y naturales'),
('Arreglos Florales', 'Bouquets y arreglos personalizados'),
('Plantas', 'Plantas en maceta y de jardín'),
('Accesorios', 'Jarrones, lazos y decoración'),
('Servicios', 'Servicios de decoración y eventos');

-- Ubicaciones de Inventario
INSERT INTO inventory_locations (name, location_type, address) VALUES
('Bodega Principal', 'WAREHOUSE', 'Almacén principal - Av. Las Flores 123'),
('Sala de Ventas', 'STORE', 'Área de ventas al público'),
('Vitrina', 'DISPLAY', 'Exhibición de productos');

-- Cuenta Bancaria Principal
INSERT INTO bank_accounts (account_name, bank_name, account_number, account_type, currency, initial_balance, current_balance) VALUES
('Cuenta Corriente Principal', 'Banco de Chile', '12345678-9', 'CHECKING', 'CLP', 500000, 500000);

-- Período Contable Actual
INSERT INTO accounting_periods (period_name, start_date, end_date, fiscal_year, status) VALUES
('Enero 2024', '2024-01-01', '2024-01-31', 2024, 'CLOSED'),
('Febrero 2024', '2024-02-01', '2024-02-28', 2024, 'CLOSED'),
('Marzo 2024', '2024-03-01', '2024-03-31', 2024, 'OPEN');

-- ================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_details_invoice ON invoice_details(invoice_id);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id, movement_date);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_current_inventory_product ON current_inventory(product_id, location_id);

-- ================================================================
-- TRIGGERS PARA AUTOMATIZACIÓN
-- ================================================================

-- Trigger para mantener inventario actualizado
CREATE TRIGGER update_inventory_on_movement
AFTER INSERT ON inventory_movements
BEGIN
    INSERT OR REPLACE INTO current_inventory 
    (product_id, location_id, quantity_on_hand, last_movement_date, updated_at)
    VALUES (
        NEW.product_id,
        NEW.location_id,
        COALESCE((
            SELECT quantity_on_hand FROM current_inventory 
            WHERE product_id = NEW.product_id AND location_id = NEW.location_id
        ), 0) + 
        CASE 
            WHEN NEW.movement_type IN ('IN', 'ADJUSTMENT') THEN NEW.quantity
            ELSE -NEW.quantity 
        END,
        NEW.movement_date,
        CURRENT_TIMESTAMP
    );
END;

-- Trigger para auditoría en facturas
CREATE TRIGGER audit_invoices_changes
AFTER UPDATE ON invoices
BEGIN
    INSERT INTO audit_trail (table_name, record_id, action, old_values, new_values, changed_at)
    VALUES (
        'invoices',
        NEW.invoice_id,
        'UPDATE',
        json_object('status', OLD.status, 'total_amount', OLD.total_amount),
        json_object('status', NEW.status, 'total_amount', NEW.total_amount),
        CURRENT_TIMESTAMP
    );
END;

-- ================================================================
-- VISTAS PARA REPORTES
-- ================================================================

-- Vista de Balance de Prueba
CREATE VIEW trial_balance AS
SELECT 
    coa.account_code,
    coa.name,
    coa.account_type,
    COALESCE(SUM(jel.debit_amount), 0) as total_debits,
    COALESCE(SUM(jel.credit_amount), 0) as total_credits,
    COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0) as balance
FROM chart_of_accounts coa
LEFT JOIN journal_entry_lines jel ON coa.account_id = jel.account_id
LEFT JOIN journal_entries je ON jel.entry_id = je.entry_id
WHERE je.status = 'POSTED' OR je.status IS NULL
GROUP BY coa.account_id, coa.account_code, coa.name, coa.account_type
ORDER BY coa.account_code;

-- Vista de Antigüedad de Saldos
CREATE VIEW aging_receivables AS
SELECT 
    c.name as customer_name,
    i.invoice_number,
    i.invoice_date,
    i.due_date,
    i.total_amount,
    i.total_amount - COALESCE(SUM(p.amount), 0) as balance_due,
    CASE 
        WHEN date('now') <= i.due_date THEN 'CURRENT'
        WHEN date('now') <= date(i.due_date, '+30 days') THEN '1-30 DAYS'
        WHEN date('now') <= date(i.due_date, '+60 days') THEN '31-60 DAYS'
        WHEN date('now') <= date(i.due_date, '+90 days') THEN '61-90 DAYS'
        ELSE 'OVER 90 DAYS'
    END as aging_bucket
FROM invoices i
JOIN customers_accounting c ON i.customer_id = c.customer_id
LEFT JOIN payments p ON i.invoice_id = p.reference_id AND p.payment_type = 'RECEIVABLE'
WHERE i.status != 'PAID'
GROUP BY i.invoice_id
HAVING balance_due > 0;

-- Vista de Resumen de Ventas
CREATE VIEW sales_summary AS
SELECT 
    date(i.invoice_date) as sale_date,
    COUNT(*) as invoice_count,
    SUM(i.subtotal) as subtotal,
    SUM(i.tax_amount) as tax_amount,
    SUM(i.total_amount) as total_amount
FROM invoices i
WHERE i.status != 'CANCELLED'
GROUP BY date(i.invoice_date)
ORDER BY sale_date DESC;

-- Vista de Productos Más Vendidos
CREATE VIEW top_selling_products AS
SELECT 
    p.name as product_name,
    p.sku,
    SUM(id.quantity) as total_quantity_sold,
    SUM(id.line_total) as total_revenue,
    AVG(id.unit_price) as average_selling_price
FROM invoice_details id
JOIN products_accounting p ON id.product_id = p.product_id
JOIN invoices i ON id.invoice_id = i.invoice_id
WHERE i.status = 'PAID'
GROUP BY p.product_id
ORDER BY total_revenue DESC;

PRAGMA optimize;