import { state } from "../../state";
import { t } from "../../i18n";
import { showAppNotification } from "../../ui/notifications";
import { createAhorro, loadAhorros } from "../../api/ahorros";

export function attachSavingsFormHandlers(pathname, { render }) {
  if (pathname === "/dashboard/ahorros") {
    const ahorroForm = document.getElementById("detalleAhorroForm");
    ahorroForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = (document.getElementById("detalleAhorroNombre")?.value || "").trim();
      const montoInicial = Number.parseFloat(document.getElementById("detalleAhorroMonto")?.value || "") || 0;
      const meta = Number.parseFloat(document.getElementById("detalleAhorroMeta")?.value || "") || 0;

      if (!nombre) {
        showAppNotification(t('forms.completeSavingName'), "warning");
        return;
      }

      if (meta > 0 && meta <= montoInicial) {
        showAppNotification(t('forms.goalMustBeGreaterInitial'), "warning");
        return;
      }

      const disponible = state.finanzas.balancesData?.disponible ?? 0;
      if (montoInicial > 0 && montoInicial > disponible) {
        showAppNotification(t('forms.initialAmountExceeds', { amount: disponible.toFixed(2) }), "warning");
        return;
      }

      try {
        await createAhorro({ nombre, montoInicial, meta });
        await loadAhorros();
        showAppNotification(t('forms.newSavingAdded'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.errorCreatingSaving'), "error");
      }
    });
  }
}
