# Integración con GitHub

## Conexión con el repositorio remoto

Para conectar este proyecto con el repositorio remoto en GitHub, sigue estos pasos:

1. **Verificar que el repositorio local esté inicializado:**
   ```bash
   cd /home/laloaggro/Proyectos/flores-victoria
   git status
   ```

2. **Agregar el repositorio remoto:**
   ```bash
   git remote add origin https://github.com/laloaggro/Flores-Victoria-.git
   ```

3. **Verificar que el remoto se haya agregado correctamente:**
   ```bash
   git remote -v
   ```

4. **Hacer push del código al repositorio remoto:**
   ```bash
   git push -u origin master
   ```

## Trabajo diario con Git

### Commits
Para hacer commits con mensajes descriptivos:
```bash
git add .
git commit -m "Descripción clara de los cambios realizados"
```

### Push al repositorio remoto
Para subir los cambios al repositorio remoto:
```bash
git push
```

### Pull del repositorio remoto
Para obtener los últimos cambios del repositorio remoto:
```bash
git pull
```

## Ramas

Para crear una nueva rama para una funcionalidad específica:
```bash
git checkout -b feature/nueva-funcionalidad
```

Para cambiar entre ramas:
```bash
git checkout nombre-de-la-rama
```

Para hacer merge de una rama a master:
```bash
git checkout master
git merge nombre-de-la-rama
```

## Buenas prácticas

1. **Commits frecuentes**: Realiza commits pequeños y frecuentes con mensajes descriptivos
2. **Pull antes de trabajar**: Antes de comenzar a trabajar, haz pull para obtener los últimos cambios
3. **Push regularmente**: Sube tus cambios regularmente para mantener el repositorio actualizado
4. **Usar ramas**: Crea ramas para nuevas funcionalidades o correcciones importantes
5. **Mensajes de commit claros**: Usa mensajes de commit que describan claramente qué cambios se hicieron

## Resolución de conflictos

Si ocurren conflictos al hacer merge o pull:

1. **Identificar los archivos en conflicto**
2. **Editar los archivos para resolver los conflictos**
3. **Hacer add de los archivos resueltos**
4. **Hacer commit para completar el merge**

```bash
git add archivo-resuelto
git commit -m "Resolver conflictos de merge"
```