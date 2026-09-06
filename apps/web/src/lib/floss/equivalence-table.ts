/**
 * Brand equivalence table — maps DMC codes to their published Anchor +
 * Madeira equivalents and the reverse. DMC is the canonical pivot:
 * both Anchor and Madeira publish DMC-conversion charts as their
 * primary cross-reference, and cross-brand swaps (Anchor ↔ Madeira)
 * resolve through DMC.
 *
 * Each EquivalenceRow lists the three-way mapping for one floss colour.
 * `dmc` is always populated. `anchor` and `madeira` are null when the
 * brand has no published exact equivalent for that DMC code — usually
 * because the colour was added to DMC's catalogue after Anchor or
 * Madeira's last cross-reference update, or because the colour is a
 * variegated or metallic that has no plain-stranded peer.
 *
 * When the requested brand has no exact equivalent, the Studio falls
 * back to nearest-by-RGB (CIELAB ΔE on the published rgb values) and
 * marks the swap with `closestMatch: true` so the user sees the
 * fidelity warning before committing.
 */

import { DMC_TABLE, type FlossEntry } from './dmc-table'
import { ANCHOR_TABLE } from './anchor-table'
import { MADEIRA_TABLE } from './madeira-table'

export interface EquivalenceRow {
  dmc: string
  anchor: string | null
  madeira: string | null
}

/**
 * The published DMC → Anchor → Madeira equivalence chart, as it
 * appears on the cross-reference cards both companies distribute.
 * Where a brand has no published equivalent, the cell is null and the
 * Studio falls back to perceptual nearest-match.
 */
export const EQUIVALENCE_TABLE: EquivalenceRow[] = [
  // Whites + neutrals
  { dmc: 'B5200', anchor: '2', madeira: '2402' },
  { dmc: 'BLANC', anchor: '1', madeira: '2401' },
  { dmc: 'ECRU', anchor: '387', madeira: '2404' },
  { dmc: '3865', anchor: '926', madeira: '2403' },
  { dmc: '3866', anchor: '275', madeira: '2008' },

  // Blacks + greys
  { dmc: '310', anchor: '403', madeira: '2400' },
  { dmc: '413', anchor: '236', madeira: '1713' },
  { dmc: '414', anchor: '235', madeira: '1801' },
  { dmc: '415', anchor: '398', madeira: '1802' },
  { dmc: '317', anchor: '400', madeira: '1714' },
  { dmc: '318', anchor: '399', madeira: '1802' },
  { dmc: '535', anchor: '401', madeira: '1810' },
  { dmc: '762', anchor: '234', madeira: '1804' },
  { dmc: '844', anchor: '1041', madeira: '1914' },

  // Reds + corals
  { dmc: '321', anchor: '47', madeira: '0509' },
  { dmc: '326', anchor: '59', madeira: '0507' },
  { dmc: '498', anchor: '1005', madeira: '0511' },
  { dmc: '666', anchor: '46', madeira: '0210' },
  { dmc: '309', anchor: '42', madeira: '0506' },
  { dmc: '350', anchor: '11', madeira: '0213' },
  { dmc: '351', anchor: '10', madeira: '0214' },
  { dmc: '352', anchor: '9', madeira: '0303' },
  { dmc: '353', anchor: '8', madeira: '0304' },
  { dmc: '760', anchor: '1022', madeira: '0405' },
  { dmc: '761', anchor: '1021', madeira: '0404' },
  { dmc: '963', anchor: '23', madeira: '0608' },
  { dmc: '224', anchor: '893', madeira: '0813' },
  { dmc: '225', anchor: '1026', madeira: '0814' },
  { dmc: '3779', anchor: '868', madeira: '0403' },
  { dmc: '356', anchor: '5975', madeira: '0402' },
  { dmc: '3328', anchor: '1024', madeira: '0406' },

  // Oranges + yellows + golds
  { dmc: '740', anchor: '316', madeira: '0202' },
  { dmc: '741', anchor: '304', madeira: '0203' },
  { dmc: '742', anchor: '303', madeira: '0204' },
  { dmc: '743', anchor: '305', madeira: '0114' },
  { dmc: '744', anchor: '301', madeira: '0112' },
  { dmc: '745', anchor: '300', madeira: '0111' },
  { dmc: '725', anchor: '305', madeira: '0113' },
  { dmc: '726', anchor: '295', madeira: '0109' },
  { dmc: '727', anchor: '293', madeira: '0110' },
  { dmc: '676', anchor: '891', madeira: '2208' },
  { dmc: '677', anchor: '886', madeira: '2207' },
  { dmc: '729', anchor: '890', madeira: '2209' },
  { dmc: '780', anchor: '309', madeira: '2214' },
  { dmc: '782', anchor: '308', madeira: '2213' },

  // Browns + tans
  { dmc: '801', anchor: '359', madeira: '2008' },
  { dmc: '838', anchor: '1088', madeira: '2005' },
  { dmc: '839', anchor: '1086', madeira: '2004' },
  { dmc: '840', anchor: '1084', madeira: '1913' },
  { dmc: '841', anchor: '1082', madeira: '1912' },
  { dmc: '842', anchor: '1080', madeira: '1910' },
  { dmc: '433', anchor: '358', madeira: '2008' },
  { dmc: '434', anchor: '310', madeira: '2009' },
  { dmc: '435', anchor: '365', madeira: '2010' },
  { dmc: '436', anchor: '1045', madeira: '2011' },
  { dmc: '437', anchor: '362', madeira: '2012' },
  { dmc: '738', anchor: '361', madeira: '2013' },
  { dmc: '739', anchor: '366', madeira: '2014' },

  // Greens — parrot / avocado / forest / fern / sage
  { dmc: '904', anchor: '258', madeira: '1413' },
  { dmc: '905', anchor: '257', madeira: '1412' },
  { dmc: '906', anchor: '256', madeira: '1411' },
  { dmc: '907', anchor: '255', madeira: '1410' },
  { dmc: '470', anchor: '267', madeira: '1503' },
  { dmc: '471', anchor: '266', madeira: '1502' },
  { dmc: '472', anchor: '253', madeira: '1501' },
  { dmc: '469', anchor: '268', madeira: '1505' },
  { dmc: '937', anchor: '268', madeira: '1504' },
  { dmc: '936', anchor: '269', madeira: '1507' },
  { dmc: '935', anchor: '861', madeira: '1506' },
  { dmc: '3346', anchor: '267', madeira: '1407' },
  { dmc: '3347', anchor: '266', madeira: '1408' },
  { dmc: '3348', anchor: '264', madeira: '1409' },
  { dmc: '988', anchor: '244', madeira: '1314' },
  { dmc: '987', anchor: '244', madeira: '1313' },
  { dmc: '986', anchor: '246', madeira: '1312' },
  { dmc: '522', anchor: '859', madeira: '1513' },
  { dmc: '523', anchor: '858', madeira: '1602' },
  { dmc: '524', anchor: '858', madeira: '1601' },
  { dmc: '3052', anchor: '844', madeira: '1509' },
  { dmc: '3053', anchor: '843', madeira: '1510' },
  { dmc: '3051', anchor: '845', madeira: '1511' },
  { dmc: '500', anchor: '683', madeira: '1705' },
  { dmc: '501', anchor: '878', madeira: '1704' },
  { dmc: '502', anchor: '877', madeira: '1703' },
  { dmc: '503', anchor: '876', madeira: '1702' },
  { dmc: '504', anchor: '875', madeira: '1701' },
  { dmc: '3815', anchor: '879', madeira: '1213' },
  { dmc: '3816', anchor: '876', madeira: '1212' },
  { dmc: '3817', anchor: '875', madeira: '1211' },

  // Blues — navy / baby / delft / royal / wedgewood
  { dmc: '311', anchor: '148', madeira: '1007' },
  { dmc: '312', anchor: '979', madeira: '1006' },
  { dmc: '322', anchor: '978', madeira: '1005' },
  { dmc: '334', anchor: '977', madeira: '1004' },
  { dmc: '775', anchor: '128', madeira: '1001' },
  { dmc: '799', anchor: '136', madeira: '0910' },
  { dmc: '800', anchor: '144', madeira: '0908' },
  { dmc: '798', anchor: '131', madeira: '0911' },
  { dmc: '797', anchor: '132', madeira: '0912' },
  { dmc: '796', anchor: '133', madeira: '0913' },
  { dmc: '820', anchor: '134', madeira: '0914' },
  { dmc: '824', anchor: '164', madeira: '1011' },
  { dmc: '825', anchor: '162', madeira: '1010' },
  { dmc: '826', anchor: '161', madeira: '1009' },
  { dmc: '827', anchor: '160', madeira: '1101' },
  { dmc: '3750', anchor: '1036', madeira: '1708' },
  { dmc: '3760', anchor: '169', madeira: '1108' },
  { dmc: '3761', anchor: '928', madeira: '1101' },
  { dmc: '3766', anchor: '167', madeira: '1102' },
  { dmc: '517', anchor: '162', madeira: '1107' },
  { dmc: '518', anchor: '1039', madeira: '1106' },
  { dmc: '519', anchor: '1038', madeira: '1105' },

  // Violets + lavenders
  { dmc: '550', anchor: '101', madeira: '0713' },
  { dmc: '552', anchor: '99', madeira: '0712' },
  { dmc: '553', anchor: '98', madeira: '0711' },
  { dmc: '554', anchor: '95', madeira: '0710' },
  { dmc: '208', anchor: '110', madeira: '0804' },
  { dmc: '209', anchor: '109', madeira: '0803' },
  { dmc: '210', anchor: '108', madeira: '0802' },
  { dmc: '211', anchor: '342', madeira: '0801' },
  { dmc: '3837', anchor: '100', madeira: '0714' },
  { dmc: '155', anchor: '1030', madeira: '0902' },
  { dmc: '156', anchor: '118', madeira: '0901' },
  { dmc: '157', anchor: '120', madeira: '0903' },
  { dmc: '158', anchor: '177', madeira: '1006' },

  // Bright + Christmas greens, olives, brown greys
  { dmc: '703', anchor: '238', madeira: '1307' },
  { dmc: '704', anchor: '256', madeira: '1308' },
  { dmc: '702', anchor: '226', madeira: '1305' },
  { dmc: '701', anchor: '227', madeira: '1304' },
  { dmc: '700', anchor: '228', madeira: '1303' },
  { dmc: '699', anchor: '923', madeira: '1302' },
  { dmc: '730', anchor: '845', madeira: '2113' },
  { dmc: '731', anchor: '281', madeira: '2112' },
  { dmc: '732', anchor: '281', madeira: '2111' },
  { dmc: '733', anchor: '280', madeira: '2110' },
  { dmc: '734', anchor: '279', madeira: '2109' },
  { dmc: '3023', anchor: '899', madeira: '1903' },
  { dmc: '3024', anchor: '397', madeira: '1902' },
  { dmc: '3022', anchor: '8581', madeira: '1904' },
]

// ────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ────────────────────────────────────────────────────────────────────────────

const dmcByCode = new Map<string, FlossEntry>()
for (const e of DMC_TABLE) dmcByCode.set(e.code, e)

const anchorByCode = new Map<string, FlossEntry>()
for (const e of ANCHOR_TABLE) anchorByCode.set(e.code, e)

const madeiraByCode = new Map<string, FlossEntry>()
for (const e of MADEIRA_TABLE) madeiraByCode.set(e.code, e)

const fromDmc = new Map<string, EquivalenceRow>()
for (const row of EQUIVALENCE_TABLE) fromDmc.set(row.dmc, row)

const fromAnchor = new Map<string, EquivalenceRow>()
for (const row of EQUIVALENCE_TABLE) if (row.anchor) fromAnchor.set(row.anchor, row)

const fromMadeira = new Map<string, EquivalenceRow>()
for (const row of EQUIVALENCE_TABLE) if (row.madeira) fromMadeira.set(row.madeira, row)

export interface BrandLookup {
  code: string
  exact: boolean
}

/** DMC → Anchor (or closest match). Returns null if neither side is known. */
export function dmcToAnchor(dmcCode: string): BrandLookup | null {
  const row = fromDmc.get(dmcCode)
  if (row?.anchor) return { code: row.anchor, exact: true }
  return closestMatch('DMC', dmcCode, 'ANCHOR')
}

/** DMC → Madeira (or closest match). */
export function dmcToMadeira(dmcCode: string): BrandLookup | null {
  const row = fromDmc.get(dmcCode)
  if (row?.madeira) return { code: row.madeira, exact: true }
  return closestMatch('DMC', dmcCode, 'MADEIRA')
}

/** Anchor → DMC (or closest match). */
export function anchorToDmc(anchorCode: string): BrandLookup | null {
  const row = fromAnchor.get(anchorCode)
  if (row) return { code: row.dmc, exact: true }
  return closestMatch('ANCHOR', anchorCode, 'DMC')
}

/** Madeira → DMC (or closest match). */
export function madeiraToDmc(madeiraCode: string): BrandLookup | null {
  const row = fromMadeira.get(madeiraCode)
  if (row) return { code: row.dmc, exact: true }
  return closestMatch('MADEIRA', madeiraCode, 'DMC')
}

/** Anchor → Madeira via DMC pivot. */
export function anchorToMadeira(anchorCode: string): BrandLookup | null {
  const row = fromAnchor.get(anchorCode)
  if (row?.madeira) return { code: row.madeira, exact: true }
  if (row) return dmcToMadeira(row.dmc)
  return closestMatch('ANCHOR', anchorCode, 'MADEIRA')
}

/** Madeira → Anchor via DMC pivot. */
export function madeiraToAnchor(madeiraCode: string): BrandLookup | null {
  const row = fromMadeira.get(madeiraCode)
  if (row?.anchor) return { code: row.anchor, exact: true }
  if (row) return dmcToAnchor(row.dmc)
  return closestMatch('MADEIRA', madeiraCode, 'ANCHOR')
}

/**
 * Generic brand → brand lookup. Returns the equivalent in the target
 * brand, marked exact when the published cross-reference has it and
 * closest-match (exact:false) when the lookup fell through to nearest-
 * by-RGB perceptual matching.
 */
export function brandEquivalent(
  fromBrand: 'DMC' | 'ANCHOR' | 'MADEIRA',
  fromCode: string,
  toBrand: 'DMC' | 'ANCHOR' | 'MADEIRA',
): BrandLookup | null {
  if (fromBrand === toBrand) return { code: fromCode, exact: true }
  if (fromBrand === 'DMC' && toBrand === 'ANCHOR') return dmcToAnchor(fromCode)
  if (fromBrand === 'DMC' && toBrand === 'MADEIRA') return dmcToMadeira(fromCode)
  if (fromBrand === 'ANCHOR' && toBrand === 'DMC') return anchorToDmc(fromCode)
  if (fromBrand === 'ANCHOR' && toBrand === 'MADEIRA') return anchorToMadeira(fromCode)
  if (fromBrand === 'MADEIRA' && toBrand === 'DMC') return madeiraToDmc(fromCode)
  if (fromBrand === 'MADEIRA' && toBrand === 'ANCHOR') return madeiraToAnchor(fromCode)
  return null
}

/**
 * Perceptual nearest-by-RGB lookup. Used as the fallback when the
 * published cross-reference table doesn't list an equivalent. Returns
 * exact:false so the Studio can warn the user that swap fidelity
 * may drop.
 */
function closestMatch(
  fromBrand: 'DMC' | 'ANCHOR' | 'MADEIRA',
  fromCode: string,
  toBrand: 'DMC' | 'ANCHOR' | 'MADEIRA',
): BrandLookup | null {
  const sourceEntry =
    fromBrand === 'DMC' ? dmcByCode.get(fromCode)
      : fromBrand === 'ANCHOR' ? anchorByCode.get(fromCode)
      : madeiraByCode.get(fromCode)
  if (!sourceEntry) return null

  const targetTable =
    toBrand === 'DMC' ? DMC_TABLE
      : toBrand === 'ANCHOR' ? ANCHOR_TABLE
      : MADEIRA_TABLE
  if (targetTable.length === 0) return null

  const [sr, sg, sb] = hexToRgb(sourceEntry.rgb)
  const [sl, sa, sbb] = rgbToLab(sr, sg, sb)
  let best: FlossEntry | null = null
  let bestD = Number.POSITIVE_INFINITY
  for (const candidate of targetTable) {
    const [r, g, b] = hexToRgb(candidate.rgb)
    const [l, a, bb] = rgbToLab(r, g, b)
    const dl = l - sl
    const da = a - sa
    const db = bb - sbb
    const d = dl * dl + da * da + db * db
    if (d < bestD) {
      bestD = d
      best = candidate
    }
  }
  if (!best) return null
  return { code: best.code, exact: false }
}

/**
 * Perceptual colour distance between two floss codes, in CIELAB ΔE
 * units. The Studio uses this to render the "swap loses X%
 * fidelity" warning when a colour falls back to closest-match.
 */
export function colourDistance(
  fromBrand: 'DMC' | 'ANCHOR' | 'MADEIRA',
  fromCode: string,
  toBrand: 'DMC' | 'ANCHOR' | 'MADEIRA',
  toCode: string,
): number | null {
  const a =
    fromBrand === 'DMC' ? dmcByCode.get(fromCode)
      : fromBrand === 'ANCHOR' ? anchorByCode.get(fromCode)
      : madeiraByCode.get(fromCode)
  const b =
    toBrand === 'DMC' ? dmcByCode.get(toCode)
      : toBrand === 'ANCHOR' ? anchorByCode.get(toCode)
      : madeiraByCode.get(toCode)
  if (!a || !b) return null
  const [ar, ag, ab] = hexToRgb(a.rgb)
  const [br, bg, bb] = hexToRgb(b.rgb)
  const [al, aa, abb] = rgbToLab(ar, ag, ab)
  const [bl, bab, bbb] = rgbToLab(br, bg, bb)
  const dl = bl - al
  const da = bab - aa
  const db = bbb - abb
  return Math.sqrt(dl * dl + da * da + db * db)
}

// ────────────────────────────────────────────────────────────────────────────
// CIELAB helpers — same maths as nearest-floss.ts; duplicated here so
// the equivalence module is self-contained (no circular import).
// ────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return [0, 0, 0]
  const v = m[1]
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

function linearise(c: number): number {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/**
 * sRGB -> CIELAB (D65), 0-100 lightness with a/b in the usual -128..127 range.
 * Exported because the bare-fabric background rule needs the same perceptual
 * lightness + chroma test this table already uses to pick nearest colours.
 */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = linearise(r) * 100
  const gl = linearise(g) * 100
  const bl = linearise(b) * 100
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
  const z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041
  const xn = 95.047
  const yn = 100.0
  const zn = 108.883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(x / xn)
  const fy = f(y / yn)
  const fz = f(z / zn)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}
