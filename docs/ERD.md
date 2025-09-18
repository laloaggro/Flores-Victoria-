# Diagrama Entidad-Relación (ERD) - Arreglos Victoria

## Entidades y sus atributos

### 1. Usuarios (users)
- **id** (INTEGER, PK, AUTOINCREMENT)
- **name** (TEXT, NOT NULL)
- **email** (TEXT, UNIQUE, NOT NULL)
- **phone** (TEXT)
- **password** (TEXT)
- **google_id** (TEXT)
- **role** (TEXT, DEFAULT 'user')
- **created_at** (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- **image_url** (TEXT)

### 2. Productos (products)
- **id** (INTEGER, PK, AUTOINCREMENT)
- **name** (TEXT, NOT NULL)
- **description** (TEXT)
- **price** (REAL, NOT NULL)
- **image_url** (TEXT)
- **category** (TEXT)
- **created_at** (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### 3. Registros de inicio de sesión (login_logs)
- **id** (INTEGER, PK, AUTOINCREMENT)
- **user_id** (INTEGER, FK references users.id)
- **login_method** (TEXT, NOT NULL)
- **login_time** (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- **ip_address** (TEXT)
- **user_agent** (TEXT)

### 4. Carrito de compras (cart)
- **id** (INTEGER, PK, AUTOINCREMENT)
- **user_id** (INTEGER, FK references users.id, ON DELETE CASCADE)
- **product_id** (INTEGER, FK references products.id, ON DELETE CASCADE)
- **quantity** (INTEGER, NOT NULL, DEFAULT 1)
- **added_at** (DATETIME, DEFAULT CURRENT_TIMESTAMP)

### 5. Lista de deseos (wishlist)
- **id** (INTEGER, PK, AUTOINCREMENT)
- **user_id** (INTEGER, FK references users.id, ON DELETE CASCADE)
- **product_id** (INTEGER, FK references products.id, ON DELETE CASCADE)
- **added_at** (DATETIME, DEFAULT CURRENT_TIMESTAMP)

## Relaciones

1. **Usuarios - Registros de inicio de sesión**: 
   - Un usuario puede tener muchos registros de inicio de sesión (1:N)
   - Relación: users.id → login_logs.user_id

2. **Usuarios - Carrito de compras**: 
   - Un usuario puede tener muchos productos en su carrito (1:N)
   - Relación: users.id → cart.user_id

3. **Productos - Carrito de compras**: 
   - Un producto puede estar en el carrito de muchos usuarios (N:1)
   - Relación: products.id → cart.product_id

4. **Usuarios - Lista de deseos**: 
   - Un usuario puede tener muchos productos en su lista de deseos (1:N)
   - Relación: users.id → wishlist.user_id

5. **Productos - Lista de deseos**: 
   - Un producto puede estar en la lista de deseos de muchos usuarios (N:1)
   - Relación: products.id → wishlist.product_id

6. **Usuarios - Carrito (restricción única)**:
   - Un usuario no puede tener el mismo producto más de una vez en su carrito
   - Restricción: UNIQUE(user_id, product_id) en la tabla cart

7. **Usuarios - Lista de deseos (restricción única)**:
   - Un usuario no puede tener el mismo producto más de una vez en su lista de deseos
   - Restricción: UNIQUE(user_id, product_id) en la tabla wishlist

## Diagrama visual (representación textual)

```
[Usuarios]
id (PK) ◄──────────────────┐
name                       │
email                      │
phone                      │
password                   │
google_id                  │
role                       │
created_at                 │
image_url                  │
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
[Registros de inicio]  [Carrito]       [Lista de deseos]
user_id (FK) ────────► user_id (FK) ─────────► user_id (FK)
login_method           product_id (FK) ───────► product_id (FK)
login_time             quantity               added_at
ip_address
user_agent

[Productos]
id (PK) ◄──────────────────┐
name                       │
description                │
price                      │
image_url                  │
category                   │
created_at                 │
                           │
           ┌───────────────┘
           ▼
       product_id (FK)
```

## Descripción de las relaciones

### Usuarios (users)
La tabla de usuarios almacena información sobre todos los usuarios registrados en el sistema, incluyendo clientes y administradores. Los usuarios pueden registrarse mediante correo electrónico y contraseña o mediante autenticación de Google.

### Productos (products)
La tabla de productos contiene información sobre los artículos disponibles para la venta en la tienda, incluyendo nombre, descripción, precio, categoría e imagen.

### Registros de inicio de sesión (login_logs)
Esta tabla registra cada intento de inicio de sesión de los usuarios, incluyendo el método utilizado (normal o Google), la fecha y hora, y la dirección IP del cliente.

### Carrito de compras (cart)
La tabla del carrito almacena los productos que los usuarios han agregado a su carrito de compras. Cada entrada representa un producto en el carrito de un usuario específico con una cantidad determinada.

### Lista de deseos (wishlist)
La tabla de lista de deseos almacena los productos que los usuarios han marcado como favoritos. Cada entrada representa un producto en la lista de deseos de un usuario específico.

## Consideraciones técnicas

1. **Contraseñas**: Las contraseñas se almacenan en forma de hash utilizando bcrypt para seguridad.
2. **Autenticación de Google**: Los usuarios que inician sesión con Google tienen un google_id único en lugar de una contraseña.
3. **Cascadas**: Las relaciones con las tablas cart y wishlist utilizan ON DELETE CASCADE, lo que significa que cuando se elimina un usuario, también se eliminan sus entradas en el carrito y la lista de deseos.
4. **Restricciones únicas**: Se aplican restricciones únicas para evitar que un usuario tenga el mismo producto más de una vez en su carrito o lista de deseos.