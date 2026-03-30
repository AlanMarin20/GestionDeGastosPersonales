import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './dashboard-widgets.css';

ChartJS.register(ArcElement, Tooltip, Legend);

type ExpensePieChartProps = {
  title: string;
  labels: string[];
  values: number[];
};

export function ExpensePieChart({ title, labels, values }: ExpensePieChartProps) {
  const pieData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ['#4CAF50', '#FFA500', '#2196F3', '#9C27B0', '#FFEB3B'],
        borderColor: ['#45a049', '#FB8500', '#1976D2', '#7B1FA2', '#FBC02D'],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' as const },
    },
  };

  return (
    <article className="card border-0 shadow-sm dashboard-widget-card">
      <div className="card-body">
        <h2 className="h5 mb-3">{title}</h2>
        <div className="dashboard-widget-chart">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </article>
  );
}
