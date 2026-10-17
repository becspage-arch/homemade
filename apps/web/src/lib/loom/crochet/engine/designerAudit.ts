/**
 * WHAT THE STUDIO DESIGNER MAY SAVE beyond the gauge-1 presets: the fine-gauge
 * knob (gauge.ts, STITCH_ENGINE.md §8q) and the opt-in switches (`cuppedEars`,
 * §8n; `seatBackLegs`, cowPreset.ts), each only where an engine test has put
 * exactly that build through the loom's audit.
 *
 * The save path does not compile (a fine-gauge bunny takes minutes), so it
 * trusts two things: that the maker's choices are a combination a test
 * audited (`designerChoiceProblems`), and that every piece the builder makes
 * for them is a profile a test audited (`isDesignerAuditedProfile`). The
 * combinations are the table below; keep it in step with the tests named on
 * each line, and run them before widening it.
 *
 * The gauge-scaled profiles are DERIVED, not copied: they are the pieces the
 * builder (and so the gauge helpers) makes for the audited combinations, the
 * same programs gauge.test.ts / cowBackLegs.test.ts / earPiece.test.ts compile.
 * They are kept out of `AUDITED_PROFILES` on purpose: that list is audited
 * standing alone at worsted by amigurumi-presets.test.ts and trusted by the
 * program-off-the-wire paths too; these are only trusted for a design the
 * server rebuilds from the maker's choices.
 */

import { TESTED_GAUGES } from './gauge'
import {
  buildAmigurumiProgram,
  isAuditedProfile,
  type AmigurumiBase,
  type AmigurumiChoices,
  type AmigurumiSize,
} from './amigurumiPresets'

/** The gauges a saved design may carry: 1 (off) and the tested ones. */
export const DESIGNER_GAUGES: readonly number[] = [1, ...TESTED_GAUGES]

/** gauge.test.ts builds, relaxes and audits the whole toy for these bases at
 *  size M only (the cow's leg lift is measured at M only, `GAUGE_LEG_LIFT`). */
export const GAUGE_AUDITED: Readonly<Partial<Record<AmigurumiBase, readonly AmigurumiSize[]>>> = {
  bear: ['M'],
  bunny: ['M'],
  cow: ['M'],
}

/** earPiece.test.ts audits the ear pieces at every size (and gauge.test.ts at
 *  every tested gauge); cowBackLegs.test.ts compiles the cupped calf. */
export const CUPPED_EAR_BASES: readonly AmigurumiBase[] = ['bunny', 'cow']

/** cowBackLegs.test.ts: cow M at gauge 1, 1.3 and 1.4 (and cupped). */
export const SEAT_BACK_LEGS_AUDITED = { base: 'cow' as AmigurumiBase, sizes: ['M'] as readonly AmigurumiSize[], gauges: [1, 1.3, 1.4] as readonly number[] }

const SIZES: readonly AmigurumiSize[] = ['S', 'M', 'L']

/** Why these choices are not a combination the engine tests audited (empty =
 *  fine). The opt-in fields absent / false / 1 are always fine. */
export function designerChoiceProblems(c: Pick<AmigurumiChoices, 'base' | 'size' | 'gauge' | 'cuppedEars' | 'seatBackLegs' | 'hat' | 'hair'>): string[] {
  const problems: string[] = []
  const g = c.gauge ?? 1
  if (!DESIGNER_GAUGES.includes(g)) {
    problems.push(`A gauge of ${g} has not been tested; choose one of ${DESIGNER_GAUGES.join(', ')}.`)
  } else if (g !== 1) {
    if (!GAUGE_AUDITED[c.base]?.includes(c.size)) {
      const ok = Object.entries(GAUGE_AUDITED).map(([b, s]) => `${b} (${s!.join('/')})`).join(', ')
      problems.push(`A finer gauge has only been tested on the ${ok}.`)
    }
    if (c.hat) problems.push('A finer gauge has not been tested with a hat.')
    if (c.hair && c.hair !== 'none') problems.push('A finer gauge has not been tested with hair.')
  }
  if (c.cuppedEars === true && !CUPPED_EAR_BASES.includes(c.base)) {
    problems.push(`Cupped ears are for the ${CUPPED_EAR_BASES.join(' and the ')} only.`)
  }
  if (c.seatBackLegs === true) {
    const s = SEAT_BACK_LEGS_AUDITED
    if (c.base !== s.base || !s.sizes.includes(c.size) || !s.gauges.includes(g)) {
      problems.push(`Seated back legs have only been tested on the ${s.sizes.join('/')} ${s.base} at gauge ${s.gauges.join(', ')}.`)
    }
  }
  return problems
}

/** Every combination of the opt-in fields the designer accepts, beyond the
 *  gauge-1 defaults (which `allPresetChoices` and AUDITED_PROFILES cover). */
export function designerAuditedChoices(): AmigurumiChoices[] {
  const colours = { mainHex: '#b5814e', contrastHex: '#e6d3ae', eyeMm: 9, nose: true, paws: true }
  const out: AmigurumiChoices[] = []
  const bases = [...new Set<AmigurumiBase>([...(Object.keys(GAUGE_AUDITED) as AmigurumiBase[]), ...CUPPED_EAR_BASES, SEAT_BACK_LEGS_AUDITED.base])]
  for (const base of bases) {
    for (const size of SIZES) {
      for (const gauge of DESIGNER_GAUGES) {
        for (const cuppedEars of [false, true]) {
          for (const seatBackLegs of [false, true]) {
            const c: AmigurumiChoices = {
              base, size, ...colours,
              ...(gauge !== 1 ? { gauge } : {}),
              ...(cuppedEars ? { cuppedEars } : {}),
              ...(seatBackLegs ? { seatBackLegs } : {}),
            }
            if (designerChoiceProblems(c).length === 0) out.push(c)
          }
        }
      }
    }
  }
  return out
}

let derived: Set<string> | null = null

/** The profiles the builder makes for `designerAuditedChoices()`: derived
 *  through the gauge helpers, never hand-copied. Built once, on first use. */
export function designerAuditedProfileKeys(): ReadonlySet<string> {
  if (!derived) {
    derived = new Set<string>()
    for (const c of designerAuditedChoices()) {
      for (const p of buildAmigurumiProgram(c).parts) derived.add(p.rounds.join(','))
    }
  }
  return derived
}

/** Is this piece audited for a design the server rebuilt from choices that
 *  passed `designerChoiceProblems`? */
export function isDesignerAuditedProfile(rounds: number[]): boolean {
  return isAuditedProfile(rounds) || designerAuditedProfileKeys().has(rounds.join(','))
}
