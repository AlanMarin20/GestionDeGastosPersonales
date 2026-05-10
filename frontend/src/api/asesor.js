import { apiFetch, getAccessToken } from "./client";
import { state } from "../state";

export async function loadAsesorClientes() {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch("/api/asesor/clientes");
    if (!response.ok) return;

    const clientes = await response.json();
    if (!Array.isArray(clientes)) return;

    state.asesor.clientes = clientes.map((c) => ({
      id: c.id,
      nombre: c.nombreCompleto ?? c.nombre ?? "Cliente",
      gastosMes: Number(c.egreso ?? 0),
      presupuesto: Number(c.ingreso ?? 0),
      ahorros: 0,
      estado: c.riesgo >= 0.95 ? "alerta" : c.riesgo >= 0.9 ? "revision" : "normal",
      tickets: 0,
      riesgo: Number(c.riesgo ?? 0),
    }));
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
    const updated = {
      id: data.id,
      nombre: data.nombreCompleto ?? "Cliente",
      gastosMes: Number(data.gastosMes ?? 0),
      presupuesto: Number(data.presupuestoTotal ?? 0),
      ahorros: Number(data.totalAhorrado ?? 0),
      saldoActualMes: Number(data.saldoActualMes ?? 0),
      estado: data.riesgo >= 0.95 ? "alerta" : data.riesgo >= 0.9 ? "revision" : "normal",
      tickets: 0,
      riesgo: Number(data.riesgo ?? 0),
    };

    if (idx >= 0) {
      state.asesor.clientes = state.asesor.clientes.map((c, i) => (i === idx ? updated : c));
    } else {
      state.asesor.clientes = [updated, ...state.asesor.clientes];
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
      descripcion: m.comercio ?? m.descripcion ?? "-",
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

    state.detalleCliente.recomendaciones = rows.map((r) => ({
      id: r.id,
      titulo: r.titulo ?? "",
      texto: r.contenido ?? "",
      fecha: r.creadoEn ? new Date(r.creadoEn).toLocaleDateString("es-AR") : "",
      type: r.tipo ?? "general",
      severidad: r.severidad ?? "",
      categoria: r.categoria ?? "",
    }));
  } catch (error) {
    console.warn("Error cargando recomendaciones del cliente:", error);
  }
}

export async function apiAddClienteRecomendacion(clienteId, { contenido, titulo, tipo, severidad, categoria }) {
  const response = await apiFetch(`/api/asesor/clientes/${clienteId}/recomendaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contenido, titulo, tipo, severidad, categoria }),
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
