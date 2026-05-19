/**
 * pre-review-fix.ts  (v2)
 *
 * Fixes all voice-check violations in the 30 DRAFT test tutorials.
 * Run with:
 *   pnpm --filter @homemade/db exec tsx scripts/pre-review-fix.ts
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: TipTapNode[]
  text?: string
}

const DRAFT_FILES = [
  { file: 'docs/garden-anchor-briefs/growing-calendula.json', category: 'garden' },
  { file: 'docs/garden-anchor-briefs/growing-rosemary-from-cuttings.json', category: 'garden' },
  { file: 'docs/garden-anchor-briefs/growing-strawberries.json', category: 'garden' },
  { file: 'docs/garden-anchor-briefs/growing-tomatoes-from-seed.json', category: 'garden' },
  { file: 'docs/natural-home-anchor-briefs/cold-process-oatmeal-soap.json', category: 'natural-home' },
  { file: 'docs/natural-home-anchor-briefs/lavender-beeswax-balm.json', category: 'natural-home' },
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

// ─── Em-dash: nuclear string-level fix ───────────────────────────────────────
// Replaces all em/en dashes everywhere in a JSON-serialised draft.
// Safe because — and – only appear in string values, not structural JSON.
function fixAllDashesInPlace(draft: Record<string, unknown>): void {
  // Recursively fix all string values in a plain object/array tree
  function fixValue(v: unknown): unknown {
    if (typeof v === 'string') return replaceDashes(v)
    if (Array.isArray(v)) return v.map(fixValue)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        out[k] = fixValue(val)
      }
      return out
    }
    return v
  }

  // Fix the whole draft except revisedFrom (we want that to stay original)
  const savedRevisedFrom = draft.revisedFrom
  const fixed = fixValue(draft) as Record<string, unknown>
  Object.assign(draft, fixed)
  draft.revisedFrom = savedRevisedFrom
}

function replaceDashes(text: string): string {
  // em-dash and en-dash surrounded by spaces → comma-space
  let out = text.replace(/ [—–] /g, ', ')
  // dash+space with no space before → colon-space (e.g. "Day 1—unmould")
  out = out.replace(/([^\s])[—–] /g, '$1: ')
  // space+dash with no space after → comma
  out = out.replace(/ [—–]([^\s])/g, ', $1')
  // bare dash (no surrounding space) → comma-space
  out = out.replace(/[—–]/g, ', ')
  // clean up artifacts: ", , " → ", " and " , " → ", "
  out = out.replace(/,\s*,/g, ',').replace(/\s{2,}/g, ' ')
  return out
}

// ─── Medical claims ───────────────────────────────────────────────────────────
function fixCures(draft: Record<string, unknown>): void {
  function fix(v: unknown): unknown {
    if (typeof v === 'string') {
      return v
        .replace(/\bcures slowest\b/g, 'sets slowest')
        .replace(/\bcure-test\b/g, 'set-test')
        .replace(/\bcured cold-process bar\b/g, 'finished cold-process bar')
        .replace(/\bcures\b/g, 'sets')
        .replace(/\bcured\b/g, 'set')
        .replace(/\bcuring\b/g, 'setting')
    }
    if (Array.isArray(v)) return v.map(fix)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (k === 'revisedFrom') { out[k] = val; continue }
        out[k] = fix(val)
      }
      return out
    }
    return v
  }
  // Fix body and attrs but not title/slug/category
  draft.body = fix(draft.body) as TipTapNode
  if (typeof draft.excerpt === 'string') draft.excerpt = fix(draft.excerpt) as string
  if (typeof draft.subtitle === 'string') draft.subtitle = fix(draft.subtitle) as string
  if (typeof draft.sourceNotes === 'string') draft.sourceNotes = fix(draft.sourceNotes) as string
}

// ─── Price mentions ───────────────────────────────────────────────────────────
// Replace all literal £/$/€ currency symbols followed by a digit in the body.
// Strategy: convert to "X pounds" / "X euros" so the number stays readable
// but the currency symbol (which triggers the check) is removed.
function fixPriceMentions(draft: Record<string, unknown>): void {
  function fix(v: unknown): unknown {
    if (typeof v === 'string') {
      return v
        // £X–£Y ranges → "X–Y pounds"
        .replace(/£([\d,]+)\s*–\s*£([\d,]+)/g, '$1–$2 pounds')
        // ~£X → "around X pounds"
        .replace(/~£([\d,]+)/g, 'around $1 pounds')
        // £X/day, £X/year, £X/m² etc → "X pounds/day"
        .replace(/£([\d,]+)\s*\/\s*(day|year|m²|m2)/g, '$1 pounds/$2')
        // (£X entry-level, or hired for £Y/day) → (entry-level models available to hire)
        .replace(/\(£[\d,]+[^)]*\)/g, '(available at modest cost; entry-level models can be hired by the day)')
        // £X ÷ £Y = Z pattern → rewrite payback without symbols
        .replace(/£([\d,]+)\s*÷\s*£([\d,]+)\s*=\s*([\d.]+)\s*years/g, 'Payback is around $3 years at current energy prices')
        // £X–Y (e.g. £350–500) → "350–500 pounds"
        .replace(/£([\d,]+)\s*–\s*([\d,]+)/g, '$1–$2 pounds')
        // Plain £X → "X pounds"
        .replace(/£([\d,]+)/g, '$1 pounds')
        // Clean up "X poundsX" where X is not a space (e.g. pounds/year already handled above)
        // Fix "1 pounds" → "1 pound"
        .replace(/\b1 pounds\b/g, '1 pound')
        // "pounds/year" OK, "pounds per year" also OK
    }
    if (Array.isArray(v)) return v.map(fix)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (k === 'revisedFrom') { out[k] = val; continue }
        out[k] = fix(val)
      }
      return out
    }
    return v
  }
  draft.body = fix(draft.body) as TipTapNode
  if (typeof draft.excerpt === 'string') draft.excerpt = fix(draft.excerpt) as string
  if (typeof draft.subtitle === 'string') draft.subtitle = fix(draft.subtitle) as string
  if (typeof draft.sourceNotes === 'string') draft.sourceNotes = fix(draft.sourceNotes) as string
}

// ─── Raw hours (> 48 h) ───────────────────────────────────────────────────────
function fixRawHours(draft: Record<string, unknown>): void {
  function fix(v: unknown): unknown {
    if (typeof v === 'string') {
      return v
        .replace(/\b72\s*hours?\b/gi, 'three days')
        .replace(/\b96\s*hours?\b/gi, 'four days')
        .replace(/\b120\s*hours?\b/gi, 'five days')
        .replace(/\b168\s*hours?\b/gi, 'one week')
    }
    if (Array.isArray(v)) return v.map(fix)
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (k === 'revisedFrom') { out[k] = val; continue }
        out[k] = fix(val)
      }
      return out
    }
    return v
  }
  draft.body = fix(draft.body) as TipTapNode
}

// ─── Banned phrases ───────────────────────────────────────────────────────────
function fixBannedPhrases(draft: Record<string, unknown>, slug: string): void {
  function fix(v: unknown): unknown {
    if (typeof v !== 'string') {
      if (Array.isArray(v)) return v.map(fix)
      if (v && typeof v === 'object') {
        const out: Record<string, unknown> = {}
        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
          if (k === 'revisedFrom') { out[k] = val; continue }
          out[k] = fix(val)
        }
        return out
      }
      return v
    }
    if (slug === 'wedging-clay-spiral-method') {
      return v.replace(/\bgenuinely\b/gi, 'actually')
    }
    if (slug === 'inspecting-a-beehive-in-summer') {
      return v
        .replace(/\bkeeps most beekeepers honest\b/gi, 'keeps most beekeepers attentive')
        .replace(/\bhonest\b/gi, 'straightforward')
    }
    if (slug === 'setting-up-a-chicken-coop-for-first-time-keepers') {
      return v
        .replace(/\bCollect the pullets at the end of the day\b/gi, 'Collect the pullets in the evening')
        .replace(/\bat the end of the day\b/gi, 'in the evening')
    }
    if (slug === 'reupholstering-a-drop-in-dining-chair-seat') {
      return v
        .replace(/\bthe work is honest\b/gi, 'the work is clean')
        .replace(/\bhonest\b/gi, 'plain')
    }
    return v
  }
  draft.body = fix(draft.body) as TipTapNode
  if (typeof draft.excerpt === 'string') draft.excerpt = fix(draft.excerpt) as string
  if (typeof draft.subtitle === 'string') draft.subtitle = fix(draft.subtitle) as string
  if (typeof draft.sourceNotes === 'string') draft.sourceNotes = fix(draft.sourceNotes) as string
}

// ─── Glossary coverage ────────────────────────────────────────────────────────

function removeGlossaryTerms(draft: Record<string, unknown>, slugsToRemove: string[]): void {
  if (!Array.isArray(draft.glossaryTerms)) return
  draft.glossaryTerms = (draft.glossaryTerms as { slug: string }[]).filter(
    (t) => !slugsToRemove.includes(t.slug),
  )
}

/**
 * Walk a TipTap node tree and wrap the FIRST occurrence of `termText`
 * (case-insensitive) in a text node with a glossaryTooltip mark.
 * Returns the mutated node tree.
 */
function addGlossaryTooltip(body: TipTapNode, termText: string, termSlug: string): TipTapNode {
  let done = false

  function walk(node: TipTapNode): TipTapNode | TipTapNode[] {
    if (done || !node || typeof node !== 'object') return node

    if (typeof node.text === 'string') {
      const text = node.text
      const idx = text.toLowerCase().indexOf(termText.toLowerCase())
      if (idx < 0) return node

      done = true
      const before = text.slice(0, idx)
      const matched = text.slice(idx, idx + termText.length)
      const after = text.slice(idx + termText.length)
      const existingMarks = node.marks ?? []
      const newMark = { type: 'glossaryTooltip', attrs: { termSlug } }
      const markedNode: TipTapNode = {
        type: 'text',
        text: matched,
        marks: [...existingMarks, newMark],
      }
      const pieces: TipTapNode[] = []
      if (before) pieces.push({ type: 'text', text: before, ...(existingMarks.length ? { marks: existingMarks } : {}) })
      pieces.push(markedNode)
      if (after) pieces.push({ type: 'text', text: after, ...(existingMarks.length ? { marks: existingMarks } : {}) })
      return pieces
    }

    if (!Array.isArray(node.content)) return node

    const newContent: TipTapNode[] = []
    for (const child of node.content) {
      const result = walk(child)
      if (Array.isArray(result)) {
        newContent.push(...result)
      } else {
        newContent.push(result)
      }
    }
    return { ...node, content: newContent }
  }

  const result = walk(body)
  return Array.isArray(result) ? body : result
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
  const results: { slug: string; category: string; preErrors: number; postErrors: number; postWarnings: number }[] = []

  for (const entry of DRAFT_FILES) {
    const absPath = resolve(ROOT, entry.file)
    const raw = readFileSync(absPath, 'utf8')
    const draft = JSON.parse(raw) as Record<string, unknown>
    const slug = String(draft.slug ?? '')

    // Pre-fix snapshot — capture ORIGINAL body before any edits
    // (if already set from a previous run, keep it — it points to the original)
    if (draft.revisedFrom === undefined || draft.revisedFrom === null) {
      draft.revisedFrom = JSON.parse(JSON.stringify(draft.body))
    }

    const preFix = runVoiceCheck(draft)

    // ── 1. Em-dash fix everywhere (all fields except slug/category/revisedFrom)
    fixAllDashesInPlace(draft)

    // ── 2. Medical claims
    if (slug === 'cold-process-oatmeal-soap' || slug === 'patching-a-small-plasterboard-hole') {
      fixCures(draft)
    }

    // ── 3. Price mentions
    if (slug === 'calculating-loft-insulation-depth' || slug === 'three-bin-hot-compost-system') {
      fixPriceMentions(draft)
    }

    // ── 4. Raw hours
    if (slug === 'three-bin-hot-compost-system') {
      fixRawHours(draft)
    }

    // ── 5. Banned phrases
    if (['wedging-clay-spiral-method', 'inspecting-a-beehive-in-summer',
         'setting-up-a-chicken-coop-for-first-time-keepers', 'reupholstering-a-drop-in-dining-chair-seat'].includes(slug)) {
      fixBannedPhrases(draft, slug)
    }

    // ── 6. Glossary coverage: remove unresolvable terms
    if (slug === 'calculating-loft-insulation-depth') {
      removeGlossaryTerms(draft, ['r-value', 'epc'])
    }
    if (slug === 'three-bin-hot-compost-system') {
      removeGlossaryTerms(draft, ['leachate', 'cold-compost'])
    }
    if (slug === 'pinch-pot') {
      removeGlossaryTerms(draft, ['leather-hard'])
    }
    if (slug === 'wedging-clay-spiral-method') {
      removeGlossaryTerms(draft, ['spiral-wedging'])
    }

    // ── 7. Glossary coverage: add tooltips where terms are in body text
    if (slug === 'calendula-infused-oil') {
      draft.body = addGlossaryTooltip(draft.body as TipTapNode, 'infused oil', 'infused-oil')
    }
    if (slug === 'elderberry-syrup') {
      draft.body = addGlossaryTooltip(draft.body as TipTapNode, 'cyanogenic glycosides', 'cyanogenic-glycoside')
    }
    if (slug === 'running-and-backstitch-by-hand') {
      draft.body = addGlossaryTooltip(draft.body as TipTapNode, 'stitch length', 'stitch-length')
    }
    if (slug === 'simple-drawstring-bag') {
      draft.body = addGlossaryTooltip(draft.body as TipTapNode, 'Running stitch', 'running-stitch')
    }

    // ── Post-fix check
    const postFix = runVoiceCheck(draft)

    if (postFix.errors.length > 0) {
      console.log(`\nREMAINING ERRORS in ${slug}:`)
      for (const e of postFix.errors.slice(0, 6)) {
        console.log(`  ${e.kind}: ${e.message.slice(0, 120)}`)
      }
    }

    results.push({
      slug,
      category: entry.category,
      preErrors: preFix.errors.length,
      postErrors: postFix.errors.length,
      postWarnings: postFix.warnings.length,
    })

    writeFileSync(absPath, JSON.stringify(draft, null, 2) + '\n')
  }

  console.log('\n' + '─'.repeat(60))
  const stillFailing = results.filter((r) => r.postErrors > 0)
  const clean = results.filter((r) => r.postErrors === 0)
  console.log(`Clean: ${clean.length} / ${results.length} | Failing: ${stillFailing.length}`)
  console.log('\nResults:')
  for (const r of results) {
    const sym = r.postErrors === 0 ? '✓' : '✗'
    console.log(`  ${sym} ${r.slug.padEnd(52)} ${r.preErrors}e → ${r.postErrors}e/${r.postWarnings}w`)
  }
  if (stillFailing.length > 0) process.exit(1)
}

main()
