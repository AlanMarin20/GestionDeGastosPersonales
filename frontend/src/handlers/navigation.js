import { state } from "../state";
import { t } from "../i18n";
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

import { addExpenseRecord, updateExpenseRecord, deleteExpenseRecord } from "../data/expenses";
import {
  openAdvisorNewClientModal,
  closeAdvisorNewClientModal,
  registerAdvisorClientSelection,
} from "../data/advisor";
import { apiFetch } from "../api/client";
import { loadDashboardBalances, loadMovimientos } from "../api/user";
import { loadAhorros, updateAhorro, deleteAhorro, depositarAhorro, retirarAhorro } from "../api/ahorros";
import { apiDesvincularCliente, loadAsesorClientes, activateAdvisor } from "../api/asesor";
import { loadBudgets, deleteBudget, createBudget, updateBudget } from "../api/budgets";
import { loadCategories, deleteCategory } from "../api/categories";
import { createTag } from "../api/tags";
import { parseMonthKey, compareMonthKeys } from "../utils/date";
import { getFinanzasCurrentPeriod } from "../data/finanzas";

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
        showAppNotification(t('forms.writeCategoryName'), "warning");
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

      showAppNotification(t('forms.categorySaved'), "success");
      render();
    },
    "save-new-income-category": ({ event }) => {
      event.preventDefault();

      const input = document.getElementById("incomeNuevaCategoria");
      const select = document.getElementById("incomeCategoria");
      const newCategory = (input?.value || "").trim();

      if (!newCategory) {
        showAppNotification(t('forms.writeCategoryName'), "warning");
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

      showAppNotification(t('forms.categorySaved'), "success");
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
    "save-batch-ticket": async ({ event, actionButton }) => {
      event.preventDefault();
      const indexStr = actionButton.getAttribute("data-batch-index");
      const index = Number(indexStr);
      if (Number.isNaN(index)) return;

      const ticket = state.finanzas.cargar.batchTickets[index];
      if (!ticket || ticket.status !== "ok") return;

      // Read live form values from the DOM card
      const card = document.querySelector(`[data-batch-card="${index}"]`);
      const payload = {
        comercio: (card?.querySelector(`#batchComercio${index}`)?.value || ticket.data.comercio || "").toString().trim(),
        fecha: (card?.querySelector(`#batchFecha${index}`)?.value || ticket.data.fecha || "").toString(),
        monto: (card?.querySelector(`#batchMonto${index}`)?.value || ticket.data.monto || "").toString(),
        categoria: (card?.querySelector(`#batchCategoria${index}`)?.value || ticket.data.categoria || "").toString(),
        descripcion: (card?.querySelector(`#batchDescripcion${index}`)?.value || ticket.data.descripcion || "").toString().trim(),
      };

      actionButton.disabled = true;

      const saved = await addExpenseRecord(payload);

      actionButton.disabled = false;

      if (!saved) {
        showAppNotification(t('forms.couldNotSaveExpense'), "error");
        return;
      }

      state.finanzas.cargar.batchTickets.splice(index, 1);

      if (state.finanzas.cargar.batchTickets.length === 0) {
        state.finanzas.cargar.batchMode = false;
        state.finanzas.cargar.ticketFileName = "";
      }

      render();
    },
    "fill-batch-ticket-manually": ({ event, actionButton }) => {
      event.preventDefault();
      const indexStr = actionButton.getAttribute("data-batch-index");
      const index = Number(indexStr);
      if (Number.isNaN(index)) return;

      const ticket = state.finanzas.cargar.batchTickets[index];
      if (!ticket) return;

      const d = ticket.data || {};
      state.finanzas.cargar.form = {
        comercio: d.comercio || "",
        fecha: d.fecha || "",
        monto: d.monto || "",
        categoria: d.categoria || "",
        descripcion: d.descripcion || "",
      };
      state.finanzas.cargar.batchMode = false;
      state.finanzas.cargar.batchTickets = [];
      state.finanzas.cargar.ticketFileName = ticket.fileName;
      render();
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

      const currentExpense = state.finanzas.gastos.find((e) => e.id === expenseId);
      const isIngreso = currentExpense?.tipo === "ingreso";

      const comercio = isIngreso
        ? undefined
        : (document.getElementById("editExpenseComercio")?.value?.trim() || "");
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
        showAppNotification(t('forms.couldNotUpdateExpense'), "error");
        return;
      }

      state.finanzas.ui.editingExpenseId = null;
      loadDashboardBalances().finally(() => render());
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
        loadDashboardBalances().finally(() => render());
      } else {
        showAppNotification(t('forms.couldNotDeleteExpense'), "error");
      }
    },
    "clear-date-filter": ({ event }) => {
      event.preventDefault();
      state.finanzas.filtros.fechaDesde = "";
      state.finanzas.filtros.fechaHasta = "";
      render();
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
        showAppNotification(t('forms.nameRequired'), "warning");
        return;
      }

      if (meta > 0 && meta <= montoInicial) {
        showAppNotification(t('forms.goalMustBeGreater'), "warning");
        return;
      }

      try {
        await updateAhorro(ahorroId, { nombre, montoInicial, meta });
        await loadAhorros();
        state.finanzas.ui.editingAhorroId = null;
        showAppNotification(t('forms.savingUpdated'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.errorUpdatingSaving'), "error");
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
        await Promise.all([loadAhorros(), loadDashboardBalances(), loadMovimientos()]);
        state.finanzas.ui.deletingAhorroId = null;
        showAppNotification(t('forms.savingDeleted'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.errorDeletingSaving'), "error");
      }
    },
    "open-depositar-ahorro": ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) return;
      state.finanzas.ui.depositandoAhorroId = ahorroId;
      state.finanzas.ui.retirhandoAhorroId = null;
      render();
    },
    "close-depositar-ahorro-modal": () => {
      state.finanzas.ui.depositandoAhorroId = null;
      render();
    },
    "confirm-depositar-ahorro": async ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) return;

      const amount = Number.parseFloat(document.getElementById("depositarMonto")?.value || "");
      const description = (document.getElementById("depositarDescripcion")?.value || "").trim() || undefined;

      if (Number.isNaN(amount) || amount <= 0) {
        showAppNotification(t('forms.enterValidAmount'), "error");
        return;
      }

      try {
        await depositarAhorro(ahorroId, amount, description);
        await Promise.all([loadAhorros(), loadDashboardBalances(), loadMovimientos()]);
        state.finanzas.ui.depositandoAhorroId = null;
        showAppNotification(t('forms.depositDone'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.errorDepositing'), "error");
      }
    },
    "open-retirar-ahorro": ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) return;
      state.finanzas.ui.retirhandoAhorroId = ahorroId;
      state.finanzas.ui.depositandoAhorroId = null;
      render();
    },
    "close-retirar-ahorro-modal": () => {
      state.finanzas.ui.retirhandoAhorroId = null;
      render();
    },
    "confirm-retirar-ahorro": async ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) return;

      const amount = Number.parseFloat(document.getElementById("retirarMonto")?.value || "");
      const description = (document.getElementById("retirarDescripcion")?.value || "").trim() || undefined;

      if (Number.isNaN(amount) || amount <= 0) {
        showAppNotification(t('forms.enterValidAmount'), "error");
        return;
      }

      try {
        await retirarAhorro(ahorroId, amount, description);
        await Promise.all([loadAhorros(), loadDashboardBalances(), loadMovimientos()]);
        state.finanzas.ui.retirhandoAhorroId = null;
        showAppNotification(t('forms.withdrawDone'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.errorWithdrawing'), "error");
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
        showAppNotification(t('forms.completeIncomeFields'), "warning");
        return;
      }

      try {
        const response = await apiFetch("/api/incomes", {
          method: "POST",
          body: JSON.stringify({ amount, source: detail }),
        });

        if (!response.ok) {
          showAppNotification(t('forms.errorRegisteringIncome'), "error");
          return;
        }

        await Promise.all([loadDashboardBalances(), loadMovimientos()]);
        showAppNotification(t('forms.incomeRegistered'), "success");
        closeDashboardDropdowns();
        render();
      } catch {
        showAppNotification(t('forms.errorRegisteringIncome'), "error");
      }
    },
    "desvincular-cliente": async ({ event, actionButton }) => {
      event.preventDefault();
      const clienteId = actionButton.getAttribute("data-cliente-id");
      if (!clienteId) return;

      const shouldUnlink = await showAppConfirm({
        title: t('forms.unlinkClientTitle'),
        message: t('forms.unlinkClientMsg'),
        confirmText: t('forms.unlink'),
        cancelText: t('forms.cancel'),
        danger: true,
      });

      if (!shouldUnlink) return;

      try {
        await apiDesvincularCliente(clienteId);
        state.asesor.clientes = state.asesor.clientes.filter((c) => c.id !== clienteId);
        showAppNotification(t('forms.clientUnlinked'), "success");
        render();
      } catch {
        showAppNotification(t('forms.couldNotUnlinkClient'), "error");
      }
    },
    "delete-budget": async ({ event, actionButton }) => {
      event.preventDefault();
      const budgetId = actionButton.getAttribute("data-budget-id");
      if (!budgetId) return;

      const ok = await showAppConfirm({
        title: t('forms.deleteBudgetTitle'),
        message: t('forms.deleteBudgetMsg'),
        confirmText: t('forms.delete'),
        cancelText: t('forms.cancel'),
        danger: true,
      });
      if (!ok) return;

      try {
        await deleteBudget(budgetId);
        await loadBudgets();
        showAppNotification(t('forms.budgetDeleted'), "success");
        render();
      } catch {
        showAppNotification(t('forms.couldNotDeleteBudget'), "error");
      }
    },
    "budget-prev-month": ({ event }) => {
      event.preventDefault();
      const current = state.finanzas.ui.budgetViewPeriod || getFinanzasCurrentPeriod();
      const { year, month } = parseMonthKey(current);
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      state.finanzas.ui.budgetViewPeriod = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
      state.finanzas.ui.editingBudgetId = null;
      render();
    },
    "budget-next-month": ({ event }) => {
      event.preventDefault();
      const current = state.finanzas.ui.budgetViewPeriod || getFinanzasCurrentPeriod();
      const globalPeriod = getFinanzasCurrentPeriod();
      if (compareMonthKeys(current, globalPeriod) >= 0) return;
      const { year, month } = parseMonthKey(current);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      state.finanzas.ui.budgetViewPeriod = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
      state.finanzas.ui.editingBudgetId = null;
      render();
    },
    "edit-budget": ({ event, actionButton }) => {
      event.preventDefault();
      const budgetId = actionButton.getAttribute("data-budget-id");
      if (!budgetId) return;
      state.finanzas.ui.editingBudgetId = budgetId;
      render();
    },
    "cancel-budget-edit": ({ event }) => {
      event.preventDefault();
      state.finanzas.ui.editingBudgetId = null;
      render();
    },
    "save-budget-edit": async ({ event, actionButton }) => {
      event.preventDefault();
      const budgetId = actionButton.getAttribute("data-budget-id");
      if (!budgetId) return;
      const input = document.getElementById(`editBudgetInput-${budgetId}`);
      const amountLimit = Number.parseFloat(input?.value || "");
      if (Number.isNaN(amountLimit) || amountLimit <= 0) {
        showAppNotification(t('forms.enterValidLimit'), "warning");
        return;
      }
      actionButton.disabled = true;
      try {
        await updateBudget(budgetId, { amountLimit });
        await loadBudgets();
        state.finanzas.ui.editingBudgetId = null;
        showAppNotification(t('forms.budgetUpdated'), "success");
        render();
      } catch (err) {
        showAppNotification(err?.message || t('forms.couldNotUpdateBudget'), "error");
      } finally {
        actionButton.disabled = false;
      }
    },
    "copy-budgets-from-prev": async ({ event, actionButton }) => {
      event.preventDefault();
      const prevPeriod = actionButton.getAttribute("data-prev-period");
      if (!prevPeriod) return;
      const { year: prevY, month: prevM } = parseMonthKey(prevPeriod);
      const prevBudgets = (state.finanzas.budgets || []).filter(
        (b) => b.month === prevM && b.year === prevY
      );
      if (prevBudgets.length === 0) return;

      const targetPeriod = state.finanzas.ui.budgetViewPeriod || getFinanzasCurrentPeriod();
      const { year: tY, month: tM } = parseMonthKey(targetPeriod);

      actionButton.disabled = true;
      try {
        const results = await Promise.allSettled(
          prevBudgets.map((b) =>
            createBudget({
              categoryId: b.categoryId,
              amountLimit: b.amountLimit,
              month: tM,
              year: tY,
            })
          )
        );
        const succeeded = results.filter((r) => r.status === "fulfilled").length;
        await loadBudgets();
        showAppNotification(
          succeeded !== 1
            ? t('forms.budgetsCopied', { count: succeeded })
            : t('forms.budgetsCopiedOne', { count: succeeded }),
          succeeded > 0 ? "success" : "error"
        );
        render();
      } catch {
        showAppNotification(t('forms.couldNotCopyBudgets'), "error");
      } finally {
        actionButton.disabled = false;
      }
    },
    "delete-category": async ({ event, actionButton }) => {
      event.preventDefault();
      const categoryId = actionButton.getAttribute("data-category-id");
      if (!categoryId) return;

      const ok = await showAppConfirm({
        title: t('forms.deleteCategoryTitle'),
        message: t('forms.deleteCategoryMsg'),
        confirmText: t('forms.delete'),
        cancelText: t('forms.cancel'),
        danger: true,
      });
      if (!ok) return;

      try {
        await deleteCategory(Number(categoryId));
        await loadCategories();
        showAppNotification(t('forms.categoryDeleted'), "success");
        render();
      } catch (err) {
        showAppNotification(err?.message || t('forms.couldNotDeleteCategory'), "error");
      }
    },
    "export-gastos-csv": ({ event }) => {
      event.preventDefault();
      exportFilteredExpensesAsCsv();
    },
    "borrar-historial": async ({ event }) => {
      event.preventDefault();
      const ok = await showAppConfirm({
        title: t('forms.deleteHistoryTitle'),
        message: t('forms.deleteHistoryMsg'),
        confirmText: t('forms.deleteAll'),
        cancelText: t('forms.cancel'),
        danger: true,
      });
      if (!ok) return;

      try {
        const gastos = [...(state.finanzas.gastos || [])];
        await Promise.all(gastos.map((g) => apiFetch(`/api/movimientos/${g.id}`, { method: "DELETE" }).catch(() => {})));
        await Promise.all([loadMovimientos(), loadDashboardBalances()]);
        showAppNotification(t('forms.historyDeleted'), "success");
        render();
      } catch {
        showAppNotification(t('forms.errorDeletingHistory'), "error");
      }
    },
    "eliminar-cuenta": async ({ event }) => {
      event.preventDefault();
      const ok = await showAppConfirm({
        title: t('forms.deleteAccountTitle'),
        message: t('forms.deleteAccountMsg'),
        confirmText: t('forms.deleteMyAccount'),
        cancelText: t('forms.cancel'),
        danger: true,
      });
      if (!ok) return;

      const userId = state.currentUser?.id;
      if (!userId) {
        showAppNotification(t('forms.couldNotIdentifyAccount'), "error");
        return;
      }

      try {
        await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        state.currentUser = null;
        state.profileLoaded = true;
        showAppNotification(t('forms.accountDeleted'), "info");
        navigate("/login", true);
      } catch {
        showAppNotification(t('forms.couldNotDeleteAccount'), "error");
      }
    },
    "desvincular-asesor": async ({ event }) => {
      event.preventDefault();

      const shouldUnlink = await showAppConfirm({
        title: t('forms.unlinkAdvisorTitle'),
        message: t('forms.unlinkAdvisorMsg'),
        confirmText: t('forms.unlink'),
        cancelText: t('forms.cancel'),
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
      showAppNotification(t('forms.advisorUnlinked'), "success");
      render();
    },
    "cerrar-sesion": ({ actionButton }) => {
      const sesionId = Number(actionButton.getAttribute("data-sesion-id"));
      if (!Number.isNaN(sesionId)) {
        state.configuracion.sesiones = state.configuracion.sesiones.filter(
          (sesion) => sesion.id !== sesionId,
        );
        showAppNotification(t('forms.sessionClosed'), "success");
        render();
      }
    },
    "toggle-expense-tag": ({ event, actionButton }) => {
      event.preventDefault();
      const tagId = actionButton.getAttribute("data-tag-id");
      if (!tagId) return;
      const selected = state.finanzas.cargar.form.selectedTagIds;
      const idx = selected.indexOf(tagId);
      if (idx === -1) selected.push(tagId);
      else selected.splice(idx, 1);
      render();
    },
    "show-new-tag-input": ({ event }) => {
      event.preventDefault();
      const wrap = document.getElementById("newTagInputWrap");
      if (wrap) wrap.classList.remove("d-none");
    },
    "hide-new-tag-input": ({ event }) => {
      event.preventDefault();
      const wrap = document.getElementById("newTagInputWrap");
      if (wrap) wrap.classList.add("d-none");
      const input = document.getElementById("newTagNameInput");
      if (input) input.value = "";
    },
    "create-and-select-tag": async ({ event }) => {
      event.preventDefault();
      const nombre = (document.getElementById("newTagNameInput")?.value || "").trim();
      if (!nombre) {
        showAppNotification(t('forms.writeTagName'), "warning");
        return;
      }
      try {
        const tag = await createTag(nombre);
        if (!Array.isArray(state.finanzas.cargar.form.selectedTagIds)) {
          state.finanzas.cargar.form.selectedTagIds = [];
        }
        state.finanzas.cargar.form.selectedTagIds.push(tag.id);
        render();
      } catch (err) {
        showAppNotification(err?.message || t('forms.couldNotCreateTag'), "error");
      }
    },
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
        showAppNotification(t('forms.couldNotOpenClient'), "warning");
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
          showAppNotification(t('forms.couldNotOpenClient'), "warning");
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
