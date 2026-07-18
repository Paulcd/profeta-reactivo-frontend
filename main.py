"""
Profeta de Reactivos — API FastAPI
Optimización IA de dosis de colector para flotación de cobre.

Ejecutar:
    uvicorn main:app --reload --port 8000
"""
from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import optimizer
from logging_config import log_event, setup_logging
from schemas import InputValues, ModeloStatus, OptimizationResult

load_dotenv()
logger = setup_logging()

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    estado = optimizer.cargar_modelos()
    log_event(
        logger, logging.INFO, "modelos_cargados",
        estado=estado, fallback=optimizer.usando_fallback(),
    )
    yield


app = FastAPI(
    title="Profeta de Reactivos",
    description="Optimización IA de reactivos para minería de cobre — Cerro Verde, Arequipa.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    """Convierte errores de validación en mensajes claros (sin stack trace)."""
    detalles = []
    for err in exc.errors():
        campo = " → ".join(str(x) for x in err.get("loc", []) if x != "body")
        detalles.append(f"{campo}: {err.get('msg', 'valor inválido')}")
    mensaje = "Parámetros fuera de rango o inválidos. " + "; ".join(detalles)
    log_event(logger, logging.WARNING, "validacion_fallida", detalles=detalles)
    return JSONResponse(status_code=422, content={"error": mensaje, "data": None})


@app.exception_handler(Exception)
async def generic_handler(request: Request, exc: Exception):
    log_event(logger, logging.ERROR, "error_interno", error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"error": "Ocurrió un error interno al optimizar. Intenta de nuevo.", "data": None},
    )


@app.get("/", tags=["salud"])
async def root():
    return {"servicio": "Profeta de Reactivos", "estado": "activo", "version": "1.0.0"}


@app.get("/health", tags=["salud"])
async def health():
    """Health check: estado del servicio y de los modelos IA."""
    cargados = optimizer.modelos_cargados()
    return {
        "status": "ok",
        "modelos": cargados,
        "fallback_analitico": optimizer.usando_fallback(),
    }


@app.get("/api/modelos/status", response_model=ModeloStatus, tags=["modelos"])
async def modelos_status():
    """Verifica que los 3 modelos IA están cargados."""
    cargados = optimizer.modelos_cargados()
    fallback = optimizer.usando_fallback()
    todos = all(cargados.values())
    mensaje = (
        "Los 3 modelos IA están cargados y operativos."
        if todos
        else "Operando con modelo analítico de respaldo (algún .pkl no se encontró)."
    )
    return ModeloStatus(
        ok=True,
        modelos=cargados,
        fallback_analitico=fallback,
        mensaje=mensaje,
    )


async def _optimizar(inputs: InputValues) -> OptimizationResult:
    t0 = time.perf_counter()
    resultado = optimizer.optimizar(inputs)
    dt_ms = (time.perf_counter() - t0) * 1000.0
    log_event(
        logger, logging.INFO, "optimizacion_ok",
        latencia_ms=round(dt_ms, 1),
        colector_actual=inputs.colector_actual,
        colector_optimo=resultado.optimo.colector_L_h,
        ahorro_anual=resultado.ahorro_anual,
    )
    return resultado


@app.post("/optimizar", response_model=OptimizationResult, tags=["optimizacion"])
async def optimizar(inputs: InputValues):
    """Grid Search de 9 escenarios (45–53 L/h) → dosis de colector óptima."""
    return await _optimizar(inputs)


@app.post("/api/optimizar", response_model=OptimizationResult, tags=["optimizacion"])
async def optimizar_api(inputs: InputValues):
    """Alias de /optimizar (compatibilidad con el esquema de rutas del PDF)."""
    return await _optimizar(inputs)
