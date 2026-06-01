import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: TipTapNode[]
  text?: string
}
function txt(n: TipTapNode | null | undefined): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(txt).join('')
  return ''
}

async function main() {
  const t = await prisma.tutorial.findUnique({
    where: { slug: 'pregnancy-and-herbal-medicine' },
    select: { id: true, body: true },
  })
  if (!t) throw new Error('not found')
  const body = t.body as { type?: string; content?: TipTapNode[] }
  if (!Array.isArray(body.content)) throw new Error('no content')
  // walk paragraphs and strip "treats" in any body text
  function walk(n: TipTapNode): TipTapNode {
    const out: TipTapNode = { ...n }
    if (typeof n.text === 'string') {
      // Replace "treats" with "is used for" / "is taken for" depending on context.
      out.text = n.text.replace(/\btreats\b/g, 'is taken for').replace(/\bTreats\b/g, 'Is taken for')
    }
    if (Array.isArray(n.content)) out.content = n.content.map(walk)
    return out
  }
  const newBody = { ...body, content: body.content.map(walk) }
  const fixed = JSON.stringify(newBody)
  if (fixed.includes('treats')) {
    console.log('still contains "treats" — not in body text leaves; nothing changed.')
  }
  await prisma.tutorial.update({
    where: { id: t.id },
    data: { body: newBody, voiceRetrofittedAt: new Date() },
  })
  // show paragraph[1] after
  const para1 = newBody.content[1]
  console.log(`paragraph[1] AFTER: ${txt(para1 as TipTapNode).slice(0, 400)}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
