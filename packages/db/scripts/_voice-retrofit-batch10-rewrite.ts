/**
 * Apply targeted paragraph rewrites to the batch10 JSON files.
 *
 * For each file, walks the body and swaps the body of the flagged
 * paragraph(s) / troubleshooter fix(es). Original is kept by the apply
 * script via Tutorial.revisedFrom; this rewrite just edits the JSON in
 * docs/voice-retrofit-2026-05-28-batch10/.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch10')

type Edit =
  | { kind: 'paragraph'; idx: number; text: string }
  | { kind: 'troubleshooter-fix'; tIdx: number; itemIdx: number; text: string }

const REWRITES: Record<string, Edit[]> = {
  'mirza-ghasemi.json': [
    {
      kind: 'paragraph',
      idx: 11,
      text: `Mirza ghasemi comes from Gilan, the lush province on Iran's Caspian coast. Gilani cooking is its own tradition, distinct from the rest of Iran. It leans on fresh herbs, pomegranate, fish, and egg dishes. The name is thought to come from a person, Mirza being an honorific title. The dish is one of the best-known Gilani plates outside the province. It shows up in Persian restaurants and cookbooks as a regional speciality. Charred aubergine and egg pair up in dishes across the Middle East and the Mediterranean, like shakshuka and Turkish patlican plates. The turmeric, garlic, and tomato combination is what makes this version distinctly Iranian.`,
    },
  ],
  'mississippi-pot-roast.json': [
    {
      kind: 'paragraph',
      idx: 0,
      text: `The original recipe uses two American convenience packets (ranch dressing mix and gravy mix), and the version here makes both from scratch with dried herbs and spices. The flavour is the same: savoury, slightly tangy, deeply beefy. The pepperoncini add acid and heat that cut through the rich butter. The dish has almost no water added. The beef, butter, and peppers make their own liquid as they cook.`,
    },
    {
      kind: 'troubleshooter-fix',
      tIdx: 9,
      itemIdx: 2,
      text: `Skim the liquid with a spoon after cooking. Or chill it overnight. The fat sets on the surface and lifts off easily.`,
    },
    {
      kind: 'troubleshooter-fix',
      tIdx: 9,
      itemIdx: 3,
      text: `Use fewer pepperoncini and cut back on the brine. The peppers give background tang, not a dominant heat.`,
    },
    {
      kind: 'paragraph',
      idx: 11,
      text: `Mississippi pot roast is one of the few internet-born recipes. Robin Chapman of Columbus, Mississippi made the first version in the early 2000s. It spread by word of mouth and church cookbooks for a decade before going viral on recipe sites around 2013. Within a few years it had been cooked by millions of American home cooks and written up in every major food magazine. The appeal is plain: five ingredients, almost no prep, and a result that punches above the method. It is a modern American comfort food with an origin story you can trace to one person.`,
    },
  ],
  'molokhia-chicken.json': [
    {
      kind: 'paragraph',
      idx: 11,
      text: `Many Egyptians see molokhia as the national dish. It is eaten across all classes and on every occasion, from weeknight dinners to feast days. The thickened jute leaf soup with rice, chicken, and the sharp ta'leya garnish is quintessentially Egyptian. A Fatimid Caliph is said to have banned it once for its supposed aphrodisiac power, which only raised its profile. Outside Egypt, molokhia is cooked across the Arab world in different ways. The Lebanese version keeps the leaves whole. The Tunisian version uses dried leaves. The Egyptian version is always the chopped frozen kind, poured into a broth.`,
    },
  ],
  'monte-cristo-sandwich.json': [
    {
      kind: 'paragraph',
      idx: 11,
      text: `The Monte Cristo is the American version of the French croque-monsieur. The French press their sandwich with butter and béchamel. The Americans dip theirs in egg batter and serve it with jam. The Disneyland link made the sandwich famous. It first appeared on the Blue Bayou Restaurant menu in the mid-1960s and became one of the most recognised theme-park dishes in the country. It was already a diner staple before that. The sweet finish of icing sugar and jam is not for show. It is the proper American presentation.`,
    },
  ],
  'moroccan-carrot-salad.json': [
    {
      kind: 'paragraph',
      idx: 9,
      text: `Moroccan carrot salad is a constant on the salad-course table alongside zaalouk and taktouka. It is served with bread before the main dish arrives. It is one of the simplest Moroccan plates: a boiled vegetable dressed with the standard cumin, garlic, and lemon. It needs almost no skill to make well. Outside Morocco it is a useful side dish for grilled meats and fish, and for building a spread for a casual Moroccan meal at home.`,
    },
  ],
  'moroccan-lentil-soup.json': [
    {
      kind: 'troubleshooter-fix',
      tIdx: 13,
      itemIdx: 4,
      text: `Rinse red lentils in a fine sieve under cold water until the water runs clear. The lentils carry a fine dust that turns to grit in the pot.`,
    },
  ],
  'moros-y-cristianos.json': [
    {
      kind: 'paragraph',
      idx: 13,
      text: `Moros y Cristianos is as central to Cuban cooking as rice and peas is to Jamaican cooking. The two dishes are distant cousins. Both are built on the Caribbean pairing of beans and rice but shaped by different food traditions. The Cuban version is secular, everyday food eaten with ropa vieja, picadillo, or fried pork. The name dates from Spanish colonial rule. It refers to the colour contrast between the black beans and the white rice, though the two are cooked together until that contrast blurs.`,
    },
  ],
  'moussaka.json': [
    {
      kind: 'paragraph',
      idx: 16,
      text: `Moussaka in its current form with béchamel is a twentieth-century shape, though it draws on a much older tradition of layered aubergine and meat dishes across the eastern Mediterranean. The Greek chef Nikolaos Tselementes is credited with adding the béchamel top in the 1930s. He set a looser tradition into a fixed recipe that then became the standard. The dish is now so tied to Greek cooking that it appears on every Greek restaurant menu in the UK. In Greece itself it is first and foremost a home dish, made on Sundays, portioned big, and eaten the next day just as often as fresh.`,
    },
  ],
  'mrouzia.json': [
    {
      kind: 'paragraph',
      idx: 11,
      text: `Mrouzia is the Eid al-Adha dish of Morocco. After the sheep is slaughtered and portioned, the shoulder goes into this tagine and the whole neighbourhood fills with its scent as it cooks through the morning. The dish was made in large amounts and kept under its rich sauce for several days. The honey and spices acted as a natural preservative. It is the peak of Moroccan sweet-savoury cooking. The flavour pair has its roots in the medieval Arab kitchen tradition that shaped Moroccan food from the 8th century onward.`,
    },
  ],
  'mughlai-chicken.json': [
    {
      kind: 'paragraph',
      idx: 0,
      text: `Mughlai chicken belongs to the northern Indian court cooking that peaked under the Mughal emperors of the sixteenth and seventeenth centuries. The hallmark of Mughlai cooking is richness: cream, clarified butter, dried fruit, nuts, and saffron used with a careful hand. The dish is mild in heat but complex in flavour. The base is a slow-cooked onion paste thickened with ground almonds, not flour or lentils.`,
    },
    {
      kind: 'paragraph',
      idx: 11,
      text: `Mughlai cooking took shape in the imperial kitchens of Delhi and Agra from the sixteenth century. Persian and Central Asian food traditions merged with the spice palette of the Indian subcontinent. The result was rich, fragrant, and often cream- and nut-enriched. It became the template for restaurant Indian cooking across South Asia and, in time, in Britain. Dishes like chicken tikka masala and korma are distant cousins. Mughlai chicken as a named dish appears in Anglo-Indian cookery books of the twentieth century as a shorthand for the style: mild, fragrant, and made for guests.`,
    },
  ],
  'muhammara.json': [
    {
      kind: 'paragraph',
      idx: 11,
      text: `Muhammara comes from Aleppo, Syria's second city and long one of the great food centres of the Arab world. It is usually made with Aleppo pepper (also called pul biber), a mild, fruity dried chilli with a faint oiliness, found in specialty and Middle Eastern shops. Standard chilli flakes are a fair stand-in. Muhammara sits on the mezze table with hummus and mutabal as a dip, and doubles as a sauce for grilled meats and fish. Pomegranate molasses with walnuts shows up in several Syrian and Levantine dishes. It speaks to the region's skill in building layered flavours from a few good things.`,
    },
  ],
  'the-overflowing-reservoir-visualisation.json': [
    {
      kind: 'paragraph',
      idx: 0,
      text: `A five-minute visualisation for building a felt sense of refill. The image holds the idea that money leaving does not shrink the supply. The reservoir refills as it empties. The level stays steady and, over time, rises.`,
    },
  ],
  'the-pause-between-breaths.json': [
    {
      kind: 'paragraph',
      idx: 9,
      text: `This piece is original to homemade.education. Creative imagery as a self-help tool has a long history in the public domain.`,
    },
  ],
  'the-pre-sleep-bedtime-activity.json': [
    {
      kind: 'paragraph',
      idx: 17,
      text: `A steady pre-sleep routine is a standard sleep-hygiene practice. It shows up in sleep medicine research, including CBT for Insomnia (CBT-I) protocols and the British Sleep Society's guidelines. The five-action form used here is adapted from Day 1 of SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025).`,
    },
  ],
  'the-reservoir-that-refills-itself.json': [
    {
      kind: 'paragraph',
      idx: 18,
      text: `Reservoir and water-as-money imagery has deep roots in folk-prosperity traditions and sits in the public domain. The idea of money as a flow rather than a fixed stock has been around for centuries. The five-minute single-image form used here is adapted from Day 2 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The book pairs the reservoir image with a tapping practice on the same theme.`,
    },
  ],
  'the-room-you-are-already-standing-in-visualisation.json': [
    {
      kind: 'paragraph',
      idx: 9,
      text: `This reading is original to homemade.education. The image practice of looking around in gratitude shows up in many therapy and coaching forms. No single source is claimed here.`,
    },
  ],
  'the-same-fight-on-repeat.json': [
    {
      kind: 'paragraph',
      idx: 2,
      text: `Researchers studying long-term couples have found that roughly 69 percent of fights between partners are perpetual. They do not resolve. They recur because they are rooted in personality differences or core needs that are not going to disappear. The goal with perpetual fights is not to resolve them but to manage the conversation, knowing each other's position more fully, even when nothing changes.`,
    },
    {
      kind: 'paragraph',
      idx: 10,
      text: `Draws on the Gottman Institute's work on couples talk, ongoing conflict, and bids for connection. The framing here is original to homemade.education.`,
    },
  ],
  'the-savings-number-climbing-on-its-own.json': [
    {
      kind: 'paragraph',
      idx: 8,
      text: `This reading is original to homemade.education. The image practice draws on a long history of self-help imagery in the public domain.`,
    },
  ],
  'the-science-of-slow-breathing-for-sleep.json': [
    {
      kind: 'paragraph',
      idx: 3,
      text: `Sleep requires the parasympathetic branch to dominate. The problem is that many people are still running on sympathetic dominance well into the night. Shallow breathing, raised cortisol, a body that hasn't had a clear signal that the threat is over and it is safe to rest.`,
    },
    {
      kind: 'paragraph',
      idx: 7,
      text: `Higher HRV is linked to better recovery, lower anxiety, better sleep, and more capacity to regulate the stress response. Slow breathing consistently raises HRV. Not by working harder, but by giving the heart's natural rhythm more room to move.`,
    },
    {
      kind: 'paragraph',
      idx: 10,
      text: `This is why extended-exhale breathing patterns, like the 4-7-8 technique, work so well for sleep. When the exhale runs longer than the inhale, more time is spent in the parasympathetic phase. The net effect on the nervous system is calming rather than neutral.`,
    },
    {
      kind: 'paragraph',
      idx: 11,
      text: `Box breathing, with equal sides, works differently. The symmetry and the holds both interrupt automatic breathing. They require focus and intention. That mental engagement is itself useful for breaking an anxiety loop. The regulated rhythm still drops the overall breath rate compared to normal breathing.`,
    },
    {
      kind: 'paragraph',
      idx: 17,
      text: `Most adults breathe shallowly and high in the chest for much of the day. Stress amplifies this. Shallow breathing is part of the sympathetic pattern, and the two feed each other. Diaphragmatic breathing, also called belly breathing, drops the diaphragm on the inhale so the belly expands outward rather than the chest lifting. It is more efficient and linked to lower cortisol and better mood.`,
    },
    {
      kind: 'paragraph',
      idx: 20,
      text: `Original to homemade.education. Written as a companion reading to Day 9 of SLEEP: A 30-Day Tapping Intensive to Fall Asleep Faster and Wake Energised (Rebecca J Page, 2025). Draws on research into breath physiology, heart rate variability, and slow breathing for sleep and anxiety. Sources include Zaccaro and colleagues, 2018, in their review for Frontiers in Human Neuroscience.`,
    },
  ],
  'the-seven-figure-deal-feels-natural-visualisation.json': [
    {
      kind: 'paragraph',
      idx: 8,
      text: `This reading is original to homemade.education. Imagery that lets you step into a future scene shows up in many therapy and coaching forms. No single source is claimed here.`,
    },
  ],
}

function applyEdit(data: any, edit: Edit): boolean {
  const content = data?.body?.content
  if (!Array.isArray(content)) return false
  if (edit.kind === 'paragraph') {
    const node = content[edit.idx]
    if (!node || (node.type !== 'paragraph' && node.type !== 'heading' && node.type !== 'blockquote')) {
      console.error(`  ! paragraph[${edit.idx}] is type ${node?.type}`)
      return false
    }
    node.content = [{ type: 'text', text: edit.text }]
    return true
  }
  if (edit.kind === 'troubleshooter-fix') {
    const ts = content[edit.tIdx]
    if (!ts || ts.type !== 'troubleshooter') {
      console.error(`  ! content[${edit.tIdx}] is type ${ts?.type}`)
      return false
    }
    const items = ts.attrs?.items
    if (!Array.isArray(items) || !items[edit.itemIdx]) {
      console.error(`  ! troubleshooter[${edit.tIdx}].items[${edit.itemIdx}] missing`)
      return false
    }
    items[edit.itemIdx].fix = edit.text
    return true
  }
  return false
}

function main() {
  let total = 0
  let ok = 0
  for (const [file, edits] of Object.entries(REWRITES)) {
    const full = resolve(batchDir, file)
    if (!existsSync(full)) {
      console.error(`MISSING ${file}`)
      continue
    }
    const data = JSON.parse(readFileSync(full, 'utf8'))
    let allOk = true
    for (const edit of edits) {
      total++
      const success = applyEdit(data, edit)
      if (success) ok++
      else allOk = false
    }
    if (allOk) console.log(`OK     ${file}  (${edits.length} edits)`)
    else console.log(`PART   ${file}`)
    writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8')
  }
  console.log(`\nApplied: ${ok}/${total} edits across ${Object.keys(REWRITES).length} files`)
}

main()
