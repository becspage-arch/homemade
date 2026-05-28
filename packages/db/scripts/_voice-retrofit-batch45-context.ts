import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch2')

function flatten(n: any): string {
  if (!n) return ''
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.content)) return n.content.map(flatten).join('')
  return ''
}

const TAPPING_SLUGS = [
  'tapping-for-turning-50',
  'tapping-for-we-cant-talk-anymore',
  'tapping-for-we-never-get-ahead',
  'tapping-for-what-if-it-runs-out',
  'tapping-for-who-am-i-to-have-so-much',
  'tapping-for-working-mum-guilt',
  'tapping-to-anchor-trust-in-multi-million-investments',
  'tapping-to-attract-the-right-advisors-and-deals',
  'tapping-to-build-generational-wealth',
  'tapping-to-celebrate-daily-freedom-and-joy',
  'irish-stew',
]

for (const slug of TAPPING_SLUGS) {
  const d = JSON.parse(readFileSync(resolve(batchDir, `${slug}.json`), 'utf8'))
  console.log(`\n===== ${slug} =====`)
  console.log(`sourceNotes: ${(d.sourceNotes ?? '').slice(0, 250)}`)
  console.log(`body.content length: ${d.body.content.length}`)
  d.body.content.forEach((n: any, i: number) => {
    const text = flatten(n).slice(0, 90).replace(/\n/g, ' ')
    console.log(`  [${i}] ${n.type}${n.type === 'heading' ? `(lvl=${n.attrs?.level})` : ''}: ${text}`)
  })
}
