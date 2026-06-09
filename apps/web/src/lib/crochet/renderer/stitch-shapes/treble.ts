import type { StitchShape } from '../types'

/**
 * Treble — `tr` (UK) — equivalent to US double crochet. Standard medium-
 * tall post with one yarn-over slash. Height 2 units. The single slash
 * mid-post is the convention that identifies it as a single-YO stitch.
 */
export const TREBLE: StitchShape = {
  key: 'treble',
  label: 'treble',
  heightUnits: 2,
  widthUnits: 1,
  // Long post (twin-stroke yarn body) + a diagonal slash through the
  // midline. The slash is rendered as a separate sub-path; the renderer's
  // stroke style applies to both.
  path:
    'M -0.16 -0.05 L -0.16 -1.92 Q -0.16 -2 0 -2 Q 0.16 -2 0.16 -1.92 L 0.16 -0.05 Z ' +
    'M -0.30 -0.85 L 0.30 -1.15',
  flavour: 'stroke',
}
