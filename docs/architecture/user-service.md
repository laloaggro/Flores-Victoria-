# Servicio de Usuarios - Documentación Técnica

## Descripción General

El servicio de usuarios es responsable de gestionar la información de los usuarios registrados en el sistema, incluyendo perfiles, direcciones y preferencias. Este servicio se comunica con la base de datos PostgreSQL para almacenar y recuperar información de usuarios.

## Tecnologías

- Node.js
- Express.js
- PostgreSQL
- JWT (para autenticación)
- Bcrypt (para hash de contraseñas)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                   User Service (:3003)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Routes     │───▶│ Controllers  │───▶│    Model     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│           │                     │                  │       │
│           ▼                     ▼                  ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Validation  │    │   Security   │    │   Database   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  PostgreSQL (:5432) │
                   └─────────────────────┘
```

## Endpoints

### Obtener Perfil de Usuario
- **URL**: `GET /api/users/profile`
- **Descripción**: Obtiene el perfil del usuario autenticado
- **Headers**:
  - `Authorization: Bearer <token>`
- **Respuesta**:
  - `200 OK`: Perfil del usuario
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Usuario no encontrado

### Actualizar Perfil de Usuario
- **URL**: `PUT /api/users/profile`
- **Descripción**: Actualiza el perfil del usuario autenticado
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parámetros**:
  - `name` (string, opcional): Nombre del usuario
  - `email` (string, opcional): Email del usuario
  - `phone` (string, opcional): Teléfono del usuario
  - `address` (object, opcional): Dirección del usuario
- **Respuesta**:
  - `200 OK`: Perfil actualizado exitosamente
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Usuario no encontrado

### Eliminar Cuenta de Usuario
- **URL**: `DELETE /api/users/profile`
- **Descripción**: Elimina la cuenta del usuario autenticado
- **Headers**:
  - `Authorization: Bearer <token>`
- **Respuesta**:
  - `204 No Content`: Cuenta eliminada exitosamente
  - `401 Unauthorized`: Token inválido
  - `404 Not Found`: Usuario no encontrado

## Seguridad

### Autenticación
Todas las rutas requieren un token JWT válido en el header de autorización.

### Autorización
Los usuarios solo pueden acceder y modificar su propia información.

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 3003)
- `JWT_SECRET`: Secreto para verificar los tokens JWT
- `DB_HOST`: Host de la base de datos PostgreSQL
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_PORT`: Puerto de la base de datos (por defecto: 5432)

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/user-service .
docker run -p 3003:3003 --env-file .env floresvictoria/user-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/user-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/user-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/user-service.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/user-service.test.js).

### Cobertura
- Obtener perfil: 100%
- Actualizar perfil: 100%
- Eliminar cuenta: 100%
- Validación de datos: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Caché
No se utiliza caché en este servicio ya que la información de usuarios se accede con baja frecuencia.

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js.

## Problemas Conocidos

### Limitaciones
1. No implementa recuperación de cuentas
2. No tiene verificación de email
3. No registra auditoría de acciones de usuarios

## Mejoras Futuras

1. Implementar recuperación de cuentas
2. Añadir verificación de email
3. Registrar auditoría de acciones de usuarios
4. Implementar roles y permisos avanzados