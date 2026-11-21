export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`animate-spin motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Loading({ label = "Carregando" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-1 items-center justify-center text-ink">
      <Spinner className="h-6 w-6" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
