import { renderRecomendacionesHistoricasPage as renderRecomendacionesHistoricasPageView } from "./RecomendacionesHistoricasPage";
import { t } from '../i18n';

function buildRecHistoricasClienteSidebarSections({ clienteId }) {
  const detalleHref = `/cliente/${encodeURIComponent(String(clienteId))}`;
  const recomendacionesHref = `${detalleHref}/recomendaciones/historicas`;
  const gastosHref = `${detalleHref}/gastos`;

  return [
    {
      section: t('nav.section.main'),
      items: [
        {
          href: "/dashboard",
          label: t('nav.myDashboard'),
          icon: "lni lni-grid-alt",
        },
        {
          href: detalleHref,
          label: t('nav.clientDashboard'),
          icon: "lni lni-user",
        },
      ],
    },
    {
      section: t('nav.section.analysis'),
      items: [
        {
          href: recomendacionesHref,
          label: t('nav.historicalRecommendations'),
          icon: "lni lni-bulb",
        },
      ],
    },
    {
      section: t('nav.section.advisor'),
      items: [
        {
          href: "/dashboard/asesor",
          label: t('nav.advisorDashboard'),
          icon: "lni lni-grid-alt",
        },
        {
          href: gastosHref,
          label: t('nav.clientMovements'),
          icon: "lni lni-list",
        },
      ],
    },
  ];
}

export function renderRecHistoricasClientePage({
  clienteId,
  clienteNombre,
  recomendaciones = [],
  profileImage,
  profileName,
  activePath,
}) {
  return renderRecomendacionesHistoricasPageView({
    profileImage,
    profileName,
    activePath,
    pageTitle: t('recHist.clientTitle', { name: clienteNombre }),
    pageSubtitle: t('recHist.clientSubtitle'),
    recomendaciones,
    sidebarSections: buildRecHistoricasClienteSidebarSections({ clienteId }),
    notificationCount: recomendaciones.length,
  });
}

export default renderRecHistoricasClientePage;
