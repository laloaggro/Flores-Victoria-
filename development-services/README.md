# 🚧 Servicios en Desarrollo

Esta carpeta contiene microservicios que están en desarrollo y **NO están desplegados en Railway**.

## Servicios Incluidos

| Servicio            | Estado           | Descripción                       |
| ------------------- | ---------------- | --------------------------------- |
| `analytics-service` | 🔴 En desarrollo | Servicio de análisis y métricas   |
| `audit-service`     | 🔴 En desarrollo | Servicio de auditoría y logs      |
| `i18n-service`      | 🔴 En desarrollo | Servicio de internacionalización  |
| `messaging-service` | 🔴 En desarrollo | Servicio de mensajería (RabbitMQ) |
| `ai-image-service`  | 🔴 Incompleto    | Generación de imágenes con IA     |
| `shipping-service`  | 🔴 Incompleto    | Servicio de envíos                |

## Para desplegar un servicio

1. Mover la carpeta del servicio a `/microservices/`
2. Crear archivo `railway.toml` con la configuración
3. Agregar variables de entorno en Railway
4. Desplegar con `railway up`

## Ejemplo de railway.toml

```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

## Notas

- Estos servicios requieren configuración adicional antes de desplegar
- Verificar dependencias de bases de datos (MongoDB, PostgreSQL, Redis)
- Configurar variables de entorno necesarias
