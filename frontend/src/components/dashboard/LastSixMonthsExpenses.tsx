import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './dashboard-widgets.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export type MonthlyExpense = {
  mes: string;
  monto: number;
};

type LastSixMonthsExpensesProps = {
  title: string;
  months: MonthlyExpense[];
};

export function LastSixMonthsExpenses({ title, months }: LastSixMonthsExpensesProps) {
  const chartData = {
    labels: months.map(item => item.mes),
    datasets: [
      {
        label: 'Gastos',
        data: months.map(item => item.monto),
        backgroundColor: '#0d6efd',
        borderRadius: 6,
        maxBarThickness: 38,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { y: number } }) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `$${value}`,
        },
      },
    },
  };

  return (
    <article className="card border-0 shadow-sm dashboard-widget-card">
      <div className="card-body">
        <h2 className="h5 mb-3">{title}</h2>
        <div className="dashboard-widget-chart">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </article>
  );
}
