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
  // pairs: slug:paragraphIndex
  const targets = process.argv.slice(2)
  for (const target of targets) {
    const [slug, idxStr] = target.split(':')
    const idx = parseInt(idxStr, 10)
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, type: true, body: true, revisedFrom: true },
    })
    if (!t) continue
    const oldBody: any = t.revisedFrom
    const newBody: any = t.body
    const oldPara = oldBody?.content?.[idx]
    const newPara = newBody?.content?.[idx]
    console.log(`\n=== ${slug} (${t.type}) paragraph[${idx}]`)
    console.log('  OLD:')
    console.log('    ' + flat(oldPara).slice(0, 700))
    console.log('  NEW:')
    console.log('    ' + flat(newPara).slice(0, 700))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
