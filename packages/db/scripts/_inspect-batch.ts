import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const file = process.argv[2] || 'navarin-dagneau.json'
const data = JSON.parse(
  readFileSync(resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch11', file), 'utf8'),
)
const max = Number(process.argv[3] ?? '8')
;(data.body?.content ?? []).slice(0, max).forEach((n: any, i: number) => {
  const summary = JSON.stringify(n).slice(0, 250)
  console.log(`${i} ${n.type}: ${summary}`)
})
