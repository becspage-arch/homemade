/**
 * THE LETTERING SET, as data.
 *
 * Separated from `lettering.ts` because the browser needs to know what the
 * faces are called and how small each one can be set, while the setting itself
 * reads font files off the disk and can only happen on the server. Importing
 * the setter into a client component would drag `node:fs` and a font engine
 * into the bundle; importing this instead costs a few hundred bytes.
 */

/**
 * The lettering set. Every face is a file committed under `apps/web/public/fonts`
 * with its licence noted in the README there, so it travels into the container
 * image with the rest of `public` and needs nothing installed on the host.
 *
 * `minCap` is the smallest cap height in cells at which the face still reads.
 * A hairline script at six cells is a smear of loose dots; the sampler specs
 * and the word-art tool both refuse to go below it. `threshold` is how much of
 * a cell that face needs to cover before the cell is stitched: a light face
 * wants a lower bar or its thin strokes come out as dashes.
 */
export const LETTERING_FACES = {
  sampler: {
    label: 'Sampler serif',
    file: 'EBGaramond_600SemiBold.ttf',
    minCap: 6,
    // 0.28 rather than a third: at eight squares the crossbar of a capital T
    // fell just under a third of a square and came off the stem, leaving a
    // loose mark floating over the letter. A stitched letter wants the weight
    // anyway.
    threshold: 0.28,
    note: 'The traditional sampler letter. Small serifs, even weight.',
  },
  block: {
    label: 'Block',
    file: 'DejaVuSans-Bold.ttf',
    minCap: 5,
    threshold: 0.42,
    note: 'Sturdy and square. Reads at the smallest sizes.',
  },
  modern: {
    label: 'Modern',
    file: 'Montserrat_500Medium.ttf',
    minCap: 6,
    threshold: 0.34,
    note: 'Quiet geometric capitals for plain type pieces.',
  },
  'modern-bold': {
    label: 'Modern bold',
    file: 'Montserrat_700Bold.ttf',
    minCap: 6,
    threshold: 0.40,
    note: 'The same letter with weight behind it.',
  },
  hand: {
    label: 'Hand',
    file: 'DancingScript_700Bold.ttf',
    minCap: 9,
    threshold: 0.36,
    note: 'A relaxed written hand. Wants a little room.',
  },
  script: {
    label: 'Script',
    file: 'GreatVibes_400Regular.ttf',
    minCap: 12,
    threshold: 0.34,
    note: 'Formal calligraphy for a name across the middle.',
  },
} as const

export type LetteringFace = keyof typeof LETTERING_FACES

export const LETTERING_FACE_IDS = Object.keys(LETTERING_FACES) as LetteringFace[]

export function isLetteringFace(value: unknown): value is LetteringFace {
  return typeof value === 'string' && value in LETTERING_FACES
}

/** Smallest cap height in cells this face is allowed to be set at. */
export function minCapFor(face: LetteringFace): number {
  return LETTERING_FACES[face].minCap
}

/** Coverage bar for a face, before any block-level override. */
export function thresholdFor(face: LetteringFace): number {
  return LETTERING_FACES[face].threshold
}

