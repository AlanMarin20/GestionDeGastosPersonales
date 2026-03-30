type NotificationToggleItemProps = {
  id: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function NotificationToggleItem({
  id,
  checked,
  onChange,
  title,
  description,
  disabled = false,
  className = 'mb-3',
}: NotificationToggleItemProps) {
  return (
    <div className={`form-check form-switch ${className}`.trim()}>
      <input
        className="form-check-input"
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label className="form-check-label" htmlFor={id}>
        <strong>{title}</strong>
        {description && (
          <>
            <br />
            <small className="text-muted">{description}</small>
          </>
        )}
      </label>
    </div>
  );
}
