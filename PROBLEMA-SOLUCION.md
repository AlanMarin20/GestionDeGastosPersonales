# Problema y Solución - Northflank Deployment

## 🔴 El Problema

El deployment en Northflank está fallando porque **las variables de entorno no están configuradas**:

```
Error: Config validation error: "DATABASE_URL" must be a valid uri. "JWT_SECRET" is required
```

Northflank dice "Successfully fetched environment variables" pero en realidad **nunca fueron configuradas**.

---

## 🟢 La Solución

He agregado **diagnóstico mejorado** al proyecto. Ahora:
1. El app mostrará qué variables están faltando
2. El app dirá exactamente qué configurar
3. Tendrás instrucciones paso a paso

## 📋 Lo que necesitas hacer

### PASO 1: Obtén tu DATABASE_URL de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Abre tu proyecto
3. Vé a **Settings** → **Database**
4. En "Connection string", selecciona **URI**
5. Verás algo como: `postgresql://postgres.abc123:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres`
6. **REEMPLAZA `[YOUR-PASSWORD]`** con tu contraseña real (sin corchetes)
7. Copia la URL completa

**Ejemplo correcto:**
```
postgresql://postgres.abc123:MyPassword123@db.abc123.supabase.co:5432/postgres
```

---

### PASO 2: Genera un JWT_SECRET

En tu terminal, ejecuta:
```bash
openssl rand -base64 32
```

Esto te dará algo como:
```
aB3$xY9&kL2@mN8pQ5#rS7!wE4vF6cG1hJ0
```

Cópialo (es de una sola vez, no necesita ser memorable).

---

### PASO 3: Configura en Northflank

1. Ve a tu **Northflank Dashboard**
2. Abre tu **Deployment**
3. Vé a **Settings** (engranaje)
4. Busca **"Environment Variables"**
5. Agrega estas 4 variables:

```
DATABASE_URL = postgresql://postgres.xxxxx:PASSWORD@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET = aB3$xY9&kL2@mN8pQ5#rS7!wE4vF6cG1hJ0
DB_SSL = true
NODE_ENV = production
```

⚠️ **IMPORTANTE:**
- Reemplaza `postgresql://postgres.xxxxx:PASSWORD@...` con tu URL real de Supabase
- Reemplaza `aB3$xY9&...` con el JWT_SECRET que generaste
- No dejes espacios extra
- No cambies los nombres de las variables

---

### PASO 4: Redeploy

1. **Haz clic en "Save"** (si hay botón)
2. El deployment debería triggear automáticamente
3. Espera a que compile y se desplegue (2-5 minutos)
4. Revisa los logs en Northflank

---

## ✅ Cómo verificar que funciona

Después del redeploy:

1. **Ve a los logs de Northflank** (Deployment → Logs)
2. **Busca esta sección:**
```
========== DIAGNÓSTICO DE VARIABLES DE ENTORNO ==========
DATABASE_URL: ✓ Presente (postgresql...)
JWT_SECRET: ✓ Presente (aB3$xY...)
✅ Todas las variables requeridas están configuradas
```

3. Si ves eso, ¡significa que funcionó!
4. Luego debería ver:
```
[Nest] Starting Nest application...
Listen on port 8080
```

---

## 🐛 Si sigue sin funcionar

Si aún ves errores:

1. **Revisa DATABASE_URL:**
   - Debe empezar con `postgresql://`
   - Debe tener la contraseña REAL (no `[YOUR-PASSWORD]`)
   - No debe tener espacios ni caracteres inválidos

2. **Revisa JWT_SECRET:**
   - Debe tener al MENOS 16 caracteres
   - No debe estar vacío

3. **Mira los logs completos:**
   - En Northflank, ve a **Logs** (no resumen)
   - Busca "DIAGNÓSTICO DE VARIABLES"
   - Verás exactamente qué falta

4. **Prueba localmente:**
   ```bash
   cd backend
   DATABASE_URL="postgresql://..." JWT_SECRET="xxxxx" npm start
   ```

---

## 📂 Cambios que hice

1. ✅ `backend/src/env-check.ts` - Script de diagnóstico
2. ✅ `backend/src/main.ts` - Ejecuta el check antes de iniciar
3. ✅ `backend/src/app.module.ts` - Logging mejorado de variables
4. ✅ `NORTHFLANK-CONFIG.md` - Instrucciones detalladas

---

## 🚀 Próximos pasos después del deployment

Una vez que Northflank esté corriendo:

1. Accede a tu URL (algo como `https://xxxxx.northflank.app`)
2. Deberías ver el login
3. Prueba la funcionalidad básica
4. Si todo funciona, haremos deploy del frontend también

¿Necesitas ayuda en alguno de estos pasos?
