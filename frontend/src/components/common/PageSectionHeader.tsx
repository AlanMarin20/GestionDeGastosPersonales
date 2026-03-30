type PageSectionHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function PageSectionHeader({ title, subtitle, onBack }: PageSectionHeaderProps) {
  return (
    <div className="mb-4">
      <button onClick={onBack} className="btn btn-outline-secondary btn-sm mb-3">
        ← Volver
      </button>
      <h1 className="h3">{title}</h1>
      <p className="text-muted">{subtitle}</p>
    </div>
  );
}
