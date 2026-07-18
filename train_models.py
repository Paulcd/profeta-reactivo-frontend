"""
Entrena y persiste los 3 modelos de IA (XGBoost + Joblib):
  - modelo_agua.pkl          → agua consumida (m³/h)
  - modelo_recuperacion.pkl  → recuperación de cobre (%)
  - modelo_costo.pkl         → costo operativo (USD/h)

Genera ~1000 muestras SCADA sintéticas a partir del modelo de dominio
(domain.py) + ruido gaussiano calibrado para que el R² quede en 0.80–0.88
(realista, no perfecto), entrena un XGBRegressor por objetivo y guarda un
dataset de referencia en ./data/.

Uso:
    python train_models.py
"""
from __future__ import annotations

import os

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

import domain

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

# Orden de features que consumen los modelos (debe coincidir con optimizer.py)
FEATURES = ["temperatura", "ph", "ley_mineral", "caudal", "turbidez", "colector"]
N_MUESTRAS = 1000
SEED = 42

# Fracción de ruido gaussiano relativa a la desviación de cada objetivo.
# Calibrada por variable para que el R² de test caiga en 0.80–0.88 (realista,
# no perfecto). R² ≈ 1/(1+k²) menos la pérdida por ajuste imperfecto de XGBoost.
K_RUIDO = {
    "agua_m3h": 0.40,
    "recuperacion_pct": 0.32,
    "costo_usdh": 0.40,
}


def generar_dataset(n: int, rng: np.random.Generator) -> pd.DataFrame:
    """Genera un dataset SCADA sintético físicamente plausible."""
    temperatura = rng.uniform(20.0, 35.0, n)
    ph = rng.uniform(6.5, 8.0, n)
    ley_mineral = rng.uniform(0.70, 1.00, n)
    caudal = rng.uniform(400.0, 600.0, n)
    turbidez = rng.uniform(20.0, 60.0, n)
    # Colector con margen sobre el grid [45..53] para capturar la curvatura.
    colector = rng.uniform(42.0, 56.0, n)

    agua = np.array([
        domain.agua_consumida(c, col, t)
        for c, col, t in zip(caudal, colector, turbidez)
    ])
    rec = np.array([
        domain.recuperacion(col, temp, p, ley, turb)
        for col, temp, p, ley, turb in zip(colector, temperatura, ph, ley_mineral, turbidez)
    ])
    costo = np.array([
        domain.costo_operacion(col, a, turb)
        for col, a, turb in zip(colector, agua, turbidez)
    ])

    # Ruido gaussiano proporcional a la variabilidad de cada objetivo.
    agua = agua + rng.normal(0.0, K_RUIDO["agua_m3h"] * agua.std(), n)
    rec = rec + rng.normal(0.0, K_RUIDO["recuperacion_pct"] * rec.std(), n)
    costo = costo + rng.normal(0.0, K_RUIDO["costo_usdh"] * costo.std(), n)

    return pd.DataFrame({
        "temperatura": temperatura,
        "ph": ph,
        "ley_mineral": ley_mineral,
        "caudal": caudal,
        "turbidez": turbidez,
        "colector": colector,
        "agua_m3h": np.clip(agua, 0.0, None),
        "recuperacion_pct": np.clip(rec, 40.0, 96.0),
        "costo_usdh": costo,
    })


def entrenar(df: pd.DataFrame, objetivo: str) -> XGBRegressor:
    X = df[FEATURES].values
    y = df[objetivo].values
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=SEED)
    modelo = XGBRegressor(
        n_estimators=250,
        max_depth=3,
        learning_rate=0.06,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_lambda=1.0,
        random_state=SEED,
        n_jobs=-1,
    )
    modelo.fit(X_tr, y_tr)
    pred = modelo.predict(X_te)
    print(f"  [{objetivo:16}] R²={r2_score(y_te, pred):.4f}  MAE={mean_absolute_error(y_te, pred):.3f}")
    return modelo


def main() -> None:
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    rng = np.random.default_rng(SEED)

    print(f"Generando {N_MUESTRAS} muestras SCADA sintéticas...")
    df = generar_dataset(N_MUESTRAS, rng)

    print("Entrenando modelos XGBoost:")
    modelos = {
        "modelo_agua.pkl": entrenar(df, "agua_m3h"),
        "modelo_recuperacion.pkl": entrenar(df, "recuperacion_pct"),
        "modelo_costo.pkl": entrenar(df, "costo_usdh"),
    }

    for nombre, modelo in modelos.items():
        ruta = os.path.join(MODELS_DIR, nombre)
        joblib.dump(modelo, ruta)
        print(f"  Guardado: {ruta}")

    # Datasets de referencia para el repo /data
    df.to_csv(os.path.join(DATA_DIR, "scada_historical.csv"), index=False)
    sim = df.sort_values("colector").head(300)
    sim.to_csv(os.path.join(DATA_DIR, "simulacion_colector.csv"), index=False)
    print(f"Datasets escritos en: {DATA_DIR}")
    print("Listo.")


if __name__ == "__main__":
    main()
