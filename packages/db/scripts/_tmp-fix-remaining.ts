import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

const FIXES: Record<string, Array<{ old: string; newText: string }>> = {
  'composting-toilet-urine-diversion': [
    {
      old: 'Fit a urine-diverting toilet seat or unit that collects liquid into a sealed container.',
      newText: 'Fit a toilet seat or unit that separates liquid from solid waste. The liquid drains into a sealed collection container.',
    },
    {
      old: 'Dilute the liquid ten-to-one with water before use. Apply it to compost, tree bases, or lawns — not to leaf crops.',
      newText: 'Dilute the liquid ten-to-one with water before use. Apply it to compost, tree bases, or lawns. Do not use it on leaf crops.',
    },
  ],
  'digital-footprint-and-data-energy': [
    {
      old: 'Go to your cloud storage settings and turn off automatic high-resolution photo upload. Upload manually or at lower resolution instead.',
      newText: 'Go to your cloud storage settings. Turn off automatic photo upload, or switch it to a lower quality setting. Upload manually when you want to.',
    },
  ],
  'external-shutters-summer-overheating': [
    {
      old: 'Get quotes from two or three suppliers. Ask each for a g-value for the closed product — below 0.15 is good.',
      newText: 'Get quotes from two or three suppliers. Ask each for a g-value for the closed product. A g-value below 0.15 is good.',
    },
  ],
  'listed-building-insulation-options': [
    {
      old: 'Ask your local planning authority what works require listed building consent. Draught-proofing and secondary glazing usually do not. Internal wall insulation usually does.',
      newText: 'Ask your local planning authority which works need consent. Draught-proofing and secondary glazing usually do not. Internal wall insulation usually does.',
    },
    {
      old: 'For works that need consent: prepare a description of the materials and methods, a heritage impact statement, and evidence that the system is breathable and reversible.',
      newText: 'If consent is needed, write up the materials you plan to use, why the system will not harm the building, and how it can be removed if needed. Send this with your application.',
    },
  ],
}

function replace(node: any, fixes: Array<{ old: string; newText: string }>): any {
  if (node.type === 'text' && node.text) {
    for (const fix of fixes) {
      if (node.text === fix.old) {
        return { ...node, text: fix.newText }
      }
    }
  }
  if (node.content) return { ...node, content: node.content.map((c: any) => replace(c, fixes)) }
  return node
}

function getText(node: any): string {
  if (node.type === 'text') return node.text || ''
  if (node.content) return node.content.map(getText).join('')
  return ''
}

function replaceByParaStart(node: any, fixes: Array<{ old: string; newText: string }>): any {
  if (node.type === 'paragraph') {
    const text = getText(node)
    for (const fix of fixes) {
      const oldStart = fix.old.slice(0, 40)
      if (text.startsWith(oldStart)) {
        return { type: 'paragraph', content: [{ type: 'text', text: fix.newText, marks: [] }] }
      }
    }
  }
  if (node.content) return { ...node, content: node.content.map((c: any) => replaceByParaStart(c, fixes)) }
  return node
}

async function main() {
  const { prisma } = await import('../src/index.js')
  for (const [slug, fixes] of Object.entries(FIXES)) {
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true } })
    if (!t) { console.log('NOT FOUND: ' + slug); continue }
    const newBody = replaceByParaStart(t.body as any, fixes)
    await prisma.tutorial.update({
      where: { id: t.id },
      data: { body: newBody, voiceRetrofittedAt: new Date() }
    })
    console.log('UPDATED ' + slug)
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
