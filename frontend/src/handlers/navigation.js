import { state } from "../state";
import { ACCESS_TOKEN_KEY } from "../config";
import {
  DASHBOARD_DROPDOWN_CONFIG,
  closeDashboardDropdown,
  closeDashboardDropdowns,
  toggleDashboardDropdown,
  toggleDashboardNotificationsMenu,
  toggleDashboardUserChipMenu,
} from "./dropdowns";
import {
  getLandingMobileMenuElements,
  closeLandingMobileMenu,
  toggleLandingMobileMenu,
} from "./mobileMenu";
import { showAppNotification, showAppConfirm } from "../ui/notifications";
import { saveAppPreferences } from "../ui/theme";
import {
  exportFilteredExpensesAsCsv,
  exportVisibleHistoricalRecommendationsAsCsv,
} from "../data/csv";
import { updateExpenseRecord, deleteExpenseRecord } from "../data/expenses";
import {
  openAdvisorNewClientModal,
  closeAdvisorNewClientModal,
  registerAdvisorClientSelection,
} from "../data/advisor";
import { apiFetch } from "../api/client";
import { loadDashboardBalances, loadMovimientos } from "../api/user";
import { loadAhorros, updateAhorro, deleteAhorro } from "../api/ahorros";
import { apiDesvincularCliente, loadAsesorClientes } from "../api/asesor";

export function attachGlobalNavigation({ navigate, render }) {
  function clearSessionAndRedirectToLogin() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    state.currentUser = null;
    state.profileLoaded = true;
    closeDashboardDropdowns();
    navigate("/login", true);
  }

  const actionHandlers = {
    "toggle-landing-mobile-menu": ({ event }) => {
      event.preventDefault();
      toggleLandingMobileMenu();
    },
    "toggle-notifications-menu": ({ event, actionButton }) => {
      event.preventDefault();
      toggleDashboardNotificationsMenu(actionButton);
    },
    "toggle-user-chip-menu": ({ event, actionButton }) => {
      event.preventDefault();
      toggleDashboardUserChipMenu(actionButton);
    },
    "toggle-income-entry-menu": ({ event, actionButton }) => {
      event.preventDefault();
      toggleDashboardDropdown(actionButton, "toggle-income-entry-menu");
    },
    "close-landing-mobile-menu": ({ event }) => {
      event.preventDefault();
      closeLandingMobileMenu({ restoreFocus: true });
    },
    back: ({ event }) => {
      event.preventDefault();
      history.back();
    },
    "back-to-asesor": ({ event }) => {
      event.preventDefault();
      state.asesor.clienteSeleccionadoId = null;
      navigate("/dashboard/asesor");
    },
    "scroll-top-page": ({ event }) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    "brand-scroll-top": ({ event }) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    "brand-navigation": ({ event, actionButton }) => {
      event.preventDefault();
      const target = actionButton.getAttribute("data-target");
      if (target) {
        navigate(target);
      }
    },
    logout: ({ event }) => {
      event.preventDefault();
      clearSessionAndRedirectToLogin();
    },
    "save-new-category": ({ event, actionButton }) => {
      event.preventDefault();

      const formKey = actionButton.getAttribute("data-form");
      if (formKey !== "unified") {
        return;
      }

      const inputId = "expenseNuevaCategoria";
      const selectId = "expenseCategoria";
      const input = document.getElementById(inputId);
      const select = document.getElementById(selectId);
      const newCategory = (input?.value || "").trim();

      if (!newCategory) {
        showAppNotification("Escribe el nombre de la nueva categoria", "warning");
        return;
      }

      if (!Array.isArray(state.finanzas.categories)) {
        state.finanzas.categories = [];
      }

      const exists = state.finanzas.categories.some(
        (category) => category.toLowerCase() === newCategory.toLowerCase(),
      );

      if (!exists) {
        state.finanzas.categories = [...state.finanzas.categories, newCategory].sort((a, b) => a.localeCompare(b));
      }

      state.finanzas.cargar.form.categoria = newCategory;

      if (select) {
        select.value = newCategory;
      }

      if (input) {
        input.value = "";
      }

      showAppNotification("Categoria guardada correctamente", "success");
      render();
    },
    "save-new-income-category": ({ event }) => {
      event.preventDefault();

      const input = document.getElementById("incomeNuevaCategoria");
      const select = document.getElementById("incomeCategoria");
      const newCategory = (input?.value || "").trim();

      if (!newCategory) {
        showAppNotification("Escribe el nombre de la nueva categoria", "warning");
        return;
      }

      if (!Array.isArray(state.finanzas.ingresoCategories)) {
        state.finanzas.ingresoCategories = [];
      }

      const exists = state.finanzas.ingresoCategories.some(
        (cat) => cat.toLowerCase() === newCategory.toLowerCase(),
      );

      if (!exists) {
        state.finanzas.ingresoCategories = [...state.finanzas.ingresoCategories, newCategory].sort((a, b) => a.localeCompare(b));
      }

      state.finanzas.cargar.ingresoForm.categoria = newCategory;

      if (select) select.value = newCategory;
      if (input) input.value = "";

      showAppNotification("Categoria guardada correctamente", "success");
      render();
    },
    "switch-cargar-tab": ({ event, actionButton }) => {
      event.preventDefault();
      const tab = actionButton.getAttribute("data-tab");
      if (tab === "gasto" || tab === "ingreso") {
        state.finanzas.cargar.activeTab = tab;
        render();
      }
    },
    "export-expenses-csv": ({ event }) => {
      event.preventDefault();
      exportFilteredExpensesAsCsv();
    },
    "export-recommendations-csv": ({ event }) => {
      event.preventDefault();
      exportVisibleHistoricalRecommendationsAsCsv();
    },
    "open-edit-expense": ({ event, actionButton }) => {
      event.preventDefault();
      const expenseId = actionButton.getAttribute("data-expense-id");
      if (!expenseId) {
        return;
      }

      state.finanzas.ui.editingExpenseId = expenseId;
      state.finanzas.ui.deletingExpenseId = null;
      render();
    },
    "close-edit-expense-modal": ({ event }) => {
      event.preventDefault();
      state.finanzas.ui.editingExpenseId = null;
      render();
    },
    "save-edit-expense": async ({ event, actionButton }) => {
      event.preventDefault();
      const expenseId = actionButton.getAttribute("data-expense-id");
      if (!expenseId) {
        return;
      }

      const comercio =
        document.getElementById("editExpenseComercio")?.value?.trim() || "";
      const categoria =
        document.getElementById("editExpenseCategoria")?.value || "";
      const fecha = document.getElementById("editExpenseFecha")?.value || "";
      const monto = document.getElementById("editExpenseMonto")?.value || "";
      const descripcion =
        document.getElementById("editExpenseDescripcion")?.value?.trim() || "";

      actionButton.disabled = true;
      const updated = await updateExpenseRecord(expenseId, {
        comercio,
        categoria,
        fecha,
        monto,
        descripcion,
      });
      actionButton.disabled = false;

      if (!updated) {
        showAppNotification(
          "No se pudo actualizar el gasto. Revisa los campos.",
          "error",
        );
        return;
      }

      state.finanzas.ui.editingExpenseId = null;
      render();
    },
    "open-delete-expense": ({ event, actionButton }) => {
      event.preventDefault();
      const expenseId = actionButton.getAttribute("data-expense-id");
      if (!expenseId) {
        return;
      }

      state.finanzas.ui.deletingExpenseId = expenseId;
      state.finanzas.ui.editingExpenseId = null;
      render();
    },
    "close-delete-expense-modal": ({ event }) => {
      event.preventDefault();
      state.finanzas.ui.deletingExpenseId = null;
      render();
    },
    "confirm-delete-expense": async ({ event, actionButton }) => {
      event.preventDefault();
      const expenseId = actionButton.getAttribute("data-expense-id");
      if (!expenseId) {
        return;
      }

      actionButton.disabled = true;
      const deleted = await deleteExpenseRecord(expenseId);
      actionButton.disabled = false;

      if (deleted) {
        state.finanzas.ui.deletingExpenseId = null;
        state.finanzas.ui.editingExpenseId = null;
        render();
      } else {
        showAppNotification("No se pudo eliminar el gasto.", "error");
      }
    },
    "toggle-dashboard-expenses": ({ actionButton }) => {
      state.dashboard.showAllRecentExpenses =
        actionButton.getAttribute("data-value") === "show";
      render();
    },
    "toggle-detalle-expenses": ({ actionButton }) => {
      state.detalleCliente.showAllRecentExpenses =
        actionButton.getAttribute("data-value") === "show";
      render();
    },
    "open-ingreso-modal": () => {
      state.dashboard.modals.ingreso = true;
      render();
    },
    "close-ingreso-modal": () => {
      state.dashboard.modals.ingreso = false;
      render();
    },
    "open-ahorro-modal": () => {
      state.dashboard.modals.ahorro = true;
      render();
    },
    "close-ahorro-modal": () => {
      state.dashboard.modals.ahorro = false;
      render();
    },
    "open-destino-modal": ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) {
        return;
      }
      state.dashboard.ahorroDestinoId = ahorroId;
      state.dashboard.destinoForm.monto = "";
      state.dashboard.modals.destino = true;
      render();
    },
    "close-destino-modal": () => {
      state.dashboard.modals.destino = false;
      state.dashboard.ahorroDestinoId = null;
      render();
    },
    "open-edit-ahorro": ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) return;
      state.finanzas.ui.editingAhorroId = ahorroId;
      state.finanzas.ui.deletingAhorroId = null;
      render();
    },
    "close-edit-ahorro-modal": () => {
      state.finanzas.ui.editingAhorroId = null;
      render();
    },
    "save-edit-ahorro": async ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) return;

      const nombre = document.getElementById("editAhorroNombre")?.value?.trim() || "";
      const montoInicial = Number.parseFloat(document.getElementById("editAhorroMonto")?.value || "") || 0;
      const meta = Number.parseFloat(document.getElementById("editAhorroMeta")?.value || "") || 0;

      if (!nombre) {
        showAppNotification("El nombre es requerido", "warning");
        return;
      }

      if (meta > 0 && meta <= montoInicial) {
        showAppNotification("La meta debe ser mayor al monto", "warning");
        return;
      }

      try {
        await updateAhorro(ahorroId, { nombre, montoInicial, meta });
        await loadAhorros();
        state.finanzas.ui.editingAhorroId = null;
        showAppNotification("Ahorro actualizado", "success");
        render();
      } catch (error) {
        showAppNotification(error.message || "Error al actualizar el ahorro", "error");
      }
    },
    "open-delete-ahorro": ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) return;
      state.finanzas.ui.deletingAhorroId = ahorroId;
      state.finanzas.ui.editingAhorroId = null;
      render();
    },
    "close-delete-ahorro-modal": () => {
      state.finanzas.ui.deletingAhorroId = null;
      render();
    },
    "confirm-delete-ahorro": async ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) return;

      try {
        await deleteAhorro(ahorroId);
        await loadAhorros();
        state.finanzas.ui.deletingAhorroId = null;
        showAppNotification("Ahorro eliminado", "success");
        render();
      } catch (error) {
        showAppNotification(error.message || "Error al eliminar el ahorro", "error");
      }
    },
    "open-add-client-modal": ({ event }) => {
      event.preventDefault();
      openAdvisorNewClientModal();
      render();
    },
    "close-add-client-modal": ({ event }) => {
      event.preventDefault();
      closeAdvisorNewClientModal();
      render();
    },
    "submit-income-entry": async ({ event, actionButton }) => {
      event.preventDefault();

      const menu = actionButton.closest(".gd-income-entry-menu");
      if (!menu) {
        return;
      }

      const amountInput = menu.querySelector("[data-income-field='amount']");
      const detailInput = menu.querySelector("[data-income-field='detail']");

      const amount = Number.parseFloat(amountInput?.value || "");
      const detail = (detailInput?.value || "").trim();

      if (Number.isNaN(amount) || amount <= 0 || !detail) {
        showAppNotification("Completa moneda, monto y detalle para registrar el ingreso", "warning");
        return;
      }

      try {
        const response = await apiFetch("/api/incomes", {
          method: "POST",
          body: JSON.stringify({ amount, source: detail }),
        });

        if (!response.ok) {
          showAppNotification("Error al registrar el ingreso", "error");
          return;
        }

        await Promise.all([loadDashboardBalances(), loadMovimientos()]);
        showAppNotification("Ingreso registrado correctamente", "success");
        closeDashboardDropdowns();
        render();
      } catch {
        showAppNotification("Error al registrar el ingreso", "error");
      }
    },
    "desvincular-cliente": async ({ event, actionButton }) => {
      event.preventDefault();
      const clienteId = actionButton.getAttribute("data-cliente-id");
      if (!clienteId) return;

      const shouldUnlink = await showAppConfirm({
        title: "Desvincular cliente",
        message: "Esta accion quitara al cliente de tu panel de asesor.",
        confirmText: "Desvincular",
        cancelText: "Cancelar",
        danger: true,
      });

      if (!shouldUnlink) return;

      try {
        await apiDesvincularCliente(clienteId);
        state.asesor.clientes = state.asesor.clientes.filter((c) => c.id !== clienteId);
        showAppNotification("Cliente desvinculado", "success");
        render();
      } catch {
        showAppNotification("No se pudo desvincular el cliente", "error");
      }
    },
    "desvincular-asesor": async ({ event }) => {
      event.preventDefault();

      const shouldUnlink = await showAppConfirm({
        title: "Desvincular asesor",
        message: "Esta accion eliminara el asesor vinculado y su codigo de verificacion.",
        confirmText: "Desvincular",
        cancelText: "Cancelar",
        danger: true,
      });

      if (!shouldUnlink) {
        return;
      }

      state.configuracion.asesoria = {
        asesor: null,
        solicitud: {
          nombre: "",
          email: "",
          especialidad: "",
        },
      };
      saveAppPreferences();
      showAppNotification("Asesor desvinculado", "success");
      render();
    },
    "cerrar-sesion": ({ actionButton }) => {
      const sesionId = Number(actionButton.getAttribute("data-sesion-id"));
      if (!Number.isNaN(sesionId)) {
        state.configuracion.sesiones = state.configuracion.sesiones.filter(
          (sesion) => sesion.id !== sesionId,
        );
        showAppNotification("Sesion cerrada", "success");
        render();
      }
    },
  };

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a[data-link]");
    if (link) {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }

      if (href.startsWith("/cliente/") && !registerAdvisorClientSelection(href)) {
        event.preventDefault();
        showAppNotification("No tienes permiso para abrir ese cliente", "warning");
        return;
      }

      closeDashboardDropdowns();
      closeLandingMobileMenu();
      event.preventDefault();
      navigate(href);
      return;
    }

    const navButton = event.target.closest("[data-nav]");
    if (navButton) {
      const path = navButton.getAttribute("data-nav");
      if (path) {
        if (path.startsWith("/cliente/") && !registerAdvisorClientSelection(path)) {
          event.preventDefault();
          showAppNotification("No tienes permiso para abrir ese cliente", "warning");
          return;
        }

        event.preventDefault();
        closeDashboardDropdowns();
        navigate(path);
      }
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      const { menu, menuContainer } = getLandingMobileMenuElements();
      const clickedInsideTriggerGroup = menuContainer
        ? menuContainer.contains(event.target)
        : false;
      const clickedInsideMenu = menu
        ? menu.contains(event.target)
        : false;

      if (menu && !menu.hidden && !clickedInsideTriggerGroup && !clickedInsideMenu) {
        closeLandingMobileMenu();
      }

      DASHBOARD_DROPDOWN_CONFIG.forEach((config) => {
        if (!event.target.closest(config.containerSelector)) {
          closeDashboardDropdown(config);
        }
      });
      return;
    }

    const action = actionButton.getAttribute("data-action") || "";
    const actionHandler = actionHandlers[action];

    if (actionHandler) {
      await actionHandler({ event, actionButton });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.asesor.modals.nuevoCliente) {
        closeAdvisorNewClientModal();
        render();
        return;
      }

      closeLandingMobileMenu({ restoreFocus: true });
      closeDashboardDropdowns();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) {
      closeLandingMobileMenu();
    }

    closeDashboardDropdowns();
  });

  window.addEventListener("popstate", () => {
    closeLandingMobileMenu();
    closeDashboardDropdowns();
    render();
  });
}
