# Arquitectura del Sistema - Arreglos Victoria

## Diagrama de Arquitectura

```
                    +------------------+
                    |    Frontend      |
                    |   (Cliente Web)  |
                    +------------------+
                             |
                    +------------------+
                    |   API Gateway    |
                    | (Puerto: 8000)   |
                    +------------------+
                             |
      +----------------------+----------------------+
      |                      |                      |
+-------------+      +-------------+      +-------------+
| Auth        |      | Product     |      | User        |
| Service     |      | Service     |      | Service     |
| (Puerto:    |      | (Puerto:    |      | (Puerto:    |
| 3001)       |      | 3003)       |      | 3002)       |
+-------------+      +-------------+      +-------------+
      |                      |                      |
+-------------+      +-------------+      +-------------+
| Cart        |      | Order       |      | Review      |
| Service     |      | Service     |      | Service     |
| (Puerto:    |      | (Puerto:    |      | (Puerto:    |
| 3004)       |      | 3005)       |      | 3006)       |
+-------------+      +-------------+      +-------------+
      |                      |                      |
+-------------+      +-------------+      +-------------+
| Contact     |      | Wishlist    |      |             |
| Service     |      | Service     |      |             |
| (Puerto:    |      | (Puerto:    |      |             |
| 3007)       |      | 3008)       |      |             |
+-------------+      +-------------+      +-------------+
      |                      |                      |
      +----------------------+----------------------+
                             |
                    +------------------+
                    | Message Broker   |
                    |  (RabbitMQ)      |
                    +------------------+
                             |
                    +------------------+
                    | Bases de Datos   |
                    | - MongoDB        |
                    | - PostgreSQL     |
                    | - Redis          |
                    +------------------+
                             |
                    +------------------+
                    | Monitoreo        |
                    | - Prometheus     |
                    | - Grafana        |
                    +------------------+
```

## Explicación Detallada de la Arquitectura

### Capa de Presentación (Frontend)
El frontend es una aplicación web que se ejecuta en el navegador del usuario. Proporciona la interfaz gráfica para que los clientes puedan:
- Ver el catálogo de productos
- Agregar productos al carrito
- Realizar pedidos
- Dejar reseñas
- Gestionar su perfil

### Capa de Acceso (API Gateway)
El API Gateway actúa como punto de entrada único para todas las solicitudes del cliente. Sus funciones principales son:
- Enrutar las solicitudes a los microservicios apropiados
- Manejar la autenticación básica
- Implementar políticas de rate limiting
- Registrar solicitudes para auditoría

### Capa de Lógica de Negocio (Microservicios)
Cada microservicio es una aplicación independiente que se encarga de una funcionalidad específica:

#### Auth Service
Gestiona todo lo relacionado con la identidad de los usuarios:
- Registro de nuevos usuarios
- Inicio y cierre de sesión
- Generación y validación de tokens JWT
- Recuperación de contraseñas

#### User Service
Administra la información de perfil de los usuarios:
- Almacenamiento de datos personales
- Actualización de información de contacto
- Gestión de preferencias del usuario

#### Product Service
Gestiona el catálogo de productos:
- Almacenamiento de información de productos
- Búsqueda y filtrado de productos
- Gestión de inventario

#### Cart Service
Maneja los carritos de compras de los usuarios:
- Agregar/eliminar productos del carrito
- Actualizar cantidades
- Persistencia del carrito entre sesiones

#### Order Service
Procesa los pedidos de los clientes:
- Creación de nuevas órdenes
- Gestión del estado de los pedidos
- Cálculo de totales

#### Review Service
Gestiona las reseñas de productos:
- Creación y eliminación de reseñas
- Cálculo de calificaciones promedio

#### Contact Service
Maneja el formulario de contacto:
- Recepción y procesamiento de mensajes de contacto
- Envío de notificaciones

#### Wishlist Service
Gestiona las listas de deseos:
- Agregar/eliminar productos de la lista de deseos
- Sincronización entre dispositivos

### Capa de Mensajería (RabbitMQ)
RabbitMQ se utiliza para la comunicación asíncrona entre microservicios:
- Notificaciones de eventos importantes
- Procesamiento en segundo plano
- Desacoplamiento de servicios

### Capa de Datos
#### MongoDB
Base de datos principal para documentos complejos:
- Información de usuarios
- Catálogo de productos
- Órdenes de compra
- Reseñas

#### PostgreSQL
Base de datos relacional para datos estructurados:
- Items del carrito
- Items de la lista de deseos

#### Redis
Sistema de caché para mejorar el rendimiento:
- Datos de productos frecuentes
- Sesiones de usuario

### Capa de Monitoreo
#### Prometheus
Recopila métricas de todos los servicios:
- Tiempos de respuesta
- Uso de recursos
- Tasa de errores

#### Grafana
Visualiza las métricas en dashboards:
- Estado del sistema en tiempo real
- Alertas de problemas
- Tendencias de rendimiento

## Comunicación entre Componentes

### Comunicación Síncrona (HTTP/REST)
- Frontend ↔ API Gateway
- API Gateway ↔ Microservicios
- Microservicios ↔ Bases de datos

### Comunicación Asíncrona (Message Broker)
- Microservicios → RabbitMQ (publicación de eventos)
- RabbitMQ → Microservicios (consumo de eventos)

## Estrategias de Escalabilidad

### Escalabilidad Horizontal
Cada microservicio puede escalarse independientemente:
- Añadir más instancias de servicios con alta carga
- Distribuir carga entre múltiples instancias

### Escalabilidad de Datos
- MongoDB replica sets para alta disponibilidad
- Redis clustering para caché distribuido
- PostgreSQL read replicas para consultas intensivas

## Estrategias de Resiliencia

### Circuit Breaker
Patrón implementado en el API Gateway para:
- Prevenir fallos en cascada
- Manejar servicios no disponibles temporalmente
- Proporcionar respuestas de fallback

### Health Checks
Cada microservicio expone endpoints de salud para:
- Monitoreo automático
- Reinicios automáticos en caso de fallos
- Balanceo de carga inteligente

### Retries y Backoff
Políticas de reintento con espera exponencial para:
- Manejar fallos temporales de red
- Reducir carga en servicios sobrecargados
- Mejorar la experiencia del usuario

## Explicación para Niños de 7 Años (Versión Extendida)

Imagina que Arreglos Victoria es como una gran fábrica de ramos de flores:

1. **La Tienda (Frontend)**: Es la ventana bonita donde los clientes ven las flores y eligen lo que quieren, como cuando vas a una tienda de juguetes.

2. **El Recepcionista (API Gateway)**: Es como un recepcionista muy amable que recibe a todos los clientes y los guía a la sección correcta de la tienda.

3. **Los Trabajadores Especializados (Microservicios)**:
   - **Señorita Rosa** (Auth Service): Se acuerda de quién es cada cliente y les da credenciales especiales.
   - **Don Tulipán** (Product Service): Conoce todas las flores, sus precios y colores.
   - **Señora Violeta** (User Service): Guarda la información de cada cliente, como su nombre y dirección.
   - **Señor Girasol** (Cart Service): Lleva la cuenta de qué flores quiere cada cliente en su carrito.
   - **Don Orquídea** (Order Service): Cuando un cliente decide comprar, él prepara el pedido y lo empaca.
   - **Señorita Margarita** (Review Service): Recoge las opiniones de los clientes sobre las flores.
   - **Señor Clavel** (Contact Service): Recibe los mensajes de los clientes que quieren hacer preguntas.
   - **Señora Hortensia** (Wishlist Service): Guarda la lista de flores que a cada cliente le gustaría tener.

4. **La Mensajería Interna (RabbitMQ)**: Es como un sistema de mensajería entre los trabajadores para que se comuniquen sin interrumpir a los clientes.

5. **Los Almacenes (Bases de Datos)**: Son lugares donde se guardan todas las cosas:
   - Un almacén grande para las flores y clientes
   - Un almacén especial para los carritos
   - Una caja con las cosas más pedidas para encontrarlas rápido

6. **Los Vigilantes (Monitoreo)**: Son como guardias que se aseguran de que todos los trabajadores estén bien y haciendo bien su trabajo.

¡Todos trabajan juntos como un equipo para que los clientes siempre reciban las flores más bonitas y frescas!