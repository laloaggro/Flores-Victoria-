# admin-dashboard-service

Dashboard centralizado de administración y monitoreo de microservicios

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
cd microservices/admin-dashboard-service
npm install
npm run dev
```

El servicio estará disponible en: `http://localhost:3012`

### Producción

```bash
npm start
```

## 📋 Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 🔌 Endpoints

- `GET /health` - Health check
- `GET /api/admin_dashboard_service` - Información del servicio

## 🧪 Testing

```bash
npm test
npm run test:watch
```

## 📦 Deployment en Railway

Este servicio está configurado para deployment automático en Railway.

**Variables de entorno requeridas:**

- `PORT` (asignado automáticamente por Railway)
- `DATABASE_URL` / `MONGODB_URI` / `REDIS_URL` (según tipo de DB)
- `JWT_SECRET`
- URLs de servicios dependientes

Ver [SERVICE_TEMPLATE.md](../SERVICE_TEMPLATE.md) para detalles completos.

## 📚 Documentación

- [Plantilla de Servicio](../SERVICE_TEMPLATE.md)
- [Documentación del Proyecto](../../README.md)
