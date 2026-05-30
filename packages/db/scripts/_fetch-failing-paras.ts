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

// Paths use ABSOLUTE content array index, e.g. paragraph[11] = body.content[11]
function getNodeByPath(body: any, pathStr: string): { node: any; isAttrBody: boolean; attrText?: string } {
  const parts = pathStr.split(' > ').filter(p => p !== 'body')
  let current = body
  
  for (let pi = 0; pi < parts.length; pi++) {
    const part = parts[pi]!
    const m = part.match(/^(\w+)\[(\d+)\]$/) || part.match(/^(\w+)$/)
    if (!m) return { node: null, isAttrBody: false }
    const nodeType = m[1]!
    const idx = m[2] !== undefined ? parseInt(m[2]) : 0
    
    // Special case: "body" as a leaf means attrs.body string
    if (nodeType === 'body' && pi === parts.length - 1) {
      return { node: current, isAttrBody: true, attrText: current?.attrs?.body }
    }
    
    const children = current?.content || []
    const child = children[idx]
    if (!child) return { node: null, isAttrBody: false }
    current = child
  }
  return { node: current, isAttrBody: false }
}

function extractText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  const children = node.content || []
  return children.map(extractText).join('')
}

const slugsToFetch = [
  'colloidal-oat-melt-pour-soap',
  'crater-glaze-surface-texture',
  'drip-emitter-maintenance',
  'dyeing-with-ivy-berries',
  'foundational-spacing',
  'home-battery-economy-7-charging',
  'managing-a-legacy-feed-in-tariff',
  'paper-clay-christmas-ornament-set',
  'paper-clay-fairy-door-miniature',
  'photo-mounting-options',
  'pinch-pot-cactus-planter-trio',
  'polymer-clay-faux-agate-pendant',
  'polymer-clay-faux-druzy-crystal-pendant',
  'polymer-clay-faux-labradorite-pendant',
  'pyrography-christmas-tree-ornaments',
  'replacing-a-double-socket-faceplate',
  'replacing-a-shower-pump',
  'rich-heel-balm',
  'rose-sachet',
  'solar-pv-dc-cable-sizing',
  'solar-pv-inverter-fault-diagnosis',
  'solid-brick-garage-internal-insulation',
  'routing-unwanted-homewares-to-charities',
]

const pathsMap: Record<string, string[]> = {
  'colloidal-oat-melt-pour-soap': ['body > paragraph[0]', 'body > paragraph[11]'],
  'crater-glaze-surface-texture': ['body > infoPanel[0] > paragraph[1]', 'body > bulletList[14] > listItem[0] > paragraph[0]', 'body > bulletList[14] > listItem[1] > paragraph[0]'],
  'drip-emitter-maintenance': ['body > orderedList[2] > listItem[1] > paragraph[0]'],
  'dyeing-with-ivy-berries': ['body > paragraph[17]'],
  'foundational-spacing': ['body > infoPanel[21] > body'],
  'home-battery-economy-7-charging': ['body > bulletList[11] > listItem[0] > paragraph[0]'],
  'managing-a-legacy-feed-in-tariff': ['body > bulletList[3] > listItem[0] > paragraph[0]', 'body > bulletList[3] > listItem[1] > paragraph[0]'],
  'paper-clay-christmas-ornament-set': ['body > bulletList[13] > listItem[1] > paragraph[0]'],
  'paper-clay-fairy-door-miniature': ['body > bulletList[13] > listItem[2] > paragraph[0]', 'body > bulletList[13] > listItem[3] > paragraph[0]'],
  'photo-mounting-options': ['body > paragraph[9]'],
  'pinch-pot-cactus-planter-trio': ['body > bulletList[13] > listItem[0] > paragraph[0]'],
  'polymer-clay-faux-agate-pendant': ['body > bulletList[17] > listItem[0] > paragraph[0]', 'body > bulletList[17] > listItem[2] > paragraph[0]'],
  'polymer-clay-faux-druzy-crystal-pendant': ['body > bulletList[13] > listItem[1] > paragraph[0]'],
  'polymer-clay-faux-labradorite-pendant': ['body > bulletList[13] > listItem[0] > paragraph[0]', 'body > bulletList[13] > listItem[2] > paragraph[0]'],
  'pyrography-christmas-tree-ornaments': ['body > bulletList[10] > listItem[0] > paragraph[0]'],
  'replacing-a-double-socket-faceplate': ['body > paragraph[0]'],
  'replacing-a-shower-pump': ['body > paragraph[0]'],
  'rich-heel-balm': ['body > paragraph[0]'],
  'rose-sachet': ['body > paragraph[0]'],
  'solar-pv-dc-cable-sizing': ['body > bulletList[8] > listItem[1] > paragraph[0]'],
  'solar-pv-inverter-fault-diagnosis': ['body > bulletList[2] > listItem[2] > paragraph[0]'],
  'solid-brick-garage-internal-insulation': ['body > infoPanel[1] > paragraph[0]'],
  'routing-unwanted-homewares-to-charities': ['body > bulletList[2] > listItem[4] > paragraph[0]'],
}

async function main() {
  for (const slug of slugsToFetch) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug },
      select: { slug: true, body: true }
    })
    if (!tutorial?.body) { console.log(`MISSING: ${slug}`); continue }
    const body = tutorial.body as any
    
    console.log(`\n=== ${slug} ===`)
    for (const p of pathsMap[slug] || []) {
      const { node, isAttrBody, attrText } = getNodeByPath(body, p)
      let text = ''
      if (isAttrBody) text = attrText || ''
      else text = extractText(node)
      console.log(`PATH: ${p}`)
      console.log(`TEXT: ${JSON.stringify(text)}`)
      console.log('---')
    }
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
