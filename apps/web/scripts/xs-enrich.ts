/** Join an approved gem list [{slug,name,sub,subName}] with BRIEFS + SRC_SAT to emit
 *  approved-full.json (adds w,h,colours,style,srcSat,batch) for the publish step.
 *    npx tsx scripts/xs-enrich.ts <approved.json> <out-full.json>  (run from worktree) */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BRIEFS, SRC_SAT } from './xs-volume-gen'

interface In { slug: string; name: string; sub: string; subName: string; difficulty?: string; description?: string }

function main(): void {
  const [inFile, outFile] = process.argv.slice(2)
  if (!inFile || !outFile) throw new Error('usage: xs-enrich.ts <approved.json> <out-full.json>')
  const list: In[] = JSON.parse(readFileSync(resolve(inFile), 'utf8'))
  const out = []
  const missing: string[] = []
  for (const a of list) {
    const b = BRIEFS.find((x) => x.slug === a.slug)
    if (!b) { missing.push(a.slug); continue }
    out.push({ ...a, w: b.w, h: b.h, colours: b.colours, style: b.style, srcSat: SRC_SAT[b.style], batch: b.batch })
  }
  writeFileSync(resolve(outFile), JSON.stringify(out, null, 2))
  console.log(`enriched ${out.length}/${list.length}${missing.length ? ` · MISSING: ${missing.join(', ')}` : ''}`)
}
main()
