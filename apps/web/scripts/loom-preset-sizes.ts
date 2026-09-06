/**
 * Regenerates the amigurumi designer's MEASURED size tables.
 *
 * The Studio quotes a maker a finished size and draws a proportional
 * schematic before it ever renders anything, and both used to come from a
 * hand-written table that drifted stale as the round-work fabric geometry
 * moved under it (§8f-5/§8f-6 in STITCH_ENGINE.md) — a 24/7-plateau head
 * settled at 47 x 52 mm against a declared 34 x 35. This script is the fix:
 * it compiles every audited round profile and every full designer preset
 * through the SAME build + relax + audit pipeline the render uses, reads the
 * size off the settled geometry, and writes the result to a checked-in
 * generated file. `amigurumi-presets.test.ts` re-measures on every run and
 * fails the build if either table drifts more than 10% from what is here, so
 * a re-cut round builder can never leave the Studio quoting a stale number.
 *
 * Two tables, because they serve two different callers:
 *   - `PROFILE_SIZE_MM_GENERATED` — one PIECE built alone on the ground, keyed
 *     by its round-count profile. The designer's live schematic
 *     (`CrochetAmigurumiDesignerPanel`) reads this per part so it can lay out
 *     the proportions in the browser without paying for a full composition
 *     compile on every colour/size click.
 *   - `PRESET_SETTLED_SIZE_MM_GENERATED` — the WHOLE assembled preset (every
 *     part placed, exactly as `buildAmigurumiProgram` builds it), keyed by
 *     `${base}-${size}`. The save path (`buildFromDesigner` in
 *     `api/studio/crochet/patterns/route.ts`) quotes this as the finished
 *     size without recompiling a full bear on every save.
 *
 * Run whenever a round builder, the relaxer, or a preset's placement numbers
 * change:
 *
 *   cd apps/web && npx tsx scripts/loom-preset-sizes.ts
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { compileComposition, type CompiledComposition } from '../src/lib/loom/crochet/engine/composition'
import { AUDITED_PROFILES, allPresetChoices, buildAmigurumiProgram } from '../src/lib/loom/crochet/engine/amigurumiPresets'

const OUT_FILE = path.join(__dirname, '../src/lib/loom/crochet/engine/amigurumiSizes.generated.ts')

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step
}

/** Settled bounding size (mm) + the lowest point, off the composed geometry. */
function settled(compiled: CompiledComposition): { width: number; height: number; minz: number } {
  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity
  for (const p of compiled.placed) {
    minx = Math.min(minx, p.bounds.minx); maxx = Math.max(maxx, p.bounds.maxx)
    minz = Math.min(minz, p.bounds.minz); maxz = Math.max(maxz, p.bounds.maxz)
  }
  return { width: maxx - minx, height: maxz - minz, minz }
}

function main(): void {
  console.log('Measuring every audited round profile (single piece, standalone)...')
  const profileSizes: Record<string, { width: number; height: number }> = {}
  for (const rounds of AUDITED_PROFILES) {
    const compiled = compileComposition({
      name: 'profile-probe',
      yarnWeight: 'worsted',
      parts: [{ name: 'piece', stitch: 'sc', rounds, colourHex: '#b5814e', place: { on: 'ground' } }],
    })
    if (compiled.problems.length) {
      throw new Error(`profile ${rounds.join(',')} failed the audit: ${compiled.problems.join(' | ')}`)
    }
    const s = settled(compiled)
    const key = rounds.join(',')
    // A tenth of a mm: precise enough for the schematic's proportions without
    // pretending the relaxer settles to more digits than it does.
    profileSizes[key] = { width: Math.round(s.width * 10) / 10, height: Math.round(s.height * 10) / 10 }
    console.log(`  ${key.padEnd(28)} ${profileSizes[key]!.width} x ${profileSizes[key]!.height} mm`)
  }

  console.log('\nMeasuring every full designer preset (every part assembled)...')
  const presetSizes: Record<string, { width: number; height: number }> = {}
  const minzBySize: Record<string, number> = {}
  for (const choices of allPresetChoices()) {
    const program = buildAmigurumiProgram(choices)
    const compiled = compileComposition(program)
    if (compiled.problems.length) {
      throw new Error(`${choices.base}-${choices.size} failed the audit: ${compiled.problems.join(' | ')}`)
    }
    const s = settled(compiled)
    const key = `${choices.base}-${choices.size}`
    // Quoted to a maker as a finished size: round to the nearest 5 mm, the way
    // a real pattern's finished-size line does.
    presetSizes[key] = { width: roundTo(s.width, 5), height: roundTo(s.height, 5) }
    minzBySize[key] = Math.round(s.minz * 100) / 100
    console.log(
      `  ${key.padEnd(10)} ${presetSizes[key]!.width} x ${presetSizes[key]!.height} mm` +
      `  (settled ${s.width.toFixed(1)} x ${s.height.toFixed(1)}, minz ${minzBySize[key]!.toFixed(2)})`,
    )
  }

  const offTable = Object.entries(minzBySize).filter(([, z]) => Math.abs(z) > 0.5)
  if (offTable.length) {
    console.warn(
      `\nWARNING: ${offTable.length} preset(s) do not sit on the table (minz > 0.5 mm from 0): ` +
      offTable.map(([k, z]) => `${k}=${z}`).join(', '),
    )
  }

  const file = `/**
 * GENERATED by \`scripts/loom-preset-sizes.ts\` — do not hand-edit.
 *
 * Measured sizes off the settled, relaxed, audit-gated geometry — the same
 * pipeline the render compiles. Regenerate with:
 *
 *   cd apps/web && npx tsx scripts/loom-preset-sizes.ts
 *
 * \`amigurumi-presets.test.ts\` re-measures on every run and fails the build if
 * either table below has drifted more than 10% from what a fresh compile
 * settles to, so a re-cut round builder can never leave this file stale.
 */

/** One piece's settled width x height in mm at worsted weight, by round profile
 *  (\`rounds.join(',')\`). Built and measured standing alone on the ground. */
export const PROFILE_SIZE_MM_GENERATED: Record<string, { width: number; height: number }> = ${JSON.stringify(profileSizes, null, 2)}

/** The whole finished piece's settled size (rounded to the nearest 5 mm, the
 *  way a pattern's finished-size line is), by \`\${base}-\${size}\`. */
export const PRESET_SETTLED_SIZE_MM_GENERATED: Record<string, { width: number; height: number }> = ${JSON.stringify(presetSizes, null, 2)}
`
  writeFileSync(OUT_FILE, file)
  console.log(`\nWrote ${path.relative(process.cwd(), OUT_FILE)}`)
}

main()
