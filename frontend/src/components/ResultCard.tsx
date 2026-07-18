import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { OptimizationResult } from "../types";

interface ResultCardProps {
  result: OptimizationResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const delta = result.delta_colector;
  const baja = delta < -0.05;
  const sube = delta > 0.05;

  const Icon = baja ? ArrowDownRight : sube ? ArrowUpRight : Minus;
  const accion = baja ? "Baja" : sube ? "Sube" : "Mantén";
  const deltaTxt =
    Math.abs(delta) < 0.05
      ? "sin cambios"
      : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} L/h vs actual (${result.colector_actual.toFixed(
          1
        )})`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pacifico-600 to-pacifico-800 text-white shadow-lg p-7">
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute right-10 bottom-2 w-24 h-24 rounded-full bg-ocre-400/20" />

      <div className="relative">
        <div className="flex items-center gap-2 text-pacifico-100 text-sm font-medium uppercase tracking-wide">
          <span className="text-ocre-300">★</span> Recomendación
        </div>

        <div className="mt-2 flex items-end gap-3">
          <span className="text-6xl font-extrabold leading-none tabular-nums">
            {result.optimo.colector_L_h.toFixed(1)}
          </span>
          <span className="mb-1.5 text-xl font-semibold text-pacifico-100">
            L/h
          </span>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
          <Icon className="w-4 h-4" />
          {accion} · {deltaTxt}
        </div>
      </div>
    </div>
  );
}
