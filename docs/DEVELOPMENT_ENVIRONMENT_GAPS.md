# Gaps del Entorno de Desarrollo y Plan de Profesionalización

Este documento resume el estado actual del entorno de desarrollo, los gaps detectados y un plan de
acción priorizado para llevar el proyecto a un nivel profesional, consistente y fácil de mantener.

## Resumen ejecutivo

- CI actual ejecuta `npm ci` y `npm test` en la raíz, pero el script `test` no ejecuta Jest y no se
  instalan dependencias de los microservicios. Resultado probable: fallas en CI o tests omitidos.
- No hay configuración de editor o versión de Node estandarizada (.editorconfig, .nvmrc). En CI y
  Docker se usa Node 18 — se recomienda fijarla en el repo.
- Dockerfiles.dev no son consistentes en el manejo de código compartido (`shared/`): auth copia
  `../shared` a la imagen; product no, y depende de volume mount. Estandarizar un patrón.
- `docker-compose.dev-simple.yml` define envs inline (por ejemplo `JWT_SECRET`) y no usa `env_file`.
  Existen referencias a `.env.example` en docs, pero no hay plantilla en el árbol esperado.
- Job de build en CI ejecuta `cd microservices && docker-compose build`, pero no existe un
  docker-compose en ese directorio (los compose viven en la raíz y en `development/`).
- Monorepo sin workspaces: instalar deps por microservicio no está automatizado en CI ni en scripts.
  Alternativas: npm workspaces o script que recorra microservicios e instale.

## Evidencia clave

- CI: `.github/workflows/ci-cd.yml`
  - Node 18; `npm ci`; `npm test` (root). Luego `./scripts/run-integration-tests.sh`. Build:
    `cd microservices && docker-compose build`.
- Tests: `jest.config.js` en raíz y carpeta `tests/` con unit, integration y load tests.
- Root package.json: `"test": "echo \"Error: no test specified\" && exit 1"` (no ejecuta Jest).
- Node versión: Dockerfiles.dev y CI usan Node 18; no hay `.nvmrc`.
- Editor base: no hay `.editorconfig`.
- Entorno: servicios usan `dotenv`; docs refieren `.env.example`; no existe plantilla en
  `microservices/`.
- Inconsistencia shared:
  - `auth-service/Dockerfile.dev` copia `../shared` → imagen autosuficiente.
  - `product-service/Dockerfile.dev` no copia `shared` y depende de volume en compose.

## Gaps detallados y severidad

- Críticos
  - Script de tests en raíz incorrecto: CI no ejecuta Jest realmente, o falla siempre. Afecta
    verificación de calidad.
  - CI Build ruta inválida: `cd microservices && docker-compose build` no funcionará dado el layout
    actual.
  - Dependencias de microservicios no instaladas antes de tests en CI.
- Altos
  - Ausencia de `.nvmrc` (divergencia de versiones) y `.editorconfig` (estilo inconsistente).
  - Manejo inconsistente de `shared/` entre microservicios en dev.
  - `docker-compose.dev-simple.yml` sin `env_file` y secretos inline (p. ej. `JWT_SECRET`).
- Medios
  - Paquetes de tooling (jest, k6) como dependencies en raíz en lugar de devDependencies.
  - Falta de comandos estándar: `test:unit`, `test:integration`, `lint`, `format`, `typecheck` (si
    aplica).
- Bajos
  - Ausencia de devcontainer (opcional) para onboarding homogéneo.

## Plan de acción priorizado

1. Corregir pipeline de pruebas (Crítico)

- Actualizar `package.json` (raíz):
  - `test`: `jest`
  - `test:unit`: `jest --runTestsByPath tests/unit-tests`
  - `test:integration`: `jest --runTestsByPath tests/integration-tests`
  - Opcional: `test:ci`: `jest --ci --coverage`
- Asegurar instalación de dependencias de microservicios antes de correr tests:
  - Opción A (recomendada a corto plazo): script shell que ejecute `npm ci` dentro de cada
    microservicio relevante.
  - Opción B (recomendada a medio plazo): migrar a npm workspaces y centralizar instalación.

2. Arreglar job de build en CI (Crítico)

- Cambiar a `docker compose -f docker-compose.yml build` ejecutado en la raíz, o invocar build por
  servicio con Buildx.
- Si se introduce un compose específico de build (p. ej. `docker-compose.build.yml`), ajustarlo en
  el workflow.

3. Estandarizar Node y editor (Alto)

- Añadir `.nvmrc` con `18` para alinear con Docker y CI.
- Añadir `.editorconfig` con reglas básicas de indentación, charset y fin de línea.

4. Unificar estrategia de `shared/` (Alto)

- En dev, preferir volume mount en compose para `./shared:/shared` y evitar copiar `shared` en
  Dockerfiles.dev.
- Alternativamente, si se quiere imagen autosuficiente para dev, copiar en todos y retirar el
  volume. Elegir una sola estrategia y documentarla.

5. Variables de entorno y secretes (Alto)

- Añadir `microservices/.env.example` con variables mínimas esperadas por servicios (JWT_SECRET,
  MONGO_URI, REDIS_URL, etc.).
- `docker-compose.dev-simple.yml`: referenciar `env_file: ./microservices/.env` y retirar secretos
  inline cuando sea posible.

6. Higiene de dependencias y scripts (Medio)

- Mover `jest`, `k6` a devDependencies en el root si solo son tooling.
- Añadir scripts `lint`, `format`, y configurar ESLint/Prettier si se decide adoptarlos ahora.

## Aceptación y resultados esperados

- CI
  - PASS: Tests unitarios/integración corren desde raíz y usan Jest local.
  - PASS: Build de imágenes se ejecuta sin errores desde la raíz.
- DX (Developer Experience)
  - Equipo usa Node 18 sin fricciones (`.nvmrc`).
  - Estilo consistente entre editores (`.editorconfig`).
  - Onboarding simple: `.env.example` y `env_file` documentados.
- Dev containers
  - Los microservicios cargan `shared/` de forma consistente en dev.

## Siguientes pasos sugeridos

- Corto plazo (1–2 días)
  - Actualizar `package.json` raíz con scripts de test y ajustar CI a usarlos.
  - Script temporal `scripts/install-microservices-deps.sh` que recorra `microservices/*` y ejecute
    `npm ci` si existe `package.json`.
  - Introducir `env_file` en `docker-compose.dev-simple.yml` y proveer `.env.example`.
  - Añadir `.nvmrc` y `.editorconfig` (incluidos en este PR).

- Medio plazo (1–2 semanas)
  - Evaluar npm workspaces para instalación y ejecución orquestada.
  - Estandarizar Dockerfiles.dev y documentar la estrategia de `shared/`.
  - Opcional: Devcontainer para VS Code.

---

Documento generado automáticamente a partir del estado actual del repo. Si avanzamos con los cambios
propuestos, puedo abrir PRs con los ajustes de CI y scripts.
