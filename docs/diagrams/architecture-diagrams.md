# 📊 Diagramas de Arquitectura - Flores Victoria

## 1. Arquitectura General de Microservicios

```mermaid
flowchart TB
    subgraph Clients["🌐 Clientes"]
        WEB[("🖥️ Web Browser")]
        MOBILE[("📱 Mobile App")]
        ADMIN[("👤 Admin Panel")]
    end

    subgraph Gateway["🚪 API Gateway :3000"]
        GW[API Gateway]
        AUTH_MW[Auth Middleware]
        RATE[Rate Limiter]
        CORS[CORS Handler]
    end

    subgraph Services["🔧 Microservicios"]
        AUTH[("🔐 Auth\n:3001")]
        USER[("👤 User\n:3002")]
        PRODUCT[("🌸 Product\n:3009")]
        ORDER[("📦 Order\n:3004")]
        CART[("🛒 Cart\n:3005")]
        WISHLIST[("❤️ Wishlist\n:3006")]
        REVIEW[("⭐ Review\n:3007")]
        CONTACT[("📧 Contact\n:3008")]
        NOTIF[("🔔 Notification\n:3010")]
    end

    subgraph Data["💾 Capa de Datos"]
        PG[(PostgreSQL)]
        MONGO[(MongoDB)]
        REDIS[(Redis Cache)]
    end

    subgraph External["🌍 Servicios Externos"]
        STRIPE[Stripe Payments]
        EMAIL[Email Service]
        SMS[SMS Provider]
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
    CORS --> NOTIF

    AUTH --> PG
    USER --> PG
    PRODUCT --> MONGO
    ORDER --> PG
    CART --> REDIS
    WISHLIST --> MONGO
    REVIEW --> MONGO

    ORDER --> STRIPE
    NOTIF --> EMAIL
    NOTIF --> SMS
```

## 2. Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant F as 🖥️ Frontend
    participant G as 🚪 API Gateway
    participant A as 🔐 Auth Service
    participant R as 💾 Redis
    participant D as 🗄️ PostgreSQL

    U->>F: Login (email, password)
    F->>G: POST /api/auth/login
    G->>A: Forward request
    A->>D: Validate credentials
    D-->>A: User data
    A->>A: Generate JWT
    A->>R: Store session
    A-->>G: JWT + Refresh Token
    G-->>F: Auth response
    F->>F: Store tokens
    F-->>U: ✅ Logged in

    Note over U,D: Subsequent Requests
    U->>F: Action (with token)
    F->>G: Request + JWT Header
    G->>G: Validate JWT
    G->>R: Check token revocation
    R-->>G: Token valid
    G->>A: Forward to service
    A-->>G: Response
    G-->>F: Data
    F-->>U: ✅ Result
```

## 3. Flujo de Compra (Checkout)

```mermaid
flowchart LR
    subgraph Customer["🛍️ Cliente"]
        A[Ver Productos] --> B[Agregar al Carrito]
        B --> C[Checkout]
        C --> D[Pago]
        D --> E[Confirmación]
    end

    subgraph Backend["⚙️ Backend"]
        B --> CART_SVC[Cart Service]
        CART_SVC --> REDIS[(Redis)]
        
        C --> ORDER_SVC[Order Service]
        ORDER_SVC --> PRODUCT_SVC[Product Service]
        PRODUCT_SVC --> MONGO[(MongoDB)]
        
        D --> PAY_SVC[Payment Service]
        PAY_SVC --> STRIPE[Stripe API]
        
        E --> NOTIF_SVC[Notification]
        NOTIF_SVC --> EMAIL[📧 Email]
    end

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fce4ec
```

## 4. Arquitectura de Datos

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ WISHLIST : has
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        datetime created_at
    }

    PRODUCTS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ REVIEWS : has
    PRODUCTS ||--o{ WISHLIST : in
    PRODUCTS {
        uuid id PK
        string name
        text description
        decimal price
        int stock
        string category
        array images
        datetime created_at
    }

    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS {
        uuid id PK
        uuid user_id FK
        string status
        decimal total
        json shipping_address
        string payment_status
        datetime created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }

    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        int rating
        text comment
        datetime created_at
    }

    WISHLIST {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        datetime added_at
    }
```

## 5. Infraestructura Railway

```mermaid
flowchart TB
    subgraph Railway["☁️ Railway Platform"]
        subgraph Public["🌐 Public Services"]
            FE[Frontend v2<br/>:5173]
            ADMIN[Admin Panel<br/>:3010]
            GW[API Gateway<br/>:3000]
        end
        
        subgraph Private["🔒 Internal Services"]
            AUTH[Auth Service]
            USER[User Service]
            PROD[Product Service]
            ORDER[Order Service]
            CART[Cart Service]
            WISH[Wishlist Service]
            REV[Review Service]
            CONT[Contact Service]
            NOTIF[Notification Service]
        end
        
        subgraph Data["💾 Databases"]
            PG[(PostgreSQL<br/>Relational)]
            MONGO[(MongoDB<br/>Documents)]
            REDIS[(Redis<br/>Cache)]
        end
    end

    INTERNET((Internet)) --> FE
    INTERNET --> ADMIN
    INTERNET --> GW
    
    GW --> AUTH & USER & PROD & ORDER & CART & WISH & REV & CONT & NOTIF
    
    AUTH & USER & ORDER --> PG
    PROD & WISH & REV & CONT --> MONGO
    CART & AUTH --> REDIS

    style FE fill:#4CAF50,color:#fff
    style ADMIN fill:#2196F3,color:#fff
    style GW fill:#FF9800,color:#fff
    style PG fill:#336791,color:#fff
    style MONGO fill:#4DB33D,color:#fff
    style REDIS fill:#DC382D,color:#fff
```

## 6. Pipeline CI/CD

```mermaid
flowchart LR
    subgraph Dev["👨‍💻 Development"]
        CODE[Code Changes]
        PR[Pull Request]
    end

    subgraph CI["🔄 CI Pipeline"]
        LINT[ESLint]
        TEST[Jest Tests]
        BUILD[Docker Build]
        SCAN[Security Scan]
    end

    subgraph CD["🚀 CD Pipeline"]
        STAGE[Staging Deploy]
        E2E[E2E Tests]
        PROD[Production Deploy]
    end

    subgraph Monitor["📊 Monitoring"]
        LOGS[Logs]
        METRICS[Metrics]
        ALERTS[Alerts]
    end

    CODE --> PR --> LINT --> TEST --> BUILD --> SCAN
    SCAN --> STAGE --> E2E --> PROD
    PROD --> LOGS & METRICS & ALERTS

    style CODE fill:#e3f2fd
    style PROD fill:#c8e6c9
    style ALERTS fill:#ffcdd2
```

## 7. Modelo de Dominio (DDD)

```mermaid
flowchart TB
    subgraph Catalog["📚 Bounded Context: Catálogo"]
        PROD_AGG[Product Aggregate]
        CAT_AGG[Category Aggregate]
        PROD_AGG --> CAT_AGG
    end

    subgraph Sales["💰 Bounded Context: Ventas"]
        ORDER_AGG[Order Aggregate]
        CART_AGG[Cart Aggregate]
        PAY_AGG[Payment Aggregate]
        CART_AGG --> ORDER_AGG --> PAY_AGG
    end

    subgraph Identity["👤 Bounded Context: Identidad"]
        USER_AGG[User Aggregate]
        AUTH_AGG[Auth Aggregate]
        USER_AGG --> AUTH_AGG
    end

    subgraph Engagement["💬 Bounded Context: Engagement"]
        REV_AGG[Review Aggregate]
        WISH_AGG[Wishlist Aggregate]
        NOTIF_AGG[Notification Aggregate]
    end

    Catalog -.->|Product Info| Sales
    Identity -.->|User Info| Sales
    Sales -.->|Order Events| Engagement
    Catalog -.->|Product Info| Engagement
```

---

## 🎨 Cómo Visualizar estos Diagramas

### Opción 1: GitHub (Automático)
GitHub renderiza Mermaid automáticamente. Solo sube este archivo.

### Opción 2: VS Code
Instala la extensión "Markdown Preview Mermaid Support"

### Opción 3: Online
Copia el código Mermaid a: https://mermaid.live

### Opción 4: Exportar como imagen
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i architecture-diagrams.md -o diagrams.png
```

---

*Generado el 24 de Diciembre 2025*
*Proyecto: Flores Victoria E-commerce Platform*
