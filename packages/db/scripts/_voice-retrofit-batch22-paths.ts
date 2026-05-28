import { runVoiceCheck, extractProseChunks, fleschKincaidGrade } from './voice-check-lib.js'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch22')

const slug = process.argv[2]
const data = JSON.parse(readFileSync(resolve(dir, slug + '.json'), 'utf8'))
const r = runVoiceCheck(data)
for (const e of r.errors) console.log(e.kind, '@', e.path, ':', e.message.slice(0, 100))
console.log('---chunks---')
const chunks = extractProseChunks(data.body)
for (const c of chunks) {
  const g = fleschKincaidGrade(c.text)
  console.log(c.path.padEnd(50), 'g=' + (g === null ? 'n/a' : g.toFixed(1)).padEnd(7), c.text.slice(0, 120))
}
