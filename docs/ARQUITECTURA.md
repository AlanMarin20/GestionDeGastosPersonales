# Arquitectura del Backend — Gestión de Gastos Personales

## 1. Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | NestJS | 11.0.1 |
| Lenguaje | TypeScript | 5.7.3 |
| Base de datos | PostgreSQL | — |
| ORM | TypeORM | 0.3.28 |
| Autenticación | JWT (@nestjs/jwt) | 11.0.2 |
| Hashing | Bcrypt | 6.0.0 |
| Validación | class-validator / class-transformer | 0.15.1 / 0.5.1 |
| Config / env | @nestjs/config + Joi | 4.0.3 / 18.1.1 |
| Testing | Jest + Supertest | 30.0.0 / 7.0.0 |

---

## 2. Estructura de Directorios

```
backend/
├── src/
│   ├── main.ts                        # Punto de entrada, bootstrap NestJS
│   ├── app.module.ts                  # Módulo raíz
│   ├── app.controller.ts              # Health check
│   ├── auth/                          # Autenticación (JWT, guard, roles)
│   ├── users/                         # Gestión de usuarios
│   ├── roles/                         # Definición de roles
│   ├── user-roles/                    # Asignación usuario ↔ rol (RBAC)
│   ├── expenses/                      # Registro de gastos
│   ├── incomes/                       # Registro de ingresos
│   ├── categories/                    # Categorías de gastos/ingresos
│   ├── budgets/                       # Presupuestos mensuales
│   ├── savings-goals/                 # Metas de ahorro
│   ├── savings-movements/             # Movimientos dentro de metas
│   ├── balances/                      # Resúmenes de balance
│   ├── notifications/                 # Notificaciones al usuario
│   └── recommendations/              # Recomendaciones financieras
├── test/                              # Tests E2E
├── .env                               # Variables de entorno (dev)
├── .env.local                         # Variables de entorno (local/prod, git-ignored)
└── nest-cli.json
```

Cada módulo de dominio sigue la misma estructura interna:

```
<modulo>/
├── <modulo>.module.ts
├── <modulo>.controller.ts
├── <modulo>.service.ts
├── entities/<modulo>.entity.ts
└── dto/
    ├── create-<modulo>.dto.ts
    └── update-<modulo>.dto.ts
```

---

## 3. Módulos y Responsabilidades

| Módulo | Descripción |
|--------|-------------|
| `auth` | Login JWT, guard de autenticación, perfil del usuario autenticado |
| `users` | CRUD de usuarios, registro, hashing de contraseña |
| `roles` | CRUD de roles del sistema (`admin`, `asesor`, `usuario`) |
| `user-roles` | Asignación de roles a usuarios, bootstrap de admin inicial |
| `expenses` | Gastos del usuario con categoría, monto, fecha, comercio |
| `incomes` | Ingresos del usuario con categoría, fuente y fecha |
| `categories` | Categorías para clasificar gastos e ingresos |
| `budgets` | Presupuesto límite mensual por categoría |
| `savings-goals` | Metas de ahorro con monto objetivo y fecha límite |
| `savings-movements` | Depósitos/retiros dentro de una meta de ahorro |
| `balances` | Resumen de ingresos, egresos y ahorro por período |
| `notifications` | Notificaciones del sistema al usuario |
| `recommendations` | Recomendaciones financieras de asesores a usuarios |

---

## 4. Base de Datos (PostgreSQL + TypeORM)

### Configuración

```
DATABASE_URL=postgresql://user:pass@host:port/db
DB_SSL=false          # true en producción
DB_SYNCHRONIZE=false  # true solo en desarrollo
```

TypeORM carga las entidades automáticamente y sincroniza el esquema si `DB_SYNCHRONIZE=true`.

### Tablas y Entidades

| Entidad | Tabla | Clave primaria |
|---------|-------|----------------|
| `User` | `usuarios` | UUID |
| `Role` | `roles` | Integer (auto) |
| `UserRole` | `usuario_roles` | UUID |
| `Category` | `categorias` | Integer |
| `Expense` | `gastos` | UUID |
| `Income` | `ingresos` | UUID |
| `Budget` | `presupuestos` | UUID |
| `SavingsGoal` | `metas_ahorro` | UUID |
| `SavingsMovement` | `movimientos_ahorro` | UUID |
| `Balance` | `balances` | UUID |
| `Notification` | `notificaciones` | UUID |
| `Recommendation` | `recomendaciones` | UUID |

### Relaciones Principales

```
User ──< Expense (usuario tiene muchos gastos)
User ──< Income  (usuario tiene muchos ingresos)
User ──< Budget  (usuario tiene presupuestos por categoría)
User ──< SavingsGoal ──< SavingsMovement
User ──< Balance
User ──< Notification
User ──< Recommendation (destinatario)
User ──< Recommendation (asesor, nullable)
User ──> User  (auto-referencia: asesor asignado, nullable)
Category ──< Expense
Category ──< Income
Category ──< Budget
```

Todos los campos monetarios usan `numeric(12,2)` para precisión decimal.

---

## 5. Autenticación y Autorización

### Flujo JWT

```
POST /api/auth/login
  → Valida email + contraseña (bcrypt.compare)
  → Genera JWT { sub: userId, email } — expira en 1 día
  → Devuelve token + datos públicos del usuario

Requests protegidos:
  Authorization: Bearer <token>
  → AuthGuard extrae y verifica el token
  → Adjunta payload a request.user
```

### Roles (RBAC)

| Rol | Acceso |
|-----|--------|
| `usuario` | Recursos propios |
| `asesor` | Lectura de usuarios y roles, creación de recomendaciones |
| `admin` | Acceso total, gestión de roles y usuarios |

Patrón de uso en controladores:

```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'asesor')
@Get()
findAll() { ... }
```

La verificación de propiedad (user isolation) se aplica en el servicio usando `req.user.sub` como `userId`.

---

## 6. Rutas de la API

Todas las rutas tienen el prefijo global `/api`.

### Autenticación
```
POST   /api/auth/login          Login con email y contraseña
GET    /api/auth/me             Perfil del usuario autenticado
```

### Usuarios
```
POST   /api/users               Registro de nuevo usuario
GET    /api/users               Listar usuarios (admin/asesor)
GET    /api/users/:id           Ver usuario (dueño o admin)
PATCH  /api/users/:id           Actualizar usuario
DELETE /api/users/:id           Eliminar usuario
```

### Roles
```
POST   /api/roles               Crear rol (admin)
GET    /api/roles               Listar roles (admin/asesor)
GET    /api/roles/:id           Ver rol
PATCH  /api/roles/:id           Actualizar rol (admin)
DELETE /api/roles/:id           Eliminar rol (admin)
```

### Asignación de Roles
```
POST   /api/user-roles          Asignar rol a usuario (admin)
GET    /api/user-roles          Listar asignaciones (admin/asesor)
GET    /api/user-roles/me       Roles del usuario autenticado
GET    /api/user-roles/:id      Ver asignación
PATCH  /api/user-roles/:id      Actualizar (admin)
DELETE /api/user-roles/:id      Revocar (admin)
```

### Gastos, Ingresos, Categorías, Presupuestos
```
POST/GET/PATCH/DELETE  /api/expenses/:id?
POST/GET/PATCH/DELETE  /api/incomes/:id?
POST/GET/PATCH/DELETE  /api/categories/:id?
POST/GET/PATCH/DELETE  /api/budgets/:id?
```

### Ahorro
```
POST/GET/PATCH/DELETE  /api/savings-goals/:id?
POST/GET/PATCH/DELETE  /api/savings-movements/:id?
```

### Balances y Notificaciones
```
POST/GET/PATCH/DELETE  /api/balances/:id?
GET                    /api/balances/current      Balance más reciente
POST/GET/PATCH/DELETE  /api/notifications/:id?
PATCH                  /api/notifications/:id/read
```

### Recomendaciones
```
POST/GET/PATCH/DELETE  /api/recommendations/:id?
PATCH                  /api/recommendations/:id/read
```

---

## 7. Validación Global

Se aplica un `ValidationPipe` global con las siguientes opciones:

```typescript
new ValidationPipe({
  whitelist: true,              // Elimina propiedades no declaradas en el DTO
  transform: true,              // Auto-transforma tipos
  forbidNonWhitelisted: true    // Rechaza propiedades desconocidas
})
```

Las variables de entorno son validadas con Joi al arrancar la app. Si faltan valores requeridos, la aplicación no inicia.

---

## 8. Variables de Entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | URI de conexión PostgreSQL |
| `JWT_SECRET` | Sí | Clave secreta JWT (mínimo 16 chars) |
| `PORT` | No | Puerto del servidor (default: 3000) |
| `DB_SSL` | No | Habilitar SSL en PostgreSQL (default: false) |
| `DB_SYNCHRONIZE` | No | Sincronizar esquema automáticamente (default: false) |
| `ANTHROPIC_API_KEY` | No | Para integración con IA (opcional) |
| `FRONTEND_URL` | No | URL del frontend para OAuth (opcional) |

---

## 9. Scripts NPM

```bash
npm run start:dev    # Desarrollo con hot-reload
npm run start:prod   # Producción (ejecuta dist/main.js)
npm run build        # Compilar TypeScript → dist/
npm run test         # Tests unitarios (Jest)
npm run test:e2e     # Tests end-to-end
npm run test:cov     # Cobertura de tests
npm run lint         # ESLint con auto-fix
npm run format       # Prettier
```

---

## 10. Funcionalidades Pendientes / Comentadas

- **OAuth con Google y Apple**: infraestructura lista en `auth.service.ts`, comentada. Requiere configurar las variables de entorno del proveedor y descomentar los endpoints en `auth.controller.ts`.
- **Bootstrap de admin**: el método `UserRolesService.bootstrapAdmin()` existe pero no tiene endpoint expuesto en el controlador.
- **Integración con IA**: `ANTHROPIC_API_KEY` está definida en el schema de Joi pero no se usa actualmente en ningún servicio.
