/**
 * EVERY AMIGURUMI BASE, END TO END.
 *
 * A base is only real when every layer that names it agrees: the
 * `AmigurumiBase` type and `AMIGURUMI_BASES` list, the session's zod schema the
 * routine's design recipe is parsed against, `designToProgram` (the bulk
 * expander), the loom's audit, the UK written pattern and the completeness gate
 * the publisher runs. The September bases (cat, dog, bird) were wired by hand
 * in several places at once; this walks one recipe per base through all of
 * them so a base that is missing from any one layer fails here rather than on
 * the routine's first brief for it.
 *
 * Slow-ish (one small-size compile + relax + audit per base). Run it the way
 * the other bulk tests run:
 *   cd apps/web && npx tsx --conditions=react-server \
 *     src/lib/studio/generation/bulk/crochet-amigurumi-bases.test.ts
 */

import assert from 'node:assert/strict'
import { checkCrochetPatternCompleteness } from '@homemade/db/crochet-completeness'
import { compileComposition } from '@/lib/loom/crochet/engine/composition'
import {
  compositionBuildOrder,
  compositionChart,
  compositionNotions,
  compositionPieces,
  compositionRowsStructured,
} from '@/lib/loom/crochet/engine/compositionPattern'
import {
  AMIGURUMI_BASES,
  AMIGURUMI_BASE_IDS,
  PRESET_SETTLED_SIZE_MM,
  isAuditedProfile,
} from '@/lib/loom/crochet/engine/amigurumiPresets'
import { CrochetDesignSchema } from './crochet-session'
import { designToProgram } from './crochet-design'
import { isHonestAmigurumiSubject } from './crochet-idea-backlog'

const results: { name: string; passed: boolean; detail?: string }[] = []

function check(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

check('the base list and the base-id tuple are the same set', () => {
  assert.deepEqual(
    AMIGURUMI_BASES.map((b) => b.id).sort(),
    [...AMIGURUMI_BASE_IDS].sort(),
  )
})

for (const spec of AMIGURUMI_BASES) {
  const base = spec.id
  check(`${base}: the motif "${spec.label.toLowerCase()}" is an honest amigurumi subject`, () => {
    assert.ok(isHonestAmigurumiSubject(spec.label.toLowerCase()))
  })

  check(`${base}: every size has a measured finished size`, () => {
    for (const size of ['S', 'M', 'L']) {
      assert.ok(PRESET_SETTLED_SIZE_MM[`${base}-${size}`], `${base}-${size} is missing from the generated size table`)
    }
  })

  check(`${base}: a recipe parses, expands, audits clean and passes the completeness gate`, () => {
    const recipe = {
      treatment: 'amigurumi' as const,
      amigurumi: {
        base,
        size: 'S',
        mainHex: '#e9c95c',
        contrastHex: '#d9822b',
        eyeMm: 6,
        nose: true,
        paws: true,
      },
    }
    const parsed = CrochetDesignSchema.safeParse(recipe)
    assert.ok(parsed.success, parsed.success ? '' : parsed.error.issues.map((i) => i.message).join(' | '))

    const name = `Little ${spec.label.toLowerCase()}`
    const built = designToProgram(parsed.data as never, { shelf: 'amigurumi', name })
    assert.equal(built.kind, 'amigurumi', built.problems.join(' | '))
    if (built.kind !== 'amigurumi') return
    const program = built.program
    for (const part of program.parts) {
      assert.ok(isAuditedProfile(part.rounds), `${part.name} is off the audited profile list`)
    }

    const compiled = compileComposition(program)
    assert.deepEqual(compiled.problems, [], compiled.problems.join(' | '))

    // The written pattern, assembled the way the bulk publisher assembles it.
    const sized = { ...program, gaugeText: 'Single crochet worked in a continuous spiral, stuffed firm, about 18 sts to 10 cm' }
    const pieces = compositionPieces(sized)
    assert.ok(pieces.length >= 1)
    for (const p of pieces) assert.ok(/^[A-Z]/.test(p.label), `piece label "${p.label}" is not a written UK part name`)
    const gate = checkCrochetPatternCompleteness({
      name,
      description: `A small ${spec.label.toLowerCase()} worked in single crochet from a magic ring, stuffed and sewn together.`,
      difficulty: 'beginner',
      terminologyConvention: 'uk',
      primaryYarnWeightId: 'yarn-weight',
      primaryHookId: 'hook',
      gaugeText: sized.gaugeText,
      finishedSizeText: '8 cm tall',
      estimatedHours: 3,
      rowsStructured: compositionRowsStructured(sized),
      // As the bulk publisher's buildPatternRow does: a one-piece composition
      // (ball, egg) carries its sphere chart, a multi-piece one none.
      chartData: compositionChart(sized),
      notions: compositionNotions(sized),
      safetyNotes: 'Safety eyes are not suitable for a toy given to a child under three. Embroider the face instead.',
      abbreviationsUsed: ['ch', 'dc', 'dc2tog', 'sl st'],
      craftStitchSlugs: ['single-crochet', 'magic-ring'],
      pieces: pieces.map((p) => ({
        name: p.label,
        sectionLabel: p.section,
        makeQuantity: p.makeQuantity,
        stitchCountTotal: p.stitchCount,
      })),
      buildOrder: compositionBuildOrder(sized),
      pieceCount: pieces.reduce((a, p) => a + p.makeQuantity, 0),
      subCategorySlug: 'amigurumi',
      designerId: 'designer',
    })
    assert.deepEqual(gate.reasons, [], gate.reasons.join(' | '))
  })
}

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
