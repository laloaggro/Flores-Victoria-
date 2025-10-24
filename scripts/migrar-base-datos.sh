#!/bin/bash

echo "🔄 MIGRACIÓN DE BASE DE DATOS - SISTEMA DE ROLES"
echo "==============================================="
echo ""

BASE_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
BACKEND_DIR="$BASE_DIR/backend"
MIGRATION_DATE=$(date +"%Y%m%d_%H%M%S")

echo "📋 PLAN DE MIGRACIÓN:"
echo "===================="
echo ""
echo "1️⃣ Backup de base de datos actual"
echo "2️⃣ Agregar columna de roles a tabla users"
echo "3️⃣ Crear tabla user_permissions"
echo "4️⃣ Actualizar usuarios existentes con roles"
echo "5️⃣ Insertar datos semilla (seeders)"
echo ""

echo "❓ ¿Proceder con la migración? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Iniciando migración de base de datos..."
    echo ""

    # Verificar que el directorio backend existe
    if [ ! -d "$BACKEND_DIR" ]; then
        echo "❌ Error: Directorio backend no encontrado"
        exit 1
    fi

    cd "$BACKEND_DIR"

    # 1. Backup de base de datos
    echo "💾 1/5 - Creando backup de la base de datos..."
    if [ -f "users.db" ]; then
        cp users.db "users.db.backup_$MIGRATION_DATE"
        echo "✅ Backup creado: users.db.backup_$MIGRATION_DATE"
    else
        echo "⚠️  Base de datos users.db no encontrada, se creará nueva"
    fi

    # 2. Crear script de migración SQL
    echo "📝 2/5 - Generando script de migración..."
    
    cat > "migration_roles_$MIGRATION_DATE.sql" << 'EOF'
-- Migración: Sistema de Roles - Flores Victoria
-- Fecha: MIGRATION_DATE
-- Descripción: Agregar soporte completo para sistema de roles jerárquico

-- Verificar si la columna role ya existe, si no agregarla
PRAGMA table_info(users);

-- Agregar columna role si no existe (SQLite no soporta ADD COLUMN IF NOT EXISTS)
-- Esto debe ejecutarse condicionalmente

-- Crear tabla de permisos
CREATE TABLE IF NOT EXISTS user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    permission VARCHAR(100) NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id),
    UNIQUE(user_id, permission)
);

-- Crear tabla de auditoría de roles
CREATE TABLE IF NOT EXISTS role_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    old_role VARCHAR(50),
    new_role VARCHAR(50) NOT NULL,
    changed_by INTEGER,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Crear tabla de configuración de roles
CREATE TABLE IF NOT EXISTS role_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_level INTEGER NOT NULL,
    description TEXT,
    permissions TEXT, -- JSON con lista de permisos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración de roles por defecto
INSERT OR REPLACE INTO role_config (role_name, role_level, description, permissions) VALUES
('cliente', 0, 'Cliente del sistema con permisos básicos', '["view_products","add_to_cart","make_purchase","view_own_orders","edit_own_profile","create_wishlist","contact_support"]'),
('trabajador', 1, 'Empleado con permisos operativos', '["view_all_orders","update_order_status","view_inventory","manage_deliveries","customer_chat","basic_reports"]'),
('admin', 2, 'Administrador con permisos completos', '["manage_products","manage_users","view_full_reports","system_configuration","access_admin_panel","system_monitoring"]'),
('owner', 3, 'Propietario con acceso total', '["configure_roles","manage_administrators","view_financial_metrics","advanced_configuration","backup_restore","system_logs"]');

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission);
CREATE INDEX IF NOT EXISTS idx_role_audit_user_id ON role_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_changed_at ON role_audit(changed_at);

-- Comentarios de la migración
-- Esta migración introduce el sistema de roles jerárquico completo
-- Roles: cliente (0) < trabajador (1) < admin (2) < owner (3)
-- Cada rol superior incluye permisos de roles inferiores
EOF

    # Reemplazar placeholder de fecha
    sed -i "s/MIGRATION_DATE/$(date '+%Y-%m-%d %H:%M:%S')/g" "migration_roles_$MIGRATION_DATE.sql"

    echo "✅ Script de migración generado: migration_roles_$MIGRATION_DATE.sql"

    # 3. Crear script de actualización de usuarios
    echo "👥 3/5 - Creando script de actualización de usuarios..."
    
    cat > "update_users_roles_$MIGRATION_DATE.sql" << 'EOF'
-- Actualización de usuarios existentes con roles

-- Primero, verificar estructura actual de la tabla
.schema users

-- Si la columna role no existe, crearla
-- NOTA: En SQLite, ALTER TABLE ADD COLUMN es la única modificación soportada
-- Si necesitas cambiar el tipo, debes recrear la tabla

-- Agregar columna role si no existe (ejecutar solo si es necesario)
-- ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'cliente';

-- Actualizar usuarios existentes
-- Asignar rol 'admin' a usuarios que ya tenían acceso administrativo
UPDATE users SET role = 'admin' WHERE email LIKE '%admin%' OR email LIKE '%administrador%';

-- Crear usuario owner por defecto si no existe
INSERT OR IGNORE INTO users (name, email, password, phone, role, created_at) 
VALUES (
    'Propietario Sistema', 
    'owner@floresvictoria.cl', 
    '$2b$12$dummy_hash_for_owner_user_replace_with_real', 
    '+56912345678', 
    'owner', 
    datetime('now')
);

-- Actualizar todos los usuarios sin rol asignado
UPDATE users SET role = 'cliente' WHERE role IS NULL OR role = '';

-- Insertar algunos usuarios de ejemplo para testing
INSERT OR IGNORE INTO users (name, email, password, phone, role, created_at) VALUES
('Juan Trabajador', 'trabajador@floresvictoria.cl', '$2b$12$dummy_hash_for_worker', '+56987654321', 'trabajador', datetime('now')),
('Ana Administradora', 'admin@floresvictoria.cl', '$2b$12$dummy_hash_for_admin', '+56987654322', 'admin', datetime('now')),
('Cliente Ejemplo', 'cliente@floresvictoria.cl', '$2b$12$dummy_hash_for_client', '+56987654323', 'cliente', datetime('now'));

-- Auditar la creación de roles iniciales
INSERT INTO role_audit (user_id, old_role, new_role, changed_by, reason) 
SELECT id, NULL, role, 1, 'Migración inicial del sistema de roles'
FROM users WHERE id IN (
    SELECT id FROM users WHERE email IN ('owner@floresvictoria.cl', 'trabajador@floresvictoria.cl', 'admin@floresvictoria.cl')
);
EOF

    echo "✅ Script de actualización generado: update_users_roles_$MIGRATION_DATE.sql"

    # 4. Crear script Node.js para ejecutar migración
    echo "🔧 4/5 - Creando script de migración en Node.js..."
    
    cat > "migrate_roles.js" << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Configuración
const DB_PATH = path.join(__dirname, 'users.db');
const MIGRATION_DATE = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

console.log('🔄 Ejecutando migración del sistema de roles...');
console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
console.log(`📂 Base de datos: ${DB_PATH}`);

// Conectar a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado a la base de datos SQLite');
});

// Función para ejecutar SQL
function runSQL(sql, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔧 ${description}...`);
        db.exec(sql, (err) => {
            if (err) {
                console.error(`❌ Error en ${description}:`, err.message);
                reject(err);
            } else {
                console.log(`✅ ${description} completado`);
                resolve();
            }
        });
    });
}

// Función para verificar si una columna existe
function checkColumnExists(tableName, columnName) {
    return new Promise((resolve) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
            if (err) {
                console.error('Error verificando columna:', err);
                resolve(false);
                return;
            }
            
            const columnExists = rows.some(row => row.name === columnName);
            resolve(columnExists);
        });
    });
}

// Ejecutar migración
async function migrate() {
    try {
        // 1. Verificar si la columna role existe
        const roleColumnExists = await checkColumnExists('users', 'role');
        
        if (!roleColumnExists) {
            console.log('\n📝 Agregando columna role a tabla users...');
            await runSQL(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'cliente';`, 'Agregar columna role');
        } else {
            console.log('\n✅ Columna role ya existe en tabla users');
        }

        // 2. Leer y ejecutar script de migración principal
        const migrationSQL = fs.readFileSync(`migration_roles_${MIGRATION_DATE}.sql`, 'utf8');
        await runSQL(migrationSQL, 'Ejecutar migración principal');

        // 3. Leer y ejecutar script de actualización de usuarios
        const updateUsersSQL = fs.readFileSync(`update_users_roles_${MIGRATION_DATE}.sql`, 'utf8');
        await runSQL(updateUsersSQL, 'Actualizar usuarios existentes');

        // 4. Verificar migración
        console.log('\n🔍 Verificando migración...');
        
        db.all('SELECT name, role FROM users LIMIT 10', (err, rows) => {
            if (err) {
                console.error('Error verificando usuarios:', err);
            } else {
                console.log('\n👥 Usuarios después de la migración:');
                console.table(rows);
            }
        });

        db.all('SELECT role_name, role_level, description FROM role_config ORDER BY role_level', (err, rows) => {
            if (err) {
                console.error('Error verificando configuración de roles:', err);
            } else {
                console.log('\n🔐 Configuración de roles:');
                console.table(rows);
            }
            
            // Cerrar conexión
            db.close((err) => {
                if (err) {
                    console.error('Error cerrando la base de datos:', err.message);
                } else {
                    console.log('\n🎉 Migración completada exitosamente');
                    console.log('✅ Conexión a la base de datos cerrada');
                }
            });
        });

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error);
        process.exit(1);
    }
}

// Iniciar migración
migrate();
EOF

    echo "✅ Script de migración Node.js creado: migrate_roles.js"

    # 5. Ejecutar migración
    echo "⚡ 5/5 - Ejecutando migración..."
    
    if command -v node >/dev/null 2>&1; then
        node migrate_roles.js
    else
        echo "⚠️  Node.js no encontrado. Ejecuta manualmente:"
        echo "   cd $BACKEND_DIR"
        echo "   node migrate_roles.js"
    fi

    echo ""
    echo "✅ ¡Migración de base de datos completada!"
    echo ""
    echo "📋 ARCHIVOS GENERADOS:"
    echo "====================="
    echo "• migration_roles_$MIGRATION_DATE.sql - Script principal de migración"
    echo "• update_users_roles_$MIGRATION_DATE.sql - Actualización de usuarios"
    echo "• migrate_roles.js - Script ejecutor Node.js"
    echo "• users.db.backup_$MIGRATION_DATE - Backup de la BD original"
    echo ""
    echo "🔧 PRÓXIMOS PASOS:"
    echo "================="
    echo "1. Verificar que la migración se ejecutó correctamente"
    echo "2. Actualizar el archivo .env con las credenciales del owner"
    echo "3. Probar el login con los diferentes roles"
    echo "4. Actualizar las rutas del backend para usar el nuevo middleware"

else
    echo ""
    echo "❌ Migración cancelada"
fi

echo ""
echo "🎯 SCRIPT DE MIGRACIÓN COMPLETADO"