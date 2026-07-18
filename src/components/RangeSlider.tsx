import { num } from '../utils/format';

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

export function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: RangeSliderProps) {
  const decimals = step < 0.1 ? 2 : step < 1 ? 1 : 0;
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    // Validación de rango antes de propagar.
    if (Number.isFinite(next)) {
      onChange(Math.min(max, Math.max(min, next)));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label className="mono text-sm text-text-muted">{label}</label>
        <span className="mono text-base font-semibold text-ocre">
          {num(value, decimals)}
          <span className="ml-1 text-xs text-text-muted">{unit}</span>
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-label={label}
        style={{
          background: `linear-gradient(to right, var(--color-primary) ${pct}%, var(--color-border) ${pct}%)`,
        }}
      />

      <span className="mono text-[11px] text-text-muted">
        {num(min, decimals)}–{num(max, decimals)} {unit}
      </span>
    </div>
  );
}
