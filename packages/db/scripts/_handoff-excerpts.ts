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

import { prisma } from '../src'

function flat(n: any): string {
  if (typeof n?.text === 'string') return n.text
  if (Array.isArray(n?.content)) return n.content.map(flat).join('')
  return ''
}

async function main() {
  const slugs = process.argv.slice(2)
  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, type: true, body: true, revisedFrom: true },
    })
    if (!t) continue
    const oldBody: any = t.revisedFrom
    const newBody: any = t.body
    const oldFirst = oldBody?.content?.find((n: any) => n.type === 'paragraph')
    const newFirst = newBody?.content?.find((n: any) => n.type === 'paragraph')
    console.log(`\n=== ${slug} (${t.type})`)
    console.log('  OLD:')
    console.log('    ' + flat(oldFirst).slice(0, 500))
    console.log('  NEW:')
    console.log('    ' + flat(newFirst).slice(0, 500))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
