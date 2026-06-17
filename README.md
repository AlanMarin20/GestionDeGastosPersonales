# Gestión de Gastos Personales

Aplicación fullstack para el registro y gestión de finanzas personales, presupuestos, metas de ahorro y monitoreo de clientes por parte de asesores financieros, con integraciones de Inteligencia Artificial para recomendaciones y OCR de tickets.

---

## 🚀 Características Principales

### 👤 Autenticación y Autorización (RBAC)
- Autenticación segura basada en **JWT** (JSON Web Tokens).
- Gestión de roles con tres niveles de acceso:
  - **`usuario`**: Acceso exclusivo a sus finanzas personales (ingresos, gastos, metas de ahorro, presupuestos, notificaciones y carga de tickets).
  - **`asesor`**: Acceso al panel de control de asesores para monitorear clientes asignados, analizar patrones de consumo mediante gráficos e interactuar enviando recomendaciones financieras.
  - **`admin`**: Acceso completo al sistema, incluyendo asignación de roles y bootstrapping inicial.
- Flujo completo de verificación de correo electrónico, recuperación de contraseña y cambio de contraseña.

### 💰 Gestión Financiera
- **Ingresos y Gastos**: Registro detallado con monto, fecha, categoría, descripción y etiquetas (Tags).
- **Categorías**: Gestión de categorías del catálogo general.
- **Presupuestos (Budgets)**: Definición de presupuestos límite por categoría para controlar los gastos.
- **Metas de Ahorro**: Creación de objetivos de ahorro con seguimiento de movimientos (depósitos/retiros) e historial de progreso.
- **Balances**: Cálculo automático e inteligente del saldo neto y distribución de recursos.
- **Movimientos Unificados**: Feed consolidado e interactivo de transacciones recientes.

### 🤖 Integración de Inteligencia Artificial (IA)
- **Ticket OCR**: Carga de imágenes de comprobantes (tickets/facturas) que son procesadas automáticamente por el modelo de visión de **Groq** (Llama) para extraer automáticamente comercio, fecha, monto, categoría y descripción.
- **Recomendaciones Automatizadas**: Generación de consejos y alertas financieras personalizadas utilizando la API de **Gemini** según los hábitos de gasto del usuario.

### 📊 Visualización y UX Premium
- **Dashboard Interactivo**: Métricas financieras clave, balances actuales y últimos movimientos en tiempo real.
- **Patrones de Consumo**: Gráficos interactivos construidos con **Chart.js** (gráficos de barras, pastel, etc.).
- **Internacionalización (i18n)**: Soporte completo multiidioma (Español / Inglés).
- **Tema Dinámico**: Soporte de modo claro y oscuro ajustable por el usuario o heredado del sistema.
- **Notificaciones**: Sistema de notificaciones en la app y por correo electrónico (mediante SMTP o Resend) con preferencias de usuario.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologías Utilizadas |
|---|---|
| **Frontend** | Vanilla JavaScript (ES modules) + Vite + Bootstrap 5 + Chart.js + i18n + Custom CSS Theme Logic |
| **Backend** | NestJS 11 + TypeORM + PostgreSQL + Class-Validator + Joi validations |
| **Base de Datos** | PostgreSQL (Supabase / local) con esquema dinámico y UUIDs para registros de usuario |
| **Testing** | Jest (Unit y E2E tests) |
| **IA APIs** | Groq API (Llama Vision) & Gemini API |

---

## 📂 Estructura del Proyecto

```text
GestionDeGastosPersonales/
├── backend/                   # Proyecto NestJS (API RESTful)
│   ├── src/
│   │   ├── auth/             # Módulo de Autenticación & JWT
│   │   ├── users/            # Módulo de Gestión de Usuarios
│   │   ├── roles/            # Módulo de Control de Roles
│   │   ├── expenses/         # Módulo de Gastos
│   │   ├── incomes/          # Módulo de Ingresos
│   │   ├── categories/       # Módulo de Categorías
│   │   ├── budgets/          # Módulo de Presupuestos
│   │   ├── savings-goals/    # Módulo de Metas de Ahorro
│   │   ├── notifications/    # Módulo de Notificaciones y Preferencias
│   │   ├── recommendations/  # Módulo de Recomendaciones (Advisor & AI)
│   │   ├── ticket-ocr/       # Módulo de OCR de comprobantes con Groq
│   │   ├── movimientos/      # Feed unificado de transacciones
│   │   └── asesor/           # Dashboard y control de asesores
│   ├── sql/                  # Migraciones y scripts SQL manuales
│   └── test/                 # Suite de testing de integración E2E
├── frontend/                  # Proyecto SPA Vanilla JS con Vite
│   ├── src/
│   │   ├── api/              # Cliente HTTP y consumo de endpoints
│   │   ├── components/       # Componentes visuales y layouts reutilizables
│   │   ├── handlers/         # Manejadores de eventos de la app
│   │   ├── i18n/             # Diccionarios de traducción (ES / EN)
│   │   ├── pages/            # Vistas/Páginas de la aplicación (27+ pantallas)
│   │   ├── ui/               # Control de temas, notificaciones y Chart.js
│   │   └── state.js          # Estado global mutable de la aplicación
│   └── index.html            # Punto de entrada HTML
├── LICENSE
└── README.md
```

---

## ⚙️ Configuración y Requisitos

### Requisitos Previos
- Node.js v20+
- npm v10+
- PostgreSQL v15+ o base de datos en Supabase

---

### 1. Servidor Backend (NestJS)

1. Dirígete a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno creando un archivo `backend/.env` (basado en `backend/.env.example` o `.env.local`):
   ```env
   DATABASE_URL=postgresql://usuario:password@localhost:5432/gastos_db
   JWT_SECRET=tu_secreto_super_seguro_minimo_16_caracteres
   PORT=3000
   DB_SYNCHRONIZE=true # true en desarrollo para sincronizar entidades
   DB_SSL=false        # true si la BD requiere conexión segura SSL (ej. Supabase en producción)
   
   # Opcionales para integración de IA y Emails
   GROQ_API_KEY=tu_groq_api_key_para_ocr
   GEMINI_API_KEY=tu_gemini_api_key_para_recomendaciones
   RESEND_API_KEY=tu_resend_api_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_correo@gmail.com
   SMTP_PASS=tu_contraseña_aplicacion
   ```
4. Levanta el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```

#### 🔑 Inicialización del Primer Administrador (RBAC Bootstrap)
Para otorgar el rol de `admin` por primera vez:
1. Crea un usuario desde la aplicación frontend o llamando a `POST /api/users`.
2. Inicia sesión para obtener tu `access_token` (`POST /api/auth/login`).
3. Envía una petición `POST` al endpoint `/api/user-roles/bootstrap-admin` con la cabecera `Authorization: Bearer <access_token>`.
4. El endpoint creará los roles por defecto (`admin`, `asesor`, `usuario`) en la base de datos y te asignará el rol de `admin`.

---

### 2. Cliente Frontend (Vite + Vanilla JS)

1. Dirígete a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Levanta el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador. El cliente se conectará automáticamente al backend en `http://localhost:3000` (configurable mediante variables de entorno si es necesario).

---

## 📂 Catálogo de Endpoints Principales (API REST)

Base URL: `http://localhost:3000/api`

| Categoría | Método | Endpoint | Descripción |
|---|---|---|---|
| **Salud** | `GET` | `/health` | Verificación de estado del servidor |
| **Auth** | `POST` | `/auth/register` | Registro de nuevo usuario |
| | `POST` | `/auth/login` | Inicio de sesión, retorna JWT token |
| | `POST` | `/auth/forgot-password` | Solicita código para recuperar contraseña |
| | `POST` | `/auth/reset-password` | Restablece la contraseña |
| **Usuarios**| `GET` | `/users/me` | Obtiene perfil del usuario logueado |
| | `PATCH` | `/users/profile` | Actualiza la información del perfil |
| **Gastos / Ingresos** | `GET/POST` | `/expenses`, `/incomes` | Listado y creación de transacciones |
| | `PATCH/DELETE`| `/expenses/:id`, `/incomes/:id` | Modificar/eliminar transacciones |
| **Movimientos** | `GET` | `/movimientos` | Feed unificado de ingresos y gastos con paginación |
| **Categorías** | `GET/POST` | `/categories` | Catálogo de categorías para gastos e ingresos |
| **Presupuestos**| `GET/POST` | `/budgets` | Gestión de límites presupuestarios por categoría |
| **Ahorros** | `GET/POST` | `/savings-goals` | Creación y listado de metas de ahorro |
| | `POST` | `/savings-goals/:id/movements`| Registro de depósitos o retiros a la meta |
| **Asesores** | `GET` | `/asesor/clients` | Lista de clientes asignados (solo para asesores) |
| | `POST` | `/asesor/recommendations` | Envío de recomendaciones personalizadas a clientes |
| **Tickets OCR**| `POST` | `/ticket-ocr/upload` | Carga de imagen para escaneo inteligente con IA |

---

## 📈 Scripts Disponibles

### Backend (`/backend`)
- `npm run start:dev` - Inicia el servidor NestJS en modo desarrollo con recarga automática.
- `npm run build` - Compila la aplicación TypeScript a JavaScript nativo en la carpeta `dist/`.
- `npm run start:prod` - Inicia la aplicación NestJS compilada para entornos de producción.
- `npm run test` - Ejecuta las pruebas unitarias basadas en Jest.
- `npm run test:e2e` - Ejecuta los tests de integración End-to-End.
- `npm run lint` / `npm run format` - Valida y da formato al código mediante ESLint y Prettier.

### Frontend (`/frontend`)
- `npm run dev` - Inicia el servidor de desarrollo rápido de Vite.
- `npm run build` - Compila los assets y empaqueta el frontend para producción.
- `npm run preview` - Previsualiza localmente el build de producción.
- `npm run lint` - Analiza la calidad del código JS con ESLint.

---

## 🏁 Estado Actual de Desarrollo

- [x] Repositorio base inicializado y estructura de directorios modular establecida.
- [x] Base de datos PostgreSQL integrada mediante TypeORM con tablas en español.
- [x] Autenticación robusta y sistema de roles RBAC completado.
- [x] Endpoints y servicios de Negocio finalizados (Gastos, Ingresos, Categorías, Metas, Presupuestos).
- [x] Dashboard de asesor financiero completamente interactivo y funcional.
- [x] Integración de IA para OCR de tickets mediante Groq y consejos automatizados por Gemini.
- [x] Frontend SPA desarrollado íntegramente con renderizado dinámico en JS vanilla, tematización y traducción nativa.
- [x] Cobertura de tests y flujos de integración del backend y frontend validados.

