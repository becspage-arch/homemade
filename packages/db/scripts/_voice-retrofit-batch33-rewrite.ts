/**
 * Apply batch33 rewrites to docs/voice-retrofit-2026-05-27-batch33/*.json.
 * Each entry replaces a specific paragraph's content array with a new one,
 * preserving glossaryTooltip marks where needed.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

type TextLeaf = { type: 'text'; text: string; marks?: { type: string; attrs?: any }[] }

interface Rewrite {
  file: string
  path: string  // voice-check path like "body > paragraph[13] > text"
  newContent: TextLeaf[]
}

const REWRITES: Rewrite[] = [
  {
    file: 'chicken-biryani.json',
    path: 'body > paragraph[13]',
    newContent: [{ type: 'text', text: "Biryani sits differently on the British curry-house menu from other rice dishes. It is a complete meal of chicken and rice, not a side. The layering and the dum step give it visual drama at the table that pilau rice cannot match. It is often served with raita on the side. Across South Asia, biryani styles vary by region. Hyderabadi, Lucknowi, Kolkata, and Sindhi versions each have their own character. The British curry-house version draws loosely from the Mughal northern tradition." }],
  },
  {
    file: 'chicken-casserole-cider-tarragon.json',
    path: 'body > paragraph[9]',
    newContent: [{ type: 'text', text: "Chicken with cider and tarragon comes from the apple-growing counties of Devon, Somerset, and Herefordshire. These are the places where cider is made in quantity. It is an autumn dish, made when the new season's cider is ready and the air starts to turn cool. The French Norman version is better known abroad. The British West Country tradition is older." }],
  },
  {
    file: 'chicken-dopiaza.json',
    path: 'body > paragraph[11]',
    newContent: [{ type: 'text', text: "Dopiaza sits in the medium range of the curry-house heat scale. It shows how technique, not a long spice list, can set a dish apart. The double-onion method is the single thing that makes dopiaza different from dozens of other medium curries. On a curry-house menu it often gets passed over by diners who do not know what sets it apart. The textural contrast of the two onion stages is subtle but worth seeking out." }],
  },
  {
    file: 'chicken-kiev.json',
    path: 'body > paragraph[18]',
    newContent: [{ type: 'text', text: "Chicken Kiev is claimed by both Ukraine and France. The argument has been running since at least the mid-twentieth century. The Ukrainian version, kotleta po-kyivski, became a prestige dish in Soviet-era restaurants. The dish then travelled out through Soviet diplomatic circles and, later, through the post-war rise of restaurant dining. In the UK it became a Seventies dinner-party staple before turning up in supermarket freezers. The frozen version bears little resemblance to a home-cooked one with good butter. The home-cooked Kiev, with its golden crust and butter pooled inside, is a different dish." }],
  },
  {
    file: 'chicken-korma.json',
    path: 'body > paragraph[11]',
    newContent: [{ type: 'text', text: "Korma is the entry point of the British curry-house menu. It is the one recommended for children, the nervous first-timer, and the regular who orders it every time because it never lets them down. The British version has drifted far from its Mughal origin. The original korma is a slow-braised dish of marinated meat cooked with yoghurt and whole spices. That is quite different in technique and texture from the cream-and-coconut version served in UK restaurants. Both are valid. They are simply different dishes that share a name and a lineage. The British version has its own integrity. Well-made, it is fragrant, rich, and deeply comforting." }],
  },
  {
    file: 'chicken-passanda.json',
    path: 'body > paragraph[0]',
    newContent: [{ type: 'text', text: "Passanda is a mild, soothing curry. The almond and cream make a sauce that is rich but not heavy. The key technique difference from korma is when the almond flour goes in. Here it cooks with the spices from early on. That develops the nuttiness of the almonds into the base, rather than just stirring them in at the end as a thickener." }],
  },
  {
    file: 'chicken-passanda.json',
    path: 'body > paragraph[11]',
    newContent: [{ type: 'text', text: "Passanda sits in the same spot as korma in the British curry-house mild category, but it has a different character. The almond flavour is richer and more prominent than the sweetness-forward korma. It is a useful dish for groups with mixed heat tolerances. The rose water option, used in some versions, gives it a faint Mughal perfumed note. That sets it apart from other mild curries. The sauce is pale enough to show clearly on the plate, a visual signal of its mildness." }],
  },
  {
    file: 'looking-back-from-the-end-of-your-life-at-the-lineage-you-started.json',
    path: 'body > paragraph[9]',
    newContent: [{ type: 'text', text: "Original to homemade.education. Built from the Day 13 theme of allowing a new wealthy lineage to begin, drawn from MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). End-of-life visualisation as a way to gain perspective has roots in several contemplative traditions. These include Stoic memento mori exercises and Buddhist life-review practices." }],
  },
  {
    file: 'matrescence-the-identity-rewrite.json',
    path: 'body > paragraph[0]',
    newContent: [{ type: 'text', text: "A reading on matrescence, the change of becoming a mother. The word names the identity shift a woman moves through when she has a child. It is as big a transition as adolescence, but with no cultural script to go with it. The word has been used by researchers since the 1970s and is only now reaching wider use." }],
  },
  {
    file: 'matrescence-the-identity-rewrite.json',
    path: 'body > paragraph[11]',
    newContent: [{ type: 'text', text: "Having a word for matrescence changes the experience. A framework that treats it as a transition, not a crisis or a failure, gives the feeling somewhere to land. Women who understand what is happening to them during the change report being better able to tolerate it. They are more patient with the confusion. They are less likely to treat their own normal responses as signs of breakdown." }],
  },
  {
    file: 'matrescence-the-identity-rewrite.json',
    path: 'body > paragraph[14]',
    newContent: [{ type: 'text', text: "Written for homemade.education. The idea of matrescence was first named by anthropologist Dana Raphael in the 1970s. It was developed more recently by psychologist and academic Aurelie Athan. Her research has been central to bringing the idea into modern maternal health work." }],
  },
  {
    file: 'money-always-returns-and-grows-affirmation.json',
    path: 'body > paragraph[2]',
    newContent: [{ type: 'text', text: "The affirmation is most useful as a morning practice, before the day builds. It also helps in the moment you catch the clinging feeling appearing. That is the hand staying on the wallet, or the delay on a sensible decision." }],
  },
  {
    file: 'money-and-the-nervous-system.json',
    path: 'body > paragraph[10]',
    newContent: [{ type: 'text', text: "Written for homemade.education. The reading draws on polyvagal theory and on body-based work with money worry." }],
  },
  {
    file: 'money-arriving-and-staying.json',
    path: 'body > paragraph[9]',
    newContent: [{ type: 'text', text: "Original work for homemade.education. Built to go with Day 19 of MONEY: A 12-Week Tapping Program by Rebecca J Page, 2025." }],
  },
  {
    file: 'money-arriving-while-you-nap.json',
    path: 'body > paragraph[0]',
    newContent: [{ type: 'text', text: "A five-minute visualisation for when the idea of income arriving without your direct work still feels abstract. The scene is small and specific. A payment notification lands while you are asleep in the afternoon." }],
  },
  {
    file: 'money-arriving-while-you-nap.json',
    path: 'body > paragraph[9]',
    newContent: [{ type: 'text', text: "Original to homemade.education. Creative visualisation as a self-development tool draws on several lineages. This practice uses the technique in a specific setting." }],
  },
  {
    file: 'money-can-come-easily-i-am-safe-to-receive-it.json',
    path: 'body > paragraph[0]',
    newContent: [{ type: 'text', text: "A short energy statement for the morning after easy income arrived. It also works in the moment you notice the guilt or the suspicion about it." }],
  },
  {
    file: 'whittled-sycamore-candle-holder.json',
    path: 'body > paragraph[0]',
    newContent: [{ type: 'text', text: "A taper candle holder is one of the most useful pieces of small treen. It is a single block of seasoned wood with a socket at the top and a finished octagonal body that sits steady on a flat surface. The socket is the technical challenge. It needs to hold a standard 22 mm taper candle firmly, without being so tight that the candle cracks the wood. This tutorial makes the socket with a brace-and-bit drill (optional) and a chip-carving knife. The exterior is then shaped with a sloyd knife." }],
  },
  {
    file: 'whittled-sycamore-cocktail-pick.json',
    path: 'body > orderedList[5] > listItem[0] > paragraph[0]',
    newContent: [
      { type: 'text', text: 'Work the strip to a round or oval cross-section using ' },
      { type: 'text', text: 'push cuts', marks: [{ type: 'glossaryTooltip', attrs: { termId: 'cmpa0m70u0002t8v46ohivdkd' } }] },
      { type: 'text', text: ' along the length. Hold the strip in a four-finger grip with the blade pointing away from the body. Each cut removes one of the corners of the rectangular cross-section in turn.' },
    ],
  },
  {
    file: 'whittled-sycamore-letter-opener.json',
    path: 'body > paragraph[0]',
    newContent: [{ type: 'text', text: "A letter opener makes a good first project in seasoned wood. The shape is forgiving, the tools are few, and the finished piece is something a person actually uses. The form is a long, flat taper with a blunt point. It is wide at the handle and narrows to a thin, smooth blade edge. There is no hollowing, no complex joinery, and no tight radius to navigate. Sycamore is the recommended species. It carves cleanly with a knife even when seasoned, gives a very pale surface, and is widely sold as craft blanks from wood-carving suppliers." }],
  },
  {
    file: 'willow-christmas-star.json',
    path: 'body > bulletList[15] > listItem[1] > paragraph[0]',
    newContent: [{ type: 'text', text: 'A cluster of three stars in different sizes, hung at different heights, makes a simple window decoration. It dries in place over the first week without losing its shape.' }],
  },
  {
    file: 'willow-fishing-creel.json',
    path: 'body > paragraph[0]',
    newContent: [{ type: 'text', text: "A fishing creel is a basket designed to be worn. The kidney shape fits against the back. The rounded belly faces outward, keeping the fish cool and aerated on a warm day. The construction is the most demanding in the basketry repertoire. The kidney base needs a modified slath to give the curved footprint. Staking-up on a convex base means holding the stakes at two different angles at the same time. A confident intermediate basketmaker should expect to spend a full day on a first creel." }],
  },
]

function navigatePath(body: any, path: string): { parent: any; key: string | number } | null {
  // Path is like "body > paragraph[13]" or "body > bulletList[15] > listItem[1] > paragraph[0]"
  // We want to return a reference to the node so we can mutate its `content`.
  const parts = path.split(' > ').slice(1)
  let node: any = body
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    const m = part.match(/^([a-zA-Z]+)\[(\d+)\]$/)
    if (!m) return null
    const idx = parseInt(m[2]!, 10)
    if (i === parts.length - 1) {
      // The leaf — return the node itself, not its parent.
      const child = node?.content?.[idx]
      if (!child) return null
      return { parent: child, key: 'content' }
    }
    node = node?.content?.[idx]
  }
  return null
}

function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch33')

  let ok = 0
  let fail = 0
  for (const r of REWRITES) {
    const fullPath = resolve(batchDir, r.file)
    const data = JSON.parse(readFileSync(fullPath, 'utf8'))
    const target = navigatePath(data.body, r.path)
    if (!target) {
      console.error(`[FAIL] ${r.file} ${r.path}: cannot navigate path`)
      fail++
      continue
    }
    if (target.parent.type !== 'paragraph') {
      console.error(`[FAIL] ${r.file} ${r.path}: expected paragraph, got ${target.parent.type}`)
      fail++
      continue
    }
    target.parent.content = r.newContent
    writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`[OK]   ${r.file} ${r.path}`)
    ok++
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`)
}

main()
