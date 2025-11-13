# CI/CD, Calidad, Seguridad y DevOps — Informe de Evaluación (11 Nov 2025)

Este informe consolida hallazgos, riesgos, quick wins y un plan de acción priorizado para el repositorio `Flores-Victoria-`.

## Resumen ejecutivo

- Estado CI/CD: sólido y amplio, con pipelines de lint/test, despliegue (placeholder), seguridad (audits, ZAP, headers, secretos) y cobertura con Codecov. Faltaba E2E Playwright y compatibilidad multi-Node; se incorporaron workflows nuevos.
- Calidad: ESLint + Prettier + Husky correctos. Existe deuda técnica en tests (varios ignorados), cobertura actual ~23.66% vs objetivo 60%.
- Seguridad/DevOps: Dependabot configurado (npm, Docker, Actions). Se detectaron divergencias de versiones (Node/DB) entre entornos; se añadió escaneo de imágenes y SBOM.

## Hallazgos clave

1. Versiones inconsistentes
   - Node: README/engines piden >=22; Dockerfiles usan 16/18; CI usa 20. Riesgo de errores no detectados.
   - Bases de datos: docker-compose base/prod usa Postgres 13/Mongo 4.4; CI usa Postgres 16/Mongo 7.0. Tests no reflejan producción.

2. Testing y cobertura
   - `jest.config.js` ignora muchos tests por fallos de conexión/mocking (Mongo/JWT). Cobertura ~23.66% (objetivo 60%).
   - Falta Playwright en CI y no hay Percy/visual en pipelines (README lo menciona).

3. Despliegue
   - `deploy.yml` contiene fases detalladas pero la ejecución real de deploy es placeholder (echo). No hay entrega efectiva.

4. Seguridad
   - Trivy escaneaba sólo una imagen. Se amplió a API Gateway, Auth, Product y User.
   - Secrets: uso parcial de `docker-compose.secrets.yml` (solo Postgres). JWT/SMTP via env.
   - SBOM ausente: ahora agregado con Syft (SPDX).

5. Netlify y caché
   - Dos `netlify.toml` con políticas distintas para HTML (una 1h cache, otra no-cache). Posible inconsistencia de experiencia.

## Cambios aplicados (bajo riesgo)

- Añadido workflow E2E Playwright: `.github/workflows/e2e-playwright.yml` (levanta stack dev, espera 5173, ejecuta Playwright, sube reporte).
- Añadido workflow de matriz Node (18/20/22): `.github/workflows/ci-matrix.yml` (lint + tests para servicios críticos + cobertura raíz).
- Añadido escaneo de contenedores (Trivy) para 4 servicios clave: `.github/workflows/container-scan.yml` (con artifacts JSON por servicio).
- Añadido generación de SBOM (Syft, SPDX): `.github/workflows/sbom.yml`.

## Riesgos prioritarios

1) Divergencia Node/DB (Alta): incoherencias pueden causar bugs sutiles. 
2) Cobertura de tests baja y pruebas ignoradas (Alta): riesgo de regresiones.
3) Deploy placeholder (Alta): no hay entrega automatizada real.
4) Gestión de secretos incompleta (Media): JWT/SMTP expuestos como env simples.
5) Políticas de caché Netlify divergentes (Media): incoherencia UX/SEO.

## Quick wins (1-2 días)

- Alinear Node base a 20 o 22 en todos los Dockerfiles; actualizar `actions/setup-node` acorde.
- Homologar versiones de Postgres/Mongo entre compose y CI (ideal: Postgres 16, Mongo 7 en todos los entornos o fijar 13/4.4 también en CI).
- Activar Playwright en CI (ya hecho) y/o añadir smoke E2E mínimo.
- Extender Trivy matrix a más imágenes gradualmente (cart, wishlist, review, contact, frontend, admin-panel).
- Unificar `netlify.toml` (decidir cache HTML: no-cache en dev, revalidación corta prod).

## Plan de acción priorizado (2-4 semanas)

1. Compatibilidad runtime (Semana 1)
   - Definir versión objetivo de Node (22) y actualizar: Dockerfiles (auth, product, api-gateway, order legacy), CI workflows.
   - Alinear Postgres/Mongo (16/7) o documentar freeze a 13/4.4 y reflejarlo en CI.

2. Testing y cobertura (Semanas 1-2)
   - Categorizar tests ignorados por motivo; crear issues por grupo (Mongo connection, JWT mocking, integration infra) y corregir 2-3 root causes.
   - Subir cobertura a ≥35% en sprint 1 (product-service, auth-service) y a ≥45% en sprint 2.
   - Añadir job Playwright por PR crítico (ya agregado) y optional Percy visual (si token disponible).

3. Deploy real (Semana 2)
   - Implementar despliegue real en `deploy.yml` (Netlify CLI para frontend; rsync/S3 para estáticos; o Docker target).
   - Health checks post-deploy y notificación.

4. Seguridad (Semanas 2-3)
   - Ampliar Trivy a todos los servicios y habilitar `exit-code: 1` en ramas protegidas.
   - Añadir SBOM por imagen (opcional) y firma/cosign si aplica.
   - Externalizar secretos: GitHub Encrypted Secrets / Docker secrets para JWT/SMTP.

5. Observabilidad y resiliencia (Semanas 3-4)
   - Confirmar instrumentación Jaeger por servicio; añadir middlewares de tracing.
   - Implementar circuit breakers/timeouts/retries en API Gateway y servicios de red críticos.

## Indicadores de éxito

- CI verde en Node 22, 20 y 18 (temporal) sin flaky.
- Cobertura ≥35% en 2 semanas; ≥45% en 4 semanas.
- E2E Playwright corriendo por PR; smoke pasa en <5 min.
- Trivy sin CRITICAL en imágenes clave; SBOM publicado por release.
- Deploy automatizado a staging/producción con health checks.

## Notas y supuestos

- No se modificaron configuraciones de producción sensibles (Netlify, caché HTML) sin aprobación; se propone unificación.
- No se eliminaron tests ignorados; se sugiere plan de corrección por lotes.

---

Última actualización: 11 Nov 2025
