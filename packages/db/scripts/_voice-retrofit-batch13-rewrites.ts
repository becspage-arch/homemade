/**
 * Batch 13 rewrites. For each (slug, op) pair, apply the rewrite in place
 * on the exported JSON file at docs/voice-retrofit-2026-05-28-batch13/<slug>.json.
 *
 * Operations:
 *   - { kind: 'remove-heading-0' }
 *       Drops body.content[0]. Used to remove "Before you start" safety
 *       headings whose following paragraph is a craft tip, not safety.
 *   - { kind: 'replace-paragraph', idx, text }
 *       Replaces body.content[idx].content with [{ type: 'text', text }].
 *   - { kind: 'replace-list-item-paragraph', listIdx, itemIdx, paraIdx, text }
 *       Replaces body.content[listIdx].content[itemIdx].content[paraIdx].content
 *       with a single text node.
 *   - { kind: 'replace-troubleshooter', tsIdx, itemIdx, field, text }
 *       Replaces body.content[tsIdx].attrs.items[itemIdx][field] (string).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BATCH_DIR = resolve(__dirname, '../../..', 'docs/voice-retrofit-2026-05-28-batch13')

type Op =
  | { kind: 'remove-heading-0' }
  | { kind: 'replace-paragraph'; idx: number; text: string }
  | { kind: 'replace-list-item-paragraph'; listIdx: number; itemIdx: number; paraIdx: number; text: string }
  | { kind: 'replace-troubleshooter'; tsIdx: number; itemIdx: number; field: 'symptom' | 'cause' | 'fix'; text: string }

const REWRITES: Record<string, Op[]> = {
  'pierogi-z-miesem': [
    {
      kind: 'replace-paragraph',
      idx: 2,
      text: "These are a Christmas Eve dish across Poland, served at the twelve-course Wigilia supper. The Wigilia meal traditionally excludes meat, but pierogi z mięsem are so woven into the tradition that they appear regardless of the filling.",
    },
    {
      kind: 'replace-paragraph',
      idx: 18,
      text: "Meat pierogi are the Christmas pierogi of Poland, served at the Wigilia table on Christmas Eve alongside barszcz and carp. They are also everyday food. Sunday batches get reheated in butter through the week. The porcini in the filling reflects a long Polish tradition of foraging mushrooms in autumn. Dried porcini turn up in many Polish dishes as a flavour base. In Poland the cook would use suszone grzyby, the dried local mushrooms gathered through the year.",
    },
  ],
  'pilaf-rice': [
    {
      kind: 'replace-paragraph',
      idx: 11,
      text: "The pilaf method (toasting grains in fat, then cooking in a measured amount of liquid) started in Persia and the Ottoman Empire. From there it spread to India as pulao and biryani, to Central Asia as plov, and across the Middle East into Southern Europe. Turkish pilav, Persian chelo, Indian pulao, and Spanish paella are all forms of the same technique. Fat coats the grain. The stock carries the flavour. The closed pan traps steam that cooks the grains from above. Boiling and draining is simpler, but the result is different.",
    },
  ],
  'pilau-rice': [
    {
      kind: 'replace-paragraph',
      idx: 11,
      text: "Pilau rice is the curry-house table companion to every main dish. It sits in a different register from plain boiled basmati. The whole spices and ghee give it a fragrance that makes it worth eating alongside a curry, not just under one. The yellow colour comes from turmeric and signals the spiced cooking before you taste. In Pakistan and North India, pilau can be a dish in its own right, cooked with meat and stock. The British curry-house version is the simpler form.",
    },
  ],
  'pimientos-de-padron': [
    {
      kind: 'replace-troubleshooter',
      tsIdx: 6,
      itemIdx: 0,
      field: 'fix',
      text: "Dry the peppers thoroughly. Get the pan fully hot before adding the oil. Work in a single layer; overcrowding drops the temperature.",
    },
  ],
  'pinchitos-morunos': [
    {
      kind: 'replace-paragraph',
      idx: 11,
      text: "Pinchitos morunos are sold from zinc counters at roadside stalls and fairground bars across Andalusia. You find them in Jerez, in Cádiz, and in the pueblos blancos of the Sierra de Cádiz. They are eaten standing up, quickly, often with a cold beer or a glass of manzanilla sherry. The food history is unusual. The spice mix comes straight from medieval Moorish cooking. The meat, pork, is the most un-Moorish of all, used as a deliberate marker of Christian identity after the Reconquista. Food history written in a plate of skewers.",
    },
  ],
  'pisto-manchego': [
    {
      kind: 'replace-paragraph',
      idx: 9,
      text: "Pisto comes from La Mancha in central Spain, the flat dry plateau of Cervantes and Don Quixote. Summer vegetables grow well there, and the cooking is straightforward and generous with olive oil. The name probably comes from the Aragonese word for a mixture cooked together. Pisto is close kin to French ratatouille and Italian caponata. All three slow-cook summer vegetables in olive oil until they are fully transformed. In La Mancha, pisto with a fried egg is the classic weekday lunch. The egg breaks into the warm vegetables at the table.",
    },
  ],
  'pizza-napoletana': [
    {
      kind: 'replace-paragraph',
      idx: 0,
      text: "Neapolitan pizza is not defined by toppings. It is defined by the dough. Cold-fermented over 24 to 48 hours, made from high-protein flour, stretched by hand until it is almost see-through at the centre, and baked in under 90 seconds in a wood-fired oven at 480°C. A home oven at full heat needs 8 to 10 minutes. A pizza steel that gets ripping hot before the pizza goes on helps a lot.",
    },
    {
      kind: 'replace-paragraph',
      idx: 15,
      text: "Pizza from Naples is one of the most specific dishes in the world. There is a formal spec covering the flour type, the rise time, the oven temperature, and the diameter of the disc. The Associazione Verace Pizza Napoletana, founded in 1984, guards the definition. Whether that matters for a home cook is another question. But the cold fermentation and the screaming-hot oven do produce a meaningfully different pizza from the same-day, low-temperature approach. The difference shows up in the crust: open, slightly chewy, with a proper char.",
    },
  ],
  'plum-crumble': [
    {
      kind: 'replace-paragraph',
      idx: 14,
      text: "Plum crumble is a British seasonal dessert, tied to the short Victoria plum season in August and September. The Victoria plum was bred in Sussex in the mid-1800s. It became one of the most widely grown garden plums in Britain. Its mix of sweetness and tartness makes it well suited to cooking. The crumble, born as a wartime economy dish, remains its most common baked form.",
    },
  ],
  'polenta-con-ragu': [
    {
      kind: 'replace-paragraph',
      idx: 13,
      text: "Polenta was the staple grain of northern Italy from the 1500s onwards, after maize arrived from the Americas. It held that place until rice and pasta became affordable in the mid-1900s. For four centuries it was eaten twice a day in the Veneto, Lombardy, and Friuli. Usually plain. Sometimes with cheese. Sometimes with whatever meat the household could afford. Now it is eaten by choice, not necessity. That shift has turned it from a poverty food into something worth celebrating. The pairing with pork sausage and fennel seed reflects the flavours of those northern regions. This is not the polenta of southern Italy, which uses a finer grind and a wetter set. This is the coarse, substantial polenta of the north, served under a rich ragù.",
    },
    {
      kind: 'replace-troubleshooter',
      tsIdx: 11,
      itemIdx: 3,
      field: 'fix',
      text: "Have the ragù ready before finishing the polenta. Serve straight away. Add a splash of hot water if the polenta thickens while it waits.",
    },
  ],
  'polenta-morbida': [{ kind: 'remove-heading-0' }],
  'pollo-al-limone': [
    {
      kind: 'replace-paragraph',
      idx: 13,
      text: "Pollo al limone shows up across Italian regional cooking wherever lemons grow or arrive easily: Liguria, Campania, Sicily, and the coastal Veneto. The Ligurian version tends to be lighter. The Campanian version is more robust, sometimes including capers and olives. Both come from the same idea: braising poultry with citrus brightens a protein that can otherwise taste heavy after long cooking. The dish travels well. In the UK and US, home cooks tend to make it without fully knowing its Italian roots. That does not make it any less good.",
    },
  ],
  'pollo-alla-cacciatora': [{ kind: 'remove-heading-0' }],
  'pollo-alla-cacciatore': [
    {
      kind: 'replace-paragraph',
      idx: 11,
      text: "Cacciatore covers a dozen distinct Italian braises that share a common theme: hunter's food. Rustic, one-pot, built from preserved and foraged ingredients that hunters would carry or find. The central Italian version, with tomatoes, olives, capers, and anchovies, is the one most widely known outside Italy. It is the basis of many variations. This is a winter and autumn dish, the season when olives come in, tomatoes are preserved, and the flavours are deep enough to carry a braise.",
    },
  ],
  'pollo-alla-diavola': [
    {
      kind: 'replace-paragraph',
      idx: 15,
      text: "Pollo alla diavola is a staple of the Roman trattoria. It has been on fixed-price menus there for at least a century. The 19th-century cookery writer Pellegrino Artusi described it in 1891 as a bird pressed under a weight over coals, the original grill. He noted that the name comes from the red colour of the chilli and the fierce heat of the cooking. The technique is probably older than his recording of it. The dish needs almost nothing beyond a good bird and time to marinate. It is one of the most satisfying returns in Italian cooking for the effort involved.",
    },
  ],
  'pollo-alla-pizzaiola': [
    {
      kind: 'replace-paragraph',
      idx: 0,
      text: "Pizzaiola is a Neapolitan idea that takes the flavour of their most famous export and puts it on meat. Tomato, oregano, garlic, capers, and black olives: not a subtle mix, but that is not the point. The point is a deeply savoury, salty-and-acidic sauce that the chicken slowly absorbs as it braises. Meat and sauce become one.",
    },
    {
      kind: 'replace-paragraph',
      idx: 13,
      text: "Pizzaiola is inseparable from Naples and Campania. The name comes from the pizzaiolo, the pizza maker. The sauce uses the same flavour logic as Neapolitan pizza: ripe tomato, dried oregano, garlic, and olive oil in simple proportion, without elaboration. The preparation extends across southern Italy and into the diaspora. It turns up across Italian-American cooking as a quick weeknight meal. It is one of the reliably portable flavour ideas of southern Italian cooking. A set of relationships, acid, salt, herb, oil, that works across many proteins.",
    },
  ],
  'pollo-en-pepitoria': [
    {
      kind: 'replace-paragraph',
      idx: 13,
      text: "Pollo en pepitoria is a Castilian classic with a documented history reaching back 500 years. That makes it one of the oldest surviving Spanish recipes still cooked in much the same form. The almond and egg-yolk thickener reflects the Moorish influence on medieval Castilian cooking. Nut sauces (known in Arabic as sikbāj) were the standard way to enrich and thicken broths before northern European cream traditions reached Spain. The saffron ties the dish to the spice-trade economy of medieval Iberia. It is no longer everyday cooking. But it belongs on any serious Spanish table.",
    },
  ],
  'polpette-al-sugo': [{ kind: 'remove-heading-0' }],
  'pommes-dauphinoise': [{ kind: 'remove-heading-0' }],
  'pork-chops-with-cider-and-apples': [
    {
      kind: 'replace-paragraph',
      idx: 12,
      text: "Pork with cider and apples is the signature dish of the English West Country. Apple orchards and pig-keeping have lived side by side there for centuries. The cookery writer Jane Grigson wrote about the combination in her books on English food and on fruit, placing it firmly in the tradition of Somerset and Devon cooking. The same combination exists across the Channel in Normandy and Brittany. Pork, cider, and crème fraîche appear together there in dishes like côtes de porc Vallée d'Auge. The British version uses double cream rather than crème fraîche, but the flavour logic is the same.",
    },
  ],
  'pork-chops-with-mustard-cream-sauce': [
    {
      kind: 'replace-paragraph',
      idx: 12,
      text: "Pork with mustard and cream is one of those pan-sauce techniques that crossed the Channel and settled comfortably into British home cooking. The French original uses Dijon mustard with crème fraîche in Burgundy and Normandy. In France it is a restaurant and bistro dish. In Britain it became a quick weeknight dinner. Its popularity in the 1970s and 1980s, when British home cooks were taking up French pan-sauce technique, gave it a permanent place in the repertoire. The dish needs no special skill and rewards good ingredients: a proper Dijon, real cream, and thick pork chops.",
    },
  ],
  'pork-loin-mustard-cream': [
    {
      kind: 'replace-paragraph',
      idx: 12,
      text: "Pan-fried pork with a cream and mustard sauce is one of the most reliable weeknight French-derived dishes in British home cooking. It needs nothing that is not in a standard fridge and cupboard. It takes twenty minutes. The technique teaches the pan-sauce principle, which works equally well with chicken, veal, or fish. The Norman cooking tradition behind it was built on the region's dairy farming. Cream was cheap and plentiful, and it became the default finishing medium for almost everything cooked in butter.",
    },
  ],
  'posset-lemon': [
    {
      kind: 'replace-paragraph',
      idx: 15,
      text: "The posset has a long history in British cooking. It began as a hot milk drink curdled with wine or ale, taken medicinally from the medieval period onwards. The cold lemon posset, in which the acid sets the cream rather than curdling it, is a much more recent dish. It is linked to British restaurant cooking from the late 1900s. It became popular as a restaurant dessert because it could be made ahead, scaled easily, and produced a reliable result. The same basic technique shows up in older British cookery as a lemon cream, though the name was not used consistently.",
    },
  ],
  'pot-au-feu': [
    {
      kind: 'replace-paragraph',
      idx: 13,
      text: "Pot-au-feu was, for centuries, the meal that kept the French peasantry alive. A piece of cheap beef simmered with whatever vegetables grew in the kitchen garden, producing two courses from one pot. The 19th-century food writer Brillat-Savarin called it 'the basis of French cooking'. The dish has close relatives across Europe: the German Tafelspitz, the Italian bollito misto, the Polish rosół. All the same idea. Everything slow-cooked in water, nothing wasted.",
    },
  ],
  'pot-roast': [{ kind: 'remove-heading-0' }],
  'potted-shrimp': [
    {
      kind: 'replace-paragraph',
      idx: 12,
      text: "Potted shrimp is one of the oldest continuously made British dishes. The cookery writer Hannah Glasse documented it in 1747. It has appeared in British cookery books ever since. The Morecambe Bay version became the most famous. The tiny, sweet brown shrimp from the shallow bay on the Lancashire coast have been potted commercially since the 1800s. The small family firms that pot them by hand have made the dish a regional speciality with a reputation well beyond the area. The spiced butter and sweet shrimp work so well together that the combination has survived nearly three centuries almost unchanged.",
    },
  ],
  'poule-au-pot': [
    {
      kind: 'replace-paragraph',
      idx: 0,
      text: "Poule au pot is one of the simplest things you can make, and one of the most satisfying. A whole chicken, put into cold water, brought slowly to a gentle simmer, and coaxed for ninety minutes. The cooking liquid turns into a proper broth, and the chicken cooks through to tender. You get two courses from one pot. The broth comes first, with a few of the smaller vegetables. The chicken and the rest of the vegetables come after.",
    },
  ],
  'poulet-a-lestragon': [
    {
      kind: 'replace-paragraph',
      idx: 13,
      text: "Poulet à l'estragon sits at the lighter, more refined end of the French bistro chicken repertoire, alongside poulet à la crème and poulet rôti aux herbes. It is bistro cooking in the truest sense. The dish asks for good technique over a short time, rather than the long, slow work of a braise. Tarragon grows easily in France. It is a garden herb, not a special-occasion purchase. The chicken-and-tarragon pairing is so ingrained in French cooking that the great chef Escoffier takes it as given rather than a combination worth justifying.",
    },
  ],
  'poulet-basquaise': [
    {
      kind: 'replace-paragraph',
      idx: 0,
      text: "Poulet basquaise is a one-pot braise. Everything goes into the casserole in sequence, the lid goes on, and the chicken cooks in the fragrant steam of peppers, tomatoes, and wine. The key step is browning the chicken properly before the braising begins. The deep gold crust gives the sauce its body and colour.",
    },
  ],
  'poulet-chasseur': [
    {
      kind: 'replace-paragraph',
      idx: 13,
      text: "Poulet chasseur belongs to the poulet sauté family in the French kitchen. The tradition is to start a chicken in a hot pan and finish it in a sauce in the same pan. The great chef Escoffier lists it alongside dozens of variants (chasseur, à la crème, Vallée d'Auge, basquaise) as part of the sauté repertoire a French brigade would execute daily. In a modern bistro it is a midweek staple. At home it is the French equivalent of a tray bake: low effort, high return.",
    },
  ],
  'pressure-cooker-beef-stew': [
    {
      kind: 'replace-paragraph',
      idx: 18,
      text: "British home cooking has carried beef stew through every generation, usually as a low oven braise. The pressure cooker brings the long-simmered version within weeknight reach, without losing the depth that long cooking gives. The method is universal. Any tough beef cut, with any aromatic-and-wine combination, follows the same shape.",
    },
  ],
  'pressure-cooker-red-lentil-dhal': [
    {
      kind: 'replace-paragraph',
      idx: 1,
      text: "The pressure cooker is the right tool for this. Red lentils foam hard in an open pot. The steam pressure keeps the foam contained and turns the lentils to a smooth purée without constant skimming. Twelve minutes at high pressure is the limit. Longer than that and the lentils break down into a slurry rather than a purée with body.",
    },
  ],
  'pudding-and-souse': [
    {
      kind: 'replace-paragraph',
      idx: 11,
      text: "Pudding and souse is one of the most culturally specific dishes in the Caribbean. Deeply Barbadian. Not found elsewhere in the same form. The Saturday ritual of queuing for pudding and souse at a local shop is a Barbadian institution. The shops are small, family-run, often open from around 10 am until sold out, rarely past early afternoon. In Britain the Barbadian diaspora makes pudding and souse at home for Saturday lunch. The tradition has held for generations, as one of the strongest food connections to Barbados.",
    },
  ],
  'pulled-pork': [
    {
      kind: 'replace-paragraph',
      idx: 13,
      text: "Pulled pork is the product of the American barbecue tradition, and the Carolinas in particular. Whole-hog and pork-shoulder barbecue has been a cultural practice there for centuries. Slow-smoking whole pigs over wood fires was recorded in the American South from colonial times. The vinegar-based sauce of the Carolinas (as opposed to the tomato-and-sugar sauce of Kansas City) reflects a food tradition rooted in specific geography. The oven version loses the smoke but keeps everything else. The result, a pile of tender, flavour-soaked pork on a soft roll with coleslaw, is one of the most satisfying things the American kitchen produces.",
    },
    {
      kind: 'replace-troubleshooter',
      tsIdx: 11,
      itemIdx: 0,
      field: 'fix',
      text: "Return to the oven for another hour. The change from tough to tender can seem abrupt. The meat needs to reach 90°C internal and hold there long enough for the collagen to turn into gelatin.",
    },
  ],
  'pulpo-a-la-gallega': [
    {
      kind: 'replace-paragraph',
      idx: 11,
      text: "Pulpo a feira is named for the pulpeiras, the octopus women who have cooked the dish at Galician festivals and fairs for centuries. The dish travels from there to every restaurant in Spain. It is best eaten in Galicia. On a wooden plate. With a glass of Albariño. In a stone-walled pulpería on a rainy afternoon.",
    },
  ],
  'queen-of-puddings': [
    {
      kind: 'replace-paragraph',
      idx: 17,
      text: "Queen of Puddings is a Victorian invention, designed to stretch basic pantry ingredients into something that looked far more lavish. The breadcrumb custard used stale bread that might otherwise be wasted. The jam and meringue gave colour and contrast without expensive ingredients. It appears in British cookery writing from the 1860s onwards. It was a regular fixture in middle-class household cooking through the Edwardian period. The pudding survived the decline of British formal pudding culture mostly because its three-layer presentation still looks striking enough to justify the effort.",
    },
  ],
  'quick-poached-egg-garlic-spinach-bagel': [
    {
      kind: 'replace-list-item-paragraph',
      listIdx: 6,
      itemIdx: 2,
      paraIdx: 0,
      text: "Put a lid on the pan to let the leaves wilt. Take it off a couple of times to toss the leaves. This matters most with spinach rather than baby-leaf spinach.",
    },
    {
      kind: 'replace-list-item-paragraph',
      listIdx: 6,
      itemIdx: 5,
      paraIdx: 0,
      text: "Lower the ramekin gently into the boiling water and tip out the egg. As you lift the ramekin out, sweep it up and back over the egg. This helps the egg keep a tidy shape.",
    },
    {
      kind: 'replace-list-item-paragraph',
      listIdx: 6,
      itemIdx: 7,
      paraIdx: 0,
      text: "Once the spinach has wilted, which takes a few minutes, turn up the heat and fry for a couple of minutes. Baby leaves tend to release a lot of water. Squeeze them on the edge of the pan before serving.",
    },
  ],
  'quick-weeknight-lasagne': [
    {
      kind: 'replace-paragraph',
      idx: 23,
      text: "The weeknight lasagne is an Anglo-American adaptation, not a true Italian dish. It comes from mid-1900s household magazines that took the Bolognese model and shortened every step to fit a weekday kitchen. Passata stands in for stock and wine. An all-in-one béchamel replaces the roux-and-warm-milk method. Mozzarella appears between the layers, where the orthodox version has none. The Italian-American baked-ziti tradition crossed into the British weeknight version through the 1970s and 1980s. That is why mozzarella ends up here.",
    },
  ],
  'raspberry-fool': [
    {
      kind: 'replace-paragraph',
      idx: 14,
      text: "Raspberry fool sits within the same British tradition as gooseberry and strawberry fool. Fruit and cream in the simplest possible form. The raspberry version benefits from the sieving step, which the strawberry version can skip. The result is a cleaner texture and a more intense colour. Raspberry and cream has been a standard pairing in British summer cooking for centuries, in many forms: syllabubs, creams, and the more modern fool.",
    },
  ],
  'raspberry-jam': [
    {
      kind: 'replace-paragraph',
      idx: 19,
      text: "Raspberry jam is the easiest of the British summer preserves. High pectin, high acid, almost incapable of failing for a careful cook. The Victorian cookery writer Mrs Beeton called it the housewife's first jam. Spread it on hot buttered toast for breakfast, layer it into a Victoria sponge, spoon it over Greek yoghurt at lunch.",
    },
  ],
  'ratatouille': [
    {
      kind: 'replace-paragraph',
      idx: 0,
      text: "Ratatouille has a reputation for being simple. It is, but only if you cook each vegetable separately before combining them. If everything goes into the pan together, the courgettes give off liquid and the aubergines steam rather than fry. The result is a uniform, watery mush. Thirty extra minutes of cooking in batches is the difference between a good ratatouille and a mediocre one.",
    },
  ],
  'ravioli-di-ricotta-e-spinaci': [
    {
      kind: 'replace-paragraph',
      idx: 15,
      text: "Ricotta and spinach ravioli belongs to the broad family of magro (lean) fillings: pasta made without meat, eaten on fasting days in the Catholic calendar. It appears across northern and central Italy with small regional changes. Swiss chard instead of spinach in Liguria. Ricotta mixed with eggs in Rome. A more aggressively seasoned filling in the south. The sage butter sauce, burro e salvia, is the standard dressing for any delicate fresh pasta in Lombardy and Piedmont. The quality of the butter and the freshness of the sage are the only variables. It is one of the simplest and most effective sauces in Italian cooking.",
    },
  ],
  'raw-raspberry-brownie-truffle': [
    {
      kind: 'replace-list-item-paragraph',
      listIdx: 5,
      itemIdx: 3,
      paraIdx: 0,
      text: "Put the chopped oat-nut mixture into the blender with the dates-agave paste. Blend to form a dough. Don't worry if it's a little wet. If it's too dry, add a bit more agave.",
    },
  ],
  'red-beans-and-rice': [{ kind: 'remove-heading-0' }],
}

function applyOp(data: any, op: Op): void {
  if (op.kind === 'remove-heading-0') {
    data.body.content.splice(0, 1)
    return
  }
  if (op.kind === 'replace-paragraph') {
    const para = data.body.content[op.idx]
    if (!para) throw new Error(`paragraph[${op.idx}] missing`)
    para.content = [{ type: 'text', text: op.text }]
    return
  }
  if (op.kind === 'replace-list-item-paragraph') {
    const list = data.body.content[op.listIdx]
    if (!list || !Array.isArray(list.content)) throw new Error(`list[${op.listIdx}] missing`)
    const li = list.content[op.itemIdx]
    if (!li || !Array.isArray(li.content)) throw new Error(`listItem[${op.itemIdx}] missing`)
    const para = li.content[op.paraIdx]
    if (!para) throw new Error(`paragraph[${op.paraIdx}] in listItem missing`)
    para.content = [{ type: 'text', text: op.text }]
    return
  }
  if (op.kind === 'replace-troubleshooter') {
    const ts = data.body.content[op.tsIdx]
    if (!ts || ts.type !== 'troubleshooter') throw new Error(`troubleshooter[${op.tsIdx}] missing`)
    const items = ts.attrs?.items
    if (!Array.isArray(items)) throw new Error(`troubleshooter[${op.tsIdx}].attrs.items missing`)
    const item = items[op.itemIdx]
    if (!item) throw new Error(`troubleshooter item[${op.itemIdx}] missing`)
    item[op.field] = op.text
    return
  }
}

function main(): void {
  let ok = 0
  let fail = 0
  for (const [slug, ops] of Object.entries(REWRITES)) {
    const filePath = resolve(BATCH_DIR, `${slug}.json`)
    let data: any
    try {
      data = JSON.parse(readFileSync(filePath, 'utf8'))
    } catch (e) {
      console.error(`[FAIL] ${slug}: read/parse error: ${(e as Error).message}`)
      fail++
      continue
    }
    try {
      for (const op of ops) applyOp(data, op)
    } catch (e) {
      console.error(`[FAIL] ${slug}: ${(e as Error).message}`)
      fail++
      continue
    }
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`[OK]   ${slug} (${ops.length} op${ops.length === 1 ? '' : 's'})`)
    ok++
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`)
}

main()
