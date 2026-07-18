import { Droplets, TrendingUp, Wallet } from "lucide-react";
import type { OptimizationResult } from "../types";

interface SubMetricsProps {
  result: OptimizationResult;
}

function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function SubMetrics({ result }: SubMetricsProps) {
  const rec = result.delta_recuperacion_pct;
  const ahorro = result.ahorro_diario;
  const agua = result.agua_ahorrada_m3dia;

  const cards = [
    {
      icon: TrendingUp,
      label: "Recuperación",
      value: `${rec >= 0 ? "+" : ""}${rec.toFixed(2)} pts`,
      sub: "cobre recuperado",
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      icon: Wallet,
      label: "Ahorro",
      value: `US$${fmtUSD(ahorro)}`,
      sub: `US$${fmtUSD(result.ahorro_anual)} / año`,
      tone: "text-ocre-700 bg-ocre-50",
    },
    {
      icon: Droplets,
      label: "Agua ahorrada",
      value: `${fmtUSD(agua)} m³`,
      sub: "por día · sostenibilidad",
      tone: "text-pacifico-700 bg-pacifico-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-slate-100 shadow-sm p-4"
        >
          <div
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${c.tone}`}
          >
            <c.icon className="w-5 h-5" />
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">{c.label}</div>
          <div className="text-2xl font-extrabold text-slate-800 tabular-nums">
            {c.value}
          </div>
          <div className="text-[11px] text-slate-400">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
