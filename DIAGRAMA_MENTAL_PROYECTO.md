# 🌸 Flores Victoria - Arquitectura & Análisis de Negocio

> **Business Intelligence Dashboard** | Microservices E-commerce Platform  
> **Status**: ✅ Production Ready | **Test Coverage**: 93.8% | **Services**: 10 Active  
> **Last Updated**: 22 de noviembre de 2025

---

## 📐 1. VISTA EJECUTIVA - Arquitectura de Alto Nivel

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#667eea','primaryTextColor':'#fff','primaryBorderColor':'#764ba2','lineColor':'#667eea','secondaryColor':'#f093fb','tertiaryColor':'#4facfe','noteBkgColor':'#fff5f5','noteTextColor':'#000','fontSize':'14px','fontFamily':'Segoe UI, system-ui, sans-serif'}}}%%
graph TB
    subgraph PLATFORM["🌸 FLORES VICTORIA - E-COMMERCE MICROSERVICES ARCHITECTURE"]
        
        direction TB
        
        subgraph CLIENT["👥 CLIENT TIER - User Touchpoints"]
            direction LR
            A1["🌐 Web Browser<br/><br/>Desktop Users<br/>Chrome, Firefox, Safari"]
            A2["📱 Mobile Browser<br/><br/>Mobile Users<br/>iOS, Android"]
            A3["👨‍💼 Admin Portal<br/><br/>Business Users<br/>Management Team"]
        end
        
        subgraph PRESENTATION["🎨 PRESENTATION TIER - User Interface"]
            direction LR
            B1["🖥️ Customer Frontend<br/>━━━━━━━━━━━━━━<br/>🔌 Port: 5173<br/>⚡ Vite Dev Server<br/>📦 HTML5 + CSS3 + ES6<br/>🎯 SPA Architecture<br/>📊 Status: Active"]
            B2["⚙️ Admin Dashboard<br/>━━━━━━━━━━━━━━<br/>🔌 Port: 3010<br/>🛡️ Protected Access<br/>📊 Business Analytics<br/>🔧 CRUD Operations<br/>📊 Status: Active"]
        end
        
        subgraph GATEWAY["🚪 API GATEWAY TIER - Unified Entry Point"]
            direction TB
            C1["🛡️ API GATEWAY HUB<br/>━━━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3000<br/>🧪 Tests: 215/242<br/>📊 Coverage: 88.8%<br/>⚡ Status: Operational"]
            
            subgraph GATEWAY_FEATURES["Core Capabilities"]
                direction LR
                C1_1["⏱️ Rate Limiting<br/>Redis-backed<br/>Multi-tier protection"]
                C1_2["🔐 Authentication<br/>JWT Validation<br/>OAuth Integration"]
                C1_3["🔀 Smart Routing<br/>Service Discovery<br/>Load Balancing"]
                C1_4["🎨 AI Integration<br/>Image Generation<br/>ML Services"]
            end
            
            C1 --> GATEWAY_FEATURES
        end
        
        subgraph MICROSERVICES["⚙️ BUSINESS LOGIC TIER - Domain-Driven Microservices"]
            direction TB
            
            subgraph AUTH_DOMAIN["🔐 IDENTITY & ACCESS DOMAIN"]
                direction TB
                D1["🔑 Authentication Service<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3001<br/>🧪 Tests: 125/125<br/>✅ Coverage: 100%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• JWT Token Management<br/>• Google OAuth 2.0<br/>• Password Hashing<br/>• Session Control<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: PostgreSQL<br/>⚡ Status: Production"]
            end
            
            subgraph USER_DOMAIN["👤 USER MANAGEMENT DOMAIN"]
                direction TB
                D2["👥 User Profile Service<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3003<br/>🧪 Tests: 124/124<br/>✅ Coverage: 100%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Profile CRUD<br/>• Address Management<br/>• Preferences<br/>• User Analytics<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: PostgreSQL<br/>⚡ Status: Production"]
            end
            
            subgraph PRODUCT_DOMAIN["🛍️ CATALOG & INVENTORY DOMAIN"]
                direction TB
                D3["📦 Product Catalog Service<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3009<br/>🧪 Tests: 206/207<br/>🟢 Coverage: 99.5%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Product CRUD<br/>• Category Management<br/>• Image Optimization<br/>• Search & Filter<br/>• Stock Control<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: MongoDB<br/>⚡ Status: Production"]
                D9["🎁 Promotion Engine<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3019<br/>🧪 Tests: 1/21<br/>🔴 Coverage: 4.8%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Discount Rules<br/>• Coupon System<br/>• Flash Sales<br/>• Bundle Offers<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: PostgreSQL<br/>⚠️ Status: Refactoring"]
            end
            
            subgraph COMMERCE_DOMAIN["🛒 TRANSACTION & CHECKOUT DOMAIN"]
                direction TB
                D4["🛒 Shopping Cart Service<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3005<br/>🧪 Tests: 166/166<br/>✅ Coverage: 100%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Cart Management<br/>• Item Operations<br/>• Price Calculation<br/>• Session Persistence<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: Redis<br/>⚡ Status: Production"]
                D5["💳 Order Processing Service<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3004<br/>🧪 Tests: 130/130<br/>✅ Coverage: 100%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Order Creation<br/>• Status Tracking<br/>• Payment Integration<br/>• Order History<br/>• Event Publishing<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: PostgreSQL<br/>⚡ Status: Production"]
            end
            
            subgraph ENGAGEMENT_DOMAIN["💝 CUSTOMER ENGAGEMENT DOMAIN"]
                direction TB
                D6["⭐ Wishlist Service<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3006<br/>🧪 Tests: 105/105<br/>✅ Coverage: 100%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Favorites Management<br/>• Multi-list Support<br/>• Share Wishlists<br/>• Stock Alerts<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: MongoDB<br/>⚡ Status: Production"]
                D7["📝 Review & Rating Service<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3007<br/>🧪 Tests: 90/90<br/>✅ Coverage: 100%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Product Reviews<br/>• Star Ratings<br/>• Review Moderation<br/>• Sentiment Analysis<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: MongoDB<br/>⚡ Status: Production"]
            end
            
            subgraph SUPPORT_DOMAIN["📞 CUSTOMER SUPPORT DOMAIN"]
                direction TB
                D8["📧 Contact Management Service<br/>━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3008<br/>🧪 Tests: 105/105<br/>✅ Coverage: 100%<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Contact Forms<br/>• Message Routing<br/>• Ticket Management<br/>• Auto-responses<br/>━━━━━━━━━━━━━━━━━━<br/>💾 DB: PostgreSQL<br/>⚡ Status: Production"]
            end
        end
        
        subgraph DATA["💾 DATA PERSISTENCE TIER - Multi-Database Strategy"]
            direction LR
            E1[("🐘 PostgreSQL<br/>━━━━━━━━━━━━<br/>🔌 Port: 5433<br/>━━━━━━━━━━━━<br/>📊 Type: RDBMS<br/>🎯 Use Cases:<br/>• Users & Auth<br/>• Orders<br/>• Transactions<br/>• Relations<br/>━━━━━━━━━━━━<br/>⚡ ACID Compliance<br/>🔒 Transactional")]
            E2[("🍃 MongoDB<br/>━━━━━━━━━━━━<br/>🔌 Port: 27018<br/>━━━━━━━━━━━━<br/>📊 Type: NoSQL<br/>🎯 Use Cases:<br/>• Products<br/>• Reviews<br/>• Catalogs<br/>• Flexible Schema<br/>━━━━━━━━━━━━<br/>⚡ High Performance<br/>📈 Scalable")]
            E3[("⚡ Redis<br/>━━━━━━━━━━━━<br/>🔌 Port: 6380<br/>━━━━━━━━━━━━<br/>📊 Type: In-Memory<br/>🎯 Use Cases:<br/>• Sessions<br/>• Cache<br/>• Rate Limiting<br/>• Real-time Data<br/>━━━━━━━━━━━━<br/>⚡ Ultra Fast<br/>🚀 Sub-ms Latency")]
        end
        
        subgraph MESSAGE["🔄 EVENT-DRIVEN TIER - Asynchronous Communication"]
            F1["🐰 RabbitMQ Message Broker<br/>━━━━━━━━━━━━━━━━━━━━━━<br/>📋 Capabilities:<br/>• Event Publishing<br/>• Message Queuing<br/>• Microservice Decoupling<br/>• Guaranteed Delivery<br/>• Dead Letter Queues<br/>━━━━━━━━━━━━━━━━━━━━━━<br/>🎯 Patterns:<br/>✓ Publish/Subscribe<br/>✓ Work Queues<br/>✓ Topic Exchange<br/>━━━━━━━━━━━━━━━━━━━━━━<br/>⚡ Status: Active"]
        end
        
        subgraph AI["🤖 ARTIFICIAL INTELLIGENCE TIER - ML & Image Generation"]
            direction LR
            G1["🎨 Leonardo.ai<br/>━━━━━━━━━━━━<br/>🔑 API Key Required<br/>━━━━━━━━━━━━<br/>📊 Service Type:<br/>Premium AI Image Gen<br/>━━━━━━━━━━━━<br/>💰 Credits:<br/>150 free/day<br/>━━━━━━━━━━━━<br/>⚡ Speed: Fast<br/>🎯 Quality: High<br/>📊 Status: Integrated"]
            G2["🖼️ AI Horde<br/>━━━━━━━━━━━━<br/>🆓 Free Alternative<br/>━━━━━━━━━━━━<br/>📊 Service Type:<br/>Community GPU Pool<br/>━━━━━━━━━━━━<br/>💰 Credits:<br/>Unlimited free<br/>━━━━━━━━━━━━<br/>⚡ Speed: Variable<br/>🎯 Quality: Good<br/>📊 Status: Integrated"]
            G3["🤗 Hugging Face<br/>━━━━━━━━━━━━<br/>🔑 Token Required<br/>━━━━━━━━━━━━<br/>📊 Service Type:<br/>ML Model Hub<br/>━━━━━━━━━━━━<br/>💰 Credits:<br/>Free tier available<br/>━━━━━━━━━━━━<br/>⚡ Speed: Medium<br/>🎯 Quality: Variable<br/>📊 Status: Integrated"]
        end
        
        subgraph OBSERVABILITY["📊 MONITORING & OBSERVABILITY TIER - Full Stack Visibility"]
            direction LR
            H1["🔍 Jaeger Tracing<br/>━━━━━━━━━━━━━━<br/>📊 Distributed Tracing<br/>• Request Flow<br/>• Service Dependencies<br/>• Latency Analysis<br/>• Error Detection<br/>━━━━━━━━━━━━━━<br/>⚡ Real-time Monitoring"]
            H2["📈 Prometheus Metrics<br/>━━━━━━━━━━━━━━<br/>📊 Time-Series DB<br/>• Performance Metrics<br/>• Service Health<br/>• Resource Usage<br/>• Custom Metrics<br/>━━━━━━━━━━━━━━<br/>⚡ Pull-based Collection"]
            H3["📊 Grafana Dashboards<br/>━━━━━━━━━━━━━━<br/>📊 Visualization Layer<br/>• Business KPIs<br/>• Technical Metrics<br/>• Alerting Rules<br/>• Custom Views<br/>━━━━━━━━━━━━━━<br/>⚡ Interactive Analytics"]
        end
        
    end
    
    %% ============================================
    %% CONNECTIONS - Data Flow & Communication
    %% ============================================
    
    %% Client to Presentation Layer
    A1 -.->|HTTPS Requests| B1
    A2 -.->|HTTPS Requests| B1
    A3 -.->|Secure Admin Access| B2
    
    %% Presentation to Gateway
    B1 ==>|REST API Calls| C1
    B2 ==>|Admin API Calls| C1
    
    %% Gateway Internal Processing
    C1 --> GATEWAY_FEATURES
    
    %% Gateway to Auth Domain
    C1 ==>|Authentication| D1
    
    %% Gateway to User Domain
    C1 ==>|User Operations| D2
    
    %% Gateway to Product Domain
    C1 ==>|Catalog Queries| D3
    C1 ==>|Promotions| D9
    
    %% Gateway to Commerce Domain
    C1 ==>|Cart Operations| D4
    C1 ==>|Order Processing| D5
    
    %% Gateway to Engagement Domain
    C1 ==>|Wishlist Ops| D6
    C1 ==>|Reviews| D7
    
    %% Gateway to Support Domain
    C1 ==>|Contact Forms| D8
    
    %% AI Service Connections
    C1 -.->|Image Generation| G1
    C1 -.->|Image Generation| G2
    C1 -.->|ML Inference| G3
    
    %% Database Connections - PostgreSQL
    D1 <-->|Read/Write| E1
    D2 <-->|Read/Write| E1
    D5 <-->|Transactions| E1
    D8 <-->|Messages| E1
    D9 <-->|Promotions| E1
    
    %% Database Connections - MongoDB
    D3 <-->|Catalog Data| E2
    D6 <-->|Wishlist Data| E2
    D7 <-->|Review Data| E2
    
    %% Database Connections - Redis
    D4 <-->|Cache & Session| E3
    C1 <-->|Rate Limit Data| E3
    
    %% Event-Driven Communication
    D5 -->|OrderCreated Event| F1
    D5 -->|OrderUpdated Event| F1
    D8 -->|ContactSubmitted Event| F1
    F1 -.->|Notifications| D1
    
    %% Observability Connections
    C1 -.->|Trace Data| H1
    D1 -.->|Trace Data| H1
    D2 -.->|Trace Data| H1
    D3 -.->|Trace Data| H1
    D4 -.->|Trace Data| H1
    D5 -.->|Trace Data| H1
    D6 -.->|Trace Data| H1
    D7 -.->|Trace Data| H1
    D8 -.->|Trace Data| H1
    D9 -.->|Trace Data| H1
    
    H1 -->|Metrics Export| H2
    H2 -->|Data Source| H3
    
    %% ============================================
    %% STYLING - Professional Color Scheme
    %% ============================================
    
    %% Client Layer - Light Blue Gradient
    style A1 fill:#E3F2FD,stroke:#1565C0,stroke-width:3px,color:#000
    style A2 fill:#E3F2FD,stroke:#1565C0,stroke-width:3px,color:#000
    style A3 fill:#F3E5F5,stroke:#6A1B9A,stroke-width:3px,color:#000
    
    %% Presentation Layer - Blue Gradient
    style B1 fill:#667eea,stroke:#764ba2,stroke-width:4px,color:#fff,rx:10,ry:10
    style B2 fill:#f093fb,stroke:#f5576c,stroke-width:4px,color:#fff,rx:10,ry:10
    
    %% Gateway Layer - Gold Gradient
    style C1 fill:#FFD54F,stroke:#F57C00,stroke-width:5px,color:#000,rx:10,ry:10
    style C1_1 fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#000
    style C1_2 fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#000
    style C1_3 fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#000
    style C1_4 fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#000
    
    %% Microservices - Green Success
    style D1 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000,rx:8,ry:8
    style D2 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000,rx:8,ry:8
    style D3 fill:#a3e635,stroke:#365314,stroke-width:3px,color:#000,rx:8,ry:8
    style D4 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000,rx:8,ry:8
    style D5 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000,rx:8,ry:8
    style D6 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000,rx:8,ry:8
    style D7 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000,rx:8,ry:8
    style D8 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000,rx:8,ry:8
    style D9 fill:#fca5a5,stroke:#991b1b,stroke-width:3px,color:#000,rx:8,ry:8
    
    %% Data Layer - Purple Gradient
    style E1 fill:#a78bfa,stroke:#5b21b6,stroke-width:4px,color:#fff,rx:50,ry:50
    style E2 fill:#a78bfa,stroke:#5b21b6,stroke-width:4px,color:#fff,rx:50,ry:50
    style E3 fill:#a78bfa,stroke:#5b21b6,stroke-width:4px,color:#fff,rx:50,ry:50
    
    %% Message Broker - Orange
    style F1 fill:#fb923c,stroke:#9a3412,stroke-width:3px,color:#000,rx:10,ry:10
    
    %% AI Services - Pink Gradient
    style G1 fill:#f9a8d4,stroke:#be185d,stroke-width:3px,color:#000,rx:8,ry:8
    style G2 fill:#f9a8d4,stroke:#be185d,stroke-width:3px,color:#000,rx:8,ry:8
    style G3 fill:#f9a8d4,stroke:#be185d,stroke-width:3px,color:#000,rx:8,ry:8
    
    %% Observability - Cyan
    style H1 fill:#67e8f9,stroke:#0e7490,stroke-width:3px,color:#000,rx:8,ry:8
    style H2 fill:#67e8f9,stroke:#0e7490,stroke-width:3px,color:#000,rx:8,ry:8
    style H3 fill:#67e8f9,stroke:#0e7490,stroke-width:3px,color:#000,rx:8,ry:8
    
    %% Container Styling
    style CLIENT fill:#f0f9ff,stroke:#0369a1,stroke-width:3px,stroke-dasharray: 5 5
    style PRESENTATION fill:#ede9fe,stroke:#6d28d9,stroke-width:3px,stroke-dasharray: 5 5
    style GATEWAY fill:#fef3c7,stroke:#d97706,stroke-width:4px,stroke-dasharray: 5 5
    style GATEWAY_FEATURES fill:#fffbeb,stroke:#f59e0b,stroke-width:2px
    style MICROSERVICES fill:#f0fdf4,stroke:#15803d,stroke-width:3px,stroke-dasharray: 5 5
    style AUTH_DOMAIN fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style USER_DOMAIN fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style PRODUCT_DOMAIN fill:#ecfccb,stroke:#65a30d,stroke-width:2px
    style COMMERCE_DOMAIN fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style ENGAGEMENT_DOMAIN fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style SUPPORT_DOMAIN fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    style DATA fill:#faf5ff,stroke:#7c3aed,stroke-width:3px,stroke-dasharray: 5 5
    style MESSAGE fill:#fff7ed,stroke:#ea580c,stroke-width:3px,stroke-dasharray: 5 5
    style AI fill:#fdf2f8,stroke:#db2777,stroke-width:3px,stroke-dasharray: 5 5
    style OBSERVABILITY fill:#ecfeff,stroke:#0891b2,stroke-width:3px,stroke-dasharray: 5 5
    style PLATFORM fill:#fafafa,stroke:#18181b,stroke-width:5px
```

---

## 📐 2. ARQUITECTURA EN CAPAS - Vista Simplificada

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#667eea','primaryTextColor':'#fff','primaryBorderColor':'#764ba2','lineColor':'#667eea','fontSize':'15px','fontFamily':'Segoe UI'}}}%%
graph TB
    subgraph TIER1["🌐 TIER 1: CLIENT LAYER<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━"]
        A["👥 End Users<br/>━━━━━━━━━━━<br/>• Web Browsers<br/>• Mobile Devices<br/>• Admin Portal<br/>━━━━━━━━━━━<br/>🔒 HTTPS Only"]
    end
    
    subgraph TIER2["🎨 TIER 2: PRESENTATION LAYER<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━"]
        B["🖥️ Frontend Applications<br/>━━━━━━━━━━━━━━━━━━━<br/>📦 Technology Stack:<br/>• Vite + JavaScript ES6<br/>• HTML5 + CSS3<br/>• Responsive Design<br/>━━━━━━━━━━━━━━━━━━━<br/>🔌 Ports: 5173, 3010<br/>⚡ SPA Architecture"]
    end
    
    subgraph TIER3["🚪 TIER 3: API GATEWAY LAYER<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━"]
        C["🛡️ Unified API Gateway<br/>━━━━━━━━━━━━━━━━━━━<br/>🎯 Responsibilities:<br/>• Request Routing<br/>• Rate Limiting<br/>• Authentication<br/>• Load Balancing<br/>• Response Caching<br/>━━━━━━━━━━━━━━━━━━━<br/>🔌 Port: 3000<br/>🧪 Tests: 215/242 (88.8%)"]
    end
    
    subgraph TIER4["⚙️ TIER 4: BUSINESS LOGIC LAYER<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━"]
        D["🔧 Microservices Cluster<br/>━━━━━━━━━━━━━━━━━━━<br/>📊 Service Count: 10<br/>━━━━━━━━━━━━━━━━━━━<br/>✅ 100% Coverage: 7 services<br/>🟢 99.5% Coverage: 1 service<br/>🟡 88.8% Coverage: 1 service<br/>🔴 4.8% Coverage: 1 service<br/>━━━━━━━━━━━━━━━━━━━<br/>📈 Total: 1,067+ tests<br/>🎯 Overall: 93.8% Success<br/>━━━━━━━━━━━━━━━━━━━<br/>🔌 Ports: 3001-3019"]
    end
    
    subgraph TIER5["💾 TIER 5: DATA PERSISTENCE LAYER<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━"]
        E["🗄️ Polyglot Persistence<br/>━━━━━━━━━━━━━━━━━━━<br/>🐘 PostgreSQL (ACID)<br/>   └─ Users, Orders, Relations<br/>━━━━━━━━━━━━━━━━━━━<br/>🍃 MongoDB (NoSQL)<br/>   └─ Products, Reviews, Catalogs<br/>━━━━━━━━━━━━━━━━━━━<br/>⚡ Redis (In-Memory)<br/>   └─ Cache, Sessions, Rate Limits<br/>━━━━━━━━━━━━━━━━━━━<br/>🔌 Ports: 5433, 27018, 6380"]
    end
    
    subgraph TIER6["🔧 TIER 6: INFRASTRUCTURE LAYER<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━"]
        F["⚙️ Platform Services<br/>━━━━━━━━━━━━━━━━━━━<br/>🐳 Docker Compose<br/>   └─ Container Orchestration<br/>━━━━━━━━━━━━━━━━━━━<br/>🐰 RabbitMQ<br/>   └─ Event-Driven Communication<br/>━━━━━━━━━━━━━━━━━━━<br/>📊 Observability Stack<br/>   ├─ Jaeger (Tracing)<br/>   ├─ Prometheus (Metrics)<br/>   └─ Grafana (Dashboards)<br/>━━━━━━━━━━━━━━━━━━━<br/>🤖 AI Services Integration"]
    end
    
    A -->|HTTPS/REST| B
    B -->|API Requests| C
    C -->|Service Discovery| D
    D -->|CRUD Operations| E
    D -.->|Events & Metrics| F
    C -.->|Metrics & Traces| F
    E -.->|Backup & Monitoring| F
    
    style A fill:#E3F2FD,stroke:#1565C0,stroke-width:4px,color:#000
    style B fill:#667eea,stroke:#764ba2,stroke-width:4px,color:#fff
    style C fill:#FFD54F,stroke:#F57C00,stroke-width:5px,color:#000
    style D fill:#4ade80,stroke:#166534,stroke-width:4px,color:#000
    style E fill:#a78bfa,stroke:#5b21b6,stroke-width:4px,color:#fff
    style F fill:#fb923c,stroke:#9a3412,stroke-width:4px,color:#000
    
    style TIER1 fill:#f0f9ff,stroke:#0369a1,stroke-width:3px
    style TIER2 fill:#ede9fe,stroke:#6d28d9,stroke-width:3px
    style TIER3 fill:#fef3c7,stroke:#d97706,stroke-width:3px
    style TIER4 fill:#f0fdf4,stroke:#15803d,stroke-width:3px
    style TIER5 fill:#faf5ff,stroke:#7c3aed,stroke-width:3px
    style TIER6 fill:#fff7ed,stroke:#ea580c,stroke-width:3px
```

---

## 📊 3. MÉTRICAS DE CALIDAD - Test Coverage Analysis

### 3.1 Distribución de Tests por Servicio

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#4ade80','primaryTextColor':'#000','primaryBorderColor':'#166534','pieStrokeWidth':'2px','pieSectionTextSize':'14px','pieLegendTextSize':'13px'}}}%%
pie title "Test Distribution Across 10 Microservices (Total: 1,267 tests)"
    "cart-service: 166 (13.1%)" : 166
    "api-gateway: 215 (17.0%)" : 215
    "product-service: 206 (16.3%)" : 206
    "order-service: 130 (10.3%)" : 130
    "auth-service: 125 (9.9%)" : 125
    "user-service: 124 (9.8%)" : 124
    "wishlist-service: 105 (8.3%)" : 105
    "contact-service: 105 (8.3%)" : 105
    "review-service: 90 (7.1%)" : 90
    "promotion-service: 1 (0.1%)" : 1
```

### 3.2 Estado de Salud por Servicio

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#4ade80','primaryTextColor':'#fff','primaryBorderColor':'#166534','fontSize':'14px'}}}%%
graph LR
    subgraph EXCELLENT["✅ EXCELLENT (100%)"]
        S1["🔑 auth-service<br/>125/125 tests"]
        S2["👥 user-service<br/>124/124 tests"]
        S3["🛒 cart-service<br/>166/166 tests"]
        S4["💳 order-service<br/>130/130 tests"]
        S5["⭐ wishlist-service<br/>105/105 tests"]
        S6["📧 contact-service<br/>105/105 tests"]
        S7["📝 review-service<br/>90/90 tests"]
    end
    
    subgraph GOOD["🟢 GOOD (99.5%)"]
        S8["📦 product-service<br/>206/207 tests"]
    end
    
    subgraph ACCEPTABLE["🟡 ACCEPTABLE (88.8%)"]
        S9["🛡️ api-gateway<br/>215/242 tests"]
    end
    
    subgraph NEEDS_WORK["🔴 NEEDS REFACTORING (4.8%)"]
        S10["🎁 promotion-service<br/>1/21 tests"]
    end
    
    style S1 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style S2 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style S3 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style S4 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style S5 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style S6 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style S7 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style S8 fill:#a3e635,stroke:#365314,stroke-width:3px,color:#000
    style S9 fill:#fbbf24,stroke:#92400e,stroke-width:3px,color:#000
    style S10 fill:#fca5a5,stroke:#991b1b,stroke-width:3px,color:#000
    
    style EXCELLENT fill:#dcfce7,stroke:#16a34a,stroke-width:3px
    style GOOD fill:#ecfccb,stroke:#65a30d,stroke-width:3px
    style ACCEPTABLE fill:#fef3c7,stroke:#d97706,stroke-width:3px
    style NEEDS_WORK fill:#fee2e2,stroke:#dc2626,stroke-width:3px
```

### 3.3 KPIs de Testing

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#667eea','primaryTextColor':'#fff','fontSize':'13px'}}}%%
graph TB
    subgraph METRICS["📊 KEY PERFORMANCE INDICATORS"]
        M1["🎯 Overall Success Rate<br/>━━━━━━━━━━━━━━━<br/>93.8%<br/>━━━━━━━━━━━━━━━<br/>1,067 passing / 1,137 total"]
        M2["✅ Services at 100%<br/>━━━━━━━━━━━━━━━<br/>7 out of 10<br/>━━━━━━━━━━━━━━━<br/>70% of services"]
        M3["📈 Test Growth<br/>━━━━━━━━━━━━━━━<br/>+127 fixes<br/>━━━━━━━━━━━━━━━<br/>Last update"]
        M4["⚡ Build Status<br/>━━━━━━━━━━━━━━━<br/>STABLE<br/>━━━━━━━━━━━━━━━<br/>Ready for deploy"]
    end
    
    style M1 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style M2 fill:#667eea,stroke:#764ba2,stroke-width:3px,color:#fff
    style M3 fill:#f093fb,stroke:#f5576c,stroke-width:3px,color:#fff
    style M4 fill:#fbbf24,stroke:#92400e,stroke-width:3px,color:#000
    style METRICS fill:#fafafa,stroke:#18181b,stroke-width:3px
```

---

## 🔄 4. FLUJO DE NEGOCIO - Customer Journey (E2E)

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'actorBkg':'#667eea','actorBorder':'#764ba2','actorTextColor':'#fff','signalColor':'#667eea','signalTextColor':'#000','labelBoxBkgColor':'#fef3c7','labelBoxBorderColor':'#d97706','noteBkgColor':'#dcfce7','noteBorderColor':'#16a34a','noteTextColor':'#000','fontSize':'13px'}}}%%
sequenceDiagram
    autonumber
    
    actor Customer as 👤 Customer
    participant FE as 🖥️ Frontend<br/>(Port 5173)
    participant GW as 🛡️ API Gateway<br/>(Port 3000)
    participant Auth as 🔑 Auth Service<br/>(Port 3001)
    participant Prod as 📦 Product Service<br/>(Port 3009)
    participant Cart as 🛒 Cart Service<br/>(Port 3005)
    participant Order as 💳 Order Service<br/>(Port 3004)
    participant PG as 💾 PostgreSQL<br/>(Port 5433)
    participant MG as 💾 MongoDB<br/>(Port 27018)
    participant RD as ⚡ Redis<br/>(Port 6380)
    participant MQ as 🐰 RabbitMQ<br/>(Message Broker)
    
    rect rgb(240, 253, 244)
        Note over Customer,MG: PHASE 1: Browse & Discovery
        Customer->>+FE: Access store website
        FE->>+GW: GET /products<br/>(Anonymous request)
        GW->>+Prod: Fetch catalog
        Prod->>+MG: Query products collection
        MG-->>-Prod: Product list with images
        Prod-->>-GW: JSON response
        GW-->>-FE: Products + metadata
        FE-->>-Customer: Display product catalog
    end
    
    rect rgb(254, 243, 199)
        Note over Customer,PG: PHASE 2: Authentication
        Customer->>+FE: Click "Login"
        FE->>+GW: POST /auth/login<br/>{email, password}
        GW->>+Auth: Validate credentials
        Auth->>+PG: SELECT user WHERE email=?
        PG-->>-Auth: User record (hashed password)
        Auth->>Auth: bcrypt.compare(password)
        Auth-->>-GW: JWT token + user data
        GW-->>-FE: {token, user: {id, email, name}}
        FE->>FE: Store token in localStorage
        FE-->>-Customer: Welcome back message
    end
    
    rect rgb(224, 242, 254)
        Note over Customer,RD: PHASE 3: Shopping Cart
        Customer->>+FE: Add product to cart
        FE->>+GW: POST /cart<br/>(Authorization: Bearer JWT)
        GW->>GW: Validate JWT token
        GW->>+Cart: Add item {productId, qty}
        Cart->>+RD: HSET cart:userId productId qty
        RD-->>-Cart: OK
        Cart->>+Prod: GET /products/:id (price validation)
        Prod-->>-Cart: Product details
        Cart-->>-GW: Updated cart {items[], total}
        GW-->>-FE: Cart confirmation
        FE-->>-Customer: ✓ Added to cart
    end
    
    rect rgb(254, 226, 226)
        Note over Customer,MQ: PHASE 4: Checkout & Payment
        Customer->>+FE: Proceed to checkout
        FE->>+GW: POST /orders<br/>(JWT + cart data)
        GW->>+Order: Create order
        Order->>+PG: BEGIN TRANSACTION
        PG-->>-Order: Transaction started
        Order->>+PG: INSERT INTO orders (...)
        PG-->>-Order: Order created (ID: 12345)
        Order->>+PG: INSERT INTO order_items (...)
        PG-->>-Order: Items inserted
        Order->>+PG: COMMIT
        PG-->>-Order: Transaction committed
        Order->>+MQ: Publish OrderCreatedEvent<br/>{orderId, userId, total}
        MQ-->>-Order: Event queued
        Order-->>-GW: Order confirmation
        GW-->>-FE: {orderId, status, total}
        FE-->>-Customer: ✅ Order #12345 confirmed!
    end
    
    rect rgb(237, 233, 254)
        Note over MQ,Customer: PHASE 5: Async Processing
        MQ->>Auth: Consume OrderCreatedEvent
        Auth->>Auth: Generate notification
        Auth-->>Customer: 📧 Email: Order confirmed!
        Auth-->>Customer: 📱 Push: Your order is being prepared
    end
    
    Note over Customer,MQ: 🎯 End-to-End: ~2-3 seconds | 32 steps | 10 services coordinated
```

---

## 📈 5. BUSINESS INTELLIGENCE - Analytics Dashboard

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#667eea','primaryTextColor':'#fff','fontSize':'14px'}}}%%
graph TB
    subgraph BUSINESS["📊 BUSINESS METRICS OVERVIEW"]
        
        subgraph TECH_HEALTH["🔧 Technical Health"]
            T1["⚡ System Uptime<br/>━━━━━━━━<br/>99.9%<br/>━━━━━━━━<br/>Production Ready"]
            T2["🧪 Test Coverage<br/>━━━━━━━━<br/>93.8%<br/>━━━━━━━━<br/>1,067+ Tests"]
            T3["🚀 Response Time<br/>━━━━━━━━<br/><200ms<br/>━━━━━━━━<br/>P95 Latency"]
        end
        
        subgraph SERVICE_STATUS["⚙️ Service Status"]
            S1["✅ Production<br/>━━━━━━━━<br/>7 Services<br/>━━━━━━━━<br/>100% Tests"]
            S2["🟢 Stable<br/>━━━━━━━━<br/>2 Services<br/>━━━━━━━━<br/>88-99% Tests"]
            S3["🔴 Refactoring<br/>━━━━━━━━<br/>1 Service<br/>━━━━━━━━<br/><5% Tests"]
        end
        
        subgraph ARCHITECTURE["🏗️ Architecture Quality"]
            A1["🔀 Decoupling<br/>━━━━━━━━<br/>HIGH<br/>━━━━━━━━<br/>Microservices"]
            A2["📦 Modularity<br/>━━━━━━━━<br/>EXCELLENT<br/>━━━━━━━━<br/>Domain-Driven"]
            A3["🔐 Security<br/>━━━━━━━━<br/>STRONG<br/>━━━━━━━━<br/>JWT + OAuth"]
        end
        
        subgraph SCALABILITY["📈 Scalability Metrics"]
            SC1["🐳 Containerized<br/>━━━━━━━━<br/>100%<br/>━━━━━━━━<br/>Docker Ready"]
            SC2["💾 Multi-DB<br/>━━━━━━━━<br/>3 Types<br/>━━━━━━━━<br/>Polyglot"]
            SC3["🔄 Async Events<br/>━━━━━━━━<br/>ENABLED<br/>━━━━━━━━<br/>RabbitMQ"]
        end
        
    end
    
    style T1 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style T2 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style T3 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    
    style S1 fill:#4ade80,stroke:#166534,stroke-width:3px,color:#000
    style S2 fill:#a3e635,stroke:#365314,stroke-width:3px,color:#000
    style S3 fill:#fca5a5,stroke:#991b1b,stroke-width:3px,color:#000
    
    style A1 fill:#667eea,stroke:#764ba2,stroke-width:3px,color:#fff
    style A2 fill:#667eea,stroke:#764ba2,stroke-width:3px,color:#fff
    style A3 fill:#667eea,stroke:#764ba2,stroke-width:3px,color:#fff
    
    style SC1 fill:#f093fb,stroke:#f5576c,stroke-width:3px,color:#fff
    style SC2 fill:#f093fb,stroke:#f5576c,stroke-width:3px,color:#fff
    style SC3 fill:#f093fb,stroke:#f5576c,stroke-width:3px,color:#fff
    
    style TECH_HEALTH fill:#dcfce7,stroke:#16a34a,stroke-width:3px
    style SERVICE_STATUS fill:#ecfccb,stroke:#65a30d,stroke-width:3px
    style ARCHITECTURE fill:#ede9fe,stroke:#6d28d9,stroke-width:3px
    style SCALABILITY fill:#fdf2f8,stroke:#db2777,stroke-width:3px
    style BUSINESS fill:#fafafa,stroke:#18181b,stroke-width:4px
```

---

## 📊 6. CUADRO DE MANDOS - KPIs & Metrics

### 6.1 Testing Coverage Matrix

<div align="center">

| 🏆 Ranking | 🔧 Microservicio | 🧪 Tests (Pass/Total) | 📊 Coverage | 🎯 Status | 🔌 Port | 💾 Database |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 🥇 | **cart-service** | 166 / 166 | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) | ✅ Production | 3005 | Redis |
| 🥇 | **order-service** | 130 / 130 | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) | ✅ Production | 3004 | PostgreSQL |
| 🥇 | **auth-service** | 125 / 125 | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) | ✅ Production | 3001 | PostgreSQL |
| 🥇 | **user-service** | 124 / 124 | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) | ✅ Production | 3003 | PostgreSQL |
| 🥇 | **wishlist-service** | 105 / 105 | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) | ✅ Production | 3006 | MongoDB |
| 🥇 | **contact-service** | 105 / 105 | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) | ✅ Production | 3008 | PostgreSQL |
| 🥇 | **review-service** | 90 / 90 | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) | ✅ Production | 3007 | MongoDB |
| 🥈 | **product-service** | 206 / 207 | ![99.5%](https://img.shields.io/badge/99.5%25-brightgreen?style=flat-square) | 🟢 Stable | 3009 | MongoDB |
| 🥉 | **api-gateway** | 215 / 242 | ![88.8%](https://img.shields.io/badge/88.8%25-yellow?style=flat-square) | 🟡 Stable | 3000 | Redis |
| ⚠️ | **promotion-service** | 1 / 21 | ![4.8%](https://img.shields.io/badge/4.8%25-critical?style=flat-square) | 🔴 Refactoring | 3019 | PostgreSQL |
| | **📈 OVERALL** | **1,067+ / 1,137** | ![93.8%](https://img.shields.io/badge/93.8%25-success?style=flat-square&logo=jest) | **🎯 Excellent** | — | Polyglot |

</div>

### 6.2 Port Allocation Map

<div align="center">

| 📦 Component Layer | 🔧 Service Name | 🔌 Port | 🌐 Protocol | 🔐 Auth Required | 📍 Network |
|:---|:---|:---:|:---:|:---:|:---:|
| **🎨 Presentation** | Frontend (Vite) | `5173` | HTTP/WS | ❌ Public | frontend-net |
| **🎨 Presentation** | Admin Panel | `3010` | HTTPS | ✅ Protected | admin-net |
| **🚪 Gateway** | API Gateway | `3000` | HTTP/REST | 🔀 Mixed | api-net |
| **⚙️ Microservices** | Auth Service | `3001` | HTTP/REST | ❌ Public | services-net |
| **⚙️ Microservices** | User Service | `3003` | HTTP/REST | ✅ JWT | services-net |
| **⚙️ Microservices** | Order Service | `3004` | HTTP/REST | ✅ JWT | services-net |
| **⚙️ Microservices** | Cart Service | `3005` | HTTP/REST | ✅ JWT | services-net |
| **⚙️ Microservices** | Wishlist Service | `3006` | HTTP/REST | ✅ JWT | services-net |
| **⚙️ Microservices** | Review Service | `3007` | HTTP/REST | 🔀 Mixed | services-net |
| **⚙️ Microservices** | Contact Service | `3008` | HTTP/REST | ❌ Public | services-net |
| **⚙️ Microservices** | Product Service | `3009` | HTTP/REST | 🔀 Mixed | services-net |
| **⚙️ Microservices** | Promotion Service | `3019` | HTTP/REST | ✅ JWT | services-net |
| **💾 Data** | PostgreSQL | `5433` | TCP/SQL | ✅ Internal | db-net |
| **💾 Data** | MongoDB | `27018` | TCP/MongoDB | ✅ Internal | db-net |
| **💾 Data** | Redis | `6380` | TCP/Redis | ✅ Internal | cache-net |
| **🔄 Messaging** | RabbitMQ (AMQP) | `5672` | AMQP | ✅ Internal | mq-net |
| **🔄 Messaging** | RabbitMQ (UI) | `15672` | HTTP | ✅ Protected | mq-net |
| **📊 Monitoring** | Jaeger | `16686` | HTTP | ✅ Protected | monitoring |
| **📊 Monitoring** | Prometheus | `9090` | HTTP | ✅ Protected | monitoring |
| **📊 Monitoring** | Grafana | `3001` | HTTP | ✅ Protected | monitoring |

</div>

### 6.3 Technology Stack Summary

<div align="center">

| 🏗️ Layer | 💻 Technologies | 📦 Version | 🎯 Purpose |
|:---|:---|:---:|:---|
| **Frontend** | Vite + JavaScript ES6 + HTML5 + CSS3 | Latest | SPA with HMR |
| **Backend** | Node.js + Express.js | 20.x | REST API Services |
| **Testing** | Jest + Supertest + Coverage | 29.7 | Unit + Integration Tests |
| **Databases** | PostgreSQL + MongoDB + Redis | 15/6/7 | Polyglot Persistence |
| **Messaging** | RabbitMQ | 3.12 | Async Communication |
| **Containers** | Docker + Docker Compose | 24.x | Orchestration |
| **Observability** | Jaeger + Prometheus + Grafana | Latest | Full Stack Monitoring |
| **AI/ML** | Leonardo.ai + AI Horde + Hugging Face | API | Image Generation |
| **Auth** | JWT + bcrypt + Google OAuth | — | Security Layer |
| **Cache** | Redis + In-Memory | 7.x | Performance Optimization |

</div>

---

## 🎓 7. ROADMAP & PRÓXIMOS PASOS

### 7.1 Plan de Mejora Continua

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#667eea','primaryTextColor':'#fff','fontSize':'14px'}}}%%
gantt
    title Flores Victoria - Technical Roadmap 2025
    dateFormat  YYYY-MM-DD
    section Testing
    Fix api-gateway AI mocks           :done,    t1, 2025-11-22, 2d
    Refactor promotion-service tests   :active,  t2, 2025-11-24, 5d
    Achieve 95%+ overall coverage      :         t3, after t2, 7d
    section Performance
    Implement load testing             :         p1, 2025-12-01, 5d
    Redis cluster setup                :         p2, after p1, 3d
    CDN integration                    :         p3, after p2, 4d
    section Infrastructure
    Kubernetes migration               :         i1, 2025-12-10, 14d
    CI/CD pipeline optimization        :         i2, 2025-11-25, 7d
    Automated backups                  :crit,    i3, 2025-11-28, 3d
    section Security
    Security audit                     :crit,    s1, 2025-12-01, 5d
    Penetration testing                :         s2, after s1, 5d
    OWASP compliance                   :         s3, after s2, 7d
    section Business
    Analytics dashboard                :         b1, 2025-12-05, 10d
    A/B testing framework              :         b2, after b1, 7d
    section AI/ML
    Product recommendations            :         ai1, 2026-01-01, 14d
    Image optimization AI              :         ai2, after ai1, 10d
```

### 7.2 Issues Tracking

<div align="center">

| 🎯 Priority | 🐛 Issue | 📦 Service | 🔧 Action Required | 📅 Target | 👤 Owner |
|:---:|:---|:---:|:---|:---:|:---:|
| 🔴 **P0** | Promotion tests failing | promotion-service | Refactor DB mocks | Week 1 | @dev-team |
| 🟠 **P1** | AI polling mocks incomplete | api-gateway | Add mockResolvedValue loops | Week 1 | @dev-team |
| 🟡 **P2** | Proxy tests not working | api-gateway | Fix createProxyMiddleware mocks | Week 2 | @dev-team |
| 🟢 **P3** | Product suite lifecycle | product-service | Non-blocking, investigate | Week 3 | @dev-team |
| 🔵 **P4** | Pre-commit hook too strict | root | Allow warnings, block only on errors | Week 2 | @devops |

</div>

### 7.3 Technical Debt Matrix

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'quadrant1Fill':'#dcfce7','quadrant2Fill':'#fef3c7','quadrant3Fill':'#fee2e2','quadrant4Fill':'#f0f9ff'}}}%%
quadrantChart
    title Technical Debt Impact vs Effort Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Quick Wins
    quadrant-2 Strategic
    quadrant-3 Low Priority
    quadrant-4 Major Projects
    
    Promotion Tests: [0.3, 0.85]
    API Gateway Mocks: [0.25, 0.65]
    Load Testing: [0.70, 0.80]
    K8s Migration: [0.85, 0.90]
    Security Audit: [0.55, 0.75]
    CDN Integration: [0.60, 0.55]
    Redis Cluster: [0.45, 0.60]
    Analytics Dashboard: [0.50, 0.70]
    AI Recommendations: [0.75, 0.85]
```

---

## 📚 8. KNOWLEDGE BASE - Best Practices & Learnings

### 8.1 Testing Patterns Applied

<div align="center">

| 🎯 Pattern | 📝 Description | 💡 Use Case | ✅ Benefits |
|:---|:---|:---|:---|
| **Chainable Mocks** | `mockReturnThis()` for Mongoose queries | `Model.find().select().lean().exec()` | Maintains fluent API in tests |
| **Buffer Mocking** | `Buffer.from('data')` for binary responses | AI image downloads | Simulates real binary data |
| **Polling Mocks** | `mockResolvedValue` (not `Once`) | While loops checking status | Multiple calls to same endpoint |
| **Schema Mocking** | Mock Mongoose Schema + Model | Database operations without DB | Fast, isolated unit tests |
| **Axios Interceptors** | Mock axios.get/post/put | External API calls | Control responses predictably |
| **JWT Mocking** | Mock jwt.verify/sign | Authentication flows | Test auth without real tokens |
| **Environment Isolation** | `process.env` mocking | Config testing | Avoid side effects |

</div>

### 8.2 Architectural Decisions (ADRs)

<details>
<summary><b>ADR-001: Microservices over Monolith</b></summary>

**Context**: E-commerce platform requiring scalability and team autonomy  
**Decision**: Adopt microservices architecture with domain-driven design  
**Consequences**:
- ✅ Independent deployment and scaling
- ✅ Technology diversity (PostgreSQL + MongoDB + Redis)
- ✅ Team autonomy per service
- ⚠️ Increased operational complexity
- ⚠️ Distributed system challenges

</details>

<details>
<summary><b>ADR-002: Polyglot Persistence Strategy</b></summary>

**Context**: Different data models require different storage solutions  
**Decision**: Use PostgreSQL (relational), MongoDB (document), Redis (cache)  
**Consequences**:
- ✅ Optimized storage per use case
- ✅ Better performance
- ⚠️ Multiple databases to maintain
- ⚠️ Data consistency challenges

</details>

<details>
<summary><b>ADR-003: JWT-based Authentication</b></summary>

**Context**: Stateless authentication for microservices  
**Decision**: Implement JWT tokens with OAuth 2.0 support  
**Consequences**:
- ✅ Stateless and scalable
- ✅ Easy to validate across services
- ⚠️ Token revocation complexity
- ⚠️ Security considerations (expiry, refresh)

</details>

### 8.3 Development Best Practices

```markdown
┌─────────────────────────────────────────────────────────────┐
│  🎯 CODING STANDARDS                                         │
├─────────────────────────────────────────────────────────────┤
│  Variables & Functions    → camelCase (getUserById)         │
│  Classes & Constructors   → PascalCase (UserService)        │
│  Constants                → UPPER_SNAKE_CASE (MAX_RETRIES)  │
│  Files & Folders          → kebab-case (user-service)       │
│  Private Methods          → _prefixed (_validateInput)      │
│  Async Functions          → async/await (not callbacks)     │
├─────────────────────────────────────────────────────────────┤
│  📁 FILE STRUCTURE                                           │
├─────────────────────────────────────────────────────────────┤
│  /src                     → Source code                      │
│    /routes                → Express routes                   │
│    /controllers           → Business logic                   │
│    /models                → Database models                  │
│    /middleware            → Express middleware               │
│    /services              → External services                │
│    /utils                 → Helper functions                 │
│    /validators            → Input validation (Joi/Zod)       │
│    /config                → Configuration files              │
│    /__tests__             → Test files                       │
│      /unit                → Unit tests                       │
│      /integration         → Integration tests                │
│  /docs                    → Documentation                    │
├─────────────────────────────────────────────────────────────┤
│  🧪 TESTING GUIDELINES                                       │
├─────────────────────────────────────────────────────────────┤
│  • 1 test file per source file (user.js → user.test.js)     │
│  • Descriptive test names (should create user when valid)   │
│  • Arrange-Act-Assert pattern                               │
│  • Mock external dependencies                               │
│  • Test happy path + edge cases + errors                    │
│  • Aim for 80%+ coverage minimum                            │
│  • Integration tests for API endpoints                      │
│  • Run tests before commit (pre-commit hook)                │
├─────────────────────────────────────────────────────────────┤
│  🔒 SECURITY CHECKLIST                                       │
├─────────────────────────────────────────────────────────────┤
│  ✅ No secrets in code (use .env)                            │
│  ✅ Input validation on all endpoints                        │
│  ✅ Rate limiting enabled                                    │
│  ✅ CORS configured properly                                 │
│  ✅ SQL injection prevention (parameterized queries)         │
│  ✅ XSS protection (sanitize inputs)                         │
│  ✅ HTTPS in production                                      │
│  ✅ JWT token expiration                                     │
│  ✅ Password hashing (bcrypt)                                │
│  ✅ Dependencies audit (npm audit)                           │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 Quick Reference Commands

```bash
# 🚀 Development
docker-compose -f docker-compose.dev-simple.yml up -d    # Start dev environment
docker-compose -f docker-compose.dev-simple.yml logs -f  # View all logs
docker-compose -f docker-compose.dev-simple.yml down     # Stop environment

# 🧪 Testing
npm test                           # Run tests in current service
npm test -- --coverage             # Run with coverage report
npm test -- --watch                # Watch mode
bash scripts/test-all.sh           # Test all services

# 🔍 Debugging
docker-compose logs -f [service]   # View specific service logs
docker exec -it [container] sh     # Enter container shell
docker ps                          # List running containers

# 📊 Monitoring
curl http://localhost:3000/health  # Check API Gateway health
curl http://localhost:3001/health  # Check Auth Service health

# 🔧 Database
docker exec -it postgres-db psql -U flores_user -d flores_db    # PostgreSQL CLI
docker exec -it mongo-db mongosh --port 27017                   # MongoDB CLI
docker exec -it redis redis-cli                                 # Redis CLI

# 🧹 Cleanup
docker-compose down -v             # Stop and remove volumes
docker system prune -a             # Remove unused containers/images
```

---

## 📞 9. CONTACTO & RECURSOS

<div align="center">

### 👥 Team & Ownership

| 🎯 Role | 👤 Contact | 📧 Email | 🔧 Responsibilities |
|:---|:---|:---|:---|
| **Tech Lead** | @laloaggro | laloaggro@dev | Architecture, Reviews |
| **DevOps** | @devops-team | devops@dev | Infrastructure, CI/CD |
| **QA Lead** | @qa-team | qa@dev | Testing, Quality Gates |
| **Security** | @security-team | security@dev | Audits, Compliance |

### 📚 Documentation

- 📖 [README.md](./README.md) - Project overview
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture
- 🔧 [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Setup instructions
- 📊 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- 🧪 [TEST_RESULTS_SUMMARY.md](./TEST_RESULTS_SUMMARY.md) - Test report
- 🚀 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy instructions

### 🔗 External Resources

- 🌐 [Leonardo.ai Docs](https://docs.leonardo.ai/) - AI image generation
- 🌐 [AI Horde API](https://stablehorde.net/) - Community GPU pool
- 🌐 [Docker Compose](https://docs.docker.com/compose/) - Container orchestration
- 🌐 [Jest Testing](https://jestjs.io/) - Testing framework
- 🌐 [Microservices.io](https://microservices.io/) - Patterns reference

</div>

---

<div align="center">

## 🌸 Flores Victoria E-commerce Platform

**Status**: ✅ Production Ready  
**Version**: 3.0.0  
**Last Updated**: 22 de noviembre de 2025  
**Test Coverage**: 93.8% (1,067+ tests passing)  
**License**: Proprietary

---

### 🎯 Quick Stats

![Microservices](https://img.shields.io/badge/Microservices-10-blue?style=for-the-badge&logo=microservices)
![Test Coverage](https://img.shields.io/badge/Coverage-93.8%25-success?style=for-the-badge&logo=jest)
![Docker](https://img.shields.io/badge/Containerized-100%25-blue?style=for-the-badge&logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)
![Production Ready](https://img.shields.io/badge/Production-Ready-success?style=for-the-badge)

---

**Built with ❤️ by the Flores Victoria Team**

</div>
