/**
 * Cross-stitch bulk STYLE + colour treatment — ported verbatim from the retired
 * PC script apps/web/scripts/xs-volume-gen.ts so the proven quality fixes live in
 * the shared engine, not a standalone script.
 *
 * These are the hard-won levers (the "vivid colour fix"): a per-lane source
 * pre-saturation before the image is quantised into floss, a bright ivory aida
 * fabric, and a post-render saturation boost. Keep them together and unchanged —
 * the planner only picks subject/style/size/colours; the deterministic quality
 * treatment stays here.
 */

export const STYLE = {
  bright:
    'bright cheerful modern cross-stitch illustration, bold saturated multicolour palette, crisp clean shapes, high contrast, clean white background',
  cute:
    'adorable storybook character, soft but bright saturated palette, sweet expressive face, bold clear outline, lots of personality, clean white background',
  pastel:
    'pretty storybook illustration, clear bold outlines with soft cheerful fills, refined palette, crisp detail, clean white background',
  botanical:
    'delicate elegant botanical illustration, sophisticated muted-yet-rich palette, airy negative space, fine clear detail, clean white background',
  wreath:
    'a lush circular wreath/ring composition with a clear open centre, bright saturated palette, crisp clear elements evenly arranged, clean white background',
  showpiece:
    'richly detailed charming storybook scene packed with little story details, bold clear outlines, warm saturated layered palette, full coverage',
  fun:
    'funny cheeky characterful cartoon with a witty visual joke, bold bright saturated colours, expressive face, lots of personality, clean white background',
  scene:
    'bold FLAT paint-by-numbers illustration, clean graphic areas of solid colour, limited harmonious palette, a complete stylish painted SCENE with full background, modern and witty (paint-by-numbers style), NOT photographic, NOT heavily shaded',
  popart:
    'minimalist FLAT vector pop-art portrait, bold clean areas of solid colour, elegant and stylish, limited sophisticated palette, simple plain background, NOT photographic',
  artface:
    'a striking fine-art portrait illustration of a beautiful face adorned with flowers, THE WHOLE HEAD AND FOREHEAD CLEARLY VISIBLE with anatomically correct features and both eyes, bold clean areas of colour with elegant detail, sophisticated rich harmonious palette, gallery-art feel, plain background, stylised NOT photographic',
  icon:
    'a bold stylised flat pop-art portrait of a historical figure, iconic and recognisable, the whole head clearly visible with correct features, clean areas of colour, limited sophisticated palette, plain background, NOT photographic',
  dogportrait:
    'a clean realistic illustrated portrait of the dog, head and shoulders, accurate breed features and markings, crisp detailed but flat-shaded illustration (NOT photographic, NOT painterly), the dog is the hero on a soft plain warm background',
  fantasy:
    'an enchanting fairytale illustration, storybook fantasy, soft glowing magical light, bold clear outlines with rich saturated jewel-tone fills, whimsical and charming, crisp clear detail, NOT photographic, NOT muddy',
} as const

export type StyleKey = keyof typeof STYLE

/**
 * Per-lane SOURCE saturation — pre-saturate the Flux art before it's quantised
 * into floss so the palette itself is bold (Flux trends soft/pastel → washed
 * otherwise). The elegant botanical lane is deliberately muted, so barely touched.
 */
export const SRC_SAT: Record<StyleKey, number> = {
  bright: 1.5,
  cute: 1.45,
  pastel: 1.28,
  botanical: 1.12,
  wreath: 1.45,
  showpiece: 1.4,
  fun: 1.5,
  scene: 1.3,
  popart: 1.25,
  artface: 1.25,
  icon: 1.25,
  dogportrait: 1.18,
  fantasy: 1.38,
}

/** Bright ivory aida (a dull oatmeal greyed every colour). */
export const FABRIC = '#FCFAF6'

/** Post-render saturation on the final thumbnail PNG (≈ the in-render boost). */
export const POST_SAT = 1.3

/** Dense showpiece tier: >96 colours are sourced from Flux 1.1 Pro + full DMC. */
export const DENSE_COLOUR_THRESHOLD = 96

/**
 * Assemble the full Flux prompt from a subject + style, exactly as the PC script
 * did (`${subject}, ${STYLE[style]}, clean composition, centred`).
 */
export function buildPrompt(subject: string, style: StyleKey): string {
  return `${subject}, ${STYLE[style]}, clean composition, centred`
}

/** Difficulty from colour count — mirrors xs-volume-publish. */
export function difficultyFor(colours: number): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  return colours <= 18 ? 'BEGINNER' : colours <= 30 ? 'INTERMEDIATE' : 'ADVANCED'
}
