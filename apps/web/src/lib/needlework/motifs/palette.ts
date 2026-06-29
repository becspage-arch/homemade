/**
 * Named colour stories for the motif library — the "considered palette from the
 * library" the quality bar demands. Each entry is a TARGET hex; motifs snap it to
 * the nearest real DMC stand at author time (via the author helpers) so the floss
 * key is always genuine DMC. Ramps are given dark→light (the needle-painting fade
 * direction). Keep palettes naturalistic-bright — the DIY-Art-Club register.
 */

export interface MeadowPalette {
  /** Toadstool cap red, dark→light (tameWarm keeps it true red, not orange). */
  capRamp: [string, string, string]
  /** Ivory cap spots. */
  capSpot: string
  /** Toadstool stem, dark→light cream. */
  stemRamp: [string, string]
  /** Soft green mound/foliage behind the toadstools, dark→light. */
  moundRamp: [string, string, string]
  /** Foliage green families (leaves, ferns, stems) for naturalistic variation. */
  moss: string
  sage: string
  fern: string
  /** Daisy. */
  daisyPetal: string
  daisyCentre: string
  /** Forget-me-not. */
  bluePetal: string
  blueCentre: string
  /** Dusky-pink woven rose. */
  rose: string
  roseLeaf: string
  /** Lavender, deep→light. */
  lavenderRamp: [string, string]
  /** Berries. */
  berry: string
  /** Small buttercup / bud accents. */
  buttercup: string
  bud: string
  /** Linen ground. */
  linen: string
}

/** Colours for the fox character + its autumn-woodland setting. */
export interface FoxPalette {
  /** Fox fur, dark→light orange (no tameWarm on this design — keep it true orange). */
  furRamp: [string, string, string]
  /** Cream chest, muzzle, cheeks, tail tip. */
  cream: string
  /** Dark ears/nose/eyes/paws (warm near-black brown). */
  dark: string
  /** Eye highlight. */
  glint: string
}

export const WOODLAND_FOX_PALETTE: FoxPalette = {
  furRamp: ['#b9541b', '#d9742a', '#ec9a4f'],
  cream: '#f3e9d6',
  dark: '#2e211b',
  glint: '#fbf6ea',
}

/** Scene greens + carrots for the garden-bunny design (the bunny motif carries
 *  its own fur colours). */
export const GARDEN_BUNNY_PALETTE = {
  leafDark: '#3f5a24',
  leafMid: '#6e8a3e',
  leafLight: '#9bb45f',
  carrot: '#df7a2a',
  carrotDark: '#b4571a',
}

/** Night sky for the crescent-moon design — a deep blue "cloth" + gold stars. */
export const NIGHT_PALETTE = {
  linen: '#2c3c60',
  star: '#f2d488',
}

/** Scene greens for the sunflower design. */
export const SUNFLOWER_PALETTE = {
  leafDark: '#3c5622',
  leafMid: '#6b863c',
  leafLight: '#97b05c',
}

/** "Toadstool Hollow" — a cottagecore meadow story: red caps, cream, soft greens,
 *  and a scatter of wildflower colour (gold, cornflower, dusky pink, lavender). */
export const TOADSTOOL_HOLLOW: MeadowPalette = {
  capRamp: ['#7c1f15', '#b22a1c', '#dd5446'],
  capSpot: '#f4ecdb',
  stemRamp: ['#d8c7a2', '#f1e7d1'],
  moundRamp: ['#41501f', '#5e7233', '#86995a'],
  moss: '#46541f',
  sage: '#7f9354',
  fern: '#6b863a',
  daisyPetal: '#f7f3e7',
  daisyCentre: '#e0a52c',
  bluePetal: '#5573ac',
  blueCentre: '#efce5c',
  rose: '#c07e8b',
  roseLeaf: '#6f8a44',
  lavenderRamp: ['#785da4', '#b6a0d6'],
  berry: '#9a2740',
  buttercup: '#f1c645',
  bud: '#d98aa0',
  linen: '#e6dcc4',
}
