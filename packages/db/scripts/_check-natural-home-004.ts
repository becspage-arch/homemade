import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const dir004 = join(__dirname, '../../../docs/natural-home-bulk-004-briefs')
  const dir005 = join(__dirname, '../../../docs/natural-home-bulk-005-briefs')

  for (const [label, dir] of [['004', dir004], ['005', dir005]] as const) {
    const files = readdirSync(dir).filter(f => f.endsWith('.json'))
    const slugs = files.map(f => {
      const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
      return data.slug as string
    })
    const existing = await prisma.tutorial.findMany({
      where: { slug: { in: slugs }, status: 'PUBLISHED' },
      select: { slug: true }
    })
    const existingSet = new Set(existing.map(t => t.slug))
    const unpublished = slugs.filter(s => !existingSet.has(s))
    console.log(`\nbulk-${label}: ${slugs.length} briefs, ${existing.length} already PUBLISHED, ${unpublished.length} NOT PUBLISHED`)
    if (unpublished.length > 0) {
      for (const s of unpublished) {
        console.log(`  UNPUBLISHED: ${s}`)
      }
    }
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
