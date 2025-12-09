# 📋 Copy/Paste Configurations for Railway Dashboard

**Fecha**: 9 de diciembre de 2025  
**Commit**: 0d159e1

---

## 🎯 1. USER-SERVICE (PRIORITY - Puerto 3002)

**Root Directory**: (vacío)

**Custom Build Command**:

```
cd microservices/shared && npm install --production && cd ../user-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```
cd microservices/user-service && node src/server.js
```

**Variables** (verificar especialmente PORT=3002):

```
PORT=3002
SERVICE_NAME=USER-SERVICE
```

---

## 🛒 2. CART-SERVICE (Puerto 3003)

**Root Directory**: (vacío)

**Custom Build Command**:

```
cd microservices/shared && npm install --production && cd ../cart-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```
cd microservices/cart-service && node src/server.js
```

**Variables**:

```
PORT=3003
NODE_ENV=production
SERVICE_NAME=CART-SERVICE
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

---

## 📦 3. ORDER-SERVICE (Puerto 3004)

**Root Directory**: (vacío)

**Custom Build Command**:

```
cd microservices/shared && npm install --production && cd ../order-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```
cd microservices/order-service && node src/server.js
```

**Variables**:

```
PORT=3004
NODE_ENV=production
SERVICE_NAME=ORDER-SERVICE
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

---

## ⭐ 4. WISHLIST-SERVICE (Puerto 3005)

**Root Directory**: (vacío)

**Custom Build Command**:

```
cd microservices/shared && npm install --production && cd ../wishlist-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```
cd microservices/wishlist-service && node src/server.js
```

**Variables**:

```
PORT=3005
NODE_ENV=production
SERVICE_NAME=WISHLIST-SERVICE
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

---

## ⭐ 5. REVIEW-SERVICE (Puerto 3006)

**Root Directory**: (vacío)

**Custom Build Command**:

```
cd microservices/shared && npm install --production && cd ../review-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```
cd microservices/review-service && node src/server.js
```

**Variables**:

```
PORT=3006
NODE_ENV=production
SERVICE_NAME=REVIEW-SERVICE
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

---

## 📧 6. CONTACT-SERVICE (Puerto 3007)

**Root Directory**: (vacío)

**Custom Build Command**:

```
cd microservices/shared && npm install --production && cd ../contact-service && npm ci && mkdir -p node_modules/@flores-victoria && cp -r ../shared node_modules/@flores-victoria/
```

**Custom Start Command**:

```
cd microservices/contact-service && node src/server.js
```

**Variables** (SIN Redis):

```
PORT=3007
NODE_ENV=production
SERVICE_NAME=CONTACT-SERVICE
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_HEALTHCHECK_TIMEOUT=300
```

---

## ✅ Verificación después de cada deploy

Logs correctos deben mostrar:

```
✅ [nombre-servicio]: [Servicio] running on port XXXX
✅ Connected to MongoDB/PostgreSQL
```

Logs incorrectos:

```
❌ [otro-servicio]: ... puerto incorrecto
→ Verificar Custom Build Command
```
