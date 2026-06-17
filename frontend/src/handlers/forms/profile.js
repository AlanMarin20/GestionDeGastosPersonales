import { state } from "../../state";
import { t } from "../../i18n";
import {
  isStrongPassword,
  normalizeThemeMode,
  normalizeFontSizeMode,
  normalizeDensityMode,
  normalizeCurrency,
} from "../../utils/format";
import { showAppNotification } from "../../ui/notifications";
import { saveAppPreferences } from "../../ui/theme";
import { getFinanzasCurrentPeriod } from "../../data/finanzas";
import { apiFetch } from "../../api/client";
import { syncProfileFromUser, changePassword, apiGenerateLinkCode } from "../../api/user";
import { loadBudgets, createBudget } from "../../api/budgets";
import { loadCategories, createCategory } from "../../api/categories";
import { parseMonthKey } from "../../utils/date";
import { PASSWORD_POLICY_MESSAGE } from "../../config";

export function attachProfileFormHandlers(pathname, { render }) {
  if (pathname === "/perfil/editar") {
    const perfilForm = document.getElementById("perfilForm");
    perfilForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = document.getElementById("nombre")?.value?.trim() ?? "";
      const email = document.getElementById("email")?.value?.trim() ?? "";
      const submitBtn = perfilForm.querySelector('button[type="submit"]');

      if (!state.currentUser?.id) {
        showAppNotification(t('forms.couldNotIdentifyUser'), "error");
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
          throw new Error(errData.message || t('forms.couldNotUpdateProfile'));
        }

        const updatedUser = await response.json();
        syncProfileFromUser(updatedUser);
        showAppNotification(t('forms.profileUpdated'), "success");
        render();
      } catch (error) {
        showAppNotification(error?.message || t('forms.couldNotUpdateProfile'), "error");
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
        showAppNotification(t('forms.passwordsDoNotMatchLower'), "error");
        return;
      }

      showAppNotification(t('forms.passwordUpdated'), "success");
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
    asesorForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = (document.getElementById("asesorNombre")?.value ?? "").trim();
      const email = (document.getElementById("asesorEmail")?.value ?? "").trim();
      const especialidad = (document.getElementById("asesorEspecialidad")?.value ?? "").trim();

      if (!nombre || !email) {
        showAppNotification(t('forms.completeAdvisorFields'), "warning");
        return;
      }

      // Verificar si ya tiene ese mismo asesor vinculado (por email)
      const currentAdvisor = state.configuracion?.asesoria?.asesor;
      if (currentAdvisor && currentAdvisor.email && currentAdvisor.email.toLowerCase() === email.toLowerCase()) {
        showAppNotification(t('forms.advisorAlreadyLinked'), "error");
        return;
      }

      const submitBtn = asesorForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const { codigoVinculacion } = await apiGenerateLinkCode();

        state.configuracion.asesoria = {
          asesor: {
            nombre,
            email,
            especialidad,
            codigoVerificacion: codigoVinculacion,
            estado: "Pendiente de verificacion",
            vinculadoEn: new Date().toISOString(),
          },
          solicitud: { nombre, email, especialidad },
        };

        saveAppPreferences();
        showAppNotification(t('forms.advisorAdded'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.unexpectedError'), "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    const configProfileImageInput = document.getElementById("configProfileImageInput");
    configProfileImageInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (file.type && !file.type.startsWith("image/")) {
        showAppNotification(t('forms.selectValidImage'), "warning");
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
        showAppNotification(t('forms.profilePhotoUpdated'), "success");
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
      showAppNotification(t('forms.preferencesSaved'), "success");
    });

    const cerrarTodasBtn = document.getElementById("cerrarTodasSesionesBtn");
    cerrarTodasBtn?.addEventListener("click", () => {
      if (state.configuracion.sesiones.length > 0) {
        state.configuracion.sesiones = [state.configuracion.sesiones[0]];
      }
      showAppNotification(t('forms.allSessionsClosed'), "success");
      render();
    });

    // Presupuestos
    const nuevoBudgetForm = document.getElementById("nuevoBudgetForm");
    nuevoBudgetForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const categoriaSelect = document.getElementById("budgetCategoria");
      const limiteInput = document.getElementById("budgetLimite");
      const selectedOption = categoriaSelect?.options[categoriaSelect.selectedIndex];
      const categoryId = categoriaSelect?.value;
      const categoryName = selectedOption?.getAttribute("data-name") || categoryId;
      const amountLimit = Number.parseFloat(limiteInput?.value || "");

      if (!categoryId || Number.isNaN(amountLimit) || amountLimit <= 0) {
        showAppNotification(t('forms.selectCategoryAndLimit'), "warning");
        return;
      }

      const viewPeriod = state.finanzas.ui.budgetViewPeriod || getFinanzasCurrentPeriod();
      const { year: bYear, month: bMonth } = parseMonthKey(viewPeriod);
      const submitBtn = nuevoBudgetForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await createBudget({
          categoryId: Number(categoryId),
          amountLimit,
          month: bMonth,
          year: bYear,
        });
        await loadBudgets();
        if (limiteInput) limiteInput.value = "";
        if (categoriaSelect) categoriaSelect.value = "";
        showAppNotification(t('forms.budgetCreated', { name: categoryName }), "success");
        render();
      } catch (err) {
        showAppNotification(err?.message || t('forms.couldNotCreateBudget'), "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    // Categorías
    const nuevaCategoriaForm = document.getElementById("nuevaCategoriaForm");
    nuevaCategoriaForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nameInput = document.getElementById("nuevaCategoria");
      const emojiInput = document.getElementById("nuevoCategoriaEmoji");
      const name = (nameInput?.value || "").trim();
      const icon = (emojiInput?.value || "").trim();

      if (!name) {
        showAppNotification(t('forms.writeCategoryNameAccent'), "warning");
        return;
      }

      const submitBtn = nuevaCategoriaForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await createCategory({ name, icon: icon || undefined });
        await loadCategories();
        if (nameInput) nameInput.value = "";
        if (emojiInput) emojiInput.value = "";
        showAppNotification(t('forms.categoryCreated', { name }), "success");
        render();
      } catch (err) {
        showAppNotification(err?.message || t('forms.couldNotCreateCategory'), "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    // Perfil financiero
    const guardarPerfilFinancieroBtn = document.getElementById("guardarPerfilFinancieroBtn");
    guardarPerfilFinancieroBtn?.addEventListener("click", () => {
      const ingreso = (document.getElementById("configIngreso")?.value || "").trim();
      const ahorro = (document.getElementById("configAhorro")?.value || "").trim();
      state.configuracion.perfilFinanciero = { ingresoEstimado: ingreso, objetivoAhorro: ahorro };
      saveAppPreferences();
      showAppNotification(t('forms.financialProfileSaved'), "success");
    });

    // Guardar perfil básico (nombre, email)
    const guardarPerfilConfigBtn = document.getElementById("guardarPerfilConfigBtn");
    guardarPerfilConfigBtn?.addEventListener("click", async () => {
      if (!state.currentUser?.id) {
        showAppNotification(t('forms.couldNotIdentifyUserShort'), "error");
        return;
      }
      const nombre = `${(document.getElementById("configNombre")?.value || "").trim()} ${(document.getElementById("configApellido")?.value || "").trim()}`.trim();
      const email = (document.getElementById("configEmail")?.value || "").trim();
      if (!nombre || !email) {
        showAppNotification(t('forms.nameAndEmailRequired'), "warning");
        return;
      }
      guardarPerfilConfigBtn.disabled = true;
      try {
        const res = await apiFetch(`/api/users/${state.currentUser.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: nombre, email }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || t('forms.errorSaving'));
        }
        const user = await res.json();
        syncProfileFromUser(user);
        showAppNotification(t('forms.profileUpdatedShort'), "success");
        render();
      } catch (err) {
        showAppNotification(err?.message || t('forms.couldNotUpdateProfile'), "error");
      } finally {
        guardarPerfilConfigBtn.disabled = false;
      }
    });

    // Guardar seguridad (contraseña)
    const guardarSeguridadBtn = document.getElementById("guardarSeguridadBtn");
    guardarSeguridadBtn?.addEventListener("click", async () => {
      const actual = document.getElementById("passwordActual")?.value || "";
      const nueva = document.getElementById("passwordNueva")?.value || "";
      const confirmar = document.getElementById("passwordConfirmar")?.value || "";
      if (!actual || !nueva || !confirmar) {
        showAppNotification(t('forms.completePasswordFields'), "warning");
        return;
      }
      if (!isStrongPassword(nueva)) {
        showAppNotification(PASSWORD_POLICY_MESSAGE, "warning");
        return;
      }
      if (nueva !== confirmar) {
        showAppNotification(t('forms.passwordsDoNotMatch'), "error");
        return;
      }
      guardarSeguridadBtn.disabled = true;
      try {
        await changePassword(actual, nueva);
        document.getElementById("passwordActual").value = "";
        document.getElementById("passwordNueva").value = "";
        document.getElementById("passwordConfirmar").value = "";
        showAppNotification(t('forms.passwordUpdatedShort'), "success");
      } catch (err) {
        showAppNotification(err?.message || t('forms.couldNotChangePassword'), "error");
      } finally {
        guardarSeguridadBtn.disabled = false;
      }
    });

    // Notificaciones
    const guardarPreferenciasNotifBtn = document.getElementById("guardarPreferenciasNotifBtn");
    guardarPreferenciasNotifBtn?.addEventListener("click", () => {
      saveAppPreferences();
      showAppNotification(t('forms.notifPreferencesSaved'), "success");
    });

    ["resumenSemanal", "alertaPago", "alertaPresupuesto", "recomendacionesIA", "movimientosGrandes"].forEach((key) => {
      const input = document.getElementById(key);
      input?.addEventListener("change", (event) => {
        state.notificaciones[key] = event.target.checked;
      });
    });
  }
}
