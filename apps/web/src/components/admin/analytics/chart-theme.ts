/**
 * Brand visual treatment for every chart in /admin/analytics.
 *
 * Palette + typography pulled from globals.css `@theme` so the charts
 * track any future brand-token change automatically. Constraints from
 * phase_analytics_self_hosted_001 brief:
 *
 *  - sage primary, warm-taupe secondary, parchment background
 *  - sage-faded grid (15% alpha)
 *  - Fraunces for titles, Lora for labels, monospace for numbers
 *  - flat — no gradients, no 3D, no curve fills
 *  - one chart per card, generous internal padding (16–24px)
 */

export const CHART_COLORS = {
  primary: '#6b7558', // sage
  primarySoft: '#8a9778', // soft-sage
  primaryDeep: '#4a5640', // forest
  secondary: '#5c5347', // warm-taupe
  accent: '#a86547', // burnt-sienna (used sparingly for warning highlights)
  honey: '#d4a574',
  teal: '#3d5a5c',
  softTeal: '#7a9695',
  background: '#efe6d6', // soft-parchment
  surface: '#f5f0e8', // linen-cream
  grid: 'rgba(107, 117, 88, 0.15)', // sage @ 15%
  text: '#3d2f22', // espresso
  muted: '#5c5347', // warm-taupe
}

export const CHART_FONTS = {
  title: 'var(--font-fraunces), serif',
  label: 'var(--font-lora), serif',
  number: 'var(--font-mono, ui-monospace), monospace',
}

export const TOOLTIP_STYLE: React.CSSProperties = {
  background: '#f5f0e8',
  border: '0.5px solid #c8c4b8',
  borderRadius: 4,
  padding: '8px 12px',
  fontFamily: CHART_FONTS.label,
  fontSize: 13,
  color: CHART_COLORS.text,
  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
}

export const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  fontFamily: CHART_FONTS.label,
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: CHART_COLORS.muted,
  marginBottom: 4,
}

export const TOOLTIP_ITEM_STYLE: React.CSSProperties = {
  fontFamily: CHART_FONTS.number,
  fontVariantNumeric: 'tabular-nums',
  fontSize: 14,
  color: CHART_COLORS.text,
}

export const AXIS_TICK_STYLE = {
  fontFamily: CHART_FONTS.label,
  fontSize: 11,
  fill: CHART_COLORS.muted,
}

/**
 * Two-tone sage shade for the cohort retention heatmap. Returns a hex
 * colour interpolated between parchment (rate=0) and forest (rate=1).
 */
export function sageShade(rate: number): string {
  const t = Math.max(0, Math.min(1, rate))
  const from = { r: 0xef, g: 0xe6, b: 0xd6 } // soft-parchment
  const to = { r: 0x4a, g: 0x56, b: 0x40 } // forest
  const r = Math.round(from.r + (to.r - from.r) * t)
  const g = Math.round(from.g + (to.g - from.g) * t)
  const b = Math.round(from.b + (to.b - from.b) * t)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Pick a readable text colour for a sage-shaded background.
 */
export function readableOn(rate: number): string {
  return rate > 0.45 ? '#f5f0e8' : '#3d2f22'
}
