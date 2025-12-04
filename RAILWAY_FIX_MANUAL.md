# 🚀 Guía Rápida: Fix Railway Services

## ⚡ Problema Identificado
Railway está buscando Dockerfiles en rutas incorrectas porque el "Root Directory" de cada servicio no está configurado.

## 📋 Configuración Manual Necesaria

### Para CADA servicio en Railway Dashboard:

1. **Abre el servicio** (click en el nombre)
2. **Settings** → **Service Settings** (icono de engranaje)
3. **Busca estas 2 opciones:**

---

### 🔧 MICROSERVICIOS (11 servicios)

Para: `API-GATEWAY`, `AUTH-SERVICE`, `PRODUCT-SERVICE`, `CART-SERVICE`, `WISHLIST-SERVICE`, `NOTIFICATION-SERVICE`, `REVIEW-SERVICE`, `USER-SERVICE`, `CONTACT-SERVICE`, `PAYMENT-SERVICE`, `ORDER-SERVICE`

**Root Directory:**
```
microservices/[nombre-del-servicio]
```

Ejemplos:
- API-GATEWAY → `microservices/api-gateway`
- PRODUCT-SERVICE → `microservices/product-service`
- AUTH-SERVICE → `microservices/auth-service`
- etc.

**Dockerfile Path:**
```
Dockerfile.railway
```

---

### 🎨 FRONTEND-V2

**Root Directory:**
```
frontend
```

**Dockerfile Path:**
```
Dockerfile.railway
```

---

## ✅ Checklist de Servicios

Marca cuando completes cada uno:

- [ ] API-GATEWAY → `microservices/api-gateway` + `Dockerfile.railway`
- [ ] AUTH-SERVICE → `microservices/auth-service` + `Dockerfile.railway`
- [ ] PRODUCT-SERVICE → `microservices/product-service` + `Dockerfile.railway`
- [ ] CART-SERVICE → `microservices/cart-service` + `Dockerfile.railway`
- [ ] WISHLIST-SERVICE → `microservices/wishlist-service` + `Dockerfile.railway`
- [ ] NOTIFICATION-SERVICE → `microservices/notification-service` + `Dockerfile.railway`
- [ ] REVIEW-SERVICE → `microservices/review-service` + `Dockerfile.railway`
- [ ] USER-SERVICE → `microservices/user-service` + `Dockerfile.railway`
- [ ] CONTACT-SERVICE → `microservices/contact-service` + `Dockerfile.railway`
- [ ] PAYMENT-SERVICE → `microservices/payment-service` + `Dockerfile.railway`
- [ ] ORDER-SERVICE → `microservices/order-service` + `Dockerfile.railway`
- [ ] Frontend-v2 → `frontend` + `Dockerfile.railway`

---

## 🎯 Resultado Esperado

Una vez configurados:
- Railway redeployará automáticamente cada servicio
- Los deployments deberían completarse exitosamente
- Todos los servicios estarán activos y funcionando

---

## 🐛 Causa del Problema

1. Renombramos los archivos railway.toml/json de la raíz a .old
2. Railway ya no encuentra configuración en la raíz
3. Railway necesita que cada servicio tenga configurado su Root Directory manualmente
4. Sin Root Directory, Railway busca los Dockerfiles en rutas incorrectas

---

## 💡 Tip Rápido

Puedes abrir múltiples tabs del navegador con cada servicio para hacerlo más rápido:
1. Tab 1: API-GATEWAY
2. Tab 2: PRODUCT-SERVICE
3. Tab 3: AUTH-SERVICE
...etc

Configura todos en paralelo y guarda los cambios. Railway desplegará todos a la vez.
