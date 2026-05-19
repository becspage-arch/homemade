/**
 * pre-review-audit.ts
 *
 * Audits all 30 DRAFT test tutorials across the 14 target categories and
 * outputs a structured JSON report. Run with:
 *   pnpm --filter @homemade/db exec tsx scripts/pre-review-audit.ts
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')

const DRAFT_FILES: { file: string; category: string }[] = [
  // garden (anchor briefs)
  { file: 'docs/garden-anchor-briefs/growing-calendula.json', category: 'garden' },
  { file: 'docs/garden-anchor-briefs/growing-rosemary-from-cuttings.json', category: 'garden' },
  { file: 'docs/garden-anchor-briefs/growing-strawberries.json', category: 'garden' },
  { file: 'docs/garden-anchor-briefs/growing-tomatoes-from-seed.json', category: 'garden' },
  // natural-home (anchor briefs)
  { file: 'docs/natural-home-anchor-briefs/cold-process-oatmeal-soap.json', category: 'natural-home' },
  { file: 'docs/natural-home-anchor-briefs/lavender-beeswax-balm.json', category: 'natural-home' },
  // drafts dir
  { file: 'packages/db/scripts/drafts/calculating-loft-insulation-depth.json', category: 'sustainability' },
  { file: 'packages/db/scripts/drafts/three-bin-hot-compost-system.json', category: 'sustainability' },
  { file: 'packages/db/scripts/drafts/calendula-infused-oil.json', category: 'herbal-medicine' },
  { file: 'packages/db/scripts/drafts/elderberry-syrup.json', category: 'herbal-medicine' },
  { file: 'packages/db/scripts/drafts/cross-stitch-alphabet-sampler-border.json', category: 'needlework' },
  { file: 'packages/db/scripts/drafts/start-and-end-a-thread-cleanly.json', category: 'needlework' },
  { file: 'packages/db/scripts/drafts/running-and-backstitch-by-hand.json', category: 'sewing' },
  { file: 'packages/db/scripts/drafts/simple-drawstring-bag.json', category: 'sewing' },
  { file: 'packages/db/scripts/drafts/foundational-hand-basic-strokes.json', category: 'paper-word' },
  { file: 'packages/db/scripts/drafts/single-signature-pamphlet-binding.json', category: 'paper-word' },
  { file: 'packages/db/scripts/drafts/pinch-pot.json', category: 'pottery-ceramics' },
  { file: 'packages/db/scripts/drafts/wedging-clay-spiral-method.json', category: 'pottery-ceramics' },
  { file: 'packages/db/scripts/drafts/crochet-magic-ring.json', category: 'crochet' },
  { file: 'packages/db/scripts/drafts/granny-square-basic-three-round.json', category: 'crochet' },
  { file: 'packages/db/scripts/drafts/long-tail-cast-on.json', category: 'knitting' },
  { file: 'packages/db/scripts/drafts/stocking-stitch-dishcloth.json', category: 'knitting' },
  { file: 'packages/db/scripts/drafts/plain-weave-on-a-cardboard-loom.json', category: 'fibre-arts' },
  { file: 'packages/db/scripts/drafts/wet-felting-a-soap-covering.json', category: 'fibre-arts' },
  { file: 'packages/db/scripts/drafts/carved-hazel-tent-peg.json', category: 'wood-natural-craft' },
  { file: 'packages/db/scripts/drafts/carved-lime-butter-knife.json', category: 'wood-natural-craft' },
  { file: 'packages/db/scripts/drafts/inspecting-a-beehive-in-summer.json', category: 'animals-smallholding' },
  { file: 'packages/db/scripts/drafts/setting-up-a-chicken-coop-for-first-time-keepers.json', category: 'animals-smallholding' },
  { file: 'packages/db/scripts/drafts/patching-a-small-plasterboard-hole.json', category: 'home-repair' },
  { file: 'packages/db/scripts/drafts/reupholstering-a-drop-in-dining-chair-seat.json', category: 'home-repair' },
]

interface AuditRow {
  file: string
  slug: string
  title: string
  category: string
  verdict: 'PASS' | 'VIOLATES'
  violations: string[]
  violationKinds: string[]
  errorCount: number
  warnCount: number
}

function main() {
  const rows: AuditRow[] = []

  for (const entry of DRAFT_FILES) {
    const absPath = resolve(ROOT, entry.file)
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(readFileSync(absPath, 'utf8'))
    } catch (e) {
      console.error(`Could not read ${entry.file}: ${e}`)
      continue
    }

    const report = runVoiceCheck(parsed)
    const allFindings = [...report.errors, ...report.warnings]
    const kindSet = new Set(allFindings.map(f => f.kind))
    const violations = report.errors.map(e => `${e.kind}: ${e.message.slice(0, 100)}`).concat(
      report.warnings.map(w => `[warn] ${w.kind}: ${w.message.slice(0, 100)}`)
    )

    rows.push({
      file: entry.file,
      slug: String(parsed.slug ?? ''),
      title: String(parsed.title ?? ''),
      category: entry.category,
      verdict: report.errors.length > 0 ? 'VIOLATES' : 'PASS',
      violations,
      violationKinds: Array.from(kindSet),
      errorCount: report.errors.length,
      warnCount: report.warnings.length,
    })
  }

  // Write JSON report
  const outPath = resolve(ROOT, 'docs/pre-review-audit-raw.json')
  writeFileSync(outPath, JSON.stringify(rows, null, 2))
  console.log(`Wrote ${outPath}`)

  // Print summary
  const violators = rows.filter(r => r.verdict === 'VIOLATES')
  const passing = rows.filter(r => r.verdict === 'PASS')
  console.log(`\nTotal: ${rows.length} | PASS: ${passing.length} | VIOLATES: ${violators.length}`)

  // Violation distribution by kind
  const kindCounts: Record<string, number> = {}
  for (const row of violators) {
    for (const k of row.violationKinds) {
      kindCounts[k] = (kindCounts[k] ?? 0) + 1
    }
  }
  console.log('\nViolation distribution:')
  for (const [k, n] of Object.entries(kindCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${n}`)
  }

  console.log('\nViolators:')
  for (const r of violators) {
    console.log(`  ${r.slug} (${r.category}): ${r.errorCount} errors, ${r.warnCount} warnings`)
    for (const v of r.violations.slice(0, 5)) {
      console.log(`    - ${v}`)
    }
  }
}

main()
