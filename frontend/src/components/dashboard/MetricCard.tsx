type MetricCardProps = {
  title: string;
  value: string;
};

export function MetricCard({ title, value }: MetricCardProps) {
  return (
    <article className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <p className="text-secondary mb-1">{title}</p>
        <h2 className="h4 mb-0">{value}</h2>
      </div>
    </article>
  );
}
