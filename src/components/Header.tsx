import { Mountain } from 'lucide-react';
import type { ModeloStatus } from '../types/api';

interface HeaderProps {
  status: ModeloStatus | null;
}

export function Header({ status }: HeaderProps) {
  const online = status?.ok ?? false;

  return (
    <header className="border-b border-dark-border">
      <div className="mx-auto max-w-container px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-dark-border bg-dark-surface">
            <Mountain className="h-5 w-5 text-ocre" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-main">
              Yakumind
            </h1>
            <p className="text-xs text-text-muted">
              Optimización IA para Minería · Cerro Verde, Arequipa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mono text-xs text-text-muted">
          <span
            className={`h-2 w-2 rounded-full ${online ? 'bg-mineria' : 'bg-dark-border'}`}
            aria-hidden
          />
          <span>
            {status
              ? status.fallback_analitico
                ? 'Modelo analítico (respaldo)'
                : '3 modelos IA activos'
              : 'Conectando…'}
          </span>
        </div>
      </div>
    </header>
  );
}
