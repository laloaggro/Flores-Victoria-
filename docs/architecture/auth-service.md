# Servicio de Autenticación - Documentación Técnica

## Descripción General

El servicio de autenticación es responsable de gestionar el registro, inicio de sesión y generación de tokens JWT para los usuarios del sistema. Este servicio actúa como el punto de entrada para la autenticación de usuarios en la aplicación Flores Victoria.

## Tecnologías

- Node.js
- Express.js
- JWT (JSON Web Tokens)
- PostgreSQL (para almacenamiento de usuarios)
- Bcrypt (para hash de contraseñas)

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    Auth Service (:4001)                     │
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

### Registro de Usuario
- **URL**: `POST /api/auth/register`
- **Descripción**: Registra un nuevo usuario en el sistema
- **Parámetros**:
  - `name` (string, requerido): Nombre del usuario
  - `email` (string, requerido): Email del usuario
  - `password` (string, requerido): Contraseña del usuario
- **Respuesta**:
  - `201 Created`: Usuario registrado exitosamente
  - `400 Bad Request`: Datos inválidos
  - `409 Conflict`: Usuario ya existe

### Inicio de Sesión
- **URL**: `POST /api/auth/login`
- **Descripción**: Inicia sesión de un usuario existente
- **Parámetros**:
  - `email` (string, requerido): Email del usuario
  - `password` (string, requerido): Contraseña del usuario
- **Respuesta**:
  - `200 OK`: Inicio de sesión exitoso con token JWT
  - `400 Bad Request`: Datos inválidos
  - `401 Unauthorized`: Credenciales incorrectas

### Verificación de Token
- **URL**: `GET /api/auth/verify`
- **Descripción**: Verifica la validez de un token JWT
- **Headers**:
  - `Authorization: Bearer <token>`
- **Respuesta**:
  - `200 OK`: Token válido
  - `401 Unauthorized`: Token inválido o expirado

## Seguridad

### Hash de Contraseñas
Las contraseñas se almacenan utilizando bcrypt con un costo de 12 rondas.

### Tokens JWT
- Algoritmo: HS256
- Expiración: 24 horas
- Payload incluye:
  - `userId`: ID del usuario
  - `email`: Email del usuario
  - `iat`: Tiempo de emisión
  - `exp`: Tiempo de expiración

## Configuración

### Variables de Entorno
- `PORT`: Puerto en el que escucha el servicio (por defecto: 4001)
- `JWT_SECRET`: Secreto para firmar los tokens JWT
- `DB_HOST`: Host de la base de datos PostgreSQL
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_PORT`: Puerto de la base de datos (por defecto: 5432)

## Despliegue

### Docker
El servicio se puede desplegar usando Docker con el siguiente comando:

```bash
docker build -t floresvictoria/auth-service .
docker run -p 4001:4001 --env-file .env floresvictoria/auth-service
```

### Kubernetes
En Kubernetes, el servicio se despliega como un Deployment con un Service asociado. Ver [k8s/production/auth-service.yaml](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/k8s/production/auth-service.yaml) para más detalles.

## Monitoreo

### Métricas
El servicio expone métricas en el endpoint `/metrics` en formato Prometheus.

### Health Check
El servicio proporciona un endpoint de health check en `/health`.

## Pruebas

### Pruebas Unitarias
Las pruebas unitarias se encuentran en [tests/unit-tests/auth-service.test.js](file:///home/impala/Documentos/Proyectos/Flores-Victoria-/tests/unit-tests/auth-service.test.js).

### Cobertura
- Registro de usuarios: 100%
- Inicio de sesión: 100%
- Verificación de tokens: 100%
- Validación de datos: 100%
- Manejo de errores: 100%

## Consideraciones de Rendimiento

### Caché
No se utiliza caché en este servicio ya que las operaciones son relativamente simples.

### Concurrencia
El servicio puede manejar múltiples solicitudes concurrentes gracias a la naturaleza no bloqueante de Node.js.

## Problemas Conocidos

### Limitaciones
1. No implementa autenticación de dos factores (2FA)
2. No tiene límites de intentos de inicio de sesión
3. No registra auditoría de acciones de autenticación

## Mejoras Futuras

1. Implementar autenticación de dos factores (2FA)
2. Añadir límites de intentos de inicio de sesión
3. Registrar auditoría de acciones de autenticación
4. Implementar refresh tokens