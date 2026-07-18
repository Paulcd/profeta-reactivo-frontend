# Profeta de Reactivos

**Optimización IA de la dosis de colector para flotación de cobre — Cerro Verde (Perú).**

Sistema que recomienda la dosis óptima de colector (reactivo, en L/h) probando 9 escenarios
internamente con 3 modelos XGBoost y justificando por qué gana el elegido: máxima recuperación
de cobre con el mejor balance de costo y consumo de agua.

---

## Arquitectura

- **Backend** (Python 3.10+, FastAPI): genera un dataset SCADA sintético (~1000 filas),
  entrena 3 modelos XGBoost (agua, recuperación, costo) y expone una API que hace Grid Search
  sobre el colector en `[45..53]` L/h.
- **Frontend** (React 18 + TypeScript + Vite + Tailwind + Recharts + Axios): 6 sliders con
  debounce que llaman a la API automáticamente y muestran la recomendación, las sub-métricas,
  la tabla de 9 escenarios, el gráfico recuperación vs. colector y la justificación.

```
domain.py (física + precios) → train_models.py (dataset + modelos .pkl)
                                        │
                                 optimizer.py (Grid Search 45–53, score 0.6·rec + 0.4·ahorro)
                                        │
                                 main.py (FastAPI: /optimizar, /health)
                                        │
                                 frontend (React) → dashboard
```

---

## Requisitos

- Python 3.10+
- Node.js 18+ y npm

---

## 1. Backend (`:8000`)

Desde la raíz del proyecto (`profeta-reactivo-backend-main`):

### Windows (PowerShell / CMD)

```bash
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

# Genera dataset + entrena y guarda los 3 modelos en models/
python train_models.py

# Levanta la API
uvicorn main:app --reload --port 8000
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
python train_models.py
uvicorn main:app --reload --port 8000
```

Verifica que responde:

```bash
curl http://localhost:8000/health
# {"status":"ok","modelos":{"agua":true,"recuperacion":true,"costo":true},"fallback_analitico":false}
```

Ejemplo de optimización:

```bash
curl -X POST http://localhost:8000/optimizar \
  -H "Content-Type: application/json" \
  -d '{"temperatura":28.5,"ph":7.15,"ley_mineral":0.88,"caudal":505,"turbidez":39,"colector_actual":52}'
```

---

## 2. Frontend (`:5173`)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) (el backend debe estar corriendo en `:8000`).

La URL del backend se configura en `frontend/.env.local` (`VITE_API_URL=http://localhost:8000`).

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio y de los modelos |
| POST | `/optimizar` | Grid Search de 9 escenarios → dosis óptima |
| POST | `/api/optimizar` | Alias de `/optimizar` |
| GET | `/api/modelos/status` | Detalle del estado de los modelos |
| GET | `/docs` | Documentación interactiva (Swagger) |

### Entrada de `/optimizar`

| Campo | Rango | Unidad |
|---|---|---|
| `temperatura` | 20–35 | °C |
| `ph` | 6.5–8.0 | – |
| `ley_mineral` | 0.70–1.00 | % |
| `caudal` | 400–600 | m³/h |
| `turbidez` | 20–60 | NTU |
| `colector_actual` | 45–55 | L/h |

### Salida

Ganador (`optimo`), los 9 `escenarios`, deltas vs. la dosis actual, `ahorro_diario`/`ahorro_anual`,
`agua_ahorrada_m3dia` (sostenibilidad), la `recomendacion` textual y el `disclaimer`.

---

## Modelos

3 `XGBRegressor` entrenados sobre ~1000 muestras sintéticas con ruido gaussiano calibrado
(R² de test ~0.80–0.84, realista):

| Modelo | Objetivo | Archivo |
|---|---|---|
| Agua | m³/h | `models/modelo_agua.pkl` |
| Recuperación | % | `models/modelo_recuperacion.pkl` |
| Costo | USD/h | `models/modelo_costo.pkl` |

Si los `.pkl` no existen, la API usa el modelo analítico de `domain.py` como respaldo (la demo
nunca falla). Para reentrenar: `python train_models.py`.

---

## Nota

> Recomendación basada en datos observacionales; validar en planta.

Los datos son **sintéticos** (MVP de hackathon). Sin auth, base de datos, tests ni deploy.
