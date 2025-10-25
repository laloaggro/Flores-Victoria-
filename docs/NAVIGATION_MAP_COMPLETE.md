# 🗺️ MAPA DE NAVEGACIÓN COMPLETO - FLORES VICTORIA v3.0

## 🌐 **ACCESOS PRINCIPALES**

### 🎯 **URLs del Sistema**
```
📱 FRONTEND (Usuario Final)
└── http://localhost:8080
    ├── / (Página principal)
    ├── /catalog (Catálogo de productos)
    ├── /product/:id (Detalle de producto)
    ├── /cart (Carrito de compras)
    ├── /checkout (Proceso de compra)
    ├── /profile (Perfil de usuario)
    ├── /orders (Historial de órdenes)
    └── /chat (Chat con AI)

🔧 ADMIN PANEL (Administradores) ✅ VERIFICADO
└── http://localhost:3021
    ├── /dashboard (Dashboard principal)
    ├── /users (Gestión de usuarios) 
    ├── /products (Gestión de productos)
    ├── /orders (Gestión de órdenes)
    ├── /analytics (Analytics avanzado)
    ├── /ai-management (Gestión de AI)
    ├── /system-health (Estado del sistema)
    └── /documentation.html (Centro de documentación) ⭐ VERIFICADO

📊 DASHBOARDS ESPECIALES
├── http://localhost:8081/arquitectura-interactiva.html (Arquitectura visual) ⚙️ Req. servidor HTTP
├── http://localhost:8082/roi-analysis.html (Análisis ROI) ⚙️ Req. servidor HTTP  
└── http://localhost:3021/monitoring-dashboard.html (Monitoreo) ✅ VERIFICADO

🔌 API ENDPOINTS
└── http://localhost:3001/api
    ├── /auth (Autenticación)
    ├── /users (Usuarios)
    ├── /products (Productos)
    ├── /orders (Órdenes)
    ├── /ai (Servicios AI)
    ├── /wasm (Procesamiento WASM)
    └── /analytics (Analytics)
```

---

## 👨‍💼 **GUÍA PARA ADMINISTRADORES**

### 🚀 **Inicio Rápido - Admin**
```
1. 🌐 Acceder al Admin Panel: http://localhost:3004
2. 🔐 Login con credenciales de administrador
3. 📊 Dashboard principal muestra métricas en tiempo real
4. 📚 Centro de documentación disponible en menú lateral
5. ⚙️ Todas las funciones administrativas disponibles
```

### 🎮 **Funciones Principales - Admin**
```
📊 DASHBOARD PRINCIPAL
├── 📈 Métricas en tiempo real
├── 🚨 Alertas del sistema
├── 📋 Tareas pendientes
├── 💰 Resumen financiero
└── 🎯 KPIs clave

👥 GESTIÓN DE USUARIOS
├── 👤 Lista de usuarios
├── ➕ Crear nuevo usuario
├── ✏️ Editar perfiles
├── 🔒 Gestión de permisos
├── 📊 Analytics de usuarios
└── 💬 Historial de interacciones

🛍️ GESTIÓN DE PRODUCTOS
├── 📦 Catálogo completo
├── ➕ Agregar productos
├── ✏️ Editar información
├── 🖼️ Gestión de imágenes
├── 🏷️ Categorías y etiquetas
├── 💰 Precios y promociones
├── 📊 Analytics de productos
└── 🤖 Recomendaciones AI

📋 GESTIÓN DE ÓRDENES
├── 📜 Lista de órdenes
├── 🔍 Búsqueda avanzada
├── 📊 Estados de órdenes
├── 🚚 Gestión de entregas
├── 💳 Procesos de pago
├── 📞 Comunicación con clientes
└── 📈 Reportes de ventas

🤖 GESTIÓN DE AI
├── 🧠 Estado de modelos
├── 📊 Métricas de AI
├── 🎯 Precisión de recomendaciones
├── 💬 Analytics de chatbot
├── 🔄 Reentrenamiento
└── ⚙️ Configuración de parámetros

📊 ANALYTICS AVANZADO
├── 📈 Dashboard de métricas
├── 👥 Comportamiento de usuarios
├── 💰 Análisis financiero
├── 🎯 Conversiones
├── 📊 Reportes personalizados
└── 📋 Exportación de datos

⚙️ CONFIGURACIÓN DEL SISTEMA
├── 🔧 Configuraciones generales
├── 🔐 Seguridad y permisos
├── 📧 Notificaciones
├── 🌐 Configuración de APIs
├── 🐳 Gestión de servicios
└── 🔄 Respaldos y restauración
```

---

## 👤 **GUÍA PARA USUARIOS FINALES**

### 🛍️ **Flujo de Compra**
```
1. 🌐 Acceder a: http://localhost:8080
2. 🔍 Explorar catálogo o usar búsqueda
3. 👁️ Ver detalles de producto
4. 🛒 Agregar al carrito
5. 🛍️ Ir al carrito y revisar
6. 💳 Proceder al checkout
7. 📋 Completar información de entrega
8. 💰 Procesar pago
9. ✅ Confirmación de orden
10. 📱 Seguimiento de entrega
```

### 🎯 **Funciones Principales - Usuario**
```
🏠 PÁGINA PRINCIPAL
├── 🌟 Productos destacados
├── 🎯 Recomendaciones personalizadas
├── 🏷️ Ofertas especiales
├── 📱 Chat con AI
└── 🔍 Barra de búsqueda

📚 CATÁLOGO
├── 🗂️ Navegación por categorías
├── 🔍 Filtros avanzados
├── 📊 Ordenamiento
├── 👁️ Vista previa rápida
└── ❤️ Lista de deseos

🛒 CARRITO
├── 📋 Resumen de productos
├── 🔢 Modificar cantidades
├── 🗑️ Eliminar items
├── 💰 Cálculo de totales
├── 🚚 Opciones de entrega
└── 💳 Proceder al pago

👤 PERFIL DE USUARIO
├── ℹ️ Información personal
├── 🏠 Direcciones guardadas
├── 💳 Métodos de pago
├── 📋 Historial de órdenes
├── ❤️ Lista de deseos
├── ⚙️ Preferencias
└── 🔔 Configuración de notificaciones

💬 CHAT CON AI
├── 🤖 Asistente virtual inteligente
├── 🎯 Recomendaciones personalizadas
├── ❓ Soporte en tiempo real
├── 📋 Seguimiento de órdenes
└── 🛍️ Ayuda con compras
```

---

## 🛠️ **GUÍA PARA DESARROLLADORES**

### 🚀 **Setup del Entorno**
```bash
# 1. Clonar repositorio
git clone https://github.com/laloaggro/flores-victoria.git
cd flores-victoria

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con configuraciones locales

# 4. Iniciar servicios
./start-all.sh

# 5. Verificar funcionamiento
curl http://localhost:3001/health
```

### 🔧 **Estructura del Proyecto**
```
flores-victoria/
├── 📱 frontend/ (PWA - Puerto 8080)
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── sw.js (Service Worker)
│   └── manifest.json
├── 🔧 backend/ (API Gateway - Puerto 3001)
│   ├── server.js
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── 🤖 ai-service/ (Puerto 3002)
│   ├── recommendation-engine.js
│   ├── nlp-chatbot.js
│   └── models/
├── ⚡ wasm-processor/ (Puerto 3003)
│   ├── image-processor.cpp
│   ├── build/
│   └── js-interface/
├── 🎛️ admin-panel/ (Puerto 3004)
│   ├── public/
│   ├── components/
│   └── documentation.html
├── 📊 docs/ (Documentación)
│   ├── README.md
│   ├── cheatsheets/
│   ├── technical/
│   └── user/
├── 🐳 docker/
│   ├── docker-compose.yml
│   └── Dockerfile.*
└── ⚙️ scripts/
    ├── start-all.sh
    ├── test-sistema.sh
    └── deploy.sh
```

### 🔄 **Flujos de Desarrollo**
```
🛠️ DESARROLLO FRONTEND
1. cd frontend
2. npm run dev (desarrollo con hot reload)
3. Navegador: http://localhost:8080
4. DevTools para debugging
5. npm run build (build de producción)

🔧 DESARROLLO BACKEND
1. cd backend
2. npm run dev (nodemon)
3. Thunder Client / Postman para testing
4. npm test (tests unitarios)
5. npm run test:integration

🤖 AI DEVELOPMENT
1. cd ai-service
2. python -m venv venv (si necesario)
3. pip install -r requirements.txt
4. npm run train (entrenar modelos)
5. npm run evaluate (evaluar performance)

⚡ WASM DEVELOPMENT
1. cd wasm-processor
2. emcc image-processor.cpp -o image-processor.js
3. npm run build-wasm
4. npm test (tests de performance)

🎛️ ADMIN PANEL
1. cd admin-panel
2. npm run dev
3. http://localhost:3004
4. npm run build

📊 DOCUMENTACIÓN
1. Editar archivos .md en docs/
2. npm run docs:build (generar HTML)
3. npm run docs:serve (servir localmente)
```

---

## 📚 **CENTRO DE DOCUMENTACIÓN**

### 📖 **Documentos Principales**
```
📋 DOCUMENTACIÓN TÉCNICA
├── 📚 README.md (Introducción general)
├── 🏗️ ARQUITECTURA_VISUAL.md (Diagramas técnicos)
├── 📊 RESUMEN_EJECUTIVO_COMPLETO.md (Resumen ejecutivo)
├── 🔧 TECHNICAL_DOCUMENTATION_CONSOLIDATED.md (Doc técnica consolidada)
├── 💻 CODE_SNIPPETS_ESSENTIAL.md (Código esencial)
└── 🗺️ MAPA_NAVEGACION.md (Este documento)

🎯 CHEATSHEETS
├── 📝 MASTER_CHEATSHEET.md (Comandos esenciales)
├── 🔌 API_REFERENCE.md (Referencias de API)
├── 🐳 DOCKER_COMMANDS.md (Comandos Docker)
└── 🔧 TROUBLESHOOTING.md (Solución de problemas)

👥 MANUALES DE USUARIO
├── 👤 USER_MANUAL.md (Manual de usuario)
├── 👨‍💼 ADMIN_MANUAL_COMPLETE.md (Manual de administrador)
├── 🛍️ SHOPPING_GUIDE.md (Guía de compras)
└── 💬 CHAT_GUIDE.md (Guía del chat AI)

🔧 DOCUMENTACIÓN TÉCNICA
├── 🤖 AI_DOCUMENTATION.md (Documentación AI)
├── ⚡ WASM_DOCUMENTATION.md (Documentación WASM)
├── 🗄️ DATABASE_SCHEMA.md (Esquemas de BD)
├── 🔐 SECURITY_GUIDE.md (Guía de seguridad)
└── 🚀 DEPLOYMENT_GUIDE.md (Guía de deployment)
```

### 🔗 **Enlaces Rápidos**
```
📚 ACCESO A DOCUMENTACIÓN
├── 🌐 Centro Web: http://localhost:3004/documentation.html
├── 📁 Carpeta docs/: ./docs/
├── 🎯 Cheatsheets: ./docs/cheatsheets/
├── 👥 Manuales: ./docs/user/
└── 🔧 Técnica: ./docs/technical/

📊 DASHBOARDS
├── 🏗️ Arquitectura: http://localhost:8081/arquitectura-interactiva.html
├── 💰 ROI: http://localhost:8082/roi-analysis.html
├── 📊 Monitoreo: http://localhost:3004/monitoring-dashboard.html
└── 🎛️ Admin: http://localhost:3004/dashboard

🔧 HERRAMIENTAS DE DESARROLLO
├── 🌐 Frontend Dev: http://localhost:8080
├── 🔌 API Gateway: http://localhost:3001/api
├── 🤖 AI Service: http://localhost:3002/ai
├── ⚡ WASM Service: http://localhost:3003/wasm
└── 🎛️ Admin Panel: http://localhost:3004
```

---

## 🆘 **SOPORTE Y TROUBLESHOOTING**

### 🔍 **Diagnóstico Rápido**
```bash
# ✅ VERIFICAR ESTADO GENERAL
./check-detailed-status.sh

# 🌐 VERIFICAR SERVICIOS
curl http://localhost:3001/health  # API Gateway
curl http://localhost:3002/health  # AI Service
curl http://localhost:3003/health  # WASM Service
curl http://localhost:3004/health  # Admin Panel

# 📊 VER LOGS
docker-compose logs -f --tail=50

# 🔧 REINICIAR SERVICIOS
./stop-all.sh && ./start-all.sh

# 🧪 EJECUTAR TESTS
./test-sistema.sh
```

### 🚨 **Problemas Comunes**
```
❌ PROBLEMA: Puerto ocupado
✅ SOLUCIÓN: 
   netstat -tulpn | grep :8080
   kill -9 <PID>
   ./start-all.sh

❌ PROBLEMA: Base de datos no conecta
✅ SOLUCIÓN:
   docker-compose up -d mongo postgres redis
   ./test-db.js

❌ PROBLEMA: AI Service no responde
✅ SOLUCIÓN:
   cd ai-service
   npm install
   npm start

❌ PROBLEMA: WASM no carga
✅ SOLUCIÓN:
   cd wasm-processor
   npm run build-wasm
   npm start

❌ PROBLEMA: Frontend no carga
✅ SOLUCIÓN:
   cd frontend
   npm install
   npm run build
   npm start
```

### 📞 **Contacto y Soporte**
```
🆘 SOPORTE TÉCNICO
├── 📧 Email: support@flores-victoria.com
├── 🐙 GitHub Issues: https://github.com/laloaggro/flores-victoria/issues
├── 📚 Wiki: https://github.com/laloaggro/flores-victoria/wiki
├── 💬 Chat: http://localhost:8080/chat
└── 📞 Tel: +1 (555) 123-4567

📋 DOCUMENTACIÓN
├── 📧 Docs: docs@flores-victoria.com
├── 🌐 Centro Web: http://localhost:3004/documentation.html
├── 📁 Repositorio: ./docs/
└── 🔄 Actualizaciones: GitHub Releases
```

---

## 🎯 **QUICK REFERENCE**

### ⚡ **Comandos Más Usados**
```bash
# 🚀 INICIO RÁPIDO
./start-all.sh                    # Iniciar todo el sistema
./stop-all.sh                     # Parar todo el sistema
./test-sistema.sh                 # Test completo del sistema

# 🔧 DESARROLLO
npm run dev                       # Desarrollo frontend
cd backend && npm start           # API Gateway
cd ai-service && npm start        # AI Service
cd admin-panel && npm start       # Admin Panel

# 🐳 DOCKER
docker-compose up -d              # Iniciar servicios
docker-compose logs -f            # Ver logs
docker-compose ps                 # Estado de servicios
docker-compose down -v            # Parar y limpiar

# 🧪 TESTING
npm test                          # Tests unitarios
npm run test:e2e                  # Tests end-to-end
npm run test:performance          # Tests de rendimiento
```

### 🔗 **URLs Esenciales**
```
🎯 ACCESOS RÁPIDOS
├── 📱 App: http://localhost:8080 ❓ (Verificar)
├── 🎛️ Admin: http://localhost:3021 ✅ VERIFICADO  
├── 📚 Docs: http://localhost:3021/documentation.html ✅ VERIFICADO
├── 🔌 API: http://localhost:3001/api ❓ (Verificar)
├── 🏗️ Architecture: http://localhost:8081/arquitectura-interactiva.html ⚙️ (Req. servidor)
└── 💰 ROI: http://localhost:8082/roi-analysis.html ⚙️ (Req. servidor)
```

---

**🗺️ Mapa de Navegación Completo v3.0**  
**📅 Última actualización: Octubre 2024**  
**🌺 Flores Victoria - Sistema E-commerce Ultra-Avanzado**  

> 🧭 **Este mapa te guía por todas las funcionalidades, URLs y recursos del sistema Flores Victoria v3.0**