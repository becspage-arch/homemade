import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const slug = process.argv[2] ?? 'natural-home'
  const updated = await prisma.category.update({
    where: { slug },
    data: { lastAutopilotRunAt: new Date() },
    select: { id: true, slug: true, lastAutopilotRunAt: true },
  })
  console.log(`Claimed slot for ${updated.slug} at ${updated.lastAutopilotRunAt?.toISOString()}`)
  await prisma.$disconnect()
}
main()
