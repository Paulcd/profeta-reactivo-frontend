"""
Modelo de dominio: física simplificada de la flotación de cobre.

Se usa para:
  1. Generar datos sintéticos de entrenamiento (train_models.py).
  2. Fallback analítico si los .pkl no están disponibles (optimizer.py).

Relaciones plausibles para flotación de sulfuros de cobre:
  - La recuperación crece con el colector pero tiene un PICO (la sobredosis
    deprime la selectividad) → curva cóncava con máximo intermedio.
  - El consumo de agua sube ~linealmente con el caudal y con el colector.
  - El costo sube ~linealmente con el colector (reactivo) + agua + energía.
  - Ley mineral alta mejora la recuperación; turbidez alta la reduce.

Rangos operativos (alineados con los sliders del frontend / PDF):
  temperatura  20–35 °C     (default 28)
  pH           6.5–8.0      (default 7.2)
  ley_mineral  0.70–1.00 %  (default 0.85)
  caudal       400–600 m³/h (default 500)
  turbidez     20–60 NTU    (default 42)
  colector     45–55 L/h    (grid de optimización 45–53)
"""
from __future__ import annotations

# --- Constantes económicas (USD) ---
PRECIO_COBRE_USD_TON = 9500.0      # precio spot LME aprox.
PRECIO_COLECTOR_USD_L = 2.80       # xantato / reactivo colector
PRECIO_AGUA_USD_M3 = 0.35          # agua industrial recuperada
ENERGIA_BASE_USD_H = 2600.0        # energía + molienda + insumos base por hora
FACTOR_SOLIDOS_TON_M3 = 0.90       # toneladas de mena por m³ de pulpa
DIAS_OPERATIVOS_ANIO = 365         # días de operación al año


def agua_consumida(caudal: float, colector: float, turbidez: float) -> float:
    """Agua de proceso (m³/h): sube ~lineal con caudal y colector."""
    agua = 0.85 * caudal + 1.8 * colector + 0.30 * max(0.0, turbidez - 20.0)
    return max(0.0, agua)


def recuperacion(
    colector: float,
    temperatura: float,
    ph: float,
    ley_mineral: float,
    turbidez: float,
) -> float:
    """Recuperación de cobre (%): curva cóncava con pico en la dosis óptima."""
    # La dosis óptima se desplaza según las condiciones del mineral.
    dose_opt = (
        48.0
        + 15.0 * (ley_mineral - 0.85)   # mineral rico → necesita algo más de colector
        - 2.5 * (ph - 7.2)              # pH alto desplaza el óptimo a la baja
        + 0.20 * (temperatura - 28.0)
    )
    # Techo de recuperación alcanzable en el óptimo.
    techo = (
        84.0
        + 9.0 * (ley_mineral - 0.85)    # ley alta mejora la recuperación
        - 1.2 * abs(ph - 7.2)           # desviarse del pH ideal penaliza
        - 0.06 * max(0.0, turbidez - 20.0)  # turbidez alta reduce recuperación
        + 0.12 * (temperatura - 28.0)
    )
    curvatura = 0.22
    rec = techo - curvatura * (colector - dose_opt) ** 2
    return max(40.0, min(96.0, rec))


def costo_operacion(colector: float, agua: float, turbidez: float) -> float:
    """Costo operativo (USD/h): sube lineal con el colector."""
    costo = (
        ENERGIA_BASE_USD_H
        + colector * PRECIO_COLECTOR_USD_L
        + agua * PRECIO_AGUA_USD_M3
        + turbidez * 0.40
    )
    return costo


def ingreso_cobre(recuperacion_pct: float, ley_mineral: float, caudal: float) -> float:
    """Ingreso por cobre recuperado (USD/h)."""
    mena_ton_h = caudal * FACTOR_SOLIDOS_TON_M3
    cobre_ton_h = mena_ton_h * (ley_mineral / 100.0) * (recuperacion_pct / 100.0)
    return cobre_ton_h * PRECIO_COBRE_USD_TON


def beneficio(
    recuperacion_pct: float,
    costo_usd_h: float,
    ley_mineral: float,
    caudal: float,
) -> float:
    """Beneficio neto (USD/h) = ingreso por cobre - costo operativo."""
    return ingreso_cobre(recuperacion_pct, ley_mineral, caudal) - costo_usd_h
