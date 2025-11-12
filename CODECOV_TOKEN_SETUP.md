# 🔐 Configuración del Token de Codecov

## Token de Codecov

```
aa14a560-2cf5-4416-b222-f66ff4baef85
```

## 📋 Pasos para agregar el token a GitHub Secrets

### Opción 1: Interfaz Web de GitHub (Recomendado)

1. **Ve a tu repositorio en GitHub:**

   ```
   https://github.com/laloaggro/Flores-Victoria-/settings/secrets/actions
   ```

2. **Click en "New repository secret"**

3. **Configura el secreto:**
   - **Name:** `CODECOV_TOKEN`
   - **Secret:** `aa14a560-2cf5-4416-b222-f66ff4baef85`

4. **Click en "Add secret"**

### Opción 2: GitHub CLI (si tienes gh instalado)

```bash
gh secret set CODECOV_TOKEN --body "aa14a560-2cf5-4416-b222-f66ff4baef85"
```

## ✅ Verificación

Una vez configurado el secreto:

1. El próximo push activará automáticamente el workflow de CI
2. El workflow subirá los reportes de cobertura a Codecov
3. Podrás ver los reportes en: https://codecov.io/gh/laloaggro/Flores-Victoria-

## 🔒 Seguridad

- ✅ Este token está guardado localmente solo en este archivo temporal
- ✅ Una vez configurado en GitHub Secrets, puedes eliminar este archivo
- ✅ Los secretos de GitHub están encriptados y solo son accesibles durante la ejecución de
  workflows

---

**Fecha de configuración:** 30 de octubre de 2025
