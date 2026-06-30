/** Upload local contact-sheet PNGs to R2 and print public URLs. Run from MAIN checkout.
 *    tsx scripts/xs-upload-sheet.ts <file.png> [file2.png ...] */
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch { /* env from shell */ }
}
loadEnvFile('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')
import { r2Upload } from '@homemade/db'

async function main(): Promise<void> {
  const files = process.argv.slice(2)
  for (const f of files) {
    const buf = readFileSync(f)
    const { publicUrl } = await r2Upload(buf, 'image/png', { prefix: 'xs-review', filename: basename(f) })
    console.log(`${basename(f)}  ->  ${publicUrl}`)
  }
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
