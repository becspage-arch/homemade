import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'herbal-medicine' },
    select: { id: true, subCategories: { select: { slug: true, name: true }, orderBy: { slug: 'asc' } } }
  })
  console.log(JSON.stringify(cat, null, 2))
}
main().catch(e => { console.error(e); process.exit(1) })
