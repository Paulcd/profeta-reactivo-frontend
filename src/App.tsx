import { useEffect, useState } from 'react';
import { ErrorAlert } from './components/ErrorAlert';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultsPanel } from './components/ResultsPanel';
import { useDebounce } from './hooks/useDebounce';
import { useOptimization } from './hooks/useOptimization';
import { getModelosStatus } from './services/api';
import type { InputValues } from './types';
import type { ModeloStatus } from './types/api';

const DEFAULT_INPUTS: InputValues = {
  temperatura: 28.5,
  ph: 7.15,
  ley_mineral: 0.88,
  caudal: 505,
  turbidez: 39,
  colector_actual: 52,
};

export default function App() {
  const [inputs, setInputs] = useState<InputValues>(DEFAULT_INPUTS);
  const [status, setStatus] = useState<ModeloStatus | null>(null);
  const debouncedInputs = useDebounce(inputs, 300);

  const { result, loading, error, optimize } = useOptimization();

  // Estado de los modelos al montar.
  useEffect(() => {
    getModelosStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  // Re-optimiza cuando los inputs (debounced) cambian.
  useEffect(() => {
    optimize(debouncedInputs);
  }, [debouncedInputs, optimize]);

  return (
    <div className="min-h-screen">
      <Header status={status} />

      <main className="mx-auto max-w-container px-6 py-8">
        <div className="fade-in mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
            Ajusta las condiciones. La IA encuentra la dosis óptima.
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Grid Search sobre 9 dosis de colector para maximizar la recuperación de cobre
            con el menor consumo de reactivo y agua.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <InputPanel values={inputs} onChange={setInputs} />

          {error && <ErrorAlert message={error} />}

          {loading && !result && <LoadingSpinner />}

          {result && (
            <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <ResultsPanel result={result} colectorActual={inputs.colector_actual} />
            </div>
          )}
        </div>
      </main>

      <footer className="mx-auto max-w-container px-6 py-8 mono text-xs text-text-muted">
        Yakumind · React + TypeScript + FastAPI · Es una recomendación, no
        automatización forzada.
      </footer>
    </div>
  );
}
