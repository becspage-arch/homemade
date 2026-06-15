import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'crochet' },
    select: {
      id: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
    }
  })
  console.log('techniqueSlugs:', JSON.stringify(cat?.techniqueSlugs?.slice(0, 30)))
  console.log(`Total techniqueSlugs: ${cat?.techniqueSlugs?.length}`)
  console.log('criticalTechniques:', JSON.stringify(cat?.criticalTechniques))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
