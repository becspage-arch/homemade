import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

const slugsToCheck = [
  'alfajores', 'frangipane-raspberry-tart', 'blueberry-pie-american',
  'blinis-russian', 'almond-croissants'
]

async function main() {
  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: slugsToCheck }, categoryId: 'cmp6k8pfp0000rgv4kpfgse4e' },
    select: { slug: true }
  })
  const existingSlugs = new Set(existing.map(t => t.slug))
  console.log('EXISTING:', JSON.stringify(existing.map(t => t.slug)))
  console.log('AVAILABLE:', JSON.stringify(slugsToCheck.filter(s => !existingSlugs.has(s))))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
