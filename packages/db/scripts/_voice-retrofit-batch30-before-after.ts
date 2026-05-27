/**
 * Extract before/after first-paragraph text for 3 batch 30 tutorials across
 * content types (cooking recipe, baking recipe, mindset practice).
 * "Before" comes from revisedFrom; "after" from current body.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

const SAMPLES = [
  { slug: 'brown-stew-chicken', label: 'Cooking RECIPE', paragraphIdx: 0 },
  { slug: 'coffee-walnut-layer-cake', label: 'Baking RECIPE', paragraphIdx: 0 },
  { slug: 'i-release-money-shame-i-release-it-now', label: 'Mindset PRACTICE', paragraphIdx: 0 },
]

function paragraphText(body: any, paragraphIdx: number): string {
  const paras = (body?.content ?? []).filter((b: any) => b.type === 'paragraph')
  const p = paras[paragraphIdx]
  if (!p) return ''
  return (p.content ?? []).map((c: any) => c.text ?? '').join('')
}

async function main() {
  for (const s of SAMPLES) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug: s.slug },
      select: { body: true, revisedFrom: true },
    })
    const before = paragraphText(t?.revisedFrom, s.paragraphIdx)
    const after = paragraphText(t?.body, s.paragraphIdx)
    console.log(`=== ${s.label}: ${s.slug} (paragraph[${s.paragraphIdx}])`)
    console.log(`BEFORE: ${before}`)
    console.log(`AFTER:  ${after}`)
    console.log('')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
