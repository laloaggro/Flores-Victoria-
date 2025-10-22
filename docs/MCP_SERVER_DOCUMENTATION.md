# MCP Server - Documentación Completa / Full Documentation

## Descripción / Description

Servidor MCP para gestión de contexto de modelos, automatización IA y trazabilidad en proyectos
Node.js con microservicios. MCP server for model context management, AI automation, and traceability
in Node.js microservices projects.

---

## Instalación / Installation

```bash
cd mcp-server
npm install
```

---

## Ejecución local / Local run

```bash
npm start
```

El servidor se inicia en el puerto 5050 por defecto. The server starts on port 5050 by default.

---

## Endpoints principales / Main endpoints

- `GET /context` - Obtiene el contexto actual / Get current context
- `POST /tasks` - Ejecuta una tarea automática / Run an automated task
- `POST /audit` - Registra una acción IA / Register an AI action
- `POST /register` - Registra modelo o agente / Register model or agent
- `POST /clear` - Limpia el contexto / Clear context

---

## Integración recomendada con tu proyecto

### 1. Orquestación de agentes IA / Orchestration of AI agents

- Usa el MCP server para coordinar asistentes IA (Copilot, bots, etc.) en tareas como testing,
  documentación, despliegue y monitoreo.
- Use MCP server to coordinate AI assistants (Copilot, bots, etc.) for tasks like testing,
  documentation, deployment, and monitoring.

### 2. Auditoría y trazabilidad / Audit and traceability

- Registra cada acción automática (test, commit, push, deploy) usando el endpoint `/audit`.
- Register every automated action (test, commit, push, deploy) using the `/audit` endpoint.

### 3. Automatización de tareas / Task automation

- Ejecuta scripts, tests o flujos automáticos desde `/tasks` y almacena resultados para análisis
  posterior.
- Run scripts, tests, or automated flows from `/tasks` and store results for later analysis.

### 4. Gestión de contexto de modelos / Model context management

- Registra modelos, agentes y sus parámetros con `/register` para tener trazabilidad y
  reproducibilidad.
- Register models, agents, and their parameters with `/register` for traceability and
  reproducibility.

### 5. Integración con CI/CD / CI/CD integration

- Agrega pasos en tu workflow de GitHub Actions para interactuar con el MCP server (ejemplo:
  registrar auditoría tras cada despliegue).
- Add steps in your GitHub Actions workflow to interact with MCP server (e.g., register audit after
  each deployment).

---

## Ejemplo de flujo recomendado / Example recommended flow

1. Antes de ejecutar tests, registra el contexto del modelo y agente IA.
2. Ejecuta los tests y registra el resultado como tarea.
3. Tras cada commit/push, registra la acción en auditoría.
4. Al desplegar, registra el evento en auditoría y contexto.

---

## Ejemplo de integración en CI/CD / Example CI/CD integration

```yaml
- name: Registrar auditoría en MCP
  run: |
    curl -X POST http://localhost:5050/audit \
      -H 'Content-Type: application/json' \
      -d '{"action": "deploy", "agent": "github-actions", "details": "Despliegue a producción"}'
```

---

## Recomendaciones específicas para tu proyecto

1. **Centraliza la gestión de agentes IA y tareas automáticas** usando MCP server para mayor control
   y trazabilidad.
2. **Integra auditoría de acciones automáticas** (tests, commits, pushes, despliegues) para
   facilitar debugging y cumplimiento.
3. **Automatiza la documentación y generación de reportes** usando tareas MCP.
4. **Registra todos los modelos y agentes IA utilizados** para reproducibilidad y análisis
   histórico.
5. **Extiende el MCP server** para incluir endpoints personalizados según las necesidades de tus
   microservicios (por ejemplo, monitoreo de salud, triggers automáticos, etc).
6. **Utiliza el endpoint `/clear`** para limpiar el contexto entre ejecuciones de CI/CD y evitar
   contaminación de datos.
7. **Documenta todos los flujos automáticos y su integración con MCP** en tu repositorio para
   facilitar onboarding y colaboración.

---

## Recursos adicionales / Additional resources

- [Model Context Protocol Spec](https://modelcontextprotocol.org)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Express.js Docs](https://expressjs.com/)

---

**Autor / Author:** GitHub Copilot **Fecha / Date:** 20 de octubre de 2025
