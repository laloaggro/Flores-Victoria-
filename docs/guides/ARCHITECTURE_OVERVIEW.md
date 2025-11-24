# 🏗️ Architecture Overview - Flores Victoria

Documentación completa de la arquitectura del sistema.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React App (Port 5173)                          │ │
│  │  - API Client (axios)                                  │ │
│  │  - Custom Hooks (useAuth, useCart, useProducts, etc.) │ │
│  │  - JWT Token Management                                │ │
│  │  - Error Handling & Loading States                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/REST
┌─────────────────────────────────────────────────────────────┐
│                    MICROSERVICES LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   User   │  │  Product │  │   Cart   │   │
│  │  :3003   │  │  :3004   │  │  :3002   │  │  :3001   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                         ┌──────────┐                         │
│                         │  Order   │                         │
│                         │  :3005   │                         │
│                         └──────────┘                         │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ PostgreSQL │  │  MongoDB   │  │   Redis    │            │
│  │   :5432    │  │   :27017   │  │   :6379    │            │
│  │            │  │            │  │            │            │
│  │ - Users    │  │ - Products │  │ - Sessions │            │
│  │ - Orders   │  │ - Cart     │  │ - Cache    │            │
│  │ - Address  │  │ - Logs     │  │ - Queues   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                 MONITORING & OBSERVABILITY                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Prometheus │  │  Grafana   │  │Alertmanager│            │
│  │   :9090    │  │   :3000    │  │   :9093    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### 1. Authentication Flow

```
User → Frontend → Auth Service → PostgreSQL → Redis
                      ↓
                  JWT Token
                      ↓
                  Frontend
                      ↓
                localStorage
```

**Steps:**

1. User entra credenciales en frontend
2. Frontend hace POST a `/api/auth/login`
3. Auth Service valida contra PostgreSQL
4. Auth Service genera JWT token
5. Token guardado en Redis (sessions)
6. Token retornado al frontend
7. Frontend guarda token en localStorage
8. Todas las requests subsecuentes incluyen token en header

---

### 2. Product Catalog Flow

```
User → Frontend → Product Service → MongoDB
        ↓                ↓
    API Client      Cache Check
        ↓                ↓
    useProducts      Redis
```

**Steps:**

1. User navega a catálogo
2. Frontend llama `useProducts()` hook
3. Hook hace GET a `/api/products`
4. Product Service checa cache en Redis
5. Si cache miss, query MongoDB
6. Resultados cacheados en Redis (5min TTL)
7. Productos retornados al frontend
8. Frontend renderiza en grid

---

### 3. Shopping Cart Flow

```
User → Frontend → Cart Service → MongoDB → Product Service
        ↓              ↓                          ↓
    useCart       Stock Check              Stock Validation
                       ↓
                  PostgreSQL
                       ↓
                Price Validation
```

**Steps:**

1. User agrega producto al carrito
2. Frontend llama `addItem(productId, quantity)`
3. Cart Service valida stock con Product Service
4. Cart Service valida precio con Product Service
5. Item agregado a cart en MongoDB
6. Cart total recalculado
7. Frontend actualiza UI
8. Cart badge updated

---

### 4. Checkout Flow

```
User → Frontend → Order Service → Cart Service → Payment Gateway
        ↓              ↓                ↓               ↓
    Checkout     Validation      Get Cart Items    Process Payment
        ↓              ↓                ↓               ↓
  Confirmation   PostgreSQL         MongoDB        Success/Fail
        ↓              ↓                               ↓
    Email        Stock Update                    Update Order
  Notification      ↓                                  ↓
                Product Service              Clear Cart (MongoDB)
```

**Steps:**

1. User click "Confirmar Pedido"
2. Frontend llama `createOrder()`
3. Order Service valida dirección (User Service)
4. Order Service obtiene items (Cart Service)
5. Order Service valida stock (Product Service)
6. Order Service procesa pago (Payment Gateway)
7. Si éxito:
   - Crear orden en PostgreSQL
   - Actualizar stock en Product Service
   - Limpiar carrito en Cart Service
   - Enviar email de confirmación
8. Frontend redirige a `/orders/:id/success`

---

## 🛡️ Security Layers

### Layer 1: Network Security

```
Internet → HTTPS/TLS → Load Balancer → WAF → API Gateway
```

**Features:**

- TLS 1.3 encryption
- DDoS protection
- Web Application Firewall
- IP whitelisting (admin routes)

---

### Layer 2: Application Security

```
Request → CORS Check → Rate Limiter → Auth Middleware → Input Sanitization
```

**Features:**

- CORS policy enforcement
- Rate limiting (express-rate-limit)
- JWT validation
- SQL injection prevention (parameterized queries)
- XSS prevention (express-sanitizer)
- CSRF protection

---

### Layer 3: Data Security

```
Data → Encryption at Rest → Encryption in Transit → Access Control
```

**Features:**

- PostgreSQL: Encrypted columns (passwords, payment info)
- MongoDB: Field-level encryption
- Redis: TLS connections
- Role-based access control (RBAC)
- Audit logging

---

## 📊 Data Models

### PostgreSQL Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Addresses Table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'España',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address_id UUID REFERENCES addresses(id),
  payment_method VARCHAR(50) NOT NULL,
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- Order Timeline Table
CREATE TABLE order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### MongoDB Collections

```javascript
// Products Collection
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  images: [String],
  dimensions: {
    height: String,
    width: String
  },
  care: String,
  tags: [String],
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Cart Collection
{
  _id: ObjectId,
  userId: String,
  items: [
    {
      productId: String,
      quantity: Number,
      price: Number,
      addedAt: Date
    }
  ],
  total: Number,
  updatedAt: Date
}

// Activity Logs Collection
{
  _id: ObjectId,
  userId: String,
  service: String,
  action: String,
  resource: String,
  ip: String,
  userAgent: String,
  timestamp: Date,
  metadata: Object
}
```

---

### Redis Keys

```
# Sessions
session:{userId}  →  JWT token data
TTL: 24 hours

# Product Cache
products:all:{page}:{limit}  →  Product list JSON
TTL: 5 minutes

products:category:{category}  →  Category products JSON
TTL: 10 minutes

product:{productId}  →  Single product JSON
TTL: 30 minutes

# Cart Cache
cart:{userId}  →  Cart data JSON
TTL: 1 hour

# Rate Limiting
ratelimit:{endpoint}:{userId}  →  Request count
TTL: 1 minute

# Health Checks
health:{serviceName}  →  Health status JSON
TTL: 30 seconds
```

---

## 🔌 Service Communication

### Synchronous Communication (REST)

```
Service A → HTTP Request → Service B
    ↓
  Wait
    ↓
Service A ← HTTP Response ← Service B
```

**Used For:**

- User authentication checks
- Product stock validation
- Price verification
- Address validation

**Pros:**

- ✅ Simple to implement
- ✅ Immediate response
- ✅ Easy debugging

**Cons:**

- ❌ Service coupling
- ❌ Cascading failures
- ❌ Higher latency

---

### Asynchronous Communication (Events - Future)

```
Service A → Publish Event → Message Queue → Subscribe → Service B
              ↓
         Continue Work
```

**Will Be Used For:**

- Order confirmations
- Email notifications
- Inventory updates
- Analytics tracking

**Pros:**

- ✅ Service decoupling
- ✅ Better resilience
- ✅ Scalability

**Cons:**

- ❌ Eventual consistency
- ❌ Complex debugging
- ❌ Requires message broker

---

## 📈 Scalability Strategy

### Horizontal Scaling

```
          Load Balancer
               ↓
    ┌──────────┼──────────┐
    ↓          ↓          ↓
Instance 1  Instance 2  Instance 3
```

**Each microservice can scale independently:**

- Product Service: 3 instances (high read traffic)
- Cart Service: 2 instances
- Order Service: 2 instances
- Auth Service: 2 instances
- User Service: 1 instance

---

### Database Scaling

**PostgreSQL:**

```
Master (Write) → Replication → Slave 1 (Read)
                              → Slave 2 (Read)
```

**MongoDB:**

```
Replica Set:
  Primary → Secondary 1
          → Secondary 2
          → Arbiter
```

**Redis:**

```
Redis Cluster:
  Master 1 → Slave 1
  Master 2 → Slave 2
  Master 3 → Slave 3
```

---

### Caching Strategy

**Level 1: Browser Cache**

- Static assets (images, CSS, JS): 1 año
- API responses: No cache

**Level 2: CDN Cache**

- Product images: 30 días
- Static pages: 1 día

**Level 3: Application Cache (Redis)**

- Product list: 5 minutos
- Single product: 30 minutos
- Cart: 1 hora
- User session: 24 horas

**Level 4: Database Query Cache**

- PostgreSQL: Prepared statements cache
- MongoDB: Query result cache (WiredTiger)

---

## 🔄 Deployment Pipeline

```
Developer → Git Push → GitHub
                         ↓
                  GitHub Actions
                         ↓
                    ┌────┴────┐
                    ↓         ↓
                  Lint      Test
                    ↓         ↓
                    └────┬────┘
                         ↓
                Security Scan
                         ↓
                    Docker Build
                         ↓
                    Push to GHCR
                         ↓
                  ┌──────┴──────┐
                  ↓             ↓
            Development    Staging
                             ↓
                      Manual Approval
                             ↓
                        Production
                             ↓
                      Health Check
                             ↓
                    Success / Rollback
```

---

## 🌳 Environment Strategy

### Development

```yaml
Servers: Local Docker containers
Database: Local PostgreSQL/MongoDB/Redis
Secrets: .env files
Monitoring: Local Grafana
Logging: Console output
```

### Staging

```yaml
Servers: AWS EC2 t3.medium (2 instances)
Database: AWS RDS/DocumentDB (dev tier)
Secrets: AWS Secrets Manager
Monitoring: CloudWatch + Grafana
Logging: CloudWatch Logs
Domain: staging.flores-victoria.com
```

### Production

```yaml
Servers: AWS EC2 t3.large (5+ instances)
Database: AWS RDS/DocumentDB (prod tier with replicas)
Secrets: AWS Secrets Manager + KMS encryption
Monitoring: CloudWatch + Grafana + PagerDuty
Logging: CloudWatch Logs + ELK Stack
Domain: flores-victoria.com
CDN: CloudFront
WAF: AWS WAF
```

---

## 🛠️ Technology Stack

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **State Management:** React Hooks + Context
- **Styling:** CSS Modules
- **Testing:** Vitest + React Testing Library

### Backend

- **Runtime:** Node.js 20
- **Framework:** Express 4
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Security:** Helmet, CORS, express-rate-limit
- **Testing:** Jest + Supertest

### Databases

- **Relational:** PostgreSQL 15
- **Document:** MongoDB 7
- **Cache:** Redis 7

### DevOps

- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana
- **Alerting:** Alertmanager
- **Registry:** GitHub Container Registry

---

## 📝 Design Patterns

### 1. Repository Pattern

```javascript
class ProductRepository {
  async findAll(filters) {
    /* MongoDB query */
  }
  async findById(id) {
    /* MongoDB query */
  }
  async create(data) {
    /* MongoDB insert */
  }
  async update(id, data) {
    /* MongoDB update */
  }
  async delete(id) {
    /* MongoDB delete */
  }
}
```

### 2. Service Layer Pattern

```javascript
class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  async getProducts(filters) {
    // Business logic
    return this.repository.findAll(filters);
  }
}
```

### 3. Middleware Pattern

```javascript
app.use(authMiddleware);
app.use(rateLimitMiddleware);
app.use(sanitizeMiddleware);
app.use('/api/products', productRoutes);
```

### 4. Singleton Pattern

```javascript
// Database connection
class Database {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}
```

---

**Architecture Documentation v1.0** | Flores Victoria System
