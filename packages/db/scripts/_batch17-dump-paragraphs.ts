import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch17')

const files = process.argv.slice(2)
for (const slug of files) {
  console.log(`===== ${slug} =====`)
  const raw = readFileSync(resolve(batchDir, `${slug}.json`), 'utf8')
  const d: any = JSON.parse(raw)
  for (let i = 0; i < d.body.content.length; i++) {
    const n = d.body.content[i]
    let txt = ''
    if (n.type === 'paragraph') {
      txt = (n.content ?? []).map((c: any) => c.text ?? '').join('')
    } else if (n.type === 'heading') {
      txt = 'HEADING(L' + (n.attrs?.level ?? '') + '): ' + (n.content ?? []).map((c: any) => c.text ?? '').join('')
    } else {
      txt = `[${n.type}]`
    }
    console.log(`[${i}] ${txt.slice(0, 1500)}`)
  }
  console.log()
}
