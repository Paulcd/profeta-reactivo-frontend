"""Esquemas Pydantic para validación de entrada/salida del API."""
from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class InputValues(BaseModel):
    """Parámetros de proceso enviados por el frontend."""

    temperatura: float = Field(..., ge=20.0, le=35.0, description="Temperatura de pulpa (°C)")
    ph: float = Field(..., ge=6.5, le=8.0, description="pH de la pulpa")
    ley_mineral: float = Field(..., ge=0.70, le=1.00, description="Ley de cobre (%)")
    caudal: float = Field(..., ge=400.0, le=600.0, description="Caudal de pulpa (m³/h)")
    turbidez: float = Field(..., ge=20.0, le=60.0, description="Turbidez (NTU)")
    colector_actual: float = Field(..., ge=45.0, le=55.0, description="Dosis de colector actual (L/h)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "temperatura": 28.5,
                "ph": 7.15,
                "ley_mineral": 0.88,
                "caudal": 505.0,
                "turbidez": 39.0,
                "colector_actual": 52.0,
            }
        }
    }


class Scenario(BaseModel):
    colector_L_h: float
    agua_m3_h: float
    recuperacion_pct: float
    costo_usd_h: float
    ahorro_vs_actual: float      # USD/día vs. dosis actual
    score_combinado: float       # 0–100 (0.6·recuperación + 0.4·ahorro)
    es_optimo: bool


class OptimizationResult(BaseModel):
    optimo: Scenario
    escenarios: List[Scenario]
    colector_actual: float
    delta_colector: float                 # L/h respecto a la dosis actual
    delta_recuperacion_pct: float         # puntos porcentuales ganados
    ahorro_diario: float                  # USD/día
    ahorro_anual: float                   # USD/año
    agua_ahorrada_m3h: float              # m³/h ahorrados (sostenibilidad)
    agua_ahorrada_m3dia: float            # m³/día ahorrados
    recomendacion: str
    disclaimer: str


class ModeloStatus(BaseModel):
    ok: bool
    modelos: dict[str, bool]
    fallback_analitico: bool
    mensaje: str
