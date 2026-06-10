// Ease presets for knitwear. How much extra (or negative) circumference
// the finished garment carries over the body bust measurement.
//
// Knitting ease conventions follow the same scale as crochet (close-
// fitting through very oversized). The named values match common indie-
// designer ease tables (Brooklyn Tweed, PetiteKnit, Drops Design).
//
// Ease applies to bust / chest. Hip and waist scale proportionally
// inside the construction-shape modules.

export type EasePreset =
  | 'NEGATIVE_4'
  | 'NEGATIVE_2'
  | 'ZERO'
  | 'POSITIVE_2'
  | 'POSITIVE_4'
  | 'POSITIVE_6'
  | 'POSITIVE_8'
  | 'GENEROUS_10'
  | 'GENEROUS_15'

export interface EaseDescriptor {
  /** Centimetres added to body bust circumference. Negative shrinks. */
  amountCm: number
  /** Plain-English label shown in patterns. */
  label: string
  /** Hint on the silhouette this ease produces. */
  silhouette: string
}

export const EASE_PRESETS: Record<EasePreset, EaseDescriptor> = {
  NEGATIVE_4: { amountCm: -4, label: 'close-fitting', silhouette: 'body-hugging, stretches over the bust' },
  NEGATIVE_2: { amountCm: -2, label: 'fitted', silhouette: 'sits close without stretching' },
  ZERO: { amountCm: 0,  label: 'standard fit', silhouette: 'skims the body' },
  POSITIVE_2: { amountCm: 2,  label: 'classic fit', silhouette: 'a little room over the bust' },
  POSITIVE_4: { amountCm: 4,  label: 'relaxed', silhouette: 'comfortable, not loose' },
  POSITIVE_6: { amountCm: 6,  label: 'loose', silhouette: 'drapes without clinging' },
  POSITIVE_8: { amountCm: 8,  label: 'easy', silhouette: 'soft drape, room for layers' },
  GENEROUS_10: { amountCm: 10, label: 'oversized', silhouette: 'sits well off the shoulders' },
  GENEROUS_15: { amountCm: 15, label: 'very oversized', silhouette: 'cocoon shape, lots of room' },
}

export function applyEase(bodyBustCm: number, preset: EasePreset): number {
  return bodyBustCm + EASE_PRESETS[preset].amountCm
}
