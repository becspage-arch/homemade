/**
 * Inspect full body structure around prose-prep-steps violations.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

async function main(): Promise<void> {
  // Look at folio-wallet-construction — paragraph[10] context
  const t = await prisma.tutorial.findUnique({ where: { slug: 'folio-wallet-construction' }, select: { body: true } })
  if (!t) { console.log('NOT FOUND'); return }
  const body = t.body as any
  // Show nodes 8-12
  const content = body.content || []
  for (let i = 8; i <= Math.min(12, content.length - 1); i++) {
    console.log('body.content[' + i + ']:')
    console.log(JSON.stringify(content[i], null, 2))
    console.log()
  }

  // Also show an existing orderedList to understand structure
  const listNode = content.find((n: any) => n.type === 'orderedList')
  if (listNode) {
    console.log('=== Sample orderedList structure ===')
    console.log(JSON.stringify(listNode, null, 2).slice(0, 1000))
  }

  await prisma.$disconnect()
}

main().catch((err) => { console.error(err); process.exit(1) })
