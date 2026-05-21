import { state } from "../../state";
import { t } from "../../i18n";
import { showAppNotification } from "../../ui/notifications";
import { saveAppPreferences } from "../../ui/theme";
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
    const btnGenerar = document.getElementById("btnGenerarRecomendacionesIA");
    btnGenerar?.addEventListener("click", async () => {
      btnGenerar.disabled = true;
      const originalHtml = btnGenerar.innerHTML;
      btnGenerar.innerHTML = `<i class="lni lni-spinner-arrow" aria-hidden="true"></i> ${t('forms.analyzing')}`;

      try {
        await generateAiRecommendations();
        showAppNotification(t('forms.recommendationsGenerated'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.errorGeneratingRecommendations'), "error");
      } finally {
        btnGenerar.disabled = false;
        btnGenerar.innerHTML = originalHtml;
      }
    });
  }
}
