import { state } from "../../state";
import { t } from "../../i18n";
import { getCurrentDateShort } from "../../utils/date";
import { showAppNotification } from "../../ui/notifications";
import { apiCreateMovimiento } from "../../api/movimientos";
import { loadDashboardBalances } from "../../api/user";
import { addSavingsGoalRecord } from "../../data/expenses";

export function attachDashboardFormHandlers(pathname, { render }) {
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
        showAppNotification(t('forms.couldNotSaveExpenseShort'), "error");
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
        showAppNotification(t('forms.couldNotRegisterIncome'), "error");
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
        showAppNotification(t('forms.completeSavingName'), "warning");
        return;
      }

      dashboard.nuevoAhorroForm = { nombre: "", montoInicial: "", meta: "" };
      dashboard.modals.ahorro = false;
      showAppNotification(t('forms.savingCreated'), "success");
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
}
