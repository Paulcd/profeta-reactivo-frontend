import { useCallback, useEffect, useState } from "react";
import { Activity, Loader2, WifiOff } from "lucide-react";
import { optimizar } from "./api";
import { useDebounce } from "./hooks/useDebounce";
import type { InputValues, OptimizationResult } from "./types";
import InputPanel from "./components/InputPanel";
import ResultCard from "./components/ResultCard";
import SubMetrics from "./components/SubMetrics";
import RecoveryChart from "./components/RecoveryChart";
import ScenarioTable from "./components/ScenarioTable";
import Disclaimer from "./components/Disclaimer";

const DEFAULTS: InputValues = {
  temperatura: 28.5,
  ph: 7.15,
  ley_mineral: 0.88,
  caudal: 505,
  turbidez: 39,
  colector_actual: 52,
};

export default function App() {
  const [inputs, setInputs] = useState<InputValues>(DEFAULTS);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounce(inputs, 300);

  const handleChange = useCallback((patch: Partial<InputValues>) => {
    setInputs((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    optimizar(debounced)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "No se pudo conectar con el backend (:8000). Verifica que esté corriendo."
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocre-400 to-ocre-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 leading-tight">
                Profeta de Reactivos
              </h1>
              <p className="text-xs text-slate-500">
                Optimización IA · Flotación de Cobre · Cerro Verde
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            {loading ? (
              <span className="flex items-center gap-1.5 text-pacifico-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> calculando…
              </span>
            ) : error ? (
              <span className="flex items-center gap-1.5 text-red-500">
                <WifiOff className="w-3.5 h-3.5" /> sin conexión
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> en línea
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <InputPanel values={inputs} onChange={handleChange} />
        </aside>

        <section className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ResultCard result={result} />
                <div className="flex items-center">
                  <p className="text-sm leading-relaxed text-slate-600 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full flex items-center">
                    {result.recomendacion}
                  </p>
                </div>
              </div>

              <SubMetrics result={result} />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <RecoveryChart result={result} />
                <ScenarioTable result={result} />
              </div>

              <Disclaimer text={result.disclaimer} />
            </>
          )}

          {!result && !error && (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando
              recomendación…
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        Profeta de Reactivos · MVP hackathon · Modelos XGBoost sobre datos
        sintéticos
      </footer>
    </div>
  );
}
