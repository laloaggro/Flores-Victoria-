# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a **Flores Victoria**! Este documento proporciona las pautas y el flujo de trabajo para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Convención de Commits](#convención-de-commits)
- [Pull Requests](#pull-requests)
- [Reporte de Bugs](#reporte-de-bugs)
- [Solicitud de Features](#solicitud-de-features)

---

## 📜 Código de Conducta

Este proyecto y todos los que participan en él están gobernados por nuestro Código de Conducta. Al participar, se espera que respetes este código. Por favor, reporta comportamientos inaceptables a contacto@floresvictoria.com.

### Nuestros Valores

- **Respeto**: Tratamos a todos con respeto y dignidad
- **Inclusividad**: Damos la bienvenida a contribuidores de todos los orígenes
- **Colaboración**: Trabajamos juntos hacia objetivos comunes
- **Excelencia**: Nos esforzamos por la calidad en todo lo que hacemos

---

## ❓ ¿Cómo Puedo Contribuir?

### 🐛 Reportar Bugs

Si encuentras un bug, por favor:

1. Verifica que no haya sido reportado ya en [Issues](https://github.com/laloaggro/Flores-Victoria-/issues)
2. Crea un nuevo issue usando la plantilla de bug report
3. Incluye toda la información necesaria para reproducir el bug

### 💡 Sugerir Features

Las nuevas ideas son bienvenidas:

1. Revisa que la feature no haya sido sugerida antes
2. Crea un issue describiendo la feature
3. Explica por qué sería útil para el proyecto

### 📝 Mejorar Documentación

- Corregir errores tipográficos
- Mejorar explicaciones
- Agregar ejemplos
- Traducir documentación

### 🔧 Contribuir Código

- Resolver issues existentes
- Implementar nuevas features aprobadas
- Mejorar tests
- Refactorizar código

---

## 🛠️ Configuración del Entorno

### Requisitos Previos

```bash
# Node.js 20+
node --version  # v20.x.x

# Docker
docker --version  # 24.x.x

# Git
git --version  # 2.x.x
```

### Pasos de Configuración

```bash
# 1. Fork el repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/Flores-Victoria-.git
cd flores-victoria

# 3. Agregar el repositorio original como remote
git remote add upstream https://github.com/laloaggro/Flores-Victoria-.git

# 4. Instalar dependencias
npm install
npm run install:all

# 5. Configurar variables de entorno
cp .env.example .env

# 6. Iniciar servicios
docker-compose -f docker-compose.dev-simple.yml up -d

# 7. Verificar que todo funciona
npm test
```

---

## 🔄 Flujo de Trabajo

### 1. Sincronizar con Upstream

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Crear una Rama

```bash
# Para features
git checkout -b feature/nombre-descriptivo

# Para bugs
git checkout -b fix/descripcion-del-bug

# Para documentación
git checkout -b docs/que-se-documenta

# Para refactoring
git checkout -b refactor/que-se-refactoriza
```

### 3. Hacer Cambios

- Escribe código limpio y bien documentado
- Sigue los estándares de código del proyecto
- Añade tests para nuevas funcionalidades
- Actualiza la documentación si es necesario

### 4. Verificar Cambios

```bash
# Ejecutar linting
npm run lint

# Ejecutar tests
npm test

# Verificar que los servicios funcionan
curl http://localhost:3000/health
```

### 5. Commit y Push

```bash
# Agregar cambios
git add .

# Commit siguiendo la convención
git commit -m "feat: add new feature description"

# Push a tu fork
git push origin feature/nombre-descriptivo
```

### 6. Crear Pull Request

- Ve a GitHub y crea un PR desde tu rama
- Completa la plantilla del PR
- Espera la revisión

---

## 📏 Estándares de Código

### JavaScript/Node.js

```javascript
// ✅ Correcto: usar const/let, nunca var
const nombre = 'valor';
let contador = 0;

// ✅ Correcto: funciones arrow para callbacks
array.map((item) => item.value);

// ✅ Correcto: async/await sobre .then()
async function getData() {
  const result = await fetch(url);
  return result.json();
}

// ✅ Correcto: destructuring
const { name, email } = user;

// ✅ Correcto: template literals
const message = `Hola ${name}`;
```

### Nombrado

```javascript
// Variables y funciones: camelCase
const userName = 'Juan';
function getUserById(id) {}

// Clases y componentes: PascalCase
class UserService {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Archivos: kebab-case
// user-service.js
// product-controller.js
```

### Estructura de Archivos

```
microservices/[service-name]/
├── src/
│   ├── config/         # Configuraciones
│   ├── controllers/    # Controladores de rutas
│   ├── middleware/     # Middleware custom
│   ├── models/         # Modelos de datos
│   ├── routes/         # Definición de rutas
│   ├── services/       # Lógica de negocio
│   ├── utils/          # Utilidades
│   ├── validators/     # Validaciones
│   └── __tests__/      # Tests
├── server.js           # Entry point
├── package.json
└── Dockerfile
```

### ESLint

El proyecto usa ESLint con reglas específicas. Asegúrate de que tu código pase el linting:

```bash
npm run lint
npm run lint:fix  # Auto-corregir errores
```

---

## 📝 Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<ámbito>): <descripción>

[cuerpo opcional]

[pie opcional]
```

### Tipos

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Cambios de formato (no afectan código) |
| `refactor` | Refactorización sin cambio de funcionalidad |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento |
| `perf` | Mejoras de rendimiento |
| `ci` | Cambios en CI/CD |
| `build` | Cambios en sistema de build |
| `revert` | Revertir commit anterior |

### Ejemplos

```bash
# Feature nueva
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(cart): resolve item quantity update issue"

# Documentación
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(products): optimize database queries"

# Breaking change
git commit -m "feat(api)!: change response format for products endpoint

BREAKING CHANGE: The products endpoint now returns an object with pagination metadata instead of a plain array."
```

---

## 🔀 Pull Requests

### Antes de Crear un PR

- [ ] El código compila sin errores
- [ ] Todos los tests pasan
- [ ] El linting pasa sin errores
- [ ] La documentación está actualizada
- [ ] Los commits siguen la convención

### Plantilla de PR

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva feature (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que causaría que funcionalidad existente no funcione)
- [ ] Documentación

## ¿Cómo se ha probado?
[Describe las pruebas realizadas]

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He revisado mi propio código
- [ ] He comentado mi código donde es necesario
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban que mi fix/feature funciona
- [ ] Tests unitarios nuevos y existentes pasan localmente
```

### Proceso de Revisión

1. Al menos un maintainer debe aprobar el PR
2. Todos los checks de CI deben pasar
3. Los conflictos deben ser resueltos
4. El PR debe estar actualizado con `main`

---

## 🐛 Reporte de Bugs

### Plantilla de Bug Report

```markdown
## Descripción del Bug
[Descripción clara y concisa del bug]

## Pasos para Reproducir
1. Ir a '...'
2. Hacer click en '...'
3. Ver el error

## Comportamiento Esperado
[Lo que debería pasar]

## Comportamiento Actual
[Lo que realmente pasa]

## Screenshots
[Si aplica, agregar capturas de pantalla]

## Entorno
- OS: [e.g., Ubuntu 22.04]
- Browser: [e.g., Chrome 120]
- Node Version: [e.g., 20.10.0]
- Docker Version: [e.g., 24.0.7]

## Información Adicional
[Cualquier otro contexto sobre el problema]
```

---

## 💡 Solicitud de Features

### Plantilla de Feature Request

```markdown
## Resumen
[Descripción breve de la feature]

## Motivación
[¿Por qué esta feature sería útil?]

## Descripción Detallada
[Explicación completa de la feature propuesta]

## Alternativas Consideradas
[Otras soluciones que has considerado]

## Información Adicional
[Mockups, diagramas, links relevantes]
```

---

## 🎯 Áreas de Contribución Prioritarias

Actualmente buscamos ayuda en:

1. **Testing**: Aumentar cobertura de tests
2. **Documentación**: Mejorar guías y tutoriales
3. **Performance**: Optimizaciones de rendimiento
4. **Accesibilidad**: Mejorar a11y en frontend
5. **i18n**: Internacionalización

---

## 📞 Contacto

Si tienes preguntas sobre cómo contribuir:

- Abre un [Discussion](https://github.com/laloaggro/Flores-Victoria-/discussions)
- Envía un email a: contacto@floresvictoria.com

---

## 🙏 Reconocimientos

Todos los contribuidores serán reconocidos en nuestro archivo [CONTRIBUTORS.md](./CONTRIBUTORS.md).

¡Gracias por contribuir a Flores Victoria! 🌸
