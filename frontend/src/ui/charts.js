import Chart from "chart.js/auto";
import { state } from "../state";
import { formatMoney } from "../utils/money";
import { escapeHtml } from "../utils/sanitize";
import {
  getFinanzasCurrentPeriod,
  getDashboardMonthlySeries,
  getDashboardCategorySummary,
} from "../data/finanzas";
import { resolveDetalleCliente as resolveDetalleClienteView } from "../pages/DetalleClientePage";

let chartInstances = [];

export function getChartInstances() {
  return chartInstances;
}

export function buildPieChart(canvasId, labels, values, centerAmount = 0, colors = [], legendContainerId = null) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const canvasCenterValue = canvas.dataset.centerValue || '';
  const canvasCenterLabel = canvas.dataset.centerLabel || '';

  const isDark = state.configuracion.temaOscuro;
  const tooltipBackground = isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.9)";
  const tooltipTitle = isDark ? "#f8fafc" : "#333";
  const tooltipBody = isDark ? "#cbd5e1" : "#666";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const datasetBorder = isDark ? "#0f172a" : "#ffffff";
  const centerTextColor = isDark ? "#f8fafc" : "#0f172a";
  const centerSubTextColor = isDark ? "#94a3b8" : "#64748b";

  const centerText = canvasCenterValue || formatMoney(centerAmount);
  const centerSubText = canvasCenterLabel || 'Total mes';

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
      ctx.font = "700 16px Inter, sans-serif";
      ctx.fillText(centerText, centerX, centerY - 8);

      ctx.fillStyle = centerSubTextColor;
      ctx.font = "500 11px Inter, sans-serif";
      ctx.fillText(centerSubText, centerX, centerY + 12);
      ctx.restore();
    },
  };

  const defaultColors = [
    "rgba(13, 110, 253, 0.85)",
    "rgba(25, 135, 84, 0.85)",
    "rgba(220, 53, 69, 0.85)",
    "rgba(255, 193, 7, 0.85)",
    "rgba(13, 202, 240, 0.85)",
  ];
  const usedColors = colors.length > 0 ? colors : defaultColors;

  const instance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: usedColors,
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

  if (legendContainerId) {
    const container = document.getElementById(legendContainerId);
    if (container) {
      const total = values.reduce((acc, val) => acc + Number(val || 0), 0);
      const items = labels.map((label, i) => {
        const pct = total > 0 ? ((Number(values[i] || 0) / total) * 100).toFixed(1) : "0.0";
        const color = usedColors[i % usedColors.length];
        return `<li class="gd-legend-item">
          <span class="gd-legend-dot" style="background:${escapeHtml(String(color))}" aria-hidden="true"></span>
          <span class="gd-legend-label">${escapeHtml(String(label))}</span>
          <span class="gd-legend-value">${escapeHtml(pct)}%</span>
        </li>`;
      }).join("");
      container.innerHTML = `<ul class="gd-legend" aria-label="Categorias de gasto">${items}</ul>`;
    }
  }
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

export function buildLineChart(canvasId, dataPoints) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const isDark = state.configuracion.temaOscuro;
  const axisTextColor = isDark ? "#cbd5e1" : "#334155";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.08)" : "#e2e8f0";
  const tooltipBackground = isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)";
  const tooltipTitle = isDark ? "#f8fafc" : "#1e293b";
  const tooltipBody = isDark ? "#cbd5e1" : "#334155";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const fillColor = isDark ? "rgba(37, 99, 235, 0.15)" : "rgba(37, 99, 235, 0.08)";

  const instance = new Chart(canvas, {
    type: "line",
    data: {
      labels: dataPoints.map((item) => item.label),
      datasets: [
        {
          data: dataPoints.map((item) => item.total),
          borderColor: "rgba(37, 99, 235, 0.9)",
          backgroundColor: fillColor,
          borderWidth: 2.5,
          fill: true,
          tension: 0.42,
          pointBackgroundColor: "rgba(37, 99, 235, 0.9)",
          pointBorderColor: isDark ? "#0d131f" : "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
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
          padding: 12,
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
          ticks: { color: axisTextColor, font: { family: "'Inter', sans-serif", size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: axisTextColor,
            callback(value) { return formatMoney(value); },
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
    const totalEgreso = categorySeries.reduce((sum, item) => sum + item.total, 0);

    buildBarChart("dashboardMonthlyBarChart", monthlySeries);
    buildPieChart(
      "dashboardCategoryDonutChart",
      categorySeries.map((item) => item.label),
      categorySeries.map((item) => item.total),
      totalEgreso,
      categorySeries.map((item) => item.color),
      "dashboardCategoryLegend",
    );
  }

  if (pathname === "/dashboard/patrones") {
    const currentPeriod = getFinanzasCurrentPeriod();
    const monthlySeries = getDashboardMonthlySeries();
    const categorySeries = getDashboardCategorySummary(currentPeriod);
    const totalEgreso = categorySeries.reduce((sum, item) => sum + item.total, 0);

    buildBarChart("patronesBarChart", monthlySeries);
    buildPieChart(
      "patronesCategoryDonut",
      categorySeries.map((item) => item.label),
      categorySeries.map((item) => item.total),
      totalEgreso,
      categorySeries.map((item) => item.color),
      "patronesCategoryLegend",
    );
  }

  if (pathname.startsWith("/cliente/") && !pathname.endsWith("/gastos")) {
    const detalleCliente = resolveDetalleClienteView(pathname, state);
    const gastosPorMes = state.detalleCliente?.gastosPorMes ?? [];
    const graficoCategorias = state.detalleCliente?.graficoCategorias ?? { porcentaje: 0, categorias: [] };

    // Usar datos de gastos por mes desde el backend
    if (gastosPorMes.length > 0) {
      buildBarChart("detalleMonthlyBarChart", gastosPorMes);
    }

    // Usar datos de categorías desde el backend
    const categorias = graficoCategorias.categorias || [];
    const totalEgresoCliente = categorias.reduce((s, c) => s + Number(c.total || 0), 0);
    
    buildPieChart(
      "detallePieChart",
      categorias.length > 0 ? categorias.map((c) => c.categoria) : ["Sin gastos"],
      categorias.length > 0 ? categorias.map((c) => Number(c.total || 0)) : [1],
      totalEgresoCliente,
      [],
      "detalleCategoryLegend",
    );
  }
}
