import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";

export function renderPreferenciaNotificacionesPageView({
  state,
  profileImage,
  profileName,
}) {
  const toggles = [
    {
      id: "resumenSemanal",
      label: "Resumen semanal",
      description: "Recibe un resumen con tu comportamiento de gastos cada semana.",
    },
    {
      id: "alertaPago",
      label: "Alerta de pagos",
      description: "Notifica vencimientos y pagos pendientes importantes.",
    },
    {
      id: "alertaPresupuesto",
      label: "Alerta de presupuesto",
      description: "Avisa cuando estes por superar tu presupuesto mensual.",
    },
    {
      id: "movimientosGrandes",
      label: "Movimientos grandes",
      description: "Detecta consumos fuera de lo habitual y te avisa al instante.",
    },
    {
      id: "recomendacionesIA",
      label: "Recomendaciones IA",
      description: "Sugerencias personalizadas para mejorar tus finanzas.",
    },
  ];

  const content = `
    <article class="gd-card">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <div>
          <h2 class="gd-card-title mb-1">Preferencias de notificaciones</h2>
          <p class="gd-muted mb-0">Elige que alertas quieres recibir en tu panel.</p>
        </div>
        <button type="button" class="gd-btn-primary" id="guardarPreferenciasBtn">Guardar preferencias</button>
      </div>

      <div class="d-flex flex-column gap-2">
        ${toggles
          .map(
            (item) => `
              <label class="d-flex align-items-start justify-content-between gap-3 border rounded-3 px-3 py-2" style="border-color: var(--gd-border) !important; cursor: pointer;">
                <div>
                  <p class="gd-card-title mb-0" style="font-size: 0.75rem;">${item.label}</p>
                  <small class="gd-muted">${item.description}</small>
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
    pageTitle: "Notificaciones",
    pageSubtitle: "Controla como y cuando recibir alertas",
    content,
    profileImage,
    profileName,
    notificationCount: state.finanzas?.recomendaciones?.length || 0,
  });
}
