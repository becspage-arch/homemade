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
  if (node.type === 'infoPanel' && node.attrs?.body && typeof node.attrs.body === 'object') {
    if (walkAndReplaceText(node.attrs.body, oldText, newText)) changed = true
  }
  return changed
}

async function fixSlug(slug: string, fixes: Array<[string, string]>) {
  const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
  if (!t) { console.log(slug + ': NOT FOUND'); return }
  const body = JSON.parse(JSON.stringify(t.body as any))
  let anyChanged = false
  for (const [oldText, newText] of fixes) {
    const changed = walkAndReplaceText(body, oldText, newText)
    if (!changed) console.log(slug + ': text not found: ' + oldText.slice(0, 50))
    if (changed) anyChanged = true
  }
  if (!anyChanged) { console.log(slug + ': no changes'); return }
  await prisma.tutorial.update({ where: { id: t.id }, data: { body, voiceRetrofittedAt: new Date() } })
  console.log(slug + ': UPDATED')
}

async function main() {
  // neri-formation-aid-preparation — paragraph[11] grade 11.5
  // High syllables in "concentration" (4), "reliably" (4), "inclusions" (3), "Embedded" (3)
  await fixSlug('neri-formation-aid-preparation', [
    [
      'Once you can control the neri concentration reliably, more techniques become possible. Embedded inclusions, watermarks, and two-colour layered sheets all rely on the slow, steady drainage that neri provides.',
      'Once you can control the neri level, more techniques open up. Watermarks, inclusions, and two-colour sheets all need the slow, even drainage that neri gives.'
    ],
    [
      'It produces the even, strong, long-fibre sheets that define traditional waterleaf washi.',
      'It produces the even, strong, long-fibre sheets that define traditional washi paper.'
    ],
  ])

  // hand-lettered-headers — paragraph[13] grade 11.1 (just over threshold)
  // Remove "consistently" (4 syllables) and "visually" (4 syllables)
  await fixSlug('hand-lettered-headers', [
    [
      'the pen angle must be held consistently throughout',
      'the pen angle must stay the same throughout'
    ],
    [
      'produces the most visually varied results',
      'gives the most varied results'
    ],
  ])

  // uncial-hand — paragraph[5] grade 11.9
  // Split long sentence with "respectively" (4 syllables)
  await fixSlug('uncial-hand', [
    [
      'Uncial is written between a baseline and a waistline with ascenders and descenders extending 2 nib widths above and below respectively.',
      'Uncial is written between a baseline and a waistline. Ascenders go 2 nib widths above the waistline; descenders go 2 nib widths below the baseline.'
    ],
    [
      'The line spacing should be generous: allow at least 3 body heights between baselines to prevent ascenders and descenders from colliding.',
      'The line spacing should be wide: allow at least 3 body heights between baselines so ascenders and descenders do not clash.'
    ],
  ])

  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
