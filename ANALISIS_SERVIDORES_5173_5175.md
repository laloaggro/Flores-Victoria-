# 🔍 Origen de los Archivos - Análisis Completo

## 📊 Resumen Ejecutivo

Hay **DOS fuentes completamente diferentes** sirviendo los index.html:

- **Puerto 5173 (Docker)**: Archivos compilados y copiados a la imagen Docker (**NO SE ACTUALIZA EN
  VIVO**)
- **Puerto 5175 (Host)**: Archivos locales en `frontend/` (**SE ACTUALIZA EN VIVO**)

---

## 🐳 Puerto 5173 - Servidor Docker (NGINX)

### Origen de los Archivos

```
IMAGEN DOCKER (flores-victoria-frontend:latest)
├── Construida hace 30 horas (Oct 24 08:59)
├── Proceso de build:
│   1. Stage 1 (Builder):
│      - Toma archivos de frontend/ (en ese momento)
│      - npm run build → genera /app/dist
│
│   2. Stage 2 (Nginx):
│      - COPY --from=builder /app/dist → /usr/share/nginx/html
│      - Los archivos quedan "congelados" en la imagen
│
└── Resultado:
    /usr/share/nginx/html/index.html (SHA: 25ee7eb8356d...)
    ├── Fecha: Oct 24 08:59
    ├── Tamaño: 15,270 bytes
    └── Contenido: Versión del build de hace 30 horas
```

### Cómo Funciona

```yaml
# docker-compose.dev-conflict-free.yml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile # ← Usa Dockerfile (producción)
  ports:
    - '5173:5175' # ← Host:5173 → Container:5175
  volumes:
    - ./frontend:/app # ← SOLO para build, NO para servir
    - /app/node_modules
```

```nginx
# Nginx config dentro del contenedor
server {
    listen 5175;                   # ← Escucha en puerto 5175 interno
    root /usr/share/nginx/html;    # ← Sirve archivos de la imagen
    # ...
}
```

### Detalles Técnicos

| Aspecto            | Valor                                         |
| ------------------ | --------------------------------------------- |
| **Proceso**        | Nginx (PID 1)                                 |
| **Root Dir**       | `/usr/share/nginx/html/`                      |
| **Archivos**       | Copiados desde `/app/dist` durante el build   |
| **Actualización**  | ❌ Requiere rebuild de la imagen              |
| **index.html SHA** | `25ee7eb8356d3118297b63a0b8761d2f901118ff...` |
| **Timestamp**      | Oct 24 08:59:16 GMT                           |

### ⚠️ Importante

**Los cambios en `frontend/` NO afectan a 5173** porque:

1. Nginx sirve desde `/usr/share/nginx/html/` (imagen Docker)
2. El volumen `./frontend:/app` solo se usa para el build inicial
3. Para ver cambios necesitas:
   ```bash
   docker-compose -f docker-compose.dev-conflict-free.yml build frontend
   docker-compose -f docker-compose.dev-conflict-free.yml up -d frontend
   ```

---

## 💻 Puerto 5175 - Servidor Python (HOST)

### Origen de los Archivos

```
DIRECTORIO LOCAL
/home/impala/Documentos/Proyectos/flores-victoria/frontend/
├── index.html (SHA: 54f89c00aa75...)
│   ├── Fecha: Oct 25 15:09 (ACTUALIZADO HOY)
│   ├── Tamaño: 15,336 bytes
│   └── Contenido: Versión con cache-busting (?v=20250124)
│
├── css/
│   └── style.css (actualizado)
├── js/
├── images/
└── assets/
```

### Cómo Funciona

```bash
# Proceso activo en el host
PID: 3030064
Comando: python3 -m http.server 5175
Working Dir: /home/impala/Documentos/Proyectos/flores-victoria/frontend
Usuario: impala
```

### Detalles Técnicos

| Aspecto            | Valor                                         |
| ------------------ | --------------------------------------------- |
| **Proceso**        | Python HTTP Server (PID 3030064)              |
| **Root Dir**       | `/home/impala/.../flores-victoria/frontend/`  |
| **Archivos**       | Directamente del filesystem local             |
| **Actualización**  | ✅ Inmediata (cualquier cambio se refleja)    |
| **index.html SHA** | `54f89c00aa75e660bda8ac8db6307ed3e0414aa9...` |
| **Timestamp**      | Oct 25 15:09 (HOY)                            |

### ✅ Ventajas

**Los cambios en `frontend/` SE REFLEJAN INMEDIATAMENTE** porque:

1. Python sirve archivos directamente del disco
2. No hay build ni cache
3. Solo necesitas recargar el navegador

---

## 🔄 Comparación de Archivos

### index.html

| Servidor          | SHA256            | Tamaño       | Modificado   |
| ----------------- | ----------------- | ------------ | ------------ |
| **5173 (Docker)** | `25ee7eb8356d...` | 15,270 bytes | Oct 24 08:59 |
| **5175 (Host)**   | `54f89c00aa75...` | 15,336 bytes | Oct 25 15:09 |

**Diferencia**: 66 bytes más en 5175 (cache-busting agregado hoy)

### Contenido Actual

**5173 (Docker) - Versión antigua**:

```html
<link rel="stylesheet" href="/css/base.css" />
<link rel="stylesheet" href="/css/style.css" />
<!-- Sin parámetros de versión -->
```

**5175 (Host) - Versión actualizada**:

```html
<link rel="stylesheet" href="/css/base.css?v=20250124" />
<link rel="stylesheet" href="/css/style.css?v=20250124" />
<!-- Con cache-busting agregado hoy -->
```

---

## 🎯 Flujo de Datos Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    PUERTO 5173 (DOCKER)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Browser → localhost:5173                                   │
│     ↓                                                       │
│  Docker Host (mapeo 5173:5175)                             │
│     ↓                                                       │
│  Container: flores-victoria-frontend-1                      │
│     ↓                                                       │
│  Nginx (escucha puerto 5175 interno)                       │
│     ↓                                                       │
│  /usr/share/nginx/html/index.html                          │
│     ↓                                                       │
│  ⏰ Contenido: Build de hace 30 horas                       │
│  📦 Origen: Imagen Docker (congelado)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PUERTO 5175 (HOST)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Browser → localhost:5175                                   │
│     ↓                                                       │
│  Python HTTP Server (PID 3030064)                          │
│     ↓                                                       │
│  /home/impala/.../frontend/index.html                      │
│     ↓                                                       │
│  ⏰ Contenido: Actualizado hoy (15:09)                      │
│  📂 Origen: Filesystem local (vivo)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Cómo Actualizar Cada Servidor

### Para actualizar 5173 (Docker):

```bash
# Opción 1: Rebuild completo
cd /home/impala/Documentos/Proyectos/flores-victoria
docker-compose -f docker-compose.dev-conflict-free.yml build frontend
docker-compose -f docker-compose.dev-conflict-free.yml up -d frontend

# Opción 2: Copiar archivos manualmente (temporal)
docker cp frontend/index.html flores-victoria-frontend-1:/usr/share/nginx/html/
docker exec flores-victoria-frontend-1 nginx -s reload
```

### Para actualizar 5175 (Host):

```bash
# ¡Ya está actualizado automáticamente!
# Solo edita archivos en frontend/ y recarga el navegador
```

---

## 📋 Resumen de Diferencias Clave

| Característica         | 5173 (Docker)    | 5175 (Host)       |
| ---------------------- | ---------------- | ----------------- |
| **Servidor**           | Nginx            | Python HTTP       |
| **Archivos desde**     | Imagen Docker    | Filesystem local  |
| **Actualización**      | Rebuild imagen   | Automática        |
| **index.html versión** | Oct 24 (viejo)   | Oct 25 (nuevo)    |
| **Cache-busting**      | ❌ No            | ✅ Sí             |
| **Uso recomendado**    | Pruebas de build | Desarrollo activo |

---

## 💡 Recomendación

**Para desarrollo activo, usa 5175** porque:

- ✅ Los cambios se reflejan inmediatamente
- ✅ No necesitas rebuild
- ✅ Más rápido para iterar

**Para testing de producción, usa 5173** porque:

- ✅ Refleja el comportamiento real de producción
- ✅ Incluye optimizaciones de Nginx
- ✅ Simula el entorno de deploy

---

**Última actualización**: 2025-10-25 12:17
