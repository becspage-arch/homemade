import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch24')

const TARGETS = [
  { file: 'beef-stroganoff.json', blockIdx: 11, itemIdx: 3 },
  { file: 'wet-felted-wall-hanging.json', blockIdx: 13, itemIdx: 2 },
]

for (const t of TARGETS) {
  const data = JSON.parse(readFileSync(resolve(dir, t.file), 'utf8'))
  const block = data.body.content[t.blockIdx]
  const item = block.attrs.items[t.itemIdx]
  console.log('===', t.file, 'block[', t.blockIdx, '] item[', t.itemIdx, ']===')
  console.log('TYPE:', block.type)
  console.log('symptom:', item.symptom)
  console.log('cause:', item.cause)
  console.log('fix:', item.fix)
  console.log()
}
