export function TextField({
  label,
  name,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
  error?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-[52px] rounded-2xl bg-white px-4 text-[15px] text-ink outline-none ring-ink focus:ring-2 ${
          error ? "border border-alert" : ""
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
