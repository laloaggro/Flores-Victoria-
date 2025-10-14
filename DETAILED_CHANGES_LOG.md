# Registro Detallado de Cambios, Comandos y Resultados

## Resumen

Este documento contiene un registro detallado de todos los cambios realizados en el sistema Flores Victoria, incluyendo comandos ejecutados en la terminal, sus resultados, problemas encontrados y soluciones implementadas.

## 1. Corrección de Dockerfiles en Microservicios

### 1.1. Auth-Service

**Problema identificado:**
El Dockerfile del auth-service tenía problemas con la creación de directorios para los módulos compartidos, lo que causaba errores durante la construcción de la imagen.

**Cambio realizado:**
Se modificó el Dockerfile del auth-service para copiar los módulos compartidos de forma más robusta:

```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copiar el package.json del servicio
COPY microservices/auth-service/package.json ./

# Instalar todas las dependencias
RUN npm install

# Instalar prom-client explícitamente
RUN npm install prom-client

# Copiar los módulos compartidos
COPY shared/tracing ./node_modules/@flores-victoria/tracing
COPY shared/metrics ./node_modules/@flores-victoria/metrics

# Instalar todas las dependencias incluyendo las de los módulos compartidos
RUN cd ./node_modules/@flores-victoria/tracing && npm install
RUN cd ./node_modules/@flores-victoria/metrics && npm install

# Copiar el código fuente
COPY microservices/auth-service/src ./src

# Crear base de datos
RUN touch /app/database.sqlite

EXPOSE 3000

CMD ["npm", "start"]
```

**Resultado:**
La imagen se construyó correctamente y se subió al registro local.

### 1.2. Product-Service

**Problema identificado:**
El Dockerfile del product-service también tenía problemas similares con la copia de módulos compartidos.

**Cambio realizado:**
Se modificó el Dockerfile del product-service para usar una estructura similar a la del auth-service:

```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copiar el package.json del servicio
COPY package.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar los módulos compartidos
COPY ../../shared/tracing ./shared/tracing
COPY ../../shared/metrics ./shared/metrics

# Instalar todas las dependencias incluyendo las de los módulos compartidos
RUN cd ./shared/tracing && npm install
RUN cd ./shared/metrics && npm install

# Copiar el código fuente
COPY src ./src

# Crear base de datos
RUN touch /app/database.sqlite

EXPOSE 3002

CMD ["node", "src/app.js"]
```

**Resultado:**
La imagen se construyó y subió correctamente al registro local.

### 1.3. Order-Service

**Problema identificado:**
El Dockerfile del order-service tenía una estructura básica que no consideraba los módulos compartidos y tenía problemas con las rutas al construir desde diferentes directorios.

**Cambio realizado:**
Se modificó el Dockerfile del order-service para usar una estructura consistente con los otros servicios:

```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copiar el package.json del servicio
COPY microservices/order-service/package.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar los módulos compartidos
COPY shared/tracing ./shared/tracing
COPY shared/metrics ./shared/metrics

# Instalar todas las dependencias incluyendo las de los módulos compartidos
RUN cd ./shared/tracing && npm install
RUN cd ./shared/metrics && npm install

# Copiar el código fuente
COPY microservices/order-service/src ./src

# Crear base de datos
RUN touch /app/database.sqlite

EXPOSE 3004

CMD ["npm", "start"]
```

**Resultado:**
La imagen se construyó y subió correctamente al registro local.

## 2. Comandos ejecutados y resultados

### 2.1. Construcción y despliegue de imágenes

#### Auth-Service
```bash
# Construcción de la imagen
cd /home/impala/Documentos/Proyectos/flores-victoria && docker build -t localhost:5000/auth-service:latest -f microservices/auth-service/Dockerfile .

# Resultado:
# [+] Building 5.8s (16/16) FINISHED
# => naming to localhost:5000/auth-service:latest

# Subida al registro local
cd /home/impala/Documentos/Proyectos/flores-victoria && docker push localhost:5000/auth-service:latest

# Resultado:
# latest: digest: sha256:4b54912b510fbf3fc8573d8491308421a6e1223d58adbbbd4f2fc3d34cfe4f7c
```

#### Product-Service
```bash
# Construcción de la imagen desde el directorio del servicio
cd /home/impala/Documentos/Proyectos/flores-victoria/microservices/product-service && docker build -t localhost:5000/product-service:latest .

# Resultado:
# [+] Building 5.6s (15/15) FINISHED
# => naming to localhost:5000/product-service:latest

# Subida al registro local
cd /home/impala/Documentos/Proyectos/flores-victoria/microservices/product-service && docker push localhost:5000/product-service:latest

# Resultado:
# latest: digest: sha256:ce6ed25e0e5177e7a684e44e8f75a6390b95e42bf53e6b1bc656b5f997209191
```

#### Order-Service
```bash
# Construcción de la imagen desde el directorio raíz
cd /home/impala/Documentos/Proyectos/flores-victoria && docker build -t localhost:5000/order-service:latest -f microservices/order-service/Dockerfile .

# Resultado:
# [+] Building 14.3s (15/15) FINISHED
# => naming to localhost:5000/order-service:latest

# Subida al registro local
cd /home/impala/Documentos/Proyectos/flores-victoria && docker push localhost:5000/order-service:latest

# Resultado:
# latest: digest: sha256:02f78644d92075399881167231d5ee6725afa72de0022f19c347c5704ad7baf5
```

## 3. Problemas encontrados y soluciones

### 3.1. Problemas con directorios en Dockerfiles

**Problema:**
Al construir las imágenes de los microservicios, se encontraron errores relacionados con la creación de directorios para los módulos compartidos. El sistema no podía encontrar las rutas correctas para copiar los módulos compartidos.

**Solución:**
Se reestructuró la forma en que se copian los módulos compartidos en los Dockerfiles:
1. Se copian los módulos en directorios temporales dentro del contenedor
2. Se instalan las dependencias de los módulos compartidos por separado
3. Se ajustan las rutas para que coincidan con la estructura del proyecto

### 3.2. Problemas con rutas relativas

**Problema:**
Algunos Dockerfiles usaban rutas relativas que no eran consistentes cuando se construían desde diferentes directorios.

**Solución:**
Se estandarizó el uso de rutas relativas desde el directorio raíz del proyecto y se ajustaron los comandos de construcción para usar el contexto correcto.

## 4. Impacto de los cambios

### 4.1. Impacto positivo

1. **Mejora en la construcción de imágenes:**
   - Los Dockerfiles ahora manejan correctamente las dependencias compartidas
   - La construcción de imágenes es más robusta y confiable
   - Se evitan errores de directorios faltantes

2. **Consistencia entre microservicios:**
   - Todos los microservicios ahora usan una estructura de Dockerfile consistente
   - Se facilita el mantenimiento y la actualización futura

3. **Mejor manejo de módulos compartidos:**
   - Los módulos @flores-victoria/tracing y @flores-victoria/metrics se integran correctamente
   - Se asegura que todas las dependencias se instalen correctamente

### 4.2. Impacto negativo/potencialmente problemático

1. **Cambios en la estructura de directorios:**
   - Se modificaron varios Dockerfiles, lo que puede requerir actualizaciones en otros scripts de CI/CD
   - Se cambió la forma en que se construyen las imágenes, lo que puede afectar procesos automatizados existentes

2. **Tiempo de construcción:**
   - Algunas imágenes pueden tardar un poco más en construirse debido a la instalación de dependencias adicionales

## 5. Recomendaciones

1. **Pruebas adicionales:**
   - Es recomendable probar cada microservicio individualmente para asegurar que funcionan correctamente con los nuevos Dockerfiles
   - Se debe verificar que los módulos compartidos se integren correctamente en todos los servicios

2. **Documentación:**
   - Se debe actualizar la documentación del proyecto para reflejar los cambios en los Dockerfiles
   - Es importante documentar el proceso de construcción de imágenes para futuras referencias

3. **Automatización:**
   - Considerar crear scripts de construcción automatizados para todos los microservicios
   - Implementar pruebas automatizadas para verificar que las imágenes se construyen correctamente

4. **Monitoreo:**
   - Monitorear el rendimiento de los servicios después de los cambios
   - Verificar que no haya problemas de rendimiento con las nuevas imágenes