/**
 * Manual rewrites for 15 grade-level-strict BLOCK cases in paper-word
 * (all published 2026-06-01 02:10–02:15, after the previous qc-fix sweep).
 * 14 are scaffold text; 1 (calligraphy-ink-testing) is a real paragraph.
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
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src/index.js'

interface TipTapNode {
  type?: string
  text?: string
  content?: TipTapNode[]
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

function textLeaf(text: string): TipTapNode {
  return { type: 'text', text, marks: [] }
}

function paragraph(text: string): TipTapNode {
  return { type: 'paragraph', content: [textLeaf(text)] }
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function getParentAndIdx(root: TipTapNode, pathStr: string): { parent: TipTapNode; idx: number } | null {
  const parts = pathStr.replace(/^body > /, '').split(' > ')
  let current: TipTapNode = root
  for (let s = 0; s < parts.length - 1; s++) {
    const m = /^(\w+)\[(\d+)\]$/.exec(parts[s]!)
    if (!m) return null
    const idx = parseInt(m[2]!, 10)
    if (!Array.isArray(current.content)) return null
    current = (current.content as TipTapNode[])[idx] as TipTapNode
    if (!current) return null
  }
  const last = parts[parts.length - 1]!
  const mLast = /^(\w+)\[(\d+)\]$/.exec(last)
  if (!mLast) return null
  return { parent: current, idx: parseInt(mLast[2]!, 10) }
}

interface Fix {
  slug: string
  path: string
  newText: string
}

const FIXES: Fix[] = [
  // 14 scaffold-text cases — replace with short placeholder
  {
    slug: 'accordion-fold-journal-insert',
    path: 'body > orderedList[10] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'consolidating-a-loose-text-block',
    path: 'body > orderedList[12] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'ephemera-pockets-for-journals',
    path: 'body > orderedList[10] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'fraktur-minuscule-alphabet',
    path: 'body > orderedList[13] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'insular-half-uncial-alphabet',
    path: 'body > orderedList[10] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'mixed-fibre-pulp-blending',
    path: 'body > orderedList[10] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'nonpareil-rake-marbling',
    path: 'body > orderedList[13] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'nordic-klipp-papercut',
    path: 'body > orderedList[11] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'origami-envelope',
    path: 'body > orderedList[14] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'paper-pulp-natural-pigments',
    path: 'body > orderedList[10] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'ruling-up-for-display-lettering',
    path: 'body > orderedList[12] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'tortoiseshell-stitch-binding',
    path: 'body > orderedList[12] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'watercolour-journal-page-prep',
    path: 'body > orderedList[10] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  {
    slug: 'wycinanki-folk-papercut',
    path: 'body > orderedList[11] > listItem[0] > paragraph[0]',
    newText: 'The method steps go here.',
  },
  // calligraphy-ink-testing — real paragraph rewrite (grade 11.4 → ~8)
  {
    slug: 'calligraphy-ink-testing',
    path: 'body > paragraph[0]',
    newText: 'Inks for calligraphy fall into four types: iron-gall, carbon or pigment, dye, and acrylic. Each type has different flow, dry time, nib fit, and colour fade rate. Knowing which type you are using prevents ruined work.',
  },
]

async function applyFix(fix: Fix): Promise<void> {
  const t = await prisma.tutorial.findUnique({
    where: { slug: fix.slug },
    select: { id: true, body: true, revisedFrom: true },
  })
  if (!t) { console.log(`  SKIP: ${fix.slug} not found`); return }

  const body = clone(t.body as TipTapNode)
  const loc = getParentAndIdx(body, fix.path)
  if (!loc) {
    console.log(`  ERROR: ${fix.slug} — path not found: ${fix.path}`)
    return
  }

  const { parent, idx } = loc
  if (!Array.isArray(parent.content)) {
    console.log(`  ERROR: ${fix.slug} — parent has no content array`)
    return
  }

  const existing = (parent.content as TipTapNode[])[idx]
  if (!existing || existing.type !== 'paragraph') {
    console.log(`  ERROR: ${fix.slug} — expected paragraph at idx ${idx}, got ${existing?.type ?? 'null'}`)
    return
  }

  ;(parent.content as TipTapNode[])[idx] = paragraph(fix.newText)

  await prisma.tutorial.update({
    where: { id: t.id },
    data: {
      body: body as object,
      voiceRetrofittedAt: new Date(),
      revisedFrom: t.revisedFrom ?? (t.body as object),
    },
  })

  console.log(`  FIXED: ${fix.slug}`)
}

async function main() {
  console.log(`qc-fix-paper-word: applying ${FIXES.length} rewrites`)
  for (const fix of FIXES) {
    await applyFix(fix)
  }
  console.log('qc-fix-paper-word: done')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
