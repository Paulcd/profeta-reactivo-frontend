/** Formatea USD sin decimales: 94900 → "94,900". */
export function usd(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Math.round(value),
  );
}

/** Número con `n` decimales y separador de miles. */
export function num(value: number, decimals = 1): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Delta con signo: 3.3 → "+3.3", -2 → "-2.0". */
export function signed(value: number, decimals = 1): string {
  const s = num(Math.abs(value), decimals);
  return `${value >= 0 ? '+' : '-'}${s}`;
}
