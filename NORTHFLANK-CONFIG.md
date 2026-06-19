# Configuración de Variables de Entorno en Northflank

## Variables REQUERIDAS

Debes configurar EXACTAMENTE estas variables en Northflank (Settings → Environment Variables):

### 1. DATABASE_URL
**Descripción:** Connection string de PostgreSQL (Supabase)

**Formato:** 
```
postgresql://postgres.xxxxx:PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**De dónde obtenerla:**
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. **Settings** → **Database**
4. En "Connection string", selecciona **URI**
5. Reemplaza `[YOUR-PASSWORD]` con tu contraseña real
6. Copia la URL completa

**Ejemplo válido:**
```
postgresql://postgres.abc123:MyPassword123@db.abc123.supabase.co:5432/postgres
```

⚠️ **IMPORTANTE:** 
- NO dejes `[YOUR-PASSWORD]` - debe ser la contraseña REAL
- NO termines con `/` al final
- La URL debe empezar con `postgresql://`

---

### 2. JWT_SECRET
**Descripción:** Clave secreta para firmar tokens JWT

**Requisitos:**
- Mínimo 16 caracteres
- Debe ser única y fuerte
- Ejemplo seguro: `your-super-secret-key-min-16-chars-here`

**Cómo generar una buena clave:**
```bash
# En tu terminal (macOS/Linux)
openssl rand -base64 32
```

**Ejemplo válido:**
```
aB3$xY9&kL2@mN8pQ5#rS7!wE4vF6cG1hJ0
```

---

## Variables OPCIONALES (con valores por defecto)

```
NODE_ENV=production          # Por defecto en Northflank
PORT=8080                   # Puerto de escucha
DB_SSL=true                 # SSL habilitado para BD (recomendado)
DB_SYNCHRONIZE=false        # NO sincronizar schema automáticamente
```

---

## Pasos para configurar en Northflank

1. **Ve a tu Deployment**
   - Northflank Dashboard → Tu Proyecto → Tu Deployment

2. **Haz clic en "Settings"**

3. **Ve a "Environment Variables"**

4. **Agrega estas variables:**
   ```
   DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@db.xxxxx.supabase.co:5432/postgres
   JWT_SECRET=aB3$xY9&kL2@mN8pQ5#rS7!wE4vF6cG1hJ0
   DB_SSL=true
   NODE_ENV=production
   ```

5. **Haz clic en "Save"**

6. **Redeploy**
   - El deployment se reiniciará automáticamente

---

## Cómo verificar que funciona

Después del redeploy:
- Accede a tu URL de Northflank
- Deberías ver el login de la aplicación
- Si ves error en logs, revisa que DATABASE_URL es válido

---

## Troubleshooting

### Error: "DATABASE_URL must be a valid uri"
- Verifica que copiaste la URL COMPLETA de Supabase
- Asegúrate de reemplazar `[YOUR-PASSWORD]` con la contraseña REAL
- No debe tener espacios ni caracteres inválidos

### Error: "JWT_SECRET is required"
- Verifica que JWT_SECRET está configurado
- Debe tener al menos 16 caracteres

### Error: "Cannot connect to database"
- Verifica que DATABASE_URL es correcto
- En Supabase, asegúrate de habilitar "Accept connections"
- Verifica que DB_SSL=true

### Error: "Process terminated with exit code 1"
- Revisa los logs en Northflank
- Busca el diagnóstico de variables de entorno que se imprime al inicio
- Asegúrate de que DATABASE_URL y JWT_SECRET están presentes

---

## Seguridad

⚠️ **NUNCA:**
- Compartas tu DATABASE_URL con nadie
- Pongas JWT_SECRET en el código fuente
- Confirmes cambios con variables sensibles visibles

✅ **SIEMPRE:**
- Usa valores únicos y fuertes para JWT_SECRET
- Cambia DATABASE_URL si sospechas que fue comprometida
- Usa Northflank para gestionar secretos (no archivos)
