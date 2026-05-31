/**
 * Final 3 manual rewrites for this fire (hitting the 20-rewrite cap).
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

interface Rewrite {
  slug: string
  oldPrefix: string
  newText: string
}

const REWRITES: Rewrite[] = [
  // roast-pork-belly: grade 11.2 last paragraph
  {
    slug: 'roast-pork-belly',
    oldPrefix: 'Roast pork belly became popular in British restaurants in the 1990s',
    newText: 'Roast pork belly became a favourite in UK restaurants in the 1990s as chefs found what Asian and Italian cooks always knew: the belly is a better roasting cut than the loin. It gives more flavour, more fat, and better crackling than any other pork joint.',
  },
  // introducing-a-new-pig-to-an-existing-group: grade 11.8 — Understanding mixing aggression
  {
    slug: 'introducing-a-new-pig-to-an-existing-group',
    oldPrefix: 'When pigs meet an unfamiliar pig,',
    newText: 'When pigs meet a new pig, some fighting is unavoidable. It is normal and settles on its own with enough space, usually within 2 to 4 hours as the pecking order is worked out. Make sure the weaker pig can escape and recover; only step in if biting draws blood.',
  },
  // rabbit-snuffles-management: grade 11.1 — Move any rabbit
  {
    slug: 'rabbit-snuffles-management',
    oldPrefix: 'Move any rabbit showing nasal discharge, sneezing, or laboured breathing',
    newText: 'Move any rabbit with a runny nose, sneezing, or trouble breathing into a separate space straight away. This cuts the spread and lets you care for the animal one-on-one. Keep the space clean, well-aired, and warm; cold and draughts make respiratory disease worse.',
  },
]

type TNode = {
  type?: string
  text?: string
  content?: TNode[]
  marks?: unknown[]
  attrs?: Record<string, unknown>
}

function extractText(node: TNode): string {
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(extractText).join('')
  return ''
}

function walkAndReplace(node: TNode, oldPrefix: string, newText: string, replaced: { count: number }): TNode {
  if (!node || typeof node !== 'object') return node
  if (node.type === 'paragraph') {
    const fullText = extractText(node)
    if (fullText.startsWith(oldPrefix)) {
      replaced.count++
      return { type: 'paragraph', content: [{ type: 'text', text: newText, marks: [] }] }
    }
    return node
  }
  if (Array.isArray(node.content)) {
    let anyChanged = false
    const newContent = node.content.map((child) => {
      const r = walkAndReplace(child as TNode, oldPrefix, newText, replaced)
      if (r !== child) anyChanged = true
      return r
    })
    if (anyChanged) return { ...node, content: newContent }
  }
  return node
}

async function main() {
  const bySlug = new Map<string, Rewrite[]>()
  for (const r of REWRITES) {
    if (!bySlug.has(r.slug)) bySlug.set(r.slug, [])
    bySlug.get(r.slug)!.push(r)
  }

  for (const [slug, rewrites] of bySlug.entries()) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, body: true, revisedFrom: true },
    })
    if (!tutorial) { console.log(`SKIP ${slug} — not found`); continue }

    let body = tutorial.body as TNode
    let totalReplaced = 0

    for (const { oldPrefix, newText } of rewrites) {
      const replaced = { count: 0 }
      body = walkAndReplace(body, oldPrefix, newText, replaced) as TNode
      if (replaced.count === 0) {
        console.log(`  MISS ${slug}: "${oldPrefix.slice(0, 50)}"`)
      } else {
        totalReplaced += replaced.count
        console.log(`  HIT  ${slug}: "${oldPrefix.slice(0, 50)}"`)
      }
    }

    if (totalReplaced > 0) {
      await prisma.tutorial.update({
        where: { id: tutorial.id },
        data: { body: body as object, voiceRetrofittedAt: new Date(), revisedFrom: tutorial.revisedFrom ?? tutorial.body },
      })
      console.log(`SAVED ${slug}`)
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
