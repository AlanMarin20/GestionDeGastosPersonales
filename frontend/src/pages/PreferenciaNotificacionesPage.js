import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { t } from "../i18n";

export function renderPreferenciaNotificacionesPageView({
  state,
  profileImage,
  profileName,
  isAsesor = false,
}) {
  const toggles = [
    {
      id: "resumenSemanal",
      labelKey: 'prefNotif.weeklySummary',
      descKey: 'prefNotif.weeklySummaryDesc',
    },
    {
      id: "alertaPago",
      labelKey: 'prefNotif.paymentAlert',
      descKey: 'prefNotif.paymentAlertDesc',
    },
    {
      id: "alertaPresupuesto",
      labelKey: 'prefNotif.budgetAlert',
      descKey: 'prefNotif.budgetAlertDesc',
    },
    {
      id: "movimientosGrandes",
      labelKey: 'prefNotif.largeMovements',
      descKey: 'prefNotif.largeMovementsDesc',
    },
    {
      id: "recomendacionesIA",
      labelKey: 'prefNotif.aiRecommendations',
      descKey: 'prefNotif.aiRecommendationsDesc',
    },
  ];

  const content = `
    <article class="gd-card">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <div>
          <h2 class="gd-card-title mb-1">${t('prefNotif.title')}</h2>
          <p class="gd-muted mb-0">${t('prefNotif.subtitle')}</p>
        </div>
        <button type="button" class="gd-btn-primary" id="guardarPreferenciasBtn">${t('prefNotif.savePreferences')}</button>
      </div>

      <div class="d-flex flex-column gap-2">
        ${toggles
          .map(
            (item) => `
              <label class="gd-settings-toggle-row gd-settings-toggle-row-start gd-notification-toggle-row">
                <div>
                  <p class="gd-card-title gd-card-title-xs mb-0">${t(item.labelKey)}</p>
                  <small class="gd-muted">${t(item.descKey)}</small>
                </div>
                <input class="form-check-input mt-1" type="checkbox" id="${item.id}" ${state.notificaciones[item.id] ? "checked" : ""}>
              </label>
            `,
          )
          .join("")}
      </div>
    </article>
  `;

  return renderDashboardAppLayout({
    activePath: "/perfil/notificaciones",
    pageTitle: t('prefNotif.pageTitle'),
    pageSubtitle: t('prefNotif.pageSubtitle'),
    content,
    profileImage,
    profileName,
    isAsesor,
    notificationCount: state.finanzas?.recomendaciones?.length || 0,
  });
}
