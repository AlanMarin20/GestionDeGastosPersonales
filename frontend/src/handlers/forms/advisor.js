import { state } from "../../state";
import { t } from "../../i18n";
import { showAppNotification } from "../../ui/notifications";
import {
  apiVincularCliente,
  apiAddClienteRecomendacion,
  loadAsesorClientes,
  loadClienteRecomendaciones,
  loadAllAsesorRecomendaciones,
} from "../../api/asesor";
import { closeAdvisorNewClientModal, updateAdvisorNewClientField } from "../../data/advisor";

export function attachAdvisorFormHandlers(pathname, { render }) {
  if (
    pathname === "/dashboard/asesor" ||
    pathname === "/dashboard/asesor/panel" ||
    pathname === "/dashboard/asesor/recomendaciones"
  ) {
    const addClientForm = document.getElementById("addClientForm");
    addClientForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = (document.getElementById("nuevoClienteNombre")?.value ?? "").trim();
      const codigo = (document.getElementById("nuevoClienteCodigo")?.value ?? "").trim();

      updateAdvisorNewClientField("nombre", nombre);
      updateAdvisorNewClientField("codigo", codigo);

      if (!codigo) {
        showAppNotification(t('forms.enterClientLinkCode'), "warning");
        return;
      }

      const submitBtn = addClientForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await apiVincularCliente(codigo);
        await loadAsesorClientes();
        closeAdvisorNewClientModal();
        showAppNotification(t('forms.clientLinked'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.invalidOrExpiredCode'), "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    const busquedaInput = document.getElementById("advisorSearchInput");
    busquedaInput?.addEventListener("input", (event) => {
      state.asesor.busqueda = event.target.value;
      render();
    });

    const ordenInput = document.getElementById("advisorSortSelect");
    ordenInput?.addEventListener("change", (event) => {
      state.asesor.orden = event.target.value;
      render();
    });

    ["nuevoClienteNombre", "nuevoClienteCodigo"].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener("input", () => {
        updateAdvisorNewClientField("nombre", document.getElementById("nuevoClienteNombre")?.value ?? "");
        updateAdvisorNewClientField("codigo", document.getElementById("nuevoClienteCodigo")?.value ?? "");
      });
    });
  }

  if (pathname === "/dashboard/asesor/recomendaciones") {
    const globalRecForm = document.getElementById("advisorGlobalRecomendacionForm");
    globalRecForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const clienteId = (state.asesor.clienteSeleccionadoId ?? "").trim();
      const titulo = (document.getElementById("recTitulo")?.value ?? "").trim();
      const texto = (document.getElementById("recTexto")?.value ?? "").trim();

      if (!clienteId) {
        showAppNotification(t('asesorRec.selectClient'), "warning");
        return;
      }
      if (!texto) return;

      const submitBtn = globalRecForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await apiAddClienteRecomendacion(clienteId, { contenido: texto, titulo, tipo: "asesor" });
        await loadAllAsesorRecomendaciones();
        showAppNotification(t('asesorRec.recSent'), "success");
        render();
      } catch (error) {
        showAppNotification(error.message || t('forms.unexpectedError'), "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname.startsWith("/cliente/")) {
    const formRecomendacion = document.getElementById("agregarRecomendacionForm");
    formRecomendacion?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const titulo = (document.getElementById("recomendacionTitulo")?.value ?? "").trim();
      const texto = (document.getElementById("recomendacionTexto")?.value ?? "").trim();
      state.detalleCliente.nuevaRecomendacionTitulo = titulo;
      state.detalleCliente.nuevaRecomendacionTexto = texto;

      if (!texto) return;

      const clienteId = state.asesor.clienteSeleccionadoId;
      if (!clienteId) return;

      const submitBtn = formRecomendacion.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await apiAddClienteRecomendacion(clienteId, {
          contenido: texto,
          titulo,
          tipo: "asesor",
        });
        await loadClienteRecomendaciones(clienteId);
        state.detalleCliente.nuevaRecomendacionTitulo = "";
        state.detalleCliente.nuevaRecomendacionTexto = "";
        showAppNotification(t('forms.recommendationSent'), "success");
        render();
      } catch (error) {
        console.error("Error al enviar recomendacion:", error);
        showAppNotification(t('forms.couldNotSendRecommendation'), "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    const recomendacionTituloInput = document.getElementById("recomendacionTitulo");
    recomendacionTituloInput?.addEventListener("input", (event) => {
      state.detalleCliente.nuevaRecomendacionTitulo = event.target.value;
    });

    const recomendacionTextoInput = document.getElementById("recomendacionTexto");
    recomendacionTextoInput?.addEventListener("input", (event) => {
      state.detalleCliente.nuevaRecomendacionTexto = event.target.value;
    });
  }
}
