import { ChevronDown, Download, Droplet, Lightbulb, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { OptimizationResult, Scenario } from '../types';
import { num, signed, usd } from '../utils/format';
import { Chart } from './Chart';
import { CostChart } from './CostChart';
import { ScenarioTable } from './ScenarioTable';

interface ResultsPanelProps {
  result: OptimizationResult;
  colectorActual: number;
}

function exportCsv(scenarios: Scenario[]) {
  const headers = [
    'colector_L_h',
    'agua_m3_h',
    'recuperacion_pct',
    'costo_usd_h',
    'ahorro_dia_usd',
    'score_combinado',
    'es_optimo',
  ];
  const rows = scenarios.map((s) =>
    [
      s.colector_L_h,
      s.agua_m3_h,
      s.recuperacion_pct,
      s.costo_usd_h,
      s.ahorro_vs_actual,
      s.score_combinado,
      s.es_optimo ? 'SI' : 'NO',
    ].join(','),
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scenarios-${ts}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

interface SubMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
}

function SubMetric({ icon, label, value, delta, deltaPositive }: SubMetricProps) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2 text-text-muted">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="mono text-2xl font-semibold text-text-main">{value}</div>
      {delta && (
        <div className={`mono mt-1 text-xs ${deltaPositive ? 'text-mineria' : 'text-text-muted'}`}>
          {delta}
        </div>
      )}
    </div>
  );
}

export function ResultsPanel({ result, colectorActual }: ResultsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const { optimo, escenarios, ahorro_diario, ahorro_anual, recomendacion } = result;

  const deltaColector = optimo.colector_L_h - colectorActual;

  // Recuperación en la dosis actual (escenario más cercano) para el delta.
  const recActual = useMemo(() => {
    return escenarios.reduce((prev, cur) =>
      Math.abs(cur.colector_L_h - colectorActual) < Math.abs(prev.colector_L_h - colectorActual)
        ? cur
        : prev,
    ).recuperacion_pct;
  }, [escenarios, colectorActual]);

  const deltaRec = optimo.recuperacion_pct - recActual;

  return (
    <div className="fade-in flex flex-col gap-6">
      {/* MÉTRICA PRINCIPAL */}
      <section className="card relative overflow-hidden p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mono text-xs uppercase tracking-[0.2em] text-pacifico">
              Dosis recomendada
            </span>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="mono text-6xl font-bold leading-none text-ocre sm:text-7xl">
                {num(optimo.colector_L_h)}
              </span>
              <span className="mono text-2xl text-text-muted">L/h</span>
            </div>
            <p className="mono mt-3 text-sm text-text-muted">
              Actual: {num(colectorActual)} L/h ·{' '}
              <span className={deltaColector >= 0 ? 'text-mineria' : 'text-ocre'}>
                {signed(deltaColector)} L/h
              </span>
            </p>
          </div>

          <button
            onClick={() => exportCsv(escenarios)}
            className="flex items-center gap-2 self-start rounded-md border border-dark-border px-4 py-2 text-sm text-text-muted hover:border-ocre hover:text-ocre"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </section>

      {/* SUB-MÉTRICAS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SubMetric
          icon={<TrendingUp className="h-4 w-4" />}
          label="Recuperación"
          value={`${num(optimo.recuperacion_pct, 2)}%`}
          delta={`${signed(deltaRec, 2)}% vs. actual`}
          deltaPositive={deltaRec >= 0}
        />
        <SubMetric
          icon={<Droplet className="h-4 w-4" />}
          label="Ahorro / día"
          value={`US$${usd(ahorro_diario)}`}
          delta={ahorro_diario >= 0 ? 'menos reactivo + agua' : 'mejor equilibrio'}
          deltaPositive={ahorro_diario >= 0}
        />
        <SubMetric
          icon={<TrendingUp className="h-4 w-4" />}
          label="Ahorro / año"
          value={`US$${usd(ahorro_anual)}`}
          delta="365 días operativos"
          deltaPositive={ahorro_anual >= 0}
        />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Chart scenarios={escenarios} />
        <CostChart scenarios={escenarios} />
      </div>

      {/* TABLA */}
      <ScenarioTable scenarios={escenarios} />

      {/* EXPLICACIÓN */}
      <section className="card overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-text-main">
            <Lightbulb className="h-4 w-4 text-ocre" />
            ¿Por qué {num(optimo.colector_L_h)} L/h?
          </span>
          <ChevronDown
            className={`h-4 w-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        {expanded && (
          <div className="fade-in border-t border-dark-border px-5 py-4">
            <p className="text-sm leading-relaxed text-text-muted">{recomendacion}</p>
          </div>
        )}
      </section>
    </div>
  );
}
