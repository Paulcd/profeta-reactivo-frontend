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
  colector_actual: number;
  delta_colector: number;
  delta_recuperacion_pct: number;
  ahorro_diario: number;
  ahorro_anual: number;
  agua_ahorrada_m3h: number;
  agua_ahorrada_m3dia: number;
  recomendacion: string;
  disclaimer: string;
}
