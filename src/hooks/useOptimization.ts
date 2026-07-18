import { useCallback, useRef, useState } from 'react';
import { optimizar as optimizarApi } from '../services/api';
import type { InputValues, OptimizationResult } from '../types';

interface UseOptimization {
  result: OptimizationResult | null;
  loading: boolean;
  error: string | null;
  optimize: (inputs: InputValues) => Promise<void>;
}

export function useOptimization(): UseOptimization {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Descarta respuestas de llamadas obsoletas (race condition con debounce).
  const requestId = useRef(0);

  const optimize = useCallback(async (inputs: InputValues) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await optimizarApi(inputs);
      if (id === requestId.current) {
        setResult(data);
        setError(null);
      }
    } catch (err) {
      if (id === requestId.current) {
        setError(err instanceof Error ? err.message : 'Error al conectar con el servidor');
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  return { result, loading, error, optimize };
}
