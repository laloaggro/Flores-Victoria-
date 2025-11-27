# 🚀 Guía Súper Fácil - Deploy Railway

## ✅ Ya tienes listo:

- ✅ Railway project: "Flores-Victoria-Production"
- ✅ PostgreSQL funcionando
- ✅ MongoDB funcionando
- ✅ Redis funcionando
- ✅ Variables compartidas configuradas

---

## 📦 Servicios a crear (11 en total)

### 🔐 1. AUTH SERVICE (Autenticación)

**En Railway:**

1. Click **"+ New"** → **"GitHub Repo"**
2. Selecciona: `Flores-Victoria-` (tu repositorio)
3. **Root Directory**: `microservices/auth-service`
4. Click **"Add variables"**
5. Agrega estas variables:
   ```
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
6. Click **"Deploy"**
7. ✅ **Espera que diga "Running"**

---

### 👤 2. USER SERVICE (Usuarios)

1. Click **"+ New"** → **"GitHub Repo"**
2. Selecciona: `Flores-Victoria-`
3. **Root Directory**: `microservices/user-service`
4. Variables:
   ```
   PORT=3003
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
5. **Deploy**

---

### 🌸 3. PRODUCT SERVICE (Productos)

1. Click **"+ New"** → **"GitHub Repo"**
2. Selecciona: `Flores-Victoria-`
3. **Root Directory**: `microservices/product-service`
4. Variables:
   ```
   PORT=3009
   NODE_ENV=production
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   ```
5. **Deploy**

---

### 📦 4. ORDER SERVICE (Pedidos)
