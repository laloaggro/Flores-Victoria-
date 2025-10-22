# Mapa Mental: Flujo de Datos en la Aplicación

## Interacción del Usuario

- **Frontend**
  - Navegador web
    - Cliente HTTP
    - Renderizado de componentes
  - Solicitudes HTTP
    - REST API
    - WebSockets para tiempo real
  - Interfaz de usuario
    - Componentes reactivos
    - Estado de la aplicación

- **API Gateway**
  - Punto de entrada
    - Único endpoint público
    - Enmascaramiento de servicios internos
  - Enrutamiento
    - Mapeo de rutas a servicios
    - Balanceo de carga
  - Balanceo de carga
    - Distribución de solicitudes
    - Alta disponibilidad

## Flujo de Autenticación

- **Cliente → Auth Service**
  - Registro/Login
    - Validación de credenciales
    - Creación de cuentas
  - Generación de JWT
    - Firmado con clave secreta
    - Claims personalizados
  - Validación de credenciales
    - Hash de contraseñas
    - Verificación de email

- **Auth Service → PostgreSQL**
  - Almacenamiento de usuarios
    - Tabla de usuarios
    - Campos encriptados
  - Verificación de contraseñas
    - Bcrypt o similar
    - Salt y hash
  - Gestión de sesiones
    - Tokens activos
    - Fecha de expiración

- **Cliente ← Auth Service**
  - Token JWT
    - Access token
    - Refresh token
  - Información de usuario
    - Perfil básico
    - Permisos y roles

## Flujo de Productos

- **Cliente → Product Service**
  - Listado de productos
    - Paginación
    - Filtros y búsqueda
  - Detalles de productos
    - Información completa
    - Imágenes y descripción
  - Búsqueda y filtrado
    - Por categoría
    - Por precio
    - Por disponibilidad

- **Product Service → MongoDB**
  - Consulta de catálogo
    - Colección de productos
    - Índices optimizados
  - Detalles de productos
    - Campos enriquecidos
    - Metadatos
  - Imágenes y descripciones
    - URLs de imágenes
    - Texto formateado

- **Cliente ← Product Service**
  - Listas de productos
    - Arrays paginados
    - Información resumida
  - Detalles completos
    - Todos los campos
    - Relaciones

## Flujo de Carrito

- **Cliente → Cart Service**
  - Agregar productos
    - ID de producto
    - Cantidad
  - Actualizar cantidades
    - Incrementar/disminuir
    - Validación de stock
  - Eliminar items
    - Por ID de producto
    - Vaciar carrito

- **Cart Service → Redis**
  - Almacenamiento temporal
    - Sesiones por usuario
    - TTL configurable
  - Sesiones de usuario
    - Identificación por token
    - Persistencia en memoria
  - Datos volátiles
    - Estado no crítico
    - Alta velocidad de acceso

- **Cliente ← Cart Service**
  - Estado del carrito
    - Lista de items
    - Cantidades
  - Totales
    - Subtotal
    - Impuestos
    - Total general
  - Confirmación de cambios
    - Éxito/fracaso de operaciones
    - Mensajes de error

## Flujo de Pedidos

- **Cliente → Order Service**
  - Creación de pedido
    - Datos del carrito
    - Información de envío
  - Historial de pedidos
    - Listado por usuario
    - Estados de pedidos
  - Detalles de pedido
    - Items comprados
    - Totales
    - Fechas

- **Order Service → PostgreSQL**
  - Almacenamiento persistente
    - Tabla de pedidos
    - Tabla de items de pedido
  - Relaciones con usuarios
    - Foreign keys
    - Integridad referencial
  - Historial completo
    - Auditoría
    - Trazabilidad

- **Cliente ← Order Service**
  - Confirmación de pedido
    - Número de pedido
    - Estado inicial
  - Historial de compras
    - Lista de pedidos pasados
    - Estados actuales
  - Estado de pedidos
    - Procesando
    - Enviado
    - Entregado
    - Cancelado

## Flujo de Reseñas

- **Cliente → Review Service**
  - Crear reseñas
    - Calificación (1-5 estrellas)
    - Comentario textual
    - ID de producto
  - Listar reseñas
    - Por producto
    - Por usuario
    - Paginación
  - Calificaciones
    - Promedios
    - Distribución de estrellas

- **Review Service → MongoDB**
  - Almacenamiento de reseñas
    - Colección de reseñas
    - Índices por producto
  - Asociación con productos
    - Referencias a productos
    - Búsqueda eficiente
  - Datos semiestructurados
    - Campos adicionales flexibles
    - Metadatos de contexto

- **Cliente ← Review Service**
  - Reseñas de productos
    - Lista de comentarios
    - Información de usuarios
  - Calificaciones promedio
    - Cálculo en tiempo real
    - Redondeo apropiado
  - Comentarios
    - Texto de reseñas
    - Fechas de publicación

## Comunicación Asíncrona

- **RabbitMQ**
  - Notificaciones
    - Correos electrónicos
    - Mensajes push
  - Procesamiento en segundo plano
    - Tareas pesadas
    - Operaciones largas
  - Eventos entre servicios
    - Publicación/suscripción
    - Desacoplamiento

- **Ejemplos**
  - Confirmación de pedidos
    - Envío de correo de confirmación
    - Actualización de inventario
  - Notificaciones por correo
    - Registro de usuarios
    - Cambios de estado de pedidos
  - Actualizaciones de inventario
    - Reducción de stock
    - Alertas de bajo stock

## Monitoreo

- **Prometheus**
  - Recopilación de métricas
    - Contadores de solicitudes
    - Histogramas de latencia
  - Estado de servicios
    - Health checks
    - Disponibilidad
  - Rendimiento
    - Tiempos de respuesta
    - Throughput

- **Grafana**
  - Visualización de datos
    - Dashboards en tiempo real
    - Gráficos históricos
  - Dashboards
    - Por servicio
    - Por tipo de métrica
  - Alertas
    - Umbrales configurables
    - Notificaciones

## Seguridad

- **Tokens JWT**
  - Autenticación
    - Bearer tokens
    - HTTP Authorization header
  - Autorización
    - Claims de permisos
    - Validación de roles
  - Expiración
    - Access tokens cortos
    - Refresh tokens largos

- **Validación**
  - Entrada de datos
    - Sanitización
    - Validación de tipos
  - Sanitización
    - Prevención de inyecciones
    - Escape de caracteres
  - Protección contra ataques
    - CSRF tokens
    - Rate limiting
    - CORS configurado
