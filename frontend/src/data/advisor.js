import { state } from "../state";
import { ADVISOR_AVATAR_COLORS } from "./mockData";

export function getInitials(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "US";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function generateAdvisorVerificationCode() {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  const timePart = Date.now().toString(36).slice(-4).toUpperCase();
  return `ADV-${randomPart}-${timePart}`;
}

export function buildAdvisorUsers() {
  const search = state.asesor.busqueda.trim().toLowerCase();
  const sortOrder = state.asesor.orden;
  const riskPriority = { low: 1, medium: 2, high: 3 };

  return state.asesor.clientes
    .filter((client) => client.nombre.toLowerCase().includes(search))
    .map((client, index) => {
      const ratio = client.presupuesto > 0
        ? (client.gastosMes / client.presupuesto) * 100
        : 0;
      const risk = ratio >= 95 ? "high" : ratio > 90 ? "medium" : "low";

      return {
        id: client.id,
        name: client.nombre,
        monthlySpend: client.gastosMes,
        tickets: client.tickets || 0,
        progress: Math.min(ratio, 100),
        spentPercent: Math.min(Math.max(ratio, 0), 100),
        risk,
        initials: getInitials(client.nombre),
        avatarColor: ADVISOR_AVATAR_COLORS[index % ADVISOR_AVATAR_COLORS.length],
      };
    })
    .sort((left, right) => {
      const byNameAsc = left.name.localeCompare(right.name, "es", { sensitivity: "base" });
      const byNameDesc = right.name.localeCompare(left.name, "es", { sensitivity: "base" });
      const leftRisk = riskPriority[left.risk] || 0;
      const rightRisk = riskPriority[right.risk] || 0;

      if (sortOrder === "z-a") return byNameDesc;

      if (sortOrder === "riesgo-alto") {
        if (rightRisk !== leftRisk) return rightRisk - leftRisk;
        if (right.spentPercent !== left.spentPercent) return right.spentPercent - left.spentPercent;
        return byNameAsc;
      }

      if (sortOrder === "riesgo-bajo") {
        if (leftRisk !== rightRisk) return leftRisk - rightRisk;
        if (left.spentPercent !== right.spentPercent) return left.spentPercent - right.spentPercent;
        return byNameAsc;
      }

      return byNameAsc;
    });
}

export function resetAdvisorNewClientForm() {
  state.asesor.nuevoCliente = { nombre: "", codigo: "" };
}

export function openAdvisorNewClientModal() {
  state.asesor.modals.nuevoCliente = true;
}

export function closeAdvisorNewClientModal() {
  state.asesor.modals.nuevoCliente = false;
  resetAdvisorNewClientForm();
}

export function updateAdvisorNewClientField(field, value) {
  state.asesor.nuevoCliente = { ...state.asesor.nuevoCliente, [field]: value };
}

export function addAdvisorClientRecord({ nombre, codigo }) {
  if (!nombre || !codigo) {
    return { ok: false, message: "Completa el nombre y el codigo del cliente" };
  }

  if (state.asesor.clientes.some((client) => String(client.id) === codigo)) {
    return { ok: false, message: "Ya existe un cliente con ese codigo" };
  }

  state.asesor.clientes = [
    {
      id: codigo,
      codigo,
      nombre,
      gastosMes: 0,
      ahorros: 0,
      presupuesto: 0,
      estado: "normal",
      tickets: 0,
    },
    ...state.asesor.clientes,
  ];

  return { ok: true };
}

export function getAdvisorPanelMetrics() {
  const clients = state.asesor.clientes;
  const mediumRiskClients = clients.filter(
    (client) =>
      client.presupuesto > 0 &&
      (client.gastosMes / client.presupuesto) * 100 > 90 &&
      (client.gastosMes / client.presupuesto) * 100 <= 95,
  ).length;
  const highRiskClients = clients.filter(
    (client) => client.presupuesto > 0 && (client.gastosMes / client.presupuesto) * 100 >= 95,
  ).length;

  return [
    {
      label: "Clientes Asignados",
      value: String(clients.length),
      delta: `${clients.length} en cartera`,
      trend: "up",
    },
    {
      label: "Clientes en Riesgo Medio",
      value: String(mediumRiskClients),
      delta: "+ 90% del presupuesto",
      trend: "warn",
    },
    {
      label: "Clientes en Riesgo Alto",
      value: String(highRiskClients),
      delta: "+ 95% del presupuesto",
      trend: highRiskClients > 0 ? "down" : "up",
    },
  ];
}

export function extractClientIdFromPath(pathname) {
  const match = String(pathname || "").match(/^\/cliente\/([^/?#]+)/);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function findAdvisorClientById(clientId) {
  if (!clientId) return null;

  return state.asesor.clientes.find((client) => {
    const normalizedId = String(client?.id ?? client?.userId ?? client?.usuarioId ?? "");
    return normalizedId === String(clientId);
  }) || null;
}

export function registerAdvisorClientSelection(pathname) {
  const clientId = extractClientIdFromPath(pathname);
  const client = findAdvisorClientById(clientId);
  if (!client) return false;

  state.asesor.clienteSeleccionadoId = String(clientId);
  return true;
}

export function isAdvisorClientDetailAuthorized(pathname) {
  const clientId = extractClientIdFromPath(pathname);
  if (!clientId || !findAdvisorClientById(clientId)) return false;

  const selectedClientId = String(state.asesor.clienteSeleccionadoId || "");
  return selectedClientId.length > 0 && selectedClientId === String(clientId);
}
