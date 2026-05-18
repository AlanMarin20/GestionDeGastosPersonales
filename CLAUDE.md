# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack personal finance app. Users register expenses/incomes, set budgets, manage savings goals, and receive AI-generated recommendations. Advisors (`asesor` role) can monitor their assigned clients.

- **Backend:** NestJS 11 + TypeORM + PostgreSQL — in `backend/`
- **Frontend:** Vanilla JS (ES modules) + Vite + Bootstrap 5 + Chart.js — in `frontend/`

## Agents

Three specialized subagents are defined in `.claude/agents/`. Use them via `/agents` or by naming them when delegating a task.

| Agent | File | Responsibility |
|---|---|---|
| **Frontend Design** | `frontend-design.md` | UI/UX, CSS, dark/light mode, Bootstrap, Chart.js, responsividad |
| **User Dashboard API** | `user-dashboard-api.md` | `expenses`, `incomes`, `categories`, `budgets`, `savings-*`, `balances`, `notifications`, `recommendations` (received), `ticket-ocr` |
| **Advisor Dashboard API** | `advisor-dashboard-api.md` | `asesor`, `recommendations` (sent by advisor), `roles`, `user-roles`, RBAC |

Every change must be tested in both the **user dashboard** (`/dashboard` and sub-routes) and the **advisor dashboard + client detail view** (`/dashboard/asesor` and `/cliente/:id`), since they load data through separate API calls and render through different page functions.

## Commands

### Backend (`cd backend`)

```bash
npm run start:dev       # dev with hot-reload (port 3000)
npm run build           # compile TypeScript → dist/
npm run start:prod      # run dist/main.js
npm run test            # unit tests (Jest)
npm run test:watch      # watch mode
npm run test:cov        # coverage
npm run test:e2e        # E2E tests
npm run lint            # ESLint with auto-fix
npm run format          # Prettier
```

Run a single test file:
```bash
npx jest src/asesor/asesor.service.spec.ts
```

### Frontend (`cd frontend`)

```bash
npm run dev             # dev server (Vite, usually port 5173)
npm run build           # production build → dist/
npm run lint            # ESLint
```

## Environment Variables (backend/.env)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL URI |
| `JWT_SECRET` | Yes | Min 16 chars |
| `DB_SYNCHRONIZE` | No | `true` in dev to auto-sync schema |
| `DB_SSL` | No | `true` in production |
| `GROQ_API_KEY` | No | Enables ticket OCR (Llama 4 vision) |
| `GEMINI_API_KEY` | No | Alternative AI integration |
| `ANTHROPIC_API_KEY` | No | Defined in Joi schema, not currently used |
| `FRONTEND_URL` | No | For CORS/OAuth |

`.env.local` takes priority over `.env`. The app fails to start if `DATABASE_URL` or `JWT_SECRET` are missing or invalid — Joi validates on boot.

Frontend uses `VITE_API_URL` (defaults to `http://localhost:3000`).

## Backend Architecture

### Module Pattern

Every domain module follows the same structure:
```
src/<module>/
├── <module>.module.ts
├── <module>.controller.ts
├── <module>.service.ts
├── entities/<module>.entity.ts
└── dto/
    ├── create-<module>.dto.ts
    └── update-<module>.dto.ts
```

All API routes are prefixed with `/api`. A global `ValidationPipe` with `whitelist: true`, `transform: true`, and `forbidNonWhitelisted: true` is applied.

### Auth & RBAC

- JWT is issued at `POST /api/auth/login` with 1-day expiry. The token payload is `{ sub: userId, email }`.
- Protected endpoints use `@UseGuards(AuthGuard, RolesGuard)` + `@Roles('admin', 'asesor')`.
- User isolation: services filter data by `req.user.sub` (userId), not from request body.
- Three roles: `usuario` (own data only), `asesor` (read clients, write recommendations), `admin` (full access).

### Database

- TypeORM with `autoLoadEntities: true`. All monetary fields use `numeric(12,2)`.
- Primary keys: UUID for user-owned entities, Integer for `roles` and `categorias`.
- Spanish table names: `usuarios`, `gastos`, `ingresos`, `categorias`, `presupuestos`, `metas_ahorro`, `movimientos_ahorro`, `balances`, `notificaciones`, `recomendaciones`, `roles`, `usuario_roles`.
- Manual SQL migrations are in `backend/sql/` for specific schema changes.

### Special Modules

- **`asesor`**: Provides advisor-specific views — aggregated client data, spending summaries, ability to push recommendations to clients.
- **`ticket-ocr`**: Accepts image upload (JPG/PNG/WebP), sends to Groq (Llama 4 Scout vision model) to extract `{ comercio, fecha, monto, categoria, descripcion }` as JSON.
- **`movimientos`**: Combined view of expenses + incomes as a unified transaction feed.

## Frontend Architecture

### Routing (SPA, no framework)

The frontend is a hand-rolled SPA. `src/main.js` is the single entry point and owns everything:
- `buildRouteView(pathname)` maps URL paths to page render functions.
- `navigate(path)` updates `history.pushState` then calls `render()`.
- `render()` checks auth, applies theme, writes HTML into `#root` via `innerHTML`, then calls `attachFormHandlers()` and `initCharts()`.

### State

A single mutable `state` object in `src/state.js` is imported directly by `main.js`. There is no reactive framework — pages read from state, mutations happen in event handlers (in `src/handlers/`), and then `render()` is called to re-render.

### Pages & Components

- Each page in `src/pages/` exports a `render<PageName>Page(props)` function returning an HTML string.
- Reusable HTML fragments (navbar, headers, cards) are in `src/components/common/reusablePageComponents.js`.
- Page functions receive their dependencies (component builders, state slices) via props — they do not import state directly.

### API Layer

- `src/api/client.js` — base `apiFetch()` that attaches `Authorization: Bearer <token>` from `localStorage`.
- Each domain has its own file (`api/user.js`, `api/ahorros.js`, etc.) that fetches data and writes results directly into `state`.
- `VITE_API_URL` sets the base URL; defaults to `http://localhost:3000`.

### UI Utilities

- `src/ui/theme.js` — dark/light/system theme logic; some routes force dark mode (`isFixedDarkRoute`).
- `src/ui/charts.js` — Chart.js bar/pie wrappers called by `initCharts(pathname)` after render.
- `src/ui/notifications.js` — `showAppNotification()` and `showAppConfirm()` for toast/dialog UI.
- `src/utils/sanitize.js` — `escapeHtml()` must be used when interpolating user data into HTML strings.
