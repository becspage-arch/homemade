/**
 * The Studio amigurumi designer's choices, as the save route accepts them.
 *
 * Kept out of the route file so the schema can be tested without a request.
 * The opt-in engine fields (`gauge`, `cuppedEars`, `seatBackLegs`) are taken
 * only in the combinations an engine test audited (engine/designerAudit.ts);
 * anything else is refused here, before the server rebuilds the toy.
 */

import { z } from 'zod'
import {
  AMIGURUMI_BASE_IDS,
  FACE_STYLE_IDS,
  HAT_IDS,
  buildAmigurumiProgram,
  presetSettledSizeMm,
  type AmigurumiChoices,
} from '@/lib/loom/crochet/engine/amigurumiPresets'
import type { CompositionProgram } from '@/lib/loom/crochet/engine/composition'
import {
  DESIGNER_GAUGES,
  designerChoiceProblems,
  isDesignerAuditedProfile,
} from '@/lib/loom/crochet/engine/designerAudit'

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/)

export const DesignerChoicesSchema = z
  .object({
    base: z.enum(AMIGURUMI_BASE_IDS),
    size: z.enum(['S', 'M', 'L']),
    mainHex: hex,
    contrastHex: hex,
    eyeMm: z.number().int().min(0).max(20),
    nose: z.boolean(),
    paws: z.boolean(),
    face: z.enum(FACE_STYLE_IDS).optional(),
    hat: z.enum(HAT_IDS).optional(),
    hatHex: hex.optional(),
    pompomHex: hex.optional(),
    // The doll's dressing (doll.ts): hair, a dress with a frill, lace wings,
    // flowers. Doll-only; every other base ignores them.
    hairHex: hex.optional(),
    skirt: z.object({ hex, hemHex: hex }).optional(),
    wingsHex: hex.optional(),
    flowersHex: hex.optional(),
    // The fine-gauge knob (gauge.ts): only the audited gauges, exactly.
    gauge: z
      .number()
      .refine((g) => DESIGNER_GAUGES.includes(g), { message: `gauge must be one of ${DESIGNER_GAUGES.join(', ')}` })
      .optional(),
    cuppedEars: z.boolean().optional(),
    seatBackLegs: z.boolean().optional(),
    name: z.string().max(120).optional(),
  })
  .superRefine((c, ctx) => {
    // The gauge's own value is the field refinement's to report.
    if (c.gauge != null && !DESIGNER_GAUGES.includes(c.gauge)) return
    for (const message of designerChoiceProblems(c)) ctx.addIssue({ code: 'custom', message })
  })

export type DesignerChoices = z.infer<typeof DesignerChoicesSchema>

/**
 * The choices the engine is handed: the opt-in fields only when they are on,
 * so a design saved with `gauge: 1` or `cuppedEars: false` builds the same
 * object (and hash) as one saved before the fields existed.
 */
export function normaliseDesignerChoices(c: DesignerChoices): AmigurumiChoices {
  const { gauge, cuppedEars, seatBackLegs, ...rest } = c
  return {
    ...rest,
    ...(gauge != null && gauge !== 1 ? { gauge } : {}),
    ...(cuppedEars === true ? { cuppedEars } : {}),
    ...(seatBackLegs === true ? { seatBackLegs } : {}),
  }
}

/**
 * The designer's program, rebuilt on the server from the maker's choices,
 * with the quoted finished size. Refuses a build with a piece no test has
 * audited (belt and braces: the choice gate should already have).
 */
export function buildDesignerProgram(
  choices: AmigurumiChoices,
  name: string,
): { program: CompositionProgram; settled: { width: number; height: number } } | { problems: string[] } {
  const program = { ...buildAmigurumiProgram(choices), name }
  const offProfile = program.parts.filter((p) => !isDesignerAuditedProfile(p.rounds))
  if (offProfile.length) {
    return { problems: [`Those pieces are not ones we can build: ${offProfile.map((p) => p.name).join(', ')}.`] }
  }
  const settled = presetSettledSizeMm(choices.base, choices.size)
  return { program: { ...program, finishedSizeMm: settled }, settled }
}
