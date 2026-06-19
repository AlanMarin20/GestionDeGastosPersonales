# Deploy en Railway

Instrucciones para hacer deploy de la aplicación en Railway.

## Requisitos previos

1. Cuenta en [Railway.app](https://railway.app)
2. Base de datos PostgreSQL (puedes crear una en Railway)
3. Variables de entorno configuradas

## Pasos para hacer deploy

### 1. Conectar el repositorio
- Ve a [dashboard de Railway](https://railway.app/dashboard)
- Click en "New Project" → "Deploy from GitHub"
- Selecciona tu repositorio

### 2. Configurar variables de entorno

En el dashboard de Railway, en la sección "Variables":

```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=tu-clave-super-secreta-minimo-16-caracteres
DB_SYNCHRONIZE=false
DB_SSL=true
FRONTEND_URL=https://tu-dominio.railway.app
NODE_ENV=production
```

**Obtener DATABASE_URL:**
- Si usas PostgreSQL en Railway: ve a "Resources" → Postgres → "Connect"
- Copia la URL de conexión completa
- O puedes usar una BD existente copiando su connection string

### 3. Puerto

Railway automáticamente:
- Expone el puerto en la variable de entorno `PORT`
- El backend escucha en `process.env.PORT || 3000`

### 4. Build y Deploy automático

Railway ejecutará automáticamente:
1. `npm install` (en todas las carpetas)
2. `npm run build` (compila backend + frontend)
3. `npm start` (inicia el backend con frontend servido estáticamente)

### 5. Verificar el deploy

- La URL de tu aplicación aparecerá en el dashboard de Railway
- Accede a `https://tu-app.railway.app/dashboard`
- Verifica logs en Railway → "View Logs"

## Estructura del deploy

```
railway.json          ← Configuración de Railway
Procfile             ← Define comando de inicio
package.json         ← Scripts de build y start
├── backend/
│   ├── package.json
│   ├── src/
│   └── dist/        (generado en build)
└── frontend/
    ├── package.json
    └── dist/        (generado en build, servido estáticamente)
```

## Scripts de build

- **`npm run build`**: Compila backend (TypeScript → JavaScript) + frontend (Vite bundle)
- **`npm start`**: Inicia el servidor backend
- **`npm run start:dev`**: Desarrollo local con hot-reload (requiere concurrently)

## Troubleshooting

### Errores de conexión a BD
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que Railway pueda alcanzar tu BD (IP whitelisting)
- Si usas PostgreSQL en Railway, ambos servicios deben estar en el mismo proyecto

### Errores de build
- Revisa logs en Railway: "View Logs"
- Asegúrate de que `npm run build` funciona localmente
- Verifica que todas las variables de entorno requeridas estén configuradas

### Frontend no se muestra
- El frontend se compila a archivos estáticos en `frontend/dist/`
- El backend sirve estos archivos estáticamente desde `/`
- Verifica que el build no falle

### Migraciones de BD

Si necesitas ejecutar migraciones:
1. En Railway, abre una terminal SSH del servicio
2. Ejecuta migraciones manualmente o agrega un `postBuild` script

## Conectar dominio personalizado

En Railway:
1. Ve a Settings → Domains
2. Agrega tu dominio personalizado
3. Configura el DNS según instrucciones

## Variables de entorno opcionales

Para features específicas:
- `GROQ_API_KEY`: Ticket OCR (reconocimiento de recibos)
- `GEMINI_API_KEY`: Recomendaciones con IA
- `RESEND_API_KEY`: Envío de emails

## Rollback

Si algo sale mal:
1. En Railway, ve al historial de deployments
2. Click en "Rollback" en una versión anterior
3. El servicio se reinicia con la versión anterior

## Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de CPU/memoria
- Status del servicio
- Alertas opcionales
