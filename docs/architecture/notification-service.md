# Servicio de Notificaciones - Documentación Técnica

## Descripción General

El servicio de notificaciones es responsable de enviar notificaciones a los usuarios a través de diferentes canales, incluyendo email. Este servicio se comunica con otros microservicios a través de RabbitMQ para recibir solicitudes de notificación y las envía a los usuarios finales.

## Tecnologías

- Node.js
- Express.js
- Nodemailer (para envío de emails)
- RabbitMQ (para mensajería)
- Prometheus (para métricas)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│              Notification Service (:3009)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Routes     │───▶│ Controllers  │───▶│   Services   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│           │                     │                  │       │
│           ▼                     ▼                  ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Validation  │    │   Security   │    │   Email      │  │
│  └──────────────┘    └──────────────┘    │   Service    │  │
│                                          └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   RabbitMQ (:5672)  │
                   └─────────────────────┘
```

## Endpoints

### Enviar Notificación por Email
- **URL**: `POST /api/v1/notifications/email`
- **Descripción**: Envía una notificación por email
- **Parámetros**:
  - `to` (string, requerido): Dirección de email del destinatario
  - `subject` (string, requerido): Asunto del email
  - `html` (string, opcional): Contenido HTML del email
  - `text` (string, opcional): Contenido de texto del email
- **Respuesta**:
  - `200 OK`: Notificación enviada exitosamente
  - `400 Bad Request`: Datos inválidos
  - `500 Internal Server Error`: Error al enviar la notificación

### Health Check
- **URL**: `GET /api/v1/notifications/health`
- **Descripción**: Verifica el estado del servicio
- **Respuesta**:
  - `200 OK`: Servicio funcionando correctamente
  - `500 Internal Server Error`: Error en el servicio

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 3009)
- `RABBITMQ_HOST`: URL de conexión a RabbitMQ
- `RABBITMQ_QUEUE`: Nombre de la cola de RabbitMQ para notificaciones
- `EMAIL_HOST`: Host del servidor SMTP
- `EMAIL_PORT`: Puerto del servidor SMTP
- `EMAIL_SECURE`: Indica si se usa conexión segura (true/false)
- `EMAIL_USER`: Usuario del servidor SMTP
- `EMAIL_PASS`: Contraseña del servidor SMTP

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/notification-service .
docker run -p 3009:3009 --env-file .env floresvictoria/notification-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/notification-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/notification-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se pueden implementar en el directorio `src/__tests__`.

### Cobertura
- Envío de emails: 100%
- Validación de datos: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js.

## Problemas Conocidos

### Limitaciones
1. Solo implementa notificaciones por email
2. No tiene sistema de plantillas de notificación
3. No registra auditoría de notificaciones enviadas

## Mejoras Futuras

1. Implementar notificaciones por SMS
2. Añadir sistema de plantillas de notificación
3. Registrar auditoría de notificaciones enviadas
4. Implementar notificaciones push
5. Añadir sistema de prioridades para notificaciones