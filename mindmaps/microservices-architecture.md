# Mapa Mental: Arquitectura de Microservicios

## API Gateway (puerto 3000)

- Punto de entrada único
- Enrutamiento a servicios
- Comunicación con todos los servicios
- Balanceo de carga
- Autenticación centralizada
- Manejo de CORS
- Compresión de respuestas
- Logging de solicitudes

## Servicios Individuales

- **Auth Service (puerto 3001)**
  - Autenticación
    - Registro de usuarios
    - Inicio de sesión
    - Generación de tokens JWT
    - Refresh tokens
  - Autorización
    - Validación de roles
    - Permisos de acceso
  - JWT
    - Firma y verificación de tokens
    - Expiración y renovación
  - Base de datos: PostgreSQL
    - Tabla de usuarios
    - Credenciales cifradas
    - Sesiones

- **Product Service (puerto 3002)**
  - Gestión de productos
    - Crear productos
    - Actualizar productos
    - Eliminar productos
    - Listar productos
  - Catálogo
    - Categorías de productos
    - Búsqueda y filtrado
    - Detalles de productos
  - Imágenes de productos
    - Almacenamiento de rutas
    - Optimización
  - Base de datos: MongoDB
    - Colección de productos
    - Esquema flexible
    - Búsqueda por texto

- **User Service (puerto 3003)**
  - Gestión de usuarios
    - Perfiles de usuario
    - Actualización de información
    - Eliminación de cuentas
  - Perfiles
    - Datos personales
    - Direcciones de envío
    - Preferencias
  - Historial de actividad
    - Pedidos anteriores
    - Productos vistos
  - Base de datos: PostgreSQL
    - Tabla de usuarios
    - Relaciones con pedidos

- **Order Service (puerto 3004)**
  - Gestión de pedidos
    - Creación de pedidos
    - Actualización de estado
    - Cancelación de pedidos
  - Historial de pedidos
    - Listado por usuario
    - Detalles completos
    - Seguimiento
  - Procesamiento de pagos
    - Integración con pasarelas
    - Confirmación de pagos
  - Base de datos: PostgreSQL
    - Tabla de pedidos
    - Items de pedido
    - Estado de pedidos

- **Cart Service (puerto 3005)**
  - Carrito de compras
    - Agregar productos
    - Eliminar productos
    - Actualizar cantidades
  - Sesiones de usuario
    - Identificación por sesión
    - Persistencia temporal
  - Cálculos
    - Totales
    - Subtotales
    - Impuestos
  - Base de datos: Redis
    - Almacenamiento en memoria
    - Expiración automática
    - Alta velocidad

- **Wishlist Service (puerto 3006)**
  - Lista de deseos
    - Agregar productos
    - Eliminar productos
    - Listar favoritos
  - Favoritos
    - Productos marcados
    - Categorización
  - Compartir listas
    - Enlaces públicos
    - Exportación
  - Base de datos: Redis
    - Almacenamiento por usuario
    - Acceso rápido

- **Review Service (puerto 3007)**
  - Reseñas de productos
    - Crear reseñas
    - Editar reseñas
    - Eliminar reseñas
  - Calificaciones
    - Sistema de estrellas
    - Promedios
    - Conteo de reseñas
  - Moderación
    - Aprobación de contenido
    - Reporte de abusos
  - Base de datos: MongoDB
    - Colección de reseñas
    - Asociación con productos
    - Metadatos

- **Contact Service (puerto 3008)**
  - Formulario de contacto
    - Recepción de mensajes
    - Validación de datos
  - Mensajes de usuarios
    - Almacenamiento de consultas
    - Categorización
  - Notificaciones
    - Envío de correos
    - Confirmación de recepción
  - Base de datos: MongoDB
    - Colección de mensajes
    - Estado de procesamiento

## Infraestructura de Datos

- **PostgreSQL**
  - Datos estructurados
    - Esquemas definidos
    - Relaciones entre tablas
    - Integridad referencial
  - Usuarios
    - Información de registro
    - Credenciales
    - Permisos
  - Pedidos
    - Encabezados de pedido
    - Detalles de items
    - Estado e historial
  - Relaciones
    - Claves foráneas
    - Índices
    - Constraints

- **MongoDB**
  - Datos semiestructurados
    - Documentos JSON
    - Esquema flexible
    - Anidamiento de datos
  - Productos
    - Información detallada
    - Imágenes y descripciones
    - Categorías y tags
  - Reseñas
    - Comentarios de usuarios
    - Calificaciones
    - Metadatos
  - Contacto
    - Mensajes recibidos
    - Datos de contacto
    - Categorías

- **Redis**
  - Caché
    - Almacenamiento temporal
    - Reducción de consultas
    - Mejora de rendimiento
  - Sesiones
    - Datos de sesión de usuario
    - Carritos activos
    - Preferencias temporales
  - Datos temporales
    - Tokens de verificación
    - Contadores
    - Colas de procesamiento

## Sistema de Mensajería

- **RabbitMQ**
  - Comunicación asíncrona
    - Productores y consumidores
    - Intercambio de mensajes
  - Colas de mensajes
    - Persistencia
    - Priorización
    - Reintento de entrega
  - Eventos
    - Creación de pedidos
    - Actualización de inventario
    - Notificaciones por correo

## Monitoreo y Observabilidad

- **Prometheus**
  - Recopilación de métricas
    - Contadores
    - Gauges
    - Histogramas
    - Resúmenes
  - Exportadores para todas las bases de datos
    - Métricas específicas por sistema
    - Estado de conexiones
    - Rendimiento

- **Grafana**
  - Visualización de métricas
    - Dashboards personalizados
    - Gráficos en tiempo real
    - Alertas configurables
  - Conexión con Prometheus
    - Consultas PromQL
    - Visualización de datos históricos
    - Análisis de tendencias

## Red y Seguridad

- **Docker Network**
  - Comunicación interna
    - Aislamiento de servicios
    - Resolución de nombres
    - Seguridad de red
  - Puertos expuestos
    - Solo los necesarios
    - Mapeo controlado

- **Variables de Entorno**
  - Configuración segura
    - Sin datos sensibles en código
    - Diferentes entornos
  - Secretos
    - Claves de API
    - Contraseñas
    - Tokens JWT
