import { apiFetch, getAccessToken } from "./client";
import { state } from "../state";

export async function loadAsesorClientes() {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch("/api/asesor/clientes");
    if (!response.ok) return;

    const clientes = await response.json();
    if (!Array.isArray(clientes)) return;

    state.asesor.clientes = clientes.map((c) => {
      const ingreso = Number(c.ingreso ?? 0);
      const egreso = Number(c.egreso ?? 0);
      return {
        id: c.id,
        nombre: c.nombreCompleto ?? c.nombre ?? "Cliente",
        gastosMes: egreso,           // egreso = gastos del mes
        presupuesto: ingreso,        // ingreso = presupuesto total
        ahorros: Number(c.ahorro ?? 0), // ahorro = total ahorrado
        saldoActualMes: ingreso - egreso, // saldo actual = ingreso - egreso
        estado: c.riesgo >= 0.95 ? "alerta" : c.riesgo >= 0.9 ? "revision" : "normal",
        tickets: 0,
        riesgo: Number(c.riesgo ?? 0),
      };
    });
  } catch (error) {
    console.warn("Error cargando clientes del asesor:", error);
  }
}



export async function loadClienteDetalle(clienteId) {
  if (!getAccessToken() || !clienteId) return;

  try {
    const response = await apiFetch(`/api/asesor/clientes/${clienteId}`);
    if (!response.ok) return;

    const data = await response.json();
    const idx = state.asesor.clientes.findIndex((c) => c.id === clienteId);
    
    // Solo actualizar ahorros, mantener otros datos intactos
    if (idx >= 0) {
      state.asesor.clientes[idx] = {
        ...state.asesor.clientes[idx],
        ahorros: Number(data.totalAhorrado ?? 0),
      };
    }
  } catch (error) {
    console.warn("Error cargando detalle del cliente:", error);
  }
}

export async function loadClienteMovimientos(clienteId) {
  if (!getAccessToken() || !clienteId) return;

  try {
    const response = await apiFetch(`/api/asesor/clientes/${clienteId}/ultimos-movimientos`);
    if (!response.ok) return;

    const rows = await response.json();
    if (!Array.isArray(rows)) return;

    state.detalleCliente.gastos = rows.map((m) => ({
      id: m.id,
      descripcion: m.descripcion ?? "",
      comercio: m.comercio ?? "-",
      categoria: m.categoria ?? "Otros",
      fecha: typeof m.fecha === "string" ? m.fecha.slice(0, 10) : String(m.fecha ?? ""),
      monto: Number(m.monto ?? 0),
      tipo: m.tipo ?? "egreso",
    }));
  } catch (error) {
    console.warn("Error cargando movimientos del cliente:", error);
  }
}

export async function loadClienteRecomendaciones(clienteId) {
  if (!getAccessToken() || !clienteId) return;

  try {
    const response = await apiFetch(`/api/asesor/clientes/${clienteId}/recomendaciones`);
    if (!response.ok) return;

    const rows = await response.json();
    if (!Array.isArray(rows)) return;

    console.log("Raw rows desde API:", rows);
    
    // Mapea: { titulo, contenido, tipo, creadoEn } → { titulo, texto, fecha, type }
    state.detalleCliente.recomendaciones = rows.map((r, idx) => ({
      id: `rec-${idx}`,
      titulo: r.titulo || "",
      title: r.titulo || "",
      texto: r.contenido || "",
      body: r.contenido || "",
      date: r.creadoEn || "",
      fecha: r.creadoEn || "",
      type: r.tipo || "asesor",
      source: r.tipo || "asesor",
    }));
    console.log("Recomendaciones mapeadas:", state.detalleCliente.recomendaciones);
  } catch (error) {
    console.warn("Error cargando recomendaciones del cliente:", error);
  }
}

export async function apiAddClienteRecomendacion(clienteId, { contenido, titulo, tipo }) {
  const response = await apiFetch(`/api/asesor/clientes/${clienteId}/recomendaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contenido, titulo, tipo }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function apiVincularCliente(codigoVinculacion) {
  const response = await apiFetch("/api/asesor/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigoVinculacion }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiDesvincularCliente(clienteId) {
  const response = await apiFetch(`/api/asesor/clientes/${clienteId}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function loadClienteGastosPorMes(clienteId) {
  if (!getAccessToken() || !clienteId) return;

  try {
    const response = await apiFetch(`/api/asesor/clientes/${clienteId}/gastos-por-mes`);
    if (!response.ok) return;

    const rows = await response.json();
    if (!Array.isArray(rows)) return;

    state.detalleCliente.gastosPorMes = rows
      .slice()
      .reverse()
      .map((r) => ({
      label: r.mes,  // Renombrar 'mes' a 'label' para que buildBarChart lo entienda
      total: Number(r.total ?? 0),
      }));
  } catch (error) {
    console.warn("Error cargando gastos por mes:", error);
  }
}

export async function loadClienteGraficoCategorias(clienteId) {
  if (!getAccessToken() || !clienteId) return;

  try {
    const response = await apiFetch(`/api/asesor/clientes/${clienteId}/grafico-categorias`);
    if (!response.ok) return;

    const data = await response.json();
    state.detalleCliente.graficoCategorias = {
      porcentaje: Number(data.porcentaje ?? 0),
      categorias: Array.isArray(data.categorias)
        ? data.categorias.map((c) => ({
            categoria: c.categoria ?? "Otros",
            total: Number(c.total ?? 0),
            porcentaje: Number(c.porcentaje ?? 0),
          }))
        : [],
    };
  } catch (error) {
    console.warn("Error cargando gráfico de categorías:", error);
  }
}

export async function loadAllAsesorRecomendaciones() {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch('/api/asesor/recomendaciones');
    if (!response.ok) return;

    const rows = await response.json();
    if (!Array.isArray(rows)) return;

    state.asesor.recomendaciones = rows.map((r) => ({
      id: r.id,
      titulo: r.titulo || '',
      texto: r.contenido || '',
      tipo: r.tipo || 'asesor',
      fecha: r.creadoEn || '',
      clienteNombre: r.clienteNombre || '',
      clienteId: r.clienteId || '',
    }));
  } catch (error) {
    console.warn('Error cargando recomendaciones del asesor:', error);
  }
}

export async function activateAdvisor() {
  const response = await apiFetch('/api/auth/activate-advisor', {
    method: 'POST',
    body: JSON.stringify({ acceptedTerms: true }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'No se pudo activar el rol de asesor');
  }

  const data = await response.json();

  if (state.currentUser) {
    state.currentUser = { ...state.currentUser, roles: data.roles ?? ['asesor'] };
  }

  return data;
}
