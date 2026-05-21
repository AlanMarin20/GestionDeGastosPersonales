# Advisor Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a guided onboarding flow before users can become advisors, and visually differentiate the advisor dashboard from the client detail view.

**Architecture:** The backend already has `RolesGuard` and the `usuario_roles` table. This plan wires them up: a new `POST /api/auth/activate-advisor` endpoint assigns the role on T&C acceptance, `GET /api/auth/me` is extended to return roles, and the frontend gates `/dashboard/asesor` behind `state.currentUser.roles`. The advisor sidebar becomes a distinct nav (not the user nav), and a persistent orange banner marks the client detail view.

**Tech Stack:** NestJS 11 + TypeORM (backend); Vanilla JS ES modules + Vite (frontend). No new libraries.

**Spec:** `docs/superpowers/specs/2026-05-20-advisor-flow-design.md`

---

## File Map

| Action | Path |
|--------|------|
| Modify | `backend/src/auth/auth.service.ts` |
| Modify | `backend/src/auth/auth.controller.ts` |
| Modify | `frontend/src/i18n/en.js` |
| Modify | `frontend/src/i18n/es.js` |
| Modify | `frontend/src/api/user.js` |
| Modify | `frontend/src/api/asesor.js` |
| Modify | `frontend/src/handlers/navigation.js` |
| Modify | `frontend/src/handlers/forms.js` |
| Modify | `frontend/src/components/dashboard/dashboardAppLayout.js` |
| Modify | `frontend/src/pages/DetalleClientePage.js` |
| Modify | `frontend/src/main.js` |
| Create | `frontend/src/pages/AsesorOnboardingPage.js` |

---

## Task 1 — Backend: expose roles in `GET /api/auth/me`

**Files:**
- Modify: `backend/src/auth/auth.service.ts`

`getProfile()` currently returns `{ id, name, email, createdAt, updatedAt }` from `findPublicById`. We need to add `roles: string[]` so the frontend knows if the user is an advisor.

- [ ] **Step 1: Add DataSource + entity imports to auth.service.ts**

Find the existing import block at the top of `backend/src/auth/auth.service.ts` and add:

```typescript
import { DataSource } from 'typeorm';
import { UserRole } from '../user-roles/entities/user-role.entity';
```

- [ ] **Step 2: Inject DataSource in the constructor**

Replace the existing constructor:
```typescript
constructor(
  private usersService: UsersService,
  private jwtService: JwtService,
  private emailService: EmailService,
  private dataSource: DataSource,
) {}
```

- [ ] **Step 3: Modify getProfile() to include roles**

Replace the existing `getProfile` method:
```typescript
async getProfile(userId: string) {
  const user = await this.usersService.findPublicById(userId);

  if (!user) {
    throw new UnauthorizedException('Usuario no encontrado');
  }

  const userRoles = await this.dataSource.getRepository(UserRole).find({
    where: { user: { id: userId } },
    relations: { role: true },
  });

  return {
    ...user,
    roles: userRoles
      .map((ur) => ur.role?.nombre)
      .filter((name): name is string => Boolean(name)),
  };
}
```

- [ ] **Step 4: Start backend and verify manually**

```bash
cd backend && npm run start:dev
```

Call `GET /api/auth/me` with a valid token. Response must include `"roles": [...]` (empty array for regular users, `["asesor"]` for advisor users).

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/auth/auth.service.ts
git commit -m "feat(auth): include roles in GET /api/auth/me response"
```

---

## Task 2 — Backend: `POST /api/auth/activate-advisor`

**Files:**
- Modify: `backend/src/auth/auth.service.ts`
- Modify: `backend/src/auth/auth.controller.ts`

Assigns the `asesor` role to the authenticated user. Idempotent — calling it twice is safe.

- [ ] **Step 1: Add Role entity import to auth.service.ts**

Add to the existing import block:
```typescript
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
```

- [ ] **Step 2: Add activateAdvisor() to AuthService**

Add this method after `getProfile()` in `backend/src/auth/auth.service.ts`:

```typescript
async activateAdvisor(userId: string): Promise<{ roles: string[] }> {
  const asesorRole = await this.dataSource
    .getRepository(Role)
    .findOne({ where: { nombre: 'asesor' } });

  if (!asesorRole) {
    throw new BadRequestException(
      'El rol de asesor no está configurado en el sistema',
    );
  }

  const existing = await this.dataSource.getRepository(UserRole).findOne({
    where: { user: { id: userId }, role: { id: asesorRole.id } },
    relations: { user: true, role: true },
  });

  if (!existing) {
    const userRole = this.dataSource.getRepository(UserRole).create({
      user: { id: userId } as User,
      role: { id: asesorRole.id } as Role,
    });
    await this.dataSource.getRepository(UserRole).save(userRole);
  }

  return { roles: ['asesor'] };
}
```

- [ ] **Step 3: Add the endpoint to AuthController**

Add after the `getProfile` endpoint in `backend/src/auth/auth.controller.ts`:

```typescript
@UseGuards(AuthGuard)
@HttpCode(HttpStatus.OK)
@Post('activate-advisor')
async activateAdvisor(
  @Request() req,
  @Body('acceptedTerms') acceptedTerms: boolean,
) {
  if (!acceptedTerms) {
    throw new BadRequestException(
      'Debes aceptar los términos y condiciones para continuar',
    );
  }
  return this.authService.activateAdvisor(req.user.sub);
}
```

Add `BadRequestException` to the existing `@nestjs/common` import at the top of `auth.controller.ts`:
```typescript
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
```

- [ ] **Step 4: Verify manually**

With backend running, call:
```
POST /api/auth/activate-advisor
Authorization: Bearer <token>
{ "acceptedTerms": true }
```
Expected: `{ "roles": ["asesor"] }`. Call twice — second call must also return 200 (idempotent).

Call with `{ "acceptedTerms": false }` → expect 400.

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/auth/auth.service.ts src/auth/auth.controller.ts
git commit -m "feat(auth): add POST /api/auth/activate-advisor endpoint"
```

---

## Task 3 — Frontend: i18n keys

**Files:**
- Modify: `frontend/src/i18n/en.js`
- Modify: `frontend/src/i18n/es.js`

Add all strings needed for the onboarding page, advisor sidebar, and client banner.

- [ ] **Step 1: Add keys to en.js**

Find the closing `};` of `frontend/src/i18n/en.js` and insert before it:

```js
  // Advisor onboarding page
  'onboarding.pageTitle': 'Become an Advisor',
  'onboarding.pageSubtitle': 'Join the FinanzasPro advisor program',
  'onboarding.heroTitle': 'Become a Financial Advisor',
  'onboarding.heroSubtitle': 'Help others make better financial decisions with exclusive tools',
  'onboarding.benefitsTitle': 'Benefits',
  'onboarding.benefit1': 'Exclusive advisor panel with portfolio metrics',
  'onboarding.benefit2': 'Access to your clients\' financial data',
  'onboarding.benefit3': 'Send personalized recommendations',
  'onboarding.benefit4': 'Risk indicators per client',
  'onboarding.responsibilitiesTitle': 'Responsibilities',
  'onboarding.resp1': 'Maintain client data confidentiality',
  'onboarding.resp2': 'Provide ethical and responsible advice',
  'onboarding.resp3': 'Do not use client data for personal gain',
  'onboarding.resp4': 'Respect the platform terms of use',
  'onboarding.cta': 'I want to become an advisor →',
  'onboarding.ctaNote': 'You will review the terms in the next step',
  'onboarding.modalTitle': 'Advisor Terms and Conditions',
  'onboarding.tc1': 'By registering as a FinanzasPro advisor, you agree to use the platform ethically and responsibly. You will have access to sensitive financial information from your clients, which is protected by our privacy policy.',
  'onboarding.tc2': 'You may not share, sell, or use this data for purposes other than financial advising. Non-compliance may result in suspension of your advisor access and legal action if applicable.',
  'onboarding.termsLabel': 'I have read and accept the terms and conditions of the FinanzasPro advisor program',
  'onboarding.confirmBtn': 'Confirm and activate',
  'onboarding.activating': 'Activating...',
  // Advisor sidebar nav
  'nav.advisorPortfolio': 'My portfolio',
  'nav.backToMyDashboard': 'Go to my dashboard',
  // Client banner
  'cliente.viewingLabel': 'VIEWING',
  'cliente.backToPortfolio': 'Back to my portfolio',
```

- [ ] **Step 2: Add keys to es.js**

Same location in `frontend/src/i18n/es.js`:

```js
  // Advisor onboarding page
  'onboarding.pageTitle': 'Convertite en Asesor',
  'onboarding.pageSubtitle': 'Unite al programa de asesores de FinanzasPro',
  'onboarding.heroTitle': 'Convertite en Asesor Financiero',
  'onboarding.heroSubtitle': 'Ayudá a otros a tomar mejores decisiones financieras con herramientas exclusivas',
  'onboarding.benefitsTitle': 'Beneficios',
  'onboarding.benefit1': 'Panel exclusivo con metricas de tu cartera',
  'onboarding.benefit2': 'Acceso a datos financieros de tus clientes',
  'onboarding.benefit3': 'Envio de recomendaciones personalizadas',
  'onboarding.benefit4': 'Indicadores de riesgo por cliente',
  'onboarding.responsibilitiesTitle': 'Responsabilidades',
  'onboarding.resp1': 'Mantener la confidencialidad de los datos de clientes',
  'onboarding.resp2': 'Brindar asesoramiento etico y responsable',
  'onboarding.resp3': 'No usar datos de clientes para fines propios',
  'onboarding.resp4': 'Respetar los terminos de uso de la plataforma',
  'onboarding.cta': 'Quiero ser asesor →',
  'onboarding.ctaNote': 'Revisaras los terminos en el siguiente paso',
  'onboarding.modalTitle': 'Terminos y condiciones de asesor',
  'onboarding.tc1': 'Al registrarte como asesor en FinanzasPro aceptas usar la plataforma de forma etica y responsable. Tendras acceso a informacion financiera sensible de tus clientes, la cual esta protegida por nuestra politica de privacidad.',
  'onboarding.tc2': 'No podes compartir, vender ni usar estos datos para fines distintos a la asesoria financiera. El incumplimiento puede resultar en la suspension del acceso como asesor y acciones legales si corresponde.',
  'onboarding.termsLabel': 'Lei y acepto los terminos y condiciones del programa de asesores de FinanzasPro',
  'onboarding.confirmBtn': 'Confirmar y activar',
  'onboarding.activating': 'Activando...',
  // Advisor sidebar nav
  'nav.advisorPortfolio': 'Mi cartera',
  'nav.backToMyDashboard': 'Ir a mi dashboard',
  // Client banner
  'cliente.viewingLabel': 'ESTAS VIENDO A',
  'cliente.backToPortfolio': 'Volver a mi cartera',
```

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/i18n/en.js src/i18n/es.js
git commit -m "feat(i18n): add onboarding, advisor nav, and client banner keys"
```

---

## Task 4 — Frontend: helper functions

**Files:**
- Modify: `frontend/src/api/user.js`
- Modify: `frontend/src/api/asesor.js`

- [ ] **Step 1: Add isUserAsesor() to api/user.js**

Add after the `syncProfileFromUser` function (after line 16):

```js
export function isUserAsesor() {
  return (
    Array.isArray(state.currentUser?.roles) &&
    state.currentUser.roles.includes('asesor')
  );
}
```

- [ ] **Step 2: Add activateAdvisor() to api/asesor.js**

Add at the end of `frontend/src/api/asesor.js`:

```js
export async function activateAdvisor() {
  const response = await apiFetch('/api/auth/activate-advisor', {
    method: 'POST',
    body: JSON.stringify({ acceptedTerms: true }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'No se pudo activar el rol de asesor');
  }

  const data = await response.json();

  if (state.currentUser) {
    state.currentUser = { ...state.currentUser, roles: data.roles ?? ['asesor'] };
  }

  return data;
}
```

Make sure `apiFetch` is already imported in `api/asesor.js` (it is — confirm at the top of the file). Also confirm `state` is imported.

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/api/user.js src/api/asesor.js
git commit -m "feat(api): add isUserAsesor helper and activateAdvisor API call"
```

---

## Task 5 — Frontend: AsesorOnboardingPage.js

**Files:**
- Create: `frontend/src/pages/AsesorOnboardingPage.js`

The landing page explaining the advisor role. Uses the standard `renderDashboardAppLayout` shell. The T&C modal is rendered hidden inside the content; JS in Task 6 controls its visibility.

- [ ] **Step 1: Create the file**

```js
import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from "../i18n";

function buildBenefitItem(text) {
  return `
    <li class="gd-onboarding-list-item">
      <span class="gd-onboarding-check" aria-hidden="true">✓</span>
      <span>${escapeHtml(text)}</span>
    </li>`;
}

function buildRespItem(text) {
  return `
    <li class="gd-onboarding-list-item">
      <span class="gd-onboarding-warn" aria-hidden="true">!</span>
      <span>${escapeHtml(text)}</span>
    </li>`;
}

export function renderAsesorOnboardingPage({ profileImage, profileName }) {
  const content = `
    <div class="gd-onboarding">

      <div class="gd-onboarding-hero">
        <span class="gd-onboarding-hero-icon" aria-hidden="true">🏛️</span>
        <h2 class="gd-onboarding-hero-title">${escapeHtml(t('onboarding.heroTitle'))}</h2>
        <p class="gd-onboarding-hero-sub">${escapeHtml(t('onboarding.heroSubtitle'))}</p>
      </div>

      <div class="gd-onboarding-grid">
        <div class="gd-onboarding-card gd-onboarding-card--benefits">
          <h3 class="gd-onboarding-card-heading">✨ ${escapeHtml(t('onboarding.benefitsTitle'))}</h3>
          <ul class="gd-onboarding-list">
            ${[t('onboarding.benefit1'), t('onboarding.benefit2'), t('onboarding.benefit3'), t('onboarding.benefit4')]
              .map(buildBenefitItem).join('')}
          </ul>
        </div>
        <div class="gd-onboarding-card gd-onboarding-card--responsibilities">
          <h3 class="gd-onboarding-card-heading">⚖️ ${escapeHtml(t('onboarding.responsibilitiesTitle'))}</h3>
          <ul class="gd-onboarding-list">
            ${[t('onboarding.resp1'), t('onboarding.resp2'), t('onboarding.resp3'), t('onboarding.resp4')]
              .map(buildRespItem).join('')}
          </ul>
        </div>
      </div>

      <div class="gd-onboarding-cta-wrap">
        <button type="button" class="gd-btn gd-btn-primary gd-btn-lg" data-action="show-onboarding-modal">
          ${escapeHtml(t('onboarding.cta'))}
        </button>
        <p class="gd-onboarding-cta-note">${escapeHtml(t('onboarding.ctaNote'))}</p>
      </div>

      <div id="gd-onboarding-modal" class="gd-modal-backdrop" hidden aria-modal="true" role="dialog" aria-labelledby="gd-modal-title">
        <div class="gd-modal">
          <div class="gd-modal-header">
            <h2 id="gd-modal-title" class="gd-modal-title">📋 ${escapeHtml(t('onboarding.modalTitle'))}</h2>
            <button type="button" class="gd-modal-close-btn" data-action="hide-onboarding-modal" aria-label="${escapeHtml(t('common.close'))}">×</button>
          </div>
          <div class="gd-modal-body">
            <div class="gd-tc-scroll">
              <p>${escapeHtml(t('onboarding.tc1'))}</p>
              <p>${escapeHtml(t('onboarding.tc2'))}</p>
            </div>
            <label class="gd-checkbox-label">
              <input
                type="checkbox"
                id="gd-terms-checkbox"
                class="gd-checkbox"
                data-action="toggle-advisor-terms"
              >
              <span>${escapeHtml(t('onboarding.termsLabel'))}</span>
            </label>
          </div>
          <div class="gd-modal-footer">
            <button type="button" class="gd-btn gd-btn-ghost" data-action="hide-onboarding-modal">
              ${escapeHtml(t('common.cancel'))}
            </button>
            <button
              type="button"
              id="gd-confirm-advisor-btn"
              class="gd-btn gd-btn-primary"
              data-action="submit-advisor-activation"
              disabled
            >
              ✅ ${escapeHtml(t('onboarding.confirmBtn'))}
            </button>
          </div>
        </div>
      </div>

    </div>
  `;

  return renderDashboardAppLayout({
    activePath: '/perfil/asesor-onboarding',
    pageTitle: t('onboarding.pageTitle'),
    pageSubtitle: t('onboarding.pageSubtitle'),
    content,
    profileImage,
    profileName,
    isAsesor: false,
  });
}
```

- [ ] **Step 2: Verify t('common.cancel') and t('common.close') exist**

Run: `grep "'common.cancel'\|'common.close'" frontend/src/i18n/en.js`

If either key is missing, add it to both `en.js` and `es.js`:
```js
'common.cancel': 'Cancel',   // es: 'Cancelar'
'common.close': 'Close',     // es: 'Cerrar'
```

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/pages/AsesorOnboardingPage.js
git commit -m "feat: add AsesorOnboardingPage with T&C modal"
```

---

## Task 6 — Frontend: action handlers for onboarding modal

**Files:**
- Modify: `frontend/src/handlers/navigation.js`
- Modify: `frontend/src/handlers/forms.js`

Three click actions (`show-onboarding-modal`, `hide-onboarding-modal`, `submit-advisor-activation`) go in the `actionHandlers` map in `navigation.js`. The checkbox change listener goes in `attachFormHandlers` in `forms.js`.

- [ ] **Step 1: Import activateAdvisor in navigation.js**

Add `activateAdvisor` to the existing `api/asesor` import in `frontend/src/handlers/navigation.js`:

```js
import { apiDesvincularCliente, loadAsesorClientes, activateAdvisor } from "../api/asesor";
```

- [ ] **Step 2: Import t in navigation.js if not present**

Confirm `t` is already imported (it is — line 2). No change needed.

- [ ] **Step 3: Add three handlers to the actionHandlers map**

In `navigation.js`, find the `actionHandlers` object and add after the last existing entry (before the closing `};`):

```js
"show-onboarding-modal": ({ event }) => {
  event.preventDefault();
  const modal = document.getElementById("gd-onboarding-modal");
  if (modal) modal.removeAttribute("hidden");
},

"hide-onboarding-modal": ({ event }) => {
  event.preventDefault();
  const modal = document.getElementById("gd-onboarding-modal");
  if (modal) modal.setAttribute("hidden", "");
  const checkbox = document.getElementById("gd-terms-checkbox");
  const confirmBtn = document.getElementById("gd-confirm-advisor-btn");
  if (checkbox) checkbox.checked = false;
  if (confirmBtn) confirmBtn.disabled = true;
},

"submit-advisor-activation": async ({ event }) => {
  event.preventDefault();
  const btn = document.getElementById("gd-confirm-advisor-btn");
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  btn.textContent = t("onboarding.activating");
  try {
    await activateAdvisor();
    navigate("/dashboard/asesor");
  } catch (err) {
    showAppNotification(
      err instanceof Error ? err.message : t("forms.unexpectedError"),
      "error",
    );
    btn.disabled = false;
    btn.textContent = `✅ ${t("onboarding.confirmBtn")}`;
  }
},
```

Note: `navigate` is already in scope — it is passed into `attachGlobalNavigation` and closed over in the handler map.

- [ ] **Step 4: Verify t('forms.unexpectedError') exists**

Run: `grep "'forms.unexpectedError'" frontend/src/i18n/en.js`

If missing, add to both locale files:
```js
'forms.unexpectedError': 'An unexpected error occurred',  // es: 'Ocurrio un error inesperado'
```

- [ ] **Step 5: Add checkbox change listener in forms.js**

In `frontend/src/handlers/forms.js`, find `attachFormHandlers`. Add a new path block at the top of the function body (after the `clearRegistroExitosoAutoRedirect` call):

```js
if (pathname === "/perfil/asesor-onboarding") {
  const checkbox = document.getElementById("gd-terms-checkbox");
  const confirmBtn = document.getElementById("gd-confirm-advisor-btn");
  if (checkbox && confirmBtn) {
    checkbox.addEventListener("change", () => {
      confirmBtn.disabled = !checkbox.checked;
    });
  }
}
```

- [ ] **Step 6: Commit**

```bash
cd frontend
git add src/handlers/navigation.js src/handlers/forms.js
git commit -m "feat: add onboarding modal handlers and checkbox change listener"
```

---

## Task 7 — Frontend: advisor sidebar in dashboardAppLayout.js

**Files:**
- Modify: `frontend/src/components/dashboard/dashboardAppLayout.js`

When `isAsesor = true` and no custom `sidebarSections` are provided, use an advisor-specific nav instead of the user nav.

- [ ] **Step 1: Add getAdvisorNavItems() function**

In `frontend/src/components/dashboard/dashboardAppLayout.js`, add after the existing `getNavItems()` function:

```js
function getAdvisorNavItems() {
  return [
    {
      section: t('nav.section.advisor'),
      items: [
        { href: "/dashboard/asesor",          label: t('nav.advisorPortfolio'), icon: "lni lni-users"      },
        { href: "/dashboard/recomendaciones", label: t('nav.recommendations'),  icon: "lni lni-bulb"       },
        { href: "/perfil/configuracion",      label: t('nav.configuration'),    icon: "lni lni-cog"        },
      ],
    },
    {
      section: "",
      items: [
        { href: "/dashboard", label: t('nav.backToMyDashboard'), icon: "lni lni-arrow-left" },
      ],
    },
  ];
}
```

- [ ] **Step 2: Update renderNavGroups to accept navItems param**

Replace the existing `renderNavGroups` function:

```js
function renderNavGroups({ activePath, navItems }) {
  return navItems
    .map(
      (group) => `
        <div class="gd-nav-section">
          <div class="gd-nav-label">${escapeHtml(group.section)}</div>
          ${group.items
            .map((item) => {
              const isActive = activePath === item.href ||
                (item.href !== "/dashboard" && activePath.startsWith(item.href + "/"));
              return `
                <a href="${escapeHtml(item.href)}" data-link class="gd-nav-item ${isActive ? "active" : ""}">
                  <i class="${escapeHtml(item.icon)} gd-nav-icon" aria-hidden="true"></i>
                  <span>${escapeHtml(item.label)}</span>
                </a>
              `;
            })
            .join("")}
        </div>
      `,
    )
    .join("");
}
```

- [ ] **Step 3: Update resolveNavMarkup**

Replace the existing `resolveNavMarkup` function:

```js
function resolveNavMarkup({ activePath, isAsesor, sidebarSections }) {
  const hasCustomSections = Array.isArray(sidebarSections) && sidebarSections.length > 0;
  if (hasCustomSections) {
    return renderCustomNavGroups({ activePath, sidebarSections });
  }
  if (isAsesor) {
    return renderNavGroups({ activePath, navItems: getAdvisorNavItems() });
  }
  return renderNavGroups({ activePath, navItems: getNavItems() });
}
```

- [ ] **Step 4: Build and check for errors**

```bash
cd frontend && npm run build
```

Expected: 0 errors. If `renderNavGroups` was called elsewhere without `navItems`, fix those call sites by passing `navItems: getNavItems()`.

- [ ] **Step 5: Commit**

```bash
cd frontend
git add src/components/dashboard/dashboardAppLayout.js
git commit -m "feat(layout): add advisor-specific sidebar nav"
```

---

## Task 8 — Frontend: orange client banner in DetalleClientePage.js

**Files:**
- Modify: `frontend/src/pages/DetalleClientePage.js`

Remove the custom `sidebarSections` (so the advisor sidebar from Task 7 is used). Add the orange banner as the first element inside `content` in both render functions.

- [ ] **Step 1: Add a clientBanner helper function**

Add this function near the top of `frontend/src/pages/DetalleClientePage.js`, after the imports:

```js
function clientBanner(clienteName) {
  const initials = String(clienteName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "CL";

  return `
    <div class="gd-client-banner" role="status" aria-label="${escapeHtml(t('cliente.viewingLabel'))} ${escapeHtml(clienteName)}">
      <div class="gd-client-banner-avatar" aria-hidden="true">${escapeHtml(initials)}</div>
      <div class="gd-client-banner-info">
        <span class="gd-client-banner-label">${escapeHtml(t('cliente.viewingLabel'))}</span>
        <span class="gd-client-banner-name">${escapeHtml(clienteName)}</span>
      </div>
      <a href="/dashboard/asesor" data-link class="gd-btn gd-btn-sm gd-client-banner-back">
        ← ${escapeHtml(t('cliente.backToPortfolio'))}
      </a>
    </div>
  `;
}
```

- [ ] **Step 2: Remove sidebarSections from renderDetalleClienteGastosPage**

In `renderDetalleClienteGastosPage`, find the `renderDashboardAppLayout` call (around line 130). Make two changes:
1. Delete the `sidebarSections: buildDetalleClienteSidebarSections(...)` line.
2. Inside the `content` template literal, add `${clientBanner(cliente.nombre)}` immediately before the first `<section` tag.

The call site should end up looking like:
```js
return renderDashboardAppLayout({
  activePath: gastosHref,
  pageTitle: t('cliente.movementsOf', { name: cliente.nombre }),
  pageSubtitle: t('cliente.movementsSubtitle'),
  content: `
    ${clientBanner(cliente.nombre)}
    <section class="gd-metrics gd-metrics-2 mb-4">
      /* existing content — do not change */
  `,
  profileImage,
  profileName,
  isAsesor: true,
});
```

- [ ] **Step 3: Remove sidebarSections from renderDetalleClientePage (the main export)**

In the `return renderDashboardAppLayout({...})` call inside `renderDetalleClientePage` (around line 220). Same two changes:
1. Delete the `sidebarSections: buildDetalleClienteSidebarSections(...)` line.
2. Add `${clientBanner(cliente.nombre)}` immediately before the first `<section` tag inside the `content` template literal.

The call site should end up looking like:
```js
return renderDashboardAppLayout({
  activePath: detalleHref,
  pageTitle: t('cliente.pageTitle', { name: cliente.nombre }),
  pageSubtitle: t('cliente.pageSubtitle'),
  content: `
    ${clientBanner(cliente.nombre)}
    <section class="gd-metrics">
      /* existing content — do not change */
  `,
  profileImage,
  profileName,
  isAsesor: true,
});
```

- [ ] **Step 4: Delete the buildDetalleClienteSidebarSections function**

Remove the entire `buildDetalleClienteSidebarSections` function (lines ~74–121 in the original file) since it is no longer referenced.

- [ ] **Step 5: Build and check for errors**

```bash
cd frontend && npm run build
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
cd frontend
git add src/pages/DetalleClientePage.js
git commit -m "feat(cliente): replace custom sidebar with advisor sidebar + add orange client banner"
```

---

## Task 9 — Frontend: routing in main.js

**Files:**
- Modify: `frontend/src/main.js`

Add the onboarding route, import the new page, and guard `/dashboard/asesor` so non-advisors land on onboarding instead.

- [ ] **Step 1: Add imports**

At the top of `frontend/src/main.js`, add:

```js
import { renderAsesorOnboardingPage } from "./pages/AsesorOnboardingPage";
import { isUserAsesor } from "./api/user";
```

`isUserAsesor` is already exported from `api/user.js` after Task 4.

- [ ] **Step 2: Add renderAsesorOnboardingPage wrapper function**

Add near the other render functions (after `renderDashboardAsesorPage`):

```js
function renderAsesorOnboardingPageView() {
  return renderAsesorOnboardingPage({
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
  });
}
```

- [ ] **Step 3: Add the /perfil/asesor-onboarding route**

In `buildRouteView`, find the block that handles `/perfil/configuracion` (or nearby profile routes) and add before it:

```js
if (pathname === "/perfil/asesor-onboarding") {
  if (isUserAsesor()) {
    history.replaceState({}, "", "/dashboard/asesor");
    return renderDashboardLayout(renderDashboardAsesorPage(), { showScrollTop: false });
  }
  return renderAsesorOnboardingPageView();
}
```

- [ ] **Step 4: Guard the /dashboard/asesor routes**

Find the block that starts with `if (pathname === "/dashboard/asesor")` and prepend the guard:

```js
if (pathname === "/dashboard/asesor") {
  if (!isUserAsesor()) {
    history.replaceState({}, "", "/perfil/asesor-onboarding");
    return renderAsesorOnboardingPageView();
  }
  return renderDashboardLayout(renderDashboardAsesorPage(), {
    showScrollTop: false,
  });
}
```

Do the same for the two other `/dashboard/asesor/*` route blocks (`/dashboard/asesor/recomendaciones` and `/dashboard/asesor/panel`):

```js
if (pathname === "/dashboard/asesor/recomendaciones") {
  if (!isUserAsesor()) {
    history.replaceState({}, "", "/perfil/asesor-onboarding");
    return renderAsesorOnboardingPageView();
  }
  return renderDashboardLayout(renderDashboardAsesorPage(), { showScrollTop: false });
}

if (pathname === "/dashboard/asesor/panel") {
  if (!isUserAsesor()) {
    history.replaceState({}, "", "/perfil/asesor-onboarding");
    return renderAsesorOnboardingPageView();
  }
  return renderDashboardLayout(renderDashboardAsesorPage(), { showScrollTop: false });
}
```

- [ ] **Step 5: Build and check for errors**

```bash
cd frontend && npm run build
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
cd frontend
git add src/main.js
git commit -m "feat(routing): gate advisor routes behind isUserAsesor + add onboarding route"
```

---

## Task 10 — CSS: styles for new elements

**Files:**
- The project uses a custom CSS file in `frontend/`. Find it with:

```bash
find frontend/src -name "*.css" | head -10
```

Add styles for the new elements. If the project uses a single `main.css` or `app.css`, add at the end.

- [ ] **Step 1: Add onboarding page styles**

```css
/* Advisor onboarding */
.gd-onboarding {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.gd-onboarding-hero {
  background: linear-gradient(135deg, var(--gd-surface-2, #1e1b4b) 0%, transparent 100%);
  border: 1px solid var(--gd-border, #2d2a5e);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.gd-onboarding-hero-icon { font-size: 40px; display: block; margin-bottom: 12px; }
.gd-onboarding-hero-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; }
.gd-onboarding-hero-sub { color: var(--gd-muted, #6b7280); margin: 0; }

.gd-onboarding-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 640px) {
  .gd-onboarding-grid { grid-template-columns: 1fr; }
}

.gd-onboarding-card {
  background: var(--gd-surface, #111);
  border-radius: 10px;
  padding: 16px;
}

.gd-onboarding-card--benefits { border: 1px solid #2d2a5e; }
.gd-onboarding-card--responsibilities { border: 1px solid #2d1d0a; }
.gd-onboarding-card-heading { font-size: 0.875rem; font-weight: 700; margin-bottom: 12px; }
.gd-onboarding-card--benefits .gd-onboarding-card-heading { color: #a5b4fc; }
.gd-onboarding-card--responsibilities .gd-onboarding-card-heading { color: #fb923c; }

.gd-onboarding-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.gd-onboarding-list-item { display: flex; gap: 8px; align-items: flex-start; font-size: 0.875rem; color: var(--gd-text-muted, #9ca3af); }
.gd-onboarding-check { color: #22c55e; font-weight: 700; flex-shrink: 0; }
.gd-onboarding-warn { color: #fb923c; font-weight: 700; flex-shrink: 0; }

.gd-onboarding-cta-wrap { text-align: center; }
.gd-onboarding-cta-note { color: var(--gd-muted, #6b7280); font-size: 0.8rem; margin-top: 8px; }

/* Onboarding modal */
.gd-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.gd-modal-backdrop[hidden] { display: none; }

.gd-modal {
  background: var(--gd-surface, #1a1a1a);
  border: 1px solid #2d2a5e;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.gd-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.gd-modal-title { font-size: 1rem; font-weight: 700; margin: 0; }
.gd-modal-close-btn { background: none; border: none; color: var(--gd-muted); font-size: 1.4rem; cursor: pointer; padding: 0 4px; line-height: 1; }

.gd-tc-scroll {
  background: var(--gd-surface-2, #111);
  border: 1px solid var(--gd-border, #222);
  border-radius: 8px;
  padding: 12px;
  max-height: 160px;
  overflow-y: auto;
  font-size: 0.8125rem;
  color: var(--gd-text-muted, #9ca3af);
  line-height: 1.6;
  margin-bottom: 16px;
}

.gd-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 10px;
  background: var(--gd-surface-2, #111);
  border-radius: 8px;
  margin-bottom: 16px;
}

.gd-checkbox { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; cursor: pointer; accent-color: #4f46e5; }

.gd-modal-footer { display: flex; justify-content: flex-end; gap: 10px; }

/* Client banner */
.gd-client-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(90deg, #7c2d12, #431407);
  border-bottom: 2px solid #ea580c;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 20px;
}

.gd-client-banner-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: #fff;
  flex-shrink: 0;
}

.gd-client-banner-info { flex: 1; }
.gd-client-banner-label { display: block; color: #fdba74; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; }
.gd-client-banner-name { font-size: 1rem; font-weight: 700; color: #fff; }

.gd-client-banner-back {
  background: #ea580c;
  color: #fff;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.gd-client-banner-back:hover { background: #c2410c; color: #fff; }
```

- [ ] **Step 2: Commit**

```bash
cd frontend
git add src/  # or the specific CSS file path
git commit -m "feat(css): styles for advisor onboarding, modal, and client banner"
```

---

## Verification

**End-to-end test sequence:**

1. **Non-advisor access guard:**
   - Log in as a regular user (no `asesor` role in DB).
   - Navigate to `/dashboard/asesor` → must redirect to `/perfil/asesor-onboarding`.
   - Onboarding page renders with hero, benefits, responsibilities, CTA.

2. **Onboarding modal:**
   - Click "Quiero ser asesor" → modal appears.
   - "Confirmar y activar" button is disabled.
   - Check the checkbox → button enables.
   - Click "Cancelar" → modal closes, checkbox resets.

3. **Advisor activation:**
   - Open modal again, accept T&C, click confirm.
   - Spinner shows "Activando...".
   - Success → redirects to `/dashboard/asesor`.
   - Advisor sidebar visible (Mi cartera / Recomendaciones / Config. / Ir a mi dashboard).
   - User chip shows "ASESOR" badge.

4. **Re-entry guard:**
   - With advisor role, navigate to `/perfil/asesor-onboarding` → redirects to `/dashboard/asesor`.

5. **Client detail view:**
   - From advisor dashboard, click a client.
   - Advisor sidebar remains visible (same nav).
   - Orange banner at top shows "ESTAS VIENDO A [client name]" + "Volver a mi cartera" button.
   - Click "Volver a mi cartera" → navigates back to `/dashboard/asesor`.

6. **Back to user dashboard:**
   - From advisor panel, click "Ir a mi dashboard" in sidebar.
   - User nav restores (Dashboard / Cargar gasto / etc.).
   - User chip shows "usuario" badge.

7. **Language switch:**
   - Switch language to English in settings.
   - Onboarding page, advisor sidebar, and client banner all show English strings.
