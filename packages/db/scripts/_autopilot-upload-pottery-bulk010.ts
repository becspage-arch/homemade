// Autopilot upload loop: voice-check then upload for pottery-ceramics-bulk-010.
// Grade-level errors are auto-fixed with sentence splitting (up to 3 attempts).
// Other errors drop the file.
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { spawnSync } from 'child_process'

const briefsDir = join(process.cwd(), '../../docs/pottery-ceramics-bulk-010-briefs')
const repoRoot = join(process.cwd(), '../..')
const files = readdirSync(briefsDir).sort()

interface VcError { kind: string; message: string; path?: string }
interface VcResult { errors: VcError[]; warnings: VcError[] }
interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  marks?: unknown[]
  content?: TipTapNode[]
  text?: string
}
interface Brief { body?: TipTapNode; [key: string]: unknown }

function runVoiceCheck(filePath: string): VcResult | null {
  const r = spawnSync('pnpm', ['--filter', '@homemade/db', 'exec', 'tsx', 'scripts/voice-check.ts', filePath, '--json'], {
    cwd: repoRoot, encoding: 'utf8', shell: true,
  })
  const raw = (r.stdout ?? '') + (r.stderr ?? '')
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end < start) return null
  try { return JSON.parse(raw.slice(start, end + 1)) } catch { return null }
}

function runUpload(filePath: string): { ok: boolean; out: string } {
  const r = spawnSync('pnpm', ['--filter', '@homemade/db', 'exec', 'tsx', 'scripts/upload-tutorial.ts', filePath, '--status', 'PUBLISHED'], {
    cwd: repoRoot, encoding: 'utf8', shell: true,
  })
  return { ok: r.status === 0, out: (r.stdout ?? '') + (r.stderr ?? '') }
}

function extractParaText(node: TipTapNode): string {
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(extractParaText).join('')
}

function simplifyParagraphText(text: string): string {
  let out = text.replace(/, where /g, '. ')
  out = out.replace(/, which /g, '. ')
  out = out.replace(/  +/g, ' ').trim()
  return out
}

function simplifyParagraphNode(node: TipTapNode): TipTapNode {
  if (node.type === 'paragraph' && node.content) {
    const rawText = extractParaText(node)
    const simplified = simplifyParagraphText(rawText)
    if (simplified === rawText) return node
    return { type: 'paragraph', content: [{ type: 'text', text: simplified }] }
  }
  return node
}

function fixGradeLevelPath(brief: Brief, path: string): boolean {
  const match = path.match(/paragraph\[(\d+)\]/)
  if (!match || !brief.body) return false
  const paraIdx = parseInt(match[1], 10)
  let paraCount = 0
  const content = brief.body.content ?? []
  for (let i = 0; i < content.length; i++) {
    if (content[i].type === 'paragraph') {
      if (paraCount === paraIdx) {
        const before = extractParaText(content[i])
        const fixed = simplifyParagraphNode(content[i])
        const after = extractParaText(fixed)
        if (before === after) return false
        content[i] = fixed
        console.log(`    Simplified para[${paraIdx}]: "${before.slice(0, 80)}..." → "${after.slice(0, 80)}..."`)
        return true
      }
      paraCount++
    }
  }
  return false
}

async function main() {
  let published = 0
  const dropped: string[] = []
  const results: Record<string, string> = {}

  for (const file of files) {
    const filePath = join(briefsDir, file)
    let uploadDone = false

    for (let attempt = 1; attempt <= 3; attempt++) {
      const vc = runVoiceCheck(filePath)
      if (!vc) {
        console.log(`  [${file}] attempt ${attempt}: no voice-check output`)
        continue
      }

      if (vc.errors.length === 0) {
        const { ok, out } = runUpload(filePath)
        if (ok) {
          published++
          results[file] = 'PUBLISHED'
          uploadDone = true
          console.log(`  [OK] ${file}`)
        } else {
          const snippet = out.slice(-300).split('\n').filter(l => l.includes('Error') || l.includes('error')).slice(-1)[0] ?? 'upload error'
          console.log(`  [UPLOAD-FAIL] ${file} attempt ${attempt}: ${snippet}`)
          if (attempt === 3) { dropped.push(file); results[file] = 'UPLOAD_FAILED' }
        }
        if (uploadDone) break
        continue
      }

      const gradeErrors = vc.errors.filter(e => e.kind === 'grade-level')
      const otherErrors = vc.errors.filter(e => e.kind !== 'grade-level')

      if (otherErrors.length > 0) {
        console.log(`  [SKIP] ${file}: unfixable errors: ${otherErrors.map(e => e.kind + ':' + e.message.slice(0, 60)).join('; ')}`)
        dropped.push(file)
        results[file] = 'VOICE_FAIL_UNFIXABLE'
        break
      }

      if (gradeErrors.length > 0 && attempt < 3) {
        console.log(`  [${file}] attempt ${attempt}: ${gradeErrors.length} grade-level error(s) — fixing`)
        const brief: Brief = JSON.parse(readFileSync(filePath, 'utf8'))
        let anyFixed = false
        for (const err of gradeErrors) {
          if (err.path && fixGradeLevelPath(brief, err.path)) anyFixed = true
        }
        if (anyFixed) {
          writeFileSync(filePath, JSON.stringify(brief, null, 2) + '\n')
        } else {
          console.log(`    [WARN] grade-level: couldn't auto-simplify — retrying`)
        }
        continue
      }

      if (gradeErrors.length > 0 && attempt === 3) {
        console.log(`  [DROP] ${file}: grade-level still failing after 3 attempts`)
        dropped.push(file)
        results[file] = 'GRADE_LEVEL_FAIL'
        break
      }
    }

    if (!uploadDone && !dropped.includes(file)) {
      dropped.push(file)
      results[file] = 'UNKNOWN_FAIL'
    }
  }

  console.log('\n=== UPLOAD SUMMARY ===')
  console.log(`Published: ${published} / ${files.length}`)
  console.log(`Dropped: ${dropped.length} — ${dropped.join(', ')}`)
  writeFileSync('../../docs/pottery-ceramics-bulk010-upload-log.json', JSON.stringify(results, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
