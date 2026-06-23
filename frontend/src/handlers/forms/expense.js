import { state } from "../../state";
import { t } from "../../i18n";
import { getMonthKeyFromDate } from "../../utils/date";
import { showAppNotification } from "../../ui/notifications";
import { addExpenseRecord, addIncomeRecord } from "../../data/expenses";
import { apiFetch } from "../../api/client";
import { initDatePicker } from "../../ui/datepicker";
import { applyHistoricalRecommendationFilters } from "../../data/csv";

export function attachExpenseFormHandlers(pathname, { navigate, render }) {
  if (pathname === "/dashboard/cargar") {
    initDatePicker(document.getElementById("expenseFecha"));
    initDatePicker(document.getElementById("incomeFecha"));

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
      const files = Array.from(event.target.files || []);
      if (files.length === 0) {
        return;
      }

      if (files.length === 1) {
        // Single-file flow (unchanged behaviour)
        const file = files[0];
        state.finanzas.cargar.ticketFileName = file.name;
        state.finanzas.cargar.ocrLoading = true;
        state.finanzas.cargar.batchMode = false;
        state.finanzas.cargar.batchTickets = [];
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
          showAppNotification(t('forms.couldNotAnalyzeTicket'), "warn");
        } finally {
          state.finanzas.cargar.ocrLoading = false;
          render();
        }
      } else {
        // Multi-file batch flow
        state.finanzas.cargar.batchMode = true;
        state.finanzas.cargar.batchTickets = files.map((file) => ({
          fileName: file.name,
          status: "loading",
          data: {},
          error: "",
        }));
        render();

        try {
          const formData = new FormData();
          files.forEach((file) => formData.append("tickets", file));

          const response = await apiFetch("/api/ticket-ocr/analyze-batch", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Error ${response.status}`);
          }

          const results = await response.json();
          results.forEach((result) => {
            const entry = state.finanzas.cargar.batchTickets[result.index];
            if (!entry) return;
            if (result.status === "ok") {
              entry.status = "ok";
              entry.data = result.data || {};
            } else {
              entry.status = "error";
              entry.error = result.error || t('cargar.ticketParseError');
            }
          });
        } catch {
          // Mark all still-loading entries as errored
          state.finanzas.cargar.batchTickets.forEach((entry) => {
            if (entry.status === "loading") {
              entry.status = "error";
              entry.error = t('forms.serverConnectionError');
            }
          });
          showAppNotification(t('forms.couldNotAnalyzeTickets'), "warn");
        } finally {
          render();
        }
      }
    });

    expenseForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(expenseForm);

      const tagIds = [...(state.finanzas.cargar.form.selectedTagIds || [])];

      const payload = {
        comercio: (formData.get("comercio") || "").toString().trim(),
        fecha: (formData.get("fecha") || "").toString(),
        monto: (formData.get("monto") || "").toString(),
        categoria: (formData.get("categoria") || "").toString(),
        descripcion: (formData.get("descripcion") || "").toString().trim(),
        tagIds,
      };

      state.finanzas.cargar.form = { ...payload, selectedTagIds: tagIds };

      const submitBtn = expenseForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const saved = await addExpenseRecord(payload);

      if (submitBtn) submitBtn.disabled = false;

      if (!saved) {
        showAppNotification(t('forms.couldNotSaveExpense'), "error");
        return;
      }

      const hasTicket = Boolean(state.finanzas.cargar.ticketFileName);

      state.finanzas.cargar.form = {
        comercio: "",
        fecha: payload.fecha,
        monto: "",
        categoria: "",
        descripcion: "",
        selectedTagIds: [],
      };

      if (hasTicket) {
        state.finanzas.cargar.ticketFileName = "";
        showAppNotification(t('forms.expenseSaved'), "success");
        render();
      } else {
        const periodKey = getMonthKeyFromDate(payload.fecha);
        state.finanzas.filtros.periodo = periodKey || "todos";
        state.finanzas.filtros.search = "";
        state.finanzas.filtros.categoria = "Todas";
        state.finanzas.filtros.tipo = "Todos";
        navigate("/dashboard/gastos");
      }
    });

    const incomeCategorySelect = document.getElementById("incomeCategoria");

    const syncIncomeCategoryVisibility = (value) => {
      const wrap = document.querySelector("[data-new-category-wrap='income']");
      if (!wrap) return;
      wrap.classList.toggle("d-none", value !== "__new_category__");
    };

    syncIncomeCategoryVisibility(incomeCategorySelect?.value || "");

    incomeCategorySelect?.addEventListener("change", (event) => {
      const value = event.target.value || "";
      state.finanzas.cargar.ingresoForm.categoria = value;
      syncIncomeCategoryVisibility(value);
    });

    const incomeForm = document.getElementById("incomeForm");
    incomeForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(incomeForm);

      const payload = {
        fecha: (formData.get("fecha") || "").toString(),
        monto: (formData.get("monto") || "").toString(),
        categoria: (formData.get("categoria") || "").toString(),
        descripcion: (formData.get("descripcion") || "").toString().trim(),
      };

      state.finanzas.cargar.ingresoForm = payload;

      const submitBtn = incomeForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const saved = await addIncomeRecord(payload);

      if (submitBtn) submitBtn.disabled = false;

      if (!saved) {
        showAppNotification(t('forms.couldNotSaveIncome'), "error");
        return;
      }

      const periodKey = getMonthKeyFromDate(payload.fecha);
      state.finanzas.filtros.periodo = periodKey || "todos";
      state.finanzas.filtros.search = "";
      state.finanzas.filtros.categoria = "Todas";
      state.finanzas.filtros.tipo = "Todos";
      state.finanzas.cargar.ingresoForm = {
        fecha: payload.fecha,
        monto: "",
        categoria: "",
        descripcion: "",
      };
      navigate("/dashboard/gastos");
    });
  }

  if (pathname === "/dashboard/gastos") {
    initDatePicker(document.getElementById("expenseFechaDesde"));
    initDatePicker(document.getElementById("expenseFechaHasta"));
    initDatePicker(document.getElementById("editExpenseFecha"));

    const searchInput = document.getElementById("expenseSearchInput");
    const typeFilter = document.getElementById("expenseTypeFilter");
    const fechaDesdeInput = document.getElementById("expenseFechaDesde");
    const fechaHastaInput = document.getElementById("expenseFechaHasta");

    searchInput?.addEventListener("input", (event) => {
      state.finanzas.filtros.search = event.target.value;
      render();
    });

    typeFilter?.addEventListener("change", (event) => {
      state.finanzas.filtros.tipo = event.target.value;
      render();
    });

    fechaDesdeInput?.addEventListener("change", (event) => {
      state.finanzas.filtros.fechaDesde = event.target.value;
      state.finanzas.filtros.periodo = "";
      render();
    });

    fechaHastaInput?.addEventListener("change", (event) => {
      state.finanzas.filtros.fechaHasta = event.target.value;
      state.finanzas.filtros.periodo = "";
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
}
