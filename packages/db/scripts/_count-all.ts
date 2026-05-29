import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main() {
  const count = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  console.log('Total PUBLISHED:', count)
  await prisma.$disconnect()
}

main().catch(console.error)
