import { state } from "../../state";
import { t } from "../../i18n";
import { showAppNotification } from "../../ui/notifications";
import { generateAiRecommendations } from "../../api/recomendaciones";

export function attachNotificationFormHandlers(pathname, { render }) {
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
      showAppNotification(t('forms.preferencesUpdated'), "success");
    });
  }

  if (pathname === "/dashboard/recomendaciones") {
    const monthFilter = document.getElementById("recMonthFilterSelect");
    monthFilter?.addEventListener("change", (event) => {
      state.finanzas.recomendacionesFiltroMesKey = event.target.value || "all";
      render();
    });
  }
}
