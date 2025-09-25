# MongoDB Visualization in VSCode

Esta guía explica cómo visualizar la base de datos MongoDB del proyecto Flores Victoria directamente desde VSCode.

## Prerrequisitos

1. Extensión de MongoDB instalada en VSCode (ya está instalada)
2. Contenedor de MongoDB en ejecución

## Conexión a la base de datos

La conexión ya está configurada en el archivo `.vscode/settings.json`. Para conectarte:

1. Abre VSCode en la carpeta del proyecto:
   ```bash
   cd /home/laloaggro/Proyectos/flores-victoria
   code .
   ```

2. En la barra lateral de VSCode, busca el ícono de MongoDB (parece un cubo azul con una hoja)

3. En el panel de MongoDB, deberías ver la conexión "Flores Victoria MongoDB"

4. Haz clic en el botón "Connect" junto a la conexión

## Explorar los datos

Una vez conectado, podrás:

1. Ver las bases de datos disponibles
2. Expandir la base de datos `floresvictoria`
3. Ver las colecciones (como `products`)
4. Explorar los documentos dentro de cada colección
5. Realizar consultas directamente desde la interfaz

## Consultas útiles

Puedes ejecutar estas consultas en la interfaz de MongoDB de VSCode:

### Listar todos los productos
```javascript
use floresvictoria
db.products.find({})
```

### Contar productos
```javascript
use floresvictoria
db.products.countDocuments()
```

### Buscar productos por categoría
```javascript
use floresvictoria
db.products.find({ category: "Ramos" })
```

## Solución de problemas

Si no puedes conectarte:

1. Verifica que los contenedores estén en ejecución:
   ```bash
   cd /home/laloaggro/Proyectos/flores-victoria
   docker-compose ps
   ```

2. Asegúrate de que el puerto 27017 esté accesible:
   ```bash
   telnet localhost 27017
   ```

3. Verifica las credenciales en el archivo `.vscode/settings.json`