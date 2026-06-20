import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
import { readdirSync } from 'fs'
import { join } from 'path'

async function main() {
  const DIR = join(process.cwd(), '../../docs/baking-bulk-033-briefs')
  const slugs = readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))

  const drafts = await prisma.tutorial.findMany({
    where: { slug: { in: slugs }, status: 'DRAFT' },
    select: { slug: true, qcBlockReason: true }
  })

  for (const d of drafts) {
    if (d.qcBlockReason) {
      const r = d.qcBlockReason as Record<string, unknown>
      const issues = Object.entries(r)
        .filter(([, v]) => v === true || (Array.isArray(v) && v.length > 0))
        .map(([k, v]) => `${k}${Array.isArray(v) ? ': '+v.join(',') : ''}`)
      console.log(`${d.slug}: ${issues.join(' | ')}`)
    } else {
      console.log(`${d.slug}: (no block reason recorded)`)
    }
  }

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
