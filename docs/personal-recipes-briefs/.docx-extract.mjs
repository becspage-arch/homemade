// Extract the two docx collections to plain text. mammoth.extractRawText is
// good enough for the parse step. Re-run idempotent — just rewrites the .txt
// outputs.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// mammoth lives in packages/db/node_modules — resolve via absolute file:// URL
// so this script runs from any cwd.
const __dirname0 = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname0, '..', '..')
const mammoth = (await import(pathToFileURL(resolve(REPO_ROOT, 'packages/db/node_modules/mammoth/lib/index.js')).href)).default

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = __dirname
mkdirSync(OUT_DIR, { recursive: true })

const files = [
  { path: 'C:/Users/Rebecca/Downloads/Recipes to Print.docx', out: `${OUT_DIR}/_source-print.txt` },
  { path: 'C:/Users/Rebecca/Downloads/RECIPES (MASTER).docx', out: `${OUT_DIR}/_source-master.txt` },
]

for (const f of files) {
  console.log(`Extracting ${f.path}...`)
  try {
    const result = await mammoth.extractRawText({ path: f.path })
    writeFileSync(f.out, result.value)
    console.log(`  -> ${f.out} (${result.value.length} chars, ${result.messages.length} messages)`)
  } catch (err) {
    console.error(`  ERROR: ${err.message}`)
  }
}
