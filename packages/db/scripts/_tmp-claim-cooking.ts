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

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const now = new Date()
  const result = await prisma.category.updateMany({
    where: { slug: 'cooking' },
    data: { lastAutopilotRunAt: now },
  })
  console.log(JSON.stringify({ claimed: result.count, at: now.toISOString() }))
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('failed:', err)
  process.exit(1)
})
