/**
 * The needlework pattern-maker engine — shared types.
 *
 * One engine, two input paths (a design brief, or a reference photo/artwork),
 * both feeding the SAME deterministic back half:
 *
 *   input -> Flux line-art DESIGN (the ONLY AI step)
 *         -> bitmap (flat colour illustration)
 *         -> segment into regions
 *         -> assign a stitch slug + DMC floss + geometry to each region
 *         -> stitchedElements  (the loom render contract)
 *         -> loom renderHero   (finished-piece photo)
 *
 * The locked rule ([[feedback_hero_must_be_exact_pattern]]): AI generates ONLY
 * the line-art design. Everything after — segmentation, stitch/colour/geometry
 * assignment, the legend, the written steps, the hero render — is deterministic
 * and reads from ONE shared `stitchedElements` structure, so the hero, the
 * printable template and the stitch guide are all the same pattern. No AI drift.
 *
 * The deterministic boundary is `bitmapToPattern()`: given a flat-colour bitmap
 * it returns the full pattern. The bulk generator hands it a Flux brief render;
 * the customer "upload a photo" feature hands it their (Flux-flattened) photo.
 * Identical from here on.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'

export type { StitchedElement }

/** A working RGBA bitmap — the flat-colour design the deterministic half reads. */
export interface DesignBitmap {
  /** RGBA, row-major, 4 bytes/pixel, length === width * height * 4. */
  rgba: Uint8Array
  width: number
  height: number
}

/** A floss colour actually used by the pattern, resolved to a real DMC stand. */
export interface FlossUsage {
  /** DMC code, e.g. '3328'. */
  code: string
  /** DMC stand name, e.g. 'Medium salmon'. */
  name: string
  /** The DMC colour as hex (what the render + legend show). */
  hex: string
  /** The raw quantised colour this floss was matched from (for QA). */
  sourceHex: string
  /** Strands of floss to use for this colour. */
  strands: number
  /** How many stitched elements use this colour. */
  elementCount: number
}

/** One row of the printable stitch legend: which floss + stitch fills which area. */
export interface LegendRow {
  /** Stable region/group id, e.g. 'A', 'B' … (the symbol on the template). */
  symbol: string
  /** DMC code. */ code: string
  /** DMC name. */ name: string
  /** DMC hex. */ hex: string
  /** Strand count. */ strands: number
  /** Controlled stitch slug, e.g. 'embroidery-long-and-short'. */ stitchSlug: string
  /** Human stitch name, e.g. 'Long and short stitch'. */ stitchName: string
  /** What this group covers, e.g. 'petals', 'stems', 'flower centres'. */ area: string
  /** Number of worked elements in the group. */ count: number
}

/** One written step in the stitch-along order. */
export interface PatternStep {
  order: number
  /** Plain-English instruction. */ text: string
  /** The legend symbols this step works. */ symbols: string[]
}

/** What the engine knows about a pattern before it segments the bitmap. */
export interface PatternMeta {
  /** Slug-ish name; drives filenames + the persisted hero. */
  name: string
  /** Human title for the legend/guide. */
  title: string
  /** Finished worked size in millimetres (the hoop area). */
  finishedSizeMm: { width: number; height: number }
  /** Linen/cloth ground colour. Defaults to the warm even-weave we render on. */
  fabricHex?: string
  /** Default thread when a region doesn't pick its own. */
  defaultThread?: { type: string; weight: string }
  /** Strand count for stranded floss. Default 6 (perle ignores it). */
  strands?: number
  /** Difficulty, carried into the guide. */
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'showpiece'
  /** Where the design came from — for provenance in the result. */
  source: PatternSource
}

export type PatternSource =
  | { kind: 'brief'; territory: string; look: string; palette: string; concept: string }
  | { kind: 'reference'; note: string }

/** The full deterministic output — one shape the hero, template + guide all read. */
export interface EmbroideryPattern {
  meta: PatternMeta
  /** DMC floss list actually used. */
  palette: FlossUsage[]
  /** The loom render contract — geometry + stitch slug + colour per element. */
  stitchedElements: StitchedElement[]
  /** Printable stitch legend (symbol -> floss + stitch + area). */
  legend: LegendRow[]
  /** Written stitch-along steps, in working order. */
  steps: PatternStep[]
  /** Quick counts for QA / the report. */
  stats: {
    elements: number
    regions: number
    colours: number
    stitchTypes: number
    /** Per-stitch-slug element counts. */
    byStitch: Record<string, number>
  }
}

/** Tunables for the deterministic segmentation. Sensible defaults baked in. */
export interface EngineOptions {
  /** Working resolution (longest side, px) the bitmap is segmented at. Default 320. */
  workPx?: number
  /** Target number of flat colours to quantise to. Default 10. */
  maxColours?: number
  /** Drop regions smaller than this fraction of the canvas area. Default 0.0008. */
  minRegionAreaFrac?: number
  /** Floss strand count. Default 6. */
  strands?: number
  /** Floss brand to resolve colours against. Default 'DMC'. */
  brand?: 'DMC' | 'ANCHOR' | 'MADEIRA'
  /**
   * Hex of a deliberately COLOURED ground (e.g. a navy night sky). When set, the
   * engine treats that colour as the cloth (excluded, never stitched) and the
   * subject is whatever differs from it — so a pale subject on a dark ground is
   * kept. Leave unset for the normal plain-paper ground (auto light detection).
   */
  groundHint?: string
}
