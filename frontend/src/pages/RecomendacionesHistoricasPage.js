import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";

export function renderRecomendacionesHistoricasPage({
  pathname,
  profileImage,
  profileName,
}) {
  return renderDashboardAppLayout({
    activePath: pathname,
    pageTitle: "Página en construcción",
    pageSubtitle: "Pendiente de actualización",
    content: `
      <div style="
        background-color: #fff3cd; 
        color: #856404; 
        padding: 2rem; 
        border: 1px solid #ffeeba; 
        border-radius: 8px; 
        text-align: center; 
        margin-top: 2rem;
        font-weight: bold;
        font-size: 1.2rem;
      ">
        ⚠️ HAY QUE HACER ESTA PAGINA COMO RECOMENDACIONESPAGE, 
        SE DEBE BORRAR TODA LA PAGINA Y COMENZAR DE CERO
      </div>
    `,
    profileImage,
    profileName,
    isAsesor: true,
  });
}

export default renderRecomendacionesHistoricasPage;