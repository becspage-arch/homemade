import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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
  await prisma.category.update({
    where: { id: 'cmp6k8pfp0000rgv4kpfgse4e' },
    data: { pipelineStatus: 'PAUSED' },
  })
  console.log('PAUSED: baking pipelineStatus → PAUSED (hard chain cap reached at batch 015)')
  await prisma.$disconnect()
}
main()
