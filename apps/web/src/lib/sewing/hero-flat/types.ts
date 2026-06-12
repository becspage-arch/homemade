// SPDX-License-Identifier: MIT
// Hero-flat renderer types. The renderer produces a deterministic SVG
// representation of the finished garment (front + back), parametrised by
// archetype-specific proportions. Engine swap stays a one-file change
// because SewingPattern and the batch script only see these shapes.

export type ArchetypeId =
  // Tops + dresses
  | 'bodice-fitted'
  | 'top-set-in-sleeve'
  | 'shirt-button-down'
  | 'hoodie'
  | 'tank'
  | 'bikini-top'
  | 'coat'
  | 'corset'
  | 'jumpsuit'
  | 'kids-tshirt'
  // Bottoms
  | 'skirt-pencil'
  | 'skirt-flared'
  | 'trousers'
  | 'trousers-wrap'
  // Bags
  | 'bag-tote'
  | 'bag-drawstring'
  | 'bag-pouch-zip'
  | 'bag-backpack'
  | 'bag-bucket'
  | 'bag-sling'
  // Home
  | 'pillowcase'
  | 'cushion'
  | 'tea-towel'
  | 'table-runner'
  | 'throw-blanket'
  | 'baby-blanket'
  | 'curtain-rod-pocket'
  | 'curtain-eyelet'
  | 'apron'
  | 'pot-holder-set'
  | 'lampshade-drum'
  // Accessories
  | 'headband'
  | 'scrunchie'
  | 'belt'
  | 'tie'
  | 'bow-tie'
  | 'scarf-infinity'
  | 'snood'
  | 'sun-hat'
  | 'baby-bib'

export interface RenderInput {
  archetype: ArchetypeId
  /** Optional per-pattern overrides for default archetype proportions. */
  overrides?: Record<string, number | string | boolean>
}

export interface RenderResult {
  /** Inner SVG markup for the front view (centred at 0,0). */
  front: string
  /** Inner SVG markup for the back view (centred at 0,0). */
  back: string
  /** Bounding-box height the renderer expects each view to occupy, in
   *  canvas pixels. Used by twoViewSvg to scale tall vs wide archetypes. */
  viewHeightPx: number
}

export interface RenderedFlat {
  /** Full standalone SVG string, transparent background, 800x1000. */
  svg: string
  /** Canonical content hash for cache lookup. Format:
   *  sha256(archetype + sorted-overrides-json + RENDERER_VERSION). */
  cacheKey: string
  /** Pinned renderer version baked into the cache key. */
  rendererVersion: number
}
