import Chart from "chart.js/auto";
import { state } from "../state";
import { formatMoney } from "../utils/money";
import {
  getFinanzasCurrentPeriod,
  getDashboardMonthlySeries,
  getDashboardCategorySummary,
  getFinanzasMonthTotal,
} from "../data/finanzas";
import { monthlyExpensesDetalle } from "../data/mockData";
import { resolveDetalleCliente as resolveDetalleClienteView } from "../pages/DetalleClientePage";

let chartInstances = [];

export function getChartInstances() {
  return chartInstances;
}

export function buildPieChart(canvasId, labels, values, centerPercentage = 0, colors = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const isDark = state.configuracion.temaOscuro;
  const tooltipBackground = isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.9)";
  const tooltipTitle = isDark ? "#f8fafc" : "#333";
  const tooltipBody = isDark ? "#cbd5e1" : "#666";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const datasetBorder = isDark ? "#0f172a" : "#ffffff";
  const centerTextColor = isDark ? "#f8fafc" : "#0f172a";
  const centerSubTextColor = isDark ? "#94a3b8" : "#64748b";

  const normalizedCenter = Math.max(0, Math.min(100, centerPercentage));
  const centerText = `${normalizedCenter.toFixed(1)}%`;

  const centerTextPlugin = {
    id: `centerText-${canvasId}`,
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = centerTextColor;
      ctx.font = "700 24px Inter, sans-serif";
      ctx.fillText(centerText, centerX, centerY - 8);

      ctx.fillStyle = centerSubTextColor;
      ctx.font = "500 12px Inter, sans-serif";
      ctx.fillText("Gastado", centerX, centerY + 14);
      ctx.restore();
    },
  };

  const instance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.length > 0
            ? colors
            : [
                "rgba(13, 110, 253, 0.85)",
                "rgba(25, 135, 84, 0.85)",
                "rgba(220, 53, 69, 0.85)",
                "rgba(255, 193, 7, 0.85)",
                "rgba(13, 202, 240, 0.85)",
              ],
          borderColor: datasetBorder,
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    },
    plugins: [centerTextPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      layout: { padding: 10 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label(context) {
              const data = context.dataset.data || [];
              const total = data.reduce((acc, val) => acc + Number(val || 0), 0);
              const current = Number(context.raw || 0);
              const percentage = total > 0 ? (current / total) * 100 : 0;
              return `${context.label}: ${percentage.toFixed(1)}%`;
            },
          },
        },
      },
    },
  });

  chartInstances.push(instance);
}

export function buildBarChart(canvasId, dataPoints) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const isDark = state.configuracion.temaOscuro;
  const axisTextColor = isDark ? "#cbd5e1" : "#334155";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.08)" : "#e2e8f0";
  const tooltipBackground = isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const tooltipTitle = isDark ? "#f8fafc" : "#1e293b";
  const tooltipBody = isDark ? "#cbd5e1" : "#334155";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  const highlightIndex = dataPoints.length - 1;

  const instance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: dataPoints.map((item) => item.label),
      datasets: [
        {
          data: dataPoints.map((item) => item.total),
          borderRadius: 10,
          borderSkipped: false,
          backgroundColor: dataPoints.map((_, index) =>
            index === highlightIndex
              ? "rgba(37, 99, 235, 0.95)"
              : "rgba(56, 189, 248, 0.38)",
          ),
          hoverBackgroundColor: dataPoints.map((_, index) =>
            index === highlightIndex
              ? "rgba(30, 64, 175, 1)"
              : "rgba(56, 189, 248, 0.55)",
          ),
          maxBarThickness: 42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label(context) {
              return ` ${formatMoney(context.raw)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: axisTextColor,
            font: { family: "'Inter', sans-serif", size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: axisTextColor,
            callback(value) {
              return formatMoney(value);
            },
          },
        },
      },
    },
  });

  chartInstances.push(instance);
}

export function initCharts(pathname) {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances = [];

  if (pathname === "/dashboard") {
    const currentPeriod = getFinanzasCurrentPeriod();
    const monthlySeries = getDashboardMonthlySeries();
    const categorySeries = getDashboardCategorySummary(currentPeriod);
    const monthlyExpense = getFinanzasMonthTotal(currentPeriod);
    const income = state.finanzas.monthlyIncome;
    const spentPercentage = income > 0 ? (monthlyExpense / income) * 100 : 0;

    buildBarChart("dashboardMonthlyBarChart", monthlySeries);
    buildPieChart(
      "dashboardCategoryDonutChart",
      categorySeries.map((item) => item.label),
      categorySeries.map((item) => item.total),
      spentPercentage,
      categorySeries.map((item) => item.color),
    );
  }

  if (pathname.startsWith("/cliente/") && !pathname.endsWith("/gastos")) {
    const detalleCliente = resolveDetalleClienteView(pathname, state);
    const presupuesto = Number(detalleCliente?.presupuesto || 0);
    const gastadoMes = Number(detalleCliente?.gastadoMes || 0);
    const porcentajeGastado = presupuesto > 0 ? (gastadoMes / presupuesto) * 100 : 0;

    buildBarChart("detalleMonthlyBarChart", monthlyExpensesDetalle);
    buildPieChart(
      "detallePieChart",
      ["Comida", "Vivienda", "Transporte", "Salud", "Otros"],
      [35, 25, 15, 10, 15],
      porcentajeGastado,
    );
  }
}
