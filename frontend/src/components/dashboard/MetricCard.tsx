type MetricCardProps = {
  title: string;
  value: string;
  color?: 'success' | 'danger' | 'info' | 'warning' | 'primary';
};

export function MetricCard({ title, value, color = 'primary' }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    success: 'border-start border-success',
    danger: 'border-start border-danger',
    info: 'border-start border-info',
    warning: 'border-start border-warning',
    primary: 'border-start border-primary',
  };

  return (
    <article className={`card border-0 shadow-sm h-100 ${colorClasses[color]}`} style={{ borderLeftWidth: '4px' }}>
      <div className="card-body">
        <p className="text-secondary mb-1 small">{title}</p>
        <h2 className="h4 mb-0">{value}</h2>
      </div>
    </article>
  );
}
