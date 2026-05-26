import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch21')
const slugs = process.argv.slice(2)

function walk(node: any, path: string, out: { path: string; text: string }[]): void {
  if (!node || typeof node !== 'object') return
  const t = node.type ?? ''
  if (t === 'paragraph' || t === 'heading' || t === 'blockquote') {
    let text = ''
    const collect = (n: any) => {
      if (n.text) text += n.text
      if (Array.isArray(n.content)) n.content.forEach(collect)
    }
    collect(node)
    if (text) out.push({ path, text })
    return
  }
  if (Array.isArray(node.content)) {
    node.content.forEach((c: any, i: number) => walk(c, `${path} > ${c.type ?? 'unk'}[${i}]`, out))
  }
}

for (const slug of slugs) {
  const raw = readFileSync(resolve(dir, slug + '.json'), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  console.log('\n=== ' + slug + ' ===')
  for (const e of report.errors) {
    console.log('  ' + e.kind + ': ' + e.message + ' @ ' + e.path)
    if (e.snippet) console.log('    snippet: ' + e.snippet)
  }
  // Walk the body and collect paragraph chunks with their full text
  const chunks: { path: string; text: string }[] = []
  if (data.body && Array.isArray(data.body.content)) {
    data.body.content.forEach((n: any, i: number) => walk(n, `body > ${n.type ?? 'unk'}[${i}]`, chunks))
  }
  for (const c of chunks) {
    const grade = fleschKincaidGrade(c.text)
    if (grade !== null && grade > 12) {
      console.log(`  GRADE ${grade.toFixed(1)} @ ${c.path}`)
      console.log(`  > ${c.text}`)
      console.log()
    }
  }
}
