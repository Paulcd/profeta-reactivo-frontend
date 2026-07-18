"""
Motor de optimización: carga los modelos IA y ejecuta un Grid Search
sobre el colector en [45..53] (paso 1 = 9 escenarios) para recomendar la
dosis óptima según el score combinado recuperación/ahorro.

Si los .pkl no están disponibles, usa el modelo analítico de dominio
(domain.py) como fallback, para que la demo NUNCA falle.
"""
from __future__ import annotations

import os
from typing import Dict, List, Optional

import joblib
import numpy as np

import domain
from schemas import InputValues, OptimizationResult, Scenario

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

FEATURES_ORDER = ["temperatura", "ph", "ley_mineral", "caudal", "turbidez", "colector"]

# Grid Search fijo sobre el colector: [45, 46, ..., 53] → 9 escenarios.
DOSE_MIN, DOSE_MAX, DOSE_STEP = 45.0, 53.0, 1.0

# Pesos del score combinado.
PESO_RECUPERACION = 0.6
PESO_AHORRO = 0.4

DISCLAIMER = "Recomendación basada en datos observacionales; validar en planta."

_MODELOS: Dict[str, Optional[object]] = {
    "agua": None,
    "recuperacion": None,
    "costo": None,
}


def cargar_modelos() -> Dict[str, bool]:
    """Carga los 3 modelos desde disco. Devuelve el estado de cada uno."""
    archivos = {
        "agua": "modelo_agua.pkl",
        "recuperacion": "modelo_recuperacion.pkl",
        "costo": "modelo_costo.pkl",
    }
    estado: Dict[str, bool] = {}
    for clave, archivo in archivos.items():
        ruta = os.path.join(MODELS_DIR, archivo)
        try:
            _MODELOS[clave] = joblib.load(ruta)
            estado[clave] = True
        except Exception:
            _MODELOS[clave] = None
            estado[clave] = False
    return estado


def modelos_cargados() -> Dict[str, bool]:
    return {k: v is not None for k, v in _MODELOS.items()}


def usando_fallback() -> bool:
    return any(v is None for v in _MODELOS.values())


def _predecir(inputs: InputValues, colector: float) -> tuple[float, float, float]:
    """Predice (agua, recuperacion, costo) para una dosis de colector dada."""
    if not usando_fallback():
        X = np.array([[
            inputs.temperatura,
            inputs.ph,
            inputs.ley_mineral,
            inputs.caudal,
            inputs.turbidez,
            colector,
        ]])
        agua = float(_MODELOS["agua"].predict(X)[0])          # type: ignore[union-attr]
        rec = float(_MODELOS["recuperacion"].predict(X)[0])   # type: ignore[union-attr]
        costo = float(_MODELOS["costo"].predict(X)[0])        # type: ignore[union-attr]
    else:
        agua = domain.agua_consumida(inputs.caudal, colector, inputs.turbidez)
        rec = domain.recuperacion(colector, inputs.temperatura, inputs.ph, inputs.ley_mineral, inputs.turbidez)
        costo = domain.costo_operacion(colector, agua, inputs.turbidez)

    agua = max(0.0, agua)
    rec = max(40.0, min(96.0, rec))
    costo = max(0.0, costo)
    return agua, rec, costo


def _grid_colector() -> List[float]:
    """Grid fijo de 9 dosis: [45, 46, ..., 53] L/h."""
    n = int(round((DOSE_MAX - DOSE_MIN) / DOSE_STEP)) + 1
    return [round(DOSE_MIN + i * DOSE_STEP, 1) for i in range(n)]


def optimizar(inputs: InputValues) -> OptimizationResult:
    """Ejecuta el Grid Search de 9 escenarios y arma el resultado."""
    dosis = _grid_colector()

    # Métricas en la dosis actual (referencia para ahorro y agua).
    agua_a, rec_a, costo_a = _predecir(inputs, inputs.colector_actual)

    filas = []
    for col in dosis:
        agua, rec, costo = _predecir(inputs, col)
        ahorro_h = costo_a - costo          # USD/h ahorrados vs. actual (>0 = ahorro)
        agua_ahorro_h = agua_a - agua       # m³/h de agua ahorrada vs. actual
        filas.append({
            "colector": col,
            "agua": agua,
            "rec": rec,
            "costo": costo,
            "ahorro_h": ahorro_h,
            "agua_ahorro_h": agua_ahorro_h,
        })

    # --- Normalización para el score combinado ---
    recs = [f["rec"] for f in filas]
    costos = [f["costo"] for f in filas]
    rec_min, rec_max = min(recs), max(recs)
    costo_min, costo_max = min(costos), max(costos)
    rango_rec = (rec_max - rec_min) or 1.0
    rango_costo = (costo_max - costo_min) or 1.0

    scores = []
    for f in filas:
        rec_norm = (f["rec"] - rec_min) / rango_rec           # 1 = máxima recuperación
        ahorro_norm = (costo_max - f["costo"]) / rango_costo  # 1 = más barato (más ahorro)
        score = PESO_RECUPERACION * rec_norm + PESO_AHORRO * ahorro_norm
        scores.append(score)

    idx_optimo = int(np.argmax(scores))

    escenarios: List[Scenario] = []
    for i, f in enumerate(filas):
        escenarios.append(Scenario(
            colector_L_h=round(f["colector"], 1),
            agua_m3_h=round(f["agua"], 1),
            recuperacion_pct=round(f["rec"], 2),
            costo_usd_h=round(f["costo"], 1),
            ahorro_vs_actual=round(f["ahorro_h"] * 24.0, 1),  # USD/día
            score_combinado=round(100.0 * scores[i], 1),
            es_optimo=(i == idx_optimo),
        ))

    optimo = escenarios[idx_optimo]
    fila_opt = filas[idx_optimo]

    delta_colector = round(optimo.colector_L_h - inputs.colector_actual, 1)
    delta_rec = round(optimo.recuperacion_pct - rec_a, 2)
    ahorro_diario = round(fila_opt["ahorro_h"] * 24.0, 1)
    ahorro_anual = round(ahorro_diario * domain.DIAS_OPERATIVOS_ANIO, 0)
    agua_ahorro_h = round(fila_opt["agua_ahorro_h"], 1)
    agua_ahorro_dia = round(fila_opt["agua_ahorro_h"] * 24.0, 1)

    recomendacion = _construir_recomendacion(
        inputs, optimo, rec_a, delta_rec, ahorro_diario, agua_ahorro_dia, len(dosis)
    )

    return OptimizationResult(
        optimo=optimo,
        escenarios=escenarios,
        colector_actual=round(inputs.colector_actual, 1),
        delta_colector=delta_colector,
        delta_recuperacion_pct=delta_rec,
        ahorro_diario=ahorro_diario,
        ahorro_anual=ahorro_anual,
        agua_ahorrada_m3h=agua_ahorro_h,
        agua_ahorrada_m3dia=agua_ahorro_dia,
        recomendacion=recomendacion,
        disclaimer=DISCLAIMER,
    )


def _construir_recomendacion(
    inputs: InputValues,
    optimo: Scenario,
    rec_actual: float,
    delta_rec: float,
    ahorro_diario: float,
    agua_ahorro_dia: float,
    n: int,
) -> str:
    delta = round(optimo.colector_L_h - inputs.colector_actual, 1)
    if abs(delta) < 0.5:
        accion = f"Mantén el colector en {optimo.colector_L_h} L/h"
        motivo = "ya estás operando muy cerca del punto óptimo"
    elif delta < 0:
        accion = f"Baja el colector a {optimo.colector_L_h} L/h ({delta} L/h)"
        motivo = "recuperas prácticamente el mismo cobre gastando menos reactivo y agua"
    else:
        accion = f"Sube el colector a {optimo.colector_L_h} L/h (+{delta} L/h)"
        motivo = "el cobre extra recuperado supera el costo del reactivo adicional"

    partes = [f"{accion}: {motivo}."]
    partes.append(
        f"Probé {n} dosis internamente (45–53 L/h) y esta gana con el mejor balance "
        f"recuperación/costo: recuperación {rec_actual:.1f}% → {optimo.recuperacion_pct:.1f}% "
        f"({'+' if delta_rec >= 0 else ''}{delta_rec} pts)."
    )
    if ahorro_diario > 0:
        partes.append(f"Ahorro aproximado: US${ahorro_diario:,.0f}/día.")
    if agua_ahorro_dia > 0:
        partes.append(f"Sostenibilidad: {agua_ahorro_dia:,.0f} m³ de agua ahorrados al día.")

    return " ".join(partes)
