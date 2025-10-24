const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Configuración
const DB_PATH = path.join(__dirname, 'test_database.db');
const BACKUP_PATH = path.join(__dirname, 'users.db');

console.log('🧪 GENERADOR DE BASE DE DATOS DE PRUEBA - FLORES VICTORIA');
console.log('========================================================');
console.log('');

// Crear backup de BD existente si existe
if (fs.existsSync(BACKUP_PATH)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    fs.copyFileSync(BACKUP_PATH, `${BACKUP_PATH}.backup-${timestamp}`);
    console.log(`💾 Backup creado: users.db.backup-${timestamp}`);
}

// Conectar a nueva BD de prueba
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error creando BD de prueba:', err.message);
        process.exit(1);
    }
    console.log('✅ Base de datos de prueba creada');
});

// Datos de prueba realistas
const NOMBRES = [
    'María', 'José', 'Ana', 'Carlos', 'Carmen', 'Manuel', 'Francisca', 'Luis', 'Isabel', 'Pedro',
    'Rosa', 'Antonio', 'Teresa', 'Francisco', 'Dolores', 'Jesús', 'Pilar', 'Alejandro', 'Mercedes', 'Rafael',
    'Concepción', 'David', 'Josefa', 'Juan', 'Antonia', 'Miguel', 'Esperanza', 'Sebastián', 'Ángeles', 'Adrián',
    'Lucía', 'Óscar', 'Rosario', 'Daniel', 'Soledad', 'Jorge', 'Amparo', 'Rubén', 'Encarnación', 'Pablo',
    'Asunción', 'Álvaro', 'Milagros', 'Eduardo', 'Inmaculada', 'Sergio', 'Remedios', 'Marcos', 'Purificación', 'César'
];

const APELLIDOS = [
    'García', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
    'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
    'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez',
    'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias',
    'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez'
];

const CIUDADES = [
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca',
    'Arica', 'Chillán', 'Iquique', 'Los Ángeles', 'Puerto Montt', 'Calama', 'Copiapó', 'Osorno',
    'Quillota', 'Valdivia', 'Punta Arenas', 'Coquimbo', 'Curicó', 'Ovalle', 'Linares', 'San Antonio'
];

const PRODUCTOS_FLORES = [
    { name: 'Rosa Roja Premium', category: 'Rosas', price: 2500, cost: 1200 },
    { name: 'Rosa Blanca', category: 'Rosas', price: 2300, cost: 1100 },
    { name: 'Rosa Rosada', category: 'Rosas', price: 2400, cost: 1150 },
    { name: 'Clavel Rojo', category: 'Claveles', price: 800, cost: 400 },
    { name: 'Clavel Blanco', category: 'Claveles', price: 750, cost: 380 },
    { name: 'Lirio Blanco', category: 'Lirios', price: 3500, cost: 1800 },
    { name: 'Lirio Oriental', category: 'Lirios', price: 4000, cost: 2100 },
    { name: 'Tulipán Rojo', category: 'Tulipanes', price: 1500, cost: 750 },
    { name: 'Tulipán Amarillo', category: 'Tulipanes', price: 1500, cost: 750 },
    { name: 'Orquídea Phalaenopsis', category: 'Orquídeas', price: 15000, cost: 8000 },
    { name: 'Girasol', category: 'Flores Silvestres', price: 2000, cost: 1000 },
    { name: 'Margarita', category: 'Flores Silvestres', price: 1200, cost: 600 },
    { name: 'Bouquet Romántico', category: 'Arreglos', price: 25000, cost: 12000 },
    { name: 'Arreglo Funeral', category: 'Arreglos', price: 35000, cost: 18000 },
    { name: 'Centro de Mesa', category: 'Arreglos', price: 18000, cost: 9000 },
    { name: 'Ramo de Novia', category: 'Arreglos', price: 50000, cost: 25000 },
    { name: 'Corsage', category: 'Accesorios', price: 8000, cost: 4000 },
    { name: 'Boutonniere', category: 'Accesorios', price: 5000, cost: 2500 },
    { name: 'Preservante Floral', category: 'Insumos', price: 3000, cost: 1500 },
    { name: 'Papel de Regalo', category: 'Insumos', price: 1000, cost: 500 }
];

// Funciones auxiliares
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomPhone() {
    const prefijos = ['9', '8', '7', '6'];
    const prefijo = getRandomElement(prefijos);
    const numero = Math.floor(10000000 + Math.random() * 90000000);
    return `+569${prefijo}${numero.toString().substring(1)}`;
}

function generateRandomRUT() {
    const rut = Math.floor(10000000 + Math.random() * 90000000);
    // Simplificado: no calculamos el dígito verificador real
    const dv = Math.floor(Math.random() * 10);
    return `${rut}-${dv}`;
}

function generateRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función principal de generación
async function generateTestData() {
    try {
        console.log('📋 Creando estructura de base de datos...');
        
        // Crear tablas básicas
        await runSQL(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(200) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                role VARCHAR(50) DEFAULT 'cliente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Leer y ejecutar schema contable
        const accountingSchema = fs.readFileSync(
            path.join(__dirname, 'accounting_schema.sql'), 
            'utf8'
        );
        await runSQL(accountingSchema);

        console.log('✅ Estructura de BD creada');
        console.log('');

        // 1. CREAR USUARIOS (100 usuarios)
        console.log('👥 Generando 100 usuarios de prueba...');
        
        const usuarios = [];
        const roles = [
            { rol: 'owner', cantidad: 1 },
            { rol: 'admin', cantidad: 2 },
            { rol: 'contador', cantidad: 2 },
            { rol: 'trabajador', cantidad: 10 },
            { rol: 'cliente', cantidad: 85 }
        ];

        let userId = 1;
        for (const { rol, cantidad } of roles) {
            for (let i = 0; i < cantidad; i++) {
                const nombre = getRandomElement(NOMBRES);
                const apellido1 = getRandomElement(APELLIDOS);
                const apellido2 = getRandomElement(APELLIDOS);
                const nombreCompleto = `${nombre} ${apellido1} ${apellido2}`;
                const email = `${nombre.toLowerCase()}.${apellido1.toLowerCase()}${userId}@floresvictoria.cl`;
                const password = await bcrypt.hash('password123', 12);
                const phone = generateRandomPhone();

                usuarios.push({
                    id: userId,
                    name: nombreCompleto,
                    email: email,
                    password: password,
                    phone: phone,
                    role: rol
                });

                userId++;
            }
        }

        // Insertar usuarios
        for (const usuario of usuarios) {
            await runSQL(`
                INSERT INTO users (name, email, password, phone, role, created_at)
                VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
            `, [
                usuario.name, 
                usuario.email, 
                usuario.password, 
                usuario.phone, 
                usuario.role,
                Math.floor(Math.random() * 365) // Usuario creado en el último año
            ]);
        }

        console.log(`✅ ${usuarios.length} usuarios creados`);

        // 2. CREAR CATEGORÍAS DE PRODUCTOS
        console.log('📦 Creando categorías de productos...');
        
        const categorias = ['Rosas', 'Claveles', 'Lirios', 'Tulipanes', 'Orquídeas', 'Flores Silvestres', 'Arreglos', 'Accesorios', 'Insumos'];
        
        for (let i = 0; i < categorias.length; i++) {
            await runSQL(`
                INSERT INTO product_categories (category_code, category_name)
                VALUES (?, ?)
            `, [`CAT${i + 1}`, categorias[i]]);
        }

        // 3. CREAR PRODUCTOS
        console.log('🌹 Creando productos...');
        
        for (let i = 0; i < PRODUCTOS_FLORES.length; i++) {
            const producto = PRODUCTOS_FLORES[i];
            const categoryId = categorias.indexOf(producto.category) + 1;
            
            await runSQL(`
                INSERT INTO products_accounting (
                    product_code, product_name, category_id, selling_price, 
                    standard_cost, minimum_stock, reorder_point
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                `PROD${String(i + 1).padStart(3, '0')}`,
                producto.name,
                categoryId,
                producto.price,
                producto.cost,
                Math.floor(Math.random() * 20) + 5, // Stock mínimo
                Math.floor(Math.random() * 10) + 15 // Punto de reorden
            ]);
        }

        console.log(`✅ ${PRODUCTOS_FLORES.length} productos creados`);

        // 4. CREAR CLIENTES
        console.log('🏢 Creando registros de clientes...');
        
        const clienteUsers = usuarios.filter(u => u.role === 'cliente');
        for (let i = 0; i < clienteUsers.length; i++) {
            const user = clienteUsers[i];
            const ciudad = getRandomElement(CIUDADES);
            
            await runSQL(`
                INSERT INTO customers (
                    user_id, customer_code, contact_name, email, phone, 
                    address, city, tax_id, credit_limit, customer_type
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                user.id,
                `CLI${String(i + 1).padStart(3, '0')}`,
                user.name,
                user.email,
                user.phone,
                `Calle ${Math.floor(Math.random() * 2000) + 100}, ${ciudad}`,
                ciudad,
                generateRandomRUT(),
                Math.floor(Math.random() * 500000) + 50000, // Límite de crédito
                Math.random() > 0.8 ? 'BUSINESS' : 'INDIVIDUAL'
            ]);
        }

        // 5. CREAR UBICACIONES DE INVENTARIO
        console.log('📍 Creando ubicaciones de inventario...');
        
        const ubicaciones = [
            { code: 'ALM01', name: 'Almacén Principal', type: 'WAREHOUSE' },
            { code: 'TDA01', name: 'Tienda Centro', type: 'STORE' },
            { code: 'VIT01', name: 'Vitrina Principal', type: 'DISPLAY' },
            { code: 'CAM01', name: 'Cámara Fría', type: 'COLD_ROOM' }
        ];

        for (const ubicacion of ubicaciones) {
            await runSQL(`
                INSERT INTO inventory_locations (location_code, location_name, location_type)
                VALUES (?, ?, ?)
            `, [ubicacion.code, ubicacion.name, ubicacion.type]);
        }

        // 6. CREAR MOVIMIENTOS DE INVENTARIO INICIALES
        console.log('📦 Generando movimientos de inventario...');
        
        for (let productId = 1; productId <= PRODUCTOS_FLORES.length; productId++) {
            for (let locationId = 1; locationId <= ubicaciones.length; locationId++) {
                const cantidad = Math.floor(Math.random() * 100) + 50;
                const costo = PRODUCTOS_FLORES[productId - 1].cost;
                
                await runSQL(`
                    INSERT INTO inventory_movements (
                        product_id, location_id, movement_type, quantity, 
                        unit_cost, total_cost, reference_type, user_id, movement_date
                    )
                    VALUES (?, ?, 'IN', ?, ?, ?, 'INITIAL', 1, datetime('now', '-30 days'))
                `, [productId, locationId, cantidad, costo, cantidad * costo]);
            }
        }

        // 7. CREAR MÉTODOS DE PAGO
        console.log('💳 Configurando métodos de pago...');
        
        const metodosPago = [
            { code: 'CASH', name: 'Efectivo', reference: false },
            { code: 'CARD', name: 'Tarjeta de Crédito/Débito', reference: true },
            { code: 'TRANSFER', name: 'Transferencia Bancaria', reference: true },
            { code: 'CHECK', name: 'Cheque', reference: true }
        ];

        for (const metodo of metodosPago) {
            await runSQL(`
                INSERT INTO payment_methods (method_code, method_name, requires_reference)
                VALUES (?, ?, ?)
            `, [metodo.code, metodo.name, metodo.reference]);
        }

        // 8. CREAR TIPOS DE DOCUMENTOS
        console.log('📄 Configurando tipos de documentos...');
        
        const tiposDocumento = [
            { code: 'BOL', name: 'Boleta', tax_id: false },
            { code: 'FAC', name: 'Factura', tax_id: true },
            { code: 'NCR', name: 'Nota de Crédito', tax_id: false },
            { code: 'NDB', name: 'Nota de Débito', tax_id: false }
        ];

        for (const tipo of tiposDocumento) {
            await runSQL(`
                INSERT INTO document_types (type_code, type_name, requires_tax_id)
                VALUES (?, ?, ?)
            `, [tipo.code, tipo.name, tipo.tax_id]);
        }

        // 9. GENERAR FACTURAS Y VENTAS (500+ transacciones)
        console.log('🧾 Generando 500+ facturas de prueba...');
        
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 6); // Últimos 6 meses
        
        for (let i = 0; i < 520; i++) {
            const customerId = Math.floor(Math.random() * clienteUsers.length) + 1;
            const documentTypeId = Math.floor(Math.random() * 2) + 1; // Boleta o Factura
            const fechaFactura = generateRandomDate(fechaInicio, new Date());
            
            // Generar entre 1 y 5 productos por factura
            const cantidadProductos = Math.floor(Math.random() * 5) + 1;
            let subtotal = 0;
            const productos = [];
            
            for (let j = 0; j < cantidadProductos; j++) {
                const productId = Math.floor(Math.random() * PRODUCTOS_FLORES.length) + 1;
                const cantidad = Math.floor(Math.random() * 3) + 1;
                const precio = PRODUCTOS_FLORES[productId - 1].price;
                const subtotalLinea = cantidad * precio;
                
                productos.push({
                    productId,
                    cantidad,
                    precio,
                    subtotal: subtotalLinea
                });
                
                subtotal += subtotalLinea;
            }
            
            const descuento = Math.random() > 0.8 ? subtotal * 0.1 : 0; // 20% de facturas con descuento
            const subtotalConDescuento = subtotal - descuento;
            const iva = subtotalConDescuento * 0.19;
            const total = subtotalConDescuento + iva;
            
            // Insertar factura
            const result = await runSQL(`
                INSERT INTO invoices (
                    invoice_number, document_type_id, customer_id, invoice_date, 
                    due_date, subtotal, tax_amount, discount_amount, total_amount, 
                    status, payment_status, created_by
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                `F${String(i + 1).padStart(6, '0')}`,
                documentTypeId,
                customerId,
                fechaFactura.toISOString().split('T')[0],
                new Date(fechaFactura.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 días
                subtotalConDescuento,
                iva,
                descuento,
                total,
                Math.random() > 0.1 ? 'SENT' : 'DRAFT', // 90% enviadas
                Math.random() > 0.3 ? 'PAID' : 'PENDING', // 70% pagadas
                Math.floor(Math.random() * 13) + 1 // Usuario que creó (trabajador/admin)
            ]);
            
            const invoiceId = result.lastID;
            
            // Insertar detalles de factura
            for (const prod of productos) {
                await runSQL(`
                    INSERT INTO invoice_details (
                        invoice_id, product_id, quantity, unit_price, 
                        discount_amount, subtotal, tax_rate, tax_amount, total_amount
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    invoiceId,
                    prod.productId,
                    prod.cantidad,
                    prod.precio,
                    0,
                    prod.subtotal,
                    19.00,
                    prod.subtotal * 0.19,
                    prod.subtotal * 1.19
                ]);
            }
            
            // Generar pago si la factura está pagada
            if (Math.random() > 0.3) { // 70% con pago
                const metodoPagoId = Math.floor(Math.random() * 4) + 1;
                const fechaPago = new Date(fechaFactura.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000);
                
                const paymentResult = await runSQL(`
                    INSERT INTO payments (
                        payment_date, customer_id, payment_method_id, 
                        amount, reference_number, created_by
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    fechaPago.toISOString().split('T')[0],
                    customerId,
                    metodoPagoId,
                    total,
                    `PAY${String(i + 1).padStart(6, '0')}`,
                    Math.floor(Math.random() * 13) + 1
                ]);
                
                // Asignar pago a factura
                await runSQL(`
                    INSERT INTO payment_allocations (payment_id, invoice_id, allocated_amount)
                    VALUES (?, ?, ?)
                `, [paymentResult.lastID, invoiceId, total]);
            }
        }

        console.log('✅ 520 facturas generadas con pagos');

        // 10. GENERAR KPIs
        console.log('📊 Calculando KPIs...');
        
        const fechasKPI = [];
        for (let i = 0; i < 180; i++) { // Últimos 6 meses
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            fechasKPI.push(fecha);
        }

        for (const fecha of fechasKPI) {
            const fechaStr = fecha.toISOString().split('T')[0];
            
            // Ventas diarias (simuladas)
            const ventasDiarias = Math.floor(Math.random() * 200000) + 50000;
            await runSQL(`
                INSERT OR REPLACE INTO kip_metrics (metric_date, metric_name, metric_value, metric_type, category)
                VALUES (?, 'daily_sales', ?, 'CURRENCY', 'SALES')
            `, [fechaStr, ventasDiarias]);
            
            // Número de pedidos
            const numeroPedidos = Math.floor(Math.random() * 15) + 5;
            await runSQL(`
                INSERT OR REPLACE INTO kip_metrics (metric_date, metric_name, metric_value, metric_type, category)
                VALUES (?, 'daily_orders', ?, 'QUANTITY', 'SALES')
            `, [fechaStr, numeroPedidos]);
        }

        console.log('✅ KPIs generados');
        console.log('');

        // RESUMEN FINAL
        console.log('🎉 BASE DE DATOS DE PRUEBA GENERADA EXITOSAMENTE');
        console.log('================================================');
        console.log('');
        
        // Mostrar estadísticas
        const stats = await getStats();
        console.table(stats);
        
        console.log('');
        console.log('📋 USUARIOS DE PRUEBA PRINCIPALES:');
        console.log('==================================');
        console.log('🏢 Owner: propietario.sistema1@floresvictoria.cl (password: password123)');
        console.log('⚙️  Admin: admin.usuario2@floresvictoria.cl (password: password123)');
        console.log('💼 Contador: contador.prueba3@floresvictoria.cl (password: password123)');
        console.log('👷 Trabajador: trabajador.ejemplo4@floresvictoria.cl (password: password123)');
        console.log('👤 Cliente: cliente.demo5@floresvictoria.cl (password: password123)');
        console.log('');
        console.log('🔄 Para usar esta BD: renombra test_database.db a users.db');
        
    } catch (error) {
        console.error('❌ Error generando datos de prueba:', error);
        throw error;
    }
}

// Funciones auxiliares
function runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        } else {
            db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        }
    });
}

function getStats() {
    return new Promise((resolve, reject) => {
        const stats = [];
        
        db.serialize(() => {
            db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                if (!err) stats.push({ Tabla: 'Usuarios', Cantidad: row.count });
            });
            
            db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
                if (!err) stats.push({ Tabla: 'Clientes', Cantidad: row.count });
            });
            
            db.get("SELECT COUNT(*) as count FROM products_accounting", (err, row) => {
                if (!err) stats.push({ Tabla: 'Productos', Cantidad: row.count });
            });
            
            db.get("SELECT COUNT(*) as count FROM invoices", (err, row) => {
                if (!err) stats.push({ Tabla: 'Facturas', Cantidad: row.count });
            });
            
            db.get("SELECT COUNT(*) as count FROM payments", (err, row) => {
                if (!err) stats.push({ Tabla: 'Pagos', Cantidad: row.count });
                resolve(stats);
            });
        });
    });
}

// Ejecutar generación
generateTestData()
    .then(() => {
        console.log('✅ Generación completada');
        db.close();
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        db.close();
        process.exit(1);
    });