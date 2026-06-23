/**
 * Master embroidery stitch list — the controlled dictionary the needlework
 * STITCH teaching library, the pattern stitch-references, and the loom's
 * stitch renderer all resolve against. Seeded into the `Stitch` table with
 * craft = 'embroidery' (slugs are craft-prefixed: 'embroidery-satin').
 *
 * `family` maps to Stitch.category. `usedFor` -> Stitch.notes. Difficulty
 * mirrors the Tutorial axis. Grouped by stitch family (flat / chain /
 * buttonhole / looped / cross / knotted / composite-raised / couching-filling /
 * goldwork / ribbon / whitework-drawn / counted-structural / shisha).
 *
 * This is the single source of truth — add a stitch here, then it can be
 * taught, referenced, charted and rendered. Do NOT mint stitch names elsewhere.
 */

export type StitchFamily =
  | 'flat-line'
  | 'chain'
  | 'buttonhole'
  | 'looped'
  | 'cross-herringbone'
  | 'knotted'
  | 'composite-raised'
  | 'couching-filling'
  | 'goldwork'
  | 'ribbon'
  | 'whitework-drawn'
  | 'counted-structural'
  | 'shisha'

export type StitchDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export interface EmbroideryStitch {
  /** unprefixed; the seed adds the 'embroidery-' craft prefix. */
  slug: string
  canonicalName: string
  /** only when the US name genuinely differs from the UK canonical. */
  usName?: string
  family: StitchFamily
  difficulty: StitchDifficulty
  /** short "what it's for" — becomes Stitch.notes + seeds the teaching intro. */
  usedFor: string
}

export const EMBROIDERY_STITCHES: EmbroideryStitch[] = [
  // ── FLAT / LINE ─────────────────────────────────────────────────────────────
  { slug: 'running', canonicalName: 'Running stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'simple dashed outlines and the base for many composite stitches' },
  { slug: 'whipped-running', canonicalName: 'Whipped running stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'a solid corded line from a whipped running base' },
  { slug: 'laced-running', canonicalName: 'Laced running stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'a decorative wavy two-colour line' },
  { slug: 'back', canonicalName: 'Back stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'fine continuous outlines and lettering' },
  { slug: 'whipped-back', canonicalName: 'Whipped back stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'a raised rope-like outline' },
  { slug: 'threaded-back', canonicalName: 'Threaded back stitch', family: 'flat-line', difficulty: 'INTERMEDIATE', usedFor: 'a decorative looped border line' },
  { slug: 'stem', canonicalName: 'Stem stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'smooth curved outlines, stems and lettering' },
  { slug: 'outline', canonicalName: 'Outline stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'a fine outline; the mirror twist of stem stitch' },
  { slug: 'split', canonicalName: 'Split stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'fine outlines and a smooth base for shading' },
  { slug: 'satin', canonicalName: 'Satin stitch', family: 'flat-line', difficulty: 'INTERMEDIATE', usedFor: 'smooth solid filling of small shapes' },
  { slug: 'padded-satin', canonicalName: 'Padded satin stitch', family: 'flat-line', difficulty: 'INTERMEDIATE', usedFor: 'raised, domed solid filling' },
  { slug: 'encroaching-satin', canonicalName: 'Encroaching satin stitch', family: 'flat-line', difficulty: 'INTERMEDIATE', usedFor: 'shaded filling of larger areas in bands' },
  { slug: 'long-and-short', canonicalName: 'Long and short stitch', family: 'flat-line', difficulty: 'ADVANCED', usedFor: 'painterly blended shading (needle painting)' },
  { slug: 'straight', canonicalName: 'Straight stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'single spokes, rays and scattered fillings' },
  { slug: 'seed', canonicalName: 'Seed stitch', family: 'flat-line', difficulty: 'BEGINNER', usedFor: 'light scattered texture and shading' },
  { slug: 'holbein', canonicalName: 'Holbein stitch', usName: 'Double running stitch', family: 'flat-line', difficulty: 'INTERMEDIATE', usedFor: 'reversible line work for blackwork' },
  { slug: 'chevron', canonicalName: 'Chevron stitch', family: 'flat-line', difficulty: 'INTERMEDIATE', usedFor: 'zig-zag bands and borders' },

  // ── CHAIN ───────────────────────────────────────────────────────────────────
  { slug: 'chain', canonicalName: 'Chain stitch', family: 'chain', difficulty: 'BEGINNER', usedFor: 'bold outlines and line filling' },
  { slug: 'detached-chain', canonicalName: 'Detached chain', usName: 'Lazy daisy', family: 'chain', difficulty: 'BEGINNER', usedFor: 'individual petals and leaves' },
  { slug: 'open-chain', canonicalName: 'Open chain stitch', family: 'chain', difficulty: 'INTERMEDIATE', usedFor: 'a ladder-like band, good over a second colour' },
  { slug: 'twisted-chain', canonicalName: 'Twisted chain stitch', family: 'chain', difficulty: 'INTERMEDIATE', usedFor: 'a textured knotted-looking line' },
  { slug: 'cable-chain', canonicalName: 'Cable chain stitch', family: 'chain', difficulty: 'INTERMEDIATE', usedFor: 'a chain with a link of thread between each loop' },
  { slug: 'heavy-chain', canonicalName: 'Heavy chain stitch', family: 'chain', difficulty: 'INTERMEDIATE', usedFor: 'a bold raised braid-like outline' },
  { slug: 'rosette-chain', canonicalName: 'Rosette chain stitch', family: 'chain', difficulty: 'ADVANCED', usedFor: 'a decorative twisted border' },
  { slug: 'whipped-chain', canonicalName: 'Whipped chain stitch', family: 'chain', difficulty: 'BEGINNER', usedFor: 'a corded raised line over a chain base' },
  { slug: 'feathered-chain', canonicalName: 'Feathered chain stitch', family: 'chain', difficulty: 'ADVANCED', usedFor: 'a zig-zag decorative band' },
  { slug: 'tambour', canonicalName: 'Tambour stitch', family: 'chain', difficulty: 'ADVANCED', usedFor: 'fast hooked chain work, beading and tambour embroidery' },

  // ── BUTTONHOLE / BLANKET ────────────────────────────────────────────────────
  { slug: 'blanket', canonicalName: 'Blanket stitch', family: 'buttonhole', difficulty: 'BEGINNER', usedFor: 'edging and open decorative borders' },
  { slug: 'buttonhole', canonicalName: 'Buttonhole stitch', family: 'buttonhole', difficulty: 'BEGINNER', usedFor: 'closed edging and cutwork edges' },
  { slug: 'closed-buttonhole', canonicalName: 'Closed buttonhole stitch', family: 'buttonhole', difficulty: 'INTERMEDIATE', usedFor: 'triangular-grouped decorative bands' },
  { slug: 'up-and-down-buttonhole', canonicalName: 'Up and down buttonhole stitch', family: 'buttonhole', difficulty: 'INTERMEDIATE', usedFor: 'a knotted-edge border' },
  { slug: 'buttonhole-wheel', canonicalName: 'Buttonhole wheel', family: 'buttonhole', difficulty: 'INTERMEDIATE', usedFor: 'flowers, eyelets and rings' },
  { slug: 'detached-buttonhole-filling', canonicalName: 'Detached buttonhole filling', family: 'buttonhole', difficulty: 'ADVANCED', usedFor: 'raised detached fillings and stumpwork' },

  // ── LOOPED / OPEN ───────────────────────────────────────────────────────────
  { slug: 'feather', canonicalName: 'Feather stitch', family: 'looped', difficulty: 'BEGINNER', usedFor: 'feathery branching lines and crazy-quilt seams' },
  { slug: 'double-feather', canonicalName: 'Double feather stitch', family: 'looped', difficulty: 'INTERMEDIATE', usedFor: 'a wider, more decorative feathered band' },
  { slug: 'fly', canonicalName: 'Fly stitch', family: 'looped', difficulty: 'BEGINNER', usedFor: 'V and Y shapes, foliage and scattered filling' },
  { slug: 'fern', canonicalName: 'Fern stitch', family: 'looped', difficulty: 'BEGINNER', usedFor: 'leaf veins, ferns and seaweed' },
  { slug: 'cretan', canonicalName: 'Cretan stitch', family: 'looped', difficulty: 'INTERMEDIATE', usedFor: 'leaf fillings and decorative bands' },
  { slug: 'vandyke', canonicalName: 'Vandyke stitch', family: 'looped', difficulty: 'INTERMEDIATE', usedFor: 'a raised central-plait band, good for leaves' },
  { slug: 'wheatear', canonicalName: 'Wheatear stitch', family: 'looped', difficulty: 'BEGINNER', usedFor: 'grain-like lines and borders' },
  { slug: 'ladder', canonicalName: 'Ladder stitch', family: 'looped', difficulty: 'INTERMEDIATE', usedFor: 'a wide flat decorative band' },

  // ── CROSS / HERRINGBONE / FISHBONE ──────────────────────────────────────────
  { slug: 'cross', canonicalName: 'Cross stitch', family: 'cross-herringbone', difficulty: 'BEGINNER', usedFor: 'counted X-fill and surface accents' },
  { slug: 'herringbone', canonicalName: 'Herringbone stitch', family: 'cross-herringbone', difficulty: 'BEGINNER', usedFor: 'decorative bands and foundation for laced borders' },
  { slug: 'double-herringbone', canonicalName: 'Double herringbone stitch', family: 'cross-herringbone', difficulty: 'INTERMEDIATE', usedFor: 'an interlaced two-pass band' },
  { slug: 'closed-herringbone', canonicalName: 'Closed herringbone stitch', family: 'cross-herringbone', difficulty: 'INTERMEDIATE', usedFor: 'a solid shadow-work leaf fill' },
  { slug: 'fishbone', canonicalName: 'Fishbone stitch', family: 'cross-herringbone', difficulty: 'BEGINNER', usedFor: 'solid leaves with a central spine' },
  { slug: 'raised-fishbone', canonicalName: 'Raised fishbone stitch', family: 'cross-herringbone', difficulty: 'INTERMEDIATE', usedFor: 'padded, dimensional leaves' },
  { slug: 'leaf', canonicalName: 'Leaf stitch', family: 'cross-herringbone', difficulty: 'BEGINNER', usedFor: 'open, veined leaf shapes' },

  // ── KNOTTED ─────────────────────────────────────────────────────────────────
  { slug: 'french-knot', canonicalName: 'French knot', family: 'knotted', difficulty: 'INTERMEDIATE', usedFor: 'dotted texture, flower centres and stamens' },
  { slug: 'colonial-knot', canonicalName: 'Colonial knot', family: 'knotted', difficulty: 'INTERMEDIATE', usedFor: 'a firmer knot for candlewicking and texture' },
  { slug: 'bullion-knot', canonicalName: 'Bullion knot', family: 'knotted', difficulty: 'ADVANCED', usedFor: 'raised coils, rosebuds and lettering' },
  { slug: 'bullion-rose', canonicalName: 'Bullion rose', family: 'knotted', difficulty: 'ADVANCED', usedFor: 'dimensional roses built from bullion knots' },
  { slug: 'coral', canonicalName: 'Coral stitch', family: 'knotted', difficulty: 'BEGINNER', usedFor: 'a knotted outline line' },
  { slug: 'knotted-pearl', canonicalName: 'Knotted pearl stitch', family: 'knotted', difficulty: 'ADVANCED', usedFor: 'a raised beaded-looking band' },
  { slug: 'palestrina', canonicalName: 'Palestrina stitch', family: 'knotted', difficulty: 'INTERMEDIATE', usedFor: 'a knotted, bobbled outline' },
  { slug: 'four-legged-knot', canonicalName: 'Four-legged knot stitch', family: 'knotted', difficulty: 'INTERMEDIATE', usedFor: 'a scattered cross-with-knot filling' },
  { slug: 'drizzle', canonicalName: 'Drizzle stitch', family: 'knotted', difficulty: 'ADVANCED', usedFor: 'raised cast-on tendrils and stamens' },
  { slug: 'turkey-work', canonicalName: 'Turkey work', family: 'knotted', difficulty: 'INTERMEDIATE', usedFor: 'looped or cut pile, fur and fluffy texture' },

  // ── COMPOSITE / RAISED (stumpwork tier) ─────────────────────────────────────
  { slug: 'woven-wheel', canonicalName: 'Woven wheel', usName: 'Woven spider web', family: 'composite-raised', difficulty: 'BEGINNER', usedFor: 'raised woven roses' },
  { slug: 'ribbed-spider-web', canonicalName: 'Ribbed spider web', family: 'composite-raised', difficulty: 'INTERMEDIATE', usedFor: 'spoked decorative wheels' },
  { slug: 'woven-picot', canonicalName: 'Woven picot', family: 'composite-raised', difficulty: 'ADVANCED', usedFor: 'detached petals and leaves in stumpwork' },
  { slug: 'raised-cup', canonicalName: 'Raised cup stitch', family: 'composite-raised', difficulty: 'ADVANCED', usedFor: 'small raised cups and rings' },
  { slug: 'oyster', canonicalName: 'Oyster stitch', family: 'composite-raised', difficulty: 'INTERMEDIATE', usedFor: 'small twisted detached units, rosebuds' },
  { slug: 'granitos', canonicalName: 'Granitos', family: 'composite-raised', difficulty: 'BEGINNER', usedFor: 'small padded seed and petal shapes' },
  { slug: 'raised-stem-band', canonicalName: 'Raised stem band', family: 'composite-raised', difficulty: 'INTERMEDIATE', usedFor: 'a raised ridged band over bars' },
  { slug: 'needle-weaving', canonicalName: 'Needle weaving', family: 'composite-raised', difficulty: 'INTERMEDIATE', usedFor: 'woven detached fillings and bars' },

  // ── COUCHING / LAID / FILLING ───────────────────────────────────────────────
  { slug: 'couching', canonicalName: 'Couching', family: 'couching-filling', difficulty: 'BEGINNER', usedFor: 'tacking down a laid thread along a line' },
  { slug: 'bokhara-couching', canonicalName: 'Bokhara couching', family: 'couching-filling', difficulty: 'INTERMEDIATE', usedFor: 'self-couched solid filling' },
  { slug: 'romanian-couching', canonicalName: 'Romanian couching', family: 'couching-filling', difficulty: 'INTERMEDIATE', usedFor: 'long-and-short self-couched filling' },
  { slug: 'trellis-couching', canonicalName: 'Trellis couching', family: 'couching-filling', difficulty: 'INTERMEDIATE', usedFor: 'a lattice filling tacked at the crossings' },
  { slug: 'laid-work', canonicalName: 'Laid work', family: 'couching-filling', difficulty: 'INTERMEDIATE', usedFor: 'economical flat filling held by couching' },
  { slug: 'cloud-filling', canonicalName: 'Cloud filling stitch', family: 'couching-filling', difficulty: 'BEGINNER', usedFor: 'a light laced two-colour filling' },
  { slug: 'pattern-darning', canonicalName: 'Pattern darning', family: 'couching-filling', difficulty: 'BEGINNER', usedFor: 'geometric running-stitch fillings' },
  { slug: 'burden', canonicalName: 'Burden stitch', family: 'couching-filling', difficulty: 'INTERMEDIATE', usedFor: 'shaded brick-like couched filling' },

  // ── GOLDWORK (specialist) ───────────────────────────────────────────────────
  { slug: 'or-nue', canonicalName: 'Or nué', family: 'goldwork', difficulty: 'ADVANCED', usedFor: 'shaded couching over laid metal threads' },
  { slug: 'purl-chipping', canonicalName: 'Purl chipping', family: 'goldwork', difficulty: 'ADVANCED', usedFor: 'cut-purl sequins of metal for sparkle filling' },
  { slug: 'pearl-purl-couching', canonicalName: 'Pearl purl couching', family: 'goldwork', difficulty: 'ADVANCED', usedFor: 'a beaded metal outline' },
  { slug: 'plate-work', canonicalName: 'Plate work', family: 'goldwork', difficulty: 'ADVANCED', usedFor: 'flat reflective metal-ribbon filling' },

  // ── RIBBON ──────────────────────────────────────────────────────────────────
  { slug: 'ribbon-stitch', canonicalName: 'Ribbon stitch', family: 'ribbon', difficulty: 'BEGINNER', usedFor: 'curled petals and leaves in silk ribbon' },
  { slug: 'spider-web-rose-ribbon', canonicalName: 'Spider web rose (ribbon)', family: 'ribbon', difficulty: 'BEGINNER', usedFor: 'woven ribbon roses' },
  { slug: 'gathered-ribbon', canonicalName: 'Gathered ribbon stitch', family: 'ribbon', difficulty: 'INTERMEDIATE', usedFor: 'ruched ribbon blossoms' },

  // ── WHITEWORK / DRAWN-THREAD ────────────────────────────────────────────────
  { slug: 'four-sided', canonicalName: 'Four-sided stitch', family: 'whitework-drawn', difficulty: 'INTERMEDIATE', usedFor: 'pulled-thread borders and openwork' },
  { slug: 'hemstitch', canonicalName: 'Hemstitch', family: 'whitework-drawn', difficulty: 'INTERMEDIATE', usedFor: 'drawn-thread hems and borders' },
  { slug: 'eyelet', canonicalName: 'Eyelet stitch', family: 'whitework-drawn', difficulty: 'INTERMEDIATE', usedFor: 'broderie anglaise holes and flowers' },
  { slug: 'pulled-satin', canonicalName: 'Pulled satin stitch', family: 'whitework-drawn', difficulty: 'INTERMEDIATE', usedFor: 'openwork pulled-thread fillings' },
  { slug: 'needle-lace-bars', canonicalName: 'Needle lace bars', family: 'whitework-drawn', difficulty: 'ADVANCED', usedFor: 'Richelieu cutwork bridges' },

  // ── COUNTED-STRUCTURAL (hardanger / blackwork fills) ────────────────────────
  { slug: 'kloster-block', canonicalName: 'Kloster block', family: 'counted-structural', difficulty: 'INTERMEDIATE', usedFor: 'satin-block borders that frame hardanger cut areas' },
  { slug: 'wrapped-bar', canonicalName: 'Wrapped bar', family: 'counted-structural', difficulty: 'INTERMEDIATE', usedFor: 'overcast bars across cut openwork' },
  { slug: 'woven-bar', canonicalName: 'Woven bar', family: 'counted-structural', difficulty: 'INTERMEDIATE', usedFor: 'needle-woven bars in cut openwork' },
  { slug: 'doves-eye', canonicalName: "Dove's eye", family: 'counted-structural', difficulty: 'ADVANCED', usedFor: 'a looped lace filling in cut squares' },

  // ── SHISHA ──────────────────────────────────────────────────────────────────
  { slug: 'shisha', canonicalName: 'Shisha stitch', family: 'shisha', difficulty: 'INTERMEDIATE', usedFor: 'attaching small mirrors with a stitched frame' },
]

/** Quick integrity check: unique slugs. */
export function validateEmbroideryStitches(list = EMBROIDERY_STITCHES): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const s of list) {
    if (seen.has(s.slug)) errors.push(`duplicate slug: ${s.slug}`)
    seen.add(s.slug)
  }
  return errors
}
