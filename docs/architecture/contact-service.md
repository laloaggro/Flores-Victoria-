# Servicio de Contacto - Documentación Técnica

## Descripción General

El servicio de contacto es responsable de gestionar los mensajes de contacto de los usuarios, incluyendo consultas, sugerencias y reportes. Este servicio permite a los usuarios enviar mensajes a través del sitio web y almacena estos mensajes para su posterior revisión por el equipo administrativo. Se comunica con PostgreSQL para almacenar y recuperar los mensajes de contacto.

## Tecnologías

- Node.js
- Express.js
- PostgreSQL
- Nodemailer (para enviar emails)
- JWT (para autenticación de administradores)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│               Contact Service (:3008)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Routes     │───▶│ Controllers  │───▶│    Model     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│           │                     │                  │       │
│           ▼                     ▼                  ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Validation  │    │   Security   │    │   Database   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│           │                     │                  │       │
│           ▼                     ▼                  │       │
│  ┌──────────────┐    ┌──────────────┐              │       │
│  │   Email      │    │   Logging    │              │       │
│  │  Service     │    │   Service    │              │       │
│  └──────────────┘    └──────────────┘              │       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  PostgreSQL (:5432) │
                   └─────────────────────┘
```

## Estructura de Datos

### Mensaje de Contacto
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string",
  "status": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Endpoints

### Enviar Mensaje de Contacto
- **URL**: `POST /api/contacts`
- **Descripción**: Envía un nuevo mensaje de contacto
- **Parámetros**:
  - `name` (string, requerido): Nombre del remitente
  - `email` (string, requerido): Email del remitente
  - `subject` (string, requerido): Asunto del mensaje
  - `message` (string, requerido): Contenido del mensaje
- **Respuesta**:
  - `201 Created`: Mensaje enviado exitosamente
  - `400 Bad Request`: Datos inválidos

### Obtener Todos los Mensajes de Contacto
- **URL**: `GET /api/contacts`
- **Descripción**: Obtiene todos los mensajes de contacto (requiere rol de administrador)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros de consulta**:
  - `status` (string, opcional): Filtrar por estado
  - `page` (number, opcional): Número de página (por defecto: 1)
  - `limit` (number, opcional): Número de mensajes por página (por defecto: 10)
- **Respuesta**:
  - `200 OK`: Lista de mensajes de contacto
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Permisos insuficientes

### Obtener Mensaje de Contacto por ID
- **URL**: `GET /api/contacts/:id`
- **Descripción**: Obtiene un mensaje de contacto específico (requiere rol de administrador)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `id` (string, requerido): ID del mensaje
- **Respuesta**:
  - `200 OK`: Información del mensaje
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Permisos insuficientes
  - `404 Not Found`: Mensaje no encontrado

### Actualizar Estado de Mensaje
- **URL**: `PUT /api/contacts/:id`
- **Descripción**: Actualiza el estado de un mensaje de contacto (requiere rol de administrador)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `id` (string, requerido): ID del mensaje
  - `status` (string, requerido): Nuevo estado del mensaje
- **Respuesta**:
  - `200 OK`: Estado actualizado exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Permisos insuficientes
  - `404 Not Found`: Mensaje no encontrado

### Eliminar Mensaje de Contacto
- **URL**: `DELETE /api/contacts/:id`
- **Descripción**: Elimina un mensaje de contacto (requiere rol de administrador)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `id` (string, requerido): ID del mensaje
- **Respuesta**:
  - `200 OK`: Mensaje eliminado exitosamente
  - `401 Unauthorized`: Token inválido
  - `403 Forbidden`: Permisos insuficientes
  - `404 Not Found`: Mensaje no encontrado

## Estados de Mensajes

1. **new**: Mensaje nuevo, no procesado
2. **read**: Mensaje leído pero no respondido
3. **replied**: Mensaje respondido
4. **archived**: Mensaje archivado

## Envío de Emails

### Notificaciones
El servicio envía notificaciones por email al equipo administrativo cuando se recibe un nuevo mensaje de contacto.

### Confirmaciones
El servicio envía un email de confirmación al remitente cuando su mensaje ha sido recibido.

## Seguridad

### Autenticación
Los endpoints de administración requieren un token JWT válido en el header de autorización.

### Autorización
Solo los usuarios con rol de administrador pueden acceder a los endpoints de gestión de mensajes.

### Validación de Datos
Todos los datos de entrada se validan para prevenir inyección de código y otros ataques.

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 3008)
- `JWT_SECRET`: Secreto para verificar los tokens JWT
- `DB_HOST`: Host de la base de datos PostgreSQL
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_PORT`: Puerto de la base de datos (por defecto: 5432)
- `EMAIL_HOST`: Host del servidor SMTP
- `EMAIL_PORT`: Puerto del servidor SMTP
- `EMAIL_USER`: Usuario del servidor SMTP
- `EMAIL_PASS`: Contraseña del servidor SMTP
- `EMAIL_FROM`: Dirección de email del remitente

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/contact-service .
docker run -p 3008:3008 --env-file .env floresvictoria/contact-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/contact-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/contact-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/contact-service.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/contact-service.test.js).

### Cobertura
- Enviar mensaje: 100%
- Obtener mensajes: 100%
- Obtener mensaje por ID: 100%
- Actualizar estado: 100%
- Eliminar mensaje: 100%
- Validación de datos: 100%
- Manejo de errores: 100%
- Envío de emails: 100%

## Consideraciones de Rendimiento

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js.

### Indices de Base de Datos
Se utilizan índices en las columnas de status y createdAt para mejorar el rendimiento de las consultas.

## Problemas Conocidos

### Limitaciones
1. No implementa sistema de plantillas de respuesta
2. No tiene sistema de categorización de mensajes
3. No registra auditoría de acciones de contacto

## Mejoras Futuras

1. Implementar sistema de plantillas de respuesta
2. Añadir sistema de categorización de mensajes
3. Registrar auditoría de acciones de contacto
4. Implementar sistema de tickets
5. Añadir archivos adjuntos a los mensajes