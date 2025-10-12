# Esquema de Base de Datos PostgreSQL - Flores Victoria

## Descripción General

La base de datos PostgreSQL almacena datos relacionales para el sistema Flores Victoria. Incluye información de usuarios, órdenes, mensajes de contacto y otros datos estructurados.

## Tecnologías

- PostgreSQL 13
- Esquema relacional

## Esquema de la Base de Datos

### Tabla de Usuarios (users)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla de Órdenes (orders)
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla de Contactos (contacts)
```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Índices

```sql
-- Índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_contacts_status ON contacts(status);
```

## Relaciones

1. **Usuarios y Órdenes**: Una relación uno a muchos donde un usuario puede tener múltiples órdenes
2. **Usuarios y Contactos**: No hay relación directa ya que los contactos pueden ser de usuarios no registrados

## Configuración

### Variables de Entorno
- `DB_HOST`: Host de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_PORT`: Puerto de la base de datos (por defecto: 5432)

## Consideraciones de Seguridad

1. Las contraseñas se almacenan con hash bcrypt
2. Se utilizan prepared statements para prevenir inyección SQL
3. Se limitan los privilegios de los usuarios de la base de datos
4. Se utilizan conexiones SSL cuando es posible

## Consideraciones de Rendimiento

1. Se utilizan índices en columnas de búsqueda frecuente
2. Se implementa conexión pooling para manejar múltiples conexiones
3. Se utilizan consultas optimizadas con límites de resultados
4. Se actualizan estadísticas de la base de datos regularmente

## Backup y Recuperación

1. Se realizan backups diarios de la base de datos
2. Se almacenan backups en ubicación segura y separada
3. Se prueban regularmente los procedimientos de recuperación
4. Se implementa replicación para alta disponibilidad

## Mantenimiento

1. Se ejecutan tareas de mantenimiento regular (VACUUM, ANALYZE)
2. Se monitorean las consultas lentas
3. Se revisan y optimizan los índices según sea necesario
4. Se actualiza el sistema de base de datos con parches de seguridad