import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const DIR = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch6')

function plainParagraph(text: string) {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}

function setParagraph(slug: string, index: number, text: string) {
  const file = resolve(DIR, `${slug}.json`)
  const data = JSON.parse(readFileSync(file, 'utf8'))
  data.body.content[index] = plainParagraph(text)
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`[OK] ${slug} paragraph[${index}]`)
}

// "psychology" is the long-word offender; drop it.
setParagraph(
  'the-art-of-the-no',
  10,
  'Draws on public-domain work on saying no and the pull of social pressure. Framing is from homemade.education.',
)

// "treats" is a medical-claim watchword; swap for "frames".
setParagraph(
  'the-body-as-home-visualisation',
  10,
  'Written for homemade.education. The body-as-home frame draws on somatic therapy. It frames the body as a place to live in, not a thing to inspect. The walkthrough as a curiosity practice is original to homemade.education.',
)
