import { state } from "../state";
import {
  API_BASE_URL,
  ACCESS_TOKEN_KEY,
  PASSWORD_POLICY_MESSAGE,
  REGISTRO_EXITOSO_REDIRECT_SECONDS,
} from "../config";
import { getCurrentDateShort, getMonthKeyFromDate } from "../utils/date";
import {
  isStrongPassword,
  normalizeThemeMode,
  normalizeFontSizeMode,
  normalizeDensityMode,
  normalizeCurrency,
} from "../utils/format";
import { showAppNotification } from "../ui/notifications";
import { saveAppPreferences } from "../ui/theme";
import { addExpenseRecord } from "../data/expenses";
import { apiCreateMovimiento } from "../api/movimientos";
import { loadDashboardBalances, loadMovimientos } from "../api/user";
import { createAhorro, loadAhorros } from "../api/ahorros";
import {
  apiVincularCliente,
  apiAddClienteRecomendacion,
  loadAsesorClientes,
  loadClienteRecomendaciones,
} from "../api/asesor";
import {
  generateAdvisorVerificationCode,
  closeAdvisorNewClientModal,
  updateAdvisorNewClientField,
} from "../data/advisor";
import { applyHistoricalRecommendationFilters } from "../data/csv";
import { apiFetch } from "../api/client";
import { syncProfileFromUser } from "../api/user";

let registroExitosoRedirectTimeoutId = null;
let registroExitosoCountdownIntervalId = null;

export function clearRegistroExitosoAutoRedirect() {
  if (registroExitosoRedirectTimeoutId !== null) {
    window.clearTimeout(registroExitosoRedirectTimeoutId);
    registroExitosoRedirectTimeoutId = null;
  }

  if (registroExitosoCountdownIntervalId !== null) {
    window.clearInterval(registroExitosoCountdownIntervalId);
    registroExitosoCountdownIntervalId = null;
  }
}

export function attachFormHandlers(pathname, { navigate, render }) {
  if (pathname !== "/registro/exitoso") {
    clearRegistroExitosoAutoRedirect();
  }

  if (pathname === "/login") {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("contrasena");
    const errorDiv = document.getElementById("loginError");

    const removeFieldErrorState = () => {
      [emailInput, passwordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (
      message,
      fieldsToHighlight = [],
      variant = "default",
    ) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    [emailInput, passwordInput].forEach((field) => {
      field?.addEventListener("input", () => {
        field.classList.remove("auth-input-error");
      });
    });

    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput?.value?.trim() ?? "";
      const password = passwordInput?.value ?? "";
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      clearAuthError();

      if (!email || !password) {
        setAuthError("Completa correo y contraseña", [emailInput, passwordInput]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(
          "El correo debe incluir '@' para ser válido",
          [emailInput],
          "email-format",
        );
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "Correo o contraseña incorrectos");
        }

        const data = await response.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        syncProfileFromUser(data.user);
        navigate("/dashboard");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo iniciar sesión";
        setAuthError(message, [emailInput, passwordInput]);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname === "/recuperar-contrasena") {
    const recoveryForm = document.getElementById("recuperarContrasenaForm");
    const emailInput = document.getElementById("email");
    const errorDiv = document.getElementById("recuperarContrasenaError");

    state.authRecovery.codeVerified = false;

    if (emailInput && state.authRecovery.email) {
      emailInput.value = state.authRecovery.email;
    }

    const removeFieldErrorState = () => {
      [emailInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (
      message,
      fieldsToHighlight = [],
      variant = "default",
    ) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    emailInput?.addEventListener("input", () => {
      emailInput.classList.remove("auth-input-error");
    });

    recoveryForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = emailInput?.value?.trim() ?? "";

      clearAuthError();

      if (!email) {
        setAuthError("Completa el correo para continuar", [emailInput]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(
          "El correo debe incluir '@' para ser valido",
          [emailInput],
          "email-format",
        );
        return;
      }

      state.authRecovery.email = email;
      state.authRecovery.codeVerified = false;
      showAppNotification(
        "Si el correo pertenece a una cuenta, enviaremos un codigo de verificacion.",
        "info",
      );
      navigate("/recuperar-contrasena/verificar");
    });
  }

  if (pathname === "/recuperar-contrasena/verificar") {
    const verifyForm = document.getElementById("verificarCodigoForm");
    const codeInput = document.getElementById("codigoRecuperacion");
    const errorDiv = document.getElementById("verificarCodigoError");

    const removeFieldErrorState = () => {
      [codeInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = []) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
      }
      removeFieldErrorState();
    };

    codeInput?.addEventListener("input", () => {
      const sanitized = (codeInput.value || "").replace(/\D/g, "").slice(0, 6);
      if (sanitized !== codeInput.value) {
        codeInput.value = sanitized;
      }
      codeInput.classList.remove("auth-input-error");
    });

    verifyForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const code = (codeInput?.value || "").trim();
      const normalizedCode = code.replace(/\s+/g, "");

      clearAuthError();

      if (!normalizedCode) {
        setAuthError("Ingresa el codigo de verificacion", [codeInput]);
        return;
      }

      if (!/^\d{6}$/.test(normalizedCode)) {
        setAuthError("El codigo debe tener 6 digitos", [codeInput]);
        return;
      }

      state.authRecovery.codeVerified = true;
      navigate("/recuperar-contrasena/nueva");
    });
  }

  if (pathname === "/recuperar-contrasena/nueva") {
    if (!state.authRecovery.codeVerified) {
      showAppNotification("Primero verifica tu codigo para continuar", "warning");
      navigate("/recuperar-contrasena/verificar", true);
      return;
    }

    const updateForm = document.getElementById("actualizarContrasenaForm");
    const passwordInput = document.getElementById("nuevaContrasena");
    const confirmPasswordInput = document.getElementById("confirmarContrasena");
    const errorDiv = document.getElementById("actualizarContrasenaError");

    const removeFieldErrorState = () => {
      [passwordInput, confirmPasswordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = []) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
      }
      removeFieldErrorState();
    };

    [passwordInput, confirmPasswordInput].forEach((field) => {
      field?.addEventListener("input", () => {
        field.classList.remove("auth-input-error");
      });
    });

    updateForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const password = passwordInput?.value ?? "";
      const confirmPassword = confirmPasswordInput?.value ?? "";

      clearAuthError();

      if (!password || !confirmPassword) {
        setAuthError("Completa los campos para continuar", [
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      if (!isStrongPassword(password)) {
        setAuthError(PASSWORD_POLICY_MESSAGE, [passwordInput]);
        return;
      }

      if (password !== confirmPassword) {
        setAuthError("Las contrasenas no coinciden", [
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      state.authRecovery.email = "";
      state.authRecovery.codeVerified = false;
      showAppNotification("Contrasena actualizada. Inicia sesion.", "success");
      navigate("/login", true);
    });
  }

  if (pathname === "/registro") {
    const registroForm = document.getElementById("registroForm");
    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("contrasena");
    const confirmPasswordInput = document.getElementById("confirmarContrasena");
    const errorDiv = document.getElementById("registroError");

    const removeFieldErrorState = () => {
      [nombreInput, emailInput, passwordInput, confirmPasswordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (
      message,
      fieldsToHighlight = [],
      variant = "default",
    ) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    [nombreInput, emailInput, passwordInput, confirmPasswordInput].forEach(
      (field) => {
        field?.addEventListener("input", () => {
          field.classList.remove("auth-input-error");
        });
      },
    );

    registroForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = nombreInput?.value?.trim() ?? "";
      const email = emailInput?.value?.trim() ?? "";
      const password = passwordInput?.value ?? "";
      const confirmPassword = confirmPasswordInput?.value ?? "";
      const submitBtn = registroForm.querySelector('button[type="submit"]');

      clearAuthError();

      if (!nombre || !email || !password || !confirmPassword) {
        setAuthError("Completa todos los campos obligatorios", [
          nombreInput,
          emailInput,
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(
          "El correo debe incluir '@' para ser válido",
          [emailInput],
          "email-format",
        );
        return;
      }

      if (!isStrongPassword(password)) {
        setAuthError(PASSWORD_POLICY_MESSAGE, [passwordInput]);
        return;
      }

      if (password !== confirmPassword) {
        setAuthError("Las contraseñas no coinciden", [
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nombre, email, password }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const message = Array.isArray(errData.message)
            ? errData.message[0]
            : errData.message;
          const fallbackMessage = response.status === 409
            ? "El email ya está en uso"
            : "Error al registrar el usuario";
          throw new Error(message || fallbackMessage);
        }

        navigate("/registro/exitoso", true);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo registrar el usuario";
        setAuthError(message, [emailInput, passwordInput, confirmPasswordInput]);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname === "/registro/exitoso") {
    clearRegistroExitosoAutoRedirect();

    const countdownElement = document.getElementById("registroExitosoCountdown");
    let secondsLeft = REGISTRO_EXITOSO_REDIRECT_SECONDS;

    if (countdownElement) {
      countdownElement.textContent = String(secondsLeft);
    }

    registroExitosoCountdownIntervalId = window.setInterval(() => {
      secondsLeft = Math.max(secondsLeft - 1, 0);
      if (countdownElement) {
        countdownElement.textContent = String(secondsLeft);
      }

      if (secondsLeft === 0) {
        if (registroExitosoCountdownIntervalId !== null) {
          window.clearInterval(registroExitosoCountdownIntervalId);
          registroExitosoCountdownIntervalId = null;
        }
      }
    }, 1000);

    registroExitosoRedirectTimeoutId = window.setTimeout(() => {
      clearRegistroExitosoAutoRedirect();
      navigate("/login", true);
    }, REGISTRO_EXITOSO_REDIRECT_SECONDS * 1000);
  }

  if (pathname === "/dashboard/cargar") {
    const ticketUploadInput = document.getElementById("ticketUploadInput");
    const expenseForm = document.getElementById("expenseForm");
    const categorySelect = document.getElementById("expenseCategoria");

    const syncNewCategoryVisibility = (value) => {
      const wrap = document.querySelector("[data-new-category-wrap='unified']");
      if (!wrap) {
        return;
      }

      const shouldShow = value === "__new_category__";
      wrap.classList.toggle("d-none", !shouldShow);
    };

    syncNewCategoryVisibility(categorySelect?.value || "");

    categorySelect?.addEventListener("change", (event) => {
      const value = event.target.value || "";
      state.finanzas.cargar.form.categoria = value;
      syncNewCategoryVisibility(value);
    });

    ticketUploadInput?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      state.finanzas.cargar.ticketFileName = file.name;
      state.finanzas.cargar.ocrLoading = true;
      render();

      try {
        const formData = new FormData();
        formData.append("ticket", file);

        const response = await apiFetch("/api/ticket-ocr/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        state.finanzas.cargar.form = {
          comercio: data.comercio ?? "",
          fecha: data.fecha ?? "",
          monto: data.monto ?? "",
          categoria: data.categoria ?? "",
          descripcion: data.descripcion ?? "",
        };
      } catch {
        showAppNotification(
          "No se pudo analizar el ticket. Completá los datos manualmente.",
          "warn",
        );
      } finally {
        state.finanzas.cargar.ocrLoading = false;
        render();
      }
    });

    expenseForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(expenseForm);

      const payload = {
        comercio: (formData.get("comercio") || "").toString().trim(),
        fecha: (formData.get("fecha") || "").toString(),
        monto: (formData.get("monto") || "").toString(),
        categoria: (formData.get("categoria") || "").toString(),
        descripcion: (formData.get("descripcion") || "").toString().trim(),
      };

      state.finanzas.cargar.form = payload;

      const submitBtn = expenseForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const saved = await addExpenseRecord(payload);

      if (submitBtn) submitBtn.disabled = false;

      if (!saved) {
        showAppNotification(
          "No se pudo guardar el gasto. Revisa los datos.",
          "error",
        );
        return;
      }

      const periodKey = getMonthKeyFromDate(payload.fecha);
      state.finanzas.filtros.periodo = periodKey || "todos";
      state.finanzas.filtros.search = "";
      state.finanzas.filtros.categoria = "Todas";
      state.finanzas.cargar.form = {
        comercio: "",
        fecha: payload.fecha,
        monto: "",
        categoria: "",
        descripcion: "",
      };
      navigate("/dashboard/gastos");
    });
  }

  if (pathname === "/dashboard/gastos") {
    const searchInput = document.getElementById("expenseSearchInput");
    const categoryFilter = document.getElementById("expenseCategoryFilter");
    const periodFilter = document.getElementById("expensePeriodFilter");

    searchInput?.addEventListener("input", (event) => {
      state.finanzas.filtros.search = event.target.value;
      render();
    });

    categoryFilter?.addEventListener("change", (event) => {
      state.finanzas.filtros.categoria = event.target.value;
      render();
    });

    periodFilter?.addEventListener("change", (event) => {
      state.finanzas.filtros.periodo = event.target.value;
      render();
    });
  }

  if (
    pathname === "/dashboard/recomendaciones/historicas" ||
    pathname.match(/^\/cliente\/[^/]+\/recomendaciones\/historicas$/)
  ) {
    const searchInput = document.getElementById("recSearchInput");
    const monthFilter = document.getElementById("recMonthFilter");
    const yearFilter = document.getElementById("recYearFilter");
    const emitterFilter = document.getElementById("recEmitterFilter");

    const handleFilterChange = () => {
      applyHistoricalRecommendationFilters();
    };

    searchInput?.addEventListener("input", handleFilterChange);
    monthFilter?.addEventListener("change", handleFilterChange);
    yearFilter?.addEventListener("change", handleFilterChange);
    emitterFilter?.addEventListener("change", handleFilterChange);

    applyHistoricalRecommendationFilters();
  }

  if (pathname === "/dashboard") {
    const dashboard = state.dashboard;

    const nuevoGastoForm = document.getElementById("nuevoGastoForm");
    nuevoGastoForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const descripcionInput = document.getElementById("descripcion");
      const montoInput = document.getElementById("monto");
      const categoriaSelect = document.getElementById("categoria");

      const descripcion = descripcionInput?.value?.trim() ?? "";
      const montoStr = montoInput?.value ?? "";
      const categoria = categoriaSelect?.value ?? "Comida";
      const monto = Number.parseFloat(montoStr);

      if (!descripcion || !montoStr || Number.isNaN(monto) || monto <= 0) {
        return;
      }

      const submitBtn = nuevoGastoForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const saved = await apiCreateMovimiento({
          tipo: "egreso",
          monto,
          descripcion,
          categoria,
          comercio: descripcion,
        });

        const today = getCurrentDateShort();
        state.finanzas.gastos = [
          { id: saved.id, comercio: descripcion, descripcion, monto, categoria, fecha: today, tipo: "egreso" },
          ...state.finanzas.gastos,
        ];
        dashboard.gastos = [
          { id: saved.id, descripcion, monto, categoria, fecha: today },
          ...dashboard.gastos,
        ];
        await loadDashboardBalances();
      } catch {
        showAppNotification("No se pudo guardar el gasto.", "error");
      }

      if (submitBtn) submitBtn.disabled = false;
      dashboard.formData = { descripcion: "", monto: "", categoria: "Comida" };
      render();
    });

    ["descripcion", "monto", "categoria"].forEach((field) => {
      const input = document.getElementById(field);
      input?.addEventListener("input", (event) => {
        dashboard.formData[field] = event.target.value;
      });
      input?.addEventListener("change", (event) => {
        dashboard.formData[field] = event.target.value;
      });
    });

    const ingresoForm = document.getElementById("ingresoForm");
    ingresoForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const monto = Number.parseFloat(
        document.getElementById("ingresoMonto")?.value ?? "",
      );
      const concepto = (
        document.getElementById("ingresoConcepto")?.value ?? ""
      ).trim();
      const origen =
        document.getElementById("ingresoOrigen")?.value ?? "Sueldo";

      dashboard.ingresoForm = {
        monto: Number.isNaN(monto) ? "" : String(monto),
        concepto,
        origen,
      };

      if (!concepto || Number.isNaN(monto) || monto <= 0) {
        return;
      }

      const submitBtn = ingresoForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await apiCreateMovimiento({
          tipo: "ingreso",
          monto,
          descripcion: concepto,
          categoria: origen,
        });
        await loadDashboardBalances();
      } catch {
        showAppNotification("No se pudo registrar el ingreso.", "error");
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      if (submitBtn) submitBtn.disabled = false;
      dashboard.saldoActual += monto;
      dashboard.ingresoForm = { monto: "", concepto: "", origen: "Sueldo" };
      dashboard.modals.ingreso = false;
      render();
    });

    ["ingresoMonto", "ingresoConcepto", "ingresoOrigen"].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener("input", () => {
        dashboard.ingresoForm = {
          monto: document.getElementById("ingresoMonto")?.value ?? "",
          concepto: document.getElementById("ingresoConcepto")?.value ?? "",
          origen: document.getElementById("ingresoOrigen")?.value ?? "Sueldo",
        };
      });
      input?.addEventListener("change", () => {
        dashboard.ingresoForm = {
          monto: document.getElementById("ingresoMonto")?.value ?? "",
          concepto: document.getElementById("ingresoConcepto")?.value ?? "",
          origen: document.getElementById("ingresoOrigen")?.value ?? "Sueldo",
        };
      });
    });

    const nuevoAhorroForm = document.getElementById("nuevoAhorroForm");
    nuevoAhorroForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = (
        document.getElementById("nuevoAhorroNombre")?.value ?? ""
      ).trim();
      const montoInicial = Number.parseFloat(
        document.getElementById("nuevoAhorroMonto")?.value ?? "",
      );
      const meta = Number.parseFloat(
        document.getElementById("nuevoAhorroMeta")?.value ?? "",
      );

      dashboard.nuevoAhorroForm = {
        nombre,
        montoInicial: Number.isNaN(montoInicial) ? "" : String(montoInicial),
        meta: Number.isNaN(meta) ? "" : String(meta),
      };

      const wasAdded = addSavingsGoalRecord({ nombre, montoInicial, meta });
      if (!wasAdded) {
        showAppNotification("Completa al menos el nombre del ahorro", "warning");
        return;
      }

      dashboard.nuevoAhorroForm = { nombre: "", montoInicial: "", meta: "" };
      dashboard.modals.ahorro = false;
      showAppNotification("Ahorro creado correctamente", "success");
      render();
    });

    ["nuevoAhorroNombre", "nuevoAhorroMonto", "nuevoAhorroMeta"].forEach(
      (id) => {
        const input = document.getElementById(id);
        input?.addEventListener("input", () => {
          dashboard.nuevoAhorroForm = {
            nombre: document.getElementById("nuevoAhorroNombre")?.value ?? "",
            montoInicial:
              document.getElementById("nuevoAhorroMonto")?.value ?? "",
            meta: document.getElementById("nuevoAhorroMeta")?.value ?? "",
          };
        });
      },
    );

    const destinoForm = document.getElementById("destinoForm");
    destinoForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const ahorroDestino = dashboard.ahorros.find(
        (ahorro) => ahorro.id === dashboard.ahorroDestinoId,
      );
      if (!ahorroDestino) {
        return;
      }

      const monto = Number.parseFloat(
        document.getElementById("destinoMonto")?.value ?? "",
      );
      dashboard.destinoForm.monto = Number.isNaN(monto) ? "" : String(monto);

      if (Number.isNaN(monto) || monto <= 0 || monto > dashboard.saldoActual) {
        return;
      }

      dashboard.saldoActual -= monto;
      dashboard.ahorros = dashboard.ahorros.map((ahorro) =>
        ahorro.id === ahorroDestino.id
          ? { ...ahorro, monto: ahorro.monto + monto }
          : ahorro,
      );
      dashboard.modals.destino = false;
      dashboard.ahorroDestinoId = null;
      dashboard.destinoForm.monto = "";
      render();
    });

    const destinoInput = document.getElementById("destinoMonto");
    destinoInput?.addEventListener("input", (event) => {
      dashboard.destinoForm.monto = event.target.value;
    });

    const ahorroSelect = document.getElementById("dashboardAhorroSelect");
    ahorroSelect?.addEventListener("change", (event) => {
      state.dashboard.selectedAhorroId = event.target.value || null;
      render();
    });
  }

  if (pathname === "/dashboard/ahorros") {
    const ahorroForm = document.getElementById("detalleAhorroForm");
    ahorroForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = (document.getElementById("detalleAhorroNombre")?.value || "").trim();
      const montoInicial = Number.parseFloat(document.getElementById("detalleAhorroMonto")?.value || "") || 0;
      const meta = Number.parseFloat(document.getElementById("detalleAhorroMeta")?.value || "") || 0;

      if (!nombre) {
        showAppNotification("Completa al menos el nombre del ahorro", "warning");
        return;
      }

      if (meta > 0 && meta <= montoInicial) {
        showAppNotification("La meta debe ser mayor al monto inicial", "warning");
        return;
      }

      const disponible = state.finanzas.balancesData?.disponible ?? 0;
      if (montoInicial > 0 && montoInicial > disponible) {
        showAppNotification(`El monto inicial supera el dinero disponible (${disponible.toFixed(2)})`, "warning");
        return;
      }

      try {
        await createAhorro({ nombre, montoInicial, meta });
        await loadAhorros();
        showAppNotification("Nuevo ahorro agregado", "success");
        render();
      } catch (error) {
        showAppNotification(error.message || "Error al crear el ahorro", "error");
      }
    });
  }

  if (
    pathname === "/dashboard/asesor" ||
    pathname === "/dashboard/asesor/panel" ||
    pathname === "/dashboard/asesor/recomendaciones"
  ) {
    const addClientForm = document.getElementById("addClientForm");
    addClientForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = (document.getElementById("nuevoClienteNombre")?.value ?? "").trim();
      const codigo = (document.getElementById("nuevoClienteCodigo")?.value ?? "").trim();

      updateAdvisorNewClientField("nombre", nombre);
      updateAdvisorNewClientField("codigo", codigo);

      if (!codigo) {
        showAppNotification("Ingresa el codigo de vinculacion del cliente", "warning");
        return;
      }

      const submitBtn = addClientForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await apiVincularCliente(codigo);
        await loadAsesorClientes();
        closeAdvisorNewClientModal();
        showAppNotification("Cliente vinculado correctamente", "success");
        render();
      } catch (error) {
        showAppNotification(error.message || "Codigo invalido o expirado", "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    const busquedaInput = document.getElementById("advisorSearchInput");
    busquedaInput?.addEventListener("input", (event) => {
      state.asesor.busqueda = event.target.value;
      render();
    });

    const ordenInput = document.getElementById("advisorSortSelect");
    ordenInput?.addEventListener("change", (event) => {
      state.asesor.orden = event.target.value;
      render();
    });

    ["nuevoClienteNombre", "nuevoClienteCodigo"].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener("input", () => {
        updateAdvisorNewClientField("nombre", document.getElementById("nuevoClienteNombre")?.value ?? "");
        updateAdvisorNewClientField("codigo", document.getElementById("nuevoClienteCodigo")?.value ?? "");
      });
    });
  }

  if (pathname.startsWith("/cliente/")) {
    const formRecomendacion = document.getElementById(
      "agregarRecomendacionForm",
    );
    formRecomendacion?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const titulo = (document.getElementById("recomendacionTitulo")?.value ?? "").trim();
      const texto = (document.getElementById("recomendacionTexto")?.value ?? "").trim();
      state.detalleCliente.nuevaRecomendacionTitulo = titulo;
      state.detalleCliente.nuevaRecomendacionTexto = texto;

      if (!texto) return;

      const clienteId = state.asesor.clienteSeleccionadoId;
      if (!clienteId) return;

      const submitBtn = formRecomendacion.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await apiAddClienteRecomendacion(clienteId, {
          contenido: texto,
          titulo,
          tipo: "asesor",
        });
        await loadClienteRecomendaciones(clienteId);
        state.detalleCliente.nuevaRecomendacionTitulo = "";
        state.detalleCliente.nuevaRecomendacionTexto = "";
        showAppNotification("Recomendacion enviada correctamente", "success");
        render();
      } catch (error) {
        console.error("Error al enviar recomendacion:", error);
        showAppNotification("No se pudo enviar la recomendacion", "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    const recomendacionTituloInput = document.getElementById("recomendacionTitulo");
    recomendacionTituloInput?.addEventListener("input", (event) => {
      state.detalleCliente.nuevaRecomendacionTitulo = event.target.value;
    });

    const recomendacionTextoInput = document.getElementById("recomendacionTexto");
    recomendacionTextoInput?.addEventListener("input", (event) => {
      state.detalleCliente.nuevaRecomendacionTexto = event.target.value;
    });
  }

  if (pathname === "/perfil/editar") {
    const perfilForm = document.getElementById("perfilForm");
    perfilForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = document.getElementById("nombre")?.value?.trim() ?? "";
      const email = document.getElementById("email")?.value?.trim() ?? "";
      const submitBtn = perfilForm.querySelector('button[type="submit"]');

      if (!state.currentUser?.id) {
        showAppNotification(
          "No se pudo identificar el usuario autenticado",
          "error",
        );
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
      }

      try {
        const response = await apiFetch(`/api/users/${state.currentUser.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: nombre, email }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "No se pudo actualizar el perfil");
        }

        const updatedUser = await response.json();
        syncProfileFromUser(updatedUser);
        showAppNotification("Perfil actualizado correctamente", "success");
        render();
      } catch (error) {
        showAppNotification(
          error?.message || "No se pudo actualizar el perfil",
          "error",
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }
    });

    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");

    nombreInput?.addEventListener("input", (event) => {
      state.perfil.nombre = event.target.value;
    });

    emailInput?.addEventListener("input", (event) => {
      state.perfil.email = event.target.value;
    });

    const imageInput = document.getElementById("imageInput");
    imageInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        state.perfil.imagePreview = String(reader.result || "");
        saveAppPreferences();
        render();
      };
      reader.readAsDataURL(file);
    });

    const passwordForm = document.getElementById("passwordForm");
    passwordForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const actual = document.getElementById("actual")?.value ?? "";
      const nueva = document.getElementById("nueva")?.value ?? "";
      const confirmar = document.getElementById("confirmar")?.value ?? "";

      state.perfil.passwordData = { actual, nueva, confirmar };

      if (nueva !== confirmar) {
        showAppNotification("Las contrasenas no coinciden", "error");
        return;
      }

      showAppNotification("Contrasena actualizada correctamente", "success");
      state.perfil.passwordData = { actual: "", nueva: "", confirmar: "" };
      render();
    });

    ["actual", "nueva", "confirmar"].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener("input", () => {
        state.perfil.passwordData = {
          actual: document.getElementById("actual")?.value ?? "",
          nueva: document.getElementById("nueva")?.value ?? "",
          confirmar: document.getElementById("confirmar")?.value ?? "",
        };
      });
    });
  }

  if (pathname === "/perfil/configuracion") {
    const sectionButtons = Array.from(
      document.querySelectorAll("[data-config-section-target]"),
    );
    const sectionPanels = Array.from(
      document.querySelectorAll("[data-config-section]"),
    );
    const availableSections = new Set(
      sectionPanels
        .map((panel) => panel.getAttribute("data-config-section"))
        .filter(Boolean),
    );

    const readSectionFromHash = () => {
      const hashValue = String(window.location.hash || "");
      if (!hashValue.startsWith("#config-")) {
        return "perfil";
      }

      const target = hashValue.slice("#config-".length);
      return availableSections.has(target) ? target : "perfil";
    };

    const setConfigSection = (sectionId, { syncHash = true } = {}) => {
      const targetSection = availableSections.has(sectionId)
        ? sectionId
        : "perfil";

      sectionButtons.forEach((button) => {
        const buttonTarget = button.getAttribute("data-config-section-target");
        const isActive = buttonTarget === targetSection;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      sectionPanels.forEach((panel) => {
        const panelSection = panel.getAttribute("data-config-section");
        const isActive = panelSection === targetSection;
        panel.classList.toggle("active", isActive);
        panel.hidden = !isActive;
      });

      if (syncHash) {
        const hash = `#config-${targetSection}`;
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}${hash}`,
        );
      }
    };

    if (sectionButtons.length > 0 && sectionPanels.length > 0) {
      setConfigSection(readSectionFromHash(), { syncHash: false });

      sectionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const targetSection = button.getAttribute("data-config-section-target");
          if (targetSection) {
            setConfigSection(targetSection);
          }
        });
      });
    }

    const monedaSelect = document.getElementById("moneda");
    monedaSelect?.addEventListener("change", (event) => {
      state.configuracion.moneda = normalizeCurrency(event.target.value);
      saveAppPreferences();
      render();
    });

    const asesorNombreInput = document.getElementById("asesorNombre");
    asesorNombreInput?.addEventListener("input", (event) => {
      state.configuracion.asesoria.solicitud.nombre = event.target.value;
    });

    const asesorEmailInput = document.getElementById("asesorEmail");
    asesorEmailInput?.addEventListener("input", (event) => {
      state.configuracion.asesoria.solicitud.email = event.target.value;
    });

    const asesorEspecialidadInput = document.getElementById("asesorEspecialidad");
    asesorEspecialidadInput?.addEventListener("input", (event) => {
      state.configuracion.asesoria.solicitud.especialidad = event.target.value;
    });

    const asesorForm = document.getElementById("agregarAsesorForm");
    asesorForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = (document.getElementById("asesorNombre")?.value ?? "").trim();
      const email = (document.getElementById("asesorEmail")?.value ?? "").trim();
      const especialidad = (document.getElementById("asesorEspecialidad")?.value ?? "").trim();

      if (!nombre || !email) {
        showAppNotification("Completa el nombre y el email del asesor", "warning");
        return;
      }

      const codigoVerificacion = generateAdvisorVerificationCode();

      state.configuracion.asesoria = {
        asesor: {
          nombre,
          email,
          especialidad,
          codigoVerificacion,
          estado: "Pendiente de verificacion",
          vinculadoEn: new Date().toISOString(),
        },
        solicitud: {
          nombre,
          email,
          especialidad,
        },
      };

      saveAppPreferences();
      showAppNotification("Asesor agregado y codigo generado", "success");
      render();
    });

    const configProfileImageInput = document.getElementById("configProfileImageInput");
    configProfileImageInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (file.type && !file.type.startsWith("image/")) {
        showAppNotification("Selecciona un archivo de imagen valido", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const preview = String(reader.result || "");
        if (!preview) {
          return;
        }

        state.perfil.imagePreview = preview;
        state.perfil.imagen = preview;
        saveAppPreferences();
        showAppNotification("Foto de perfil actualizada", "success");
        render();
      };
      reader.readAsDataURL(file);
    });

    const idiomaSelect = document.getElementById("idioma");
    idiomaSelect?.addEventListener("change", (event) => {
      state.configuracion.idioma = ["es", "en", "pt"].includes(event.target.value)
        ? event.target.value
        : "es";
      saveAppPreferences();
      render();
    });

    const temaModoSelect = document.getElementById("temaModo");
    temaModoSelect?.addEventListener("change", (event) => {
      state.configuracion.tema = normalizeThemeMode(event.target.value);
      saveAppPreferences();
      render();
    });

    const tamanioFuenteSelect = document.getElementById("tamanioFuente");
    tamanioFuenteSelect?.addEventListener("change", (event) => {
      state.configuracion.tamanioFuente = normalizeFontSizeMode(event.target.value);
      saveAppPreferences();
      render();
    });

    const densidadSelect = document.getElementById("densidad");
    densidadSelect?.addEventListener("change", (event) => {
      state.configuracion.densidad = normalizeDensityMode(event.target.value);
      saveAppPreferences();
      render();
    });

    const reducirAnimacionesInput = document.getElementById("reducirAnimaciones");
    reducirAnimacionesInput?.addEventListener("change", (event) => {
      state.configuracion.reducirAnimaciones = event.target.checked;
      saveAppPreferences();
      render();
    });

    const mostrarCentavosInput = document.getElementById("mostrarCentavos");
    mostrarCentavosInput?.addEventListener("change", (event) => {
      state.configuracion.mostrarCentavos = event.target.checked;
      saveAppPreferences();
      render();
    });

    const autenticacionInput = document.getElementById("autenticacionDos");
    autenticacionInput?.addEventListener("change", (event) => {
      state.configuracion.autenticacionDos = event.target.checked;
      saveAppPreferences();
      render();
    });

    const guardarBtn = document.getElementById("guardarConfiguracionBtn");
    guardarBtn?.addEventListener("click", () => {
      saveAppPreferences();
      showAppNotification("Preferencias guardadas", "success");
    });

    const cerrarTodasBtn = document.getElementById("cerrarTodasSesionesBtn");
    cerrarTodasBtn?.addEventListener("click", () => {
      if (state.configuracion.sesiones.length > 0) {
        state.configuracion.sesiones = [state.configuracion.sesiones[0]];
      }
      showAppNotification(
        "Todas las sesiones excepto esta han sido cerradas",
        "success",
      );
      render();
    });
  }

  if (pathname === "/perfil/notificaciones") {
    const toggleKeys = [
      "resumenSemanal",
      "alertaPago",
      "alertaPresupuesto",
      "movimientosGrandes",
      "recomendacionesIA",
    ];

    toggleKeys.forEach((key) => {
      const input = document.getElementById(key);
      input?.addEventListener("change", (event) => {
        state.notificaciones[key] = event.target.checked;
        render();
      });
    });

    const guardarBtn = document.getElementById("guardarPreferenciasBtn");
    guardarBtn?.addEventListener("click", () => {
      showAppNotification("Preferencias actualizadas correctamente", "success");
    });
  }
}
