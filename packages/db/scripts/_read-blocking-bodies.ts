import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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

function nodeText(node: any): string {
  if (node.type === 'text') return node.text || ''
  return (node.content || []).map(nodeText).join('')
}

async function main() {
  const slug = 'maintaining-copperplate-slant'
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
  const content = (t?.body as any)?.content || []
  console.log('\n=== ' + slug + ' full body ===')
  content.forEach((node: any, i: number) => {
    const label = node.type + '[' + i + ']'
    if (node.type === 'paragraph' || node.type === 'heading') {
      const text = nodeText(node)
      if (text.length > 3) console.log(label + ': ' + text.substring(0, 400))
    } else if (node.type === 'orderedList' || node.type === 'bulletList') {
      ;(node.content || []).forEach((li: any, j: number) => {
        const liText = (li.content || []).map(nodeText).join('')
        if (liText.length > 3) console.log(label + '[' + j + ']: ' + liText.substring(0, 300))
      })
    } else {
      const text = nodeText(node)
      if (text.length > 3) console.log(label + ': ' + text.substring(0, 200))
    }
  })
}

main().finally(() => prisma.$disconnect().catch(() => {}))
