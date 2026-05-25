/**
 * Restore the deleted "Course length" guidance and "When NOT to use this
 * salve" section into calendula-salve-for-skin.json, rewritten in voice
 * (no specific medical thresholds, plain English, no academic citations).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const path = resolve(worktreeRoot, 'docs/voice-pilot-2026-05-25/calendula-salve-for-skin.json')

const data: any = JSON.parse(readFileSync(path, 'utf8'))

// 1. Append a "Course length" paragraph after the existing two "How to use"
//    paragraphs (positions 14, 15, 16 — heading + 2 paragraphs).
//    The new paragraph goes at index 17 (after the second "How to use" paragraph),
//    shifting Storage and everything after.

const courseLengthParagraph = {
  type: 'paragraph',
  content: [
    {
      type: 'text',
      text:
        "If the patch hasn't settled after about four weeks, the salve isn't the right tool for it. See a herbalist or your GP. For children, start with a small dab on intact skin and patch-test first because of the daisy-family link. For babies and toddlers, ask a herbalist who works with children before using.",
    },
  ],
}

// 2. Insert a "When NOT to use this salve" section (H2 + 3 paragraphs)
//    BEFORE the existing "Storage" H2.

const whenNotToUseHeading = {
  type: 'heading',
  attrs: { level: 2 },
  content: [{ type: 'text', text: 'When not to use this salve' }],
}

const whenNotPara1 = {
  type: 'paragraph',
  content: [
    {
      type: 'text',
      text:
        'Skip the salve and see a doctor for deep cuts, cuts that will not stop bleeding, cuts on the face or hand, animal or human bites, or any wound that looks infected (spreading redness, warmth, pus, or fever). Seek medical care if needed. For a burn, run cool water over it and seek medical care if needed.',
    },
  ],
}

const whenNotPara2 = {
  type: 'paragraph',
  content: [
    {
      type: 'text',
      text:
        "For eczema, see your GP first. Calendula salve can sit alongside their treatment plan but it does not replace one. For eczema in babies, talk to a GP before trying any home preparation.",
    },
  ],
}

const whenNotPara3 = {
  type: 'paragraph',
  content: [
    {
      type: 'text',
      text:
        "Skip the salve entirely if you have a known daisy-family allergy. If a patch test on the forearm produces redness, itch, or swelling, do not use the salve. Reactions are not common but they happen, and they are easier to catch in a patch test than in a full application.",
    },
  ],
}

// Find the "Storage" H2 index in the current body.content array.
const idx = data.body.content.findIndex(
  (n: any) =>
    n.type === 'heading' &&
    n.attrs?.level === 2 &&
    (n.content || [])[0]?.text === 'Storage',
)
if (idx < 0) throw new Error('Could not find Storage H2 in calendula body')

// Find the last paragraph of "How to use" section. We'll insert Course length
// paragraph BEFORE the Storage heading (which is also before When-not section).
// Order: ... How-to-use paras ... [Course length] [When-not H2 + 3 paras] [Storage H2 ...]

const before = data.body.content.slice(0, idx)
const after = data.body.content.slice(idx)

data.body.content = [
  ...before,
  courseLengthParagraph,
  whenNotToUseHeading,
  whenNotPara1,
  whenNotPara2,
  whenNotPara3,
  ...after,
]

writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
console.log(`Restored calendula sections; body now has ${data.body.content.length} top-level blocks`)
