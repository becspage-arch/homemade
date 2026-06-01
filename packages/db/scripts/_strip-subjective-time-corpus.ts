/**
 * Strip subjective time-of-work claims from any tutorial whose first
 * paragraph was rewritten with the old qc-fix template ("A long kitchen
 * tradition for everyday use at home. About 15 minutes of active work,
 * keeping in a cool cupboard for several weeks." and its RECIPE +
 * HERB_PROFILE siblings).
 *
 * Scans every PUBLISHED tutorial. For each, looks at the first paragraph
 * for the known templated suffix patterns; if found, strips them and
 * rewrites the paragraph. Sets voiceRetrofittedAt = now() only when the
 * body actually changed.
 *
 * Idempotent: re-running on already-stripped tutorials is a no-op.
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: TipTapNode[]
  text?: string
}

function txt(n: TipTapNode | null | undefined): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(txt).join('')
  return ''
}

// Templated suffixes the old qc-fix template emitted, plus the loose
// "About N (minutes|hours)..." claims we don't want anywhere in an
// orientation. Applied as a sentence-level strip on the first paragraph.
const STRIP_PATTERNS: RegExp[] = [
  // The two literal templates from the old qc-fix
  /\s*A long kitchen tradition for everyday use at home\.\s*About 15 minutes of active work,?\s*keeping in a cool cupboard for several weeks\.?/gi,
  /\s*About 30 minutes of active work;?\s*makes about four servings\.?/gi,
  /\s*About 30 minutes of active work\.?\s*$/gi,
  /\s*About ten minutes' work for a single cup;?\s*the jar of dried herb keeps a year\.?/gi,
  // Loose subjective time-of-work claims anywhere in the opening
  /\s*(?:About\s+)?(?:\d{1,3}|five|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twenty[- ]?(?:one|two|three|four|five|six|seven|eight|nine)|thirty|forty|forty[- ]?five|fifty|sixty)\s+minutes['']?\s+(?:of\s+(?:active\s+)?work|work)[.,;]?\s*/gi,
  /\s*(?:About\s+)?(?:\d{1,3}|one|two|three|four|five|six|eight|ten|twelve|fifteen|twenty|thirty|forty|fifty|sixty)\s+(?:hours?|days?)['']?\s+(?:of\s+(?:active\s+)?work|work)[.,;]?\s*/gi,
  /\s*(?:About\s+)?(?:\d{1,3}|fifteen|twenty|thirty|forty|fifty|sixty)\s+minutes\s+of\s+active\s+work[.,;]?\s*/gi,
  /\s*About\s+an?\s+hour['']?s\s+work[.,;]?\s*/gi,
  /\s*(?:about\s+)?fifteen\s+minutes\s+of\s+active\s+work\s+spread\s+over\s+an\s+afternoon[.,;]?\s*/gi,
  /\s*spread\s+over\s+an\s+afternoon[.,;]?\s*/gi,
  /\s*Working\s+time[^.]*\.\s*/gi,
]

function stripSubjectiveTime(text: string): string {
  let out = text
  for (const re of STRIP_PATTERNS) out = out.replace(re, ' ')
  // Tidy
  out = out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\.\s*\./g, '.')
    .replace(/,\s*\./g, '.')
    .replace(/\.\s*,/g, '.')
    .replace(/;\s*$/g, '.')
    .trim()
  // Re-end with sentence punctuation if needed
  if (out && !/[.!?]$/.test(out)) out += '.'
  return out
}

async function main() {
  const DRY_RUN = process.argv.includes('--dry-run')
  const CATEGORY = process.argv.includes('--category')
    ? process.argv[process.argv.indexOf('--category') + 1]
    : null
  const where: Record<string, unknown> = { status: 'PUBLISHED' }
  if (CATEGORY) (where as { category: object }).category = { slug: CATEGORY }
  const tutorials = await prisma.tutorial.findMany({
    where,
    select: { id: true, slug: true, body: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })

  let changed = 0
  let scanned = 0
  const samples: Array<{ slug: string; before: string; after: string }> = []
  for (const t of tutorials) {
    scanned++
    if (scanned % 500 === 0) console.log(`  ...${scanned}/${tutorials.length} (changed=${changed})`)
    const body = t.body as { type?: string; content?: TipTapNode[] } | null
    if (!body || !Array.isArray(body.content)) continue
    const firstParaIdx = body.content.findIndex((n) => n.type === 'paragraph')
    if (firstParaIdx < 0) continue
    const firstPara = body.content[firstParaIdx]!
    const before = txt(firstPara)
    const after = stripSubjectiveTime(before)
    if (after === before) continue
    // Require the result to still be meaningful (don't leave one-sentence
    // openings under 12 words).
    if (after.split(/\s+/).filter(Boolean).length < 12) continue
    if (samples.length < 5) samples.push({ slug: t.slug, before: before.slice(0, 240), after: after.slice(0, 240) })
    if (!DRY_RUN) {
      const newContent = [...body.content]
      newContent[firstParaIdx] = {
        ...firstPara,
        content: [{ type: 'text', text: after, marks: [] }],
      }
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: { ...body, content: newContent }, voiceRetrofittedAt: new Date() },
      })
    }
    changed++
  }
  console.log('')
  console.log(`${DRY_RUN ? 'DRY-RUN: would strip' : 'Stripped'} ${changed}/${scanned} tutorials.`)
  for (const s of samples) {
    console.log(`\n=== ${s.slug} ===`)
    console.log(`BEFORE: ${s.before}`)
    console.log(`AFTER : ${s.after}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
