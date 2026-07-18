import { SlidersHorizontal } from 'lucide-react';
import type { InputValues, SliderConfig } from '../types';
import { RangeSlider } from './RangeSlider';

interface InputPanelProps {
  values: InputValues;
  onChange: (values: InputValues) => void;
}

const SLIDERS: SliderConfig[] = [
  { key: 'temperatura', label: 'Temperatura', min: 20, max: 35, step: 0.5, unit: '°C' },
  { key: 'ph', label: 'pH', min: 6.5, max: 8, step: 0.1, unit: 'pH' },
  { key: 'ley_mineral', label: 'Ley de mineral', min: 0.5, max: 1.5, step: 0.01, unit: '%' },
  { key: 'caudal', label: 'Caudal de pulpa', min: 220, max: 420, step: 5, unit: 'm³/h' },
  { key: 'turbidez', label: 'Turbidez', min: 5, max: 40, step: 1, unit: 'NTU' },
  { key: 'colector_actual', label: 'Colector actual', min: 30, max: 65, step: 0.5, unit: 'L/h' },
];

export function InputPanel({ values, onChange }: InputPanelProps) {
  const handleSlider = (key: keyof InputValues) => (value: number) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <section className="card p-6">
      <div className="mb-6 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-pacifico" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Condiciones de proceso
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        {SLIDERS.map((s) => (
          <RangeSlider
            key={s.key}
            label={s.label}
            value={values[s.key]}
            min={s.min}
            max={s.max}
            step={s.step}
            unit={s.unit}
            onChange={handleSlider(s.key)}
          />
        ))}
      </div>
    </section>
  );
}
