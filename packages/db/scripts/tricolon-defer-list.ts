/**
 * Tricolon manual-review list dump.
 *
 * The 2026-05-16 audit flagged 529 tricolons (warnings) across 538
 * PUBLISHED tutorials. The fixup session attempted a conservative auto-
 * rewrite but found that almost all flagged tricolons are content lists
 * (ingredients, recipe steps, place names) where the standard "drop the
 * third" voice fix would delete real information. A heading like
 * "Pat, cut, and top" or an ingredient line "soured cream, sugar, and
 * vanilla" should NOT lose the third item.
 *
 * This script writes a per-tutorial dump of every detected tricolon with
 * surrounding context so a follow-up manual-review session can read each
 * one and decide: keep / rewrite / split. No mutations.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/tricolon-defer-list.ts
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
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

const TRICOLON_RE =
  /\b([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+and\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3})\b/giu

interface TipTapNode {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

function flatten(n: TipTapNode): string {
  if (typeof n.text === 'string') return n.text
  if (!Array.isArray(n.content)) return ''
  return n.content.map(flatten).join('')
}

interface Hit { kind: string; text: string; matches: string[] }

function* walk(n: TipTapNode): Generator<{ kind: string; text: string }> {
  if (!n || typeof n !== 'object') return
  const t = n.type ?? ''
  if (t === 'paragraph' || t === 'heading' || t === 'blockquote') {
    yield { kind: t, text: flatten(n) }
  }
  if (t === 'pullQuote' && n.attrs && typeof n.attrs.quote === 'string') {
    yield { kind: 'pullQuote.quote', text: n.attrs.quote as string }
  }
  if (t === 'infoPanel' && n.attrs) {
    if (typeof n.attrs.title === 'string') yield { kind: 'infoPanel.title', text: n.attrs.title }
    if (typeof n.attrs.body === 'string') yield { kind: 'infoPanel.body', text: n.attrs.body }
  }
  if ((t === 'varietiesPanel' || t === 'troubleshooter') && n.attrs) {
    if (typeof n.attrs.intro === 'string') yield { kind: `${t}.intro`, text: n.attrs.intro }
    const items = Array.isArray(n.attrs.items) ? (n.attrs.items as Record<string, unknown>[]) : []
    const keys = t === 'varietiesPanel' ? ['description'] : ['cause', 'fix']
    for (const it of items) {
      for (const k of keys) {
        if (typeof it[k] === 'string') yield { kind: `${t}.${k}`, text: it[k] as string }
      }
    }
  }
  if (t === 'productCard' && n.attrs && typeof n.attrs.description === 'string') {
    yield { kind: 'productCard.description', text: n.attrs.description }
  }
  if (Array.isArray(n.content)) for (const c of n.content) yield* walk(c)
}

function findHits(text: string): string[] {
  return text.match(TRICOLON_RE) ?? []
}

async function main(): Promise<void> {
  const rows = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, title: true, body: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
  })
  console.log(`Walking ${rows.length} PUBLISHED tutorials.`)

  let totalHits = 0
  let tutorialsWithHits = 0
  const lines: string[] = []
  const today = new Date().toISOString().slice(0, 10)
  lines.push(`# Tricolon manual-review list — ${today}`)
  lines.push('')
  lines.push(
    `The 2026-05-16 cross-category audit flagged tricolon warnings (three parallel ` +
      `items in a row: "X, Y, and Z"). The fixup session attempted a deterministic ` +
      `rewrite but found that almost every flagged tricolon is a content list — ` +
      `ingredients, recipe steps, place names — where dropping the third item ` +
      `would delete real information. This file dumps every match with surrounding ` +
      `context so a focused manual-review session can decide per-snippet whether ` +
      `to rewrite, split, leave alone, or tighten the voice-check regex itself.`,
  )
  lines.push('')
  lines.push('## How to use')
  lines.push('')
  lines.push(
    '- For each snippet decide: **leave** (content list — accept the false positive), ' +
      '**rewrite** (genuine voice tell — drop the third item or break the sentence), ' +
      '**split** (three items genuinely deserve being a numbered list).',
  )
  lines.push(
    '- Update the tutorial body via the admin editor (preferred — preserves marks) ' +
      'or via a Prisma update if the change is purely a text-node rewrite.',
  )
  lines.push(
    '- Consider tightening `voice-check-lib.ts` `containsTricolon` to exclude ' +
      'recipe-instruction patterns and ingredient lists — that would shrink this ' +
      'list significantly on the next audit run.',
  )
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const row of rows) {
    const body = row.body as TipTapNode
    const tutorialHits: Hit[] = []
    for (const chunk of walk(body)) {
      const matches = findHits(chunk.text)
      if (matches.length > 0) tutorialHits.push({ kind: chunk.kind, text: chunk.text, matches })
    }
    if (tutorialHits.length === 0) continue

    tutorialsWithHits += 1
    const slugHitCount = tutorialHits.reduce((acc, h) => acc + h.matches.length, 0)
    totalHits += slugHitCount

    lines.push(`### \`${row.slug}\` (${row.category.slug}) — ${slugHitCount} hit${slugHitCount === 1 ? '' : 's'}`)
    lines.push('')
    for (const h of tutorialHits) {
      lines.push(`- **${h.kind}**`)
      for (const m of h.matches) {
        // Find the match in the original text and slice ~60 chars of context
        // around it for readability.
        const idx = h.text.indexOf(m)
        const start = Math.max(0, idx - 60)
        const end = Math.min(h.text.length, idx + m.length + 60)
        const before = h.text.slice(start, idx).replace(/\s+/g, ' ')
        const after = h.text.slice(idx + m.length, end).replace(/\s+/g, ' ')
        lines.push(`  - \`${before}**${m}**${after}\``)
      }
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(`Total hits: **${totalHits}** across **${tutorialsWithHits}** tutorials.`)

  const file = resolve(__dirname, '..', '..', '..', 'docs', 'tricolon-defer-list.md')
  writeFileSync(file, lines.join('\n') + '\n', 'utf8')
  console.log(`Wrote ${file}`)
  console.log(`Total hits: ${totalHits} across ${tutorialsWithHits} tutorials.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
