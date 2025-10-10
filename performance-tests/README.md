# Pruebas de Carga y Rendimiento - Flores Victoria

Este directorio contiene las pruebas de carga y rendimiento para el sistema Flores Victoria.

## Requisitos

- [k6](https://k6.io/) - Herramienta de prueba de carga

## Instalación

```bash
# Instalar k6 (en Ubuntu/Debian)
sudo apt-get install k6

# O usando npm
npm install -g k6
```

## Pruebas disponibles

### 1. Prueba de carga (Load Test)

Simula una carga de usuarios típica en el sistema.

```bash
k6 run load-test.js
```

### 2. Prueba de estrés (Stress Test)

Incrementa gradualmente la carga para encontrar el punto de ruptura del sistema.

```bash
k6 run stress-test.js
```

### 3. Prueba de soak (Soak Test)

Ejecuta el sistema bajo una carga constante durante un período prolongado para detectar problemas de memoria o degradación del rendimiento.

```bash
k6 run soak-test.js
```

## Métricas clave

- **http_req_duration**: Tiempo de respuesta de las solicitudes HTTP
- **http_req_failed**: Tasa de solicitudes fallidas
- **vus**: Número de usuarios virtuales
- **iterations**: Número de iteraciones completadas

## Interpretación de resultados

### Load Test
- Objetivo: Verificar que el sistema maneje la carga esperada en producción
- Éxito: 95% de las solicitudes completadas en menos de 500ms con tasa de error <1%

### Stress Test
- Objetivo: Encontrar el punto de ruptura del sistema
- Éxito: Identificar el número máximo de usuarios que el sistema puede manejar antes de degradar el rendimiento

### Soak Test
- Objetivo: Verificar la estabilidad a largo plazo
- Éxito: El sistema mantiene un rendimiento constante durante todo el período de prueba

## Ejecución con Docker

También puedes ejecutar las pruebas usando Docker:

```bash
# Load test
docker run --rm -v $(pwd):/scripts grafana/k6 run /scripts/load-test.js

# Stress test
docker run --rm -v $(pwd):/scripts grafana/k6 run /scripts/stress-test.js

# Soak test
docker run --rm -v $(pwd):/scripts grafana/k6 run /scripts/soak-test.js
```

## Configuración

Puedes modificar las URLs de los servicios en cada archivo de prueba según tu entorno:

```javascript
const BASE_URL = 'http://localhost:3002'; // Cambia según tu configuración
```

## Reportes

k6 genera reportes en la consola al finalizar la ejecución. Para generar reportes en formato JSON:

```bash
k6 run --out json=results.json load-test.js
```

## Mejores prácticas

1. **Ejecuta las pruebas en un entorno lo más similar al de producción posible**
2. **Monitorea el uso de CPU, memoria y red durante las pruebas**
3. **Ejecuta varias rondas de pruebas para obtener resultados consistentes**
4. **Guarda los resultados de las pruebas para comparar mejoras en el rendimiento**