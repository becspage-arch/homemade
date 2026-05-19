/**
 * Print sample PUBLISHED mindset entries for the rebalance hand-off:
 * up to 3 each from previously-zero categories (GRIEF, FORGIVENESS, JOY)
 * and up to 2 from the magic-genre shape (folk-magical entries that
 * existed before the rebalance: bay-leaf burn, cinnamon at the
 * threshold, bless-and-pay).
 *
 * Outputs slug + title + first body paragraph so Rebecca can sample
 * tone and shape without opening every row.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

function firstParagraphFromBody(body: unknown): string {
  // TipTap doc — walk content[] for the first paragraph node and join its text children.
  if (!body || typeof body !== 'object') return ''
  const doc = body as { content?: Array<{ type?: string; content?: Array<{ text?: string }> }> }
  if (!Array.isArray(doc.content)) return ''
  for (const node of doc.content) {
    if (node?.type === 'paragraph' && Array.isArray(node.content)) {
      const text = node.content
        .map((c) => c?.text ?? '')
        .filter(Boolean)
        .join('')
      if (text.trim()) return text.trim()
    }
  }
  return ''
}

async function main() {
  const { prisma, TutorialStatus } = await import('../src/index.js')

  const cat = await prisma.category.findUnique({ where: { slug: 'mindset' } })
  if (!cat) {
    console.error('mindset category missing')
    process.exit(1)
  }

  console.log('Mindset rebalance — sample PUBLISHED entries (pre-rebalance content)')
  console.log('====================================================================\n')

  const buckets: { label: string; targets: string[]; want: number }[] = [
    { label: 'GRIEF (previously 4 PUBLISHED)', targets: ['GRIEF'], want: 3 },
    { label: 'FORGIVENESS (previously 17 PUBLISHED)', targets: ['FORGIVENESS'], want: 3 },
    { label: 'JOY (previously 17 PUBLISHED)', targets: ['JOY'], want: 3 },
  ]

  for (const b of buckets) {
    console.log(`\n--- ${b.label} ---\n`)
    const rows = await prisma.tutorial.findMany({
      where: {
        categoryId: cat.id,
        status: TutorialStatus.PUBLISHED,
        practiceTargets: { hasSome: b.targets as any },
      },
      select: { slug: true, title: true, body: true, practiceType: true, mood: true },
      take: b.want,
      orderBy: { publishedAt: 'desc' },
    })
    if (rows.length === 0) {
      console.log('  (no PUBLISHED rows yet — gap will land via the rebalanced autopilot)')
      continue
    }
    for (const r of rows) {
      const para = firstParagraphFromBody(r.body)
      console.log(`  Slug:  ${r.slug}`)
      console.log(`  Title: ${r.title}`)
      console.log(`  Type:  ${r.practiceType ?? '(none)'}`)
      console.log(`  Mood:  ${(r.mood ?? []).join(', ') || '(empty)'}`)
      console.log(`  First paragraph: ${para.slice(0, 320)}${para.length > 320 ? '…' : ''}`)
      console.log('')
    }
  }

  console.log('\n--- Folk-magical / manifesting genre (pre-existing, fits Section 17 shape) ---\n')
  // Hand-picked slug list — these are the existing PUBLISHED entries that
  // already fit the Section 17 deposit-coin shape. None are tagged with
  // the new mood values yet (the rebalance is when the autopilot starts
  // auto-populating); pre-rebalance authoring didn't have the mood field
  // surfaced for Mindset.
  const magicSlugs = ['bay-leaf-burn', 'cinnamon-at-the-threshold']
  const magicRows = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: TutorialStatus.PUBLISHED, slug: { in: magicSlugs } },
    select: { slug: true, title: true, body: true, practiceType: true, mood: true },
  })
  for (const r of magicRows) {
    const para = firstParagraphFromBody(r.body)
    console.log(`  Slug:  ${r.slug}`)
    console.log(`  Title: ${r.title}`)
    console.log(`  Type:  ${r.practiceType ?? '(none)'}`)
    console.log(`  Mood:  ${(r.mood ?? []).join(', ') || '(empty — pre-rebalance row)'}`)
    console.log(`  First paragraph: ${para.slice(0, 320)}${para.length > 320 ? '…' : ''}`)
    console.log('')
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
