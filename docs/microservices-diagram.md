# Arquitectura de Microservicios — Flores Victoria

Diseñé e implementé esta arquitectura completa: API Gateway, servicios especializados (auth, products, orders, contact), MongoDB, Redis, Docker. Todo con herramientas 100% open source y asistencia de IA (Lingma).

## Diagrama de Arquitectura

```mermaid
graph TD
    subgraph Docker["Contenedor Docker"]
        Frontend[Frontend<br/>HTML/CSS/JS]
        API_Gateway[API Gateway<br/>(Node.js/Express)]
        
        subgraph Middlewares["Middlewares"]
            CB[Circuit Breaker<br/>(Resilience4j-like)]
            Log[Logging<br/>(Winston/Morgan)]
            Metrics[Métricas<br/>(Prometheus)]
        end
        
        subgraph Services["Servicios Especializados"]
            Auth[Auth Service<br/>(Autenticación JWT)]
            Products[Products Service<br/>(Gestión de Productos)]
            Orders[Orders Service<br/>(Órdenes y Pagos)]
            Contact[Contact Service<br/>(Formularios de Contacto)]
        end
        
        subgraph Databases["Bases de Datos"]
            MongoDB[MongoDB<br/>(NoSQL para datos persistentes)]
            Redis[Redis<br/>(Cache y Sesiones)]
        end
    end
    
    Frontend --> API_Gateway
    API_Gateway --> Middlewares
    Middlewares --> Auth
    Middlewares --> Products
    Middlewares --> Orders
    Middlewares --> Contact
    Auth --> MongoDB
    Products --> MongoDB
    Orders --> MongoDB
    Contact --> Redis
    CB -.->|Aplica a todos| Services
    Log -.->|Aplica a todos| Services
    Metrics -.->|Aplica a todos| Services
    
    style Docker fill:#f9f,stroke:#333,stroke-width:2px
    style Databases fill:#bbf,stroke:#333,stroke-width:2px
```

Este diagrama ilustra el flujo desde el frontend pasando por el API Gateway con middlewares de resiliencia, logging y métricas, hacia los servicios micro, y finalmente a las bases de datos. Todo orquestado con Docker para despliegue contenedorizado.