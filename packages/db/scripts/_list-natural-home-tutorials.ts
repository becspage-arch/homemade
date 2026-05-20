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
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  try {
    const tutorials = await prisma.tutorial.findMany({
      where: { category: { slug: 'natural-home' } },
      select: { slug: true, title: true, status: true, subCategory: { select: { slug: true } } },
      orderBy: { createdAt: 'asc' },
    })
    console.log('TUTORIALS:' + JSON.stringify(tutorials))
  } catch (e: any) {
    console.error('ERR:' + e.message)
    process.exit(1)
  }
}
main()
