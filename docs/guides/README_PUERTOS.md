# 🔧 Sistema de Gestión de Puertos - Flores Victoria v3.0

## ✅ Solución Implementada

**Problema**: Conflictos de puertos al ejecutar múltiples ambientes simultáneamente  
**Solución**: Sistema centralizado con puertos predefinidos por ambiente

---

## 🎯 Quick Start

```bash
# Ver configuración
npm run ports:show:dev

# Validar sin conflictos
npm run ports:check

# Iniciar desarrollo
npm run services:start:dev

# Detener
npm run services:stop:dev
```

---

## 📊 Puertos por Ambiente

### Development (3xxx)

- AI Service: **3013**
- Order Service: **3004**
- Admin Panel: **3021**
- Notification: **3016**
- Prometheus: **9090**
- Grafana: **3011**

### Production (4xxx)

- AI Service: **4013**
- Order Service: **4004**
- Admin Panel: **4021**
- Notification: **4016**
- Prometheus: **9091**
- Grafana: **4011**

### Testing (5xxx)

- AI Service: **5013**
- Order Service: **5004**
- Admin Panel: **5021**
- Notification: **5016**
- Prometheus: **9092**
- Grafana: **5011**

---

## 📚 Documentación

| Archivo                  | Descripción               |
| ------------------------ | ------------------------- |
| `docs/PORTS.md`          | Guía completa y detallada |
| `PUERTOS_QUICK_START.md` | Inicio rápido             |
| `TABLA_PUERTOS.md`       | Tabla comparativa         |
| `EJEMPLOS_PUERTOS.md`    | 10 escenarios prácticos   |
| `SISTEMA_PUERTOS.txt`    | Diagrama visual ASCII     |
| `config/ports.json`      | Configuración central     |

---

## 🚀 Comandos NPM

### Ver Puertos

```bash
npm run ports:show          # Todos
npm run ports:show:dev      # Development
npm run ports:show:prod     # Production
npm run ports:show:test     # Testing
```

### Validar

```bash
npm run ports:check         # Validar config
npm run ports:check:dev     # Check dev
npm run ports:check:prod    # Check prod
```

### Servicios

```bash
npm run services:start:dev
npm run services:start:prod
npm run services:start:test

npm run services:stop:dev
npm run services:stop:prod
npm run services:stop:test
```

---

## ✅ Garantías

- ✅ **Sin conflictos** entre ambientes
- ✅ **39 puertos** asignados (13 × 3)
- ✅ **Validación automática** antes de iniciar
- ✅ **Logs separados** por ambiente
- ✅ **Documentación completa**

---

## 🎓 Convención

- **3xxx**: Development
- **4xxx**: Production
- **5xxx**: Testing
- **9xxx**: Monitoring (Prometheus)

---

**Versión**: 3.0  
**Estado**: ✅ Implementado y Validado  
**Fecha**: Octubre 24, 2025
