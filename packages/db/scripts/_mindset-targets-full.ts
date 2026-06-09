import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

async function main() {
  const targets = ['MONEY', 'BODY', 'RELATIONSHIPS', 'SLEEP', 'ANXIETY', 'CONFIDENCE', 'ABUNDANCE', 'STUCK', 'GRIEF', 'FEAR', 'MOTHERHOOD', 'PURPOSE', 'TIME', 'ENERGY', 'JOY', 'SPIRITUALITY', 'HEALTH', 'SELF_WORTH', 'FORGIVENESS', 'AGEING', 'HOME'] as const

  for (const t of targets) {
    const count = await prisma.tutorial.count({
      where: {
        status: 'PUBLISHED',
        practiceTargets: { has: t as any },
        category: { slug: 'mindset' }
      }
    })
    console.log(`${t}: ${count}`)
  }
  await prisma.$disconnect()
}
main()
