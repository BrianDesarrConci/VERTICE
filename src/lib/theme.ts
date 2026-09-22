// ============================================================
// Theming dinámico de marca.
// Convierte un color primario/secundario elegido por el admin en una
// escala completa (50–900) y la aplica como variables CSS, de modo que
// TODA la tienda (botones, badges, gradientes, foco) cambie al instante.
// ============================================================

export const DEFAULT_PRIMARY = '#7DD100';
export const DEFAULT_SECONDARY = '#BEEE00';

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return [125, 209, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix([r, g, b]: RGB, [r2, g2, b2]: RGB, w: number): RGB {
  return [
    Math.round(r + (r2 - r) * w),
    Math.round(g + (g2 - g) * w),
    Math.round(b + (b2 - b) * w),
  ];
}

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [17, 20, 12];

// Pesos para generar la escala a partir del color base (500).
const STEPS: Record<number, { toward: RGB; w: number }> = {
  50: { toward: WHITE, w: 0.9 },
  100: { toward: WHITE, w: 0.78 },
  200: { toward: WHITE, w: 0.58 },
  300: { toward: WHITE, w: 0.35 },
  400: { toward: WHITE, w: 0.16 },
  500: { toward: WHITE, w: 0 },
  600: { toward: BLACK, w: 0.14 },
  700: { toward: BLACK, w: 0.34 },
  800: { toward: BLACK, w: 0.5 },
  900: { toward: BLACK, w: 0.62 },
};

const channels = (rgb: RGB) => `${rgb[0]} ${rgb[1]} ${rgb[2]}`;

function hexToHslString(hex: string): string {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Calcula el mapa de variables CSS de marca (para aplicar global o en preview). */
export function computeBrandVars(primary: string, secondary: string): Record<string, string> {
  const base = hexToRgb(primary);
  const vars: Record<string, string> = {};
  for (const [step, { toward, w }] of Object.entries(STEPS)) {
    vars[`--brand-${step}`] = channels(mix(base, toward, w));
  }
  vars['--brand2'] = channels(hexToRgb(secondary));
  vars['--ring'] = hexToHslString(primary);
  return vars;
}

/** Aplica el color primario/secundario a las variables CSS del documento. */
export function applyBrandTheme(primary: string, secondary: string) {
  const root = document.documentElement;
  const vars = computeBrandVars(primary, secondary);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}
