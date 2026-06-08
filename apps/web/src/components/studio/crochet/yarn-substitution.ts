/**
 * Yarn substitution helper. Given the pattern's recommended yarn
 * weight + hook size and the user's chosen yarn + hook, compute the
 * size impact and yardage adjustment.
 *
 * Inputs are the Craft Yarn Council standard category integers
 * (0 = lace through 7 = jumbo). Each category has a typical hook
 * size and stitches-per-10cm range; close categories produce similar
 * fabric. The closer the user's substitution to the pattern's
 * recommendation, the smaller the size impact.
 *
 * Outputs are practical numbers a maker can act on:
 *
 *   sizeImpactPercent   — how much the finished piece will differ
 *   yardageImpactPercent — how much yarn the user needs (positive when
 *                          the substitution needs MORE yarn)
 *   warning            — one short sentence explaining the trade
 *   verdict            — 'match' | 'close' | 'noticeable' | 'dramatic'
 */

export interface SubstitutionInputs {
  patternYarnCategory: number | null
  patternHookMm: number | null
  userYarnCategory: number | null
  userHookMm: number | null
}

export interface SubstitutionOutput {
  sizeImpactPercent: number
  yardageImpactPercent: number
  warning: string | null
  verdict: 'match' | 'close' | 'noticeable' | 'dramatic'
  haveEnoughInputs: boolean
}

// Approximate hook size each yarn weight category prefers, in mm.
// Source: Craft Yarn Council standard yarn weight system.
const CATEGORY_TYPICAL_HOOK_MM: Record<number, number> = {
  0: 1.5, // lace
  1: 2.75, // super fine
  2: 3.5, // fine
  3: 4.5, // light / DK
  4: 5.5, // medium / worsted / aran
  5: 6.5, // bulky / chunky
  6: 9, // super bulky
  7: 16, // jumbo
}

export function computeSubstitution(input: SubstitutionInputs): SubstitutionOutput {
  const haveEnoughInputs =
    input.patternYarnCategory !== null &&
    input.userYarnCategory !== null &&
    input.patternHookMm !== null &&
    input.userHookMm !== null

  if (!haveEnoughInputs) {
    return {
      sizeImpactPercent: 0,
      yardageImpactPercent: 0,
      warning: null,
      verdict: 'match',
      haveEnoughInputs: false,
    }
  }

  const patternHook = input.patternHookMm as number
  const userHook = input.userHookMm as number
  const patternCat = input.patternYarnCategory as number
  const userCat = input.userYarnCategory as number

  // Hook size delta in % — finished size scales roughly linearly with
  // hook size for the same number of stitches.
  const hookRatio = userHook / patternHook
  const hookSizeDelta = (hookRatio - 1) * 100

  // Yarn weight category delta — each step up the category scale
  // means thicker yarn, roughly 25% bigger stitches.
  const categoryDelta = (userCat - patternCat) * 25

  // Combined size impact — adding them is a coarse approximation.
  const sizeImpactPercent = Math.round((hookSizeDelta + categoryDelta) * 10) / 10

  // Yardage impact — yarn needed scales roughly with surface area
  // (size impact squared), inverted (more size = more yarn per row,
  // fewer rows for the same length, so it's a weaker effect).
  const sizeFactor = 1 + sizeImpactPercent / 100
  const surfaceFactor = sizeFactor * sizeFactor
  const yardageImpactPercent = Math.round((surfaceFactor - 1) * 100 * 10) / 10

  const absSize = Math.abs(sizeImpactPercent)
  const verdict: SubstitutionOutput['verdict'] =
    absSize < 2 ? 'match' : absSize < 8 ? 'close' : absSize < 18 ? 'noticeable' : 'dramatic'

  let warning: string | null = null
  if (verdict !== 'match') {
    const sizeWord = sizeImpactPercent > 0 ? 'bigger' : 'smaller'
    const yardageWord =
      yardageImpactPercent > 0
        ? `${yardageImpactPercent.toFixed(0)}% more yarn`
        : `${Math.abs(yardageImpactPercent).toFixed(0)}% less yarn`
    if (verdict === 'close') {
      warning = `Close to the pattern. Finished piece about ${absSize.toFixed(0)}% ${sizeWord}; needs about ${yardageWord}.`
    } else if (verdict === 'noticeable') {
      warning = `Noticeable difference. Finished piece about ${absSize.toFixed(0)}% ${sizeWord}; needs about ${yardageWord}. Swatch before committing.`
    } else {
      warning = `Big substitution. Finished piece about ${absSize.toFixed(0)}% ${sizeWord}; needs about ${yardageWord}. The fabric weight will feel different from the pattern.`
    }
  }

  // Approximate typical-hook hint for the user's yarn category, used
  // by the caller to suggest a hook adjustment.
  // (Not returned directly here — the UI can use CATEGORY_TYPICAL_HOOK_MM.)

  return {
    sizeImpactPercent,
    yardageImpactPercent,
    warning,
    verdict,
    haveEnoughInputs,
  }
}

export function typicalHookForCategory(category: number | null | undefined): number | null {
  if (category === null || category === undefined) return null
  return CATEGORY_TYPICAL_HOOK_MM[category] ?? null
}
