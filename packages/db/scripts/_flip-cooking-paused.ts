import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  await prisma.category.update({
    where: { id: 'cmp1gjrmd0000xkv4ac12gorm' },
    data: { pipelineStatus: 'PAUSED' },
  })
  console.log('Cooking flipped to PAUSED')
}

main().catch(e => { console.error(e); process.exit(1) })
