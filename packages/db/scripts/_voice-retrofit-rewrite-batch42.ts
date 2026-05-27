/**
 * Apply targeted rewrites to the 14 dirty body JSON files in batch42.
 *
 * Each rewrite is either:
 * - replace the entire text of a paragraph at a given index, OR
 * - delete a heading + the paragraph immediately after it (used to remove
 *   the "Where this practice comes from" attribution block that just
 *   duplicates sourceNotes prose).
 *
 * After applying, runs voice-check on each file and reports.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface ReplaceParagraph {
  kind: 'replace-paragraph'
  index: number
  newText: string
}

interface DeleteNodes {
  kind: 'delete-nodes'
  indices: number[]
}

interface ReplaceListItemParagraph {
  kind: 'replace-listitem-paragraph'
  listIndex: number
  itemIndex: number
  paraIndex: number
  newText: string
}

type Operation = ReplaceParagraph | DeleteNodes | ReplaceListItemParagraph

const REWRITES: Record<string, Operation[]> = {
  'game-pie': [
    {
      kind: 'replace-paragraph',
      index: 1,
      newText:
        'Game pie tastes best between October and February, when pheasant and venison come into season. Outside that window, farmed venison and frozen game work well too.',
    },
  ],
  'gammon-with-parsley-sauce': [
    {
      kind: 'replace-paragraph',
      index: 0,
      newText:
        "Modern gammon is milder and less salty than older cured joints, but soaking an unsmoked piece is still worth doing. The poaching liquid is well-flavoured and not as salty as the gammon. Using part of it in the parsley sauce gives the sauce more depth than milk alone.",
    },
    {
      kind: 'replace-paragraph',
      index: 10,
      newText:
        'Boiled gammon with parsley sauce is a traditional British weekday and Sunday dinner. It is especially common in the north of England and in Wales. The dish is often linked with school dinners, which has kept it out of fashion. But with good gammon and a properly made sauce, it is one of the better things on the British table.',
    },
  ],
  'garlic-naan': [
    {
      kind: 'replace-paragraph',
      index: 11,
      newText:
        "Garlic naan is the most ordered bread on the British Indian menu. It overtook plain naan as the default choice from the 1980s onwards. The garlic-butter finish adds a richness that works alongside spiced main-dish sauces. At home, heat is the main variable. A domestic hob cannot match a restaurant tandoor, but a cast-iron pan on its hottest setting gets close. The blistered, charred surface is what makes naan distinct from other flatbreads.",
    },
  ],
  'gigantes-plaki': [
    {
      kind: 'replace-paragraph',
      index: 12,
      newText:
        'Gigantes plaki appears on the Greek meze table with olives, bread, and dips. It also works as a main dish with a chunk of feta and a glass of retsina. This is classic taverna food, served at room temperature near the harbour at lunchtime. The name means baked giants. It refers to the large, flat white beans called gigantes. They have a creaminess when cooked low and long that smaller beans cannot match.',
    },
  ],
  'gigot-dagneau': [
    {
      // Remove the "Before you start" heading at index 0. The orientation
      // paragraph at index 1 becomes the lead, which matches the spec.
      kind: 'delete-nodes',
      indices: [0],
    },
  ],
  'glamorgan-sausages': [
    {
      kind: 'replace-paragraph',
      index: 10,
      newText:
        'Glamorgan sausages are a Welsh regional speciality. They are one of the older documented British vegetarian dishes, eaten in Wales long before vegetarianism became a dietary movement. They are excellent with a chutney, especially a tomato or onion one. They work as a starter or a main dish, served with good bread and a salad.',
    },
  ],
  'golubtsy-russian': [
    {
      kind: 'replace-paragraph',
      index: 14,
      newText:
        'Stuffed cabbage appears across a huge swathe of Central and Eastern Europe. The Polish gołąbki, Hungarian töltött káposzta, Ukrainian holubtsi, and Romanian sarmale are all distinct in filling and seasoning. They share the same basic form. The Russian golubtsy is braised in tomato sauce with a pork-and-beef mince filling. It is the version most known in English-speaking countries. At home in Russia, this is Sunday food: takes time, keeps well, and tastes better the next day.',
    },
  ],
  'pasteis-de-nata': [
    {
      kind: 'replace-paragraph',
      index: 0,
      newText:
        'Pastéis de nata are a Lisbon classic. Small puff pastry cups hold a thick egg-yolk custard, baked at very high heat until the surface caramelises in dark spots. You form the cups by pressing rolled puff pastry into a muffin tin. You cook the custard on the hob to a thick pourable cream before it goes in. The bake is short and hot.',
    },
  ],
  'pecan-bourbon-tart': [
    {
      kind: 'replace-paragraph',
      index: 1,
      newText:
        'Pecan pie has been made across the American South since the late 1800s. The filling is a custard of eggs, sugar, and golden syrup, with whole pecans stirred through. It sets to a dense, fudgy texture as it bakes. Bourbon is not in every American recipe, but Kentucky cooks have used it for generations. It cuts the sweetness and adds the complexity the filling needs.',
    },
  ],
  // Mindset attribution-paragraph removals (per batch41 pattern). The
  // "Where this comes from" heading + the paragraph that follows it just
  // duplicates the sourceNotes prose surfaced as the Sources block on the
  // public page.
  'tapping-for-is-this-too-much-pricing-fear': [
    { kind: 'delete-nodes', indices: [12, 13] },
  ],
  'tapping-for-joy-that-softens-the-sleep-system': [
    {
      kind: 'replace-paragraph',
      index: 0,
      newText:
        'A five-minute daytime tapping practice from Day 24 of a 30-day sleep program. The script works on the habit of pushing through the day without pleasure or ease. It reframes small daytime joys as direct support for the nervous system to settle into sleep at night.',
    },
    { kind: 'delete-nodes', indices: [10, 11] },
  ],
  'tapping-for-money-is-hard-to-earn': [
    { kind: 'delete-nodes', indices: [10, 11] },
  ],
  'tapping-for-money-shame': [
    { kind: 'delete-nodes', indices: [10, 11] },
  ],
  'tapping-for-peace-around-bills': [
    {
      kind: 'replace-paragraph',
      index: 11,
      newText:
        'If you want a ritual for the moment of paying itself, try Bless and pay. It adds a one-breath pause before you click send on each bill.',
    },
    { kind: 'delete-nodes', indices: [12, 13] },
  ],
}

function applyOperations(body: any, ops: Operation[]): void {
  // Sort delete operations by descending index so deletions don't shift
  // indices used by later operations. Then apply replace operations.
  // Easier: apply replace first, then deletes in descending order.
  const replaces = ops.filter((o) => o.kind === 'replace-paragraph') as ReplaceParagraph[]
  const liReplaces = ops.filter((o) => o.kind === 'replace-listitem-paragraph') as ReplaceListItemParagraph[]
  const deletes = ops.filter((o) => o.kind === 'delete-nodes') as DeleteNodes[]

  for (const op of replaces) {
    const node = body.content?.[op.index]
    if (!node || node.type !== 'paragraph') {
      throw new Error(`expected paragraph at index ${op.index}, found ${node?.type}`)
    }
    node.content = [{ type: 'text', text: op.newText }]
  }

  for (const op of liReplaces) {
    const list = body.content?.[op.listIndex]
    if (!list || (list.type !== 'bulletList' && list.type !== 'orderedList')) {
      throw new Error(`expected list at index ${op.listIndex}, found ${list?.type}`)
    }
    const item = list.content?.[op.itemIndex]
    const para = item?.content?.[op.paraIndex]
    if (!para || para.type !== 'paragraph') {
      throw new Error(`expected paragraph in list[${op.listIndex}][${op.itemIndex}][${op.paraIndex}]`)
    }
    para.content = [{ type: 'text', text: op.newText }]
  }

  // Collect all indices to delete and sort descending.
  const indices = deletes.flatMap((d) => d.indices).sort((a, b) => b - a)
  for (const idx of indices) {
    if (body.content?.[idx] !== undefined) {
      body.content.splice(idx, 1)
    }
  }
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch42')

  let okCount = 0
  let failCount = 0
  const failures: { slug: string; errors: string[] }[] = []

  for (const [slug, ops] of Object.entries(REWRITES)) {
    const filePath = resolve(batchDir, `${slug}.json`)
    const data = JSON.parse(readFileSync(filePath, 'utf8'))
    applyOperations(data.body, ops)
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')

    // Re-run voice-check on the rewritten file.
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      console.log(`[OK] ${slug}:clean after rewrite`)
      okCount++
    } else {
      console.log(`[FAIL] ${slug}:${report.errors.length} errors remain`)
      for (const e of report.errors) console.log(`   ${e.kind}: ${e.message}`)
      failCount++
      failures.push({ slug, errors: report.errors.map((e) => `${e.kind}: ${e.message}`) })
    }
  }

  console.log(`\nDone: ${okCount} ok, ${failCount} failed`)
  if (failures.length > 0) {
    console.log('Failures:')
    for (const f of failures) console.log(`  - ${f.slug}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
