export function LoadingSpinner() {
  return (
    <div className="fade-in flex flex-col items-center justify-center gap-4 py-16">
      <svg
        className="spinner h-10 w-10"
        viewBox="0 0 50 50"
        role="status"
        aria-label="Cargando"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#3A3A3A"
          strokeWidth="4"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#D4A574"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90 150"
        />
      </svg>
      <p className="mono text-sm text-text-muted">Analizando 9 escenarios…</p>
    </div>
  );
}
