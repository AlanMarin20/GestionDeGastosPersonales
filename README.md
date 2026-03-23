# Gestión de Gastos Personales

Aplicación fullstack para registrar ingresos, gastos, categorías y reportes personales.

## Stack previsto

- Frontend: React + Vite + TypeScript + Bootstrap + React Router
- Backend: NestJS + PostgreSQL (carpeta `backend/` inicializada)
- Auth: JWT

## Estructura del proyecto

```text
gestion-gastos-personales/
├── frontend/
│   └── .gitkeep
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── .gitkeep
├── .gitignore
├── LICENSE
└── README.md
```

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (o Supabase)

## Inicialización rápida

### 1) Backend NestJS

Desde la raíz del repo:

1. Entrar a `backend/`
2. Ejecutar la creación del proyecto NestJS en ese directorio
3. Elegir `npm` cuando lo solicite

> Nota: este repo ya incluye la estructura base y archivos de entorno iniciales.

### 2) Variables de entorno

Archivo: `backend/.env`

Variables incluidas:

- `DATABASE_URL` → conexión a PostgreSQL/Supabase
- `JWT_SECRET` → clave secreta para firma de tokens
- `ANTHROPIC_API_KEY` → opcional, integración IA
- `PORT` → puerto del backend (default 3000)
- `DB_SSL` → habilita SSL para PostgreSQL (`true`/`false`)

Para compartir configuración sin secretos, usar `backend/.env.example`.

### 3) Frontend con Bootstrap

Desde `frontend/`:

- `npm install`
- `npm run dev`

Bootstrap está importado de forma global en `src/main.tsx`, por lo que los estilos y componentes utilitarios quedan disponibles para toda la app.

Plantilla base UI (frontend):

- `src/components/layout/AppLayout.tsx`
- `src/components/layout/TopNavbar.tsx`
- `src/components/layout/SideMenu.tsx`
- `src/pages/*` (módulos enrutados)

Esta estructura sirve como estándar visual para los próximos módulos.

## Scripts típicos del backend (NestJS)

Una vez inicializado Nest en `backend/`:

- `npm run start:dev` → modo desarrollo
- `npm run build` → compilación
- `npm run start:prod` → ejecución productiva
- `npm run test` → tests unitarios

## Endpoints iniciales (propuestos)

Base URL: `http://localhost:3000/api`

### Salud

- `GET /health`

### Autenticación

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Categorías

- `GET /categories`
- `POST /categories`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

### Gastos

- `GET /expenses`
- `POST /expenses`
- `GET /expenses/:id`
- `PATCH /expenses/:id`
- `DELETE /expenses/:id`

### Ingresos

- `GET /incomes`
- `POST /incomes`
- `GET /incomes/:id`
- `PATCH /incomes/:id`
- `DELETE /incomes/:id`

### Reportes

- `GET /reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /reports/by-category?from=YYYY-MM-DD&to=YYYY-MM-DD`

## Estado actual

- [x] Repositorio base inicializado
- [x] Estructura `frontend/` y `backend/`
- [x] Variables de entorno base creadas
- [x] Scaffold de NestJS en `backend/`
- [x] Configuración inicial PostgreSQL (TypeORM + env)
- [ ] Definición de entidades y migraciones
- [ ] Implementación de endpoints

