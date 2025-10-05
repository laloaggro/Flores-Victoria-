# Arreglos Victoria - Documentación Completa

## Descripción General

Arreglos Victoria es una florería en línea que permite a los clientes comprar arreglos florales para diferentes ocasiones. El sistema está construido siguiendo una arquitectura de microservicios moderna.

## Arquitectura del Sistema

### Vista General

La aplicación sigue una arquitectura de microservicios con los siguientes componentes principales:

1. **Frontend**: Aplicación web cliente construida con tecnologías modernas
2. **API Gateway**: Punto de entrada único para todas las solicitudes del cliente
3. **Microservicios**: Servicios especializados que manejan diferentes funcionalidades
4. **Bases de Datos**: Almacenamiento de datos en múltiples sistemas
5. **Message Broker**: Sistema de mensajería para comunicación entre servicios
6. **Monitoreo**: Herramientas para supervisar el estado del sistema

### Diagrama de Arquitectura

```
[Frontend] 
    ↓ (HTTP)
[API Gateway] 
    ↓ (HTTP/Mensajería)
[Microsservicios] ← → [Message Broker (RabbitMQ)]
    ↓ (Base de datos)
[MongoDB, PostgreSQL, Redis]
```

### Componentes Detallados

#### 1. Frontend
- Construido con Vite
- Contiene páginas para todos los aspectos de la tienda
- Implementa PWA para experiencia offline

#### 2. API Gateway
- Punto de entrada único para todas las solicitudes
- Maneja autenticación, enrutamiento y balanceo de carga

#### 3. Microservicios
- Auth Service: Manejo de autenticación y autorización
- User Service: Gestión de perfiles de usuario
- Product Service: Catálogo de productos
- Cart Service: Manejo del carrito de compras
- Order Service: Procesamiento de pedidos
- Review Service: Sistema de reseñas
- Contact Service: Formulario de contacto
- Wishlist Service: Lista de deseos

#### 4. Bases de Datos
- MongoDB: Almacenamiento principal de datos
- PostgreSQL: Almacenamiento de datos relacionales
- Redis: Caché para mejorar el rendimiento

#### 5. Message Broker
- RabbitMQ: Sistema de mensajería entre servicios

#### 6. Monitoreo
- Prometheus: Recopilación de métricas
- Grafana: Visualización de métricas

## Flujo de Datos

1. Cliente interactúa con el Frontend
2. Frontend envía solicitudes al API Gateway
3. API Gateway enruta las solicitudes a los microservicios apropiados
4. Microservicios procesan las solicitudes y se comunican con las bases de datos
5. Los resultados se devuelven al cliente a través del API Gateway

## Despliegue

El sistema se despliega utilizando Docker y docker-compose, lo que permite una configuración consistente en todos los entornos.

## Explicación para Niños de 7 Años

Imagina que Arreglos Victoria es como una gran florería con muchos trabajadores especializados:

- **El Frontend** es como la tienda principal donde los clientes ven las flores y hacen sus pedidos.
- **El API Gateway** es como el recepcionista que recibe todos los pedidos y los envía a la persona correcta.
- **Los Microservicios** son como trabajadores especializados:
  - Uno que se encarga solo de saber quién es cada cliente (Auth Service)
  - Otro que maneja las flores y sus precios (Product Service)
  - Otro que lleva la cuenta de lo que cada cliente quiere comprar (Cart Service)
  - Otro que procesa los pedidos cuando los clientes deciden comprar (Order Service)
- **Las Bases de Datos** son como los almacenes donde se guardan todas las cosas.
- **El Message Broker** es como un sistema de mensajería interna para que los trabajadores se comuniquen entre sí.

¡Todos trabajan juntos para asegurarse de que los clientes obtengan las flores más bonitas para sus seres queridos!