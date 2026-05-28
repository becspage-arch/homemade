/**
 * In-place rewrites for voice-retrofit batch 2026-05-28-batch6.
 *
 * Each rewrite targets a single body block by index. Plain-text rewrites
 * replace the inner content of the paragraph with one text node so the
 * structure stays clean. The lasagne-alla-bolognese rewrite also drops the
 * year-bearing pullQuote at index 33; its substance is already in
 * sourceNotes.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const DIR = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch6')

type Rewrite =
  | { kind: 'paragraph'; index: number; text: string }
  | { kind: 'remove'; index: number }
  | { kind: 'troubleshooterCause'; index: number; itemIndex: number; cause: string }
  | { kind: 'paragraphTextOnly'; index: number; text: string }

function plainParagraph(text: string) {
  return {
    type: 'paragraph',
    content: [{ type: 'text', text }],
  }
}

function applyRewrites(slug: string, rewrites: Rewrite[]): void {
  const file = resolve(DIR, `${slug}.json`)
  const data = JSON.parse(readFileSync(file, 'utf8'))
  const body = data.body
  if (!body || !Array.isArray(body.content)) {
    throw new Error(`${slug}: body.content not an array`)
  }
  // Process in descending index order for removes so indices stay valid.
  const sorted = rewrites.slice().sort((a, b) => {
    if (a.kind === 'remove' && b.kind === 'remove') return b.index - a.index
    if (a.kind === 'remove') return 1
    if (b.kind === 'remove') return -1
    return 0
  })
  for (const r of sorted) {
    if (r.kind === 'paragraph' || r.kind === 'paragraphTextOnly') {
      const existing = body.content[r.index]
      if (!existing) throw new Error(`${slug}: no block at index ${r.index}`)
      if (existing.type !== 'paragraph') {
        throw new Error(`${slug}: block at ${r.index} is ${existing.type}, expected paragraph`)
      }
      body.content[r.index] = plainParagraph(r.text)
    } else if (r.kind === 'remove') {
      body.content.splice(r.index, 1)
    } else if (r.kind === 'troubleshooterCause') {
      const block = body.content[r.index]
      if (!block || block.type !== 'troubleshooter') {
        throw new Error(`${slug}: block at ${r.index} not troubleshooter`)
      }
      const items = block.attrs?.items
      if (!Array.isArray(items) || !items[r.itemIndex]) {
        throw new Error(`${slug}: troubleshooter items missing at ${r.itemIndex}`)
      }
      items[r.itemIndex].cause = r.cause
    }
  }
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`[OK] ${slug}`)
}

// ---------- Rewrites ----------

applyRewrites('lamb-saag', [
  {
    kind: 'paragraph',
    index: 0,
    text:
      "Lamb saag has two long stages. The lamb gets browned and the onion base cooks down before the spinach goes in. Then the whole pan simmers for at least 75 minutes so the lamb turns tender. Don't rush either step. The browned lamb and the soft onion base are what give the finished dish its depth.",
  },
  {
    kind: 'paragraph',
    index: 1,
    text:
      'The spinach goes in raw or barely wilted. It then gets blended with the onion and spice base into a smooth green paste. That paste is the braising liquid. This is different from saag paneer, where the spinach is wilted on its own. Here the raw spinach blends into the base before the braise, so the sauce reads as one thing rather than two.',
  },
  {
    kind: 'paragraph',
    index: 11,
    text:
      'Lamb saag is a complete main course. The spinach brings iron and greenness. The lamb brings richness and protein. Together they have a weight that makes this one of the more filling dishes on the British Indian menu. It sits with rogan josh and dhansak as a slow lamb curry for diners who want substance. The dish improves overnight as the lamb keeps soaking up the spiced spinach sauce. That makes it a regular at curry nights and large gatherings, where it can be cooked the day before.',
  },
])

applyRewrites('lamb-tagine-prunes-almonds', [
  {
    kind: 'paragraph',
    index: 11,
    text:
      'Lamb tagine with prunes and almonds is one of the great Moroccan celebration dishes. In Morocco it is made for Eid al-Adha and for wedding feasts, cooked slowly in an earthenware tagine pot over charcoal. The sweet-savoury register is fully Moroccan. The pairing of meat, dried fruit, honey, and warm spice traces back to medieval Arab cooking. In Britain it is a steady dinner-party centrepiece that can be made ahead and reheated.',
  },
])

applyRewrites('lamb-tagine', [
  {
    kind: 'paragraph',
    index: 13,
    text:
      'The tagine is the defining cooking pot of Morocco and much of North Africa. The shape is a shallow earthenware base and a pointed lid. That cone collects steam and sends it back down to the base. The pot self-bastes over a long low cook without much liquid. The braising style of Moroccan tagines, meat, dried fruit, spice, a little sweetness, a little sourness, comes from medieval Arab-Andalusian cooking. The preserved lemon is a Moroccan flavour with no real match in European cooking.',
  },
])

applyRewrites('lamb-vindaloo', [
  {
    kind: 'paragraph',
    index: 11,
    text:
      'Vindaloo holds a specific spot in the British curry-house. It is the maximum-heat option, the test of seriousness, the dish ordered to prove a point at the table. That reputation hides its real shape. The Goan vindalho is a balanced, sour-warm-spiced dish, not just the hottest thing on the menu. The British version pushes the chilli so hard that the dish became a category of experience rather than a regional recipe. Both versions are worth knowing.',
  },
])

applyRewrites('lapin-a-la-moutarde', [
  {
    kind: 'paragraph',
    index: 13,
    text:
      'Rabbit with mustard is a Burgundian pairing. The region produces the Dijon mustard and the white wine that go into the sauce, and rabbit has been a farmhouse staple across rural France for centuries. The dish shows up in French home cookery from the nineteenth century on. It is a way of cooking an animal that is lean and quick to dry out. The mustard coats the meat during browning and gives a sharp, warming counterpoint to the cream. In France it is eaten year-round, served with boiled potatoes or egg noodles.',
  },
])

applyRewrites('lasagne-al-forno', [
  {
    kind: 'paragraph',
    index: 13,
    text:
      "Lasagne al forno is the baked pasta of Emilia-Romagna, and Bologna in particular. It is made there with green egg pasta coloured with spinach (sfoglia verde), a meaty ragu, and béchamel, and has been for at least three centuries. Marcella Hazan's version in Essentials of Classic Italian Cooking became the reference for English-speaking cooks from the 1990s on. Outside Italy, lasagne is now one of the most widely cooked Italian dishes, with countless home versions of varying faithfulness to the Bologna original.",
  },
])

// lasagne-alla-bolognese: also remove the year-bearing pullQuote at 33.
applyRewrites('lasagne-alla-bolognese', [
  {
    kind: 'paragraph',
    index: 29,
    text:
      'Assembled lasagne can wait covered in the fridge for up to twenty-four hours before going into the oven. Add ten minutes to the bake time if it goes in cold. Cooked lasagne freezes well in slices. Wrap in baking paper then foil, keep three months, and reheat from frozen in a 160°C oven for forty minutes with foil on top, then ten minutes uncovered.',
  },
  {
    kind: 'paragraph',
    index: 31,
    text:
      "Lasagne alla bolognese is the canonical dish of Emilia-Romagna. The region runs between Modena and Bologna and gave the world prosciutto di Parma, parmigiano-reggiano, and the bolognese ragù that sits at the centre of this lasagne. The earliest written record is in Pellegrino Artusi's nineteenth-century cookbook (see the Sources note below). His meat sauce for macaroni is the foundation for what later became the official Accademia ratio.",
  },
  {
    kind: 'paragraph',
    index: 32,
    text:
      "Artusi's version differs from the modern one in three ways. He uses veal where the modern recipe uses beef and pork. He includes dried mushrooms, which the modern recipe drops. And he finishes with cream rather than milk. The move to beef-and-pork and the milk finish settled in the early twentieth century. The Accademia Italiana della Cucina filed an official recipe later (see the Sources note for the deposit detail).",
  },
  { kind: 'remove', index: 33 },
])

applyRewrites('lechon-asado', [
  {
    kind: 'paragraph',
    index: 0,
    text:
      'Lechón asado is pork cooked the Cuban way. It marinates for a day in mojo criollo, a marinade built on garlic, sour orange, and cumin. Then it roasts slowly until the meat is pull-apart tender and the outside is deeply caramelised and crisp. The mojo is the key. It is both marinade and sauce. Pork without it is just roast pork.',
  },
  {
    kind: 'paragraph',
    index: 11,
    text:
      'Lechón asado is the centrepiece of the Cuban Christmas table. The whole pig is roasted overnight in a pit called a caja china, and eaten with moros y cristianos, yuca con mojo, and fried plantain. In the home kitchen version the shoulder replaces the whole pig and the oven replaces the pit, but the mojo and the principle stay the same. The citrus-garlic pairing is the signature of Cuban cooking and runs through dozens of dishes. Here it is at its strongest, since the pork has soaked it up over a day before the heat changes it.',
  },
])

applyRewrites('lecso', [
  {
    kind: 'troubleshooterCause',
    index: 9,
    itemIndex: 1,
    cause:
      'Cheap supermarket paprika tastes flat and sometimes bitter. Sweet Hungarian paprika is the right kind for this dish.',
  },
])

applyRewrites('tempered-dark-chocolate', [
  {
    kind: 'paragraph',
    index: 0,
    text:
      'Tempering chocolate means melting it, then cooling it through a set temperature curve so the cocoa butter sets in the stable Form V crystal. The result is chocolate that snaps cleanly, looks glossy, sets at room temperature, and does not bloom white over time. The tabling method works two-thirds of the melted chocolate on a cold marble surface to seed the Form V crystals. That cooled chocolate then goes back into the warm chocolate to raise the temperature into the working window.',
  },
  {
    kind: 'paragraph',
    index: 1,
    text:
      'Use couverture chocolate with at least 30% cocoa butter, not eating chocolate. The cocoa butter content is what controls the temper. A digital probe thermometer is essential. One degree between in-temper and out-of-temper matters.',
  },
])

applyRewrites('the-advisor-who-changes-everything-visualisation', [
  {
    kind: 'paragraph',
    index: 8,
    text:
      'Written for homemade.education. Forward-projection imagery shows up across therapy and coaching work. No single lineage is claimed.',
  },
])

applyRewrites('the-all-or-nothing-body-trap', [
  {
    kind: 'paragraph',
    index: 12,
    text:
      'Written for homemade.education. Draws on the public-domain literature on cognitive therapy and on the diet-culture writing that followed. See the Sources note below for the lineage.',
  },
])

applyRewrites('the-art-of-the-no', [
  {
    kind: 'paragraph',
    index: 10,
    text:
      'Draws on public-domain social psychology on saying no, returning favours, and group pressure. Framing is original to homemade.education.',
  },
])

applyRewrites('the-bedside-salt-bowl', [
  {
    kind: 'paragraph',
    index: 18,
    text:
      'Salt as a folk-protection object shows up across many cultural lineages. European hedge-witch traditions, Mediterranean evil-eye work, Japanese household practice (the small salt cones at the door of a shop), Appalachian folk magic, Hellenistic candle work. The seven-night bedside form used here is a general folk pattern. It draws on the candle-and-salt practice in hedge-witch craft. The bedtime framing is adapted from Day 12 of SLEEP: A 30-Day Tapping Intensive by Rebecca J Page, 2025.',
  },
])

applyRewrites('the-bill-bless', [
  {
    kind: 'paragraph',
    index: 17,
    text:
      'Salt as a folk-protection and folk-blessing object shows up across many cultural lineages. European hedge-witch traditions, Mediterranean household practice, Appalachian folk magic. Using salt and spoken intention before a money transaction is a standard folk-money pattern. The bill-specific use here is adapted from Day 7 of MONEY: A 12-Week Tapping Program by Rebecca J Page, 2025. That day focuses on inviting peace into the act of paying bills.',
  },
])

applyRewrites('the-body-as-home-visualisation', [
  {
    kind: 'paragraph',
    index: 10,
    text:
      'Written for homemade.education. The body-as-home frame draws on somatic therapy work and on the idea of embodied presence as distinct from body-as-object. The image of the walkthrough as a curiosity practice rather than an inspection practice is original to homemade.education.',
  },
])

applyRewrites('the-bodys-quiet-competence-happening-without-you', [
  {
    kind: 'paragraph',
    index: 9,
    text:
      'Written for homemade.education. A short visualisation for shifting sleep from a managed task to a trusted automatic process.',
  },
])

applyRewrites('the-both-and-wealth-embodiment', [
  {
    kind: 'paragraph',
    index: 0,
    text:
      'A short embodiment practice for the either-or belief. That belief is the sense that a wealthy life and your current ordinary life sit on two different tracks. The practice names both as belonging to the same abundant life. It uses a physical anchor so the naming is felt rather than just stated.',
  },
])

applyRewrites('the-calm-and-safe-money-reset', [
  {
    kind: 'paragraph',
    index: 18,
    text:
      "Run it on a different evening if Sunday isn't right. The 'close one week, open the next' framing works on any day. Pick the day that actually marks the gap between two weeks for you.",
  },
])

applyRewrites('the-complicated-grief-of-inheritance', [
  {
    kind: 'paragraph',
    index: 9,
    text:
      'Giving the inherited money a set period before making decisions about it shows up again and again in the public-domain writing on inheritance and grief. Not indefinitely, but a set window in which the money sits without needing action. That window gives both the grief and the guilt their own space. It usually produces clearer decisions at the end.',
  },
  {
    kind: 'paragraph',
    index: 11,
    text:
      'Written for homemade.education. Draws on public-domain writing on grief, inheritance, and money.',
  },
])

applyRewrites('the-cultural-pairing-of-money-sex-and-good-women-reading', [
  {
    kind: 'paragraph',
    index: 3,
    text:
      "Money and power have been coded male for most of recorded Western history. Women's access to property, wages, and financial independence has been legally restricted in most countries until fairly recently. In some cases that is living memory. The cultural residue of those restrictions does not disappear when the laws change. It stays in the social contract. The idea is that women who want financial power are making up for something, taking something, or must pay a cost somewhere else.",
  },
  {
    kind: 'paragraph',
    index: 12,
    text:
      "Written for homemade.education. Draws on feminist economic psychology, including Harriet Lerner's work on women and anger, Ann Fels' research on female ambition, and public-domain writing on gender and financial identity.",
  },
])

applyRewrites('the-dark-as-a-soft-blanket', [
  {
    kind: 'paragraph',
    index: 8,
    text:
      'Written for homemade.education. A companion visualisation for Day 12 of SLEEP: A 30-Day Tapping Intensive by Rebecca J Page, 2025.',
  },
])

applyRewrites('toffee-hard-crack', [
  {
    kind: 'paragraph',
    index: 1,
    text:
      'A heavy pan matters. The syrup will splutter as the water boils off, and a thin pan sends heat unevenly. The sugar thermometer is essential. Colour alone is unreliable, because demerara starts golden and goes mahogany at hard-crack.',
  },
])

applyRewrites('turkish-delight-rosewater', [
  {
    kind: 'paragraph',
    index: 0,
    text:
      'Turkish delight is a study in patience. A hot sugar syrup cooked to soft-ball is poured slowly into a cornflour-and-water slurry. The mixture is stirred over low heat for nearly an hour as the starch swells and turns translucent. The cooked paste is poured into a tin to set overnight, then cut and dusted in icing sugar and cornflour.',
  },
])
