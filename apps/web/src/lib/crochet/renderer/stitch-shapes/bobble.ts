import type { StitchShape } from '../types'

/**
 * Bobble — `bo`. A cluster of unfinished trebles worked into one stitch,
 * then closed. Reads as a small rounded protrusion. Renders as a filled
 * oval that sits proud of the surrounding stitches.
 */
export const BOBBLE: StitchShape = {
  key: 'bobble',
  label: 'bobble',
  heightUnits: 1.5,
  widthUnits: 1,
  // Stroke path stays simple — a stub post that anchors the bobble.
  path: 'M -0.10 -0.10 L -0.10 -0.50 M 0.10 -0.10 L 0.10 -0.50',
  // Fill path is the actual rounded blob (the visible bobble).
  fillPath:
    'M -0.34 -1.0 Q -0.42 -0.5 -0.10 -0.5 Q 0.10 -0.5 0.42 -0.5 ' +
    'Q 0.42 -0.5 0.34 -1.0 Q 0 -1.45 -0.34 -1.0 Z',
  flavour: 'stroke-and-fill',
}
