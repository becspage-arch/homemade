/**
 * Apply paragraph-level rewrites to the 22 voice-check violators in batch5.
 *
 * Three slugs are dropped from the batch because their only violator is a
 * verbatim EFT setup statement of the shape "Even though X, I deeply and
 * completely accept myself." Per the verbatim-energy-statements rule those
 * cannot be rewritten. They go in the known-blocked list for the next fire.
 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
import { runVoiceCheck } from './voice-check-lib.js'

const BATCH_ID = '2026-05-28-batch5'

const DROP_SLUGS = new Set([
  'tapping-to-see-myself-as-someone-who-has-it',
  'tapping-to-trust-legacy-property-building',
  'tapping-to-welcome-property-and-investment',
])

// Path-keyed paragraph rewrites. Each entry replaces the inner text of the
// first text-leaf in the paragraph at the given path. For paragraphs whose
// content is a single text leaf this is equivalent to a full-paragraph
// rewrite while preserving the node shape (type: "paragraph", content: [{
// type: "text", text: ... }]).
type Rewrite = { slug: string; path: string; newText: string }

const REWRITES: Rewrite[] = [
  {
    slug: 'knedliky-potato',
    path: 'body > paragraph[13]',
    newText:
      "Potato dumplings show up across Central Europe: German Kartoffelklöße, Austrian Knödel, Slovak halušky, Polish kopytka. The Czech bramborový knedlík is the usual partner to svíčková, the Czech national dish of beef sirloin in a cream and vegetable sauce. It also goes with any rich, slow-cooked dish that needs something to soak up the sauce. Like the bread dumpling, the potato kind sits on every Czech table where there is sauce to mop up.",
  },
  {
    slug: 'kofte-izmir',
    path: 'body > paragraph[16]',
    newText:
      "İzmir köfte carries the name of Turkey's third-largest city on the Aegean coast. Versions of the dish appear across the country under different names. The braised meatball with potatoes and tomato is everyday Turkish home cooking at its most useful. One pan, forty minutes, reheats well, and feeds a family from a small bit of mince. It is the Turkish answer to the Italian polpette al sugo or the Greek soutzoukakia.",
  },
  {
    slug: 'koshari',
    path: 'body > paragraph[15]',
    newText:
      "Koshari is one of the great street foods of Cairo: cheap, filling, deeply satisfying. Vendors sell it from metal carts with the parts in separate containers, putting each bowl together to order. People eat it standing up or in small koshari-only restaurants. The dish dates from the nineteenth century, when Egypt pulled in bits from many food traditions and turned them into something distinctly Egyptian. The mix of lentils, rice, pasta, and tomato sauce looks odd on paper. In the bowl it works. Each part is starchy and simple, and the sharp sauce and the crispy onion pull it all together. It is the food of the people.",
  },
  {
    slug: 'kotlety-mielone',
    path: 'body > paragraph[0]',
    newText:
      "Kotlety mielone are the pan-fried pork mince patties of the Polish kitchen. The shape is like a hamburger but the seasoning goes a different way. The onion is grated rather than chopped, so it melts into the mince and keeps it moist. A little ground allspice gives a warm, faintly aromatic note that places the dish firmly in Poland.",
  },
  {
    slug: 'kotlety-schabowe',
    path: 'body > paragraph[11]',
    newText:
      "Kotlet schabowy arrived in Polish cooking in the 19th century, by way of Viennese schnitzel and Austrian and Prussian food culture. It is now so thoroughly Polish that most Poles would be surprised by the link. Every milk bar (bar mleczny) in Poland serves it as the heart of a two-złoty lunch. Every restaurant has it on the menu. Every Polish grandmother has her own recipe.",
  },
  {
    slug: 'kulajda',
    path: 'body > paragraph[11]',
    newText:
      "Kulajda is a South Bohemian regional soup that has become one of the best-known Czech dishes outside the country. It turns up on the menus of Czech restaurants and on the tables of Czech families. Many cook it as a weekend soup, using foraged or dried mushrooms and the cream from the fridge. The mix of cream, vinegar, and dill in a mushroom soup surprises anyone who has not met it before, and pleases anyone who has.",
  },
  {
    slug: 'lamb-bhuna',
    path: 'body > paragraph[11]',
    newText:
      "Bhuna is the choice of curry-house regulars who want depth over sauce. It is the order of someone who knows what they want rather than what to try on a first visit. On the British curry-house menu it sits with the other dry curries (dopiaza, pathia) as a foil to the cream and sauce-based dishes. Watching for oil to separate as a check is a trick shared across South Asian cooking. The same idea sits behind a good rogan josh base or a Bangladeshi tarka.",
  },
  {
    slug: 'lamb-biryani',
    path: 'body > paragraph[0]',
    newText:
      "Lamb biryani takes more time than chicken biryani. The lamb needs a full braise of at least 75 minutes before it is tender enough to layer. The gain is that the braising sauce around the lamb is richer than a chicken marinade. That sauce then soaks into the rice during the dum stage, giving a much deeper flavour.",
  },
  {
    slug: 'lamb-biryani',
    path: 'body > paragraph[13]',
    newText:
      "Lamb biryani is the heavier, more complex sibling of chicken biryani. The braised lamb sauce gives the rice a depth that lighter meat cannot. It is a weekend dish. The timing of the braise and the parboiling needs attention and order, and it rewards the effort with something quite different from a curry with rice on the side. In restaurant service it is often built and held, then finished to order. The dum stage is forgiving of timing, which makes it practical at scale.",
  },
  {
    slug: 'lamb-dhansak',
    path: 'body > paragraph[11]',
    newText:
      "Dhansak is one of the richer curries on the British curry-house menu. The mix of lamb, lentil, and squash makes it a properly filling main. It sits in the medium-hot range and has its own character. The Parsi influence gives it a sweet-sour edge that is worth ordering over a standard korma or madras. In Parsi cooking the dish is served with caramelised brown rice and never on Sundays, which is thought unlucky. The curry-house version drops both habits.",
  },
  {
    slug: 'lamb-fricassee-greek',
    path: 'body > paragraph[1]',
    newText:
      "Cos lettuce (romaine) wilts into the braising liquid in the last fifteen minutes, adding a soft, leafy note and soaking up the lamb's fat. Cooking lettuce for fifteen minutes sounds odd, but it holds its shape better than you expect and is right at home here.",
  },
  {
    slug: 'lamb-fricassee-greek',
    path: 'body > paragraph[13]',
    newText:
      "The avgolemono trick (whisking egg yolks and lemon juice into a hot liquid to enrich and thicken it) is one of the defining moves of Greek cooking. It shows up in soups, braises, and sauces across the cuisine. It is close kin to the egg-lemon sauces in Sephardic Jewish cooking across the eastern Mediterranean, where the trick was widespread before Greek cooking made it its own. In Greek fricassee, the eggs add richness and the lemon adds sharpness. The result is a sauce that belongs to neither French cream nor southern Italian tomato. It is distinctly Greek.",
  },
  {
    slug: 'lamb-madras',
    path: 'body > paragraph[11]',
    newText:
      "Madras is the second-hottest standard entry on the British curry-house heat ladder, between bhuna and vindaloo. In British curry-house ordering it signals a heat preference, not a specific origin. Regulars who want heat without the burn of vindaloo order madras. The tamarind sourness sets it apart from a plain hot curry and rewards eating slowly.",
  },
  {
    slug: 'lamb-rogan-josh',
    path: 'body > paragraph[11]',
    newText:
      "Rogan josh is the mid-range classic of the British curry-house menu. It is hotter than korma, milder than madras, and more aromatic than either. In Britain, it is most often made with lamb, the British favourite for slow-cooked curries. The original Kashmiri dish uses dried Kashmiri chillies, which give a softer heat and deep colour. British versions usually swap in plain chilli powder, which shifts the character a little. Rogan josh sits in the sweet spot where the curry-house tradition and the home cook meet. It rewards patience, it reheats well, and it is deeply satisfying on a cold night.",
  },
  {
    slug: 'tapping-to-start-where-you-are',
    path: 'body > paragraph[11]',
    newText:
      'Adapted from Day 1 of SLEEP: A 30-Day Tapping Intensive by Rebecca J Page, 2025, "Start where you are." The tapping method is Emotional Freedom Technique, or EFT. It comes from Gary Craig in the mid-1990s, building on Roger Callahan\'s Thought Field Therapy.',
  },
  {
    slug: 'tarte-aux-pommes',
    path: 'body > paragraph[0]',
    newText:
      "Tarte aux pommes is a French pâtisserie standard. The base is a sweet shortcrust, the middle is a soft apple compote, and the top is a fan of overlapping fresh apple slices, brushed with warm apricot glaze. The pastry is blind-baked, the compote is cooked on the hob, and the final bake is brief. Just long enough to soften the top slices and let the pastry colour at the edges.",
  },
  {
    slug: 'tarte-tatin-apple',
    path: 'body > paragraph[0]',
    newText:
      "Tarte Tatin is built upside-down in a heavy ovenproof pan. Butter and sugar cook to a deep amber caramel. Apple halves go into the caramel cut-side up and cook until soft and glossy. A disc of puff pastry is laid over the apples and tucked down. The whole pan bakes until the pastry is risen and golden. Then the tart is flipped onto a serving plate so the apples are on top.",
  },
  {
    slug: 'teaching-children-about-money-without-passing-on-scarcity-reading',
    path: 'body > paragraph[20]',
    newText:
      "Written for homemade.education. Draws on research about how children learn money habits, and on Brad Klontz's work on money scripts.",
  },
  {
    slug: 'telling-your-younger-self-she-is-allowed-to-want-this',
    path: 'body > paragraph[13]',
    newText:
      'Built from Day 15 of MONEY: A 12-Week Tapping Program by Rebecca J Page, 2025. The theme is letting go of guilt about wanting wealth.',
  },
  {
    slug: 'ten-minutes-outside-daily',
    path: 'body > paragraph[10]',
    newText:
      'Written for homemade.education. Time in nature is known to restore tired attention. See the Sources note below for the research.',
  },
  {
    slug: 'the-84-day-arc-in-money-v2',
    path: 'body > paragraph[10]',
    newText:
      'Written for homemade.education. It introduces the shape of the MONEY v2 program.',
  },
]

// Special: remove the safety-block infoPanel[2] on tarte-tatin-apple.
const NODE_REMOVALS: { slug: string; path: string }[] = [
  { slug: 'tarte-tatin-apple', path: 'body > infoPanel[2]' },
]

function nodeAtIndexPath(body: any, path: string): { parent: any; key: number; node: any } | null {
  const parts = path.split(' > ').slice(1)
  let cur: any = body
  let parent: any = null
  let key: number = -1
  for (const seg of parts) {
    const m = seg.match(/^([a-zA-Z]+)\[(\d+)\]$/)
    if (!m) return null
    const idx = parseInt(m[2], 10)
    if (!cur || !Array.isArray(cur.content)) return null
    parent = cur
    key = idx
    cur = cur.content[idx]
  }
  return { parent, key, node: cur }
}

function setFirstTextLeaf(node: any, newText: string): boolean {
  if (!node) return false
  if (typeof node.text === 'string') {
    node.text = newText
    node.type = 'text'
    return true
  }
  if (Array.isArray(node.content)) {
    // Replace by collapsing to a single text leaf (preserves paragraph shape).
    node.content = [{ type: 'text', text: newText }]
    return true
  }
  return false
}

function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const dirPath = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

  // Drop verbatim EFT slugs.
  let dropped = 0
  for (const slug of DROP_SLUGS) {
    try {
      unlinkSync(resolve(dirPath, `${slug}.json`))
      console.log(`[dropped] ${slug}`)
      dropped++
    } catch (e) {
      console.error(`[drop-fail] ${slug}: ${(e as Error).message}`)
    }
  }

  // Group rewrites by slug to read+write each file once.
  const rewritesBySlug = new Map<string, Rewrite[]>()
  for (const r of REWRITES) {
    if (!rewritesBySlug.has(r.slug)) rewritesBySlug.set(r.slug, [])
    rewritesBySlug.get(r.slug)!.push(r)
  }
  const removalsBySlug = new Map<string, { slug: string; path: string }[]>()
  for (const r of NODE_REMOVALS) {
    if (!removalsBySlug.has(r.slug)) removalsBySlug.set(r.slug, [])
    removalsBySlug.get(r.slug)!.push(r)
  }

  const slugsToTouch = new Set<string>([...rewritesBySlug.keys(), ...removalsBySlug.keys()])
  let touched = 0
  let stillFailing: string[] = []

  for (const slug of slugsToTouch) {
    const filePath = resolve(dirPath, `${slug}.json`)
    const data = JSON.parse(readFileSync(filePath, 'utf8'))

    for (const r of rewritesBySlug.get(slug) ?? []) {
      const hit = nodeAtIndexPath(data.body, r.path)
      if (!hit) {
        console.error(`[path-miss] ${slug} ${r.path}`)
        continue
      }
      if (!setFirstTextLeaf(hit.node, r.newText)) {
        console.error(`[set-fail] ${slug} ${r.path}`)
      }
    }

    const removals = (removalsBySlug.get(slug) ?? []).slice().sort((a, b) => {
      const ai = parseInt(a.path.match(/\[(\d+)\]$/)![1], 10)
      const bi = parseInt(b.path.match(/\[(\d+)\]$/)![1], 10)
      return bi - ai // remove highest index first to preserve earlier indices
    })
    for (const rem of removals) {
      const hit = nodeAtIndexPath(data.body, rem.path)
      if (!hit) {
        console.error(`[remove-miss] ${slug} ${rem.path}`)
        continue
      }
      hit.parent.content.splice(hit.key, 1)
    }

    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')

    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      console.log(`[ok]      ${slug}`)
    } else {
      console.error(`[FAIL]    ${slug} — ${report.errors.length} errors remain:`)
      for (const e of report.errors) console.error(`  ${e.kind}: ${e.message} @ ${e.path}`)
      stillFailing.push(slug)
    }
    touched++
  }

  console.log(`\n[done] dropped=${dropped} touched=${touched} stillFailing=${stillFailing.length}`)
  if (stillFailing.length > 0) {
    console.log('Still failing:')
    for (const s of stillFailing) console.log(`  - ${s}`)
  }
}

main()
