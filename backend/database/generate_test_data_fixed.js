const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

// ================================================================
// CONFIGURACIÓN Y UTILIDADES
// ================================================================

const SALT_ROUNDS = 10;
const DB_NAME = 'flores_victoria_accounting.db';

// Datos para Chile
const CHILEAN_NAMES = {
  male: [
    'Carlos',
    'Luis',
    'José',
    'Manuel',
    'Francisco',
    'Antonio',
    'Juan',
    'Pedro',
    'Miguel',
    'Jorge',
    'Roberto',
    'Ricardo',
    'Andrés',
    'Fernando',
    'Diego',
    'Patricio',
    'Gonzalo',
    'Alejandro',
    'Rodrigo',
    'Cristián',
  ],
  female: [
    'María',
    'Ana',
    'Carmen',
    'Rosa',
    'Teresa',
    'Isabel',
    'Francisca',
    'Patricia',
    'Gloria',
    'Claudia',
    'Mónica',
    'Soledad',
    'Alejandra',
    'Marcela',
    'Verónica',
    'Silvia',
    'Andrea',
    'Carolina',
    'Paulina',
    'Lorena',
  ],
};

const CHILEAN_SURNAMES = [
  'González',
  'Muñoz',
  'Rojas',
  'Díaz',
  'Pérez',
  'Soto',
  'Contreras',
  'Silva',
  'Martínez',
  'Sepúlveda',
  'Morales',
  'Rodríguez',
  'López',
  'Fuentes',
  'Hernández',
  'Torres',
  'Araya',
  'Flores',
  'Espinoza',
  'Valdés',
  'Castillo',
  'Núñez',
  'Tapia',
  'Reyes',
  'Castro',
];

const CHILEAN_CITIES = [
  'Santiago',
  'Valparaíso',
  'Concepción',
  'La Serena',
  'Antofagasta',
  'Temuco',
  'Rancagua',
  'Talca',
  'Arica',
  'Chillán',
  'Iquique',
  'Los Ángeles',
  'Puerto Montt',
  'Calama',
  'Coquimbo',
  'Osorno',
  'Valdivia',
  'Punta Arenas',
  'Copiapó',
  'Quillota',
];

const FLOWER_PRODUCTS = [
  { name: 'Rosas Rojas', price: 25000, cost: 12000, category: 1 },
  { name: 'Rosas Blancas', price: 28000, cost: 14000, category: 1 },
  { name: 'Tulipanes', price: 18000, cost: 9000, category: 1 },
  { name: 'Girasoles', price: 15000, cost: 7500, category: 1 },
  { name: 'Lilios', price: 32000, cost: 16000, category: 1 },
  { name: 'Orquídeas', price: 45000, cost: 22500, category: 1 },
  { name: 'Claveles', price: 12000, cost: 6000, category: 1 },
  { name: 'Gerberas', price: 20000, cost: 10000, category: 1 },
  { name: 'Bouquet Romántico', price: 85000, cost: 42500, category: 2 },
  { name: 'Arreglo de Mesa', price: 65000, cost: 32500, category: 2 },
  { name: 'Corona Fúnebre', price: 120000, cost: 60000, category: 2 },
  { name: 'Ramo de Novia', price: 150000, cost: 75000, category: 2 },
  { name: 'Centro de Mesa', price: 45000, cost: 22500, category: 2 },
  { name: 'Planta Suculenta', price: 8000, cost: 4000, category: 3 },
  { name: 'Helecho', price: 15000, cost: 7500, category: 3 },
  { name: 'Ficus', price: 35000, cost: 17500, category: 3 },
  { name: 'Jarrones Cerámica', price: 25000, cost: 12500, category: 4 },
  { name: 'Lazos Decorativos', price: 3000, cost: 1500, category: 4 },
  { name: 'Servicio Decoración Evento', price: 250000, cost: 125000, category: 5 },
  { name: 'Diseño Floral Bodas', price: 450000, cost: 225000, category: 5 },
];

// ================================================================
// UTILIDADES
// ================================================================

function generateRUT() {
  const number = Math.floor(Math.random() * 99999999) + 1000000;
  let sum = 0;
  let multiplier = 2;

  const digits = number.toString().split('').reverse();

  for (const digit of digits) {
    sum += parseInt(digit) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  let checkDigit = 11 - remainder;

  if (checkDigit === 11) checkDigit = 0;
  if (checkDigit === 10) checkDigit = 'K';

  return `${number}-${checkDigit}`;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function runSQL(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function runSQLAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// ================================================================
// GENERADOR PRINCIPAL
// ================================================================

async function generateTestData() {
  console.log('🧪 GENERADOR DE BASE DE DATOS DE PRUEBA - FLORES VICTORIA');
  console.log('========================================================\n');

  const db = new sqlite3.Database(DB_NAME);

  try {
    console.log('📋 Verificando estructura de base de datos...');

    // Verificar tablas existentes
    const tables = await runSQLAll(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log(`✅ ${tables.length} tablas encontradas`);

    // ===============================
    // 1. GENERAR USUARIOS
    // ===============================
    console.log('\n👥 Generando usuarios...');

    const users = [];
    const hashedPassword = await bcrypt.hash('123456', SALT_ROUNDS);

    // 1 Dueño
    users.push({
      name: `${getRandomElement(CHILEAN_NAMES.male)} ${getRandomElement(CHILEAN_SURNAMES)}`,
      email: 'owner@flores-victoria.cl',
      password: hashedPassword,
      role: 4, // OWNER
      rut: generateRUT(),
    });

    // 2 Administradores
    for (let i = 0; i < 2; i++) {
      users.push({
        name: `${getRandomElement(CHILEAN_NAMES.female)} ${getRandomElement(CHILEAN_SURNAMES)}`,
        email: `admin${i + 1}@flores-victoria.cl`,
        password: hashedPassword,
        role: 3, // ADMIN
        rut: generateRUT(),
      });
    }

    // 2 Contadores
    for (let i = 0; i < 2; i++) {
      users.push({
        name: `${getRandomElement(CHILEAN_NAMES.male)} ${getRandomElement(CHILEAN_SURNAMES)}`,
        email: `contador${i + 1}@flores-victoria.cl`,
        password: hashedPassword,
        role: 2, // CONTADOR
        rut: generateRUT(),
      });
    }

    // 10 Trabajadores
    for (let i = 0; i < 10; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      users.push({
        name: `${getRandomElement(CHILEAN_NAMES[gender])} ${getRandomElement(CHILEAN_SURNAMES)}`,
        email: `trabajador${i + 1}@flores-victoria.cl`,
        password: hashedPassword,
        role: 1, // TRABAJADOR
        rut: generateRUT(),
      });
    }

    // 85 Clientes
    for (let i = 0; i < 85; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      users.push({
        name: `${getRandomElement(CHILEAN_NAMES[gender])} ${getRandomElement(CHILEAN_SURNAMES)}`,
        email: `cliente${i + 1}@flores-victoria.cl`,
        password: hashedPassword,
        role: 0, // CLIENTE
        rut: generateRUT(),
      });
    }

    console.log(`✅ ${users.length} usuarios creados`);

    // ===============================
    // 2. INSERTAR USUARIOS EN DB
    // ===============================
    console.log('\n💾 Guardando usuarios en base de datos...');

    // Crear tabla temporal de usuarios para el test
    await runSQL(
      db,
      `
            CREATE TABLE IF NOT EXISTS users_temp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(200) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role INTEGER NOT NULL,
                rut VARCHAR(20) UNIQUE,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `
    );

    // Insertar usuarios
    for (const user of users) {
      await runSQL(
        db,
        'INSERT INTO users_temp (name, email, password, role, rut) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.password, user.role, user.rut]
      );
    }

    console.log('✅ Usuarios guardados');

    // ===============================
    // 3. GENERAR CLIENTES CONTABLES
    // ===============================
    console.log('\n🏢 Generando clientes contables...');

    const clientUsers = users.filter((u) => u.role === 0);
    for (let i = 0; i < clientUsers.length; i++) {
      const user = clientUsers[i];
      const isBusinessClient = Math.random() < 0.3; // 30% empresas

      await runSQL(
        db,
        `
                INSERT INTO customers_accounting (
                    name, email, phone, address, rut, credit_limit, 
                    customer_type, payment_terms, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          user.name,
          user.email,
          `+56 9 ${Math.floor(Math.random() * 90000000) + 10000000}`,
          `${getRandomElement(['Av. Libertador', 'Calle Los Robles', 'Pasaje Las Flores', 'Av. Central'])} ${Math.floor(Math.random() * 9999) + 1}`,
          user.rut,
          isBusinessClient ? Math.floor(Math.random() * 5000000) + 500000 : 100000,
          isBusinessClient ? 'BUSINESS' : 'INDIVIDUAL',
          isBusinessClient ? 45 : 30,
          1,
        ]
      );
    }

    console.log('✅ Clientes contables creados');

    // ===============================
    // 4. GENERAR PROVEEDORES
    // ===============================
    console.log('\n🚚 Generando proveedores...');

    const suppliers = [
      'Flores del Sur Ltda.',
      'Vivero San Pedro',
      'Distribuidora Floral Chile',
      'Importadora de Flores',
      'Cultivos del Valle',
      'Flores Premium S.A.',
      'Vivero Las Rosas',
      'Comercial Jardín',
      'Flores Andinas',
      'Cultivos Orgánicos',
    ];

    for (const supplierName of suppliers) {
      await runSQL(
        db,
        `
                INSERT INTO suppliers (
                    name, contact_person, email, phone, address, rut, 
                    payment_terms, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          supplierName,
          `${getRandomElement(CHILEAN_NAMES.male)} ${getRandomElement(CHILEAN_SURNAMES)}`,
          `contacto@${supplierName.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')}.cl`,
          `+56 2 ${Math.floor(Math.random() * 9000000) + 1000000}`,
          `${getRandomElement(CHILEAN_CITIES)}, Chile`,
          generateRUT(),
          30,
          1,
        ]
      );
    }

    console.log('✅ Proveedores creados');

    // ===============================
    // 5. GENERAR PRODUCTOS
    // ===============================
    console.log('\n🌸 Generando productos...');

    for (const product of FLOWER_PRODUCTS) {
      await runSQL(
        db,
        `
                INSERT INTO products_accounting (
                    sku, name, description, category_id, unit_of_measure,
                    cost_method, standard_cost, selling_price, tax_rate,
                    is_service, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          `PROD${String(FLOWER_PRODUCTS.indexOf(product) + 1).padStart(3, '0')}`,
          product.name,
          `${product.name} - Producto de alta calidad`,
          product.category,
          product.category === 5 ? 'SERVICE' : 'UNIT',
          'FIFO',
          product.cost,
          product.price,
          19.0,
          product.category === 5 ? 1 : 0,
          1,
        ]
      );
    }

    console.log('✅ Productos creados');

    // ===============================
    // 6. GENERAR INVENTARIO INICIAL
    // ===============================
    console.log('\n📦 Generando inventario inicial...');

    const products = await runSQLAll(
      db,
      'SELECT product_id, name, is_service FROM products_accounting WHERE is_active = 1'
    );
    const locations = await runSQLAll(
      db,
      'SELECT location_id FROM inventory_locations WHERE is_active = 1'
    );

    for (const product of products) {
      if (product.is_service) continue; // No inventario para servicios

      for (const location of locations) {
        const quantity = Math.floor(Math.random() * 100) + 10;
        const cost = FLOWER_PRODUCTS.find((p) => p.name === product.name)?.cost || 5000;

        // Movimiento de entrada inicial
        await runSQL(
          db,
          `
                    INSERT INTO inventory_movements (
                        product_id, location_id, movement_type, quantity,
                        unit_cost, total_cost, reference_type, movement_date, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
          [
            product.product_id,
            location.location_id,
            'IN',
            quantity,
            cost,
            quantity * cost,
            'INITIAL',
            formatDate(new Date('2024-01-01')),
            'Inventario inicial',
          ]
        );
      }
    }

    console.log('✅ Inventario inicial creado');

    // ===============================
    // 7. GENERAR FACTURAS
    // ===============================
    console.log('\n📄 Generando facturas...');

    const customers = await runSQLAll(
      db,
      'SELECT customer_id, name FROM customers_accounting WHERE is_active = 1'
    );
    const activeProducts = await runSQLAll(
      db,
      'SELECT product_id, name, selling_price FROM products_accounting WHERE is_active = 1'
    );

    let invoiceNumber = 1;
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-03-31');

    for (let i = 0; i < 520; i++) {
      const customer = getRandomElement(customers);
      const invoiceDate = getRandomDate(startDate, endDate);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);

      // Crear factura
      const invoiceResult = await runSQL(
        db,
        `
                INSERT INTO invoices (
                    invoice_number, customer_id, invoice_date, due_date,
                    subtotal, tax_amount, total_amount, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          String(invoiceNumber).padStart(6, '0'),
          customer.customer_id,
          formatDate(invoiceDate),
          formatDate(dueDate),
          0, // Se calculará después
          0, // Se calculará después
          0, // Se calculará después
          getRandomElement(['SENT', 'PAID', 'PAID', 'PAID']), // 75% pagadas
        ]
      );

      const invoiceId = invoiceResult.id;

      // Agregar detalles de factura (1-5 productos)
      const numProducts = Math.floor(Math.random() * 5) + 1;
      let subtotal = 0;

      for (let j = 0; j < numProducts; j++) {
        const product = getRandomElement(activeProducts);
        const quantity = Math.floor(Math.random() * 10) + 1;
        const unitPrice = product.selling_price;
        const lineTotal = quantity * unitPrice;
        const taxAmount = lineTotal * 0.19;

        await runSQL(
          db,
          `
                    INSERT INTO invoice_details (
                        invoice_id, product_id, quantity, unit_price,
                        line_total, tax_rate, tax_amount
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
          [invoiceId, product.product_id, quantity, unitPrice, lineTotal, 19.0, taxAmount]
        );

        subtotal += lineTotal;
      }

      const totalTax = subtotal * 0.19;
      const total = subtotal + totalTax;

      // Actualizar totales de factura
      await runSQL(
        db,
        `
                UPDATE invoices 
                SET subtotal = ?, tax_amount = ?, total_amount = ?
                WHERE invoice_id = ?
            `,
        [subtotal, totalTax, total, invoiceId]
      );

      invoiceNumber++;
    }

    console.log('✅ 520 facturas generadas');

    // ===============================
    // 8. GENERAR PAGOS
    // ===============================
    console.log('\n💰 Generando pagos...');

    const paidInvoices = await runSQLAll(
      db,
      `
            SELECT invoice_id, customer_id, total_amount, invoice_date 
            FROM invoices 
            WHERE status = 'PAID'
        `
    );

    for (const invoice of paidInvoices) {
      const paymentDate = new Date(invoice.invoice_date);
      paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 45));

      await runSQL(
        db,
        `
                INSERT INTO payments (
                    payment_number, payment_type, reference_type, reference_id,
                    customer_id, payment_date, amount, payment_method, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          `PAY${String(paidInvoices.indexOf(invoice) + 1).padStart(6, '0')}`,
          'RECEIVABLE',
          'INVOICE',
          invoice.invoice_id,
          invoice.customer_id,
          formatDate(paymentDate),
          invoice.total_amount,
          getRandomElement(['CASH', 'TRANSFER', 'CARD', 'CHECK']),
          'POSTED',
        ]
      );
    }

    console.log('✅ Pagos generados');

    // ===============================
    // 9. GENERAR ÓRDENES DE COMPRA
    // ===============================
    console.log('\n🛒 Generando órdenes de compra...');

    const suppliersData = await runSQLAll(
      db,
      'SELECT supplier_id, name FROM suppliers WHERE is_active = 1'
    );

    for (let i = 0; i < 120; i++) {
      const supplier = getRandomElement(suppliersData);
      const orderDate = getRandomDate(startDate, endDate);
      const expectedDate = new Date(orderDate);
      expectedDate.setDate(expectedDate.getDate() + 7);

      const subtotal = Math.floor(Math.random() * 800000) + 100000;
      const taxAmount = subtotal * 0.19;
      const total = subtotal + taxAmount;

      await runSQL(
        db,
        `
                INSERT INTO purchase_orders (
                    po_number, supplier_id, order_date, expected_date,
                    subtotal, tax_amount, total_amount, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          `PO${String(i + 1).padStart(6, '0')}`,
          supplier.supplier_id,
          formatDate(orderDate),
          formatDate(expectedDate),
          subtotal,
          taxAmount,
          total,
          getRandomElement(['CONFIRMED', 'RECEIVED', 'RECEIVED']),
        ]
      );
    }

    console.log('✅ Órdenes de compra generadas');

    // ===============================
    // 10. CALCULAR KPIs
    // ===============================
    console.log('\n📊 Calculando KPIs...');

    // KPIs mensuales
    const months = [
      { name: 'Enero 2024', date: '2024-01-31' },
      { name: 'Febrero 2024', date: '2024-02-29' },
      { name: 'Marzo 2024', date: '2024-03-31' },
    ];

    for (const month of months) {
      // Ventas del mes
      const salesResult = await runSQLAll(
        db,
        `
                SELECT SUM(total_amount) as total_sales, COUNT(*) as invoice_count
                FROM invoices 
                WHERE invoice_date <= ? AND status != 'CANCELLED'
                AND strftime('%Y-%m', invoice_date) = ?
            `,
        [month.date, month.date.substring(0, 7)]
      );

      const totalSales = salesResult[0]?.total_sales || 0;
      const invoiceCount = salesResult[0]?.invoice_count || 0;

      // Insertar KPIs
      await runSQL(
        db,
        `
                INSERT INTO kpi_metrics (metric_name, metric_value, metric_type, period_date)
                VALUES (?, ?, ?, ?)
            `,
        ['Ventas Totales', totalSales, 'CURRENCY', month.date]
      );

      await runSQL(
        db,
        `
                INSERT INTO kpi_metrics (metric_name, metric_value, metric_type, period_date)
                VALUES (?, ?, ?, ?)
            `,
        ['Número de Facturas', invoiceCount, 'QUANTITY', month.date]
      );

      // Margen de ganancia aproximado (25%)
      const grossProfit = totalSales * 0.25;
      await runSQL(
        db,
        `
                INSERT INTO kpi_metrics (metric_name, metric_value, metric_type, period_date)
                VALUES (?, ?, ?, ?)
            `,
        ['Utilidad Bruta', grossProfit, 'CURRENCY', month.date]
      );
    }

    console.log('✅ KPIs calculados');

    // ===============================
    // 11. ESTADÍSTICAS FINALES
    // ===============================
    console.log('\n📈 ESTADÍSTICAS FINALES');
    console.log('========================');

    const stats = {
      usuarios: await runSQLAll(db, 'SELECT COUNT(*) as count FROM users_temp'),
      clientes: await runSQLAll(db, 'SELECT COUNT(*) as count FROM customers_accounting'),
      proveedores: await runSQLAll(db, 'SELECT COUNT(*) as count FROM suppliers'),
      productos: await runSQLAll(db, 'SELECT COUNT(*) as count FROM products_accounting'),
      facturas: await runSQLAll(db, 'SELECT COUNT(*) as count FROM invoices'),
      pagos: await runSQLAll(db, 'SELECT COUNT(*) as count FROM payments'),
      compras: await runSQLAll(db, 'SELECT COUNT(*) as count FROM purchase_orders'),
      kpis: await runSQLAll(db, 'SELECT COUNT(*) as count FROM kpi_metrics'),
    };

    console.log(`👥 Usuarios: ${stats.usuarios[0].count}`);
    console.log(`🏢 Clientes: ${stats.clientes[0].count}`);
    console.log(`🚚 Proveedores: ${stats.proveedores[0].count}`);
    console.log(`🌸 Productos: ${stats.productos[0].count}`);
    console.log(`📄 Facturas: ${stats.facturas[0].count}`);
    console.log(`💰 Pagos: ${stats.pagos[0].count}`);
    console.log(`🛒 Órdenes de Compra: ${stats.compras[0].count}`);
    console.log(`📊 KPIs: ${stats.kpis[0].count}`);

    // Resumen financiero
    const financialSummary = await runSQLAll(
      db,
      `
            SELECT 
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_invoice,
                COUNT(*) as paid_invoices
            FROM invoices 
            WHERE status = 'PAID'
        `
    );

    const revenue = financialSummary[0]?.total_revenue || 0;
    const avgInvoice = financialSummary[0]?.avg_invoice || 0;
    const paidCount = financialSummary[0]?.paid_invoices || 0;

    console.log('\n💵 RESUMEN FINANCIERO');
    console.log('=====================');
    console.log(`💰 Ingresos Totales: $${revenue.toLocaleString('es-CL')}`);
    console.log(`📊 Factura Promedio: $${Math.round(avgInvoice).toLocaleString('es-CL')}`);
    console.log(`✅ Facturas Pagadas: ${paidCount}`);

    console.log('\n🎉 BASE DE DATOS DE PRUEBA GENERADA EXITOSAMENTE');
    console.log('==================================================');
    console.log('✅ 100 usuarios con roles jerárquicos');
    console.log('✅ 520+ facturas con ciclo financiero completo');
    console.log('✅ Inventario, pagos y KPIs calculados');
    console.log('✅ Datos realistas para Chile (RUT, ciudades, nombres)');
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   📧 Email: [cualquier email generado]');
    console.log('   🔒 Password: 123456');
    console.log('\n🚀 ¡Listo para probar el sistema contable!');
  } catch (error) {
    console.error('❌ Error generando datos de prueba:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

// ================================================================
// EJECUCIÓN
// ================================================================

if (require.main === module) {
  generateTestData()
    .then(() => {
      console.log('\n✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateTestData };
