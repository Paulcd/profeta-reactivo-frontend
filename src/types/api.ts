/** Envoltura genérica de respuesta del backend. */
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  timestamp: string;
}

/** Forma del error devuelto por FastAPI en 4xx/5xx. */
export interface ApiError {
  error: string;
  data: null;
}

/** Estado de los modelos IA (GET /api/modelos/status). */
export interface ModeloStatus {
  ok: boolean;
  modelos: {
    agua: boolean;
    recuperacion: boolean;
    costo: boolean;
  };
  fallback_analitico: boolean;
  mensaje: string;
}
