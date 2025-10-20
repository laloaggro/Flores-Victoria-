# Casos de Uso y Ejemplos de Flores Victoria

## Índice

1. [Introducción](#introducción)
2. [Casos de Uso del Cliente](#casos-de-uso-del-cliente)
3. [Casos de Uso del Administrador](#casos-de-uso-del-administrador)
4. [Casos de Uso Técnicos](#casos-de-uso-técnicos)
5. [Escenarios de Negocio](#escenarios-de-negocio)
6. [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)

## Introducción

Esta documentación presenta casos de uso detallados y ejemplos prácticos de cómo se utiliza la plataforma Flores Victoria en diferentes contextos. Los casos de uso describen interacciones específicas entre usuarios y el sistema, mientras que los ejemplos proporcionan implementaciones concretas de funcionalidades.

## Casos de Uso del Cliente

### CU-001: Compra de Flores para San Valentín

**Actor Principal**: Cliente
**Nivel**: Usuario
**Propósito**: Comprar un ramo de rosas para San Valentín

**Precondiciones**:
- El cliente tiene acceso a internet
- El cliente tiene una cuenta bancaria válida
- Hay disponibilidad de productos en el inventario

**Curso Normal**:
1. El cliente visita el sitio web de Flores Victoria el 10 de febrero
2. El cliente busca "ramo de rosas rojas" en la barra de búsqueda
3. El sistema muestra resultados de búsqueda
4. El cliente selecciona un ramo de rosas rojas de 12 unidades
5. El cliente agrega el producto al carrito de compras
6. El cliente procede al checkout
7. El cliente ingresa sus datos de envío:
   - Dirección: Calle Principal 123, Ciudad
   - Fecha de entrega: 14 de febrero
   - Hora de entrega: 2:00 PM - 4:00 PM
8. El cliente ingresa sus datos de pago
9. El cliente confirma el pedido
10. El sistema procesa el pago y envía confirmación por correo

**Cursos Alternos**:
- **3A**: Si no hay resultados, el sistema sugiere productos similares
- **7A**: Si la fecha seleccionada no está disponible, el sistema muestra fechas alternativas
- **8A**: Si el pago es rechazado, el sistema solicita método de pago alternativo

**Curso de Excepción**:
- **E1**: Si el producto no está disponible, se notifica al cliente y se sugieren alternativas

**Postcondiciones**:
- El pedido se crea en el sistema
- El cliente recibe confirmación por correo
- El inventario se actualiza

### CU-002: Registro de Nuevo Cliente

**Actor Principal**: Cliente
**Nivel**: Usuario
**Propósito**: Registrar una nueva cuenta en la plataforma

**Precondiciones**:
- El cliente no tiene cuenta registrada
- El cliente tiene acceso a correo electrónico válido

**Curso Normal**:
1. El cliente hace clic en "Registrarse"
2. El cliente completa el formulario con:
   - Nombre
   - Apellido
   - Correo electrónico
   - Contraseña
3. El cliente acepta términos y condiciones
4. El cliente hace clic en "Crear Cuenta"
5. El sistema envía correo de verificación
6. El cliente hace clic en enlace de verificación
7. El sistema activa la cuenta y redirige al cliente

**Cursos Alternos**:
- **2A**: Si el correo ya está registrado, se muestra mensaje de error
- **3A**: Si no se aceptan términos, el botón de registro está deshabilitado
- **5A**: Si el correo no llega en 5 minutos, el cliente puede solicitar reenvío

**Curso de Excepción**:
- **E1**: Si el sistema de correo falla, se registra el error y se notifica al administrador

**Postcondiciones**:
- El cliente tiene cuenta activa
- El cliente puede iniciar sesión
- Se envía correo de bienvenida

### CU-003: Personalización de Arreglo Floral

**Actor Principal**: Cliente
**Nivel**: Usuario
**Propósito**: Solicitar un arreglo floral personalizado para evento especial

**Precondiciones**:
- El cliente tiene cuenta activa
- El cliente tiene detalles del evento

**Curso Normal**:
1. El cliente navega a "Arreglos Personalizados"
2. El cliente hace clic en "Solicitar Personalización"
3. El cliente completa formulario con:
   - Tipo de evento (boda, cumpleaños, etc.)
   - Fecha del evento
   - Colores deseados
   - Presupuesto aproximado
   - Descripción detallada
4. El cliente adjunta imágenes de referencia (opcional)
5. El cliente envía solicitud
6. El sistema notifica al equipo de diseño
7. El equipo de diseño contacta al cliente en 24 horas
8. Se coordinan detalles y se envía cotización
9. El cliente aprueba diseño y cotización
10. Se programa entrega

**Cursos Alternos**:
- **4A**: Si no tiene imágenes, puede describir detalladamente
- **7A**: Si el cliente no responde, se sigue en 48 horas
- **9A**: Si el cliente solicita cambios, se repite proceso

**Curso de Excepción**:
- **E1**: Si la fecha es muy próxima, se notifica al cliente

**Postcondiciones**:
- Solicitud registrada en sistema
- Cliente en proceso de personalización
- Equipo de diseño asignado

## Casos de Uso del Administrador

### CU-004: Gestión de Productos

**Actor Principal**: Administrador
**Nivel**: Administrador
**Propósito**: Administrar el catálogo de productos

**Precondiciones**:
- El administrador tiene cuenta con permisos de administración
- El administrador está en el panel de administración

**Curso Normal**:
1. El administrador inicia sesión en panel de administración
2. El administrador navega a "Gestión de Productos"
3. El administrador puede:
   - Ver lista de productos
   - Agregar nuevo producto
   - Editar producto existente
   - Eliminar producto
4. Para agregar producto:
   - Hace clic en "Agregar Producto"
   - Completa formulario con nombre, descripción, precio, categoría, inventario
   - Sube imágenes del producto
   - Guarda producto
5. Para editar producto:
   - Busca producto en lista
   - Hace clic en "Editar"
   - Modifica información necesaria
   - Guarda cambios
6. Para eliminar producto:
   - Busca producto en lista
   - Hace clic en "Eliminar"
   - Confirma eliminación

**Cursos Alternos**:
- **4A**: Si falta información requerida, se muestra mensaje de error
- **5A**: Si hay error al subir imágenes, se permite reintentar
- **6A**: Si el producto tiene pedidos asociados, se desactiva en lugar de eliminar

**Curso de Excepción**:
- **E1**: Si hay error en base de datos, se registra y muestra mensaje al administrador

**Postcondiciones**:
- Catálogo de productos actualizado
- Cambios reflejados en sitio web
- Inventario actualizado

### CU-005: Procesamiento de Pedidos

**Actor Principal**: Administrador
**Nivel**: Administrador
**Propósito**: Procesar y gestionar pedidos de clientes

**Precondiciones**:
- El administrador tiene cuenta con permisos de administración
- Hay pedidos pendientes en el sistema

**Curso Normal**:
1. El administrador inicia sesión en panel de administración
2. El administrador navega a "Gestión de Pedidos"
3. El sistema muestra lista de pedidos con estados
4. El administrador selecciona pedido pendiente
5. El administrador verifica:
   - Información del cliente
   - Productos solicitados
   - Dirección de envío
   - Método de pago
6. El administrador actualiza estado a "Procesando"
7. El administrador asigna pedido a personal de preparación
8. Cuando el pedido está listo, el administrador actualiza estado a "Enviado"
9. El sistema notifica al cliente del envío
10. Cuando el cliente confirma entrega, el administrador actualiza estado a "Entregado"

**Cursos Alternos**:
- **6A**: Si hay problema con pago, se contacta al cliente
- **8A**: Si hay problema de envío, se actualiza estado a "Con Problemas"
- **10A**: Si no hay confirmación en 3 días, se marca como "Entregado" automáticamente

**Curso de Excepción**:
- **E1**: Si el cliente cancela pedido, se procesa reembolso
- **E2**: Si hay problema con producto, se contacta al proveedor

**Postcondiciones**:
- Pedido procesado correctamente
- Cliente notificado en cada etapa
- Inventario actualizado
- Métricas de ventas actualizadas

## Casos de Uso Técnicos

### CU-006: Integración con Sistema de Pagos

**Actor Principal**: Sistema de Pagos (Stripe/PayPal)
**Nivel**: Sistema
**Propósito**: Procesar pagos de clientes de forma segura

**Precondiciones**:
- El cliente ha completado el proceso de checkout
- El sistema de pagos está configurado y operativo
- Hay conectividad con proveedor de pagos

**Curso Normal**:
1. El cliente confirma pedido y es redirigido al sistema de pagos
2. El sistema genera token de pago con:
   - Monto total
   - Moneda
   - Descripción del pedido
   - URL de retorno
3. El cliente ingresa datos de tarjeta de crédito
4. El sistema de pagos valida datos:
   - Número de tarjeta
   - Fecha de expiración
   - Código de seguridad
5. El sistema de pagos autoriza transacción con banco
6. El banco responde con aprobación o rechazo
7. El sistema de pagos notifica resultado a Flores Victoria
8. Si es aprobado:
   - Se genera recibo de pago
   - Se actualiza estado del pedido
   - Se notifica al cliente
9. Si es rechazado:
   - Se notifica al cliente
   - Se permite intento de pago alternativo

**Cursos Alternos**:
- **4A**: Si datos son inválidos, se solicitan correcciones
- **5A**: Si hay timeout, se reintenta hasta 3 veces
- **8A**: Si hay error interno, se marca para revisión manual

**Curso de Excepción**:
- **E1**: Si el proveedor de pagos está fuera de servicio, se ofrecen métodos alternativos
- **E2**: Si se detecta actividad fraudulenta, se bloquea transacción

**Postcondiciones**:
- Pago procesado o rechazado
- Pedido actualizado según resultado
- Cliente notificado del resultado

### CU-007: Sincronización de Inventario

**Actor Principal**: Sistema de Inventario
**Nivel**: Sistema
**Propósito**: Mantener inventario actualizado en tiempo real

**Precondiciones**:
- Productos registrados en base de datos
- Sistema de inventario operativo
- Conectividad entre microservicios

**Curso Normal**:
1. Cuando se crea un pedido:
   - El sistema reserva unidades de inventario
   - Se actualiza stock temporalmente
2. Cuando se confirma el pedido:
   - Se descuentan unidades del inventario
   - Se actualiza stock permanentemente
3. Cuando se cancela un pedido:
   - Se liberan unidades reservadas
   - Se restaura stock original
4. Sistema verifica inventario cada hora:
   - Compara stock físico con stock en sistema
   - Genera alertas para productos bajos
5. Sistema notifica a administradores:
   - Cuando stock está por debajo del mínimo
   - Cuando hay productos agotados

**Cursos Alternos**:
- **1A**: Si no hay suficiente stock, se notifica al cliente
- **4A**: Si hay discrepancias, se generan reportes
- **5A**: Para productos críticos, se notifica inmediatamente

**Curso de Excepción**:
- **E1**: Si hay error en base de datos, se registra y notifica
- **E2**: Si servicio de inventario falla, se usa cache temporal

**Postcondiciones**:
- Inventario actualizado en tiempo real
- Alertas generadas según niveles
- Reportes disponibles para administración

## Escenarios de Negocio

### Escenario 1: Temporada Alta (Día de las Madres)

**Contexto**: Mayo, temporada alta para ventas de flores

**Características**:
- Aumento del 300% en tráfico web
- Mayor demanda de productos específicos
- Necesidad de procesar más pedidos
- Requerimientos de entrega más exigentes

**Preparación**:
1. Aumentar capacidad de servidores en 50%
2. Preparar inventario adicional (200% del promedio)
3. Contratar personal temporal para preparación de pedidos
4. Coordinar con proveedores para entregas más frecuentes
5. Preparar promociones especiales

**Ejecución**:
1. Monitorear métricas en tiempo real
2. Ajustar inventario según demanda
3. Priorizar pedidos por fecha de entrega
4. Coordinar entregas con mayor anticipación
5. Atender servicio al cliente con mayor personal

**Resultados Esperados**:
- Procesar 500 pedidos diarios (vs 150 normal)
- Mantener tiempo de entrega promedio < 4 horas
- Satisfacción del cliente > 95%
- Inventario suficiente para demanda

### Escenario 2: Lanzamiento de Nueva Categoría

**Contexto**: Lanzamiento de plantas ornamentales

**Características**:
- Nuevos productos sin historial de ventas
- Necesidad de educar al mercado
- Riesgo de sobre-inventario
- Oportunidad de expansión de mercado

**Preparación**:
1. Investigar mercado objetivo
2. Seleccionar proveedores confiables
3. Preparar contenido educativo
4. Crear campañas de marketing
5. Inventario inicial conservador

**Ejecución**:
1. Lanzamiento gradual en región piloto
2. Monitorear respuesta del mercado
3. Ajustar estrategia según resultados
4. Escalar a otras regiones
5. Optimizar contenido y promociones

**Resultados Esperados**:
- 15% de participación en categoría en 6 meses
- 20% de nuevos clientes
- 85% de satisfacción con nuevos productos
- Rentabilidad positiva en 3 meses

## Flujos de Trabajo Comunes

### Flujo 1: Proceso de Compra Completo

1. **Navegación**:
   - Cliente visita sitio web
   - Busca productos por categoría o búsqueda
   - Filtra resultados por precio, popularidad, etc.

2. **Selección**:
   - Cliente hace clic en producto de interés
   - Revisa detalles, imágenes, reseñas
   - Selecciona cantidad y opciones
   - Agrega al carrito

3. **Checkout**:
   - Cliente revisa carrito
   - Ingresa o confirma datos de envío
   - Selecciona método de entrega
   - Ingresa datos de pago
   - Confirma pedido

4. **Procesamiento**:
   - Sistema valida pago
   - Crea pedido en base de datos
   - Notifica a sistemas internos
   - Envía confirmación al cliente

5. **Preparación**:
   - Equipo de preparación recibe notificación
   - Prepara productos solicitados
   - Empaca para envío
   - Actualiza estado del pedido

6. **Entrega**:
   - Producto entregado al servicio de mensajería
   - Cliente recibe seguimiento
   - Entrega realizada
   - Cliente confirma recepción

7. **Postventa**:
   - Sistema solicita reseña
   - Cliente puede contactar soporte
   - Producto disponible para futuras compras

### Flujo 2: Gestión de Producto por Administrador

1. **Creación**:
   - Administrador accede al panel
   - Selecciona "Agregar Producto"
   - Completa formulario con:
     - Nombre y descripción
     - Precio y categoría
     - Inventario inicial
     - Imágenes del producto
   - Guarda producto

2. **Publicación**:
   - Sistema valida datos
   - Producto se publica en sitio web
   - Se indexa en búsquedas
   - Se muestra en categorías

3. **Monitoreo**:
   - Sistema rastrea ventas
   - Genera reportes de desempeño
   - Alerta sobre inventario bajo
   - Notifica sobre problemas

4. **Actualización**:
   - Administrador revisa desempeño
   - Ajusta precio si necesario
   - Actualiza descripción o imágenes
   - Modifica inventario

5. **Retiro**:
   - Producto marcado como descontinuado
   - Se deja de mostrar en sitio
   - Se liquidan unidades restantes
   - Se archiva información

## Ejemplos de Implementación

### Ejemplo 1: Sistema de Recomendaciones

```javascript
// Servicio de recomendaciones basado en historial de compras
class RecommendationService {
  constructor() {
    this.db = require('../config/database');
  }

  async getRecommendations(userId) {
    try {
      // Obtener historial de compras del usuario
      const userPurchases = await this.getUserPurchases(userId);
      
      // Obtener categorías favoritas
      const favoriteCategories = this.getFavoriteCategories(userPurchases);
      
      // Obtener productos comprados por otros usuarios con intereses similares
      const similarUsersProducts = await this.getSimilarUsersProducts(userId, favoriteCategories);
      
      // Combinar y ordenar recomendaciones
      const recommendations = this.combineRecommendations(
        favoriteCategories, 
        similarUsersProducts
      );
      
      return recommendations.slice(0, 10); // Máximo 10 recomendaciones
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      return [];
    }
  }
  
  async getUserPurchases(userId) {
    const query = `
      SELECT p.category, p.id, o.created_at
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT 20
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }
  
  getFavoriteCategories(purchases) {
    const categoryCount = {};
    
    purchases.forEach(purchase => {
      categoryCount[purchase.category] = (categoryCount[purchase.category] || 0) + 1;
    });
    
    return Object.keys(categoryCount)
      .sort((a, b) => categoryCount[b] - categoryCount[a])
      .slice(0, 3); // Top 3 categorías
  }
  
  async getSimilarUsersProducts(userId, categories) {
    const query = `
      SELECT p.*, COUNT(*) as popularity
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id != $1 
      AND p.category = ANY($2)
      AND p.id NOT IN (
        SELECT DISTINCT oi2.product_id
        FROM order_items oi2
        JOIN orders o2 ON oi2.order_id = o2.id
        WHERE o2.user_id = $1
      )
      GROUP BY p.id
      ORDER BY popularity DESC
      LIMIT 15
    `;
    
    const result = await this.db.query(query, [userId, categories]);
    return result.rows;
  }
  
  combineRecommendations(categories, similarProducts) {
    // Priorizar productos de categorías favoritas
    const categoryPriority = {};
    categories.forEach((category, index) => {
      categoryPriority[category] = categories.length - index;
    });
    
    return similarProducts
      .map(product => ({
        ...product,
        score: product.popularity * (categoryPriority[product.category] || 1)
      }))
      .sort((a, b) => b.score - a.score);
  }
}

module.exports = RecommendationService;
```

### Ejemplo 2: Sistema de Notificaciones

```javascript
// Sistema de notificaciones multi-canal
class NotificationService {
  constructor() {
    this.emailService = require('./emailService');
    this.smsService = require('./smsService');
    this.pushService = require('./pushService');
  }

  async sendOrderConfirmation(order) {
    const notificationData = {
      orderId: order.id,
      customerName: order.customer.name,
      orderTotal: order.total,
      deliveryDate: order.delivery_date,
      items: order.items
    };

    // Enviar correo electrónico
    await this.emailService.send({
      to: order.customer.email,
      subject: `Confirmación de Pedido #${order.id}`,
      template: 'order-confirmation',
      data: notificationData
    });

    // Enviar SMS si es pedido urgente
    if (order.isUrgent) {
      await this.smsService.send({
        to: order.customer.phone,
        message: `Su pedido #${order.id} ha sido confirmado. Entrega programada para ${order.delivery_date}`
      });
    }

    // Enviar notificación push si la app está instalada
    await this.pushService.send({
      userId: order.customer.id,
      title: 'Pedido Confirmado',
      body: `Su pedido #${order.id} está siendo procesado`,
      data: { orderId: order.id, type: 'order_confirmation' }
    });
  }

  async sendDeliveryUpdate(order, status) {
    const statusMessages = {
      'preparing': 'Estamos preparando su pedido',
      'shipped': 'Su pedido ha sido enviado',
      'out_for_delivery': 'Su pedido está en camino',
      'delivered': 'Su pedido ha sido entregado'
    };

    const notificationData = {
      orderId: order.id,
      status: status,
      message: statusMessages[status],
      estimatedTime: order.estimated_delivery_time
    };

    // Enviar todas las notificaciones
    await Promise.all([
      this.emailService.send({
        to: order.customer.email,
        subject: `Actualización de Pedido #${order.id}`,
        template: 'order-status-update',
        data: notificationData
      }),
      
      this.smsService.send({
        to: order.customer.phone,
        message: `Pedido #${order.id}: ${statusMessages[status]}`
      }),
      
      this.pushService.send({
        userId: order.customer.id,
        title: 'Actualización de Pedido',
        body: statusMessages[status],
        data: { orderId: order.id, type: 'order_status', status: status }
      })
    ]);
  }
}

module.exports = NotificationService;
```

### Ejemplo 3: Sistema de Personalización

```javascript
// Sistema de personalización de experiencia de usuario
class PersonalizationService {
  constructor() {
    this.db = require('../config/database');
    this.cache = require('../utils/cache');
  }

  async getUserPreferences(userId) {
    // Intentar obtener de cache primero
    const cached = await this.cache.get(`user_prefs_${userId}`);
    if (cached) {
      return cached;
    }

    try {
      // Obtener preferencias del usuario
      const preferences = await this.fetchUserPreferences(userId);
      
      // Cachear por 1 hora
      await this.cache.set(`user_prefs_${userId}`, preferences, 3600);
      
      return preferences;
    } catch (error) {
      console.error('Error obteniendo preferencias de usuario:', error);
      // Retornar preferencias por defecto
      return this.getDefaultPreferences();
    }
  }

  async fetchUserPreferences(userId) {
    const queries = {
      // Categorías favoritas basadas en compras
      favoriteCategories: `
        SELECT p.category, COUNT(*) as purchase_count
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = $1
        GROUP BY p.category
        ORDER BY purchase_count DESC
        LIMIT 5
      `,
      
      // Colores preferidos
      favoriteColors: `
        SELECT color, COUNT(*) as selection_count
        FROM (
          SELECT unnest(string_to_array(preferred_colors, ',')) as color
          FROM user_profiles
          WHERE user_id = $1
        ) colors
        GROUP BY color
        ORDER BY selection_count DESC
      `,
      
      // Horarios de compra preferidos
      preferredTimes: `
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as frequency
        FROM orders
        WHERE user_id = $1
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY frequency DESC
        LIMIT 3
      `
    };

    const results = {};

    // Ejecutar todas las consultas en paralelo
    const [categories, colors, times] = await Promise.all([
      this.db.query(queries.favoriteCategories, [userId]),
      this.db.query(queries.favoriteColors, [userId]),
      this.db.query(queries.preferredTimes, [userId])
    ]);

    results.favoriteCategories = categories.rows.map(row => row.category);
    results.favoriteColors = colors.rows.map(row => row.color);
    results.preferredTimes = times.rows.map(row => parseInt(row.hour));

    return results;
  }

  getDefaultPreferences() {
    return {
      favoriteCategories: ['rosas', 'arreglos', 'plantas'],
      favoriteColors: ['rojo', 'blanco', 'rosa'],
      preferredTimes: [10, 15, 18] // 10AM, 3PM, 6PM
    };
  }

  async personalizeHomepage(userId) {
    const preferences = await this.getUserPreferences(userId);
    
    // Obtener productos recomendados basados en preferencias
    const recommendedProducts = await this.getRecommendedProducts(preferences);
    
    // Obtener ofertas especiales
    const specialOffers = await this.getSpecialOffers(preferences);
    
    // Personalizar banners y promociones
    const personalizedContent = await this.getPersonalizedContent(preferences);
    
    return {
      recommendedProducts,
      specialOffers,
      personalizedContent,
      layout: this.getPersonalizedLayout(preferences)
    };
  }

  async getRecommendedProducts(preferences) {
    const query = `
      SELECT p.*, 
             COUNT(oi.id) as popularity_score
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      WHERE p.category = ANY($1)
         OR p.primary_color = ANY($2)
      GROUP BY p.id
      ORDER BY popularity_score DESC, p.created_at DESC
      LIMIT 12
    `;
    
    const result = await this.db.query(query, [
      preferences.favoriteCategories,
      preferences.favoriteColors
    ]);
    
    return result.rows;
  }

  async getSpecialOffers(preferences) {
    // Lógica para obtener ofertas basadas en preferencias
    // Esta es una implementación simplificada
    return [];
  }

  async getPersonalizedContent(preferences) {
    // Lógica para obtener contenido personalizado
    return {
      welcomeMessage: `¡Hola de nuevo!`,
      specialPromotion: `Basado en tus compras anteriores`
    };
  }

  getPersonalizedLayout(preferences) {
    // Determinar layout basado en comportamiento del usuario
    return {
      heroBannerPosition: 'top',
      recommendedSection: 'prominent',
      colorScheme: preferences.favoriteColors[0] || 'green'
    };
  }
}

module.exports = PersonalizationService;
```

Esta documentación de casos de uso y ejemplos proporciona una visión completa de cómo se utiliza la plataforma Flores Victoria en diferentes contextos, tanto desde la perspectiva del usuario como del administrador, incluyendo aspectos técnicos y de negocio.