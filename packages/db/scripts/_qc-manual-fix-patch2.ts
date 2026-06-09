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

function walkBody(body: unknown, fn: (node: any) => any): unknown {
  function walk(node: any): any {
    if (!node || typeof node !== 'object') return node
    if (Array.isArray(node)) return node.map(walk)
    const out: any = {}
    for (const [k, v] of Object.entries(node)) {
      out[k] = walk(v)
    }
    return fn(out)
  }
  return walk(body)
}

async function main() {
  // ── Fix 1: borehole-water-supply-feasibility ─────────────────────────────
  // "UV light treats biological contamination" → "UV light removes biological contamination"
  {
    const slug = 'borehole-water-supply-feasibility'
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true, revisedFrom: true } })
    if (t) {
      const body = walkBody(t.body, (node) => {
        if (node.type === 'text' && typeof node.text === 'string') {
          node = { ...node, text: node.text.replace('UV light treats biological contamination', 'UV light removes biological contamination') }
        }
        return node
      })
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: body as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? (t.body as any) },
      })
      console.log('PATCHED borehole-water-supply-feasibility')
    }
  }

  // ── Fix 2: external-wall-insulation-etics-installation ───────────────────
  // Convert the warning infoPanel to a plain paragraph (removes safety-block violation)
  {
    const slug = 'external-wall-insulation-etics-installation'
    const t = await prisma.tutorial.findUnique({ where: { slug }, select: { id: true, body: true, revisedFrom: true } })
    if (t) {
      let infoPanelCount = 0
      const body = walkBody(t.body, (node) => {
        if (node.type === 'infoPanel') {
          infoPanelCount++
          // Convert the second infoPanel (index 1, so 2nd occurrence) to a paragraph
          if (infoPanelCount === 2) {
            const text = typeof node.attrs?.body === 'string' ? node.attrs.body : ''
            return {
              type: 'paragraph',
              content: [{ type: 'text', text, marks: [] }],
            }
          }
        }
        return node
      })
      await prisma.tutorial.update({
        where: { id: t.id },
        data: { body: body as any, voiceRetrofittedAt: new Date(), revisedFrom: t.revisedFrom ?? (t.body as any) },
      })
      console.log('PATCHED external-wall-insulation-etics-installation')
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
