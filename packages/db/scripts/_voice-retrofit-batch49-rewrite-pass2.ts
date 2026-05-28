/**
 * Pass 2 for batch6: shorten the 7 attribution / history paragraphs that
 * still tripped grade-level after the first pass. Substance is preserved
 * via sourceNotes in each file.
 */
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

setParagraph(
  'lasagne-al-forno',
  13,
  "Lasagne al forno is the baked pasta of Emilia-Romagna, and of Bologna in particular. It is made there with green egg pasta coloured with spinach (sfoglia verde), a meaty ragu, and béchamel. It has been made this way for at least three centuries. Marcella Hazan's version in Essentials of Classic Italian Cooking became the reference for cooks writing in English from the 1990s on. Outside Italy, lasagne is now one of the most widely cooked Italian dishes. Countless home versions exist, of varying faithfulness to the Bologna original.",
)

setParagraph(
  'lasagne-alla-bolognese',
  31,
  "Lasagne alla bolognese is the defining dish of Emilia-Romagna. The region runs between Modena and Bologna. It gave the world prosciutto di Parma, parmigiano-reggiano, and the bolognese ragù that sits at the centre of this lasagne. The earliest written record is in Pellegrino Artusi's nineteenth-century cookbook (see the Sources note below). His meat sauce for macaroni is the base for what later became the official ratio.",
)

setParagraph(
  'the-advisor-who-changes-everything-visualisation',
  8,
  'Written for homemade.education. Forward-image work is common in therapy and coaching. No single lineage is claimed.',
)

setParagraph(
  'the-art-of-the-no',
  10,
  'Draws on public-domain work in social psychology. Framing is from homemade.education.',
)

setParagraph(
  'the-body-as-home-visualisation',
  10,
  'Written for homemade.education. The body-as-home frame draws on somatic therapy. It treats the body as a place to live in, not a thing to inspect. The walkthrough as a curiosity practice is original to homemade.education.',
)

setParagraph(
  'the-complicated-grief-of-inheritance',
  11,
  'Written for homemade.education. Draws on public-domain writing on grief and money. See the Sources note below.',
)

setParagraph(
  'the-cultural-pairing-of-money-sex-and-good-women-reading',
  12,
  'Written for homemade.education. Draws on feminist writing on women and money. See the Sources note below for the named authors.',
)
