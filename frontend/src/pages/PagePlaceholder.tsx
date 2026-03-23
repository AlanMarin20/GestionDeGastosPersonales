type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h1 className="h4 mb-2">{title}</h1>
        <p className="text-secondary mb-0">{description}</p>
      </div>
    </section>
  );
}
