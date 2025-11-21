# Sistema de Migraciones de Base de Datos

Sistema completo de migraciones para PostgreSQL y MongoDB con versionado, rollback y automatización.

## 📋 Contenido

- [Características](#características)
- [Instalación](#instalación)
- [PostgreSQL (Knex)](#postgresql-knex)
- [MongoDB (migrate-mongo)](#mongodb-migrate-mongo)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

## ✨ Características

- **Migraciones versionadas** para PostgreSQL y MongoDB
- **Rollback support** - revertir cambios fácilmente
- **Scripts automatizados** para operaciones comunes
- **Ambientes separados** (development, test, production)
- **Seeds** para datos iniciales
- **Changelog tracking** automático

## 📦 Instalación

```bash
# Instalar dependencias
cd microservices/shared/database
npm install knex@^3.1.0 migrate-mongo@^11.0.0
```

## 🐘 PostgreSQL (Knex)

### Configuración

`knexfile.js` está configurado con 3 ambientes: development, test, production.

### Comandos

```bash
# Crear nueva migración
./scripts/migrate-postgres.sh make nombre_migracion

# Aplicar migraciones
./scripts/migrate-postgres.sh latest

# Ver estado
./scripts/migrate-postgres.sh status

# Revertir última migración
./scripts/migrate-postgres.sh down

# Rollback último batch
./scripts/migrate-postgres.sh rollback
```

### Ejemplo de Migración

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('user_preferences', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('preferences').defaultTo('{}');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_preferences');
};
```

## 🍃 MongoDB (migrate-mongo)

### Configuración

`migrate-mongo-config.js` configura conexión y directorio de migraciones.

### Comandos

```bash
# Crear nueva migración
./scripts/migrate-mongo.sh create nombre_migracion

# Aplicar migraciones
./scripts/migrate-mongo.sh up

# Ver estado
./scripts/migrate-mongo.sh status

# Revertir última migración
./scripts/migrate-mongo.sh down
```

### Ejemplo de Migración

```javascript
module.exports = {
  async up(db, client) {
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category_id: 1, active: 1 });
  },

  async down(db, client) {
    await db.collection('products').dropIndex('name_text_description_text');
    await db.collection('products').dropIndex('category_id_1_active_1');
  }
};
```

## ✅ Mejores Prácticas

1. **Nombrar migraciones descriptivamente**
2. **Siempre implementar down()**
3. **Probar en development antes de production**
4. **Hacer backup antes de migraciones grandes**
5. **Mantener migraciones pequeñas y enfocadas**

## 🔧 Troubleshooting

### Migración bloqueada

```bash
./scripts/migrate-postgres.sh unlock
```

### Ver migraciones aplicadas

```bash
./scripts/migrate-postgres.sh list
```

---

**Versión**: 3.0.0
**Autor**: Flores Victoria Development Team
