import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
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

function txt(n: unknown): string {
  const node = n as { text?: string; content?: unknown[] }
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(txt).join('')
  return ''
}

async function main() {
  const REPO_ROOT = resolve(__dirname, '../../..')
  const slugs = ['chamomile-profile', 'marshmallow-root-cold-infusion', 'calendula-compress-for-minor-wounds']
  for (const slug of slugs) {
    const beforePath = resolve(REPO_ROOT, `docs/qc-fixes-2026-06-01/${slug}.before.json`)
    if (!existsSync(beforePath)) { console.log(`MISSING ${beforePath}`); continue }
    const before = JSON.parse(readFileSync(beforePath, 'utf8'))
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { body: true } })
    const beforeBody = before.preFix.body as { content?: Array<{ type?: string; content?: unknown[] }> }
    const afterBody = t?.body as { content?: Array<{ type?: string; content?: unknown[] }> } | null
    const beforeP0 = beforeBody?.content?.find((n) => n.type === 'paragraph')
    const afterP0 = afterBody?.content?.find((n) => n.type === 'paragraph')
    console.log(`=== ${slug} ===`)
    console.log(`BEFORE: ${txt(beforeP0).slice(0, 400)}`)
    console.log(`AFTER : ${txt(afterP0).slice(0, 400)}`)
    console.log('')
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
