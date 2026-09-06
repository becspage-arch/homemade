/**
 * The pattern-program proof + CLI — the seed of the crochet pattern engine.
 *
 *   cd apps/web && npx tsx scripts/loom-program.ts            # run the proof suite
 *   cd apps/web && npx tsx scripts/loom-program.ts <name>     # one proof program: compile, audit, print instructions
 *
 * Proves ONE declarative pattern source compiles to (a) genuinely-stitched
 * loom geometry (same audit gate as every swatch) and (b) the locked-template
 * written instructions — so the render and the words can never drift apart.
 * Also proves the product's stored ChartDefinition shape recovers a program
 * (programFromChart) that builds the same fabric.
 */

import { compileProgram, programFromChart, writeInstructions, PROOF_PROGRAMS } from '../src/lib/loom/crochet/engine/program'
import { auditProblems } from '../src/lib/loom/crochet/engine/auditChecks'
import { relax, STUFF_PRESSURE, STUFF_PRIOR } from '../src/lib/loom/crochet/engine/relax'
import type { BuiltContinuous } from '../src/lib/loom/crochet/engine/yarnPath'

const yr = 2.4

function relaxFor(built: BuiltContinuous): void {
  const surface = built.frame === 'surface'
  const polar = built.frame === 'polar'
  relax(built.model, {
    collMinDist: yr * 1.25,
    collK: 0.28,
    collAdjacency: 9,
    planeZ: 0,
    planeK: 0,
    layoutK: 0.06,
    layoutMode: surface ? 'surface' : polar ? 'radial' : 'y',
    ...(surface ? { floorZ: 0, stuffing: STUFF_PRESSURE, stuffPrior: STUFF_PRIOR } : polar ? { floorZ: -yr * 1.3 } : {}),
    iterations: surface ? 560 : polar ? 360 : 320, // keep in sync with buildSwatch profiles (centralise later)
  })
}

function runOne(name: string): boolean {
  const p = PROOF_PROGRAMS[name]
  if (!p) {
    console.error(`unknown proof program '${name}' — known: ${Object.keys(PROOF_PROGRAMS).join(', ')}`)
    return false
  }
  const built = compileProgram(p, yr)
  relaxFor(built)
  const problems = auditProblems({ built, recipe: undefined as never }, name, 0, yr)
  const ok = problems.length === 0
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${p.form}, ${built.model.nodes.length} nodes, ${built.links.length} links)`)
  for (const pr of problems) console.log(`  - ${pr}`)
  console.log('  --- written instructions (locked template) ---')
  for (const line of writeInstructions(p)) console.log(`  ${line}`)
  return ok
}

function main(): void {
  const only = process.argv[2]
  const names = only ? [only] : Object.keys(PROOF_PROGRAMS)
  let allOk = true
  for (const n of names) allOk = runOne(n) && allOk

  if (!only) {
    // ChartDefinition round-trip: the product's stored shape → program → geometry.
    console.log('\nchart → program round-trip (a stored flat-circle chart):')
    const chart = {
      title: 'proof-chart-disc',
      layout: 'round' as const,
      rounds: [1, 2, 3, 4, 5, 6].map((k) => ({
        roundNumber: k,
        stitches:
          k === 1
            ? [{ symbol: 'magic-ring' }, { symbol: 'double-crochet-uk', count: 6 }]
            : [{ symbol: 'double-crochet-uk', count: 6 * k }],
      })),
    }
    const p = programFromChart(chart)
    console.log(`  recovered: form=${p.form} stitch=${p.stitch} rounds=[${p.rounds!.join(',')}]`)
    const built = compileProgram(p, yr)
    relaxFor(built)
    const problems = auditProblems({ built, recipe: undefined as never }, p.name, 0, yr)
    console.log(`  ${problems.length === 0 ? 'PASS' : 'FAIL'}  (${built.links.length} links hold)`)
    for (const pr of problems) console.log(`  - ${pr}`)
    allOk = allOk && problems.length === 0
  }
  process.exit(allOk ? 0 : 1)
}

main()
