// Utilidades de formato (moneda, fecha, número) centralizadas.

const CURRENCY = 'COP';
const LOCALE = 'es-CO';

/** Formatea un valor como moneda de la tienda (sin decimales para COP). */
export function formatCurrency(value: number, currency = CURRENCY): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Formatea una fecha ISO a formato legible (17 sep 2026). */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/** Fecha + hora corta. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Número compacto (1.2k, 3.4M). */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}
