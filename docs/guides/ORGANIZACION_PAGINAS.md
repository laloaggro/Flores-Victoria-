# 📋 ORGANIZACIÓN DE PÁGINAS - FLORES VICTORIA

## 📊 RESUMEN EJECUTIVO

- **Total de páginas:** 150
- **Páginas duplicadas:** ~40% (necesitan limpieza)
- **Páginas funcionales:** ~90 (60%)
- **Estructura:** Bien organizada por carpetas pero con duplicados

---

## 🎯 CATEGORIZACIÓN PRINCIPAL

### 1. **PÁGINAS PRINCIPALES (Core)**

- `index.html` - Página principal
- `products.html` - Catálogo de productos
- `sistema-contable.html` - Sistema contable

### 2. **SITIO CLIENTE (frontend/pages/)**

```
📁 auth/           - Autenticación (5 páginas)
📁 shop/           - Tienda (5 páginas)
📁 user/           - Usuario (5 páginas)
📁 info/           - Información (3 páginas)
📁 legal/          - Legal (2 páginas)
📁 support/        - Soporte (2 páginas)
📁 wishlist/       - Lista deseos (8 páginas - DUPLICADAS)
```

### 3. **PANELES ADMINISTRATIVOS**

```
📁 admin/          - Admin general (5 páginas)
📁 owner/          - Dueño (1 página)
📁 worker/         - Empleados (1 página)
📁 accounting/     - Contabilidad (1 página)
```

### 4. **ADMIN PANEL SEPARADO (admin-panel/)**

```
📁 orders/         - Gestión pedidos (5 páginas)
📁 products/       - Gestión productos (3 páginas)
📁 users/          - Gestión usuarios (2 páginas)
📁 reports/        - Reportes (3 páginas)
📁 reviews/        - Reseñas (1 página)
📁 settings/       - Configuración (1 página)
```

### 5. **PÁGINAS DE DESARROLLO**

```
📁 dev/            - Desarrollo (3 páginas)
📁 dist/           - Distribución (32 páginas - BUILD)
📁 public/         - Públicas (5 páginas)
```

---

## 🚨 PROBLEMAS IDENTIFICADOS

### **DUPLICADOS CRÍTICOS:**

1. **Wishlist:** 8 versiones diferentes
2. **Admin pages:** Duplicadas en /dist/ y /pages/
3. **Dashboards:** 3 versiones diferentes
4. **Authentication:** Páginas en /dist/ y /pages/

### **ARCHIVOS OBSOLETOS:**

- `index-simple.html`
- `index-old.html`
- `test.html`
- `test-styles.html`

---

## 📋 PLAN DE LIMPIEZA

### **FASE 1: ELIMINAR DUPLICADOS**

- Mantener solo `/pages/` como fuente principal
- Eliminar contenido `/dist/` (es build)
- Consolidar wishlist a 1 versión final

### **FASE 2: REORGANIZAR ESTRUCTURA**

```
flores-victoria/
├── frontend/
│   ├── src/                    # Código fuente
│   ├── pages/                  # Páginas organizadas
│   ├── public/                 # Assets públicos
│   └── dist/                   # Build (auto-generado)
├── admin-panel/
│   ├── src/                    # Panel admin
│   └── public/                 # Build admin
└── docs/                       # Documentación
```

### **FASE 3: CREAR ÍNDICES**

- Página de navegación principal
- Mapas de sitio actualizados
- Documentación de rutas

---

## 🎯 PÁGINAS PRIORITARIAS (TOP 20)

### **CLIENTES:**

1. `index.html` - Homepage
2. `pages/shop/products.html` - Catálogo
3. `pages/shop/product-detail.html` - Detalle producto
4. `pages/shop/cart.html` - Carrito
5. `pages/shop/checkout.html` - Checkout
6. `pages/auth/login.html` - Login
7. `pages/auth/register.html` - Registro
8. `pages/user/profile.html` - Perfil
9. `pages/user/orders.html` - Pedidos
10. `pages/info/contact.html` - Contacto

### **ADMINISTRACIÓN:**

11. `pages/admin/dashboard.html` - Dashboard admin
12. `pages/owner/dashboard.html` - Dashboard dueño
13. `pages/accounting/dashboard.html` - Contabilidad
14. `admin-panel/index.html` - Panel principal
15. `admin-panel/orders/index.html` - Gestión pedidos
16. `admin-panel/products/index.html` - Gestión productos
17. `admin-panel/users/index.html` - Gestión usuarios
18. `admin-panel/reports/index.html` - Reportes
19. `admin-panel/dashboard-visual.html` - Dashboard visual
20. `sistema-contable.html` - Sistema contable

---

## 📈 ESTADÍSTICAS

### **Por Categoría:**

- **Tienda:** 25 páginas (17%)
- **Administración:** 30 páginas (20%)
- **Autenticación:** 10 páginas (7%)
- **Usuario:** 15 páginas (10%)
- **Desarrollo:** 35 páginas (23%)
- **Otros:** 35 páginas (23%)

### **Por Estado:**

- **Funcionales:** 90 páginas (60%)
- **Duplicadas:** 40 páginas (27%)
- **Obsoletas:** 20 páginas (13%)

---

## 🚀 PRÓXIMOS PASOS

1. **INMEDIATO:** Crear página de navegación
2. **CORTO PLAZO:** Eliminar duplicados
3. **MEDIANO PLAZO:** Reorganizar estructura
4. **LARGO PLAZO:** Automatizar builds

---

_Última actualización: 23 de octubre de 2025_ _Total páginas analizadas: 150_
