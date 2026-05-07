import { renderRecomendacionesHistoricasPage as renderRecomendacionesHistoricasPageView } from "./RecomendacionesHistoricasPage";

function buildRecHistoricasClienteSidebarSections({ clienteId }) {
  const detalleHref = `/cliente/${encodeURIComponent(String(clienteId))}`;
  const recomendacionesHref = `${detalleHref}/recomendaciones/historicas`;
  const gastosHref = `${detalleHref}/gastos`;

  return [
    {
      section: "Principal",
      items: [
        {
          href: "/dashboard",
          label: "Mi Dashboard",
          icon: "lni lni-grid-alt",
        },
        {
          href: detalleHref,
          label: "Dashboard Cliente",
          icon: "lni lni-user",
        },
      ],
    },
    {
      section: "Analisis",
      items: [
        {
          href: recomendacionesHref,
          label: "Recomendaciones historicas",
          icon: "lni lni-bulb",
        },
      ],
    },
    {
      section: "Asesor",
      items: [
        {
          href: "/dashboard/asesor",
          label: "Dashboard asesor",
          icon: "lni lni-grid-alt",
        },
        {
          href: gastosHref,
          label: "Movimientos cliente",
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
    pageTitle: `Recomendaciones historicas de ${clienteNombre}`,
    pageSubtitle: "Todas las recomendaciones enviadas a este cliente",
    recomendaciones,
    sidebarSections: buildRecHistoricasClienteSidebarSections({ clienteId }),
    notificationCount: recomendaciones.length,
  });
}

export default renderRecHistoricasClientePage;