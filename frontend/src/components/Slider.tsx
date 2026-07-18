interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  decimals?: number;
  onChange: (value: number) => void;
}

export default function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  decimals = 0,
  onChange,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        <span className="text-base font-bold text-pacifico-700 tabular-nums">
          {value.toFixed(decimals)}
          <span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #2e8b9e 0%, #2e8b9e ${pct}%, #e7d1ac ${pct}%, #e7d1ac 100%)`,
        }}
      />
      <div className="flex justify-between mt-1 text-[11px] text-slate-400 tabular-nums">
        <span>
          {min.toFixed(decimals)} {unit}
        </span>
        <span>
          {max.toFixed(decimals)} {unit}
        </span>
      </div>
    </div>
  );
}
