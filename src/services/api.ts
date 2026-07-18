import axios, { AxiosError } from 'axios';
import type { InputValues, OptimizationResult } from '../types';
import type { ApiError, ModeloStatus } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Extrae un mensaje de error legible desde la respuesta del backend. */
function parseError(err: unknown): string {
  const axiosErr = err as AxiosError<ApiError>;
  if (axiosErr.response?.data?.error) {
    return axiosErr.response.data.error;
  }
  if (axiosErr.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder. Intenta de nuevo.';
  }
  if (axiosErr.request) {
    return 'No se pudo conectar con el servidor. ¿Está corriendo el backend en :8000?';
  }
  return 'Error inesperado al optimizar.';
}

export async function optimizar(inputs: InputValues): Promise<OptimizationResult> {
  try {
    const { data } = await client.post<OptimizationResult>('/api/optimizar', inputs);
    return data;
  } catch (err) {
    throw new Error(parseError(err));
  }
}

export async function getModelosStatus(): Promise<ModeloStatus> {
  const { data } = await client.get<ModeloStatus>('/api/modelos/status');
  return data;
}
