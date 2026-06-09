import type { StitchShape } from '../types'

/**
 * Triple treble — `trtr` (UK) — equivalent to US double treble. Three
 * yarn-over slashes. Height 3.6 units.
 */
export const TRIPLE_TREBLE: StitchShape = {
  key: 'triple-treble',
  label: 'triple treble',
  heightUnits: 3.6,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -3.52 Q -0.16 -3.6 0 -3.6 Q 0.16 -3.6 0.16 -3.52 L 0.16 -0.05 Z ' +
    'M -0.30 -1.10 L 0.30 -1.40 ' +
    'M -0.30 -1.85 L 0.30 -2.15 ' +
    'M -0.30 -2.60 L 0.30 -2.90',
  flavour: 'stroke',
}

/**
 * Quadruple treble — `qtr` (UK). Even taller; four slashes. Height 4.4.
 */
export const QUADRUPLE_TREBLE: StitchShape = {
  key: 'quadruple-treble',
  label: 'quadruple treble',
  heightUnits: 4.4,
  widthUnits: 1,
  path:
    'M -0.16 -0.05 L -0.16 -4.32 Q -0.16 -4.4 0 -4.4 Q 0.16 -4.4 0.16 -4.32 L 0.16 -0.05 Z ' +
    'M -0.30 -1.20 L 0.30 -1.50 ' +
    'M -0.30 -1.95 L 0.30 -2.25 ' +
    'M -0.30 -2.70 L 0.30 -3.00 ' +
    'M -0.30 -3.45 L 0.30 -3.75',
  flavour: 'stroke',
}
