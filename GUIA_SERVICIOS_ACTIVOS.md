# 🌸 Guía de Servicios Activos - Flores Victoria v3.0

**Fecha de actualización:** 24 de Octubre de 2025  
**Estado del sistema:** ✅ **SERVICIOS CORE OPERATIVOS**

## 🎯 Servicios Principales Activos

### 🛡️ Admin Panel (Puerto 3021)

**Estado:** ✅ **COMPLETAMENTE FUNCIONAL**

- **URL Principal:** http://localhost:3021
- **Documentación:** http://localhost:3021/documentation.html
- **Health Check:** http://localhost:3021/health

**Funcionalidades:**

- Panel de administración completo
- Centro de documentación integrado
- Monitoreo de sistema
- Gestión centralizada

**Comandos:**

```bash
# Iniciar
cd admin-panel && node server.js --port=3021

# O usar script npm
npm run start:admin

# Verificar
curl http://localhost:3021/health
```

### 🤖 AI Service (Puerto 3002)

**Estado:** ✅ **COMPLETAMENTE FUNCIONAL**

- **Recomendaciones:** http://localhost:3002/ai/recommendations
- **Health Check:** http://localhost:3002/health
- **Chat (POST):** http://localhost:3002/ai/chat
- **Analytics:** http://localhost:3002/ai/analytics

**Funcionalidades:**

- Sistema de recomendaciones inteligentes
- Chatbot básico funcional
- Analytics simulados
- API REST completa

**Endpoints disponibles:**

```bash
# Obtener recomendaciones
GET http://localhost:3002/ai/recommendations

# Respuesta ejemplo:
{
  "success": true,
  "recommendations": [
    {
      "id": 1,
      "name": "Ramo de Rosas",
      "price": 45000,
      "score": 0.95
    }
  ]
}

# Chat con IA (POST)
curl -X POST http://localhost:3002/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hola", "userId": "123"}'
```

### 🛒 Order Service (Puerto 3004)

**Estado:** ✅ **COMPLETAMENTE FUNCIONAL**

- **API Base:** http://localhost:3004/api/orders
- **Health Check:** http://localhost:3004/health
- **Documentación:** http://localhost:3004/

**Funcionalidades:**

- Gestión completa de pedidos
- CRUD operations (Create, Read, Update)
- Estados de pedido dinámicos
- Validación de datos

**Endpoints disponibles:**

```bash
# Listar todos los pedidos
GET http://localhost:3004/api/orders

# Obtener pedido específico
GET http://localhost:3004/api/orders/1

# Crear nuevo pedido (POST)
curl -X POST http://localhost:3004/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "customerName": "Juan Pérez",
    "customerEmail": "juan@email.com",
    "items": [
      {
        "productId": 1,
        "productName": "Ramo de Rosas",
        "quantity": 1,
        "price": 45000
      }
    ],
    "shippingAddress": "Av. Providencia 123",
    "paymentMethod": "Tarjeta de crédito"
  }'

# Actualizar estado de pedido (PUT)
curl -X PUT http://localhost:3004/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "En preparación"}'

# Obtener pedidos por usuario
GET http://localhost:3004/api/orders/user/1
```

## 🚀 Scripts de Gestión

### Iniciar Servicios

```bash
# Iniciar todos los servicios core
npm run start:core

# O iniciar individualmente
npm run start:admin    # Admin Panel
npm run start:ai       # AI Service
npm run start:orders   # Order Service
```

### Verificar Estado

```bash
# Verificación completa
npm run status
# O
./verificacion-final.sh

# Verificación de URLs
npm run verify
# O
./verificar-urls.sh
```

### Detener Servicios

```bash
# Detener servicios core
npm run stop:core

# O individualmente
pkill -f ai-simple.js
pkill -f order-service-simple.js
pkill -f "server.js --port=3021"
```

## 📊 Monitoreo y Logs

### Archivos de Log

- **AI Service:** `/tmp/ai-service.log`
- **Order Service:** `/tmp/order-service.log`
- **Admin Panel:** `/tmp/admin-panel.log`

### Comandos de Monitoreo

```bash
# Ver logs en tiempo real
tail -f /tmp/ai-service.log
tail -f /tmp/order-service.log
tail -f /tmp/admin-panel.log

# Verificar procesos activos
ps aux | grep node | grep -E "(ai-simple|order-service|server.js)"

# Verificar puertos en uso
netstat -tlnp | grep -E "(3002|3004|3021)"
```

## 🔧 Resolución de Problemas

### Servicio No Inicia

```bash
# 1. Verificar que el puerto esté libre
lsof -ti:3002  # Para AI Service
lsof -ti:3004  # Para Order Service
lsof -ti:3021  # Para Admin Panel

# 2. Matar procesos si es necesario
pkill -f ai-simple.js

# 3. Revisar logs
cat /tmp/ai-service.log
```

### Servicio No Responde

```bash
# 1. Verificar health check
curl http://localhost:3002/health

# 2. Reiniciar si es necesario
npm run stop:core
npm run start:core

# 3. Verificar estado final
npm run status
```

### Dependencias Faltantes

```bash
# Verificar Node.js
node --version

# Instalar dependencias si es necesario
npm install

# Verificar Express (requerido para servicios)
npm list express
```

## 🎨 Próximos Desarrollos

### Servicios en Desarrollo

- **API Gateway** (Puerto 3000) - Próximamente
- **Auth Service** (Puerto 3001) - En planificación
- **User Service** (Puerto 3003) - En planificación
- **Cart Service** (Puerto 3005) - En planificación

### Funcionalidades Planeadas

- **Frontend PWA** - Integración con servicios
- **Base de datos persistente** - PostgreSQL/MongoDB
- **Autenticación JWT** - Sistema completo
- **Notificaciones** - Email y Push
- **Analytics avanzados** - Métricas reales

## ✅ Checklist de Verificación

- [ ] **Admin Panel funcionando** - http://localhost:3021
- [ ] **AI Service respondiendo** - http://localhost:3002/ai/recommendations
- [ ] **Order Service operativo** - http://localhost:3004/api/orders
- [ ] **Documentación accesible** - http://localhost:3021/documentation.html
- [ ] **Health checks OK** - Todos los servicios
- [ ] **Logs sin errores** - Revisar `/tmp/*.log`

## 📞 Soporte

**Comandos de ayuda:**

```bash
npm run status    # Estado completo del sistema
npm run verify    # Verificación de URLs
./verificacion-final.sh  # Verificación detallada
```

**Documentación completa:** http://localhost:3021/documentation.html

---

**Flores Victoria v3.0** - Sistema E-commerce Enterprise  
**Servicios Core:** ✅ **OPERATIVOS** | **Última verificación:** 24 Oct 2025
