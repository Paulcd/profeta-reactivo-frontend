import { SlidersHorizontal } from "lucide-react";
import type { InputValues } from "../types";
import Slider from "./Slider";

interface InputPanelProps {
  values: InputValues;
  onChange: (patch: Partial<InputValues>) => void;
}

export default function InputPanel({ values, onChange }: InputPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="w-5 h-5 text-ocre-500" />
        <h2 className="text-lg font-bold text-slate-800">
          Condiciones de proceso
        </h2>
      </div>

      <Slider
        label="Temperatura"
        value={values.temperatura}
        min={20}
        max={35}
        step={0.1}
        unit="°C"
        decimals={1}
        onChange={(v) => onChange({ temperatura: v })}
      />
      <Slider
        label="pH de la pulpa"
        value={values.ph}
        min={6.5}
        max={8.0}
        step={0.05}
        decimals={2}
        onChange={(v) => onChange({ ph: v })}
      />
      <Slider
        label="Ley mineral (Cu)"
        value={values.ley_mineral}
        min={0.7}
        max={1.0}
        step={0.01}
        unit="%"
        decimals={2}
        onChange={(v) => onChange({ ley_mineral: v })}
      />
      <Slider
        label="Caudal de pulpa"
        value={values.caudal}
        min={400}
        max={600}
        step={1}
        unit="m³/h"
        decimals={0}
        onChange={(v) => onChange({ caudal: v })}
      />
      <Slider
        label="Turbidez"
        value={values.turbidez}
        min={20}
        max={60}
        step={1}
        unit="NTU"
        decimals={0}
        onChange={(v) => onChange({ turbidez: v })}
      />
      <div className="mt-2 pt-4 border-t border-dashed border-slate-200">
        <Slider
          label="Colector actual"
          value={values.colector_actual}
          min={45}
          max={55}
          step={0.5}
          unit="L/h"
          decimals={1}
          onChange={(v) => onChange({ colector_actual: v })}
        />
      </div>
    </div>
  );
}
