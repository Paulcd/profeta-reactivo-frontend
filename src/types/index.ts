export interface InputValues {
  temperatura: number;
  ph: number;
  ley_mineral: number;
  caudal: number;
  turbidez: number;
  colector_actual: number;
}

export interface Scenario {
  colector_L_h: number;
  agua_m3_h: number;
  recuperacion_pct: number;
  costo_usd_h: number;
  ahorro_vs_actual: number;
  score_combinado: number;
  es_optimo: boolean;
}

export interface OptimizationResult {
  optimo: Scenario;
  escenarios: Scenario[];
  ahorro_diario: number;
  ahorro_anual: number;
  recomendacion: string;
}

/** Metadatos de una variable de proceso, usados por los sliders. */
export interface SliderConfig {
  key: keyof InputValues;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}
