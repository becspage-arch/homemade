/**
 * Grade-level manual fixes for dyeing-with-dahlia-petals and foundational-spacing.
 */

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

function walkAndReplaceText(node: any, oldText: string, newText: string): boolean {
  let changed = false
  if (node.type === 'text' && typeof node.text === 'string') {
    if (node.text.includes(oldText)) {
      node.text = node.text.replace(oldText, newText)
      changed = true
    }
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      if (walkAndReplaceText(child, oldText, newText)) changed = true
    }
  }
  return changed
}

async function fixDyeingDahlia() {
  const slug = 'dyeing-with-dahlia-petals'
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body as any))
  // bulletList is at position 7 in body.content, listItem[0], paragraph[0]
  const changed = walkAndReplaceText(body,
    'depending on dahlia variety and petal freshness',
    'based on dahlia type and petal age'
  )
  if (!changed) { console.log(slug + ': text not found'); return }
  await prisma.tutorial.update({ where: { id: t.id }, data: { body, voiceRetrofittedAt: new Date() } })
  console.log(slug + ': UPDATED')
}

async function fixFoundationalSpacing() {
  const slug = 'foundational-spacing'
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body as any))
  const content = body.content ?? []
  const n21 = content[21]
  if (!n21 || n21.type !== 'infoPanel') { console.log(slug + ': no infoPanel at [21]'); return }
  const old = "Certain letters have projecting arms or diagonal strokes that reduce the apparent space on one or both sides. 'f', 'r', 't', 'v', 'w', and 'y' all need to be placed slightly closer to adjacent letters than the three-group rules suggest, because their projections already occupy visual space above the x-height or in the lateral margins. Adjust by eye; no formula covers every combination."
  const newBody = "Some letters have arms or diagonal strokes that take up space on one or both sides. These include 'f', 'r', 't', 'v', 'w', and 'y'. Place them slightly closer to nearby letters than the three-group rules say. Their strokes already fill the gap. Adjust by eye; no formula covers every pair."
  if (n21.attrs.body !== old) { console.log(slug + ': infoPanel body text does not match'); console.log('actual:', n21.attrs.body?.slice(0, 100)); return }
  n21.attrs.body = newBody
  await prisma.tutorial.update({ where: { id: t.id }, data: { body, voiceRetrofittedAt: new Date() } })
  console.log(slug + ': UPDATED')
}

async function main() {
  await fixDyeingDahlia()
  await fixFoundationalSpacing()
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
