# 🗺️ Roadmap de Implementación - Sitemap Completo Floristería

**Fecha**: 25 Octubre 2025  
**Versión Actual**: 4.0.0  
**Objetivo**: Implementar estructura completa de sitemap propuesta

---

## 📊 Estado Actual vs. Propuesta

### ✅ IMPLEMENTADO (Admin Panel v4.0)

#### Panel Administrativo Existente

- **Dashboard Principal** ✅
  - Métricas clave (servicios, eventos)
  - Gráficos de rendimiento
  - Acceso rápido a secciones

- **Analytics** ✅
  - KPIs en tiempo real (usuarios activos, órdenes, conversión, latencia)
  - Actualización cada 5 segundos

- **Monitoring** ✅
  - Salud de servicios (API, Auth, Payment, Order, AI)
  - Métricas del sistema (CPU, RAM, Disco, Red)
  - Entornos: Dev/Test/Prod

- **Logs en Vivo** ✅
  - Stream en tiempo real con 51 tipos de logs
  - Filtros por nivel (DEBUG, INFO, WARN, ERROR)
  - Filtros por servicio (API, Auth, Payment, etc.)
  - Ventana modal expandida
  - Exportación a .txt

- **Reportes** ✅ (Básico)
  - Dashboard contable en `/accounting/dashboard.html`
  - Valorización de inventario
  - Reportes de ventas básicos

- **Gestión de Productos** ✅ (Básico)
  - CRUD de productos en `admin/products.html`
  - 18 categorías implementadas en frontend

- **Gestión de Pedidos** ✅ (Básico)
  - Vista de pedidos en `admin/orders.html`
  - Historial básico

- **Gestión de Usuarios** ✅ (Básico)
  - CRUD de usuarios en `admin/users.html`

---

### ❌ FALTANTE (Según Sitemap Propuesto)

#### 1. Gestión de Productos (Avanzado)

**Categorías Jerárquicas**:

- ❌ Sistema de taxonomía padre > hijo
- ❌ Categorías por Tipo de Flor (subcategorías bajo "Flores Sueltas")
- ❌ Categorías por Ocasión (San Valentín, Bodas, Aniversarios, etc.)
- ❌ Categorías por Precio (Económico, Medio, Premium)
- ❌ Categorías por Estilo (Moderno, Clásico, Rústico)
- ❌ Productos de Temporada (Navidad, Primavera, etc.)

**Catálogo Detallado**:

- ❌ Flores Secas y Preservadas
- ❌ Productos Complementarios (chocolates, vinos, peluches, velas)
- ❌ Empaques y Presentación especial
- ❌ Tarjetas personalizadas

#### 2. Gestión de Inventario

- ❌ Control de stock detallado por producto
- ❌ Alertas de stock bajo (solo hay alerta básica en owner dashboard)
- ❌ Gestión de proveedores (mencionado en contable, no implementado)
- ❌ Caducidad de productos frescos
- ❌ Inventario de materiales complementarios

#### 3. Gestión de Pedidos (Avanzado)

- ❌ Estados: Pendientes, En Proceso, Completados (solo vista básica)
- ❌ Seguimiento de entregas en tiempo real
- ❌ Devoluciones y reembolsos
- ❌ Asignación de pedidos a repartidores

#### 4. Gestión de Clientes

- ❌ Base de datos estructurada de clientes
- ❌ Historial de compras por cliente
- ❌ Clientes frecuentes (segmentación)
- ❌ Programas de fidelización
- ❌ Listas de deseos
- ❌ Gestión de comentarios y reseñas

#### 5. Gestión de Eventos y Servicios

- ❌ Módulo de pedidos para bodas
- ❌ Decoración para eventos corporativos
- ❌ Suscripciones semanales/mensuales
- ❌ Servicios corporativos (contratos)
- ❌ Alquiler de plantas y decoración

#### 6. Marketing y Promociones

- ❌ Sistema de cupones y descuentos
- ❌ Campañas por email (integración MailChimp/SendGrid)
- ❌ Programas de referidos
- ❌ Ofertas especiales (flash sales)
- ❌ Integración con redes sociales
- ❌ Catálogos digitales (PDF/flipbook)

#### 7. Gestión de Contenido (CMS)

- ❌ Editor de páginas informativas
- ❌ Blog de consejos florales
- ❌ Galería de trabajos realizados (existe `/gallery.html` básico)
- ❌ Gestión de testimonios (existe `/testimonials.html` estático)
- ❌ FAQ editable (existe `/faq.html` estático)

#### 8. Reportes y Analytics (Avanzado)

- ❌ Análisis de productos más vendidos
- ❌ Comportamiento de clientes (RFM analysis)
- ❌ Métricas de marketing (ROI, CAC, LTV)
- ❌ Reportes financieros detallados
- ❌ Análisis de estacionalidad de ventas

#### 9. Configuración del Sistema

- ❌ Información de la empresa editable
- ❌ Métodos de pago administrables
- ❌ Zonas de entrega (geofencing)
- ❌ Horarios de servicio
- ❌ Políticas de la tienda editables
- ❌ Sistema de roles y permisos (existe básico)

#### 10. Gestión Logística

- ❌ Rutas de entrega optimizadas
- ❌ Gestión de repartidores (asignación, tracking)
- ❌ Tiempos de entrega estimados por zona
- ❌ Costos de envío por zona
- ❌ Integración con proveedores de logística (Chilexpress, Starken)

#### 11. Personalización

- ❌ Editor de personalización de arreglos
- ❌ Generador de tarjetas de mensaje
- ❌ Selector de empaques especiales
- ❌ Calculadora de servicios adicionales

#### 12. Servicios Especiales

- ❌ Módulo de suscripciones (frecuencia, duración)
- ❌ Consultoría floral (agenda de citas)
- ❌ Cotizador de eventos
- ❌ Presupuestos especiales

---

## 🎯 Plan de Implementación Priorizado

### 🔴 FASE 1: Crítico (0-2 meses)

#### 1.1 Sistema de Categorías Jerárquicas

**Impacto**: Alto - Mejora UX y organización del catálogo  
**Esfuerzo**: Medio (2-3 semanas)  
**Archivos**:

- `backend/models/Category.js` - Modelo con `parent_id`
- `backend/routes/categories.js` - CRUD jerárquico
- `frontend/js/components/product/CategoryTree.js` - Árbol de categorías
- `frontend/pages/admin/categories.html` - Admin de categorías

**Estructura**:

```javascript
{
  id: 1,
  name: "Flores Sueltas",
  slug: "flores-sueltas",
  parent_id: null,
  children: [
    { id: 10, name: "Rosas", parent_id: 1 },
    { id: 11, name: "Tulipanes", parent_id: 1 }
  ]
}
```

#### 1.2 Gestión de Inventario Completo

**Impacto**: Alto - Control operacional esencial  
**Esfuerzo**: Alto (3-4 semanas)  
**Archivos**:

- `backend/models/Inventory.js` - Stock, alertas, movimientos
- `backend/routes/inventory.js` - API de inventario
- `frontend/pages/admin/inventory.html` - Dashboard de inventario
- `backend/jobs/inventory-alerts.js` - Cron job para alertas

**Features**:

- Stock actual vs. stock mínimo
- Alertas automáticas (email/notificación)
- Historial de movimientos (entrada, salida, ajuste)
- Caducidad de productos frescos

#### 1.3 Gestión de Pedidos Avanzada

**Impacto**: Alto - Experiencia del cliente  
**Esfuerzo**: Alto (3-4 semanas)  
**Archivos**:

- `backend/models/Order.js` - Estados extendidos
- `backend/routes/orders.js` - Workflow de estados
- `frontend/pages/admin/orders.html` - Kanban board de pedidos
- `backend/services/order-tracking.js` - Seguimiento en tiempo real

**Estados**:

1. Recibido
2. Confirmado
3. En Preparación
4. Listo para Entrega
5. En Tránsito
6. Entregado
7. Cancelado/Devuelto

#### 1.4 Gestión de Clientes

**Impacto**: Medio-Alto - Fidelización  
**Esfuerzo**: Medio (2-3 semanas)  
**Archivos**:

- `backend/models/Customer.js` - Perfil extendido
- `backend/routes/customers.js` - API de clientes
- `frontend/pages/admin/customers.html` - CRM básico
- `backend/analytics/customer-insights.js` - RFM analysis

**Features**:

- Historial de compras
- Segmentación (frecuentes, VIP, etc.)
- Wishlist por cliente
- Notas y comentarios internos

---

### 🟠 FASE 2: Importante (2-4 meses)

#### 2.1 Marketing y Promociones

**Impacto**: Alto - Incremento de ventas  
**Esfuerzo**: Alto (4 semanas)  
**Archivos**:

- `backend/models/Coupon.js` - Cupones y descuentos
- `backend/models/Campaign.js` - Campañas de marketing
- `backend/routes/marketing.js` - API de marketing
- `frontend/pages/admin/marketing.html` - Panel de marketing
- `backend/integrations/sendgrid.js` - Email marketing

**Features**:

- Cupones: % o $, mín. compra, usos limitados
- Campañas automáticas (carritos abandonados, cumpleaños)
- Programa de referidos
- A/B testing de promociones

#### 2.2 Gestión Logística

**Impacto**: Alto - Eficiencia operacional  
**Esfuerzo**: Alto (4-5 semanas)  
**Archivos**:

- `backend/models/DeliveryRoute.js` - Rutas optimizadas
- `backend/models/Driver.js` - Repartidores
- `backend/services/route-optimizer.js` - Algoritmo de rutas
- `frontend/pages/admin/logistics.html` - Dashboard logístico
- `backend/integrations/google-maps.js` - API de mapas

**Features**:

- Zonas de entrega (polígonos en mapa)
- Costos por zona
- Asignación automática de repartidores
- Tracking en vivo (GPS)

#### 2.3 Eventos y Servicios Especiales

**Impacto**: Medio - Nuevas líneas de negocio  
**Esfuerzo**: Medio (3 semanas)  
**Archivos**:

- `backend/models/Event.js` - Eventos (bodas, corporativos)
- `backend/models/Subscription.js` - Suscripciones
- `backend/routes/events.js` - API de eventos
- `frontend/pages/admin/events.html` - Gestión de eventos
- `frontend/pages/shop/events.html` - Catálogo de eventos

**Features**:

- Cotizador de bodas
- Contratos corporativos
- Suscripciones (semanal, quincenal, mensual)
- Calendario de disponibilidad

#### 2.4 Reportes y Analytics Avanzados

**Impacto**: Medio - Toma de decisiones  
**Esfuerzo**: Medio (3 semanas)  
**Archivos**:

- `backend/analytics/sales-reports.js` - Reportes de ventas
- `backend/analytics/product-insights.js` - Análisis de productos
- `backend/analytics/customer-behavior.js` - Comportamiento de clientes
- `frontend/pages/admin/reports.html` - Dashboard de reportes

**Reportes**:

- Top 10 productos más vendidos
- Análisis ABC de inventario
- RFM de clientes (Recency, Frequency, Monetary)
- Estacionalidad de ventas
- ROI de campañas de marketing

---

### 🟡 FASE 3: Nice-to-Have (4-6 meses)

#### 3.1 CMS para Contenido

**Impacto**: Bajo-Medio - Autonomía del cliente  
**Esfuerzo**: Alto (4 semanas)  
**Archivos**:

- `backend/models/Content.js` - Páginas, posts, FAQs
- `backend/routes/cms.js` - API CMS
- `frontend/pages/admin/cms.html` - Editor de contenido
- `frontend/components/RichTextEditor.js` - Editor WYSIWYG

**Features**:

- Editor de páginas (drag & drop)
- Blog de consejos florales
- Gestión de testimonios
- FAQ editable
- Galería de trabajos

#### 3.2 Personalización Avanzada

**Impacto**: Medio - Diferenciación  
**Esfuerzo**: Medio (2-3 semanas)  
**Archivos**:

- `frontend/pages/shop/customizer.html` - Personalizador 3D
- `backend/services/customization-price.js` - Cálculo de precios
- `backend/models/CustomProduct.js` - Productos personalizados

**Features**:

- Selector de flores (tipo, cantidad, colores)
- Editor de tarjetas de mensaje
- Selector de empaques
- Vista previa 3D (Three.js)

#### 3.3 Integraciones Externas

**Impacto**: Bajo - Ecosistema  
**Esfuerzo**: Medio (3 semanas)  
**Archivos**:

- `backend/integrations/chilexpress.js` - API Chilexpress
- `backend/integrations/transbank.js` - Webpay Plus
- `backend/integrations/instagram.js` - Instagram Graph API
- `backend/integrations/whatsapp-business.js` - WhatsApp API

**Features**:

- Tracking de envíos (Chilexpress, Starken)
- Pagos (Webpay, Mercado Pago)
- Feed de Instagram en sitio
- Chat de WhatsApp Business

#### 3.4 Sistema de Roles y Permisos

**Impacto**: Bajo-Medio - Seguridad  
**Esfuerzo**: Medio (2 semanas)  
**Archivos**:

- `backend/models/Role.js` - Roles (Admin, Manager, Worker)
- `backend/middleware/rbac.js` - Control de acceso
- `frontend/pages/admin/roles.html` - Gestión de roles

**Roles**:

1. **Super Admin**: Acceso total
2. **Manager**: Productos, pedidos, clientes
3. **Worker**: Solo pedidos asignados
4. **Accountant**: Solo reportes financieros
5. **Marketing**: Solo marketing y promociones

---

## 📦 Catálogo Completo - Estructura de Datos

### Taxonomía de Categorías (3 niveles)

```javascript
// Nivel 1: Categorías principales
const mainCategories = [
  { id: 1, name: 'Ramos y Bouquets', icon: '💐' },
  { id: 2, name: 'Centros de Mesa', icon: '🌸' },
  { id: 3, name: 'Eventos Especiales', icon: '🎉' },
  { id: 4, name: 'Plantas y Macetas', icon: '🪴' },
  { id: 5, name: 'Flores Sueltas', icon: '🌹' },
  { id: 6, name: 'Preservados y Secos', icon: '🌾' },
  { id: 7, name: 'Complementos', icon: '🎁' },
  { id: 8, name: 'Servicios', icon: '📅' },
];

// Nivel 2: Subcategorías
const subCategories = {
  1: [
    // Ramos y Bouquets
    { id: 10, name: 'Ramos Clásicos', parent_id: 1 },
    { id: 11, name: 'Bouquets Modernos', parent_id: 1 },
    { id: 12, name: 'Por Ocasión', parent_id: 1 },
  ],
  3: [
    // Eventos Especiales
    { id: 30, name: 'Bodas', parent_id: 3 },
    { id: 31, name: 'Eventos Corporativos', parent_id: 3 },
    { id: 32, name: 'Eventos Sociales', parent_id: 3 },
  ],
  // ... más subcategorías
};

// Nivel 3: Atributos de filtrado
const attributes = [
  { type: 'ocasion', values: ['San Valentín', 'Aniversario', 'Cumpleaños', 'Día de la Madre'] },
  { type: 'precio', values: ['Económico', 'Medio', 'Premium'] },
  { type: 'estilo', values: ['Moderno', 'Clásico', 'Rústico', 'Tropical'] },
  { type: 'temporada', values: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Navidad'] },
];
```

### Productos Complementarios

```javascript
const complementaryProducts = [
  {
    category: 'Tarjetas y Mensajes',
    items: [
      { name: 'Tarjeta Personalizada', price: 2000 },
      { name: 'Sobre Especial', price: 1000 },
    ],
  },
  {
    category: 'Empaques',
    items: [
      { name: 'Caja Premium', price: 5000 },
      { name: 'Papel Celofán Especial', price: 3000 },
    ],
  },
  {
    category: 'Extras',
    items: [
      { name: 'Chocolates Finos (200g)', price: 8000 },
      { name: 'Vino Tinto Reserva', price: 15000 },
      { name: 'Peluche Pequeño', price: 7000 },
      { name: 'Vela Aromática', price: 6000 },
    ],
  },
];
```

---

## 🛠️ Stack Tecnológico Propuesto

### Backend (Node.js + Express)

- **ORM**: Sequelize (PostgreSQL)
- **Autenticación**: JWT + bcrypt
- **Validación**: Joi
- **Cron Jobs**: node-cron
- **Email**: SendGrid / Nodemailer
- **Pagos**: Transbank SDK
- **Logística**: Google Maps API

### Frontend

- **Componentes**: Web Components (vanilla JS)
- **State**: localStorage + Context API custom
- **Charts**: Chart.js
- **Mapas**: Leaflet.js
- **Editor**: Quill.js (WYSIWYG)
- **3D**: Three.js (personalizador)

### DevOps

- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logs**: Winston + Loki

---

## 📋 Checklist de Implementación

### Fase 1 (Crítico)

- [ ] Crear modelo `Category` con `parent_id`
- [ ] API de categorías jerárquicas (GET /categories/tree)
- [ ] Componente `CategoryTree.js`
- [ ] Admin de categorías (CRUD)
- [ ] Migrar 18 categorías actuales a jerárquicas
- [ ] Crear modelo `Inventory`
- [ ] API de inventario (stock, movimientos, alertas)
- [ ] Dashboard de inventario
- [ ] Cron job de alertas (stock bajo, caducidad)
- [ ] Extender modelo `Order` con 7 estados
- [ ] API de workflow de pedidos
- [ ] Kanban board de pedidos
- [ ] Servicio de tracking en tiempo real
- [ ] Crear modelo `Customer` extendido
- [ ] API de CRM básico
- [ ] Dashboard de clientes
- [ ] Analytics RFM

### Fase 2 (Importante)

- [ ] Crear modelo `Coupon`
- [ ] Crear modelo `Campaign`
- [ ] API de marketing
- [ ] Panel de marketing
- [ ] Integración SendGrid
- [ ] Crear modelo `DeliveryRoute`
- [ ] Crear modelo `Driver`
- [ ] Servicio de optimización de rutas
- [ ] Dashboard logístico
- [ ] Integración Google Maps
- [ ] Crear modelo `Event`
- [ ] Crear modelo `Subscription`
- [ ] API de eventos
- [ ] Panel de eventos
- [ ] Catálogo de eventos
- [ ] Reportes de ventas
- [ ] Análisis de productos
- [ ] Análisis de clientes
- [ ] Dashboard de reportes

### Fase 3 (Nice-to-Have)

- [ ] Crear modelo `Content`
- [ ] API CMS
- [ ] Editor de contenido
- [ ] Componente RichTextEditor
- [ ] Personalizador 3D
- [ ] Cálculo de precios personalizados
- [ ] Integración Chilexpress
- [ ] Integración Transbank
- [ ] Integración Instagram
- [ ] Integración WhatsApp Business
- [ ] Modelo `Role`
- [ ] Middleware RBAC
- [ ] Panel de gestión de roles

---

## 🎯 Métricas de Éxito

### KPIs por Fase

**Fase 1**:

- Reducción de stock out en 50%
- Tiempo de procesamiento de pedidos < 30 min
- Tasa de retención de clientes +15%

**Fase 2**:

- ROI de campañas de marketing > 300%
- Costos de logística -20%
- Ventas de eventos +50%

**Fase 3**:

- Tasa de personalización > 10% de pedidos
- Conversión de blog a venta > 5%
- Adopción de roles y permisos 100%

---

## 💰 Estimación de Esfuerzo

| Fase      | Módulos                | Esfuerzo (semanas) | FTE          | Costo Aprox. (USD)    |
| --------- | ---------------------- | ------------------ | ------------ | --------------------- |
| Fase 1    | 4 módulos críticos     | 10-14 semanas      | 2 devs       | $20,000 - $28,000     |
| Fase 2    | 4 módulos importantes  | 14-17 semanas      | 2 devs       | $28,000 - $34,000     |
| Fase 3    | 4 módulos nice-to-have | 11-14 semanas      | 1 dev        | $11,000 - $14,000     |
| **Total** | **12 módulos**         | **35-45 semanas**  | **2-3 devs** | **$59,000 - $76,000** |

---

## 📝 Próximos Pasos Inmediatos

1. **Validar Prioridades** con stakeholders
2. **Crear tickets** en GitHub Issues para Fase 1
3. **Diseñar base de datos** extendida (schema completo)
4. **Prototipar UI** de módulos críticos (Figma)
5. **Configurar ambiente** de desarrollo para nuevos módulos

---

**Documento vivo** - Se actualizará conforme se complete cada fase.

---

**Flores Victoria** - Roadmap v1.0  
Creado el 25 de Octubre de 2025
