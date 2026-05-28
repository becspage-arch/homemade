/**
 * Dump the violating paragraphs in batch 2026-05-28-batch2 so the worker
 * can read each one and propose a surgical rewrite.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BATCH_ID = '2026-05-28-batch2'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

function flatten(n: any): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(flatten).join('')
  return ''
}

function getNode(d: any, path: (string | number)[]): any {
  let cur: any = d
  for (const seg of path) cur = cur?.[seg]
  return cur
}

interface Spot {
  slug: string
  description: string
  path: (string | number)[]
}

const SPOTS: Spot[] = [
  { slug: 'honey-roast-carrots-and-parsnips', description: 'paragraph[12]', path: ['body','content',12] },
  { slug: 'honey-soy-baked-drumsticks', description: 'orderedList[5] listItem[4] paragraph[0]', path: ['body','content',5,'content',4,'content',0] },
  { slug: 'hortobagyi-palacsinta', description: 'paragraph[15]', path: ['body','content',15] },
  { slug: 'hot-chocolate', description: 'paragraph[12]', path: ['body','content',12] },
  { slug: 'huevos-rancheros', description: 'paragraph[0]', path: ['body','content',0] },
  { slug: 'huevos-rancheros', description: 'paragraph[13]', path: ['body','content',13] },
  { slug: 'hummus-with-warm-pita', description: 'troubleshooter[9] item[1] fix', path: ['body','content',9,'attrs','items',1,'fix'] },
  { slug: 'hummus-with-warm-pita', description: 'paragraph[11]', path: ['body','content',11] },
  { slug: 'hummus', description: 'troubleshooter[11] item[1] fix', path: ['body','content',11,'attrs','items',1,'fix'] },
  { slug: 'hungarian-goulash', description: 'paragraph[7]', path: ['body','content',7] },
  { slug: 'insalata-di-rinforzo', description: 'paragraph[0]', path: ['body','content',0] },
  { slug: 'insalata-di-rinforzo', description: 'paragraph[11]', path: ['body','content',11] },
  { slug: 'irish-stew', description: 'paragraph[0]', path: ['body','content',0] },
  { slug: 'irish-stew', description: 'paragraph[12]', path: ['body','content',12] },
  { slug: 'tapping-for-turning-50', description: 'paragraph[11]', path: ['body','content',11] },
  { slug: 'tapping-for-we-cant-talk-anymore', description: 'paragraph[11]', path: ['body','content',11] },
  { slug: 'tapping-for-we-never-get-ahead', description: 'paragraph[11]', path: ['body','content',11] },
  { slug: 'tapping-for-what-if-it-runs-out', description: 'paragraph[13]', path: ['body','content',13] },
  { slug: 'tapping-for-who-am-i-to-have-so-much', description: 'paragraph[13]', path: ['body','content',13] },
  { slug: 'tapping-for-working-mum-guilt', description: 'paragraph[11]', path: ['body','content',11] },
  { slug: 'tapping-to-anchor-trust-in-multi-million-investments', description: 'paragraph[0]', path: ['body','content',0] },
  { slug: 'tapping-to-anchor-trust-in-multi-million-investments', description: 'bulletList[4] item[0] paragraph[0]', path: ['body','content',4,'content',0,'content',0] },
  { slug: 'tapping-to-attract-the-right-advisors-and-deals', description: 'paragraph[0]', path: ['body','content',0] },
  { slug: 'tapping-to-build-generational-wealth', description: 'bulletList[4] item[0] paragraph[0]', path: ['body','content',4,'content',0,'content',0] },
  { slug: 'tapping-to-celebrate-daily-freedom-and-joy', description: 'bulletList[4] item[2] paragraph[0]', path: ['body','content',4,'content',2,'content',0] },
]

const cache = new Map<string, any>()
for (const s of SPOTS) {
  if (!cache.has(s.slug)) {
    const p = resolve(batchDir, `${s.slug}.json`)
    cache.set(s.slug, JSON.parse(readFileSync(p, 'utf8')))
  }
  const d = cache.get(s.slug)
  const node = getNode(d, s.path)
  console.log(`\n===== ${s.slug} :: ${s.description} =====`)
  if (typeof node === 'string') {
    console.log(`(string node)`)
    console.log(node)
  } else if (node) {
    const text = flatten(node)
    console.log(`(node.type: ${node.type})`)
    console.log(text)
    // Also dump any inline marks like glossaryTooltip
    if (Array.isArray(node.content)) {
      const inlineSummaries = node.content.map((c: any, i: number) => {
        const marks = Array.isArray(c.marks) ? c.marks.map((m: any) => m.type).join(',') : ''
        return `  [${i}] type=${c.type} text="${(c.text ?? '').slice(0,40)}..." marks=${marks}`
      })
      if (inlineSummaries.length) console.log('inline:'); for (const s2 of inlineSummaries) console.log(s2)
    }
  } else {
    console.log('(no node)')
  }
}
