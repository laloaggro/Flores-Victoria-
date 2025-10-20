# MCP Server (Model Context Protocol)

## Descripción / Description

Servidor MCP para gestión de contexto de modelos, automatización de tareas IA y trazabilidad en proyectos Node.js con microservicios.

MCP server for model context management, AI task automation, and traceability in Node.js microservices projects.

---

## Características / Features
- Gestión de contexto de modelos y agentes IA / Model and agent context management
- Automatización de tareas (tests, despliegues, documentación) / Task automation (tests, deploys, docs)
- Auditoría y trazabilidad de acciones IA / Audit and traceability of AI actions
- Integración con GitHub Actions y CI/CD / GitHub Actions and CI/CD integration
- API REST para interacción con microservicios / REST API for microservices interaction
- Documentación bilingüe (ES/EN) / Bilingual documentation (ES/EN)

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

---

## Uso en CI/CD / Usage in CI/CD

- Agrega pasos en tu workflow para interactuar con el MCP server.
- Add steps in your workflow to interact with the MCP server.

---

## Recomendaciones / Recommendations
- Úsalo para coordinar agentes IA y tareas automáticas.
- Use it to coordinate AI agents and automated tasks.
- Integra logs y auditoría para trazabilidad completa.
- Integrate logs and audit for full traceability.
- Extiende el servidor para nuevos flujos de automatización.
- Extend the server for new automation flows.

---

## Ejemplo de endpoints / Example endpoints

- `POST /tasks` - Ejecuta una tarea automática / Run an automated task
- `GET /context` - Obtiene el contexto actual / Get current context
- `POST /audit` - Registra una acción IA / Register an AI action

---

## Documentación completa / Full documentation
- Ver `docs/MCP_SERVER_DOCUMENTATION.md`
