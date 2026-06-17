import { state } from "../../state";
import { t } from "../../i18n";
import { showAppNotification } from "../../ui/notifications";
import { createAhorro, loadAhorros } from "../../api/ahorros";

export function attachSavingsFormHandlers(pathname, { render }) {
  if (pathname === "/dashboard/ahorros") {
    const ahorroForm = document.getElementById("detalleAhorroForm");
    const nombreInput = document.getElementById("detalleAhorroNombre");

    if (ahorroForm) {
      ahorroForm.setAttribute("novalidate", "true");
    }

    // Limpiar mensaje de error al escribir
    nombreInput?.addEventListener("input", () => {
      nombreInput.classList.remove("auth-input-error");
      const errorMsg = nombreInput.parentNode?.querySelector(".gd-field-error-message");
      if (errorMsg) {
        errorMsg.remove();
      }
    });

    ahorroForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = (nombreInput?.value || "").trim();
      const montoInicial = Number.parseFloat(document.getElementById("detalleAhorroMonto")?.value || "") || 0;
      const meta = Number.parseFloat(document.getElementById("detalleAhorroMeta")?.value || "") || 0;

      // Limpiar errores previos si los hubiera
      nombreInput?.classList.remove("auth-input-error");
      const existingError = nombreInput?.parentNode?.querySelector(".gd-field-error-message");
      if (existingError) {
        existingError.remove();
      }

      if (!nombre) {
        if (nombreInput) {
          nombreInput.classList.add("auth-input-error");
          
          const errorMsg = document.createElement("div");
          errorMsg.className = "gd-field-error-message";
          errorMsg.innerHTML = `<i class="lni lni-warning" aria-hidden="true"></i><span>${t('forms.completeSavingName') || "Completa este campo"}</span>`;
          
          nombreInput.parentNode?.appendChild(errorMsg);
          nombreInput.focus();
        }
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
