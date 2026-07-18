import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Scenario } from '../types';
import { num } from '../utils/format';

interface ChartProps {
  scenarios: Scenario[];
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: Scenario;
}

/** Punto especial (azul pacífico) en el escenario óptimo. */
function OptimoDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload?.es_optimo) return null;
  return <circle cx={cx} cy={cy} r={6} fill="#2E8B9E" stroke="#0F1419" strokeWidth={2} />;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Scenario }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card mono px-3 py-2 text-xs">
      <div className="text-text-muted">Colector: <span className="text-text-main">{num(d.colector_L_h)} L/h</span></div>
      <div className="text-text-muted">Recuperación: <span className="text-ocre">{num(d.recuperacion_pct, 2)}%</span></div>
    </div>
  );
}

export function Chart({ scenarios }: ChartProps) {
  const optimo = scenarios.find((s) => s.es_optimo);
  const recValues = scenarios.map((s) => s.recuperacion_pct);
  const yMin = Math.floor(Math.min(...recValues) - 0.5);
  const yMax = Math.ceil(Math.max(...recValues) + 0.5);

  return (
    <div className="card p-5">
      <h3 className="mb-1 text-sm font-semibold text-text-main">Recuperación vs. Colector</h3>
      <p className="mb-4 mono text-[11px] text-text-muted">El pico marca la dosis óptima</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={scenarios} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#3A3A3A" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="colector_L_h"
            stroke="#8A97A3"
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={{ stroke: '#3A3A3A' }}
          />
          <YAxis
            domain={[yMin, yMax]}
            stroke="#8A97A3"
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={{ stroke: '#3A3A3A' }}
            width={48}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#3A3A3A' }} />
          {optimo && (
            <ReferenceLine
              x={optimo.colector_L_h}
              stroke="#2E8B9E"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
          <Line
            type="monotone"
            dataKey="recuperacion_pct"
            stroke="#D4A574"
            strokeWidth={3}
            dot={<OptimoDot />}
            activeDot={{ r: 5, fill: '#D4A574' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
