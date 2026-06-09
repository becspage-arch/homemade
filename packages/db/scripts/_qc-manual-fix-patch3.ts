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
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src/index.js'

async function main() {
  const slug = 'external-wall-insulation-etics-installation'
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true, revisedFrom: true } })
  if (!t) { console.log('NOT FOUND'); return }

  const body = t.body as any
  if (!Array.isArray(body?.content)) { console.log('unexpected body'); return }

  // Find body.content[1] which is the infoPanel with tone=warning
  const node = body.content[1]
  if (!node || node.type !== 'infoPanel') {
    console.log('body.content[1] is not an infoPanel:', node?.type)
    return
  }

  const bodyText = typeof node.attrs?.body === 'string' ? node.attrs.body : ''
  console.log('Converting infoPanel at [1], body:', bodyText.slice(0, 80))

  // Replace the infoPanel with a plain paragraph
  const newContent = [...body.content]
  newContent[1] = {
    type: 'paragraph',
    content: [{ type: 'text', text: bodyText, marks: [] }],
  }

  const newBody = { ...body, content: newContent }
  await prisma.tutorial.update({
    where: { id: t.id },
    data: {
      body: newBody as any,
      voiceRetrofittedAt: new Date(),
      revisedFrom: t.revisedFrom ?? (t.body as any),
    },
  })

  console.log('PATCHED: infoPanel[1] converted to paragraph')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
