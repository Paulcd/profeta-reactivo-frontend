import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Scenario } from '../types';
import { num } from '../utils/format';

interface CostChartProps {
  scenarios: Scenario[];
}

function CostTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Scenario }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card mono px-3 py-2 text-xs">
      <div className="text-text-muted">Colector: <span className="text-text-main">{num(d.colector_L_h)} L/h</span></div>
      <div className="text-text-muted">Costo/h: <span className="text-text-main">US${num(d.costo_usd_h)}</span></div>
    </div>
  );
}

export function CostChart({ scenarios }: CostChartProps) {
  return (
    <div className="card p-5">
      <h3 className="mb-1 text-sm font-semibold text-text-main">Costo operativo por dosis</h3>
      <p className="mb-4 mono text-[11px] text-text-muted">El óptimo en ocre; el resto en gris</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={scenarios} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#3A3A3A" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="colector_L_h"
            stroke="#8A97A3"
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={{ stroke: '#3A3A3A' }}
          />
          <YAxis
            stroke="#8A97A3"
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={{ stroke: '#3A3A3A' }}
            width={48}
          />
          <Tooltip content={<CostTooltip />} cursor={{ fill: 'rgba(212,165,116,0.06)' }} />
          <Bar dataKey="costo_usd_h" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {scenarios.map((s, i) => (
              <Cell key={i} fill={s.es_optimo ? '#D4A574' : '#666666'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
