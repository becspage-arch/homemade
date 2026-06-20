import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const BRIEF_DIR = join(process.cwd(), '../../docs/bulk-batch-046-briefs')

function readBrief(name: string) {
  return JSON.parse(readFileSync(join(BRIEF_DIR, name), 'utf8'))
}

function writeBrief(name: string, data: unknown) {
  writeFileSync(join(BRIEF_DIR, name), JSON.stringify(data, null, 2))
  console.log(`[fixed] ${name}`)
}

function makeTextNode(text: string, marks?: unknown[]) {
  const node: Record<string, unknown> = { type: 'text', text }
  if (marks && marks.length) node.marks = marks
  return node
}

function makeGlossaryMark(termSlug: string) {
  return { type: 'glossaryTooltip', attrs: { termSlug } }
}

// ── 01 boeuf-bourguignon: remove "genuinely" ─────────────────────────────────
{
  const d = readBrief('01-boeuf-bourguignon.json')
  const para = d.body.content[0] // first paragraph
  para.content[0].text = para.content[0].text.replace(
    'one of the few dishes that genuinely tastes better made the day before',
    'one of the few dishes that tastes better made the day before'
  )
  writeBrief('01-boeuf-bourguignon.json', d)
}

// ── 02 coq-au-vin: remove "genuinely" from excerpt, remove flambeing gloss, fix stove→hob ──
{
  const d = readBrief('02-coq-au-vin.json')
  d.excerpt = d.excerpt.replace('and genuinely improves if left overnight', 'and improves if left overnight')
  d.glossaryTerms = d.glossaryTerms.filter((t: { slug: string }) => t.slug !== 'flambeing')
  // Fix "stove" → "hob" in body
  function fixStoveInNode(node: Record<string, unknown>): Record<string, unknown> {
    if (node.type === 'text' && typeof node.text === 'string') {
      node.text = (node.text as string).replace(/\bstove\b/gi, 'hob')
    }
    if (Array.isArray(node.content)) {
      node.content = (node.content as Record<string, unknown>[]).map(fixStoveInNode)
    }
    return node
  }
  d.body = fixStoveInNode(d.body)
  writeBrief('02-coq-au-vin.json', d)
}

// ── 03 pot-au-feu: remove bouquet-garni from glossaryTerms ────────────────────
{
  const d = readBrief('03-pot-au-feu.json')
  d.glossaryTerms = d.glossaryTerms.filter((t: { slug: string }) => t.slug !== 'bouquet-garni')
  writeBrief('03-pot-au-feu.json', d)
}

// ── 04 poulet-roti: grade-level rewrite para[13] ──────────────────────────────
{
  const d = readBrief('04-poulet-roti.json')
  const node = d.body.content[13]
  node.content = [makeTextNode(
    'The French roast chicken is deeply embedded in daily cooking. Rôtisserie shops selling only poulet rôti appear in most French market towns and city neighbourhoods. The stall with turning chickens and a tray of potatoes basting below in the dripping is a fixture of French street markets. The phrase "il tourne comme un poulet" (he spins like a chicken) has passed into everyday speech. The Bresse chicken (poulet de Bresse) holds an AOC designation and is considered the finest table bird in France. It is distinguished by white feathers, blue feet, and a red crest, and is raised to strict standards in the Ain department.'
  )]
  writeBrief('04-poulet-roti.json', d)
}

// ── 06 poulet-a-la-moutarde: grade-level rewrite para[12] ────────────────────
{
  const d = readBrief('06-poulet-a-la-moutarde.json')
  const node = d.body.content[12]
  node.content = [makeTextNode(
    'Dijon has been the centre of French mustard production since at least the 14th century, when the city gained the right to regulate the trade. Chicken with Dijon mustard and cream is a dish from Burgundy. The region is known for its straightforward, well-made food, and this dish fits that tradition well. It has appeared on bistro menus across France for generations. Outside France it gained a following partly through the recipes of Elizabeth David, who described Burgundian cooking in her 1960 book French Provincial Cooking.'
  )]
  writeBrief('06-poulet-a-la-moutarde.json', d)
}

// ── 10 cassoulet: grade-level rewrite para[1] ────────────────────────────────
{
  const d = readBrief('10-cassoulet.json')
  const node = d.body.content[1]
  node.content = [makeTextNode(
    'This version uses duck confit legs, smoked pork sausages, and bacon. All three are easy to find, and the dish is rich and deeply flavoured without needing to track down specialist Languedoc meats.'
  )]
  writeBrief('10-cassoulet.json', d)
}

// ── 12 blanquette-de-veau: grade-level rewrite para[10] ──────────────────────
{
  const d = readBrief('12-blanquette-de-veau.json')
  const node = d.body.content[10]
  node.content = [makeTextNode(
    'Blanquette de veau belongs to a group of French dishes where the meat is never browned. A braise develops colour and intensity; the blanquette aims for the opposite. The sauce is creamy and pale, the meat tender but not falling apart, and the flavour comes entirely from the slow poaching and the enriched stock. It is demanding cooking: nothing is hidden by caramelisation or strong seasoning. The dish first appeared in French cookery writing in the 18th century and has been a fixture of domestic cooking ever since.'
  )]
  writeBrief('12-blanquette-de-veau.json', d)
}

// ── 13 navarin-d-agneau: grade rewrites para[0] and para[10] ─────────────────
{
  const d = readBrief('13-navarin-d-agneau.json')
  // para[0] = intro
  const para0 = d.body.content[0]
  para0.content = [makeTextNode(
    'Navarin d\'agneau printanier is a spring dish: the first lamb of the year, braised gently with the season\'s earliest vegetables. The lamb is always shoulder, which has the flavour and fat content for braising. The vegetables go in at different stages so each one finishes correctly: the harder roots first, the peas and beans only in the final few minutes.'
  )]
  // para[10] = where this dish lives
  const para10 = d.body.content[10]
  para10.content = [makeTextNode(
    'Navarin d\'agneau has no specific regional home. It is a classical dish of French cooking, appearing on menus from Paris to Lyon and in kitchens across the country. The spring version (the printanier) is tied to the season: it uses new-season lamb and the first vegetables of the year. The word navarin is thought to come either from navet (turnip) or from the Battle of Navarino in 1827. The spring version became established in French cooking in the 19th century and has remained on bistro menus ever since.'
  )]
  writeBrief('13-navarin-d-agneau.json', d)
}

// ── 14 gigot-d-agneau: grade-level rewrite para[14] ─────────────────────────
{
  const d = readBrief('14-gigot-d-agneau.json')
  const node = d.body.content[14]
  node.content = [makeTextNode(
    'Roast lamb is the Easter dish of France. It is as closely tied to the spring festival in France as it is to the British Sunday lunch. The lamb from the salt-meadow pastures of the Vendée, Brittany, and Normandy (agneau de pré-salé) is especially prized. The animals graze on salt-marsh grasses, which give the meat a natural seasoning and a particular flavour. French lamb is typically sold younger than British lamb. A leg of one to two years produces a leaner, more delicate result than the older animals more common in Britain.'
  )]
  writeBrief('14-gigot-d-agneau.json', d)
}

// ── 16 sole-meuniere: grade-level rewrite para[10] ───────────────────────────
{
  const d = readBrief('16-sole-meuniere.json')
  const node = d.body.content[10]
  node.content = [makeTextNode(
    'Sole meunière is one of the most recognised French fish dishes. It appears on brasserie and restaurant menus across the country. Julia Child wrote about her first taste of it at a restaurant in Rouen in 1948, describing it as a turning point in how she understood food. The dish established its hold on the French and later English-speaking repertoire partly through that account in her memoir My Life in France. Dover sole is caught in the English Channel and the Bay of Biscay and has been a feature of French coastal cooking for centuries.'
  )]
  writeBrief('16-sole-meuniere.json', d)
}

// ── 18 bouillabaisse: grade rewrite para[0], fix "at the end of the day", add saffron tooltip ──
{
  const d = readBrief('18-bouillabaisse.json')

  // para[0] - grade-level rewrite
  const para0 = d.body.content[0]
  // Need to handle the saffron term here with a glossaryTooltip mark
  para0.content = [
    makeTextNode('Bouillabaisse is defined by its broth: a '),
    makeTextNode('saffron', [makeGlossaryMark('saffron')]),
    makeTextNode('-scented tomato and fish stock brought to a violent boil. The name means \'boil-lower\'. The rapid boiling emulsifies the olive oil into the liquid, giving the finished soup its thick, rust-coloured character. The fish is cooked in the broth in the final few minutes and served in two stages: broth first, fish second, with croutons spread with rouille.'),
  ]

  // para[13] - replace "at the end of the day"
  const para13 = d.body.content[13]
  para13.content[0].text = para13.content[0].text.replace(
    'a way to use the bony, unsellable fish left at the end of the day',
    'a way to use the bony, unsellable fish left at the end of each day'
  )

  writeBrief('18-bouillabaisse.json', d)
}

// ── 19 brandade-de-morue: grade-level rewrite para[12] ───────────────────────
{
  const d = readBrief('19-brandade-de-morue.json')
  const node = d.body.content[12]
  node.content = [makeTextNode(
    'Brandade de morue is the principal dish of Nîmes, the Roman city in the Languedoc. Salt cod reached the Mediterranean coast from the northern European fishing trade in the Middle Ages. It quickly became a staple ingredient in southern France, Spain, Portugal, and Italy. The Nîmes version uses only cod, olive oil, and garlic, without potato. The Provençal version and most modern adaptations include potato, which lightens the texture and stretches the expensive fish further. The dish is closely associated with the Lenten calendar, when no meat was eaten, and is still served on Good Friday across southern France.'
  )]
  writeBrief('19-brandade-de-morue.json', d)
}

// ── 20 coquilles-saint-jacques: grade-level rewrite para[1] ──────────────────
{
  const d = readBrief('20-coquilles-saint-jacques.json')
  const node = d.body.content[1]
  node.content = [makeTextNode(
    'Ask your fishmonger to open the scallops and give you the deep half-shells, or serve in individual shallow gratin dishes if shells are not available.'
  )]
  writeBrief('20-coquilles-saint-jacques.json', d)
}

// ── 22 vichyssoise: remove chiffonade from glossaryTerms ────────────────────
{
  const d = readBrief('22-vichyssoise.json')
  d.glossaryTerms = d.glossaryTerms.filter((t: { slug: string }) => t.slug !== 'chiffonade')
  writeBrief('22-vichyssoise.json', d)
}

// ── 23 soupe-au-pistou: grade-level rewrite para[10] ────────────────────────
{
  const d = readBrief('23-soupe-au-pistou.json')
  const node = d.body.content[10]
  node.content = [makeTextNode(
    'Soupe au pistou is the summer soup of the Mediterranean coast of France, from Nice westward to Marseille. Elizabeth David noted that it is nearly identical to the Genovese minestrone al pesto across the Italian border. Both dishes share the same principle: a thick vegetable and bean soup finished with a raw basil paste. The difference is that pistou contains no pine nuts. The soup is documented in Provençal cooking from at least the 19th century, when the name appears in regional recipe collections from the Var and the Alpes-Maritimes. It is still most commonly made in summer, when fresh borlotti beans are in season.'
  )]
  writeBrief('23-soupe-au-pistou.json', d)
}

// ── 25 ratatouille: grade rewrites para[0] and para[11], remove degorging gloss ──
{
  const d = readBrief('25-ratatouille.json')
  // para[0] - intro
  const para0 = d.body.content[0]
  para0.content = [makeTextNode(
    'The secret of a good ratatouille is cooking each vegetable separately before combining them. If all the vegetables go into the pot at once, they steam rather than fry, release their water at the same time, and produce a bland stew. When each is fried in olive oil until it has some colour and concentrated slightly, the finished dish has distinct vegetables and a full, round flavour.'
  )]
  // para[11] - where this dish lives
  const para11 = d.body.content[11]
  para11.content = [makeTextNode(
    'Ratatouille is from Nice and the surrounding Côte d\'Azur. The aubergines, tomatoes, courgettes, and peppers in the dish all arrived in France from the Americas via Mediterranean trade routes and flourished in the southern climate. The dish appears in French cookery writing from the early 20th century, though similar preparations existed in Provence earlier under different names. It became well known outside France partly through the recipes of Elizabeth David and later through Julia Child.'
  )]
  // Remove degorging from glossaryTerms
  d.glossaryTerms = d.glossaryTerms.filter((t: { slug: string }) => t.slug !== 'degorging')
  writeBrief('25-ratatouille.json', d)
}

// ── 26 petits-pois-a-la-francaise: grade-level rewrite para[7] ───────────────
{
  const d = readBrief('26-petits-pois-a-la-francaise.json')
  const node = d.body.content[7]
  node.content = [makeTextNode(
    'Petits pois à la française is a dish of the Paris vegetable garden tradition. The finest early peas came from Clamart and Saint-Germain-en-Laye, the market gardens that supplied Les Halles. The technique of braising peas with lettuce and butter, rather than simply boiling them, is a specific French approach. The method appears in French cookery writing from the 17th century onwards and has remained largely unchanged. The dish is at its best with very fresh or very young frozen peas; older peas need more sugar and longer cooking to work.'
  )]
  writeBrief('26-petits-pois-a-la-francaise.json', d)
}

console.log('\nAll voice fixes applied.')
