import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OptimizationResult } from "../types";

interface RecoveryChartProps {
  result: OptimizationResult;
}

export default function RecoveryChart({ result }: RecoveryChartProps) {
  const data = result.escenarios.map((s) => ({
    colector: s.colector_L_h,
    recuperacion: Number(s.recuperacion_pct.toFixed(2)),
  }));
  const optimo = result.optimo.colector_L_h;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-1">
        Recuperación vs. colector
      </h3>
      <p className="text-[11px] text-slate-400 mb-3">
        Curva no lineal: existe un punto óptimo intermedio.
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 12, left: -8, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
          <XAxis
            dataKey="colector"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            unit=" L/h"
          />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            unit="%"
            width={48}
          />
          <Tooltip
            formatter={(v: number) => [`${v}%`, "Recuperación"]}
            labelFormatter={(l) => `Colector: ${l} L/h`}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            x={optimo}
            stroke="#c2853d"
            strokeDasharray="4 4"
            label={{
              value: `óptimo ${optimo}`,
              position: "top",
              fill: "#a96b32",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Line
            type="monotone"
            dataKey="recuperacion"
            stroke="#2e8b9e"
            strokeWidth={3}
            dot={{ r: 3, fill: "#2e8b9e" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
