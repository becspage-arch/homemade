/**
 * WHAT A SAMPLER DESIGN IS.
 *
 * A canvas size, the art that goes on it, the slots the words sit in, and the
 * one or two threads the words are worked in. The catalogue in `designs.ts` is
 * a list of these; the build script turns each one into a chart and publishes
 * it, and the personalise path re-letters the published chart from the same
 * slot list stored beside it.
 */

import type { Art } from './art'
import type { SamplerKind } from './kinds'
import type { SamplerLineSpec, SamplerRegion } from './chart'

/** Which of the design's threads a block of words is worked in. */
export type InkSlot = 'ink' | 'ink2'

export interface DesignBlock {
  region: SamplerRegion
  align: 'left' | 'centre' | 'right'
  vAlign: 'top' | 'middle' | 'bottom'
  lineGap: number
  ink: InkSlot
  lines: SamplerLineSpec[]
}

/**
 * The look a piece belongs to. Used to keep the SET varied rather than to
 * describe any one piece: a shelf of eight wreaths is a failure however good
 * each wreath is.
 */
export type SamplerLook =
  | 'floral wreath'
  | 'folk border'
  | 'modern minimal'
  | 'nursery motifs'
  | 'botanical band'
  | 'coastal'
  | 'traditional band sampler'
  | 'small hoop'
  | 'illustrated scene'

export interface SamplerDesign {
  slug: string
  kind: SamplerKind
  /** Catalogue title. Plain, no colon-subtitle. */
  name: string
  /** One line on the pattern page. What is on it, nothing else. */
  description: string
  look: SamplerLook
  width: number
  height: number
  /** The lettering threads. Neither may be used by the art. */
  ink: string
  ink2?: string
  /** Which illustrated motifs it draws on, for the spend record. */
  motifs?: Array<{ id: string; variant: number }>
  /** Paint the frame and the pictures. */
  art: () => Promise<Art>
  /**
   * Where the words go. A list when the design knows; a function when it has to
   * measure the art first, which is what the wreaths do: the opening in a ring
   * of roses is wherever the illustrator left it, so the slot is taken from the
   * art rather than guessed at. Resolved once at build and stored on the row, so
   * a personalised copy sets its words in exactly the same place.
   */
  blocks: DesignBlock[] | ((ctx: { art: Art; width: number; height: number }) => DesignBlock[])
}
