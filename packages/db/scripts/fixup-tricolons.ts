/**
 * Tricolon rewrite — Phase 8 voice-rule fix-up.
 *
 * The 2026-05-16 audit flagged 529 tricolon warnings across published
 * tutorial bodies. A tricolon is the "X, Y, and Z" tell — three parallel
 * items in a row, the strongest sign of generic AI prose. Per the voice
 * rules in `feedback_homemade_voice.md` we drop the third item by default
 * ("warm, gentle, and slow" → "warm and gentle"). The grammar pattern
 * matches the voice-check detector in `voice-check-lib.ts`.
 *
 * Strategy:
 *   - Walk every paragraph-bearing block in the body.
 *   - For each plain text node whose text matches the tricolon regex,
 *     rewrite that single text node. Skip matches whose three items span
 *     multiple text nodes (marks make safe in-place rewrites impossible).
 *   - Snapshot TutorialVersion before each tutorial's update.
 *   - Write a per-slug log so we can re-run for the remaining unfixed
 *     tutorials in a resume session.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/fixup-tricolons.ts [--limit N] [--dry-run] [--slugs slug1,slug2]
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
import type { Prisma } from '@prisma/client'

// Match the voice-check detector. "X, Y, and Z" where each item is 1–4
// words made of letters / hyphens. The captures keep X and Y so the
// rewrite is "X and Y" — drop the third item by default.
const TRICOLON_RE =
  /\b([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3}),\s+and\s+([\p{L}-]+(?:\s+[\p{L}-]+){0,3})\b/giu

/**
 * Conservative gate: only auto-rewrite when the three items look
 * stylistic (descriptors of state/quality) rather than content (ingredient
 * lists, instructions, place names).
 *
 * Pass conditions — ALL must hold across the three items:
 *   - Each item is 1–3 tokens, where a token is one or more letters or
 *     hyphens. Recipe-instruction tricolons usually contain articles or
 *     prepositions ("Add the banana, milk, and cinnamon") which trip the
 *     banned-token check below.
 *   - No token is in the banned-word set: articles, prepositions,
 *     determiners, negations, quantifiers. These signal the tricolon is
 *     part of a sentence-structure rather than a parallel descriptor list.
 *   - No token is in the ingredient-stop list. Single-word ingredient
 *     names ("salt, pepper, and nutmeg") would otherwise sneak through.
 *   - At most one of the three items starts with an uppercase letter.
 *     Catches the sentence-initial case ("Stirring, scraping, and folding")
 *     while filtering proper-noun lists ("Syria, Jordan, and Palestine").
 *   - No item contains a digit.
 *
 * Everything else lands in `contentDeferred` and shows up in the manual-
 * review hand-off rather than being auto-rewritten.
 */
const BANNED_TOKENS = new Set([
  'a', 'an', 'the',
  'of', 'with', 'in', 'on', 'for', 'to', 'from', 'by', 'as', 'than',
  'into', 'onto', 'over', 'under', 'between', 'across', 'around', 'at',
  'no', 'not',
  'some', 'any', 'all', 'both', 'every', 'each', 'several', 'many', 'few',
  'more', 'less', 'most', 'least', 'much',
  'and', 'or', 'but', 'so', 'yet',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
])

const INGREDIENT_STOP = new Set([
  'salt', 'pepper', 'sugar', 'flour', 'butter', 'oil', 'milk', 'cream',
  'water', 'wine', 'vinegar', 'honey', 'syrup', 'yeast', 'soda',
  'lemon', 'lime', 'orange', 'apple', 'pear', 'plum', 'cherry',
  'onion', 'garlic', 'shallot', 'leek', 'carrot', 'celery', 'potato',
  'tomato', 'chilli', 'chili', 'ginger', 'nutmeg', 'cinnamon',
  'cardamom', 'cumin', 'coriander', 'allspice', 'cloves', 'paprika',
  'thyme', 'rosemary', 'parsley', 'basil', 'mint', 'sage', 'oregano',
  'tarragon', 'dill', 'bay', 'fennel', 'fenugreek',
  'egg', 'eggs', 'yolk', 'yolks',
  'beef', 'pork', 'lamb', 'chicken', 'duck', 'goose', 'turkey', 'fish',
  'cheese', 'parmesan', 'gruyère', 'cheddar', 'mozzarella', 'ricotta',
  'bread', 'rice', 'pasta', 'noodles', 'oats', 'beans', 'lentils',
  'nuts', 'almonds', 'walnuts', 'pecans', 'hazelnuts', 'pistachios',
  'cocoa', 'chocolate', 'coffee', 'tea', 'vanilla',
  'stock', 'broth', 'sauce', 'paste',
  'mustard', 'sultanas', 'raisins', 'currants',
  'cucumber', 'aubergine', 'courgette', 'spinach', 'kale', 'cabbage',
])

function tokenise(s: string): string[] {
  return s.match(/[\p{L}-]+/gu) ?? []
}

function looksStylistic(items: [string, string, string]): boolean {
  for (const item of items) {
    if (/\d/.test(item)) return false
    const tokens = tokenise(item)
    if (tokens.length === 0 || tokens.length > 3) return false
    for (const tok of tokens) {
      const lower = tok.toLowerCase()
      if (BANNED_TOKENS.has(lower)) return false
      if (INGREDIENT_STOP.has(lower)) return false
    }
  }
  const uppercaseCount = items.filter((it) => /^[A-Z]/.test(it)).length
  if (uppercaseCount > 1) return false
  return true
}

function rewriteText(text: string): { next: string; rewritten: number; deferred: number } {
  let rewritten = 0
  let deferred = 0
  const next = text.replace(TRICOLON_RE, (full, x: string, y: string, z: string) => {
    if (looksStylistic([x, y, z])) {
      rewritten += 1
      return `${x} and ${y}`
    }
    deferred += 1
    return full
  })
  return { next, rewritten, deferred }
}

interface CliFlags {
  limit: number | null
  dryRun: boolean
  slugs: string[] | null
}

function parseCliFlags(argv: string[]): CliFlags {
  let limit: number | null = null
  let dryRun = false
  let slugs: string[] | null = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--dry-run') dryRun = true
    else if (a === '--limit') {
      const v = Number(argv[++i])
      if (Number.isFinite(v) && v > 0) limit = v
    } else if (a.startsWith('--limit=')) {
      const v = Number(a.slice('--limit='.length))
      if (Number.isFinite(v) && v > 0) limit = v
    } else if (a === '--slugs') {
      const raw = argv[++i]
      if (raw) slugs = raw.split(',').map((s) => s.trim()).filter(Boolean)
    } else if (a.startsWith('--slugs=')) {
      const raw = a.slice('--slugs='.length)
      slugs = raw.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return { limit, dryRun, slugs }
}

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: TipTapNode[]
  text?: string
}

interface RewriteCounter {
  paragraphTricolons: number
  /** Tricolons matched inside a text node but skipped because they look
   *  like a content list (multi-word items / proper-noun lists / known
   *  ingredients). Worth a manual review. */
  contentDeferred: number
  /** Tricolons present at paragraph level but no single text node
   *  contained them (they span marks). Hard to auto-rewrite safely. */
  spannedMarksDeferred: number
  rewritten: number
}

function flattenInline(node: TipTapNode): string {
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.content)) return ''
  return node.content.map(flattenInline).join('')
}

/**
 * Walk a TipTap node and rewrite plain text nodes whose text contains the
 * tricolon pattern. Mutates the doc in place.
 *
 * Three cases:
 *   1. Paragraph's flattened text doesn't match — leave alone.
 *   2. Paragraph's flattened text matches AND a single plain text node
 *      inside it contains the match — rewrite that text node.
 *   3. Paragraph's flattened text matches but the match spans multiple
 *      text nodes (i.e. crosses marks) — defer. Log for a manual pass.
 */
function rewriteParagraph(paragraph: TipTapNode, counter: RewriteCounter): boolean {
  const flat = flattenInline(paragraph)
  const flatMatches = flat.match(TRICOLON_RE) ?? []
  if (flatMatches.length === 0) return false
  counter.paragraphTricolons += flatMatches.length

  // Walk text nodes — rewrite each plain text node whose text contains
  // tricolons. Track the count of rewrites that LANDED at the text-node
  // level. Anything in the flat paragraph not reached at the text-node
  // level (because the tricolon spans marks) is reported as a separate
  // deferral.
  let nodeRewriteCount = 0
  let nodeContentDeferred = 0

  function walk(n: TipTapNode): void {
    if (typeof n.text === 'string') {
      const r = rewriteText(n.text)
      nodeContentDeferred += r.deferred
      if (r.rewritten > 0) {
        n.text = r.next
        nodeRewriteCount += r.rewritten
        counter.rewritten += r.rewritten
      }
      return
    }
    if (Array.isArray(n.content)) {
      for (const c of n.content) walk(c)
    }
  }
  walk(paragraph)

  // Tricolons present in the flat paragraph but not detected inside any
  // single text node — they span marks. Add to a separate counter so the
  // hand-off can list them as manual-pass candidates.
  const spanned = flatMatches.length - (nodeRewriteCount + nodeContentDeferred)
  if (spanned > 0) counter.spannedMarksDeferred += spanned
  counter.contentDeferred += nodeContentDeferred
  return nodeRewriteCount > 0
}

/**
 * Recursively walk every paragraph-bearing block in the body. A paragraph-
 * bearing block is one whose direct rendering surfaces prose: paragraph,
 * heading, blockquote, infoPanel body, pullQuote, productCard description,
 * varietiesPanel item description, troubleshooter cause/fix.
 *
 * To keep this simple we also walk into containers (bulletList, orderedList,
 * listItem) recursively.
 */
function rewriteBody(doc: TipTapNode, counter: RewriteCounter): boolean {
  let changed = false

  function walkContainer(n: TipTapNode): void {
    if (!n || typeof n !== 'object') return
    const t = n.type ?? ''
    if (t === 'paragraph' || t === 'heading' || t === 'blockquote') {
      if (rewriteParagraph(n, counter)) changed = true
      return
    }
    if (t === 'pullQuote') {
      const a = n.attrs as Record<string, unknown> | undefined
      if (a && typeof a.quote === 'string') {
        const r = rewriteText(a.quote)
        counter.paragraphTricolons += r.rewritten + r.deferred
        counter.contentDeferred += r.deferred
        if (r.rewritten > 0) {
          a.quote = r.next
          counter.rewritten += r.rewritten
          changed = true
        }
      }
      return
    }
    if (t === 'infoPanel') {
      const a = n.attrs as Record<string, unknown> | undefined
      if (a) {
        for (const key of ['title', 'body']) {
          if (typeof a[key] === 'string') {
            const r = rewriteText(a[key] as string)
            counter.paragraphTricolons += r.rewritten + r.deferred
            counter.contentDeferred += r.deferred
            if (r.rewritten > 0) {
              a[key] = r.next
              counter.rewritten += r.rewritten
              changed = true
            }
          }
        }
      }
      return
    }
    if (t === 'varietiesPanel' || t === 'troubleshooter') {
      const a = n.attrs as Record<string, unknown> | undefined
      if (a) {
        for (const key of ['intro']) {
          if (typeof a[key] === 'string') {
            const r = rewriteText(a[key] as string)
            counter.paragraphTricolons += r.rewritten + r.deferred
            counter.contentDeferred += r.deferred
            if (r.rewritten > 0) {
              a[key] = r.next
              counter.rewritten += r.rewritten
              changed = true
            }
          }
        }
        const items = Array.isArray(a.items) ? (a.items as Record<string, unknown>[]) : []
        const itemKeys = t === 'varietiesPanel' ? ['description'] : ['cause', 'fix']
        for (const it of items) {
          for (const key of itemKeys) {
            if (typeof it[key] === 'string') {
              const r = rewriteText(it[key] as string)
              counter.paragraphTricolons += r.rewritten + r.deferred
              counter.contentDeferred += r.deferred
              if (r.rewritten > 0) {
                it[key] = r.next
                counter.rewritten += r.rewritten
                changed = true
              }
            }
          }
        }
      }
      return
    }
    if (t === 'productCard') {
      const a = n.attrs as Record<string, unknown> | undefined
      if (a && typeof a.description === 'string') {
        const r = rewriteText(a.description)
        counter.paragraphTricolons += r.rewritten + r.deferred
        counter.contentDeferred += r.deferred
        if (r.rewritten > 0) {
          a.description = r.next
          counter.rewritten += r.rewritten
          changed = true
        }
      }
      return
    }
    if (Array.isArray(n.content)) {
      for (const c of n.content) walkContainer(c)
    }
  }

  if (Array.isArray(doc.content)) {
    for (const block of doc.content) walkContainer(block)
  }
  return changed
}

interface PerTutorialResult {
  slug: string
  paragraphTricolons: number
  rewritten: number
  contentDeferred: number
  spannedMarksDeferred: number
  updated: boolean
}

async function main(): Promise<void> {
  const flags = parseCliFlags(process.argv.slice(2))
  console.log(`fixup-tricolons: dryRun=${flags.dryRun}, limit=${flags.limit ?? 'none'}, slugs=${flags.slugs ? flags.slugs.length : 'all'}`)

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const where: Prisma.TutorialWhereInput = { status: 'PUBLISHED' }
  if (flags.slugs && flags.slugs.length > 0) where.slug = { in: flags.slugs }

  const rows = await prisma.tutorial.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      body: true,
      status: true,
    },
    orderBy: { slug: 'asc' },
  })

  const total = flags.limit ? Math.min(flags.limit, rows.length) : rows.length
  console.log(`fixup-tricolons: scanning ${total} PUBLISHED tutorials.`)

  const results: PerTutorialResult[] = []
  let totalRewritten = 0
  let totalDeferred = 0
  let updatedCount = 0
  let scannedWithMatches = 0

  for (let i = 0; i < total; i++) {
    const t = rows[i]!
    const body = JSON.parse(JSON.stringify(t.body)) as TipTapNode
    const counter: RewriteCounter = {
      paragraphTricolons: 0,
      contentDeferred: 0,
      spannedMarksDeferred: 0,
      rewritten: 0,
    }
    const changed = rewriteBody(body, counter)

    if (counter.paragraphTricolons === 0) {
      continue
    }
    scannedWithMatches += 1

    totalRewritten += counter.rewritten
    totalDeferred += counter.contentDeferred + counter.spannedMarksDeferred

    results.push({
      slug: t.slug,
      paragraphTricolons: counter.paragraphTricolons,
      rewritten: counter.rewritten,
      contentDeferred: counter.contentDeferred,
      spannedMarksDeferred: counter.spannedMarksDeferred,
      updated: changed && !flags.dryRun,
    })

    if (!changed) {
      if (counter.paragraphTricolons > 0) {
        console.log(`  ${t.slug}: ${counter.paragraphTricolons} tricolons all deferred (content=${counter.contentDeferred}, spanned=${counter.spannedMarksDeferred})`)
      }
      continue
    }
    if (flags.dryRun) {
      console.log(`  ${t.slug}: ${counter.paragraphTricolons} tricolons (would rewrite ${counter.rewritten}, defer content=${counter.contentDeferred} spanned=${counter.spannedMarksDeferred})`)
      continue
    }

    await prisma.$transaction(async (tx) => {
      await tx.tutorialVersion.create({
        data: {
          tutorialId: t.id,
          title: t.title,
          subtitle: t.subtitle,
          excerpt: t.excerpt,
          body: t.body as Prisma.InputJsonValue,
          status: t.status,
          authorId: author.id,
          changeNote: `fixup-tricolons: rewrote ${counter.rewritten} of ${counter.paragraphTricolons} flagged`,
        },
      })
      await tx.tutorial.update({
        where: { id: t.id },
        data: { body: body as Prisma.InputJsonValue },
      })
    })

    updatedCount += 1
    console.log(`  ${t.slug}: rewrote ${counter.rewritten}/${counter.paragraphTricolons} (deferred content=${counter.contentDeferred} spanned=${counter.spannedMarksDeferred})`)

    if (updatedCount % 50 === 0) {
      const file = resolve(__dirname, '..', '..', '..', 'docs', 'tricolon-fixup-progress.json')
      writeFileSync(
        file,
        JSON.stringify({ totalRewritten, totalDeferred, updatedCount, scannedWithMatches, results }, null, 2),
        'utf8',
      )
    }
  }

  const file = resolve(__dirname, '..', '..', '..', 'docs', 'tricolon-fixup-progress.json')
  writeFileSync(
    file,
    JSON.stringify({ totalRewritten, totalDeferred, updatedCount, scannedWithMatches, results }, null, 2),
    'utf8',
  )

  if (!flags.dryRun && updatedCount > 0) {
    await prisma.auditLog.create({
      data: {
        actorId: author.id,
        action: 'tutorial.fixup-tricolons',
        resource: 'tutorials',
        metadata: {
          runDate: new Date().toISOString().slice(0, 10),
          scanned: total,
          scannedWithMatches,
          updatedCount,
          totalRewritten,
          totalDeferred,
        } as Prisma.InputJsonValue,
      },
    })
  }

  console.log(`\nDONE`)
  console.log(`  tutorials scanned: ${total}`)
  console.log(`  tutorials with tricolons: ${scannedWithMatches}`)
  console.log(`  tutorials updated: ${updatedCount}`)
  console.log(`  tricolons rewritten: ${totalRewritten}`)
  console.log(`  tricolons deferred (content / spanned): ${totalDeferred}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
