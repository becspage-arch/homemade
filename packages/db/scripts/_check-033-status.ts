import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'
import { readdirSync } from 'fs'
import { join } from 'path'

async function main() {
  const DIR = join(process.cwd(), '../../docs/baking-bulk-033-briefs')
  const slugs = readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))

  const entries = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true, qcBlockReason: true }
  })

  const byStatus: Record<string, string[]> = {}
  for (const e of entries) {
    if (!byStatus[e.status]) byStatus[e.status] = []
    byStatus[e.status].push(e.slug)
  }

  for (const [status, slugList] of Object.entries(byStatus)) {
    console.log(`\n${status} (${slugList.length}):`)
    for (const s of slugList) console.log('  ' + s)
  }

  const notFound = slugs.filter(s => !entries.find(e => e.slug === s))
  if (notFound.length) {
    console.log(`\nNOT IN DB (${notFound.length}):`)
    for (const s of notFound) console.log('  ' + s)
  }

  // Show draft reasons
  const drafts = entries.filter(e => e.status === 'DRAFT' && e.qcBlockReason)
  if (drafts.length) {
    console.log(`\nDRAFT block reasons:`)
    for (const d of drafts) {
      const reason = JSON.stringify(d.qcBlockReason).slice(0, 120)
      console.log(`  ${d.slug}: ${reason}`)
    }
  }

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
