import type { StitchShape } from '../types'

/**
 * Join methods used between motifs / pieces. These don't appear inside
 * a chart's `stitches` array — they're used to render swatch previews for
 * the three Stitch master-table rows that describe joining techniques
 * (`crochet-join-as-you-go`, `crochet-slip-stitch-seam`,
 * `crochet-whipstitch-join`).
 *
 * The renderer treats them as horizontal connector shapes: rather than
 * a vertical post, the silhouette runs along the seam between two motif
 * edges. Swatches render them in context (two short edges stacked with
 * the join running between).
 */

export const JOIN_AS_YOU_GO: StitchShape = {
  key: 'join-as-you-go',
  label: 'join as you go',
  heightUnits: 0.6,
  widthUnits: 1.2,
  // Reads as a small bridging stitch tying two edges together — a slip-stitch
  // pulled through both motifs.
  path:
    'M -0.55 -0.10 Q 0 -0.55 0.55 -0.10 ' +
    'M -0.50 -0.05 Q 0 -0.40 0.50 -0.05 ' +
    'M -0.18 -0.25 L 0.18 -0.25',
  flavour: 'flat',
}

export const SLIP_STITCH_SEAM: StitchShape = {
  key: 'slip-stitch-seam',
  label: 'slip stitch seam',
  heightUnits: 0.45,
  widthUnits: 1.2,
  // Continuous slip-stitch chain along the seam.
  path:
    'M -0.55 -0.20 ' +
    'Q -0.40 -0.05 -0.25 -0.20 ' +
    'Q -0.10 -0.05 0.05 -0.20 ' +
    'Q 0.20 -0.05 0.35 -0.20 ' +
    'Q 0.50 -0.05 0.55 -0.20',
  flavour: 'flat',
}

export const WHIPSTITCH_JOIN: StitchShape = {
  key: 'whipstitch-join',
  label: 'whipstitch join',
  heightUnits: 0.6,
  widthUnits: 1.2,
  // Diagonal whip-stitches running along the seam.
  path:
    'M -0.55 -0.05 L -0.40 -0.45 ' +
    'M -0.30 -0.05 L -0.15 -0.45 ' +
    'M -0.05 -0.05 L 0.10 -0.45 ' +
    'M 0.20 -0.05 L 0.35 -0.45 ' +
    'M 0.45 -0.05 L 0.55 -0.25',
  flavour: 'flat',
}
