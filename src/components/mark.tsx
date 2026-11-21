export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 62 64" className={className} aria-hidden="true">
      <rect x="4" y="4" width="16" height="56" rx="8" fill="currentColor" />
      <path
        d="M30 12C41.05 12 50 20.95 50 32C50 43.05 41.05 52 30 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
