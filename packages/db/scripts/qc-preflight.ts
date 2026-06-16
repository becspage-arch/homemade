/**
 * Offline QC pre-flight for authored tutorial JSON files.
 *
 * Runs the three gates the upload path enforces, against a file (or a
 * directory of files), WITHOUT touching the DB:
 *   1. runVoiceCheck      — Section 6b voice rules + glossary coverage + termSlug
 *   2. checkCompleteness  — per-category completeness floor
 *   3. auditMakeability   — stricter per-type makeability gate
 *
 * Chart facts are simulated from the presence of `crochet.chartDefinition`
 * (which the upload path writes to Tutorial.chartDefinition) so a PATTERN with
 * a chart definition reads as "has chart" exactly as the live gate would once
 * the linked CrochetPattern row is seeded.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/qc-preflight.ts <file-or-dir> [more...]
 *
 * Exit code: 0 if every file is clean on all three gates, 1 otherwise.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

import { exitCodeFor, formatReport, runVoiceCheck } from './voice-check-lib.js'
import { checkCompleteness } from './qc-completeness-rules/index.js'
import { auditMakeability, ruleKeyFor } from './qc-makeability-rules/index.js'
import { EMPTY_CHART_FACTS, type MakeabilityContext } from './qc-makeability-rules/shared.js'

interface AnyInput {
  slug: string
  title: string
  type?: string
  categorySlug: string
  subCategorySlug?: string | null
  difficulty?: string | null
  sourceNotes?: string | null
  body: unknown
  crochet?: { chartDefinition?: unknown; gaugeText?: string | null; finishedSizeText?: string | null } | null
  knitting?: { chartDefinition?: unknown; gaugeText?: string | null; finishedSizeText?: string | null } | null
  recipe?: { servings?: number | null; yieldDescription?: string | null; totalMinutes?: number | null } | null
  timeMinutes?: number | null
  glossaryTerms?: unknown[]
}

function collectFiles(paths: string[]): string[] {
  const out: string[] = []
  for (const p of paths) {
    const abs = isAbsolute(p) ? p : resolve(process.cwd(), p)
    const st = statSync(abs)
    if (st.isDirectory()) {
      for (const f of readdirSync(abs).sort()) {
        if (f.endsWith('.json')) out.push(join(abs, f))
      }
    } else if (abs.endsWith('.json')) {
      out.push(abs)
    }
  }
  return out
}

function buildMakeabilityContext(input: AnyInput): MakeabilityContext {
  const chartDef = input.crochet?.chartDefinition ?? input.knitting?.chartDefinition ?? null
  const hasChartDef = chartDef != null
  const craft = input.crochet ?? input.knitting ?? null
  return {
    slug: input.slug,
    title: input.title,
    categorySlug: input.categorySlug,
    subCategorySlug: input.subCategorySlug ?? null,
    type: input.type ?? 'RECIPE',
    body: input.body,
    servings: input.recipe?.servings ?? null,
    yieldDescription: input.recipe?.yieldDescription ?? null,
    totalMinutes: input.recipe?.totalMinutes ?? null,
    timeMinutes: input.timeMinutes ?? null,
    prepMinutes: null,
    cookMinutes: null,
    gaugeText: craft?.gaugeText ?? null,
    finishedSizeText: craft?.finishedSizeText ?? null,
    difficulty: input.difficulty ?? null,
    practiceType: null,
    requiresMedicalDisclaimer: false,
    sourceNotes: input.sourceNotes ?? null,
    hasDesigner: false,
    chart: {
      ...EMPTY_CHART_FACTS,
      // The upload path writes crochet.chartDefinition -> Tutorial.chartDefinition,
      // and the anchor seeds a linked CrochetPattern.chartData. Both read true here.
      tutorialChartDefinition: hasChartDef,
      crochetChartData: hasChartDef && (input.crochet != null),
      knittingChartData: hasChartDef && (input.knitting != null),
      hasChartNode: hasChartDef,
    },
  }
}

function main(): void {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: qc-preflight.ts <file-or-dir> [more...]')
    process.exit(2)
  }
  const files = collectFiles(args)
  if (files.length === 0) {
    console.error('No .json files found.')
    process.exit(2)
  }

  let anyFail = false
  for (const file of files) {
    const raw = readFileSync(file, 'utf8')
    let input: AnyInput
    try {
      input = JSON.parse(raw) as AnyInput
    } catch (err) {
      console.error(`\n=== ${file}\n  INVALID JSON: ${err instanceof Error ? err.message : err}`)
      anyFail = true
      continue
    }

    const voice = runVoiceCheck(input)
    const voiceCode = exitCodeFor(voice)

    const completeness = checkCompleteness({
      slug: input.slug,
      categorySlug: input.categorySlug,
      subCategorySlug: input.subCategorySlug ?? null,
      type: input.type ?? 'RECIPE',
      body: input.body,
      servings: input.recipe?.servings ?? null,
      yieldDescription: input.recipe?.yieldDescription ?? null,
      totalMinutes: input.recipe?.totalMinutes ?? null,
      timeMinutes: input.timeMinutes ?? null,
      hasChart: (input.crochet?.chartDefinition ?? input.knitting?.chartDefinition) != null,
    })

    const ctx = buildMakeabilityContext(input)
    const make = auditMakeability(ctx)

    const ok = voiceCode !== 2 && completeness.ok && make.ok
    if (!ok) anyFail = true

    console.log(`\n=== ${input.slug}  [${input.type ?? 'RECIPE'} / ${input.categorySlug}${input.subCategorySlug ? '/' + input.subCategorySlug : ''}]  rule=${ruleKeyFor(ctx)}`)
    console.log(`  voice: ${voiceCode === 2 ? 'FAIL' : voiceCode === 1 ? 'warn' : 'clean'} (${voice.errors.length} err, ${voice.warnings.length} warn)`)
    if (voice.errors.length > 0) {
      for (const f of voice.errors) console.log(`    ERROR ${f.kind}: ${f.message} @ ${f.path}`)
    }
    console.log(`  completeness: ${completeness.ok ? 'clean' : 'FAIL'}`)
    if (!completeness.ok) for (const r of completeness.reasons) console.log(`    - ${r}`)
    console.log(`  makeability: ${make.ok ? 'clean' : 'FAIL'}`)
    if (!make.ok) for (const r of make.reasons) console.log(`    - ${r}`)
    console.log(`  => ${ok ? 'PASS' : 'FAIL'}`)
  }

  console.log(`\n${anyFail ? 'SOME FILES FAILED' : 'ALL FILES PASS'} (${files.length} checked)`)
  process.exit(anyFail ? 1 : 0)
}

main()
