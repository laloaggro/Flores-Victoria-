# API Playground - Flores Victoria

## Índice

1. [Introducción](#introducción)
2. [Acceso al API Playground](#acceso-al-api-playground)
3. [Exploración de Endpoints](#exploración-de-endpoints)
4. [Autenticación](#autenticación)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [Pruebas de Rendimiento](#pruebas-de-rendimiento)
7. [Exportación de Ejemplos](#exportación-de-ejemplos)

## Introducción

El API Playground de Flores Victoria es un entorno interactivo que permite a los desarrolladores
explorar, probar y experimentar con las APIs del sistema sin necesidad de configurar un entorno de
desarrollo local. Esta herramienta es invaluable para:

- Comprender cómo funcionan las diferentes APIs
- Probar escenarios específicos
- Depurar problemas de integración
- Experimentar con diferentes parámetros
- Generar documentación de ejemplo

## Acceso al API Playground

### Requisitos Previos

1. **Docker**: Asegúrese de tener Docker instalado en su sistema
2. **Acceso al código fuente**: Clone el repositorio del proyecto
3. **Variables de entorno**: Configure el archivo `.env` con las credenciales necesarias

### Iniciar el API Playground

```bash
# Navegar al directorio del proyecto
cd flores-victoria

# Iniciar todos los servicios
docker-compose up -d

# Acceder al API Playground
# Abra su navegador en: http://localhost:3000/api-playground
```

### Estructura del Playground

El API Playground está organizado en las siguientes secciones:

1. **Auth Service**: Endpoints de autenticación y gestión de usuarios
2. **Product Service**: Endpoints de gestión de productos
3. **User Service**: Endpoints de perfiles de usuario
4. **Order Service**: Endpoints de gestión de pedidos
5. **Cart Service**: Endpoints del carrito de compras
6. **Wishlist Service**: Endpoints de lista de deseos
7. **Review Service**: Endpoints de reseñas
8. **Contact Service**: Endpoints de contacto

## Exploración de Endpoints

### Navegación por Servicios

1. En la interfaz del playground, seleccione el servicio que desea explorar
2. Verá una lista de todos los endpoints disponibles para ese servicio
3. Cada endpoint muestra:
   - Método HTTP (GET, POST, PUT, DELETE)
   - Ruta del endpoint
   - Descripción breve
   - Parámetros requeridos y opcionales
   - Ejemplo de cuerpo de solicitud (para POST/PUT)

### Detalles del Endpoint

Al hacer clic en un endpoint específico, verá:

1. **Descripción detallada**: Explicación completa de lo que hace el endpoint
2. **Parámetros**: Lista de parámetros con tipo, requerimiento y descripción
3. **Respuestas**: Ejemplos de respuestas exitosas y de error
4. **Códigos de estado**: Lista de códigos HTTP que puede devolver
5. **Ejemplo de solicitud**: Ejemplo preconfigurado para probar

### Ejemplo: Listar Productos

```http
GET /api/products
Host: localhost:3002
Authorization: Bearer {{auth_token}}

Query Parameters:
- page: 1 (número de página)
- limit: 10 (productos por página)
- category: flores (filtrar por categoría)
- minPrice: 100 (precio mínimo)
- maxPrice: 1000 (precio máximo)
```

## Autenticación

### Obtener Token de Acceso

La mayoría de los endpoints requieren autenticación. Para obtener un token:

1. Navegue a **Auth Service** > **POST /api/auth/login**
2. Complete el cuerpo de la solicitud:
   ```json
   {
     "email": "usuario@ejemplo.com",
     "password": "contraseña_segura"
   }
   ```
3. Haga clic en "Enviar"
4. Copie el token de la respuesta

### Usar Token de Acceso

1. En la esquina superior derecha del playground, haga clic en "Variables"
2. Agregue una nueva variable:
   - Nombre: `auth_token`
   - Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (el token obtenido)
3. Ahora puede usar `{{auth_token}}` en los headers de autenticación

### Ejemplo de Uso de Token

```http
GET /api/users/profile
Host: localhost:3003
Authorization: Bearer {{auth_token}}
```

## Ejemplos Prácticos

### Escenario 1: Registro y Compra Completa

#### Paso 1: Registrar Nuevo Usuario

```http
POST /api/auth/register
Host: localhost:3001

{
  "email": "nuevo.usuario@ejemplo.com",
  "password": "contraseña_segura123",
  "firstName": "Nuevo",
  "lastName": "Usuario"
}
```

#### Paso 2: Iniciar Sesión

```http
POST /api/auth/login
Host: localhost:3001

{
  "email": "nuevo.usuario@ejemplo.com",
  "password": "contraseña_segura123"
}
```

#### Paso 3: Buscar Productos

```http
GET /api/products?category=flores&limit=5
Host: localhost:3002
Authorization: Bearer {{auth_token}}
```

#### Paso 4: Agregar Producto al Carrito

```http
POST /api/cart/{{user_id}}/items
Host: localhost:3005
Authorization: Bearer {{auth_token}}

{
  "productId": "{{product_id}}",
  "quantity": 2
}
```

#### Paso 5: Crear Pedido

```http
POST /api/orders
Host: localhost:3004
Authorization: Bearer {{auth_token}}

{
  "items": [
    {
      "productId": "{{product_id}}",
      "quantity": 2
    }
  ],
  "shippingAddressId": "{{address_id}}"
}
```

### Escenario 2: Administración de Productos

#### Paso 1: Crear Nuevo Producto (requiere rol de administrador)

```http
POST /api/products
Host: localhost:3002
Authorization: Bearer {{admin_token}}

{
  "name": "Nuevo Ramo Especial",
  "description": "Hermoso ramo de flores de temporada",
  "price": 499.99,
  "category": "flores",
  "stock": 25,
  "images": ["http://ejemplo.com/imagen1.jpg"]
}
```

#### Paso 2: Actualizar Producto

```http
PUT /api/products/{{product_id}}
Host: localhost:3002
Authorization: Bearer {{admin_token}}

{
  "price": 399.99,
  "stock": 30
}
```

#### Paso 3: Listar Productos con Filtros

```http
GET /api/products?minPrice=300&maxPrice=500&category=flores
Host: localhost:3002
Authorization: Bearer {{auth_token}}
```

## Pruebas de Rendimiento

### Pruebas de Carga

El API Playground incluye herramientas para pruebas básicas de carga:

1. Seleccione un endpoint
2. Haga clic en la pestaña "Load Test"
3. Configure los parámetros:
   - Número de solicitudes concurrentes
   - Duración de la prueba
   - Intervalo entre solicitudes
4. Haga clic en "Iniciar Prueba"
5. Revise los resultados:
   - Tiempo promedio de respuesta
   - Tasa de éxito
   - Distribución de tiempos

### Ejemplo de Prueba de Carga

```yaml
Configuración:
  Solicitudes: 100
  Concurrency: 10
  Duración: 30 segundos
  Endpoint: GET /api/products

Resultados Esperados:
  Tiempo promedio: < 200ms
  Tasa de éxito: > 99%
  Throughput: > 50 req/seg
```

### Monitoreo en Tiempo Real

Durante las pruebas de carga, puede monitorear:

1. **Métricas del sistema**: CPU, memoria, disco
2. **Métricas de la aplicación**: Tiempos de respuesta, códigos de estado
3. **Métricas de base de datos**: Conexiones, tiempos de consulta
4. **Métricas de cola**: Mensajes procesados, pendientes

## Exportación de Ejemplos

### Exportar a Postman

1. Seleccione los endpoints que desea exportar
2. Haga clic en "Exportar" > "Postman Collection"
3. Guarde el archivo JSON generado
4. Importe la colección en Postman

### Exportar a cURL

1. Seleccione un endpoint específico
2. Configure los parámetros deseados
3. Haga clic en "Exportar" > "cURL"
4. Copie el comando generado:

```bash
curl -X GET "http://localhost:3002/api/products?category=flores&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Exportar a JavaScript (Fetch API)

```javascript
// Ejemplo exportado a JavaScript
const response = await fetch('http://localhost:3002/api/products?category=flores&limit=10', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log(data);
```

### Exportar a Python

```python
# Ejemplo exportado a Python
import requests

url = "http://localhost:3002/api/products"
params = {
    "category": "flores",
    "limit": 10
}
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
}

response = requests.get(url, params=params, headers=headers)
data = response.json()
print(data)
```

## Mejores Prácticas

### Al Usar el API Playground

1. **Pruebe en orden**: Siga flujos lógicos (registro → login → operaciones)
2. **Use variables**: Almacene tokens y IDs en variables para reusar
3. **Revise respuestas**: Analice cuidadosamente las respuestas y códigos de estado
4. **Documente hallazgos**: Tome notas de comportamientos inesperados
5. **Limpie datos de prueba**: Elimine usuarios o productos de prueba cuando termine

### Para Desarrolladores

1. **Mantenga el playground actualizado**: Actualice endpoints cuando cambien las APIs
2. **Agregue ejemplos útiles**: Incluya ejemplos que representen casos de uso reales
3. **Pruebe todos los escenarios**: No solo los caminos felices, también errores
4. **Documente errores comunes**: Ayude a otros a entender posibles problemas

El API Playground es una herramienta poderosa para comprender, probar y experimentar con las APIs de
Flores Victoria. Facilita el desarrollo de integraciones y ayuda a garantizar que las interacciones
con el sistema sean exitosas.
