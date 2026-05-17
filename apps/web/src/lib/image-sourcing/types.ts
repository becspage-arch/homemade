/**
 * Shared types for the image-sourcing orchestrator.
 *
 * Each per-source client (Unsplash / Pexels / Wikimedia / Pixabay / Flux Schnell)
 * exposes a `search(query, opts)` that resolves to `ImageSearchResult[]`. The
 * orchestrator iterates a priority list per category and returns the first
 * acceptable result, falling through to Flux Schnell AI generation when free
 * sources fail.
 *
 * Attribution rules are baked into each client — Unsplash / Pexels / Pixabay
 * licences don't require visible attribution; Wikimedia CC-BY / CC-BY-SA do.
 * The `requiresAttribution` flag flows through to `Media.requiresAttribution`
 * so the public renderer can decide whether to surface the discreet tooltip.
 */

export type ImageSource =
  | 'unsplash'
  | 'pexels'
  | 'wikimedia'
  | 'pixabay'
  | 'flux-schnell'
  | 'procedural-card'
  | 'original'
  | 'manual-upload'
  | 'usda'
  | 'nlm'

export type LicenceCode =
  | 'UNSPLASH'
  | 'PEXELS'
  | 'PIXABAY'
  | 'CC-BY'
  | 'CC-BY-SA'
  | 'CC0'
  | 'PD'
  | 'PROPRIETARY'

export interface ImageSearchResult {
  /** Direct download URL (the actual asset). */
  url: string
  /** Page URL for attribution / source-of-truth (never displayed unless attribution required). */
  pageUrl: string
  source: ImageSource
  /** Photographer / illustrator name when known. Null for AI-generated. */
  creatorName: string | null
  licenceCode: LicenceCode
  licenceUrl: string | null
  /** Computed from licenceCode. When true, public renderer shows the tooltip. */
  requiresAttribution: boolean
  width: number
  height: number
  /** Free-form id from the upstream API for debugging / re-fetching. */
  upstreamId?: string | null
}

export interface SearchOpts {
  /** Max results to return from this source. Defaults to 3. */
  limit?: number
  /** Per-source request timeout in ms. Defaults to 6000. */
  timeoutMs?: number
}

export interface SourceHeroInput {
  title: string
  /** Top-level category slug: cooking / baking / mindset / garden / herbal-medicine. */
  category: string
  /** Optional sub-category slug — bread / cake / sauce / preserve / tapping etc. */
  subCategory?: string | null
  /** Up to a few key ingredient names — used to make the search query specific. */
  ingredients?: string[]
}

export type SourceOutcome = 'free' | 'ai-generated' | 'failed'

export interface SourceRejection {
  source: ImageSource
  reason: string
}

export interface SourceHeroResult {
  image: ImageSearchResult | null
  outcome: SourceOutcome
  /** Ordered list of sources we tried before settling. */
  triedSources: ImageSource[]
  /** Verdicts produced by the verification step, in order of attempts. */
  rejections?: SourceRejection[]
  /** Final verification status to stamp on the Media row when persisted. */
  verificationStatus?:
    | 'UNVERIFIED'
    | 'VERIFIED'
    | 'REJECTED'
    | 'REJECTED_USED_PROCEDURAL'
}

/** Licences that require visible attribution in the public renderer. */
export const LICENCES_REQUIRING_ATTRIBUTION: ReadonlySet<LicenceCode> = new Set([
  'CC-BY',
  'CC-BY-SA',
])

export function computeRequiresAttribution(code: LicenceCode): boolean {
  return LICENCES_REQUIRING_ATTRIBUTION.has(code)
}

/** Minimum width / height the orchestrator accepts from a free-source result. */
export const MIN_WIDTH = 1024
export const MIN_HEIGHT = 600
export const MIN_RATIO = 3 / 2 // landscape, roughly editorial
export const MAX_RATIO = 16 / 9
