import mammoth from 'mammoth'
import { writeFileSync, mkdirSync } from 'node:fs'

const OUT_DIR = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/keen-kare-ac9dea/docs/personal-recipes-briefs'
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
