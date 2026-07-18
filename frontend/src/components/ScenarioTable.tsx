import type { OptimizationResult, Scenario } from "../types";

interface ScenarioTableProps {
  result: OptimizationResult;
}

function fmt(n: number, d = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export default function ScenarioTable({ result }: ScenarioTableProps) {
  const actual = result.colector_actual;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">
          9 escenarios evaluados (45–53 L/h)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 bg-slate-50">
              <th className="px-4 py-2 font-semibold">Colector</th>
              <th className="px-4 py-2 font-semibold text-right">Agua</th>
              <th className="px-4 py-2 font-semibold text-right">Recup.</th>
              <th className="px-4 py-2 font-semibold text-right">Costo</th>
              <th className="px-4 py-2 font-semibold text-right">Ahorro/día</th>
              <th className="px-4 py-2 font-semibold text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {result.escenarios.map((s: Scenario) => {
              const esActual = Math.abs(s.colector_L_h - actual) < 0.5;
              return (
                <tr
                  key={s.colector_L_h}
                  className={
                    s.es_optimo
                      ? "bg-ocre-50/80 font-semibold text-slate-800"
                      : "text-slate-600 hover:bg-slate-50"
                  }
                >
                  <td className="px-4 py-2.5 tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      {s.es_optimo && <span className="text-ocre-500">★</span>}
                      {s.colector_L_h.toFixed(1)} L/h
                      {esActual && !s.es_optimo && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          (actual)
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fmt(s.agua_m3_h, 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {s.recuperacion_pct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    US${fmt(s.costo_usd_h, 0)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right tabular-nums ${
                      s.ahorro_vs_actual > 0
                        ? "text-emerald-600"
                        : s.ahorro_vs_actual < 0
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {s.ahorro_vs_actual > 0 ? "+" : ""}
                    {fmt(s.ahorro_vs_actual, 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.es_optimo ? "bg-ocre-500" : "bg-pacifico-400"
                          }`}
                          style={{ width: `${s.score_combinado}%` }}
                        />
                      </div>
                      <span className="tabular-nums w-10 text-right">
                        {s.score_combinado.toFixed(0)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
