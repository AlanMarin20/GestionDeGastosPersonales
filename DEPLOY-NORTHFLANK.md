# Deploy en Northflank

Guía completa para hacer deploy de la aplicación en Northflank.

## ¿Qué incluye este deploy?

✅ **Dockerfile multi-stage** optimizado
- Compila el backend (TypeScript → JavaScript)
- Compila el frontend (Vite bundle)
- Sirve el frontend estáticamente desde el backend
- Imagen pequeña y rápida basada en Node Alpine

✅ **Un solo servicio**
- Backend + Frontend integrados en un único contenedor
- Más económico y simple de gestionar
- Puerto único (8080)

✅ **Health checks**
- Monitoreo automático del servicio
- Reinicio automático si falla

## Pasos para hacer deploy en Northflank

### 1. Conectar el repositorio

1. Ve a [Northflank Dashboard](https://app.northflank.com)
2. Crea un nuevo **Project**
3. Selecciona **Deployment** → **Git Repository**
4. Conecta tu repositorio de GitHub
5. Selecciona la rama: `main` (o la que uses)

### 2. Configurar variables de entorno

En **Settings** → **Environment Variables**, agrega:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=tu-clave-super-secreta-minimo-16-caracteres
DB_SSL=true
DB_SYNCHRONIZE=false
NODE_ENV=production
PORT=8080
```

**Cómo obtener DATABASE_URL:**

#### Opción A: PostgreSQL en Northflank
1. Crea un servicio PostgreSQL en Northflank
2. Ve a sus Settings → Connection String
3. Copia la URL completa

#### Opción B: PostgreSQL externo
- Usa la URI de tu BD existente
- Ejemplo: `postgresql://user:pass@db.example.com:5432/mydb`

### 3. Configurar el servicio

**Build Settings:**
- Builder: `Docker`
- Dockerfile path: `./Dockerfile`
- Build context: `.`

**Port Settings:**
- Internal Port: `8080`
- Public: Sí (marca como público)

**Resources (mínimo recomendado):**
- CPU: 0.5
- Memory: 512 MB

### 4. Deploy

1. Northflank detecta el `Dockerfile` automáticamente
2. Click en "Deploy"
3. Espera a que compile e inicie

**Tiempo estimado:** 5-10 minutos en primer deploy

### 5. Verificar que funciona

Una vez desplegado:
- Accede a la URL pública que Northflank te proporciona
- Deberías ver el login de la aplicación
- Verifica `/api/auth/me` → debe retornar 401 (sin token, pero la API funciona)

---

## Estructura del Dockerfile

```dockerfile
Stage 1: frontend-builder
├── Compila frontend con Vite
└── Output: frontend/dist/

Stage 2: backend-builder
├── Compila backend con NestJS
└── Output: backend/dist/

Stage 3: runtime (producción)
├── Copia dependencias runtime del backend
├── Copia frontend/dist/ → para servir estáticamente
├── Copia backend/dist/ → código compilado
└── Inicia el servidor en puerto 8080
```

---

## Cómo funciona en producción

```
Usuario → HTTPS → Northflank (LoadBalancer)
                  ↓
                Backend (Node.js en puerto 8080)
                ├── /api/* → Rutas de API (JSON)
                └── /* → Sirve frontend (HTML/CSS/JS)
                    ├── /index.html → Punto de entrada SPA
                    ├── /assets/* → JS/CSS compilado
                    └── Fallback: index.html (para rutas del SPA)
```

---

## Bases de datos

### PostgreSQL recomendado

Si creaste una BD PostgreSQL en Northflank:

1. Crea un servicio PostgreSQL
2. Configura:
   - Version: 15 o superior
   - Database: `gestion_gastos`
   - User: (auto-generado)
   - Password: (auto-generado)
3. Copia la connection string a `DATABASE_URL`

### Conexión desde el backend

El backend se conecta automáticamente al iniciar:
1. Lee `DATABASE_URL`
2. Valida con Joi (requerido)
3. Si `DB_SSL=true`, usa SSL (recomendado en producción)
4. Si `DB_SYNCHRONIZE=false`, no toca el schema (seguro en prod)

---

## Troubleshooting

### Build falla: "npm ERR! code ENOENT"

**Causa:** Faltan archivos en el build context

**Solución:**
- Verifica que el Dockerfile esté en la raíz del proyecto
- Asegúrate que `backend/` y `frontend/` existan con package.json
- Revisa que no hay archivos faltantes (src/, dist/)

### Error de conexión a BD

**Causa:** DATABASE_URL inválida o BD inaccesible

**Solución:**
1. Verifica que la BD esté corriendo
2. Usa el formato correcto: `postgresql://user:pass@host:port/dbname`
3. Si usas Northflank DB: copia la string exacta desde el servicio
4. Prueba la conexión localmente primero

### Aplicación inicia pero no se ve el frontend

**Causa:** Frontend no se compiló o no se copió

**Solución:**
1. Revisa logs: Northflank → Logs
2. Verifica que `npm run build` funciona localmente
3. Asegúrate que frontend/dist/ existe después del build

### Health check falla

**Causa:** La aplicación no está respondiendo

**Solución:**
1. Espera 10-15 segundos después del inicio
2. Verifica que JWT_SECRET está configurado (es requerido)
3. Revisa que DATABASE_URL es válida
4. Mira los logs en Northflank

### Puerto 8080 en conflicto

**Causa:** Otro servicio usa el mismo puerto

**Solución:**
- En Northflank, crea servicios en puertos diferentes
- El backend debe estar en 8080
- Cambia en el Dockerfile si necesitas otro puerto

---

## Monitoreo

Northflank proporciona:
- **Logs en tiempo real** → Ver errores
- **Métricas** → CPU, memoria, red
- **Health status** → Estado del servicio
- **Deployment history** → Ver todas las versiones

---

## Redeployar cambios

Cada vez que haces `git push` a la rama configurada:
1. Northflank detecta el cambio automáticamente
2. Inicia un nuevo build
3. Compila backend + frontend
4. Redeploy automático
5. Cero downtime (con load balancer)

---

## Variables de entorno opcionales

Para features específicas:

```
GROQ_API_KEY=sk-...     # Ticket OCR (reconocimiento de recibos)
GEMINI_API_KEY=...      # Recomendaciones con IA
RESEND_API_KEY=re_...   # Envío de emails

FRONTEND_URL=https://tu-app.northflank.app  # Para CORS
```

---

## Dominios personalizados

En Northflank Deployment:
1. **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura DNS según las instrucciones
4. HTTPS automático (Let's Encrypt)

---

## Seguridad en producción

✅ Configurado en el Dockerfile:
- `NODE_ENV=production` → Modo producción
- `DB_SSL=true` → Conexión encriptada a BD
- Sin archivos de desarrollo (`.dockerignore`)
- Imagen Alpine (pequeña y segura)

⚠️ Recuerda:
- JWT_SECRET debe ser fuerte y secreto
- DATABASE_URL no debe estar en código
- Usa variables de entorno de Northflank

---

## Performance

Con esta configuración:
- **Build:** 3-5 minutos
- **Tamaño imagen:** ~350 MB (comprimida)
- **Startup:** 5-10 segundos
- **Memory usage:** ~150-300 MB en idle

Optimizable si necesitas menos overhead.

---

## Soporte

- **Documentación Northflank:** https://northflank.com/docs
- **Issues de Docker:** Revisa los logs
- **Issues de código:** Valida localmente con `npm run build && npm start`
