import axios from "axios";
import type { InputValues, OptimizationResult } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export async function optimizar(
  inputs: InputValues
): Promise<OptimizationResult> {
  const { data } = await client.post<OptimizationResult>("/optimizar", inputs);
  return data;
}

export async function health(): Promise<boolean> {
  try {
    const { data } = await client.get("/health");
    return data?.status === "ok";
  } catch {
    return false;
  }
}
