# 🎯 Guía Paso a Paso: Configurar Notion para Flores Victoria

## ⏱️ Tiempo Estimado: 30-45 minutos

---

## 📋 Antes de Empezar

### ✅ Checklist Previo

- [ ] Tienes cuenta en Notion (o crea una gratis en https://notion.so)
- [ ] Has ejecutado `bash scripts/notion-setup.sh`
- [ ] Tienes los archivos en `docs/notion-exports/`
- [ ] Tienes el navegador abierto en Notion

---

## 🚀 PASO 1: Crear Workspace (5 min)

1. **Accede a Notion:**
   - Ve a https://notion.so
   - Haz clic en "Get Notion free"
   - Regístrate con email/Google

2. **Crea el Workspace:**
   - Clic en el botón "+" en la sidebar
   - Selecciona "Add a page"
   - Título: **"Flores Victoria - Project Hub"**
   - Ícono: 🌸 (clic en el título para cambiar)
   - Cover: Sube una imagen de flores o usa un color

3. **Configuración del Workspace:**
   - Settings & members (esquina superior derecha)
   - Workspace settings
   - Nombre: "Flores Victoria"
   - Ícono: 🌸

---

## 📁 PASO 2: Crear Estructura de Carpetas (10 min)

Dentro de tu página "Flores Victoria - Project Hub", crea esta estructura:

### 2.1 Crear Secciones Principales

1. **Escribe "/" para abrir el menú**
2. **Selecciona "Heading 1"**
3. **Crea estos headings:**

```
🏠 HOME
📚 DOCUMENTATION
📋 PROJECT MANAGEMENT
🔗 UI VALIDATION
📅 MEETINGS & DECISIONS
📊 METRICS & MONITORING
```

### 2.2 Bajo cada heading, crear páginas:

**Bajo 🏠 HOME:**

- Clic en "+" al lado del heading
- Selecciona "Page"
- Crea: "Quick Links"
- Crea: "System Status"
- Crea: "Current Sprint"

**Bajo 📚 DOCUMENTATION:**

- Crea: "Architecture Overview"
- Crea: "Services Catalog"
- Crea: "Setup Guide"
- Crea: "Frontend Structure"

**Bajo 📋 PROJECT MANAGEMENT:**

- Crea: "Roadmap"
- Crea: "Tasks" (será una Database)
- Crea: "Bugs" (será una Database)
- Crea: "Features" (será una Database)

**Bajo 🔗 UI VALIDATION:**

- Crea: "Broken Links Tracker" (Database)
- Crea: "Validation Reports"

**Bajo 📅 MEETINGS & DECISIONS:**

- Crea: "Meeting Notes"
- Crea: "ADRs"
- Crea: "Retrospectives"

**Bajo 📊 METRICS & MONITORING:**

- Crea: "System Health"
- Crea: "Performance Metrics"

---

## 📊 PASO 3: Importar Databases (15 min)

### 3.1 Importar Services Status

1. **Abre la página "System Status"**
2. **Escribe "/" → selecciona "Table - Database"**
3. **Clic en "⋮" (tres puntos) → "Merge with CSV"**
4. **Sube el archivo:** `docs/notion-exports/services-status.csv`
5. **Configura las columnas:**
   - Service Name: Title
   - Status: Select
   - Dev Port: Number
   - Prod Port: Number
   - Health Check: URL
   - Last Updated: Date

### 3.2 Importar Tasks

1. **Abre la página "Tasks"**
2. **Escribe "/" → "Table - Database"**
3. **Importa:** `docs/notion-exports/tasks.csv`
4. **Configura columnas:**
   - Task: Title
   - Status: Select (🆕, 🔵, ✅, ❌)
   - Priority: Select (🔴, 🟠, 🟡, 🟢)
   - Service: Multi-select
   - Assignee: Person
   - Due Date: Date
   - Sprint: Select
   - Estimate: Number

5. **Crea vistas adicionales:**
   - Clic en "+ Add a view"
   - "Board" → Agrupa por "Status"
   - "Calendar" → Fecha por "Due Date"
   - "Timeline" → Fecha inicio/fin

### 3.3 Importar Broken Links

1. **Abre "Broken Links Tracker"**
2. **Crea Database**
3. **Importa:** `docs/notion-exports/broken-links.csv`
4. **Configura:**
   - Link: Title
   - File: Text
   - Status: Select (🔴 Broken, 🟡 In Progress, 🟢 Fixed)
   - Priority: Select
   - Type: Multi-select (href, src, CSS, JS)

### 3.4 Importar Environment Variables

1. **Abre "Setup Guide"**
2. **Crea una sección "Environment Variables"**
3. **Importa:** `docs/notion-exports/env-variables.csv`
4. **Usa como tabla de referencia**

---

## 📝 PASO 4: Copiar Contenido Inicial (10 min)

### 4.1 Home Dashboard

1. **Abre tu página principal "Flores Victoria - Project Hub"**
2. **Copia el contenido de** `docs/notion-initial-content.md`
3. **Sección "HOME Dashboard"** → pégalo en la página
4. **Formatea:**
   - Usa callout blocks para "System Status Overview"
   - Usa toggle lists para "Current Priorities"
   - Usa checklist para "Recent Updates"

### 4.2 Architecture Overview

1. **Abre "Architecture Overview"**
2. **Copia sección "Architecture Overview"** del archivo
3. **Para el diagrama:**
   - Escribe "/" → "Code block"
   - Pega el diagrama ASCII
   - O usa "/" → "Embed" → Excalidraw

### 4.3 Services Catalog

Para cada servicio (Auth, Payment, Gateway):

1. **Crea sub-página** bajo "Services Catalog"
2. **Usa el template de "Service Documentation"** que te di
3. **Copia los datos** de `docs/notion-initial-content.md`

### 4.4 Getting Started Guide

1. **Abre "Setup Guide"**
2. **Copia sección "Getting Started"**
3. **Formatea:**
   - Numbered list para pasos
   - Code blocks para comandos
   - Toggle para "Common Issues"

---

## 🎨 PASO 5: Crear Templates (10 min)

### 5.1 Template de Service

1. **En "Services Catalog":**
2. **Clic en "⋮" → "New template"**
3. **Nombre:** "Service Template"
4. **Copia el template** que te proporcioné antes
5. **Guarda**

### 5.2 Template de Bug Report

1. **En página "Bugs":**
2. **"⋮" → "New template"**
3. **Nombre:** "Bug Report"
4. **Copia el template** de Bug Report
5. **Guarda**

### 5.3 Template de Meeting

1. **En "Meeting Notes":**
2. **"⋮" → "New template"**
3. **Nombre:** "Meeting Template"
4. **Copia el template** de Meeting Notes
5. **Guarda**

### 5.4 Template de ADR

1. **En "ADRs":**
2. **"⋮" → "New template"**
3. **Nombre:** "ADR Template"
4. **Copia el template** de ADR
5. **Copia los ejemplos** de `docs/notion-exports/adr-templates/`

---

## 🔗 PASO 6: Crear Enlaces Entre Páginas (5 min)

### 6.1 Links en Home

1. **En "Quick Links" de Home:**
2. **Escribe "@" y busca las páginas:**
   - @Documentation
   - @Tasks
   - @Bugs
   - @Services Catalog
3. **Esto crea links internos**

### 6.2 Relaciones en Databases

1. **En la Database "Tasks":**
2. **Agregar propiedad "Related Services"**
3. **Tipo: Relation**
4. **Relaciona con: "Services Status"**
5. **Ahora puedes vincular tasks con servicios**

---

## 📱 PASO 7: Configurar Vistas y Filtros (5 min)

### 7.1 Vista Kanban para Tasks

1. **Abre "Tasks"**
2. **Clic en vista actual → "Board"**
3. **Group by: "Status"**
4. **Hidden groups: "✅ Done"** (opcional)

### 7.2 Vista Calendar

1. **"+ Add a view" → "Calendar"**
2. **Show calendar by: "Due Date"**

### 7.3 Filtros Útiles

**En Tasks, crea filtros:**

- "My Tasks": `Assignee` → `Is` → `@Me`
- "This Sprint": `Sprint` → `Is` → `Sprint 1`
- "High Priority": `Priority` → `Contains` → `🔴 Critical` or `🟠 High`

---

## ✅ PASO 8: Verificación Final

### Checklist de Verificación:

- [ ] ✅ Estructura de carpetas creada
- [ ] ✅ 4 Databases importadas (Services, Tasks, Broken Links, Env Vars)
- [ ] ✅ Contenido inicial copiado en páginas principales
- [ ] ✅ Templates creados (Service, Bug, Meeting, ADR)
- [ ] ✅ Enlaces internos funcionando
- [ ] ✅ Vistas configuradas (Kanban, Calendar, Timeline)
- [ ] ✅ Filtros útiles creados
- [ ] ✅ Quick Reference accesible

---

## 🎯 Próximos Pasos Inmediatos

### Hoy (24 Oct):

1. ✅ Workspace configurado
2. 📝 Crear primera Meeting Note con este template
3. 🐛 Migrar los 263 broken links a la database

### Mañana (25 Oct):

1. 📊 Actualizar status de servicios
2. ✅ Marcar tasks completadas como "Done"
3. 📝 Documentar decisión de link refactoring como ADR

### Esta Semana:

1. 🔄 Setup backup semanal (export a Markdown)
2. 🔗 Crear script para auto-update de validation reports
3. 👥 Invitar a team members (si aplica)

---

## 💡 Tips & Tricks

### Atajos de Teclado Útiles:

- `Cmd/Ctrl + P`: Quick find (buscar páginas)
- `Cmd/Ctrl + K`: Create link
- `Cmd/Ctrl + Shift + N`: Nueva página
- `/`: Menú de bloques
- `@`: Mencionar página o persona
- `[[`: Link a página
- `:`: Emoji picker

### Productivity Hacks:

1. **Usa Templates:** Siempre crea desde template en vez de página vacía
2. **Favoritos:** Marca páginas frecuentes con ⭐
3. **Búsqueda:** `Cmd/Ctrl + P` es tu mejor amigo
4. **Menciones:** Usa `@today`, `@tomorrow` para fechas rápidas
5. **Databases:** Filtra por `Created by me` para ver solo tus items

### Organización:

- 🔴 = Crítico/Urgente
- 🟠 = Alto
- 🟡 = Medio
- 🟢 = Bajo
- ⚪ = No iniciado
- 🔵 = En progreso
- ✅ = Completado
- ❌ = Bloqueado/Cancelado

---

## 🆘 Problemas Comunes

### "No puedo importar CSV"

**Solución:** Asegúrate de crear la Database primero (/ → Table), luego usa "Merge with CSV"

### "Los links no funcionan"

**Solución:** Usa `@nombre-pagina` para crear links internos automáticos

### "La búsqueda no encuentra nada"

**Solución:** Espera 1-2 minutos después de crear contenido para que se indexe

### "Quiero mover una página"

**Solución:** Drag & drop en la sidebar izquierda

### "Necesito más espacio"

**Solución:** Plan Free tiene bloques ilimitados, solo archivos están limitados a 5MB

---

## 📚 Recursos Adicionales

### Notion Help Center:

- https://notion.so/help

### Video Tutorials:

- Notion Basics: https://youtube.com/notion
- Database Guide: https://notion.so/guides/databases

### Templates Gallery:

- https://notion.so/templates

### Community:

- Reddit: r/Notion
- Discord: Notion Community

---

## 🎉 ¡Listo!

Tu workspace de Notion está configurado. Ahora tienes:

- ✅ 4 Databases funcionales
- ✅ Templates reutilizables
- ✅ Documentación centralizada
- ✅ Sistema de tracking de tareas
- ✅ Enlaces internos organizados

**Tiempo total invertido:** ~45 minutos **ROI esperado:** Ahorras ~9 horas/mes en organización

---

**Última actualización:** 2025-10-24 **Creado por:** GitHub Copilot para Flores Victoria
