/** Merge W#/parts/*.json (worker partials) into W#/verify.json. Flag: --wave LABEL */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const RUN = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/epic-knuth-d4fb45/.photo-qc-run'
function arg(n: string) { const a = process.argv.find(x => x.startsWith(`--${n}=`)); if (a) return a.slice(n.length + 3); const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined }
const wave = arg('wave'); if (!wave) throw new Error('--wave required')
const partsDir = resolve(RUN, wave, 'parts')
const all: any[] = []
if (existsSync(partsDir)) for (const f of readdirSync(partsDir)) if (f.endsWith('.json')) {
  try { const a = JSON.parse(readFileSync(resolve(partsDir, f), 'utf8')); if (Array.isArray(a)) all.push(...a) } catch (e) { console.log(`bad part ${f}`) }
}
const seen = new Set<string>(); const merged = all.filter(v => { if (!v.genFile || seen.has(v.genFile)) return false; seen.add(v.genFile); return true })
writeFileSync(resolve(RUN, wave, 'verify.json'), JSON.stringify(merged, null, 2))
const pass = merged.filter(v => (v.verdict || '').toUpperCase() === 'PASS').length
console.log(`[${wave}] merged ${merged.length} verdicts: PASS=${pass} FAIL=${merged.length - pass}`)
