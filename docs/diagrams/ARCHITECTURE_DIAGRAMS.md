# 🏗️ Diagramas de Arquitectura - Flores Victoria

## 📊 Arquitectura General del Sistema

```mermaid
flowchart TB
    subgraph Clients["👥 Clientes"]
        WEB[🌐 Web Browser]
        MOBILE[📱 Mobile App]
        ADMIN[👨‍💼 Admin Panel]
    end

    subgraph Gateway["🚪 API Gateway :3000"]
        GW[API Gateway]
        AUTH_MW[Auth Middleware]
        RATE[Rate Limiter]
        CORS[CORS Handler]
    end

    subgraph Services["🔧 Microservicios"]
        AUTH[🔐 Auth Service :3001]
        USER[👤 User Service :3002]
        PRODUCT[🌸 Product Service :3009]
        ORDER[📦 Order Service :3004]
        CART[🛒 Cart Service :3005]
        WISHLIST[❤️ Wishlist Service :3006]
        REVIEW[⭐ Review Service :3007]
        CONTACT[📧 Contact Service :3008]
        NOTIFICATION[🔔 Notification Service :3010]
        PAYMENT[💳 Payment Service :3018]
        PROMOTION[🎁 Promotion Service :3019]
    end

    subgraph Data["💾 Bases de Datos"]
        POSTGRES[(PostgreSQL)]
        MONGO[(MongoDB)]
        REDIS[(Redis Cache)]
    end

    subgraph External["🌍 Servicios Externos"]
        STRIPE[Stripe Payments]
        EMAIL[Email Service]
        SMS[SMS Service]
    end

    WEB --> GW
    MOBILE --> GW
    ADMIN --> GW

    GW --> AUTH_MW --> RATE --> CORS

    CORS --> AUTH
    CORS --> USER
    CORS --> PRODUCT
    CORS --> ORDER
    CORS --> CART
    CORS --> WISHLIST
    CORS --> REVIEW
    CORS --> CONTACT
    CORS --> NOTIFICATION
    CORS --> PAYMENT
    CORS --> PROMOTION

    AUTH --> POSTGRES
    USER --> POSTGRES
    PRODUCT --> MONGO
    ORDER --> POSTGRES
    CART --> REDIS
    WISHLIST --> POSTGRES
    REVIEW --> MONGO
    CONTACT --> MONGO
    NOTIFICATION --> REDIS
    PAYMENT --> STRIPE
    PROMOTION --> MONGO

    NOTIFICATION --> EMAIL
    NOTIFICATION --> SMS
```

---

## 🔐 Auth Service - Flujo de Autenticación

```mermaid
sequenceDiagram
    participant C as Cliente
    participant GW as API Gateway
    participant AS as Auth Service
    participant DB as PostgreSQL
    participant R as Redis

    Note over C,R: Registro de Usuario
    C->>GW: POST /auth/register
    GW->>AS: Forward request
    AS->>DB: INSERT user
    DB-->>AS: User created
    AS->>R: Cache user session
    AS-->>GW: JWT Token
    GW-->>C: 201 Created + Token

    Note over C,R: Login
    C->>GW: POST /auth/login
    GW->>AS: Forward request
    AS->>DB: Verify credentials
    DB-->>AS: User data
    AS->>R: Store session
    AS-->>GW: JWT Token + Refresh Token
    GW-->>C: 200 OK + Tokens

    Note over C,R: Refresh Token
    C->>GW: POST /auth/refresh
    GW->>AS: Verify refresh token
    AS->>R: Check token validity
    R-->>AS: Valid
    AS-->>GW: New JWT Token
    GW-->>C: 200 OK + New Token
```

---

## 🌸 Product Service - Gestión de Productos

```mermaid
flowchart LR
    subgraph API["API Endpoints"]
        GET_ALL[GET /products]
        GET_ONE[GET /products/:id]
        CREATE[POST /products]
        UPDATE[PUT /products/:id]
        DELETE[DELETE /products/:id]
        SEARCH[GET /products/search]
    end

    subgraph Logic["Business Logic"]
        VALIDATE[Validación]
        TRANSFORM[Transformación]
        CACHE_CHECK[Cache Check]
    end

    subgraph Storage["Almacenamiento"]
        MONGO[(MongoDB)]
        REDIS[(Redis Cache)]
        S3[Image Storage]
    end

    GET_ALL --> CACHE_CHECK
    GET_ONE --> CACHE_CHECK
    SEARCH --> CACHE_CHECK
    
    CACHE_CHECK -->|Miss| MONGO
    CACHE_CHECK -->|Hit| REDIS
    
    CREATE --> VALIDATE --> TRANSFORM --> MONGO
    UPDATE --> VALIDATE --> TRANSFORM --> MONGO
    DELETE --> MONGO
    
    MONGO --> REDIS
    CREATE --> S3
    UPDATE --> S3
```

### Modelo de Producto

```mermaid
erDiagram
    PRODUCT {
        ObjectId _id PK
        string name
        string description
        decimal price
        string category
        array images
        int stock
        boolean active
        date createdAt
        date updatedAt
    }
    
    CATEGORY {
        ObjectId _id PK
        string name
        string slug
        string description
        ObjectId parent FK
    }
    
    PRODUCT_VARIANT {
        ObjectId _id PK
        ObjectId productId FK
        string size
        string color
        decimal priceModifier
        int stock
    }
    
    PRODUCT ||--o{ PRODUCT_VARIANT : has
    CATEGORY ||--o{ PRODUCT : contains
```

---

## 🛒 Cart Service - Carrito de Compras

```mermaid
stateDiagram-v2
    [*] --> Empty: Usuario nuevo
    
    Empty --> HasItems: Añadir producto
    HasItems --> HasItems: Modificar cantidad
    HasItems --> Empty: Vaciar carrito
    HasItems --> Checkout: Iniciar pago
    
    Checkout --> PaymentPending: Confirmar pedido
    PaymentPending --> PaymentSuccess: Pago exitoso
    PaymentPending --> PaymentFailed: Pago fallido
    PaymentFailed --> HasItems: Reintentar
    
    PaymentSuccess --> OrderCreated: Crear orden
    OrderCreated --> [*]
```

### Estructura del Carrito

```mermaid
flowchart TB
    subgraph Cart["🛒 Carrito (Redis)"]
        CART_ID[cart:user_123]
        ITEMS[items: array]
        TOTAL[total: decimal]
        UPDATED[updatedAt: timestamp]
    end

    subgraph Item["📦 Item"]
        PROD_ID[productId]
        QTY[quantity]
        PRICE[unitPrice]
        SUBTOTAL[subtotal]
    end

    Cart --> Item
    
    subgraph Operations["Operaciones"]
        ADD[Añadir]
        REMOVE[Eliminar]
        UPDATE_QTY[Actualizar cantidad]
        CLEAR[Vaciar]
        CHECKOUT[Checkout]
    end
```

---

## 📦 Order Service - Gestión de Pedidos

```mermaid
flowchart TB
    subgraph OrderFlow["Flujo de Pedido"]
        START((Inicio)) --> VALIDATE_CART[Validar Carrito]
        VALIDATE_CART --> CHECK_STOCK[Verificar Stock]
        CHECK_STOCK -->|Stock OK| CALC_TOTAL[Calcular Total]
        CHECK_STOCK -->|Sin Stock| ERROR[Error: Sin stock]
        
        CALC_TOTAL --> APPLY_PROMO[Aplicar Promociones]
        APPLY_PROMO --> CREATE_ORDER[Crear Orden]
        CREATE_ORDER --> RESERVE_STOCK[Reservar Stock]
        RESERVE_STOCK --> INIT_PAYMENT[Iniciar Pago]
        
        INIT_PAYMENT -->|Éxito| CONFIRM[Confirmar Orden]
        INIT_PAYMENT -->|Fallo| RELEASE_STOCK[Liberar Stock]
        RELEASE_STOCK --> CANCEL[Cancelar Orden]
        
        CONFIRM --> NOTIFY[Notificar Usuario]
        NOTIFY --> END_SUCCESS((✅ Completado))
        
        ERROR --> END_ERROR((❌ Error))
        CANCEL --> END_CANCEL((🚫 Cancelado))
    end
```

### Estados del Pedido

```mermaid
stateDiagram-v2
    [*] --> Pending: Crear pedido
    Pending --> Processing: Pago confirmado
    Pending --> Cancelled: Cancelar/Timeout
    
    Processing --> Preparing: Stock reservado
    Preparing --> Shipped: Enviado
    Shipped --> Delivered: Entregado
    
    Delivered --> [*]
    Cancelled --> [*]
    
    Processing --> Refunded: Reembolso solicitado
    Preparing --> Refunded: Reembolso solicitado
    Refunded --> [*]
```

---

## 💳 Payment Service - Procesamiento de Pagos

```mermaid
sequenceDiagram
    participant C as Cliente
    participant PS as Payment Service
    participant ST as Stripe
    participant OS as Order Service
    participant NS as Notification

    C->>PS: POST /payments/create-intent
    PS->>ST: Create PaymentIntent
    ST-->>PS: client_secret
    PS-->>C: PaymentIntent data

    C->>ST: Confirm Payment (frontend)
    ST-->>C: Payment result

    ST->>PS: Webhook: payment_intent.succeeded
    PS->>OS: Update order status
    OS-->>PS: Order updated
    PS->>NS: Send confirmation
    NS-->>C: Email/SMS notification
```

---

## 🔔 Notification Service - Sistema de Notificaciones

```mermaid
flowchart LR
    subgraph Triggers["🎯 Disparadores"]
        ORDER_CREATED[Pedido Creado]
        PAYMENT_OK[Pago Exitoso]
        SHIPPED[Pedido Enviado]
        DELIVERED[Entregado]
        PROMO[Nueva Promoción]
    end

    subgraph Queue["📬 Cola de Mensajes"]
        REDIS_QUEUE[(Redis Queue)]
    end

    subgraph Channels["📤 Canales"]
        EMAIL[📧 Email]
        SMS[📱 SMS]
        PUSH[🔔 Push]
        WEBHOOK[🔗 Webhook]
    end

    subgraph Templates["📝 Templates"]
        T1[order_confirmation]
        T2[payment_receipt]
        T3[shipping_update]
        T4[delivery_confirm]
    end

    Triggers --> REDIS_QUEUE
    REDIS_QUEUE --> Templates
    Templates --> Channels
```

---

## 🎁 Promotion Service - Gestión de Promociones

```mermaid
flowchart TB
    subgraph Types["Tipos de Promoción"]
        PERCENT[% Descuento]
        FIXED[$ Fijo]
        BOGO[2x1]
        FREE_SHIP[Envío Gratis]
        BUNDLE[Bundle]
    end

    subgraph Rules["Reglas"]
        MIN_AMOUNT[Monto Mínimo]
        CATEGORY[Categoría]
        DATE_RANGE[Rango Fechas]
        MAX_USES[Máx. Usos]
        USER_LIMIT[Límite/Usuario]
    end

    subgraph Application["Aplicación"]
        CART_CHECK[Verificar Carrito]
        VALIDATE[Validar Reglas]
        CALCULATE[Calcular Descuento]
        APPLY[Aplicar]
    end

    Types --> Rules
    Rules --> CART_CHECK
    CART_CHECK --> VALIDATE
    VALIDATE --> CALCULATE
    CALCULATE --> APPLY
```

---

## 🗄️ Modelo de Datos Completo

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--|| CART : has
    USER ||--o{ WISHLIST_ITEM : saves
    
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"
    PRODUCT ||--o{ CART_ITEM : "added to"
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ WISHLIST_ITEM : "wishlisted"
    PRODUCT }o--|| CATEGORY : "belongs to"
    
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER ||--o| PAYMENT : "paid by"
    ORDER ||--o{ NOTIFICATION : triggers
    
    CART ||--|{ CART_ITEM : contains
    
    PROMOTION ||--o{ ORDER : "applied to"
    
    USER {
        uuid id PK
        string email UK
        string password
        string name
        json address
        timestamp created_at
    }
    
    PRODUCT {
        objectid id PK
        string name
        decimal price
        string category
        int stock
        boolean active
    }
    
    ORDER {
        uuid id PK
        uuid user_id FK
        string status
        decimal total
        json shipping_address
        timestamp created_at
    }
    
    PAYMENT {
        uuid id PK
        uuid order_id FK
        string stripe_id
        decimal amount
        string status
    }
```

---

## 🚀 Deployment en Railway

```mermaid
flowchart TB
    subgraph GitHub["GitHub Repository"]
        MAIN[main branch]
    end

    subgraph Railway["Railway Platform"]
        subgraph Services["Servicios"]
            GW_R[API Gateway]
            AUTH_R[Auth Service]
            USER_R[User Service]
            PRODUCT_R[Product Service]
            ORDER_R[Order Service]
            CART_R[Cart Service]
            WISHLIST_R[Wishlist Service]
            REVIEW_R[Review Service]
            CONTACT_R[Contact Service]
            NOTIF_R[Notification Service]
            PAYMENT_R[Payment Service]
            PROMO_R[Promotion Service]
            FRONTEND[Frontend]
            ADMIN[Admin Panel]
        end

        subgraph Databases["Bases de Datos"]
            PG_R[(PostgreSQL)]
            MONGO_R[(MongoDB)]
            REDIS_R[(Redis)]
        end
    end

    MAIN -->|Deploy| Railway
    
    GW_R --> AUTH_R
    GW_R --> USER_R
    GW_R --> PRODUCT_R
    GW_R --> ORDER_R
    GW_R --> CART_R
    
    AUTH_R --> PG_R
    USER_R --> PG_R
    PRODUCT_R --> MONGO_R
    CART_R --> REDIS_R
```

---

## 📈 Métricas y Monitoreo

```mermaid
flowchart LR
    subgraph Services["Microservicios"]
        S1[Service 1]
        S2[Service 2]
        S3[Service N]
    end

    subgraph Monitoring["Stack de Monitoreo"]
        PROM[Prometheus]
        GRAF[Grafana]
        JAEGER[Jaeger]
        LOGS[Log Aggregator]
    end

    subgraph Alerts["Alertas"]
        SLACK[Slack]
        EMAIL[Email]
        PAGER[PagerDuty]
    end

    Services -->|Metrics| PROM
    Services -->|Traces| JAEGER
    Services -->|Logs| LOGS
    
    PROM --> GRAF
    JAEGER --> GRAF
    LOGS --> GRAF
    
    GRAF -->|Alert| Alerts
```

---

*Diagramas generados con Mermaid - Diciembre 2025*
