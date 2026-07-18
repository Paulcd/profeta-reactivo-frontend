import type { Scenario } from '../types';
import { num, signed } from '../utils/format';

interface ScenarioTableProps {
  scenarios: Scenario[];
}

const COLS = [
  { label: 'Colector (L/h)', get: (s: Scenario) => num(s.colector_L_h) },
  { label: 'Agua (m³/h)', get: (s: Scenario) => num(s.agua_m3_h) },
  { label: 'Recup. (%)', get: (s: Scenario) => num(s.recuperacion_pct, 2) },
  { label: 'Costo/h (USD)', get: (s: Scenario) => num(s.costo_usd_h) },
  { label: 'Ahorro/día (USD)', get: (s: Scenario) => signed(s.ahorro_vs_actual) },
  { label: 'Score', get: (s: Scenario) => num(s.score_combinado) },
];

export function ScenarioTable({ scenarios }: ScenarioTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-dark-border px-5 py-3">
        <h3 className="text-sm font-semibold text-text-main">9 escenarios evaluados</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse mono text-xs">
          <thead>
            <tr className="border-b border-dark-border">
              {COLS.map((c) => (
                <th
                  key={c.label}
                  className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-text-muted first:text-left"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, i) => (
              <tr
                key={i}
                className={
                  s.es_optimo
                    ? 'border-y-2 border-ocre bg-ocre/10'
                    : 'border-b border-dark-border/60 transition-colors hover:bg-white/[0.03]'
                }
              >
                {COLS.map((c, j) => (
                  <td
                    key={c.label}
                    className={`whitespace-nowrap px-4 py-2.5 text-right first:text-left ${
                      s.es_optimo ? 'text-text-main' : 'text-text-muted'
                    } ${j === 0 && s.es_optimo ? 'font-semibold text-ocre' : ''}`}
                  >
                    {j === 0 && s.es_optimo ? `▸ ${c.get(s)}` : c.get(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
